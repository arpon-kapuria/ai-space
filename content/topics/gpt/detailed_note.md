# GPT

## Autoregressive generation

GPT generates text one token at a time, feeding each generated token back in as input for predicting the next. Training simply maximizes the likelihood of the next real token given everything before it — a deceptively simple objective at massive scale.

## Causal masking

Because GPT can only look backward, its attention layers are masked so a token can never attend to positions after it. This is what makes the model usable for generation, where future tokens don't exist yet at inference time.

## From base model to assistant

A pretrained GPT model is a raw text predictor. Instruction tuning and RLHF are what turn that raw predictor into something that follows instructions and behaves like an assistant rather than just continuing whatever text it's given.

## In-context learning

Large GPT-style models can adapt to a new task from a handful of examples placed directly in the prompt, without any weight updates — an emergent capability that only becomes reliable at sufficient scale.

