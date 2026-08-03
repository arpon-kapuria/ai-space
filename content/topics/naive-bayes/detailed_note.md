# Naive Bayes

## Motivation

Everything covered so far — linear regression, logistic regression, kNN — tries to directly learn a boundary or a function that separates classes. Naive Bayes comes from a different direction entirely: model how the data was probably generated for each class, then use Bayes' theorem to flip that around and ask "given this input, which class was most likely to have generated it?" It's a genuinely different way of framing classification, and it stays fast and simple even on high-dimensional data.

## Bayes' theorem, applied to classification

For a class $y$ and features $\mathbf{x}$, Bayes' theorem gives:

$$
P(y \mid \mathbf{x}) = \frac{P(\mathbf{x} \mid y)\, P(y)}{P(\mathbf{x})}
$$

You pick whichever class maximizes $P(y \mid \mathbf{x})$. Since $P(\mathbf{x})$ doesn't depend on $y$, you can ignore it and just compare $P(\mathbf{x} \mid y)\, P(y)$ across classes.

The problem is that $P(\mathbf{x} \mid y)$ — the probability of seeing this *exact combination* of features given the class — is hard to estimate directly. With many features, you'd need an enormous amount of data to see every combination enough times to estimate it reliably.

## The "naive" assumption

Naive Bayes solves this by assuming the features are conditionally independent given the class — that is, once you know the class, each feature contributes to the probability on its own, with no interaction between them. This is what makes it "naive": in real data, features are almost never actually independent. Word choice in a sentence depends on other word choice; a person's income and education level are correlated. The assumption is wrong.

It works anyway, more often than you'd expect. Even when the independence assumption is false, the classifier only needs to rank the classes correctly, not estimate the exact probabilities — and that ranking often comes out right even with a flawed probability estimate underneath it.

<details>
<summary>Math: the independence assumption and the decision rule</summary>

Under conditional independence, the joint likelihood factorizes into a product of per-feature likelihoods:

$$
P(\mathbf{x} \mid y) = \prod_{j=1}^{d} P(x_j \mid y)
$$

so the classifier predicts

$$
\hat{y} = \arg\max_{y} \; P(y) \prod_{j=1}^{d} P(x_j \mid y)
$$

Each $P(x_j \mid y)$ is estimated separately from the training data, which needs far less data than estimating the full joint distribution directly.

</details>

## Choosing the right variant

The exact form of $P(x_j \mid y)$ depends on what your features look like:

- **Gaussian Naive Bayes** assumes each feature is normally distributed within each class — used for continuous features.
- **Multinomial Naive Bayes** assumes features are counts — the classic choice for text classification, where features are word counts.
- **Bernoulli Naive Bayes** assumes features are binary (present or absent) — used when you only care whether a word appears, not how many times.

## Where it's actually used

Naive Bayes is fast to train, fast to predict, and needs relatively little data to get reasonable estimates. It was, and still is, a strong baseline for spam filtering and text classification generally, where features are word counts across a huge vocabulary — exactly the setting where the independence assumption is most obviously wrong, and the classifier still performs well.

## Further reading

Bayes' theorem itself comes from Thomas Bayes, published posthumously in 1763. The naive independence-assumption classifier built on it doesn't trace to one specific paper — it's a natural, old application of the theorem that shows up across pattern recognition and text classification literature from the 1960s onward, well before "Naive Bayes" became the standard name for it.