# Dimensionality Reduction

## Motivation

More features sound like more information, but after a certain point they cause real problems. The [curse of dimensionality](/topic/k-nearest-neighbors) means distances between points stop being meaningful as dimensions grow, models need exponentially more data to cover the space well, and beyond three dimensions, you simply can't look at the data anymore. 

Dimensionality reduction addresses this directly: compress the data into fewer dimensions while keeping as much of the meaningful structure as possible. It's worth separating two different goals up front, because they lead to different techniques. Sometimes you want to reduce dimensions for a downstream model or for compression, and you care about preserving the data's overall, global structure. Sometimes you want to reduce dimensions purely to *look at* the data in 2D or 3D, and you care much more about preserving local neighborhoods — which points are close to which — than about global distances. PCA is built for the first goal; t-SNE and UMAP are built for the second. Mixing these up is a common source of confusion.

## PCA (Principal Component Analysis)

PCA finds the directions along which the data varies the most, and projects the data onto the top few of those directions.

The first principal component is the single direction along which the data spreads out the most. The second is the direction of the next-most spread, with one constraint: it has to be perpendicular (orthogonal) to the first. This continues, each new component capturing as much of the remaining variance as possible while staying perpendicular to all the previous ones.

The reasoning for maximizing variance: variance along a direction is a stand-in for how much information the data carries along it. A direction with almost no spread is close to constant, and dropping it loses almost nothing. A direction with a lot of spread is doing real work distinguishing the data points, and dropping it loses a lot. Keeping the highest-variance directions keeps the most information for however many dimensions you have left.

In practice, this is computed from the eigenvectors and eigenvalues of the data's covariance matrix — the eigenvectors are the principal components (the directions), and the eigenvalues tell you how much variance each one explains. (In implementations, this is usually done via SVD directly on the data matrix rather than literally building the covariance matrix, mainly for numerical stability, but the result is the same.)

To decide how many components to keep, a common approach is to look at the **cumulative explained variance** — keep adding components until you've captured, say, 95% of the total variance — or to plot the eigenvalues (a **scree plot**) and look for the point where they drop off sharply.

**Worth knowing**: PCA is a *linear* technique — it can only find straight-line directions of variance, so it can't "unfold" data that's curved or twisted in a genuinely nonlinear way (the classic example is a Swiss-roll shape, where PCA fails to recover the underlying 2D structure). It's deterministic — the same data always gives the same result, unlike the two methods below. And because it's built on variance, features on very different scales need to be standardized first, or a feature with a naturally larger numeric range will dominate the result regardless of how informative it actually is.

<details>
<summary>Math: covariance, eigenvectors, and projection</summary>

Given centered data $X$ (mean subtracted from each feature), the covariance matrix is

$$
\Sigma = \frac{1}{n} X^\top X
$$

The principal components are the eigenvectors $v_1, v_2, \dots$ of $\Sigma$, with corresponding eigenvalues $\lambda_1 \geq \lambda_2 \geq \dots$ giving the variance explained by each. Projecting the data onto the top $k$ components:

$$
X_{\text{reduced}} = X \, [v_1, v_2, \dots, v_k]
$$

The fraction of total variance explained by the top $k$ components is $\frac{\sum_{i=1}^k \lambda_i}{\sum_{i=1}^d \lambda_i}$.

</details>

## t-SNE (t-distributed Stochastic Neighbor Embedding)

t-SNE is built for a different job than PCA: visualization, specifically. Its whole goal is to preserve *local* structure — points that are close together in the original high-dimensional space should end up close together in the 2D or 3D map — even if that means distorting large-scale, global distances significantly.

At a high level: t-SNE computes how similar each pair of points is in the original high-dimensional space (as a probability, using a Gaussian centered on each point — a parameter called **perplexity** controls roughly how many neighbors are considered "close"). It then computes similarity the same way in the low-dimensional map, but uses a heavier-tailed **Student's t-distribution** instead of a Gaussian there — this is where the name comes from, and it specifically prevents moderately-distant points from getting crushed too close together in the low-dimensional space (known as the "crowding problem"). Finally, it moves the low-dimensional points, using gradient descent, to make the two similarity distributions match as closely as possible.

**Caveats that come up constantly in interviews**:

- The distances *between* clusters in a t-SNE plot are not meaningful. Cluster sizes and how far apart they appear can be arbitrary — don't read anything into them beyond "these points are grouped, those aren't."
- It's stochastic. Different runs, or different random seeds, can produce visibly different-looking plots, and the result is sensitive to the perplexity setting.
- It doesn't naturally handle new, unseen points. There's no simple way to add a new point to an existing t-SNE map — you'd typically need to rerun the whole thing on the combined dataset. PCA, by contrast, gives you a reusable projection you can apply to new data directly.
- It's computationally expensive on large datasets, though approximations (like Barnes-Hut) make it more practical.

<details>
<summary>Math: the two similarity distributions</summary>

In high-dimensional space, the similarity of point $j$ to point $i$ is a conditional probability based on a Gaussian centered at $i$:

$$
p_{j|i} = \frac{\exp(-\lVert x_i - x_j \rVert^2 / 2\sigma_i^2)}{\sum_{k \neq i} \exp(-\lVert x_i - x_k \rVert^2 / 2\sigma_i^2)}
$$

In the low-dimensional embedding, similarity uses a Student's t-distribution with one degree of freedom instead:

$$
q_{ij} = \frac{(1 + \lVert y_i - y_j \rVert^2)^{-1}}{\sum_{k \neq l} (1 + \lVert y_k - y_l \rVert^2)^{-1}}
$$

t-SNE then minimizes the KL divergence between the two distributions, $\text{KL}(P \| Q)$, moving the low-dimensional points $y_i$ via gradient descent until the two sets of similarities match as closely as possible.

</details>

## UMAP (Uniform Manifold Approximation and Projection)

UMAP was built after t-SNE, specifically to address its two biggest practical weaknesses: it's slow on large datasets, and its "fix" for the crowding problem is somewhat ad hoc rather than mathematically principled. UMAP is grounded in a more formal mathematical framework (from topology and manifold theory), tends to run noticeably faster, and in practice often preserves more of the global structure than t-SNE typically does, while still producing visually similar-looking maps.

At a high level: UMAP builds a graph representing the local neighborhood structure of the high-dimensional data (based on each point's nearest neighbors), then optimizes a low-dimensional layout so that its graph structure matches as closely as possible — using attractive forces along the graph's connections and repulsive forces between points generally. This is conceptually close to force-directed graph layout, the same family of technique used to lay out the interactive graph on this site's own Explore page.

Practically, UMAP tends to scale better to large datasets and higher output dimensions than t-SNE, and — unlike t-SNE — it can transform new, unseen points into an existing embedding after the fact, which is a genuine practical advantage if you need to place new data into a map you've already built. It still has hyperparameters that meaningfully change the result (`n_neighbors`, `min_dist`), and the same caution applies as with t-SNE: don't read too much into the exact distances between clusters in the final plot.

<details>
<summary>Math: the high-level idea (light detail — this one gets genuinely advanced)</summary>

UMAP's full derivation draws on Riemannian geometry and algebraic topology (specifically, "fuzzy simplicial sets"), which is well beyond what's typically expected in an interview. At a practical level, it's enough to know: UMAP builds a weighted graph from each point's nearest neighbors in high-dimensional space, constructs a comparable graph for a low-dimensional layout, and then optimizes the layout to minimize a cross-entropy-like loss between the two graphs' edge weights — conceptually similar to t-SNE's KL-divergence objective, but derived from a different theoretical starting point.

</details>

## Further reading

PCA originates with Karl Pearson's "On Lines and Planes of Closest Fit to Systems of Points in Space" (1901), with the modern statistical formulation and the name "principal components" coming from Harold Hotelling's 1933 paper. t-SNE was introduced by Laurens van der Maaten and Geoffrey Hinton in "Visualizing Data using t-SNE" (2008). UMAP was introduced by Leland McInnes, John Healy, and James Melville in "UMAP: Uniform Manifold Approximation and Projection for Dimension Reduction" (2018).