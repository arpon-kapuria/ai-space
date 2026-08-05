# Logistic Regression

## Motivation

The obvious next move after [Linear Regression](/topic/linear-regression) is to try it on a classification problem — fit a line, then threshold the output. It doesn't work well, for two reasons. First, a linear model can output any number, but a probability has to sit between 0 and 1 — nothing stops linear regression from predicting 4.7. Second, MSE assumes errors are spread out like a bell curve around a continuous target, which isn't the right way to think about a label that's just 0 or 1. Logistic regression fixes both problems: squash the output into a real probability, and use a loss that's actually built for that.

## The model

Same linear combination as before, $z = \mathbf{w}^\top \mathbf{x} + b$, but now passed through the sigmoid function to constrain it to $(0, 1)$:

$$
\hat{y} = \sigma(z) = \frac{1}{1 + e^{-z}}
$$

$\hat{y}$ is interpreted directly as $P(y = 1 \mid \mathbf{x})$. The decision boundary — where the model is 50/50 — is exactly where $z = 0$, which is still a linear function of the inputs. Despite the nonlinear squashing, logistic regression is fundamentally a linear classifier: it can only separate classes with a straight line (or hyperplane), not a curved boundary.

## Why cross-entropy, not MSE

The loss function is binary cross-entropy (log loss), not squared error:

$$
\mathcal{L} = -\frac{1}{n}\sum_{i=1}^n \left[y_i \log \hat{y}_i + (1 - y_i)\log(1 - \hat{y}_i)\right]
$$

This isn't an arbitrary choice — it comes directly out of maximizing the likelihood of the labels under the model (see  [Probability & Statistics](/topic/probabilities-and-statistics) for the general MLE framework this is an instance of). It also matters practically: if you used MSE with a sigmoid output instead, the resulting loss surface is non-convex and prone to flat regions where gradients nearly vanish, making it much harder to optimize reliably. Cross-entropy with a sigmoid stays convex, which is exactly the property you want for [Gradient Descent](/topic/gradient-descent) to work well.

<details>
<summary>Math: the gradient turns out remarkably clean</summary>

Differentiating the cross-entropy loss with respect to the weights gives

$$
\nabla_{\mathbf{w}} \mathcal{L} = \frac{1}{n}\sum_{i=1}^n (\hat{y}_i - y_i)\, \mathbf{x}_i
$$

which has exactly the same form as linear regression's gradient under MSE — "predicted minus actual, times the input." The loss functions look completely different, but the resulting update rule is the same shape. This isn't a coincidence: it's a general property of generalized linear models paired with their canonical loss function.

</details>

## Beyond binary

For more than two classes, the natural extension is softmax regression (also called multinomial logistic regression): instead of one sigmoid output, you compute one score per class and normalize them with softmax so they sum to 1. The underlying idea — linear scores turned into probabilities, trained with cross-entropy — is identical, just generalized from two classes to $k$.

## Further reading

The logistic (sigmoid) curve itself predates its use in classification by about a century — Pierre François Verhulst introduced it in the 1830s–40s to model constrained population growth. Its adoption as a regression method for binary outcomes is usually credited to David Cox's 1958 paper "The Regression Analysis of Binary Sequences", which is the standard citation for logistic regression as a statistical technique.

## Practice

- [`Binary Classification with Logistic Regression`](https://www.deep-ml.com/problems/104)
- [`Train Logistic Regression with Gradient Descent`](https://www.deep-ml.com/problems/106)