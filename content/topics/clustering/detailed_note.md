# Clustering

## Motivation

What if you have data but no label, how are you going to train the model? [Unsupervised learning](/topic/unsupervised-learning) asks what structure exists in data with no labels. Clustering is the most direct version of that question: are there natural groups in this data, and if so, which points belong together? There's no single "correct" way to answer this. Different algorithms make different assumptions about what a group actually looks like geometrically — round blobs, chains, dense regions, overlapping ellipses — and picking an algorithm whose assumptions don't match your data's real shape gives you clusters that look confident but mean nothing. That's why there are several genuinely different clustering algorithms, not just one refined over time.

## k-Means Clustering

The simplest and most widely used clustering algorithm. You choose a number of clusters $k$ upfront, and the algorithm finds $k$ **centroids** — one point per cluster, representing its center — and assigns every data point to whichever centroid is closest.

The algorithm works in a loop:

1. Pick $k$, and initialize $k$ centroids (usually randomly, or with a smarter method called k-means++).
2. Assign every point to its nearest centroid.
3. Recompute each centroid as the mean of the points now assigned to it.
4. Repeat steps 2 and 3 until the assignments stop changing.

This is guaranteed to converge — the total error keeps shrinking every round — but only to a **local** optimum, not necessarily the best possible clustering. Different random starting centroids can converge to different final clusters, which is why k-means is usually run several times from different starting points, keeping the best result.

**Choosing $k$** isn't given by the algorithm — you have to decide it. Two common ways: the **elbow method** (plot the total within-cluster error against different values of $k$, and look for the point where adding more clusters stops helping much), and the **silhouette score** (a number that measures how well-separated the clusters are, computed for different $k$).

**Limitations worth knowing**: k-means assumes clusters are roughly round and similarly sized, because it's built entirely on Euclidean distance to a single center point — it does badly on elongated or unevenly-sized clusters. It's sensitive to outliers, since a single far-away point can pull a centroid noticeably. And because it's distance-based, features on different scales need to be standardized first, or features with naturally larger numeric ranges will dominate the distance calculation.

<details>
<summary>Math: the k-means objective</summary>

k-means minimizes the within-cluster sum of squared distances (also called inertia):

$$
\min_{C_1, \dots, C_k} \sum_{j=1}^{k} \sum_{x_i \in C_j} \lVert x_i - \mu_j \rVert^2
$$

where $\mu_j$ is the centroid (mean) of cluster $C_j$. Finding the globally optimal partition is NP-hard; the standard algorithm (Lloyd's algorithm — the loop described above) is a fast, greedy approximation that reliably finds *a* local minimum, not necessarily the global one.

</details>

## Hierarchical Clustering

Instead of committing to one fixed number of clusters upfront, hierarchical clustering builds a whole tree of nested clusters, called a **dendrogram**, and lets you decide how many clusters you want afterward by choosing where to cut the tree.

The common version is **agglomerative** (bottom-up): start with every point as its own cluster, then repeatedly merge the two closest clusters into one, until everything is merged into a single cluster at the top. (A **divisive**, top-down version also exists — start with one cluster and keep splitting — but it's used far less in practice.)

"Closest" between two *clusters* (not just two points) needs a rule, called the **linkage criterion**:

- **Single linkage** — distance between the two closest points in each cluster. Can produce long, chain-like clusters.
- **Complete linkage** — distance between the two farthest points in each cluster. Tends to produce more compact, evenly-sized clusters.
- **Average linkage** — the average distance between all pairs of points across the two clusters.
- **Ward's linkage** — merges whichever pair of clusters increases the total within-cluster variance the least. This tends to behave the most like k-means, and is a common default.

The main advantage over k-means: you don't have to fix the number of clusters ahead of time — you can look at the dendrogram and cut it wherever makes sense. The main cost: it's much more computationally expensive (typically $O(n^2)$ or worse), so it doesn't scale well to very large datasets the way k-means does.

## DBSCAN

Both k-means and hierarchical clustering share two weaknesses: they tend to assume roughly compact, blob-like clusters, and neither has a real concept of "noise" — every point gets forced into some cluster, even ones that don't really belong anywhere. **DBSCAN** (Density-Based Spatial Clustering of Applications with Noise) fixes both by defining clusters differently: a cluster is a dense region of points, separated from other clusters by regions of low density, and points that don't sit in any dense region are explicitly labeled as noise instead of forced into the nearest cluster.

Two parameters control this: **eps** (a radius) and **minPts** (a minimum number of neighbors). Every point gets one of three labels:

- **Core point** — has at least `minPts` other points within distance `eps` of it.
- **Border point** — within `eps` of a core point, but doesn't have enough neighbors of its own to be a core point.
- **Noise point** — neither of the above. Not part of any cluster.

A cluster is formed by taking a core point and expanding outward through every other core point reachable within `eps`, plus any border points along the way.

**Advantages**: you don't need to specify the number of clusters, it can find clusters of any shape (not just round ones), and it naturally separates out noise and outliers instead of forcing them into a cluster. 

**Disadvantages**: the result is sensitive to the choice of `eps` and `minPts`, and it struggles when different clusters in the same dataset have very different densities — a single `eps` value can't be right for both a dense cluster and a sparse one at once.

## Gaussian Mixture Models (GMM)

k-means does **hard** assignment — every point belongs to exactly one cluster, no ambiguity — and implicitly assumes every cluster is round and roughly the same size, because it only ever measures distance to a single center point. GMM relaxes both assumptions. It models the data as if it were generated by a mix of several Gaussian (bell-curve) distributions, each with its own mean *and* its own covariance — so clusters can be elongated, tilted, and different sizes, not just round. And instead of a hard assignment, each point gets a *probability* of belonging to each cluster.

GMM is fit using the **Expectation-Maximization (EM)** algorithm, which alternates two steps:

- **E-step (Expectation)** — given the current guess at each Gaussian's parameters, compute the probability that each point belongs to each cluster (called its "responsibility").
- **M-step (Maximization)** — given those probabilities, update each Gaussian's mean, covariance, and weight to best fit the data, weighted by those responsibilities.

Repeat until the parameters stop changing meaningfully. This is directly analogous to k-means's assign-then-update loop, just with soft probabilities instead of hard assignments — in fact, **k-means is a special case of GMM**, where every cluster's covariance is forced to be the same simple round shape, and the soft probabilities are hardened into a single best guess. This is a genuinely useful interview fact to have ready.

<details>
<summary>Math: the mixture model and EM</summary>

A GMM models the data density as a weighted sum of $k$ Gaussians:

$$
p(x) = \sum_{j=1}^{k} \pi_j \, \mathcal{N}(x \mid \mu_j, \Sigma_j)
$$

where $\pi_j$ is the weight (prior probability) of component $j$, and $\mu_j, \Sigma_j$ are that component's mean and covariance. The E-step computes each point's responsibility for each component via Bayes' rule:

$$
\gamma_{ij} = \frac{\pi_j \, \mathcal{N}(x_i \mid \mu_j, \Sigma_j)}{\sum_{l=1}^{k} \pi_l \, \mathcal{N}(x_i \mid \mu_l, \Sigma_l)}
$$

The M-step then re-estimates $\pi_j, \mu_j, \Sigma_j$ as weighted averages using these responsibilities. Each full E-step/M-step cycle is guaranteed to never decrease the data's likelihood under the model, which is why it reliably converges — again, to a local optimum, same caveat as k-means.

</details>

## Choosing between them

As a rough guide: reach for **k-means** when clusters are roughly round and you have a rough sense of how many there should be. Reach for **hierarchical clustering** when you don't want to commit to a number of clusters upfront, or you want to see the nested structure at multiple levels. Reach for **DBSCAN** when clusters have irregular shapes, or when you expect real noise/outliers in the data that shouldn't be forced into any cluster. Reach for **GMM** when clusters overlap, vary in size or shape, or when you want a probability of membership rather than a hard yes/no answer.

## Further reading

k-means traces back to Stuart Lloyd's 1957 Bell Labs technical report (not formally published until 1982, as "Least Squares Quantization in PCM"); the name "k-means" itself comes from James MacQueen's 1967 paper. Hierarchical clustering doesn't have one single origin paper — it grew out of numerical taxonomy in biology through the 1950s–60s, with Robert Sokal and Peter Sneath's work on numerical taxonomy commonly cited as a foundational reference. DBSCAN was introduced by Martin Ester, Hans-Peter Kriegel, Jörg Sander, and Xiaowei Xu in "A Density-Based Algorithm for Discovering Clusters in Large Spatial Databases with Noise" (1996). The EM algorithm that GMM relies on was formalized by Arthur Dempster, Nan Laird, and Donald Rubin in "Maximum Likelihood from Incomplete Data via the EM Algorithm" (1977).