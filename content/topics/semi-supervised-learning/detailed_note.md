# Semi-Supervised Learning

## Motivation

Pure supervised learning throws away every unlabeled example you have, even when unlabeled data outnumbers labeled data by a hundred to one. Pure unsupervised learning goes the other way — it ignores the labels you *do* have, even though a correct label is the single most reliable signal in your dataset. Both are leaving information on the table. Semi-supervised learning exists because in most real-world settings, labeling is the expensive, slow part of the pipeline, while raw unlabeled data is comparatively cheap — so the practical question became: can the unlabeled data help the model, even without labels attached to it?

## Why unlabeled data can help at all

This isn't obvious at first — if a data point has no label, how can it possibly improve a model trained to predict labels? The answer is that unlabeled data still tells you something about $P(X)$, the shape of the input distribution, even without telling you anything about $P(Y \mid X)$. If you know where the data tends to cluster, you can use that shape to constrain how the decision boundary should bend, even in regions where you have no labeled examples.

This only works if certain assumptions about the data actually hold:

- **Smoothness assumption** — if two points are close together in input space, they probably have the same label.
- **Cluster assumption** — points that form a natural cluster probably share a label; decision boundaries should pass through low-density regions, not through the middle of a cluster.
- **Manifold assumption** — high-dimensional data often lies on a much lower-dimensional manifold, and the label should vary smoothly along that manifold.

When these hold, unlabeled data genuinely constrains the hypothesis space. When they don't, semi-supervised methods can actively hurt performance compared to just using the labeled data alone — this is a real failure mode worth remembering, not just a footnote.

<details>
<summary>Math: the labeled + unlabeled setup</summary>

You're given a labeled set $\mathcal{D}_l = \{(x_i, y_i)\}_{i=1}^{n_l}$ and an unlabeled set $\mathcal{D}_u = \{x_j\}_{j=1}^{n_u}$, typically with $n_u \gg n_l$. A common way to formalize using both is to add a regularization term derived from the unlabeled data to the standard supervised loss:

$$\min_{f} \; \underbrace{\frac{1}{n_l}\sum_{i=1}^{n_l} \mathcal{L}(f(x_i), y_i)}_{\text{labeled loss}} \;+\; \lambda \cdot \underbrace{R(f, \mathcal{D}_u)}_{\text{unlabeled regularizer}}$$

where $R$ encodes one of the assumptions above — for example, penalizing the model if it produces very different predictions for two nearby unlabeled points.

</details>

## A simple version of the idea: self-training

One of the oldest and most intuitive approaches is self-training: train a model on the labeled data, use it to predict labels for the unlabeled data, keep the predictions the model is most confident about as if they were real labels, and retrain including them. It's simple and it works reasonably often, but it has an obvious failure mode — if the model is confidently wrong early on, it reinforces its own mistakes on the newly "labeled" data. More modern approaches (consistency regularization, pseudo-labeling with confidence thresholds) exist largely to control this risk.

## Not to be confused with self-supervised learning

These two get mixed up constantly, and the distinction is worth being precise about in an interview. Semi-supervised learning still has real, human-provided labels — just not very many of them. Self-supervised learning has no human labels at all; it manufactures its own supervision from the structure of the data (predict the masked word, predict the rotation applied to an image). They're solving related problems — both trying to squeeze value out of unlabeled data — but the mechanism is fundamentally different. See [Self-Supervised Learning](/topic/self-supervised-learning) for that side of it.

## Further reading

Chapelle, Schölkopf, and Zien (eds.), [Semi-Supervised Learning](https://www.molgen.mpg.de/3659531/MITPress--SemiSupervised-Learning.pdf), MIT Press (2006) is the standard reference text that formalized the assumptions and methods described here — not a single founding paper, but the book most commonly cited as the field's defining treatment.