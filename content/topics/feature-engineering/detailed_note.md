# Feature Engineering

## Motivation

Real data is rarely in a shape a model can use well straight away. Features live on wildly different numeric scales, categories are stored as text, values are missing, and one class of interest might be outnumbered a thousand to one by the rest. None of this is a modeling problem in the algorithmic sense — it's a data problem, and it has to be handled before the model ever sees the data. In practice, this preprocessing work often matters more for final performance than which model you end up choosing.

## Scaling numeric features

Many models are directly sensitive to the numeric scale of a feature — anything based on distance (kNN, k-means, SVM) or trained with gradient descent (linear/logistic regression, neural networks). A feature ranging from 0 to 1,000,000 will dominate a distance calculation or a gradient update compared to a feature ranging from 0 to 1, even if the second feature is actually more predictive. Two standard fixes:

- **Standardization (Z-score)** — subtract the mean and divide by the standard deviation, so the feature ends up centered at 0 with unit variance. Doesn't bound the values to a fixed range, and is less thrown off by outliers than the next option.
- **Normalization (min-max scaling)** — rescale to a fixed range, usually $[0, 1]$. Simple, but a single extreme outlier compresses the rest of the data into a tiny sliver of that range.

Worth knowing: tree-based models (decision trees, random forests, gradient boosting) don't need any of this. Their splits are based on the *ordering* of values, not their magnitude or distance from anything, so scaling makes no difference to them at all.

## Encoding categorical features

Models generally need numbers, not text categories, as input:

- **One-hot encoding** — one binary column per category. Avoids implying a false order between categories, but for a feature with many possible values, this can blow up the number of columns significantly — which drags the [curse of dimensionality](/topic/k-nearest-neighbors) into the picture again.
- **Label / ordinal encoding** — a single integer per category. Only appropriate when the categories genuinely have an order (low/medium/high). Used on a category with no real order, it silently tells the model there's a numeric relationship that doesn't exist.
- **Target encoding** — replace each category with the average target value for that category. Powerful for categories with many possible values, but risky: it can leak information from the target into the features if it's computed carelessly, so it needs to be computed only from training data (never touching validation/test rows) and usually smoothed to avoid overfitting on categories with very few examples.

## Missing Data

Before deciding how to handle missing values, it helps to know *why* they're missing, since the right approach depends on it. The standard taxonomy has three categories:

- **MCAR (Missing Completely at Random)** — the missingness has nothing to do with any value, observed or not. Safest case to handle.
- **MAR (Missing at Random)** — the chance of a value being missing depends on *other observed* variables, but not on the missing value itself.
- **MNAR (Missing Not at Random)** — the chance of a value being missing depends on the missing value itself (for example, people with very high incomes being less likely to report their income). The hardest and most dangerous case, since the fact that a value is missing is itself informative.

### How to handle it ?

- **Deletion** — drop rows with missing values (fine if there are very few), or drop a column entirely if most of it is missing.
- **Simple imputation** — fill in the mean, median, or mode of the column. Easy, but ignores any relationship between features.
- **Model-based imputation** — predict the missing value from the other features (a kNN-based fill, or a small regression model trained just for this purpose). More accurate, more work.
- **Multiple imputation** — generate several different plausible filled-in datasets, run the analysis on each, and combine the results. This is the more statistically rigorous option, because it accounts for the uncertainty in the imputed values themselves, rather than treating a single guess as if it were the true value.

One detail worth remembering: if missingness might be MNAR, it can help to add a separate binary "was this value missing" indicator column alongside whatever value you impute, so the model can still pick up on the fact that missingness itself carried signal.

## Class Imbalance

When one class vastly outnumbers another — fraud detection, rare disease diagnosis — a model can rack up high accuracy just by always predicting the majority class. That's a model that's technically accurate and completely useless, and it's exactly why plain accuracy is a poor metric for imbalanced problems in the first place (see [Evaluation Metrics](/topic/evaluation-metrics)).

### Common fixes

- **Resampling** — oversample the minority class (duplicate examples, or add more of them) or undersample the majority class (remove some of its examples) so the classes are more balanced going into training.
- **SMOTE (Synthetic Minority Oversampling Technique)** — instead of just duplicating minority examples, generate *new* synthetic ones by interpolating between existing minority points and their nearest minority neighbors. This avoids the overfitting risk of training on exact duplicates.
- **Class weights** — leave the data alone, but change the loss function so that misclassifying the minority class costs more than misclassifying the majority class. Most standard algorithms have a built-in parameter for this, and it's often the simplest fix to reach for first.
- **Threshold tuning** — after training, instead of using the default 0.5 probability cutoff for classification, move the decision threshold to whatever point trades off precision and recall appropriately for the specific problem.

<details>
<summary>Math: standardization, min-max scaling, and SMOTE</summary>

Standardization: $x' = \dfrac{x - \mu}{\sigma}$, using the feature's mean $\mu$ and standard deviation $\sigma$.

Min-max scaling: $x' = \dfrac{x - x_{\min}}{x_{\max} - x_{\min}}$.

SMOTE generates a synthetic point by picking a minority-class point $x_i$, one of its $k$ nearest minority-class neighbors $x_{\text{nn}}$, and interpolating between them:

$$
x_{\text{new}} = x_i + \lambda \cdot (x_{\text{nn}} - x_i), \quad \lambda \sim \text{Uniform}(0, 1)
$$

placing the new synthetic point somewhere along the line segment between the two real points, rather than exactly on top of either one.

</details>

## Further reading

The missing-data taxonomy (MCAR, MAR, MNAR) comes from Donald Rubin's "Inference and Missing Data" (1976), which remains the standard reference for how to think about why data is missing. SMOTE was introduced by Nitesh Chawla, Kevin Bowyer, Lawrence Hall, and W. Philip Kegelmeyer in "SMOTE: Synthetic Minority Over-sampling Technique" (Journal of Artificial Intelligence Research, 2002).