# Model Compression

## Motivation

[Distributed Training](/topic/distributed-training) was about affording enough hardware to *train* a huge model. But the model doesn't get smaller just because training finished. A 70B-parameter model needs roughly 140GB just to hold its weights in FP16 — before it ever answers one request.

Serving at that size, to many users, at low latency, is a different problem from training once. Most of that size buys little in practice: a weight in 16 bits is rarely *meaningfully* more accurate than the same weight in 4 or 8, but costs 2–4x the memory and bandwidth. Model compression shrinks a trained model down — after training, or sometimes during it — while keeping the accuracy that made it worth training.

## Quantization — Fewer Bits per Weight

**The core idea:** weights are normally stored as 32- or 16-bit floats. Quantization stores them with fewer bits — commonly INT8 or INT4 — which shrinks memory and, since less data moves, speeds up inference too (recall from [Hardware for AI](/topic/hardware-for-ai) that inference is often memory-bandwidth-bound, not compute-bound).

<details>
<summary>Math: How a float gets mapped to an integer</summary>

Quantizing a range of floating-point values into *N*-bit integers uses a **scale** and a **zero-point**:

`quantized_value = round(float_value / scale) + zero_point` 

Here, `scale = (max_float − min_float) / (2^N − 1)`. To use the weight again, it's **dequantized** back: `float_value ≈ (quantized_value − zero_point) × scale`. 

</details>

The gap between the true float value and this reconstructed approximation is **quantization error** — the whole game in quantization research is minimizing that error, especially for the handful of unusually large "outlier" values that a naive uniform scale handles badly.

### Quantization Types

Quantization can use different numerical representations depending on the target hardware, memory constraints, and accuracy requirements.

- **INT8** — 8-bit integer representation. It is widely supported and provides a good balance between memory reduction, inference speed, and accuracy.
- **INT4** — 4-bit integer representation. It reduces weight memory to roughly one quarter of FP16, making it particularly useful for serving large LLMs cheaply.
- **FP8** — 8-bit floating-point representation. Formats such as **E4M3** and **E5M2** trade precision and dynamic range differently. Unlike INT8, FP8 retains a floating-point exponent, making it better suited to values with a wider dynamic range.
- **NF4** — 4-bit NormalFloat, designed around the approximately bell-shaped distribution of neural network weights. It is the quantization format used by QLoRA and is available through bitsandbytes.

**Post-Training Quantization (PTQ)** quantizes an already-trained model, with no retraining — fast, cheap, the default option. Naive PTQ can still hurt accuracy at 4 bits, which is why specific methods exist:

- **GPTQ** quantizes weights layer by layer, adjusting each remaining weight to compensate for error already introduced upstream — an error-correcting sweep, not an independent per-weight rounding.
- **AWQ** (Activation-aware Weight Quantization) keeps the small number of weights that produce the largest activations at higher precision, and quantizes the rest more aggressively — spending precision where it actually affects the output.
- **SmoothQuant** targets a different problem: transformer *activations*, not just weights, have outliers that are hard to quantize. It mathematically shifts some of that difficulty from activations onto weights, which handle it better.
- **bitsandbytes** provides practical low-bit quantization schemes, including **NF4**, which is the 4-bit format commonly used by QLoRA.

**Quantization-Aware Training (QAT)** goes further: it simulates quantization during training or fine-tuning, so weights adapt to the precision loss before it's applied for real. It typically beats PTQ at very low bit widths, at the cost of an actual training run instead of a one-time conversion. Rule of thumb: PTQ for a quick, cheap shrink; QAT when the last bit of accuracy at very low precision is worth paying for.

> **Rule of thumb:** *PTQ* for a quick, cheap shrink; *QAT* when the last bit of accuracy at very low precision is worth paying for.

### How Low Can It Go?

Research has pushed past 4 bits — 2-bit and even 1-bit/ternary (-1,0,1) schemes like BitNet *(1.58-bit ternary)* exist — but these need custom training recipes and kernels, and aren't a default anywhere yet.

In production, **INT8** remains a widely supported choice, while **INT4** (GPTQ, AWQ, or NF4) is a common sweet spot for serving large LLMs cheaply, trading a small accuracy dip for roughly 4x less weight memory than FP16. **FP8** is increasingly practical on modern accelerators with native FP8 support.

**Practical flow:** start at FP16/BF16, use FP8 or INT8 when hardware and workload support them, and move to INT4 when serving cost demands it. Below INT4 is still mostly a research frontier.

## Mixed-Precision Training

Quantization shrinks a model for **serving**. Mixed precision is a related but separate idea for **training** — most training compute doesn't need full 32-bit precision (**FP32**) to converge, so using a lower-precision format for the bulk of it makes training faster and cheaper, without changing what's stored at the end.

- **FP16** halves memory and, on supporting hardware, speeds up training — but has a small representable range, so tiny gradients can underflow to zero and vanish.
- **BF16** also uses 16 bits, but keeps FP32's exponent range (no underflow) at the cost of mantissa precision. This is why BF16 is now the more common default for large-model training — FP16's memory and speed benefits, without its underflow problem.
- **AMP** (Automatic Mixed Precision) is the mechanism: a master FP32 copy of weights handles the actual weight update (precision matters), while the forward/backward pass (speed matters) runs in FP16/BF16 — mixing precisions within one training step.
- **Loss scaling** fixes FP16's underflow directly: the loss is multiplied by a large constant before backprop, scaling gradients up away from the underflow point, then undone before the weight update. BF16 rarely needs this, given its wider exponent range.

## Pruning

**The core idea:** many weights contribute very little to a network's output — removing them (setting them to zero, or removing them entirely) shrinks the model with limited accuracy loss, since a lot of trained capacity turns out to be redundant.

- **Unstructured pruning** zeroes out individual weights wherever they matter least (e.g. below some magnitude threshold). Best compression-for-accuracy on paper, but the resulting sparse pattern is irregular. But most hardware isn't built to actually run irregular sparsity any faster — the "removed" weights are still stored as explicit zeros unless specialized sparse hardware/kernels are used.
- **Structured pruning** removes whole chunks instead — a neuron, an attention head, a layer. A coarser cut (a bigger accuracy hit for the same compression ratio) usually costlier cut, but the result is a smaller *dense* model that ordinary hardware runs faster immediately.

The practical trade-off: unstructured pruning wins on paper (better compression-for-accuracy), structured pruning wins in practice on typical GPUs — which is why structured pruning sees more real-world use despite the less favorable numbers.

## Knowledge Distillation

**The core idea:** train a smaller **student** model to mimic a larger, already-trained **teacher** model, instead of training the student from scratch on raw labels alone.

The key detail: the student doesn't just learn from the teacher's final answer (the hard label), it also learns from the teacher's full output distribution — **the relative confidence the teacher assigns to every possible answer**, not just the top one. If a teacher classifying images is 70% confident it's a cat, 25% confident it's a dog, and 5% everything else, that near-miss confidence in "dog" teaches the student something about which classes are visually similar — information a single "the answer is cat" label throws away entirely.

**DistilBERT** is the canonical example: about 40% fewer parameters than BERT, trained to mimic BERT's output distributions, retaining roughly 97% of BERT's benchmark performance while running noticeably faster.

## Model Formats

A compressed (or uncompressed) model still needs to be stored in some file format, and the choice affects load speed, portability, and safety.

- **PyTorch checkpoints (`.pt`/`.pth`)** — PyTorch's native format, built on Python's `pickle`. Convenient, but pickle can execute arbitrary code on load — a real risk with checkpoints from untrusted sources.
- **safetensors** — a format designed specifically to fix that problem: stores only tensor data, no code execution capability, and loads faster than pickle. Now the default for sharing weights on the Hugging Face Hub.
- **ONNX** (Open Neural Network Exchange) — a framework-agnostic format: export from PyTorch, run in a completely different runtime, no PyTorch required. Useful when a deployment wants one standard inference engine regardless of training framework.
- **GGUF** — the format used by `llama.cpp` and the local-inference ecosystem (including Ollama), built for running quantized LLMs efficiently on consumer hardware, CPUs included. A single GGUF file typically bundles weights, tokenizer, and metadata all together.

## Where this fits

Model compression makes a trained model's memory footprint, and the GPU count needed to serve it, dramatically smaller — the arithmetic behind "how much memory does this model need" is worked out in [Parameter & Memory Estimation](/topic/parameter-and-memory-estimation). Once compressed into a serving-ready format, [Model Serving](/topic/model-serving) and [Inference Optimization](/topic/inference-optimization) cover how it's actually deployed.

## Further reading

[Frantar et al.'s GPTQ paper](https://arxiv.org/abs/2210.17323) and [Lin et al.'s AWQ paper](https://arxiv.org/abs/2306.00978) cover the two leading post-training quantization methods in detail, [Xiao et al.'s SmoothQuant paper](https://arxiv.org/abs/2211.10438) introduces the activation-outlier smoothing technique, [Dettmers et al.'s QLoRA paper](https://arxiv.org/abs/2305.14314) introduces the NF4 data type behind bitsandbytes, and [Hinton, Vinyals & Dean's original knowledge distillation paper](https://arxiv.org/abs/1503.02531) is the foundational reference for Knowledge Distillation. [Sanh et al.'s DistilBERT paper](https://arxiv.org/abs/1910.01108) is the concrete worked example referenced above, and the [Hugging Face safetensors documentation](https://huggingface.co/docs/safetensors/index) and [ONNX documentation](https://onnx.ai/onnx/intro/) cover the model formats.
