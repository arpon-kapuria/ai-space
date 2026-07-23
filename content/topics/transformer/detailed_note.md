# Transformer

## Why it was introduced

The 2017 'Attention Is All You Need' architecture removed recurrence entirely, relying only on attention and feed-forward layers. This let the whole sequence be processed in parallel during training, which unlocked training on far larger datasets than RNNs ever could.

## Encoder-decoder structure

The original transformer had an encoder that builds a contextual representation of the input and a decoder that generates output tokens one at a time, attending back over the encoder. Modern LLMs like GPT use a decoder-only variant; models like BERT use an encoder-only variant.

## Positional information

Because attention has no inherent sense of order, transformers inject positional information explicitly, either through fixed sinusoidal encodings or learned/rotary embeddings, so the model can distinguish 'dog bites man' from 'man bites dog'.

## Scaling behavior

Transformer performance has followed remarkably predictable scaling laws with model size, data, and compute, which is the main reason the field bet so heavily on this architecture for building ever-larger language models.

