# Linear Algebra for ML

## Why it matters

Every layer of a neural network is a matrix multiplication followed by a nonlinearity. Data itself is represented as vectors (a row of pixels, a word, a user) and matrices (a batch of rows). Understanding linear algebra means understanding the actual shape of computation in ML, not just the theory around it.

## Vectors and spaces

A vector is an ordered list of numbers representing a point or direction in space. In ML, feature vectors, embeddings, and gradients are all vectors. Operations like dot products measure similarity or alignment between two vectors, which underlies everything from attention scores to cosine similarity search.

## Matrices as transformations

A matrix multiplication is a linear transformation: it rotates, scales, or projects a vector into a new space. A neural network layer `y = Wx + b` is exactly this — W reshapes the input space, b shifts it, and a nonlinearity bends it. Stacking layers stacks transformations.

## Eigenvalues and decomposition

Eigenvectors are directions a matrix doesn't rotate, only scales — they reveal the natural axes of a transformation. Singular Value Decomposition (SVD) generalizes this to any matrix and underlies techniques like PCA, low-rank adaptation (LoRA), and compression of large weight matrices.

