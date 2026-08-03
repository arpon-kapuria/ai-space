# Supervised Learning

## Motivation

Fitting a curve to labeled data is old — Gauss and Legendre were doing linear regression on astronomical data in the early 1800s, long before anyone called it machine learning. What machine learning added wasn't the idea of learning from examples; it was a general framework for it. Instead of deriving a formula by hand for each new problem, you define a hypothesis space, a loss function that scores how wrong a prediction is, and a search procedure that finds the hypothesis minimizing that loss. That turned "fit a model to data" into one well-posed optimization problem that the same machinery could solve regardless of whether the task was predicting house prices or classifying digits.

## The idea

You have a dataset of $n$ examples, each a pair $(x_i, y_i)$ — an input and its correct output. The goal is to learn a function $f$ that maps inputs to outputs accurately enough to generalize to examples it has never seen, not just to memorize the training set.

Two flavors, depending on what $y$ is:

- **Regression** — $y$ is a continuous number (price, temperature, a probability).
- **Classification** — $y$ is one of a fixed set of categories (spam/not spam, which digit, which disease).

The distinction matters because it changes which loss functions and evaluation metrics make sense — you don't measure a spam classifier with mean squared error, and you don't measure a price predictor with accuracy.

## Empirical risk minimization

In practice you never have access to the true underlying distribution generating your data, only a finite sample of it. So instead of minimizing the *expected* loss over that distribution, you minimize the *average* loss over your training set — this is called empirical risk minimization, and it's the actual optimization problem every supervised learning algorithm is solving under the hood, whether it's [Linear regression](/topic/linear-regression), [Decision tree](/topic/decision-tree), or a [Neural network](/topic/mlp).

The gap between doing well on the training set and doing well on new data is the central tension in supervised learning — a model that minimizes training loss too aggressively ends up fitting noise specific to that sample rather than the underlying pattern. That tension is what the [Bias-Variance Tradeoff](/topic/bias-variance-tradeoff) is about, and it's the reason you always evaluate on held-out data rather than trust training performance alone.

<details>
<summary>Math: empirical risk minimization</summary>

Given a hypothesis space $\mathcal{H}$ and a loss function $\mathcal{L}$, the true objective is to find

$$
f^* = \arg\min_{f \in \mathcal{H}} \, \mathbb{E}_{(x,y) \sim P}\left[\mathcal{L}(f(x), y)\right]
$$

but $P$ is unknown, so in practice you minimize the empirical estimate over your $n$ training examples instead:

$$
\hat{f} = \arg\min_{f \in \mathcal{H}} \, \frac{1}{n}\sum_{i=1}^{n} \mathcal{L}(f(x_i), y_i)
$$

The gap between the two — how well $\hat{f}$ performs on the true distribution $P$ versus on the training sample it was fit to — is what generalization error measures, and it's why held-out validation data exists.

</details>

## How the function actually gets found

For most modern models, "search for the hypothesis minimizing the loss" means [Gradient Descent](/topic/gradient-descent) — pushing the model's parameters in the direction that reduces the loss, repeatedly, until it converges. Older or simpler models (like ordinary linear regression) have a closed-form solution and don't need this at all, but the moment your model has more than a handful of parameters, gradient-based optimization is what's actually running.

## Further reading

There's no single paper credited with "inventing" supervised learning — it's the union of centuries-old statistical curve-fitting with a computational framework formalized gradually through the 20th century. The closest thing to a defining theoretical treatment is Vladimir Vapnik's [The Nature of Statistical Learning Theory](https://statisticalsupportandresearch.wordpress.com/wp-content/uploads/2017/05/vladimir-vapnik-the-nature-of-statistical-learning-springer-2010.pdf) (1995), which formalized empirical risk minimization and generalization bounds in the terms still used today.