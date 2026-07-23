# Neural Network

## Structure

A neural network is a stack of layers, each computing a linear transformation of its input followed by a nonlinear activation function. Stacking layers lets the network compose simple transformations into arbitrarily complex ones.

## Why nonlinearity matters

Without a nonlinear activation between layers, any stack of linear layers collapses into a single linear layer — depth would add no expressive power. Functions like ReLU, GELU, or sigmoid are what let networks approximate complex, curved decision boundaries.

## Training loop

Training alternates a forward pass (compute predictions and loss), a backward pass (compute gradients via backpropagation), and a parameter update (gradient descent). Repeating this over the dataset for many epochs is what 'training' means in practice.

## From MLPs to modern architectures

The plain multilayer perceptron (MLP) is the ancestor of every modern architecture. Convolutional networks add spatial weight sharing for images; recurrent networks add memory across time steps; transformers replace recurrence with attention. All still rest on the same weighted-sum-plus-nonlinearity building block.

