# Backpropagation

## The problem it solves

A deep network can have billions of parameters. Computing how the loss changes with respect to each one individually would be intractable. Backpropagation reuses the chain rule of calculus to compute all of these gradients in a single backward pass through the network.

## Forward and backward passes

During the forward pass, the network computes predictions layer by layer, caching intermediate values. During the backward pass, the error signal is propagated from the output back toward the input, multiplying local derivatives at each layer using the cached values.

## Computational graphs

Modern frameworks like PyTorch build a computational graph as operations run, then walk it backward automatically — this is called autodiff. Backpropagation is really just reverse-mode automatic differentiation applied to the specific graph shape of a neural network.

## Vanishing and exploding gradients

Multiplying many small derivatives together shrinks the gradient toward zero in deep networks; multiplying large ones blows it up. Techniques like residual connections, normalization layers, and careful initialization exist specifically to keep gradients flowing through very deep stacks.

