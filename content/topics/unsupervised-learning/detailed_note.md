# Unsupervised Learning

## Motivation

Labeled data is the expensive, slow part of most ML pipelines — someone has to sit down and tag every example, and for a lot of real problems that's simply not feasible at the scale you'd want. Meanwhile raw, unlabeled data is often sitting around in abundance: every log file, every image on the internet, every sentence ever written. Supervised learning has no way to use any of that — no label, no training signal. Unsupervised learning exists to answer a different, more modest question: what can you learn about data's structure using nothing but the data itself?

## What "structure" means here

There's no ground truth to check your answer against, which makes this a genuinely different kind of problem from supervised learning, not just a version of it with the labels removed. Without labels, "correct" has to be redefined in terms of some internal criterion — how tightly grouped are similar points, how well does a simpler representation preserve the original data, how likely is this data under an estimated probability distribution. A few recurring goals show up across almost all unsupervised methods:

- **Clustering** — partition the data into groups such that points within a group are more similar to each other than to points in other groups. Covered in depth in [Clustering](/topic/clustering).
- **Dimensionality reduction** — find a lower-dimensional representation that keeps what matters about the data and discards the rest. Covered in [Dimensionality Reduction](/topic/dimensionality-reduction).
- **Density estimation** — model the probability distribution the data was drawn from, so you can ask "how likely is this point" or generate new samples that look like it.

These aren't mutually exclusive (two or more events can not occur at the same time) — PCA, for instance, is dimensionality reduction, but it's also implicitly finding the directions of highest variance, which is a kind of structure discovery in its own right.

<details>
<summary>Math: framing unsupervised learning</summary>

Given only $\{x_i\}_{i=1}^n$ drawn i.i.d. from an unknown distribution $P(X)$, unsupervised learning seeks some function of the data that reveals structure in $P(X)$ itself, rather than a mapping to a separate label space $Y$.

Clustering, as one instance: partition $\{x_i\}$ into $k$ groups by finding assignments $c_i \in \{1, \dots, k\}$ that minimize within-cluster variance,

$$
\min_{c} \sum_{j=1}^{k} \sum_{i : c_i = j} \lVert x_i - \mu_j \rVert^2
$$

where $\mu_j$ is the mean of the points assigned to cluster $j$. This is exactly the objective k-means optimizes.

</details>

## Why this matters beyond "no labels available"

Unsupervised techniques aren't only a fallback for when you can't label data — they're also a standard first step in exploratory analysis (what does this dataset actually look like before I build anything), a way to compress features before feeding them to a supervised model, and the conceptual ancestor of [Self-Supervised Learning](/topic/self-supervised-learning), which manufactures its own labels from structure the way unsupervised methods look for structure directly.

## Further reading

Like supervised learning, this isn't traceable to one founding paper — clustering and density estimation both have roots in classical statistics well before "unsupervised learning" was common ML terminology. Hastie, Tibshirani, and Friedman's [The Elements of Statistical Learning](https://www.sas.upenn.edu/~fdiebold/NoHesitations/BookAdvanced.pdf) (2001) is the standard reference most people cite for a rigorous treatment of the classical methods (k-means, hierarchical clustering, PCA) covered here.