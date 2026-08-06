# ML Pipeline

## Motivation

Every topic covered elsewhere — [Feature Engineering](/topic/feature-engineering), [Bias-Variance Tradeoff](/topic/bias-variance-tradeoff), [Evaluation Metrics](/topic/evaluation-metrics), [Hyperparameter Tuning](/topic/hyperparameter-tuning) — is one piece of a larger workflow, looked at in isolation. In practice nobody just "runs a model." There's a full sequence of steps between a raw problem and a trained, trustworthy model, and knowing each piece individually isn't the same as knowing how they fit together in order.

This is also one of the most common interview formats in its own right: "walk me through how you'd approach this problem" is really asking you to narrate this pipeline, end to end, for a specific case. Being able to name *why* each stage exists — not just what it does — is usually what separates a strong answer from a list of buzzwords.

The code below threads through one running example — **Predicting customer churn** — so each stage builds on the last instead of sitting as a disconnected snippet.

## 1. Problem Framing

Before touching data: what's the **target variable**, what **problem type** is this (classification / regression / clustering / ranking), and what does success actually mean — to the business, not just to a metric? This is also where you set the **success metric** (the one the rest of the pipeline optimizes for), a **baseline** to beat, and real-world **constraints** like latency or interpretability.

A "problem spec" isn't literal production code, but writing it down explicitly — even as a config — forces these framing decisions to actually get made instead of being assumed implicitly.

**Tech stack:** usually just a doc or ticket (Notion, Jira, Confluence) shared with stakeholders — no ML tooling yet.

```python
problem_spec = {
    "objective": "Predict whether a customer will churn in the next 30 days",
    "problem_type": "binary_classification",
    "target_variable": "churned",
    "success_metric": "recall on the churned class",  # missing a churner costs more than a false alarm
    "constraints": {"interpretability": "medium", "latency_ms": 100},
}
```

## 2. Data Collection

Gather the data, and check whether it actually reflects what the model will see once deployed. A mismatch here — the training data looking different from what production data will look like — is called **training-serving skew**, covered in detail in [MLOps Fundamentals](/topic/mlops-fundamentals). Watch for **sampling bias** (the sample you collected doesn't represent the true population), and version your data so an experiment can be reproduced later known as [Data Versioning](/topic/data-versioning).

**Tech stack:** SQL / data warehouses (BigQuery, Snowflake), Spark for large-scale data, Airflow for scheduled pulls, DVC or lakeFS for data versioning.

```python
import pandas as pd

df = pd.read_csv("customers.csv")
print(df.shape)
print(df.head())
```

## 3. Exploratory Data Analysis (EDA)

Look at the data before modeling anything: distributions, correlations, outliers, missingness, class balance. **Univariate analysis** looks at one column at a time; **bivariate analysis** looks at relationships between two. This is usually where you first notice the specific problems Feature Engineering exists to fix — and where **class imbalance** (one class massively outnumbering the other) first shows up, which matters a lot for a churn problem where churners are the minority.

**Tech stack:** pandas, seaborn/matplotlib, or auto-EDA tools like `ydata-profiling` / Sweetviz for a fast first pass.

```python
df.info()
df.describe()
df.isnull().sum()                              # missingness

df["churned"].value_counts(normalize=True)     # class balance

import seaborn as sns
sns.heatmap(df.corr(numeric_only=True), annot=True)   # correlation matrix
sns.boxplot(x=df["monthly_charges"])                    # outlier detection
```

## 4. Data Splitting

Split into **train / validation / test** sets *before* fitting anything to the data. Getting this order wrong is exactly how **data leakage** happens — information from outside the training set quietly leaking into the model, making it look better than it actually is. Two classic examples: standardizing using statistics from the full dataset (test set included) before splitting, or including a feature that wouldn't be available at prediction time (e.g. "received a retention call" to predict churn, when that call only happened because the customer was already flagged as at-risk).

A **stratified split** keeps the class ratio consistent across splits — important under class imbalance. For time-series data, use a **time-based split** instead of a random one, or you leak the future into training.

**Tech stack:** `scikit-learn`'s `train_test_split` / `StratifiedKFold` for tabular data; custom time-based splitting for time series.

```python
from sklearn.model_selection import train_test_split

X = df.drop(columns=["churned"])
y = df["churned"]

X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, stratify=y, random_state=42
)
X_train, X_val, y_train, y_val = train_test_split(
    X_train, y_train, test_size=0.2, stratify=y_train, random_state=42
)
```

## 5. Feature Engineering

Scale numeric features, encode categoricals, handle missing values, and correct class imbalance if needed — fitting all of it **only on the training set**, then applying the same fitted transformation to validation and test. `Pipeline` and `ColumnTransformer` exist specifically to make that "fit on train, apply everywhere" discipline hard to get wrong by accident. Read more about [Feature Engineering](/topic/feature-engineering).

**Tech stack:** `scikit-learn` pipelines for most tabular work, `imbalanced-learn` (SMOTE) for imbalance, feature stores like Feast in production settings so training and serving reuse the exact same feature logic (ties back to training-serving skew).

```python
from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import StandardScaler, OneHotEncoder
from sklearn.impute import SimpleImputer

numeric_features = ["monthly_charges", "tenure_months"]
categorical_features = ["contract_type", "payment_method"]

numeric_pipeline = Pipeline([
    ("impute", SimpleImputer(strategy="median")),
    ("scale", StandardScaler()),
])
categorical_pipeline = Pipeline([
    ("impute", SimpleImputer(strategy="most_frequent")),
    ("encode", OneHotEncoder(handle_unknown="ignore")),
])

preprocessor = ColumnTransformer([
    ("num", numeric_pipeline, numeric_features),
    ("cat", categorical_pipeline, categorical_features),
])

# .fit_transform on train only; .transform (never fit again) on val/test
X_train_processed = preprocessor.fit_transform(X_train)
X_val_processed = preprocessor.transform(X_val)
X_test_processed = preprocessor.transform(X_test)
```

If churn is a rare class, correct the imbalance at this stage too:

```python
from imblearn.over_sampling import SMOTE

smote = SMOTE(random_state=42)
X_train_bal, y_train_bal = smote.fit_resample(X_train_processed, y_train)
```

## 6. Model Selection and Training

Start with a simple **baseline model** before trying more complex ones — you need something to measure the added complexity against. As you move to more expressive models, keep an eye on **underfitting** (too simple to capture the pattern) versus **overfitting** (fits training noise, doesn't generalize) — the practical face of the bias-variance tradeoff. 

Picking a good baseline isn't arbitrary — it depends on the problem type, data size, and how interpretable the result needs to be, which is exactly what the [ML Algorithm Selection Guide](/topic/ml-algorithm-selection-guide) walks through. Training also means choosing [Loss Functions](/topic/loss-function) — the thing the algorithm is actually minimizing (e.g. log loss for classification, MSE for regression) — and that choice should track the success metric from problem framing, not just default to whatever the library ships with.

**Tech stack:** `scikit-learn` for classical baselines, XGBoost/LightGBM/CatBoost for gradient-boosted trees (a common strong tabular baseline), PyTorch/TensorFlow once you move to deep learning.

```python
from sklearn.linear_model import LogisticRegression
from sklearn.ensemble import RandomForestClassifier

baseline = LogisticRegression(max_iter=1000)
baseline.fit(X_train_bal, y_train_bal)

candidate = RandomForestClassifier(random_state=42)
candidate.fit(X_train_bal, y_train_bal)
```

## 7. Hyperparameter Tuning

Tune using the validation set, or **k-fold cross-validation** if data is limited — never the test set, or you contaminate your one honest estimate of generalization. **Grid search** exhaustively tries every combination; **random search** samples combinations, which scales better; **Bayesian optimization** picks the next combination based on past results, which is more sample-efficient than either. More about [Hyperparameter Tuning](/topic/hyperparameter-tuning).

**Tech stack:** `GridSearchCV` / `RandomizedSearchCV` for small search spaces, Optuna or Ray Tune for larger ones.

```python
from sklearn.model_selection import GridSearchCV

param_grid = {
    "n_estimators": [100, 300, 500],
    "max_depth": [5, 10, None],
    "min_samples_leaf": [1, 5, 10],
}

grid_search = GridSearchCV(
    RandomForestClassifier(random_state=42),
    param_grid,
    scoring="recall",       # matches the success metric from problem framing
    cv=5,
    n_jobs=-1,
)
grid_search.fit(X_train_bal, y_train_bal)
best_model = grid_search.best_estimator_
```

## 8. Evaluation

Evaluate **exactly once** on the held-out test set, using metrics that reflect the business goal from step 1 — not just whichever metric is easiest to compute. For churn, recall on the churned class matters more than raw accuracy, since missing a churner is costlier than a false alarm. To read more about [Evaluation Metrics](/topic/evaluation-metrics).

**Tech stack:** `scikit-learn.metrics`, with experiment tracking (MLflow, Weights & Biases) to keep every run's metrics and hyperparameters comparable.

```python
from sklearn.metrics import classification_report, confusion_matrix, roc_auc_score

y_pred = best_model.predict(X_test_processed)
y_proba = best_model.predict_proba(X_test_processed)[:, 1]

print(classification_report(y_test, y_pred))
print(confusion_matrix(y_test, y_pred))
print("ROC-AUC:", roc_auc_score(y_test, y_proba))
```

## 9. Deployment and Monitoring

A model that performs well in evaluation isn't the same as a model that keeps performing well in production. **Model serialization** (saving the trained model to disk) is the last step here — everything after that, serving it behind an API, watching for drift, deciding when to retrain, is the subject of [MLOps Fundamentals](/topic/mlops-fundamentals).

**Tech stack:** `joblib`/`pickle` or ONNX for serialization, FastAPI/Flask for a serving endpoint, Docker + Kubernetes for deployment, MLflow Model Registry for versioning.

```python
import joblib

joblib.dump(best_model, "churn_model.pkl")
joblib.dump(preprocessor, "preprocessor.pkl")

# loaded later, in a serving environment:
# model = joblib.load("churn_model.pkl")
# preprocessor = joblib.load("preprocessor.pkl")
# prediction = model.predict(preprocessor.transform(new_customer_df))
```

---

## Notes

Despite being described as a sequence, this rarely runs top to bottom exactly once. Evaluation results routinely send you back to try different features, a different model, or even a reframed problem definition. Monitoring in production can reveal the data has drifted from what the model was trained on, sending you back to data collection. Treating this as a strict, one-directional pipeline is a simplification useful for explaining it — the real process loops back constantly, and saying so out loud is usually a good way to close out an interview answer on this topic.