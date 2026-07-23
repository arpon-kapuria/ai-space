# Fine-Tuning

## Why start from pretrained weights

Pretraining on huge general corpora teaches broad language and world knowledge that would be far too expensive to relearn from scratch for every task. Fine-tuning reuses that foundation and specializes it with a much smaller, targeted dataset.

## Full fine-tuning vs parameter-efficient methods

Full fine-tuning updates every weight in the model, which is accurate but expensive in memory and storage — a full copy of the weights per task. Parameter-efficient methods like LoRA freeze the base model and train small additional matrices instead.

## Instruction tuning

Fine-tuning a base model on examples of instructions paired with good responses is what turns a raw next-token predictor into something that reliably follows directions — a prerequisite step before RLHF in most modern LLM training pipelines.

## Risks

Fine-tuning on a narrow dataset can cause catastrophic forgetting, where the model loses general capabilities it had before, or overfits to quirks of the fine-tuning set that don't generalize.

