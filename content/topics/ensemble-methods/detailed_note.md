# Ensemble Methods

## Motivation

A single [decision tree](/topic/decision-tree), left unconstrained, overfits — it's a textbook high-variance model, and small changes in the training data can produce a very different tree. Rather than fixing this by limiting the tree, ensemble methods take a different approach: keep the trees flexible, but combine many of them so their individual mistakes cancel out. There are two genuinely different ways to do this, aimed at fixing two different problems — bagging targets variance, boosting targets bias — and it's worth keeping that distinction clear, since it's a common interview question on its own.

## Bagging

Short for **bootstrap aggregating**. Take the training set, draw many random samples from it *with replacement* (this is bootstrapping — each sample is the same size as the original, but contains duplicates and misses some points), train a separate model on each sample, and combine their predictions by averaging (regression) or majority vote (classification).

This works because averaging many independent, noisy estimators reduces variance without increasing bias — as long as the models are reasonably independent of each other. That's why bagging helps a lot with high-variance models like unpruned decision trees, and does almost nothing for a low-variance model like plain linear regression, which doesn't have much variance to cancel out in the first place.

## Random Forest

Random Forest is bagging applied specifically to decision trees, plus one more trick. Bagged trees alone tend to still look fairly similar to each other, because a few strong features usually get picked for the top splits in almost every tree — the trees end up correlated, which weakens the variance-reduction benefit of averaging. Random Forest fixes this by adding a second source of randomness: at every split, only a random subset of features is even considered, not all of them.

This forces different trees to rely on different features, which decorrelates them further. Averaging predictions from decorrelated trees reduces variance more effectively than averaging correlated ones — the same amount of individual noise, but less of it is shared across trees, so less of it survives the average.

## Boosting (AdaBoost, Gradient Boosting)

Boosting takes the opposite strategy from bagging. Instead of training many independent models in parallel and averaging them, it trains models **sequentially**, and each new model is built specifically to fix what the current ensemble is still getting wrong. Where bagging reduces variance, boosting reduces bias — it's aimed at ensembles built from weak, high-bias models (often very shallow trees, sometimes just a single split) that get progressively better as more of them are added.

**AdaBoost** does this by reweighting the training data after each round: examples the current ensemble got wrong are given more weight, so the next weak learner is forced to pay more attention to them. Each weak learner's vote in the final ensemble is itself weighted by how accurate it was.

**Gradient Boosting** generalizes the same idea using calculus instead of reweighting. Each new model is trained to predict the *residual error* of the current ensemble — in effect, taking a step in the direction that most reduces the loss, the same way gradient descent takes a step in parameter space, except here each "step" is an entire new decision tree added to the ensemble.

<details>
<summary>Math: bootstrap sampling and boosting</summary>

For a bootstrap sample of size $n$ drawn with replacement from a training set of size $n$, the probability that any single point is *not* selected in one draw is $(1 - \frac{1}{n})$, so the probability it's never selected across all $n$ draws is $(1 - \frac{1}{n})^n$. As $n \to \infty$, this converges to $\frac{1}{e} \approx 0.368$ — meaning each bootstrap sample contains, on average, only about 63.2% of the unique original data points.

Gradient boosting, more formally: given current ensemble $F_{m-1}(x)$, fit the next model $h_m$ to approximate the negative gradient of the loss with respect to the current predictions,

$$
h_m \approx -\left.\frac{\partial \mathcal{L}(y, F(x))}{\partial F(x)}\right|_{F = F_{m-1}}
$$

and update $F_m(x) = F_{m-1}(x) + \eta \, h_m(x)$, where $\eta$ is a shrinkage/learning rate controlling how much each new tree contributes.

</details>

## XGBoost / LightGBM

These are modern, heavily engineered implementations of gradient boosting, not new algorithms in the conceptual sense — the "gradient boosting" idea above is what they're both built on.

**XGBoost** adds an explicit regularization term directly into the objective (penalizing tree complexity — depth and leaf weights — rather than relying only on shrinkage), uses a second-order Taylor approximation of the loss for more accurate updates, and is engineered heavily for speed: approximate, histogram-based split finding and parallelized computation of the best split at each node (the trees themselves are still built sequentially — boosting is inherently sequential — but finding each split is parallelized).

**LightGBM** pushes the speed and memory optimizations further. It buckets continuous features into discrete histogram bins by default, which speeds up split-finding significantly, and it grows trees **leaf-wise** (always splitting whichever leaf reduces loss the most) instead of **level-wise** (XGBoost's traditional default, splitting every leaf at the current depth before going deeper). Leaf-wise growth tends to reach a lower loss faster, but it can overfit more easily on smaller datasets if depth isn't constrained. LightGBM also introduces two specific optimizations worth knowing by name if you claim experience with it: **GOSS** (Gradient-based One-Side Sampling), which keeps most high-gradient examples but subsamples the well-fit ones to speed up training, and **EFB** (Exclusive Feature Bundling), which merges sparse, mutually exclusive features together to reduce the effective feature count.

## Further reading

Bagging was introduced by Leo Breiman in "*Bagging Predictors* " (1996), and Random Forest by the same author in "*Random Forests* " (2001). AdaBoost comes from Yoav Freund and Robert Schapire's "*A Decision-Theoretic Generalization of On-Line Learning and an Application to Boosting* " (1997). The general gradient boosting framework was formalized by Jerome Friedman in "*Greedy Function Approximation: A Gradient Boosting Machine* " (2001). XGBoost is described in Tianqi Chen and Carlos Guestrin's "*XGBoost: A Scalable Tree Boosting System* " (2016), and LightGBM in Guolin Ke et al.'s "*LightGBM: A Highly Efficient Gradient Boosting Decision Tree* " (2017).