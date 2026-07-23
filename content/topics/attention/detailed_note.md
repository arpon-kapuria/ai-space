# Attention Mechanism

## The core idea

Attention computes, for each element in a sequence, a weighted combination of every other element, where the weights are learned based on relevance. This gives the model direct access to any part of the input, regardless of distance.

## Queries, keys, and values

Each token is projected into a query, a key, and a value vector. The similarity between a token's query and every other token's key determines the attention weights; those weights are then used to combine the value vectors into the output.

## Self-attention vs cross-attention

Self-attention relates a sequence to itself, which is what lets a transformer build contextual representations of a sentence. Cross-attention relates one sequence to another, such as a decoder attending over an encoder's output in translation.

## Multi-head attention

Rather than computing a single attention pattern, transformers compute several in parallel ('heads'), each free to specialize in a different kind of relationship — syntax, coreference, position — and concatenate the results.

