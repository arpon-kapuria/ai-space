# Diffusion Models

## Forward and reverse processes

Training starts from real data and adds a small amount of Gaussian noise at each of many steps until it becomes pure noise. The model then learns to reverse this process, predicting the noise added at each step so it can be subtracted away.

## Sampling as iterative denoising

To generate a new sample, the model starts from pure random noise and repeatedly applies its learned denoising step, gradually revealing coherent structure over many iterations rather than in a single forward pass.

## Conditioning

Text-to-image diffusion models condition the denoising process on a text embedding at every step, typically via cross-attention, so the noise removed at each step is steered toward matching the given prompt.

## Trade-offs vs other generative approaches

Diffusion models tend to produce higher-quality, more diverse samples than earlier GAN-based approaches, at the cost of needing many iterative steps to generate a single sample — though distillation techniques have cut this substantially.

