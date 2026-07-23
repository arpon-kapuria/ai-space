# Gradient Descent

## The core idea

Gradient descent treats training as finding the lowest point on a loss surface. At each step it computes the gradient — the direction of steepest increase — and moves the parameters a small step in the opposite direction. Repeat enough times and the loss trends toward a minimum.

## Learning rate

The step size, or learning rate, controls how far each update moves. Too large and training oscillates or diverges; too small and training crawls. Most modern training uses a schedule that warms up, holds, then decays the learning rate over time.

## Variants

Stochastic Gradient Descent (SGD) estimates the gradient from a mini-batch instead of the full dataset, trading precision for speed. Adam and its variants add per-parameter adaptive learning rates and momentum, which is why they dominate large-scale deep learning training today.

## Where it breaks

Loss surfaces in deep networks are non-convex, full of saddle points and flat regions rather than a single bowl. Momentum, adaptive optimizers, and careful initialization exist largely to keep gradient descent moving through these regions instead of stalling.

