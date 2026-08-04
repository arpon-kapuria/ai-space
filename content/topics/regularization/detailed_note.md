# Regularization

## Motivation

The [Bias-Variance Tradeoff](/topic/bias-variance-tradeoff) explains that an overly flexible model tends to overfit — it fits the training data's noise along with the real pattern. One fix is to just use a simpler model. But often you don't want to throw away features or shrink the model outright. You'd rather keep the flexible model, and just discourage it from fitting noise in the first place. That's what regularization does: it adds a penalty to the loss function that discourages the weights from growing too large, which discourages the model from leaning too hard on any single feature or memorizing quirks of the training set.

## The idea

Instead of only minimizing the original loss, you minimize the loss plus a penalty based on the size of the weights.

- **L2 regularization (Ridge)** adds a penalty proportional to the sum of the squared weights. It shrinks all weights toward zero, but rarely all the way to exactly zero. This is the default choice when you just want to control overfitting without changing which features are used.
- **L1 regularization (Lasso)** adds a penalty proportional to the sum of the absolute values of the weights. Unlike L2, it can push weights all the way to exactly zero, which effectively removes those features from the model. This makes L1 useful when you also want automatic feature selection, not just smaller weights.
- **Elastic Net** combines both penalties. You get some of L1's feature-selection behavior and some of L2's stability, controlled by a mixing parameter between the two.

<details>
<summary>Math: L1 vs. L2 penalty</summary>

For weights $\mathbf{w}$ and a regularization strength $\lambda$, the two penalized loss functions are:

$$
\mathcal{L}_{\text{L2}}(\mathbf{w}) = \mathcal{L}(\mathbf{w}) + \lambda \sum_j w_j^2
$$

$$
\mathcal{L}_{\text{L1}}(\mathbf{w}) = \mathcal{L}(\mathbf{w}) + \lambda \sum_j |w_j|
$$

$\lambda$ controls how strong the penalty is. $\lambda = 0$ means no regularization at all. A very large $\lambda$ forces weights toward zero regardless of what the data says — trading away bias for a big drop in variance. Choosing $\lambda$ is itself a bias-variance tradeoff, usually picked with cross-validation.

The reason L1 can push weights to exactly zero and L2 usually can't comes down to geometry. The L1 penalty's constraint region has sharp corners sitting on the axes, and the optimal solution tends to land exactly on one of those corners — zeroing out a weight. The L2 penalty's constraint region is a smooth circle, with no corners to land on.

</details>

## Why it helps

Regularization is a direct, practical answer to the variance half of the bias-variance tradeoff. It doesn't change what the model *can* represent — it changes what the model is *encouraged to prefer*. Given two sets of weights that fit the training data about equally well, regularization prefers the smaller one, on the idea that a model relying less heavily on any single weight is less likely to be fitting noise.

## Further reading

Ridge regression was introduced by Arthur Hoerl and Robert Kennard in "Ridge Regression: Biased Estimation for Nonorthogonal Problems" (1970). Lasso came later, introduced by Robert Tibshirani in "Regression Shrinkage and Selection via the Lasso" (1996). Elastic Net was introduced by Hui Zou and Trevor Hastie in 2005, specifically to combine the strengths of both.