# Hardware for AI

## Motivation

Everything covered so far in Production AI — pipelines, monitoring, deployment — assumes a model exists and just needs to run reliably. None of it addresses a more basic question: why does training or serving a modern model need specialized hardware at all? A CPU can run any code, including a neural network's.

The answer is that a CPU is built to do a wide variety of different things quickly, one after another — branching logic, sequential instructions, unpredictable memory access. A neural network's core operation, matrix multiplication, is the opposite: the same simple operation (multiply, add) repeated millions of times, largely independent of each other, over predictable data. A CPU's small number of powerful cores can't exploit that repetition. Hardware built specifically to exploit it is what makes training a modern model take days instead of years.

## GPUs vs. CPUs vs. TPUs

- **CPUs** have a handful of powerful cores (typically 8–64), each optimized for **latency** — finishing one complex, branching task as fast as possible. Great for general-purpose code; poor at doing the same simple operation millions of times in parallel, since most of those cores sit idle during a matrix multiply.

- **GPUs** flip the trade-off: thousands of small, simple cores, optimized for **throughput** — not finishing any one operation fast, but finishing enormous numbers of identical operations at once. A GPU executes the same instruction across many threads simultaneously (a model called **SIMT** — Single Instruction, Multiple Threads), which maps almost perfectly onto matrix multiplication: every output element needs the same multiply-add operation, just on different data.

- **TPUs** (Tensor Processing Units, Google's custom AI chips) go a step further — instead of thousands of general-purpose small cores, a TPU is built around a **systolic array**: a large, fixed grid of multiply-add units wired directly to each other, so partial results flow from one unit to the next without going back to memory in between. This makes TPUs extremely efficient specifically at matrix multiplication, at the cost of being less flexible than a GPU for anything that isn't matrix-multiply-shaped.

The general pattern across all AI-specific hardware: give up flexibility, gain massive parallelism for the one operation (matrix multiply) that dominates deep learning.


## Memory Bandwidth & Compute Bottlenecks

A chip can have huge computing power and still be slow if it spends too much time waiting for data. Before a GPU or CPU can perform an operation, it first needs to get the required data from memory. Moving that data takes time, and memory can only deliver a certain amount of data per second. This limit is called **memory bandwidth**, usually measured in **GB/s or TB/s**.

**Compute-bound vs. Memory-bound**

A useful way to understand the bottleneck is **Arithmetic Intensity (AI)**. It tells us how much computation is performed for each byte of data that needs to be moved from memory.

> **Arithmetic intensity = FLOPs ÷ bytes moved from memory**

* **Low arithmetic intensity:** The chip spends more time moving data than calculating. This is called **memory-bound**.
* **High arithmetic intensity:** There is enough computation to keep the chip's compute units busy. This is called **compute-bound**.

<details>
<summary>Math: Arithmetic intensity and the roofline model</summary>

The **roofline model** plots achievable performance against this ratio. For a chip with peak compute *C* (FLOPs/s) and peak memory bandwidth *B* (bytes/s):

- If AI < C / B, the workload is **memory-bound** — performance is capped by how fast data can be fed in, and the compute units sit partly idle waiting.
- If AI ≥ C / B, the workload is **compute-bound** — performance is capped by the chip's raw FLOPs, and memory keeps up fine.

**For example.** A large matrix multiply multiplication tends to be compute-bound. On the other hand, many transformer inference steps, especially decoding one token at a time, have low AI relative to the data moved and end up memory-bound instead — this is a big part of why decoding is slow even on very fast GPUs, covered in depth under Decode.

</details>

**Why GPU Memory Matters**

GPU specifications cannot be judged by compute power alone. Memory bandwidth can be just as important. Data-center GPUs such as the A100 and H100 use **HBM (High Bandwidth Memory)**, which provides much more memory bandwidth than the **GDDR** memory commonly found on consumer GPUs. The reason is simple: large AI models often spend a significant amount of time **moving data rather than doing arithmetic**. When memory is the bottleneck, having more compute units does not help much unless the memory system can feed them with data fast enough.

**In short:** a faster calculator is not useful if it is constantly waiting for someone to hand it the numbers.

## Interconnects (NVLink, InfiniBand)

A single GPU, no matter how fast, has limited memory (80GB on an H100, for instance) — nowhere near enough to hold the largest models' parameters, gradients, and optimizer state all at once. Training or serving these requires many GPUs working together, which means GPUs need to talk to *each other*, not just to their own memory. How fast they can do that becomes its own bottleneck, distinct from the roofline model above.

- **PCIe** — the general-purpose bus connecting a GPU to the rest of the machine (CPU, storage, other cards). Present in essentially every setup, but comparatively slow for GPU-to-GPU traffic.
- **NVLink** (and **NVSwitch** for connecting many GPUs at once) — NVIDIA's high-bandwidth, direct GPU-to-GPU interconnect *within a single machine*, dramatically faster than PCIe. This is what makes tensor parallelism practical, since it requires GPUs to exchange partial results constantly, on every layer.
- **InfiniBand** — a high-bandwidth, low-latency network technology used *between machines* in a GPU cluster, where NVLink doesn't reach. This is what makes multi-node training (data or pipeline parallelism spanning many servers) practical, rather than bottlenecked on ordinary Ethernet.

The general rule that falls out of this: the more communication a distributed training strategy requires between GPUs, the more it depends on having fast interconnects available — which is precisely why the choice of parallelism strategy, covered next in [Distributed Training](/topic/distributed-training), is inseparable from the hardware topology it runs on.

## Where this fits

Hardware sets the ceiling on what's possible — how much compute is available, how fast data moves, how fast GPUs can talk to each other. [GPU Programming](/topic/gpu-programming) covers how to actually write code that uses this hardware efficiently. [Distributed Training](/topic/distributed-training) covers how to split a model too large for one GPU across many, built directly on the interconnects introduced here.

## Further reading

NVIDIA's [H100 Tensor Core GPU Architecture Whitepaper](https://resources.nvidia.com/en-us-tensor-core) covers the chip-level details behind the GPU specs referenced above, [Williams, Waterman & Patterson's roofline paper](https://dl.acm.org/doi/10.1145/1498765.1498785) introduces the roofline model in full, and [Jouppi et al.'s TPU paper](https://arxiv.org/abs/1704.04760) is the original description of Google's systolic-array design.