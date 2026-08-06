# Loss Functions

## Motivation

[Gradient Descent](/topic/gradient-descent) tells you *how* to minimize a loss — take steps opposite the gradient until it stops improving. It says nothing about *what* that loss should be. That's the other half of the picture: the loss function is the actual definition of "wrong" that training optimizes against, and picking the wrong one for your problem quietly caps how well the model can ever perform, no matter how good the optimizer or the tuning is.

A distinction worth locking in early, because it comes up constantly in interviews: a **loss function** is not the same as an **evaluation metric**. A loss has to be differentiable, since gradient descent needs a gradient to follow, and it's optimized *during* training. A metric like accuracy or recall (see [Evaluation Metrics](/topic/evaluation-metrics)) is what you actually report at the end, and doesn't need to be differentiable at all — which is exactly why you often optimize one thing (log loss) while reporting another (F1).

## Before we look at the formulas

A couple of ideas carry through every loss below:

- **Prediction ($\hat{y}$) vs. ground truth ($y$)** — every loss is some function of the gap between what the model predicted and what was actually true. The differences below are really just differences in *how* that gap gets measured.
- **The loss is averaged over the batch** — each formula below is written for a single example, then averaged over $n$ examples the same way [Gradient Descent](/topic/gradient-descent) averages the gradient itself.
- **Regression vs. classification** need fundamentally different losses, because "how wrong" means something different for a continuous number than for a category — that split is the first thing to get right before picking a specific formula.

## Regression Losses: MSE, RMSE, MAE, Huber

**Mean Squared Error (MSE)** is the default regression loss — the average squared gap between prediction and truth:

$$
\text{MSE} = \frac{1}{n}\sum_{i=1}^n (y_i - \hat{y}_i)^2
$$

Squaring means large errors are punished disproportionately more than small ones, which is exactly the problem when your data has outliers — a handful of extreme points can dominate the whole loss.

**RMSE** is just $\sqrt{\text{MSE}}$. It's rarely used as the training loss itself, but it's reported constantly, because it puts the error back into the target's original units — "off by $12,000" is easier to reason about than "off by 144,000,000 dollars-squared."

**MAE (Mean Absolute Error)** penalizes every error linearly instead of quadratically:

$$
\text{MAE} = \frac{1}{n}\sum_{i=1}^n |y_i - \hat{y}_i|
$$

That linearity makes MAE naturally robust to outliers — one huge miss doesn't dominate the loss the way it does under MSE. The tradeoff: MAE isn't differentiable exactly at zero error, which is a small but real annoyance for gradient-based optimizers.

**Huber Loss** is the practical compromise: quadratic (MSE-like) for small errors, linear (MAE-like) for large ones, switching over at a threshold $\delta$. It gets MAE's outlier-robustness while staying smooth everywhere, unlike plain MAE.

<details>
<summary>Math: Huber loss and how the gradients compare</summary>

With residual $a = y - \hat{y}$:

$$
\ell_\delta(a) =
\begin{cases}
\frac{1}{2}a^2 & |a| \le \delta \\[4pt]
\delta\left(|a| - \frac{1}{2}\delta\right) & |a| > \delta
\end{cases}
$$

The two pieces are built to meet smoothly at $a = \delta$ — same value, same slope — which is what keeps Huber differentiable everywhere, unlike MAE's sharp kink at zero.

The gradient difference explains the outlier behavior directly: MSE's gradient is $-\frac{2}{n}(y_i - \hat{y}_i)$, proportional to the error itself, so one huge residual produces one huge push on the weights. MAE's gradient is a constant $-\frac{1}{n}\,\text{sign}(y_i - \hat{y}_i)$ — a residual of 2 and a residual of 200 push equally hard. Huber blends the two: proportional-to-error near zero, constant-magnitude far from it.

</details>

## Classification Losses: Binary vs. Categorical Cross-Entropy

**Binary Cross-Entropy (BCE)**, also called log loss, is the standard loss for two-class problems:

$$
\text{BCE} = -\frac{1}{n}\sum_{i=1}^n \Big[y_i \log(p_i) + (1 - y_i)\log(1 - p_i)\Big]
$$

Where $p_i$ is the model's predicted probability that the example belongs to the positive class. It penalizes a confident wrong prediction far more than an unconfident one — a much sharper training signal than accuracy.

**Categorical Cross-Entropy (CCE)** extends this to multi-class problems, comparing a one-hot true label against a softmax probability distribution over all $C$ classes:

$$
\text{CCE} = -\frac{1}{n}\sum_{i=1}^n \sum_{c=1}^C y_{i,c}\log(p_{i,c})
$$

In practice both are computed from raw model outputs (**logits**) rather than post-sigmoid/softmax probabilities — combining the sigmoid/softmax and the log into one numerically stable step avoids ever computing $\log(0)$ on a saturated probability, a real failure mode otherwise.

<details>
<summary>Math: the logit-gradient simplification</summary>

Despite looking different, BCE and CCE share the same clean gradient with respect to the *logit* $z$ (not the probability) — the reason frameworks compute loss straight from logits:

$$
\frac{\partial \,\text{loss}}{\partial z_i} = p_i - y_i
$$

"Predicted probability minus true label." The more confidently wrong the prediction, the bigger this gap, and the bigger the update — a very common interview question in its own right.

</details>

## Margin-Based: Hinge Loss

**Hinge loss** is the loss behind Support Vector Machines. Unlike cross-entropy, it doesn't just want the prediction on the correct side of the decision boundary — it wants it correct *with a margin*, and stops penalizing once that margin is satisfied:

$$
\ell(y, f(x)) = \max\big(0,\ 1 - y \cdot f(x)\big)
$$

Where $y \in \{-1, +1\}$ is the true label and $f(x)$ is the raw model score. If $y \cdot f(x) \ge 1$ — correct, and past the margin — the loss is exactly $0$, and that point stops contributing to training entirely. A smoother variant, **squared hinge**, uses $\max(0, 1 - y f(x))^2$, which penalizes larger violations more aggressively and is differentiable at the margin boundary.

## Comparing Distributions: KL Divergence

**KL Divergence** measures how one probability distribution $Q$ diverges from a reference distribution $P$:

$$
D_{KL}(P \parallel Q) = \sum_{x} P(x) \log\frac{P(x)}{Q(x)}
$$

It isn't symmetric — $D_{KL}(P \parallel Q) \ne D_{KL}(Q \parallel P)$ — so it matters which distribution you treat as the reference. It shows up less as a direct classifier loss and more wherever the model's whole *output* is a distribution: [Variational Autoencoders](/topic/vae) use it to keep a learned latent distribution close to a standard normal, and knowledge distillation uses it to train a small model to match a large one's full output, not just its final label.

<details>
<summary>Math: why cross-entropy and KL divergence are basically the same objective</summary>

Cross-entropy decomposes as:

$$
H(P, Q) = H(P) + D_{KL}(P \parallel Q)
$$

where $H(P)$ is the entropy of the true distribution — fixed, and independent of the model's parameters. Since $H(P)$ doesn't move during training, minimizing cross-entropy is mathematically equivalent to minimizing $D_{KL}(P \parallel Q)$ — which is *why* cross-entropy works as a classification loss in the first place.

</details>

## Loss vs. Objective: Where Regularization Fits

What gradient descent actually minimizes is usually not the raw loss by itself, but an **objective function** — the loss plus a regularization penalty:

$$
J(\theta) = \mathcal{L}(\theta) + \lambda \cdot R(\theta)
$$

Where $R(\theta)$ is typically the L1 norm ($\sum_j|\theta_j|$, encourages sparsity — some weights go exactly to zero) or the L2 norm ($\sum_j\theta_j^2$, shrinks all weights smoothly), and $\lambda$ controls how much the penalty matters relative to fitting the data. This is precisely how [Regularization](/topic/regularization) fights overfitting: a model can always lower the *loss* by growing large, complex weights that memorize training noise, but the *objective* punishes it for doing so — the mechanism behind the [Bias-Variance Tradeoff](/topic/bias-variance-tradeoff). This is what makes "why does L2 regularization reduce overfitting" answerable from first principles rather than memorized.

## Losses You'll Meet in Production
 
The core losses above cover most textbook problems, but a few production-standard variants build directly on top of them:
 
- **Focal Loss** down-weights examples the model already classifies confidently, so training keeps focusing on the hard ones — the standard fix for severe class imbalance (fraud detection, rare-disease screening) once plain class weighting isn't enough.
- **Triplet Loss** trains embeddings rather than labels: given an anchor, a similar example, and a dissimilar one, it pushes the similar pair closer together and the dissimilar pair farther apart by at least a margin. This is what powers face recognition, semantic search, and RAG retrieval.
- **Contrastive Loss** is the simpler, older sibling of triplet loss: instead of an anchor-positive-negative triplet, it works on a single pair at a time, labeled either "similar" or "dissimilar," and pushes similar pairs together while pushing dissimilar pairs apart past a margin. Triplet loss tends to learn a better-structured embedding space (it directly compares relative distances), but contrastive loss is simpler to set up when you only have pairwise similarity labels rather than a clean triplet structure.
- **Label Smoothing** softens a one-hot target slightly toward a uniform distribution, which keeps a classifier from becoming overconfident, at almost no extra cost.
  
<details>
<summary>Math: Focal Loss, Triplet Loss, Contrastive Loss, Label Smoothing</summary>

$$
FL(p_t) = -(1 - p_t)^{\gamma}\log(p_t)
$$
 
$(1-p_t)^\gamma$ shrinks toward zero as the model's confidence $p_t$ on the true class grows — well-classified examples contribute almost nothing, no matter how many of them there are.
 
$$
\mathcal{L}_{\text{triplet}} = \max\Big(0,\ d(a, p) - d(a, n) + \text{margin}\Big)
$$
 
Zero once the negative $n$ is farther from the anchor $a$ than the positive $p$ by at least the margin; otherwise it pushes the embeddings apart.
 
$$
\mathcal{L}_{\text{contrastive}} =
\begin{cases}
d(x_1, x_2)^2 & \text{similar pair} \\[4pt]
\max(0,\ \text{margin} - d(x_1, x_2))^2 & \text{dissimilar pair}
\end{cases}
$$
 
Similar pairs are pulled together with no floor on how close; dissimilar pairs are only pushed apart until they clear the margin, after which the loss is zero.
 
$$
y_k' = y_k(1 - \varepsilon) + \frac{\varepsilon}{K}
$$
 
At $\varepsilon = 0$ this is just the original one-hot target; larger $\varepsilon$ pulls it toward a uniform distribution over all $K$ classes.
 
</details>

## Picking the right one
 
| Problem Type | Go-To Loss | Reach for Instead When |
|---|---|---|
| Regression | MSE | Outliers present → Huber; want simple + robust → MAE |
| Binary classification | Binary Cross-Entropy | Severe class imbalance → Focal Loss |
| Multi-class classification | Categorical Cross-Entropy | Want less overconfidence → add Label Smoothing |
| Max-margin classification | Hinge Loss | Want a smoother penalty → Squared Hinge |
| Embedding / similarity learning | Triplet Loss | Only pairwise labels, no triplet structure → Contrastive Loss |
| Matching a full output distribution | KL Divergence | — |
 
There's no universal best loss — the right choice comes straight from the problem type set in [ML Pipeline](/topic/ml-pipeline)'s problem-framing step, and it's rarely used alone: a regularization penalty usually rides along with it. Getting this choice wrong doesn't throw an error — it just quietly trains the model toward the wrong target.

## Further reading

Huber's original 1964 paper, *Robust Estimation of a Location Parameter*, is where Huber loss comes from, and Kullback and Leibler's 1951 paper, *On Information and Sufficiency*, is the origin of KL divergence. On the production side, Lin et al.'s *Focal Loss for Dense Object Detection* (2017) and Schroff et al.'s *FaceNet* (2015) are the papers behind Focal and Triplet loss respectively.