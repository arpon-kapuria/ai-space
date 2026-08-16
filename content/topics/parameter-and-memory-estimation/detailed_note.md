# Parameter & Memory Estimation

## Motivation

[Distributed Training](/topic/distributed-training) covered how to split a model across GPUs once it doesn't fit on one and [Model Compression](/topic/model-compression) covered how to shrink a model for serving. Both of those decisions depend on a number neither topic actually calculated: how much memory does this specific model need, in the first place?

"How many GPUs do I need to train this?" and "will this model fit on the GPU I have for inference?" are two of the most common practical questions in ML engineering — and real deployments expect a real number, not a guess. Parameter & Memory Estimation is the arithmetic that gets there.

## Counting Parameters

A transformer's parameter count comes from two places: the embedding layer, and the stack of repeated transformer layers.

<details>
<summary>Math: Parameter count formula, worked through a 7B-scale example</summary>

For vocabulary size *V*, hidden dimension *d*, and *L* transformer layers:

- **Embedding layer:** roughly V × d parameters (mapping each vocabulary token to a *d*-dimensional vector).
- **Each transformer layer:** the attention block has four d×d projection matrices (query, key, value, output) ≈ 4d² parameters; the feed-forward block has an up-projection and down-projection, typically sized 4d, giving 2 × (d × 4d) = 8d² parameters. Total per layer ≈ 12d² (layer norm parameters are comparatively tiny and usually ignored in this estimate).
- **Total parameters ≈ V·d + L·12d²**

**Worked example**, using roughly LLaMA-7B-scale numbers — V = 32,000, d = 4,096, L = 32:

- Embedding: 32,000 × 4,096 ≈ 131 million
- Per layer: 12 × 4,096² ≈ 201 million; across 32 layers ≈ 6.44 billion
- **Total ≈ 6.57 billion parameters** — matching the "7B" naming convention closely enough to sanity-check real published models against this formula.

</details>

## Parameter Count → Memory Formula

Once the parameter count is known, memory for just the **weights** is a straightforward multiplication — `parameter count × bytes per parameter`, where the bytes depend on the precision from [Model Compression](/topic/model-compression):

| Precision | Bytes/param | 7B model | 70B model |
|---|---|---|---|
| FP32 | 4 | 28 GB | 280 GB |
| FP16 / BF16 | 2 | 14 GB | 140 GB |
| INT8 | 1 | 7 GB | 70 GB |
| INT4 | 0.5 | 3.5 GB | 35 GB |

This table alone already explains a lot of practical decisions: a 7B model at FP16 (14GB) fits comfortably on a single consumer GPU with 24GB of memory, while the same model at FP32 (28GB) does not — and a 70B model doesn't fit on a single 80GB data-center GPU at any precision above INT8.

## Optimizer State Memory

Weight memory alone badly undercounts what training actually needs. [Distributed Training](/topic/distributed-training)'s ZeRO section already worked through this in detail: training with Adam needs not just the parameters, but gradients and optimizer state (momentum + variance + an FP32 master copy of the weights), which together come to roughly **16 bytes per parameter** in mixed-precision training **(about 2 bytes for the parameters, 2 bytes for the gradients, 4 bytes each for Adam's momentum and variance, and 4 bytes for the FP32 master weights)** — about 8x the memory of the FP16 weights alone. **This 16-byte figure is an approximation and varies with the optimizer and numerical precision used.**

For the 7B model above, that's roughly 112GB — already more than a single 80GB GPU, from optimizer overhead alone, before a single activation is stored. This is precisely why full fine-tuning of anything beyond a few billion parameters needs the sharding strategies (ZeRO/FSDP) from [Distributed Training](/topic/distributed-training), not just more raw compute.

## Activation Memory & Gradient Checkpointing

There's a fourth memory cost, separate from parameters, gradients, and optimizer state: **activations** — the intermediate outputs of every layer, saved during the forward pass because the backward pass needs them to compute gradients.

Activation memory scales with **batch size × sequence length × hidden dimension × number of layers** — which means, unlike the other three costs, it isn't fixed by the model alone. Doubling the batch size roughly doubles activation memory. Doubling the sequence length does too. For long-context training, activation memory can end up rivaling or exceeding the memory used by the parameters themselves — which is exactly the problem sequence parallelism, from [Distributed Training](/topic/distributed-training), was introduced to address.

**Gradient checkpointing** (also called activation checkpointing) trades compute for memory: instead of storing every layer’s activations, it keeps only a few **checkpoint activations**, typically at selected layer boundaries or regular intervals, and recomputes the rest during the backward pass. Checkpoint placement can use simple fixed intervals, equal-sized segments, or more advanced strategies that optimize the memory–compute trade-off. For example, with 12 layers, you might keep activations after layers **3, 6, 9, and 12**; during backpropagation, layers 4–6 can be recomputed from the checkpoint at layer 3 instead of storing all their intermediate activations. **The goal is not to keep the “most important” activations, but to choose points that make the discarded activations cheap to recompute.** This can reduce activation memory substantially, often at the cost of roughly one extra forward pass of compute. It's a standard, near-default technique whenever activation memory is the binding constraint, since GPU compute is usually more available than GPU memory.

## Estimating GPUs Needed: Training vs. Inference

Training and inference need to answer the same question — "how much memory total?" — but the components that go into that total are very different, which is why training a model and merely running it are such different-sized problems.

**Training a 7B model (full fine-tuning, mixed precision, Adam):**

| Component | Memory |
|---|---|
| Parameters (FP16) | 14 GB |
| Gradients (FP16) | 14 GB |
| Optimizer state (Adam, FP32) | 84 GB |
| **Subtotal (fixed cost)** | **112 GB** |
| Activations | Tens of GB more, depending on batch size and sequence length |

Already over a single 80GB GPU before activations are even added — this model needs either ZeRO/FSDP sharding across multiple GPUs, or a memory-saving technique like LoRA (which drastically shrinks the optimizer state by only training a small number of extra parameters), covered under [Parameter Efficient Fine Tuning](/topic/peft).

**Running the same 7B model for inference:**

| Component | Memory |
|---|---|
| Parameters (INT4, quantized) | 3.5 GB |
| KV cache (grows with sequence length and batch of concurrent requests) | A few GB, workload-dependent |
| **Total** | **Single digit GBs — fits on one consumer GPU** |

No gradients, no optimizer state — inference only ever needs the weights and a modest, request-dependent [KV Cache](/topic/kv-cache). This is the concrete reason a model that needed multiple data-center GPUs to *train* can be quantized down and served comfortably on a single consumer card — training and inference were never the same-sized problem to begin with.

**In practice**, engineers rarely do this arithmetic entirely by hand: tools like Hugging Face Accelerate's `device_map="auto"` estimate memory automatically and decide how to split a model across available GPUs, and reference write-ups like EleutherAI's "Transformer Math 101" are commonly used as a sanity check before ever launching an expensive training job.

## Where this fits

Parameter & Memory Estimation is the arithmetic underneath decisions made in three other notes: it's *why* [Distributed Training](/topic/distributed-training)'s sharding strategies are necessary at all, it's what [Model Compression](/topic/model-compression) is trying to shrink, and to serve these models efficiently, understanding and configuring a serving framework — vLLM, SGLang, Triton (Inference Server), and the others covered under [Model Serving](/topic/model-serving) is important.

## Further reading

[Narayanan et al.'s Megatron-LM scaling paper](https://arxiv.org/abs/2104.04473) and [Rajbhandari et al.'s ZeRO paper](https://arxiv.org/abs/1910.02054), both already referenced in [Distributed Training](/topic/distributed-training), are the underlying sources for the memory formulas above, and EleutherAI's [Transformer Math 101](https://blog.eleuther.ai/transformer-math/) write-up is the standard practical reference engineers actually use for these calculations day to day.