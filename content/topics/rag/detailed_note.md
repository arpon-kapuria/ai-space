# Retrieval-Augmented Generation (RAG)

## The problem it solves

A language model's knowledge is frozen at training time and it has no access to private or fast-changing data. RAG works around both limits by retrieving relevant text from an external source at query time and feeding it to the model as context.

## Pipeline shape

A typical pipeline chunks source documents, embeds each chunk, and stores the vectors in a vector database. At query time, the user's question is embedded, the closest chunks are retrieved, and the model generates an answer conditioned on both the question and the retrieved text.

## Where quality breaks down

Weak retrieval — bad chunking, mismatched embeddings, or poor filtering — produces irrelevant context, which the model will confidently reason over anyway. Most real-world RAG debugging effort goes into the retrieval half of the pipeline, not the generation half.

## Beyond naive RAG

Production systems commonly add re-ranking, query rewriting, hybrid keyword-plus-vector search, and agentic multi-step retrieval loops to improve on the accuracy of a single embed-and-fetch pass.

