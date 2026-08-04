# k-Nearest Neighbors

## Motivation

Linear and logistic regression both assume a specific shape for the relationship between inputs and output, then fit a fixed set of parameters to that shape. That's a strong assumption, and it's wrong whenever the real pattern doesn't look like a line. k-Nearest Neighbors takes the opposite approach: assume nothing about the shape, and don't fit any parameters at all. Just remember the training data, and when a new point comes in, look at what's nearby.

## How it works

To predict a label for a new point:

1. Compute the distance from that point to every point in the training set.
2. Find the $k$ closest ones.
3. For classification, take a majority vote among their labels. 
4. For regression, average their values.

There's no training phase in the usual sense — the "model" is just the training data itself. All the work happens at prediction time, which is why kNN is sometimes called a lazy learner. This is also its biggest practical weakness: prediction gets slower as the dataset grows, since you're comparing against every stored point.

## Choosing k

$k$ is the main knob, and it's a direct bias-variance tradeoff:

- **Small $k$** (like $k=1$) follows the training data very closely. Low bias, but high variance — a single noisy or mislabeled point can flip a prediction.
- **Large $k$** smooths things out by averaging over more neighbors. Lower variance, but higher bias — you start blending in points that aren't really representative of the local pattern.

There's no universal best value. It's normally chosen with [cross-validation](/topic/bias-variance-tradeoff).

<details>
<summary>Math: distance and the vote</summary>

The most common distance metric is Euclidean distance:

$$
d(x, x_i) = \sqrt{\sum_{j=1}^{d} (x_j - x_{i,j})^2}
$$

though other metrics (Manhattan, cosine) are used depending on the data. For classification, given the set $N_k(x)$ of the $k$ nearest neighbors to $x$, the prediction is

$$
\hat{y} = \text{mode}\left(\{y_i : i \in N_k(x)\}\right)
$$

the most common label among the neighbors.

</details>

## Curse of Dimensionality

kNN relies on "nearby points look similar," and that assumption quietly breaks down as the number of features grows. In high dimensions, distances between points stop being meaningful — almost all pairs of points end up roughly the same distance apart, so "nearest" neighbors aren't meaningfully closer than the rest of the data. This isn't specific to kNN; it affects any method that relies on distance, but kNN feels it directly and immediately, since distance is the entire algorithm.

The usual fixes are the same ones you'd reach for generally: reduce the number of features first (see [Dimensionality Reduction](/topic/dimensionality-reduction)), or make sure you're only including features that actually carry signal, rather than throwing in everything available.

## Further reading

The core idea is usually traced to a 1951 technical report by Evelyn Fix and Joseph Hodges, written for the US Air Force School of Aviation Medicine, though it wasn't formally published in a journal until decades later. Thomas Cover and Peter Hart's 1967 paper "Nearest Neighbor Pattern Classification" is the more commonly cited reference — it proved the classic result that, with enough data, the error rate of 1-NN is at most twice the theoretical best possible error rate.