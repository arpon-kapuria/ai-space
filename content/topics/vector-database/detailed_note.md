# Vector Database

## Why not a normal database

Traditional databases index for exact matches and ranges. Vector search needs to find the k closest points in a high-dimensional continuous space, which requires fundamentally different index structures to stay fast at scale.

## Approximate nearest neighbor indexes

Exact nearest-neighbor search is too slow beyond a small dataset, so vector databases use approximate structures like HNSW (a navigable graph) or IVF (clustering-based partitioning) that trade a small amount of recall for large speedups.

## Metadata filtering

Real workloads rarely want pure similarity search — they want the closest matches within a filtered subset, such as a specific user's documents or a date range. Combining vector search with metadata filters efficiently is a major differentiator between vector database implementations.

## Role in RAG systems

In a retrieval-augmented generation pipeline, the vector database is the component that turns a user query into a shortlist of relevant chunks before those chunks are handed to the language model as context.

