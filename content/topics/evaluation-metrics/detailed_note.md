# Evaluation Metrics

## Motivation

A model's loss function is what it optimizes during training, but the number that comes out of the loss function is rarely the number anyone actually cares about. Cross-entropy doesn't tell a fraud team how many fraudulent transactions got missed; MSE doesn't tell a home buyer how far off a price estimate typically is in dollars. Evaluation metrics translate model performance into terms that are meaningful for the decision the model is being used for — and because classification and regression produce fundamentally different kinds of output, they need fundamentally different metrics.

## Classification and Regression

The split mirrors the [Supervised Learning](/topic/supervised-learning) split itself: what counts as "correct" depends on whether $y$ is a category or a number.

- **Classification metrics** compare a predicted label against a true category. Predictions are either right or wrong — there's no partial credit for guessing "cat" when the answer was "dog" — so these metrics are built out of counts of correct and incorrect predictions: accuracy, precision, recall, F1, ROC-AUC.
- **Regression metrics** compare a predicted number against a true number. There's no such thing as an exact match in continuous space, so these metrics measure *distance* — how far, on average, predictions land from the truth: RMSE, MAE, R².

Picking the wrong family doesn't just give a meaningless number — accuracy on a regression problem or MSE on a classification problem doesn't even compute in a sensible way, because the underlying prediction types don't match the metric's assumptions.

**Types of classification:** binary (2 classes), multi-class (>2 classes, one label each), multi-label (more than one label can apply at once).
 
**Types of regression:** simple linear (one input feature), multiple linear (several features), polynomial/nonlinear (curved relationships), regularized (Ridge/Lasso — penalizes large coefficients to reduce overfitting).

## Confusion Matrix

Every classification metric in this note is a different summary of one underlying table — the confusion matrix — which breaks predictions down by actual class vs. predicted class:

| | Predicted Positive | Predicted Negative |
|---|---|---|
| **Actual Positive** | True Positive (TP) | False Negative (FN) |
| **Actual Negative** | False Positive (FP) | True Negative (TN) |

The easiest way to remember the labels: the second word is what the model predicted, the first word says whether that prediction was correct. A "False Positive" is a case where the model said positive and was wrong — the truth was negative.

Accuracy falls directly out of this table — it's the diagonal (correct predictions) over the total:

$$
\text{Accuracy} = \frac{TP + TN}{TP + TN + FP + FN}
$$

For multi-class problems, the matrix generalizes to a $k \times k$ grid, and every other metric below gets computed per class (then averaged — "macro" treats every class equally, "weighted" accounts for class frequency).

## Accuracy / Precision / Recall / F1

Accuracy looks simple, but it has a well-known failure mode: on imbalanced data, a model can score very high while being useless. If 1 in 1000 transactions is fraud, a model that always predicts "not fraud" is 99.9% accurate and catches zero fraud. This is exactly why precision and recall exist as finer-grained alternatives.

- **Precision** — of everything the model called positive, what fraction actually was? High precision means few false alarms. Matters most when false positives are costly (e.g. flagging legitimate email as spam).
- **Recall** (sensitivity) — of everything that actually was positive, what fraction did the model catch? High recall means few missed cases. Matters most when false negatives are costly (e.g. missing an actual cancer diagnosis).
- **F1 score** — the harmonic mean of precision and recall, used when you want one number that punishes a model for being lopsided rather than rewarding it for excelling at just one.

<details>
<summary>Math: precision, recall, F1</summary>

$$
\text{Precision} = \frac{TP}{TP + FP} \qquad \text{Recall} = \frac{TP}{TP + FN}
$$

$$
F_1 = 2 \cdot \frac{\text{Precision} \cdot \text{Recall}}{\text{Precision} + \text{Recall}}
$$

The harmonic mean is used instead of the arithmetic mean because it penalizes extreme imbalance more heavily — a model with precision 1.0 and recall 0.01 gets an arithmetic mean of ~0.5 but an F1 near 0.02, which better reflects how useless that model actually is.

</details>

Precision and recall trade off against each other as you move the classification threshold — raising the threshold makes the model more conservative (higher precision, lower recall), and lowering it does the reverse. Which one to prioritize depends entirely on the cost of each error type, which is worth stating out loud in an interview: it shows you understand these aren't just formulas, they're business tradeoffs.

## ROC-AUC vs PR-AUC

Precision, recall, and F1 all require picking a single threshold first. ROC and PR curves instead plot performance across *every possible threshold*, and the area under each curve (AUC) summarizes that into one threshold-independent number.

- **ROC curve** — plots True Positive Rate (recall) against False Positive Rate at every threshold. **ROC-AUC** is the probability that the model ranks a random positive example higher than a random negative one; 0.5 is random guessing, 1.0 is perfect separation.
- **PR curve** — plots Precision against Recall at every threshold. **PR-AUC** summarizes that curve the same way.

The two diverge sharply on imbalanced data. False Positive Rate is computed against the (huge) negative class, so it barely moves even when a model produces a lot of false positives in absolute terms — ROC-AUC can look deceptively good on a heavily imbalanced problem like fraud detection. Precision doesn't have this blind spot, since it's computed against predicted positives directly, which is why **PR-AUC is generally preferred over ROC-AUC when the positive class is rare**.

## RMSE, MAE, R² score

These are the regression counterparts to the classification metrics above — each answers "how far off were the predictions," but with different sensitivity to large errors.

- **MAE (Mean Absolute Error)** — average of $|y_i - \hat{y}_i|$. Every error contributes proportionally to its size; a few large errors don't dominate the score.
- **RMSE (Root Mean Squared Error)** — square the errors, average them, take the square root. Squaring means large errors are penalized disproportionately more than small ones, so RMSE is more sensitive to outliers than MAE.
- **R² (coefficient of determination)** — the fraction of variance in $y$ that the model explains, relative to just predicting the mean every time. $R^2 = 1$ is a perfect fit, $R^2 = 0$ means the model does no better than predicting the average, and it can go negative if the model does worse than that.

<details>
<summary>Math: RMSE, MAE, R²</summary>

$$
\text{MAE} = \frac{1}{n}\sum_{i=1}^n |y_i - \hat{y}_i| \qquad \text{RMSE} = \sqrt{\frac{1}{n}\sum_{i=1}^n (y_i - \hat{y}_i)^2}
$$

$$
R^2 = 1 - \frac{\sum_{i=1}^n (y_i - \hat{y}_i)^2}{\sum_{i=1}^n (y_i - \bar{y})^2}
$$

RMSE and MAE are both in the same units as $y$ (dollars, degrees, etc.), which makes them directly interpretable — R² is unitless, which makes it easier to compare across different datasets or targets.

</details>

## Table: when to use what

| Situation | Metric to use | Why |
|---|---|---|
| Balanced classes, care about overall correctness | Accuracy | Simple and unbiased when classes are roughly equal |
| Imbalanced classes, cost of false positives is high | Precision | Directly measures how trustworthy positive predictions are |
| Imbalanced classes, cost of false negatives is high | Recall | Directly measures how many true positives are being caught |
| Need one number balancing both error types | F1 | Harmonic mean punishes lopsided precision/recall |
| Comparing classifiers across all thresholds, roughly balanced data | ROC-AUC | Threshold-independent, standard for general ranking quality |
| Comparing classifiers across all thresholds, rare positive class | PR-AUC | Not distorted by a large true-negative pool |
| Regression, want error in original units, outliers matter | RMSE | Penalizes large errors more heavily |
| Regression, want error in original units, outliers shouldn't dominate | MAE | Treats all errors proportionally |
| Regression, want a unitless "how good is this model" summary | R² | Compares against a naive mean-prediction baseline |

**One-sentence recall for the whole note:** classification metrics all derive from the confusion matrix (TP/FP/FN/TN), regression metrics all derive from "how far off was the predicted number," and which specific one you reach for comes down to a single question — *what does a mistake cost here?*

## Further reading

scikit-learn's [model evaluation guide](https://scikit-learn.org/stable/modules/model_evaluation.html) — practical reference for how each metric above is actually computed and used in code, including multi-class averaging strategies (macro/micro/weighted).