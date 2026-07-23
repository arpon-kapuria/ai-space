# BERT

## Bidirectional context

Unlike GPT-style models that only look at previous tokens, BERT's encoder attends to the entire input sequence at once in both directions, giving it richer context for tasks like classification and question answering.

## Masked language modeling

BERT is pretrained by randomly masking a percentage of input tokens and training the model to predict them from context on both sides. This forces it to build genuinely contextual token representations rather than just predicting the next word.

## Fine-tuning for downstream tasks

After pretraining, BERT is typically fine-tuned with a small task-specific head for classification, named entity recognition, or extractive question answering, often needing only a modest labeled dataset to reach strong performance.

## Legacy

BERT is not used for open-ended text generation, but its architecture and pretraining recipe shaped nearly every encoder used in modern embedding models and retrieval systems.

