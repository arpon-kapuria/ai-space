# Convolutional Neural Network (CNN)

## The convolution operation

Instead of connecting every input pixel to every neuron, a CNN slides a small learnable filter across the image, computing a weighted sum at each position. The same filter is reused everywhere, which drastically cuts the parameter count and builds in translation invariance.

## Feature hierarchies

Early convolutional layers tend to learn simple detectors like edges and color blobs. Deeper layers combine these into textures, parts, and eventually whole-object detectors. This hierarchy emerges purely from training, not from hand design.

## Pooling and downsampling

Pooling layers (like max pooling) shrink the spatial resolution between convolutional blocks, reducing computation and giving the network some robustness to small shifts in the input.

## Where CNNs stand today

Vision Transformers have matched or exceeded CNNs on many large-scale benchmarks, but CNNs remain dominant where data or compute is limited, thanks to their strong built-in spatial bias. Hybrid architectures combining both are common in production vision systems.

