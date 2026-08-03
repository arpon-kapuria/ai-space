# Gradient Descent

## Motivation

[Supervised learning](/topic/supervised-learning) reduces training a model to one optimization problem: find the parameters that minimize a loss function over your training data. For a handful of simple models — ordinary linear regression is the classic example — you can solve that directly with algebra and get the exact answer in one step. But that's the exception, not the rule. The moment your loss surface isn't a simple bowl, or your model has thousands or billions of parameters, there's no formula you can solve for "the minimum." What you can always compute, though, is the ***gradient*** — which direction makes the loss worse fastest — and if you know which direction makes things worse, you know which direction makes things better: the opposite one. Gradient descent is just that idea, repeated until it stops improving.

## Before we compute the gradient

Gradient descent revolves around a few core concepts. If any of these are unfamiliar, it's worth understanding them before looking at the update rule.

- **Model parameters ($$\theta$$)** are the values the model learns from data. They determine how inputs are transformed into predictions. During training, gradient descent repeatedly updates these parameters to improve the model's performance.
- **Ground truth (true labels)** are the correct target values associated with the training data. In supervised learning, the model's predictions are compared against these values to determine how well the model is performing.
- **Loss function** measures how different the model's predictions are from the ground truth. Training is formulated as minimizing this quantity by adjusting the model parameters. Different tasks use different loss functions, for example, Mean Squared Error (MSE) for regression and Cross-Entropy Loss for classification. See [Loss Functions](/topic/loss-functions) for a detailed discussion. Loss function is sometimes called the *cost function*.

## The update rule

At each step, you compute how the loss changes with respect to every parameter. The parameters are updated by moving **opposite to the gradient** (negative gradient), which reduces the loss over successive iterations.

$$
\theta \leftarrow \theta - \eta \nabla_\theta \mathcal{L}(\theta)
$$

Where:

- $$\nabla_\theta \mathcal{L}(\theta)$$: Gradient of the loss with respect to the parameters $$\theta$$. It indicates the direction of the steepest increase in the loss.
- $$\eta$$: Learning rate, which controls the size of each update step. Too large and you overshoot the minimum, sometimes diverging entirely; too small and training crawls. Getting this one number right (or scheduling it over time) is one of the most consequential decisions in training any model.

## Batch, Stochastic, and Mini-Batch

The gradient is computed as an average over your training examples, and how many examples you average over each step is a real design choice with real tradeoffs:

- **Batch gradient descent** uses the entire training set for every single update. The gradient estimate is exact, but for any dataset of meaningful size, computing it once per step is slow — you pay the cost of a full pass over the data just to move the parameters once.
- **Stochastic gradient descent (SGD)** goes to the opposite extreme: estimate the gradient from a single random example. Each step is nearly free, but the estimate is noisy — you're not moving in the true steepest direction, just a direction that's right on average. That noise isn't purely a downside; it can help the optimizer escape shallow local minima and saddle points that a smoother, exact gradient would settle into.
- **Mini-batch gradient descent** is the practical compromise almost everything actually uses: estimate the gradient from a small batch (32, 256, a few thousand examples) instead of one or all of them. It's noisy enough to have some of SGD's benefits, accurate enough to converge reliably, and — crucially for modern hardware — batches of that size are exactly what GPUs are good at processing in parallel.

In practice, when people say "SGD" in the context of deep learning, they usually mean mini-batch gradient descent. The pure single-example version is rarely used as-is.

<details>
<summary>Math: the gradient estimator for each variant</summary>

For a loss defined as an average over $n$ training examples, $\mathcal{L}(\theta) = \frac{1}{n}\sum_{i=1}^n \ell(\theta; x_i, y_i)$, the true gradient is

$$
\nabla_\theta \mathcal{L}(\theta) = \frac{1}{n}\sum_{i=1}^n \nabla_\theta \ell(\theta; x_i, y_i)
$$

Batch gradient descent computes this exactly. 

Stochastic gradient descent replaces it with a single-sample estimate, $\nabla_\theta \ell(\theta; x_i, y_i)$ for a randomly drawn $i$ — an unbiased estimator of the true gradient, just a high-variance one. 

Mini-batch gradient descent averages over a random subset $B$ of size $|B| = m \ll n$:

$$
\nabla_\theta \mathcal{L}(\theta) \approx \frac{1}{m}\sum_{i \in B} \nabla_\theta \ell(\theta; x_i, y_i)
$$

Variance of the estimate shrinks as $m$ grows, roughly like $1/m$, which is the formal reason larger batches give smoother, more reliable updates at the cost of more compute per step.

</details>

## Convergence behavior

Whether gradient descent actually reaches a good solution — and how reliably — depends heavily on the shape of the loss surface. For a convex loss (linear regression's MSE is a clean example), gradient descent with a reasonable learning rate is guaranteed to converge to the global minimum. For the non-convex loss surfaces of neural networks, there's no such guarantee — you can get stuck near saddle points or settle into a local minimum that isn't the best one available, though in practice, for large enough networks, most local minima found this way tend to generalize reasonably well anyway.

The learning rate itself interacts with this: constant learning rates are rarely optimal, which is why learning rate schedules exist. See [Optimization Theory](/topic/optmization-theory) for the deeper theory behind convexity and saddle points.

## Further reading

The general method of steepest descent is attributed to Augustin-Louis Cauchy (1847), applying it to solving systems of equations well before it had any connection to machine learning. The stochastic version has its own separate origin: Herbert Robbins and Sutton Monro's 1951 paper "*A Stochastic Approximation Method* " formalized the theory behind updating estimates from noisy, sequentially-arriving samples — the mathematical foundation SGD is built on.

