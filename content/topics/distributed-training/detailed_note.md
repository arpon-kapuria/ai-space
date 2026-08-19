# Distributed Training

## Motivation

A single GPU has a hard memory ceiling — 80GB on an H100. A 70-billion-parameter model, just to hold its parameters in a memory-efficient format, needs roughly 140GB — before counting gradients, optimizer state, or activations. It simply does not fit on one GPU. And even a model that *would* fit can take months to train alone — too slow to iterate on.

Distributed training splits the job across many GPUs. But "split it up" isn't one technique — there are genuinely different things that can be split (the data, the layers, the weights themselves, even the sequence being processed), and each choice trades off differently against how much the GPUs have to talk to each other, which ties directly back to the interconnects from [Hardware for AI](/topic/hardware-for-ai).

Broadly, these strategies fall into two families. **Data parallelism** splits the *data* — every GPU keeps a full copy of the model. **Model parallelism** splits the *model itself* across GPUs, because the model doesn't fit on one GPU no matter how the data is split. Tensor parallelism and pipeline parallelism, both covered below, are the two main forms model parallelism takes — they answer the same question ("how do I split a model too big for one GPU?") in two different ways: slicing inside a layer versus slicing across layers.

## 1. Data Parallelism — the Simple Case

**The idea:** every GPU holds a full, identical copy of the model. A training batch gets split into chunks, one per GPU.

**Concrete example:** training on 8 GPUs with a batch size of 512. Each GPU gets 64 examples, runs its own forward and backward pass, and produces its own gradients — computed on different data, so each GPU's gradients are slightly different.

Those gradients have to be combined before anyone updates their weights, or the 8 copies of the model would drift apart over time. This combining step is called an **all-reduce**: every GPU's gradients get summed (or averaged) together, and the result is sent back to all 8 GPUs, so every copy applies the exact same update.

**Tech stack:** PyTorch's `DistributedDataParallel` (DDP) is the standard way to do this. Under the hood, the actual gradient-summing communication runs through **NCCL** (NVIDIA Collective Communications Library) — the low-level library that implements all-reduce efficiently across GPUs, whether they're connected by NVLink within a machine or InfiniBand between machines. Horovod (originally from Uber) is an older, framework-agnostic alternative that does the same job.

**The limit:** every GPU needs to hold the *entire* model. If the model doesn't fit on one GPU, data parallelism alone can't help — no matter how many GPUs are added.

## 2. Tensor Parallelism — Splitting a Single Layer

**The idea:** instead of copying the whole model onto every GPU, split individual weight matrices *inside* a layer across GPUs.

**Concrete example:** a feed-forward layer with a 4096 × 16384 weight matrix. Split column-wise across 4 GPUs, each GPU holds a 4096 × 4096 slice and computes only its slice of the output. The four partial outputs then need to be combined (another all-reduce) before the result can move to the next layer.

This means GPUs must exchange partial results *inside every single layer, on every forward and backward pass* — far more communication, far more often, than data parallelism's once-per-step all-reduce. That's why tensor parallelism is almost always kept **within one machine**, over NVLink, and rarely stretched across machines over slower networking.

**Tech stack:** **Megatron-LM** (NVIDIA) is the reference implementation, and its tensor-parallel approach is what most large-model training frameworks (including DeepSpeed) build on or borrow from.

## 3. Pipeline Parallelism — Splitting Across Layers

**The idea:** instead of splitting inside a layer, split the model's layers into groups (**stages**), and give each stage to a different GPU. Data flows through the stages in order, like an assembly line.

**Concrete example:** a 32-layer model on 4 GPUs — GPU 1 holds layers 1–8, GPU 2 holds layers 9–16, and so on. A batch enters at GPU 1, its output feeds into GPU 2, and so forth.

**The naive problem:** GPU 2 can't do anything until GPU 1 finishes layers 1–8 for that batch. Run this literally and 3 of the 4 GPUs sit idle most of the time, waiting — called a **pipeline bubble**.

**The fix:** split each batch into smaller **micro-batches**, and feed them through staggered. While GPU 1 is working on micro-batch 2, GPU 2 is already working on micro-batch 1 — the assembly line stays full instead of processing one item start-to-finish before starting the next. Some bubble time remains at the very start and end of each batch, but far less than the naive version.

Pipeline parallelism communicates far less often than tensor parallelism — only at the handoff between stages, not inside every layer — which makes it tolerant of slower, cross-machine networking. This is why pipeline parallelism is typically used **across machines**, while tensor parallelism is used **within** one.

**Tech stack:** **GPipe** (Google) introduced the micro-batching idea; **PipeDream** (Microsoft) refined the scheduling; Megatron-LM and DeepSpeed both ship production pipeline-parallel implementations using a schedule called **1F1B** (one-forward-one-backward), which keeps memory usage lower than GPipe's original schedule.

## 4. Sequence Parallelism — Splitting Long Inputs

**The idea:** even after splitting the model across GPUs with the strategies above, one more thing can still run out of memory: **activations** — the intermediate values saved during the forward pass for use in the backward pass. For long sequences (think 32K+ tokens), activation memory can rival the memory used by the parameters themselves.

**Concrete example:** an 8192-token sequence split into 4 chunks of 2048 tokens, one chunk per GPU, so no single GPU has to hold activations for the full sequence at once.

This is usually combined with tensor parallelism rather than used alone — tensor parallelism spreads out *weight* memory, sequence parallelism spreads out *activation* memory, and together they cover the two things that dominate memory usage for very large models with long inputs.

**Tech stack:** Megatron-LM's sequence-parallel implementation is the standard reference.

## 5. Context Parallelism — Splitting the Attention Computation Itself

Sequence parallelism (above) spreads out *activation memory* for a tensor-parallel region — a memory optimization. **Context parallelism** is a related but distinct, newer idea: it splits the actual **attention computation** across GPUs along the sequence dimension, specifically to make training on very long sequences (100K+ tokens) feasible at all. At that length, attention's memory and compute cost per GPU becomes the bottleneck on its own, independent of the activation-memory problem sequence parallelism addresses.

**Concrete example:** a 128,000-token sequence split into 8 chunks of 16,000 tokens across 8 GPUs, using **Ring Attention**. Each GPU computes attention for its own chunk locally, while the K/V blocks needed from every other chunk are passed around the GPUs in a ring, one hop at a time. Crucially, that communication is overlapped with compute — each GPU keeps computing on the K/V block it currently has while the next one is already being sent to it — so the extra communication cost is mostly hidden rather than adding pure overhead.

**Tech stack:** The technique described above is **Ring Attention** (Liu, Zaharia & Abbeel). Apart from that, **DeepSpeed Ulysses** (Microsoft) takes a different approach to the same problem — an all-to-all communication step that splits by attention heads rather than ring-passing K/V blocks — with different trade-offs depending on the number of attention heads versus sequence length. Context parallelism (in one form or the other) is what long-context training runs — including reported large-scale runs like Llama 3's 405B model — rely on to train on context lengths far beyond what fits using tensor and sequence parallelism alone.

## 6. ZeRO / Fully Sharded Data Parallel (FSDP) — Removing Data Parallelism's Waste

**The problem with plain data parallelism:** every GPU holds a full, redundant copy of not just the parameters, but the gradients and — usually the biggest of the three — the optimizer state. Adam, the standard optimizer, keeps two extra numbers (momentum and variance) per parameter. For a 7-billion-parameter model in mixed precision, that's roughly:

<details>
<summary>Math: Memory per GPU, plain data parallelism vs. ZeRO stages</summary>

For Ψ parameters, trained in mixed precision with Adam:

- Parameters (fp16): 2Ψ bytes
- Gradients (fp16): 2Ψ bytes
- Optimizer state (fp32 momentum + fp32 variance + fp32 master copy of params, Adam): 12Ψ bytes
- **Total per GPU, plain data parallelism: 16Ψ bytes — and every GPU holds all of it, fully redundant.**

For Ψ = 7 billion, that's roughly 112GB — already more than a single 80GB GPU, before any activations.

**ZeRO** (Zero Redundancy Optimizer, from Microsoft's DeepSpeed) shards this redundant state across *N* GPUs instead of duplicating it on each one:

- **Stage 1** shards the optimizer state (the largest 12Ψ chunk) across GPUs.
- **Stage 2** additionally shards the gradients.
- **Stage 3** additionally shards the parameters themselves — no GPU ever holds the full model; each layer's weights get fetched from other GPUs on demand, used, then released.

With Stage 3 across *N* GPUs, per-GPU memory drops roughly toward 16Ψ/N bytes instead of 16Ψ — the same 7B model that needed 112GB on one GPU can be split across, say, 8 GPUs at roughly 14GB each, comfortably fitting.

</details>

**Tech stack:** **DeepSpeed** (Microsoft) is the library that implements ZeRO. **FSDP** is PyTorch's own native implementation of essentially the same idea (full sharding, equivalent to ZeRO Stage 3), built directly into PyTorch rather than needing an external library — it's become the default choice for teams already on native PyTorch.

## 7. Expert Parallelism — Splitting by Which Expert

[Mixture of Experts](/topic/mixture-of-experts) (MoE) models replace a single feed-forward block with many smaller "expert" feed-forward blocks, routing each token to only a handful of them (commonly 2 out of 8) rather than running every token through every expert. This makes the total parameter count enormous while keeping the compute per token modest — but it creates a new distribution problem none of the strategies above solve: the experts themselves are too numerous and too large to fit on one GPU, and *which* expert a given token needs isn't known until the model is already running.

**Expert parallelism** is the systems answer: different experts live on different GPUs, and tokens get routed via an **all-to-all** communication step — each token is sent to whichever GPU holds the expert it was routed to, processed there, and the result is sent back.

**Concrete example:** an 8-expert MoE model with top-2 routing, one expert per GPU across 8 GPUs. For a given token, the routing decision picks 2 of the 8 experts; the token's representation is sent to those 2 GPUs, each computes its expert's output, and the two results are combined and routed back to wherever the token continues.

**Where this note's job ends:** expert parallelism, as covered here, is purely the GPU-splitting and communication mechanics — how experts get distributed across hardware and how tokens physically move between GPUs. *Which* expert a token gets routed to in the first place — the routing algorithm, load balancing across experts, auxiliary losses that keep experts from going unused — is a modeling decision, not a systems one, and is covered under Mixture of Experts instead.

**Tech stack:** **DeepSpeed-MoE** and **Tutel** (both Microsoft) are the standard libraries implementing expert-parallel training; Megatron-Core also ships its own expert-parallel implementation, commonly combined with the other strategies in this note for training large MoE models like Mixtral.

## 8. Putting It Together: Hybrid N-D Parallelism

Real large-model training runs almost never use just one of the strategies above — they combine several at once, historically called **3D parallelism** when it meant tensor + pipeline + data parallelism specifically. With context and expert parallelism now in the mix too, the more accurate general term is **hybrid N-D parallelism**: combining however many of these axes a given model actually needs, not always the same three.

A representative combination for a large, long-context MoE model might look like:

- **Tensor parallelism** *within* a machine (fast NVLink, needed for the frequent per-layer communication)
- **Pipeline parallelism** *across* machines (tolerant of slower networking, since it only communicates at stage boundaries)
- **Data parallelism** (often with ZeRO/FSDP sharding) *across* the resulting groups of machines, to scale up further and reduce redundant memory
- **Context parallelism**, layered in specifically when sequence lengths are long enough that attention itself becomes the bottleneck
- **Expert parallelism**, layered in specifically when the model is MoE-based

Which of these five actually get combined depends entirely on what's actually straining: a dense model with a short context window might only need the original three; a long-context MoE model might need all five at once.

**Tech stack:** **Megatron-DeepSpeed** (a combination of NVIDIA's Megatron-LM and Microsoft's DeepSpeed) remains the reference framework most large open LLM training runs are built on or inspired by, precisely because it implements every one of these dimensions rather than requiring each to be hand-integrated.

## Quick Reference: Which Strategy Solves Which Problem

| Strategy | Splits | Solves | Communication frequency |
|---|---|---|---|
| Data Parallelism | The batch | Training speed (more GPUs, more throughput) | Once per step (all-reduce) |
| **Model Parallelism** → Tensor Parallelism | Weights inside a layer | Model too big for one GPU | Every layer, every pass |
| **Model Parallelism** → Pipeline Parallelism | Layers across GPUs | Model too big for one GPU | At each stage boundary |
| Sequence Parallelism | Activations along the sequence | Activation memory too big for one GPU | Per layer, along the sequence |
| Context Parallelism | The attention computation along the sequence | Attention itself too big for one GPU (very long context) | Per attention block (ring or all-to-all) |
| ZeRO / FSDP | Optimizer state, gradients, params | Redundant memory in plain data parallelism | Params fetched on demand |
| Expert Parallelism | Which expert lives where (MoE only) | Too many/large experts for one GPU | All-to-all, per routing decision |

## Where this fits

Distributed training is what turns the hardware and interconnects from [Hardware for AI](/topic/hardware-for-ai), and the kernel-level efficiency from [GPU Programming](/topic/gpu-programming), into the ability to train a model too large or too slow for any single GPU. Which combination makes sense for a given model connects directly to its parameter count and the resulting memory footprint — covered concretely under [Parameter & Memory Estimation](/topic/parameter-and-memory-estimation). Expert parallelism's routing logic specifically continues under [Mixture of Experts](/topic/mixture-of-experts).

## Further reading

[Rajbhandari et al.'s ZeRO paper](https://arxiv.org/abs/1910.02054) introduces the memory-sharding stages covered in Section 6, [Shoeybi et al.'s Megatron-LM paper](https://arxiv.org/abs/1909.08053) and its follow-up, [Narayanan et al. on training at GPU-cluster scale](https://arxiv.org/abs/2104.04473), cover tensor and pipeline parallelism as implemented in practice, [Huang et al.'s GPipe paper](https://arxiv.org/abs/1811.06965) introduces the micro-batching scheme behind pipeline parallelism, [Liu, Zaharia & Abbeel's Ring Attention paper](https://arxiv.org/abs/2310.01889) and [Jacobs et al.'s DeepSpeed Ulysses paper](https://arxiv.org/abs/2309.14509) cover the two context-parallelism approaches in Section 5, and the [PyTorch FSDP documentation](https://docs.pytorch.org/docs/stable/fsdp.html) covers PyTorch's native sharding implementation.