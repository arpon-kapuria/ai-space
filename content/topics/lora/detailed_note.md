# LoRA (Low-Rank Adaptation)

## The core trick

Instead of updating a full weight matrix during fine-tuning, LoRA freezes it and learns a low-rank decomposition — two much smaller matrices whose product approximates the needed update. This cuts trainable parameters by orders of magnitude.

## Why low rank works

Empirically, the change needed to adapt a pretrained model to a new task tends to live in a much lower-dimensional space than the full parameter count, so a low-rank approximation captures most of the useful update.

## Practical benefits

Because the base weights never change, a single base model can be served with many small LoRA adapters swapped in per task or per customer, at a fraction of the storage and memory cost of full fine-tuned copies.

## Trade-offs

LoRA typically slightly underperforms full fine-tuning on tasks that require deep changes to the model's knowledge or behavior, though the gap is often small relative to the efficiency gained.

