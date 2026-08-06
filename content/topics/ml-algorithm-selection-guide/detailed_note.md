# ML Algorithm Selection Guide

## Motivation

[ML Pipeline](/topic/ml-pipeline)'s model selection step says to "start with a simple baseline" — but simple relative to what, and chosen how? In practice, the answer isn't "whichever algorithm you know best." It's a handful of questions about the *problem* — its type, its size, what it needs to explain, how fast it needs to run — that narrow the field before you've trained a single model. This note is that narrowing process, written out as a guide rather than a single algorithm's derivation, so it's worth reading alongside the individual algorithm topics rather than instead of them.

## Start With the Problem Type

Before anything else, [Learning Paradigms](/topic/learning-paradigms) splits the field in two: do you have labeled data to learn from ([Supervised Learning](/topic/supervised-learning)), or are you looking for structure in unlabeled data ([Unsupervised Learning](/topic/unsupervised-learning))? Within supervised learning, is the target a category (**classification**) or a continuous number (**regression**)? This one question — often answered back in [ML Pipeline](/topic/ml-pipeline)'s problem-framing step — eliminates most of the algorithm list immediately.

## Classification Algorithms

| Algorithm | Interpretable? | Handles Non-Linearity? | Needs Feature Scaling? | Dataset Size | Scales to Large Data? | Good First Baseline? |
|---|---|---|---|---|---|---|
| [Logistic Regression](/topic/logistic-regression) | Yes | No | Yes | Any | Yes | **Yes — default starting point** |
| [K-Nearest Neighbors](/topic/k-nearest-neighbors) | Somewhat | Yes | Yes | Small | No (slow at inference) | Small datasets only |
| [Naive Bayes](/topic/naive-bayes) | Yes | No (assumes independence) | No | Any | Yes | Yes, especially for text |
| [Decision Tree](/topic/decision-tree) | Yes | Yes | No | Any | Yes | Yes, if interpretability matters |
| [Support Vector Machines](/topic/support-vector-machines) | No (with kernels) | Yes (via kernel trick) | Yes | Small–Medium | No (slow past ~100k rows) | No — tune after a baseline |
| [Ensemble Methods](/topic/ensemble-methods) (Random Forest, Boosting) | No | Yes | No | Medium–Large | Yes | **Best accuracy, second baseline** |

The practical pattern most people converge on: **logistic regression first** (fast, interpretable, tells you if the problem is even learnable), then an **ensemble method** (usually gradient-boosted trees) once you need more accuracy than the linear baseline gives you.

## Regression Algorithms

The same shape repeats for continuous targets:

| Algorithm | Interpretable? | Handles Non-Linearity? | Needs Feature Scaling? | Dataset Size | Good First Baseline? |
|---|---|---|---|---|---|
| [Linear Regression](/topic/linear-regression) | Yes | No | Yes | Any | **Yes — default starting point** |
| Decision Tree Regressor | Yes | Yes | No | Any | Yes |
| KNN Regressor | Somewhat | Yes | Yes | Small | Small datasets only |
| SVR (SVM for regression) | No | Yes (via kernel) | Yes | Small–Medium | No — tune after a baseline |
| Ensemble Regressors (Random Forest, Boosting) | No | Yes | No | Medium–Large | **Best accuracy, second baseline** |

The same two-stage pattern applies: start with [Linear Regression](/topic/linear-regression) as the cheap sanity check, move to an ensemble regressor once the linear baseline's error is too high to accept.

## Unsupervised Algorithms: Clustering & Dimensionality Reduction

Without labels, the question shifts from "which category" to "what structure is even here":

- **Clustering** groups similar points together. K-Means is the default first try — fast, and works well when clusters are roughly round and evenly sized. Hierarchical clustering trades speed for not having to pick the number of clusters upfront. DBSCAN handles irregularly shaped clusters and naturally flags outliers as noise, at the cost of being more sensitive to its parameters.
- **Dimensionality reduction** compresses many features into fewer, either to fight the curse of dimensionality before modeling or to visualize high-dimensional data. PCA is the standard first choice — fast, and the components it produces have a clean mathematical interpretation (directions of maximum variance). t-SNE and UMAP are usually reached for specifically *for visualization*, not as a preprocessing step before another model, since the low-dimensional distances they produce aren't as directly meaningful as PCA's.

See [Clustering](/topic/clustering) and [Dimensionality Reduction](/topic/dimensionality-reduction) for the algorithms themselves in depth.

## The Factors That Actually Decide It

Beyond problem type, five practical constraints do most of the narrowing:

- **Dataset size** — KNN and kernel SVMs get slow fast as data grows, since both compare a new point against many (or all) training points. Linear models and tree ensembles scale far better to large data.
- **Interpretability** — if a decision needs to be explained (a loan denial, a medical flag), logistic/linear regression and single decision trees give you a reason for each prediction. Ensembles, SVMs, and KNN are much harder to explain, even when they're more accurate.
- **Feature scaling sensitivity** — distance-based and gradient-based methods (KNN, SVM, logistic/linear regression) need features on comparable scales, or the ones with larger raw ranges dominate. Tree-based methods (decision trees, ensembles) split on thresholds per feature independently, so scale doesn't matter to them at all.
- **Linearity of the true relationship** — if the relationship between features and target is genuinely close to linear, a linear/logistic model will already do well and a more complex model mostly adds variance for no real gain. If it's not, linear models underfit no matter how much data you throw at them (recall [Bias-Variance Tradeoff](/topic/bias-variance-tradeoff)).
- **Latency constraints** — this is the `latency_ms` constraint from [ML Pipeline](/topic/ml-pipeline)'s problem-framing step made concrete. Linear/logistic regression and single decision trees predict almost instantly; large ensembles and kernel SVMs cost more per prediction; KNN is often the slowest at inference time since it does its real work (searching for neighbors) at prediction time, not training time.

## A Typical Progression, Depending on What Matters

![Decision Progression](/content/topics/ml-algorithm-selection-guide/image.png)

There's no single ladder everyone climbs — which path makes sense depends on which factor from Section 5 dominates. A few common ones:

- **Interpretability matters, relationship looks linear:**

$$
\text{Logistic/Linear Regression} \rightarrow \text{stop here unless the metric demands more}
$$

If the baseline already clears the success metric from problem framing, moving further trades away the one thing you actually needed.

- **Interpretability matters, but the relationship is clearly non-linear:**

$$
\text{Logistic/Linear Regression (baseline)} \rightarrow \text{Decision Tree}
$$

A single tree keeps a readable decision path (and feature importances) while capturing non-linear splits the linear model can't.

- **Accuracy matters more than interpretability, data is medium-to-large:**

$$
\text{Logistic/Linear Regression (baseline)} \rightarrow \text{Ensemble Methods (Random Forest} \rightarrow \text{Gradient Boosting)}
$$

This is the most common path in practice — start linear to sanity-check the problem is learnable, then move to boosted trees for the accuracy ceiling.

- **Small dataset, non-linear, accuracy over interpretability:**

$$
\text{Logistic/Linear Regression (baseline)} \rightarrow \text{SVM (kernel) or KNN}
$$

Both need the data to stay small to remain practical, which is exactly the regime where ensembles have too little data to build many diverse trees and a kernel method's cost is still affordable.

- **Unsupervised — clustering:**

$$
\text{K-Means} \rightarrow \text{DBSCAN (irregular cluster shapes, outliers)} \rightarrow \text{Hierarchical (don't want to fix \emph{k} upfront)}
$$

- **Unsupervised — dimensionality reduction:**

$$
\text{PCA (preprocessing or a first look)} \rightarrow \text{UMAP/t-SNE (visualization only)}
$$

## 7. When to Stop at the Baseline

Not every problem needs an ensemble. If the linear or logistic baseline already hits the success metric from problem framing, and interpretability or latency matter, that baseline *is* the right answer — reaching for a more complex model that buys a small accuracy gain at the cost of both interpretability and speed is a bad trade unless the metric genuinely demands it. The decision to move past a baseline should be driven by the evaluation numbers in [ML Pipeline](/topic/ml-pipeline)'s evaluation step, not by habit.

## Further reading

Scikit-learn's own [Choosing the right estimator](https://sklearn.org/stable/machine_learning_map.html) flowchart is built around exactly this decision process and is worth having open side-by-side with this guide. For the underlying theory behind why simpler models generalize better when they're not clearly underfitting — the statistical justification for starting with a baseline at all — James, Witten, Hastie, and Tibshirani's *An Introduction to Statistical Learning* is the standard reference.