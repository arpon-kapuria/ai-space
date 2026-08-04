# Support Vector Machines

## Motivation

[Logistic Regression](/topic/logistic-regression) finds *a* line that separates the classes reasonably well, based on likelihood — but it has no particular preference for *which* separating line, beyond that. Two lines could both classify every training point correctly, and logistic regression wouldn't strongly prefer one over the other. Geometrically, though, one of them is clearly better: the one with more empty space on either side of it. A boundary with more breathing room between it and the nearest points of each class is more likely to still get new points right, since there's more room for noise before a point crosses to the wrong side. Support Vector Machines make that intuition the entire objective: find the boundary with the widest possible gap.

## Margin Maximization

That gap is called the **margin** — the distance from the decision boundary to the closest training points on either side. The points that actually sit on the edge of that margin are called **support vectors**, and they're the only points that matter: if you removed every other training point and kept just the support vectors, you'd get the exact same boundary. That's a distinctive property of SVMs — most models use every training point to shape the decision boundary, but here, most points could be deleted with zero effect.

Finding the maximum-margin boundary turns into an optimization problem: minimize the size of the weight vector $\lVert w \rVert$ (which is mathematically the same as maximizing the margin), subject to every training point being correctly classified with at least the margin's worth of distance from the boundary. This is a convex optimization problem, which means — unlike training a neural network — it has one unique global solution, not many possible local ones.

<details>
<summary>Math: the margin-maximization objective</summary>

For a linearly separable dataset with labels $y_i \in \{-1, +1\}$, the hard-margin SVM solves:

$$
\min_{w, b} \ \frac{1}{2}\lVert w \rVert^2 \quad \text{subject to} \quad y_i(w^\top x_i + b) \geq 1 \ \ \text{for all } i
$$

The constraint requires every point to be on the correct side of the boundary and at least a fixed distance away from it. Minimizing $\lVert w \rVert$ is equivalent to maximizing the margin width, which is $\frac{2}{\lVert w \rVert}$.

</details>

## Kernel Trick

Margin maximization alone only works if the classes can be separated by a straight line. Most real data can't be. The obvious fix is to transform the features into a higher-dimensional space where a straight line *does* separate them — a curve in 2D can become a flat plane in 3D, for instance. The problem is that computing this transformation directly can be expensive, and for some useful transformations, the target space is infinite-dimensional, which makes it impossible to compute directly at all.

The kernel trick sidesteps this entirely. It turns out the SVM's optimization and its predictions only ever need the *dot product* between pairs of data points — never the individual transformed points themselves. So instead of transforming the data and then computing a dot product, you can use a **kernel function** that computes what that dot product *would have been* in the higher-dimensional space, directly from the original features, without ever performing the transformation. This lets SVMs work in enormously high-dimensional (even infinite-dimensional) spaces at the cost of evaluating a kernel function, which is often cheap.

Common kernels: **linear** (no transformation — plain margin maximization), **polynomial** (represents feature combinations up to a specific power), and the **RBF kernel** (Gaussian based, measures similarity by distance), which is the most commonly used default and implicitly corresponds to an infinite-dimensional feature space.

<details>
<summary>Math: what a kernel actually computes</summary>

A kernel function $K$ satisfies $K(x_i, x_j) = \phi(x_i)^\top \phi(x_j)$ for some (possibly unknown, possibly infinite-dimensional) feature mapping $\phi$. The RBF kernel, for example:

$$
K(x_i, x_j) = \exp\left(-\gamma \lVert x_i - x_j \rVert^2\right)
$$

measures similarity that decays smoothly with distance, and corresponds to an infinite-dimensional $\phi$ that's never explicitly computed — only $K$ itself ever needs to be evaluated.

</details>

## Soft Margin

Requiring every single point to be correctly classified with the full margin (a **hard margin**) is fragile. Real data is rarely perfectly separable, and even when it is, a single noisy or mislabeled point sitting close to the boundary can force a much worse-fitting margin, or make the problem impossible to solve at all.

The **soft margin** fixes this by allowing some points to violate the margin, or even end up on the wrong side entirely — at a cost. Each violation adds a penalty, and a parameter $C$ controls how harshly violations are punished:

- **Large $C$** — violations are expensive, so the model tries hard to satisfy the margin for every point. Closer to a hard margin, and more prone to overfitting on noisy data.
- **Small $C$** — violations are cheap, so the model accepts a wider, more tolerant margin. More robust to noise, but can underfit if $C$ is too small.

This is the same shape of tradeoff as [regularization](/topic/regularization)'s $\lambda$ — a single knob controlling how tightly the model fits the training data versus how much slack it allows, tuned the same way, usually with cross-validation.

## Further reading

The margin-based, maximum-margin idea traces back to the statistical learning theory developed by Vladimir Vapnik and Alexey Chervonenkis from the 1960s onward. The kernel trick's application to margin classifiers was introduced by Bernhard Boser, Isabelle Guyon, and Vapnik in "A Training Algorithm for Optimal Margin Classifiers" (1992). The soft-margin formulation used almost universally today comes from Corinna Cortes and Vladimir Vapnik's "Support-Vector Networks" (1995).