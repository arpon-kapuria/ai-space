# Embedding

## From symbols to vectors

Raw tokens or images are discrete and don't carry any notion of similarity on their own. An embedding maps them into a continuous vector space where distance and direction encode meaningful relationships, learned from data rather than hand-crafted.

## How they're learned

Embeddings emerge as a byproduct of training on some objective — predicting neighboring words, contrastive pairs of matching text, or as the internal representation of a larger network — and are then reused directly for search and comparison.

## Similarity search

Once objects are embedded, finding related ones reduces to a nearest-neighbor search in vector space, typically using cosine similarity or dot product. This is the mechanism behind semantic search, recommendation, and retrieval-augmented generation.

## Embedding spaces aren't universal

Vectors from different embedding models are not comparable to one another — the space each model learns is specific to its training data and objective. Swapping embedding models generally requires re-embedding an entire dataset.

