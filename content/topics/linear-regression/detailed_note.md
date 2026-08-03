# Linear Regression

## Motivation

If you had to guess the simplest possible way to predict a number from some inputs, a straight line is it. As one input goes up, the output goes up or down by a fixed amount — nothing more complicated. That simplicity is exactly why this was the first model people formalized. It's easy to understand, easy to fit, and each weight tells you something concrete: how much the output changes per unit of input. It's also usually the first thing worth trying on a new regression problem, just to have a baseline.

## The model

You're predicting $y$ as a weighted sum of the input features plus a bias term:

$$
\hat{y} = w_1 x_1 + w_2 x_2 + \cdots + w_d x_d + b = \mathbf{w}^\top \mathbf{x} + b
$$

Fitting the model means choosing $\mathbf{w}$ and $b$. The standard way to score how wrong a set of predictions is using mean squared error (average the squared difference between prediction and true value) across all training examples. Squaring does two things at once: it makes all errors positive (so they don't cancel out), and it penalizes large errors disproportionately more than small ones, which turns out to correspond to a specific probabilistic assumption about the noise in your data (Gaussian noise, if you want the exact statement).

## Two ways to fit it

Linear regression is unusual — with MSE loss, it has a closed-form solution. You can solve for the best weights directly with linear algebra, no iteration needed. This works because MSE over a linear model gives you a smooth, bowl-shaped loss with exactly one minimum.

In practice, this closed-form solution isn't always used. It requires inverting a matrix, which gets slow as the number of features grows. [Gradient Descent](/topic/gradient-descent) reaches the same answer iteratively, and it's what's actually used once the direct approach becomes too expensive.

<details>
<summary>Math: MSE loss and the normal equation</summary>

Given $n$ examples with feature matrix $X \in \mathbb{R}^{n \times d}$ and targets $\mathbf{y} \in \mathbb{R}^n$, the loss is

$$
\mathcal{L}(\mathbf{w}) = \frac{1}{n}\lVert X\mathbf{w} - \mathbf{y} \rVert^2
$$

Setting the gradient with respect to $\mathbf{w}$ to zero and solving directly gives the closed-form solution:

$$
\mathbf{w}^* = (X^\top X)^{-1} X^\top \mathbf{y}
$$

This requires $X^\top X$ to be invertible — when it isn't (redundant or highly correlated features), you either need a regularized variant or an iterative method like gradient descent instead.

</details>

## When it breaks

Linear regression rests on a few assumptions that are worth being able to name:

- **Linearity** — the real relationship actually looks like a straight line.
- **Independence** — the errors don't depend on each other.
- **Homoscedasticity** — the errors have roughly the same spread across the whole range of predictions, instead of fanning out.
- **No severe multicollinearity** — if two inputs are highly correlated, the model can't tell which one is really responsible for the effect.

Breaking these doesn't make the model useless, but it does mean the coefficients and confidence in them become less trustworthy. This is also where [Regularization](/topic/regularization) and [Bias-Variance Tradeoff](/topic/bias-variance-tradeoff) start to matter — adding more features always improves training fit, but not necessarily how well the model generalizes.

## Further reading

The method of least squares — the fitting criterion linear regression uses — was first published by Adrien-Marie Legendre in 1805. Carl Friedrich Gauss claimed to have been using the same method since 1795 and published his own account in 1809, which led to a real priority dispute between the two; most historical accounts today credit Legendre with the first publication and Gauss with independent, possibly earlier, use.