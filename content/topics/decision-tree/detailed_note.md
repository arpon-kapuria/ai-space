# Decision Tree

## Motivation

Linear and logistic regression can only draw a straight decision boundary — one line separating classes. A lot of real decisions don't look like that. "Approve the loan if income is over $50k, unless age is under 25 and credit history is short" is a chain of simple yes/no questions, not a straight line. A decision tree learns exactly that kind of rule automatically from data, instead of having a person write it by hand.

## A simple example

Say you're predicting whether someone will play tennis today, based on the weather. A decision tree for this might look like:

- Is it **sunny, overcast, or rainy**?
  - If **overcast** → play tennis (always, in this example).
  - If **sunny** → check humidity. High humidity → don't play. Normal humidity → play.
  - If **rainy** → check wind. Windy → don't play. Not windy → play.

That's it. That's the whole idea. A tree is a sequence of questions, and where you end up after answering them all is the prediction.

## How a tree makes a prediction

Once a tree is built, using it is simple: start at the top (the **root**), answer the question there, follow the branch that matches your answer, and repeat at the next question. You stop when you reach a **leaf** — a node with no more questions — and the leaf's stored value is the prediction.

## How a tree is built

Training a tree means figuring out which questions to ask, and in what order, from the data alone. The algorithm works top-down:

1. Start with all the training data at the root.
2. Try every possible question you could ask (every feature, every possible threshold) and see which one splits the data into the "purest" groups — groups that are mostly one class, rather than a mix.
3. Pick the question that gives the purest split, and split the data into branches based on the answer.
4. Repeat the same process separately on each branch, splitting further, until you hit a stopping point.

The key word is **purity**. A group where every example has the same label is perfectly pure — there's nothing left to figure out. A group that's an even mix of classes is as impure as it gets. The tree is greedily chasing purity, one question at a time.

## Measuring purity: Gini and Entropy

Say you have a group of 10 examples: 6 will play tennis, 4 won't. How "impure" is that group? There are two standard ways to put a number on it.

**Gini impurity** asks: if you picked a random example from this group and guessed its label randomly (matching the group's own proportions), how often would you be wrong?

$$
\text{Gini} = 1 - \sum_{i} p_i^2
$$

For our group: $p_{\text{yes}} = 0.6$, $p_{\text{no}} = 0.4$, so $\text{Gini} = 1 - (0.6^2 + 0.4^2) = 1 - 0.52 = 0.48$.

**Entropy** comes from information theory and measures uncertainty instead — how surprised you'd be, on average, to learn one example's true label.

$$
\text{Entropy} = -\sum_{i} p_i \log_2 p_i
$$

For the same group: $\text{Entropy} = -(0.6 \log_2 0.6 + 0.4 \log_2 0.4) \approx 0.97$.

Both are 0 for a perfectly pure group (all one class) and both peak at a 50/50 split. They almost always agree on which split is best — Gini is just slightly cheaper to compute, since it skips the logarithm.

**Information gain** measures how much purity improves after a split — the impurity of the group before, minus the weighted average impurity of the groups after. Decision tree algorithms differ mainly in the criterion they optimize here. **ID3** chooses the split with the highest information gain (using entropy), **C4.5** improves on this with **gain ratio** to avoid favoring features with many distinct values, while **CART** typically uses **Gini impurity** instead. Most modern machine learning libraries implement CART.

<details>
<summary>Math: information gain, written out</summary>

For a parent group $D$ split into children $D_1, D_2$:

$$
\text{Information Gain} = \text{Impurity}(D) - \left(\frac{|D_1|}{|D|}\text{Impurity}(D_1) + \frac{|D_2|}{|D|}\text{Impurity}(D_2)\right)
$$

using either Gini or entropy as the impurity measure. This is computed for every candidate split at every node, and the tree keeps whichever split maximizes it — a greedy choice, made one node at a time, with no lookahead to check if a different split now would lead to a better tree overall.

</details>

## Splitting continuous features

For a numeric feature like age or income, the tree doesn't try every possible number — it sorts the training values and tests thresholds between consecutive values (age ≤ 25 vs. age > 25, for example), picking whichever threshold gives the best split. For a categorical feature like "outlook" in the tennis example, it can split directly on the category values. Historically, algorithms such as **ID3** and **C4.5** allow multi-way splits (one branch per category), whereas **CART** always produces binary splits, even for categorical features.

## Stopping and pruning

Left alone, a tree will keep splitting until every leaf is perfectly pure — often meaning one training example per leaf. That's not a good tree; it's memorized the training data. There are two ways to stop that:

**Pre-pruning (early stopping)** — stop growing the tree before it gets that deep, using simple rules: a maximum depth, a minimum number of samples required to split a node, or a minimum number of samples allowed in a leaf. Simple and fast, but you're guessing at the right limits in advance.

**Post-pruning** — grow the full tree first, then cut branches back afterward if removing them doesn't hurt performance on held-out data. This tends to work better in practice, since it makes the decision using real evidence about generalization rather than a fixed rule chosen upfront. ...**CART** (Classification and Regression Trees—the algorithm implemented by most modern ML libraries) uses a version of this called **cost-complexity pruning**, which adds a penalty for tree size—similar in spirit to how [regularization](/topic/regularization) penalizes large weights.

## Regression trees

Everything so far assumed classification, but trees work for regression too, with two small changes. Instead of Gini or entropy, the split is chosen to minimize variance (equivalently, MSE) within each resulting group — you're looking for splits that group similar numeric values together, not similar classes. And instead of a majority vote, each leaf predicts the **average** of the training targets that landed there.

## Why it overfits

A tree grown without limits fits the training data almost perfectly — and that's exactly the problem. It's a textbook high-variance model: change the training data slightly, and you can get a noticeably different tree. This is the direct link to the [Bias-Variance Tradeoff](/topic/bias-variance-tradeoff). Pruning helps, but the more common and more effective fix is to stop relying on a single tree altogether and combine many of them — which is exactly what [Ensemble Methods](/topic/ensemble-methods) does.

## Strengths and weaknesses

**Strengths**: easy to read and explain (you can literally draw the questions), works on numeric and categorical features without scaling or preprocessing, and naturally captures non-linear relationships and interactions between features — something linear models can't do without manual feature engineering.

**Weaknesses**: unstable — small changes in training data can produce a very different tree. Greedy — the algorithm never looks ahead, so it can lock in a split that seems good now but leads to a worse tree overall; finding the provably best possible tree is computationally intractable, so every real algorithm settles for this greedy approximation. And when using information gain specifically, the algorithm can be biased toward features with many possible values (they offer more ways to split, which mechanically tends to produce higher information gain even when the feature isn't actually more useful) — this is part of why C4.5, the successor to ID3, introduced gain ratio to correct for it.

## Further reading

The two classic algorithms are ID3, introduced by Ross Quinlan in "Induction of Decision Trees" (1986) — the source of the classic play-tennis example used above — and its successor C4.5, described in Quinlan's 1993 book of the same name. CART (Classification and Regression Trees), introduced by Leo Breiman, Jerome Friedman, Richard Olshen, and Charles Stone in their 1984 book, is the Gini-based approach most modern libraries implement by default.

## Practice

- [`Decision Tree Learning`](https://www.deep-ml.com/problems/20)
- [`Find the Best Gini-Based Split for a Binary Decision Tree`](https://www.deep-ml.com/problems/138)
- [`Implement Decision Tree for Regression`](https://www.deep-ml.com/problems/286)
- [`Decision Tree Pruning with Cost-Complexity`](https://www.deep-ml.com/problems/285)