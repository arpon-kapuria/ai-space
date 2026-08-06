# Hyperparameter Tuning

## Motivation

[Model Selection and Training](/topic/ml-pipeline) fits a model's *parameters* (weights, split points) directly from data using a [loss function](/topic/loss-functions). **Hyperparameters** are everything the model doesn't learn on its own — tree depth, learning rate, regularization strength, number of estimators — and they still have to be chosen somehow before training even starts. A good algorithm with badly-chosen hyperparameters can underperform a worse algorithm that's well tuned, which is why this step is treated as its own stage in the [ML Pipeline](/topic/ml-pipeline) rather than an afterthought.

One rule carries through every method below: tune using the validation set or cross-validation — **never the test set**. The test set exists to give one honest, final estimate of generalization; using it to guide tuning decisions leaks information into the choice and inflates that estimate, which is the same [data leakage](/topic/ml-pipeline) problem covered in the Data Splitting stage.

**N.B.:** Not to confuse with **parameters**, which are internal values learned automatically from data during training and **hyperparameters** are external settings configured manually by engineers to control the learning process. Examples of **parameters** include neural network weights, node biases, and decision tree split thresholds, whereas examples of **hyperparameters** include learning rate, batch size, and the maximum depth of a tree.

## 1. Grid Search

**Grid search** exhaustively tries every combination of hyperparameter values from a predefined set. It's simple to reason about and guaranteed to check every combination you specified — but it scales combinatorially: adding one more hyperparameter with 5 values multiplies the total search by 5. In practice this makes grid search only practical for a small number of hyperparameters with a small number of values each.

**Tech stack:** `sklearn.model_selection.GridSearchCV`.

```python
from sklearn.model_selection import GridSearchCV
from sklearn.ensemble import RandomForestClassifier

param_grid = {
    "n_estimators": [100, 300, 500],
    "max_depth": [5, 10, None],
    "min_samples_leaf": [1, 5, 10],
}

grid_search = GridSearchCV(
    RandomForestClassifier(random_state=42),
    param_grid,
    scoring="recall",
    cv=5,
    n_jobs=-1,
)
grid_search.fit(X_train, y_train)
best_model = grid_search.best_estimator_
```

## 2. Random Search

**Random search** samples a fixed number of random combinations from the hyperparameter space instead of trying all of them. Counterintuitively, this usually finds a comparably good result to grid search with far fewer evaluations — Bergstra & Bengio (2012) showed that for most models, only a handful of hyperparameters actually matter, so a grid wastes most of its evaluations varying parameters that barely affect the outcome, while random search's independent sampling covers the important dimensions more efficiently.

**Tech stack:** `sklearn.model_selection.RandomizedSearchCV`.

```python
from sklearn.model_selection import RandomizedSearchCV
from scipy.stats import randint

param_distributions = {
    "n_estimators": randint(100, 600),
    "max_depth": randint(3, 20),
    "min_samples_leaf": randint(1, 15),
}

random_search = RandomizedSearchCV(
    RandomForestClassifier(random_state=42),
    param_distributions,
    n_iter=30,          # budget: only 30 combinations tried, not the full grid
    scoring="recall",
    cv=5,
    n_jobs=-1,
    random_state=42,
)
random_search.fit(X_train, y_train)
```

## 3. Bayesian Optimization

Both grid and random search treat every trial as independent — nothing learned from trial 1 informs trial 2. **Bayesian optimization** doesn't: it builds a probabilistic model (a **surrogate**, often a Gaussian Process) of how the objective score depends on the hyperparameters, and uses an **acquisition function** to decide the next combination to try, balancing exploration (trying uncertain regions) against exploitation (refining near the best result so far).

This makes it far more sample-efficient than grid or random search — valuable when each trial is expensive, like training a deep neural network for hours. The tradeoff is complexity: it needs a library (rarely worth hand-rolling) and doesn't parallelize as naturally as grid/random search, since each new trial ideally depends on the results of previous ones.

**Tech stack:** Optuna, Hyperopt, or Ray Tune (all wrap this pattern with far less boilerplate than a raw Gaussian Process implementation).

```python
import optuna
from sklearn.model_selection import cross_val_score

def objective(trial):
    n_estimators = trial.suggest_int("n_estimators", 100, 600)
    max_depth = trial.suggest_int("max_depth", 3, 20)
    min_samples_leaf = trial.suggest_int("min_samples_leaf", 1, 15)

    model = RandomForestClassifier(
        n_estimators=n_estimators,
        max_depth=max_depth,
        min_samples_leaf=min_samples_leaf,
        random_state=42,
    )
    return cross_val_score(model, X_train, y_train, cv=5, scoring="recall").mean()

study = optuna.create_study(direction="maximize")
study.optimize(objective, n_trials=30)   # same budget as the random search example, smarter about spending it
best_params = study.best_params
```

## Which one to reach for

| Method | Strategy | Best for | Downside |
|---|---|---|---|
| Grid Search | Exhaustive | Few hyperparameters, small ranges | Explodes combinatorially |
| Random Search | Random sampling | Larger search spaces, cheap trials | No learning between trials |
| Bayesian Optimization | Model-guided sampling | Expensive trials (deep learning) | Extra complexity, harder to parallelize |

As a default: start with random search for a cheap model, reach for Bayesian optimization once each training run is expensive enough that wasted trials actually cost real time.

## Further Reading

Bergstra and Bengio's *Random Search for Hyper-Parameter Optimization* (2012) formalized why random search often beats grid search per unit of compute. Snoek, Larochelle, and Adams' *Practical Bayesian Optimization of Machine Learning Algorithms* (2012) is the foundational paper behind using a surrogate model to guide the search, and Akiba et al.'s *Optuna* paper (2019) explains the reasoning behind the library used above. For the practical mechanics — cross-validation, avoiding test-set leakage during tuning — see the scikit-learn User Guide's "Tuning the hyper-parameters of an estimator."