# MLOps Fundamentals

## Motivation

[ML Pipeline](/topic/ml-pipeline) ends with a model that scored well on a held-out test set. But a test set is static, and the real world isn't — the data flowing into the model tomorrow won't look exactly like the data it was trained on last month. **MLOps** is the discipline of keeping a model reliable *after* deployment: noticing when it's silently going stale, catching that before users do, and having a repeatable process to fix it.

This note covers the two failure modes that make MLOps necessary in the first place — a deployed model doesn't stay accurate forever, and it can even go wrong on day one if the pipeline serving it isn't built carefully. Everything that follows in Production (versioning, CI/CD, monitoring infrastructure, deployment strategies) exists to catch and fix these two problems at scale; this is the "why" before the "how."

## Training-Serving Skew

**Training-serving skew** is when the features a model sees in production are computed differently from how they were computed during training — same feature name, different actual values. It's one of the most common (and most silent) ways a model underperforms right after launch, even though nothing about the model itself is wrong.

Typical causes:
- Training computes a feature in a batch pandas/SQL job; serving computes "the same" feature in a different, hand-rewritten online service — subtle bugs creep in between the two implementations.
- A feature available at training time (computed with hindsight, e.g. "total purchases this month") isn't actually available yet at prediction time in production.
- Missing-value handling or encoding logic drifts out of sync between the offline training pipeline and the online serving code.

The fix is architectural, not statistical: reuse the *exact same* feature computation code (or the exact same `Pipeline`/`ColumnTransformer` object, as in [ML Pipeline](/topic/ml-pipeline)) for both training and serving, rather than reimplementing it twice. A **feature store** formalizes this — a system that computes and serves features consistently for both training (offline) and inference (online). Feast/Tecton-style feature stores, and the broader question of how a model actually gets served, are covered under Model Serving.

## Data Drift vs. Concept Drift

Training-serving skew is a bug you can fix once. Drift is different — it's the data itself changing over time, so even a perfectly-built pipeline degrades eventually. Both drift types describe a model getting worse without any code change, but the cause differs, which matters because the fix differs too.

- **Data drift** (a.k.a. covariate shift): the distribution of the *input* features, P(X), changes. E.g. a churn model trained mostly on month-to-month contracts starts seeing mostly annual-contract customers after a pricing change. The relationship between X and y hasn't changed — but the model is now operating outside the region it learned well.
- **Concept drift**: the relationship between inputs and target, P(y | X), itself changes. E.g. "high monthly charges" used to predict churn strongly, but after a competitor's price hike it no longer does — same customer profile, different outcome.
- **Label drift**: the distribution of the target itself, P(y), changes (e.g. churn rate genuinely rising company-wide) — worth distinguishing from the two above since it can happen even with a perfectly accurate, undrifted model.

Detecting drift means comparing a recent window of production data against the training distribution:

```python
from scipy.stats import ks_2samp

# Kolmogorov–Smirnov test: are these two samples from the same distribution?
statistic, p_value = ks_2samp(training_monthly_charges, production_monthly_charges)
if p_value < 0.05:
    print("Distribution has likely shifted — investigate drift")
```

A metric used heavily in industry for this is the **Population Stability Index (PSI)**, which buckets a feature into bins and compares the proportion of data in each bin between training and production:

```python
import numpy as np

def population_stability_index(expected, actual, bins=10):
    breakpoints = np.percentile(expected, np.linspace(0, 100, bins + 1))
    expected_pct = np.histogram(expected, breakpoints)[0] / len(expected)
    actual_pct = np.histogram(actual, breakpoints)[0] / len(actual)
    # avoid divide-by-zero / log(0) on empty bins
    expected_pct = np.clip(expected_pct, 1e-6, None)
    actual_pct = np.clip(actual_pct, 1e-6, None)
    return np.sum((actual_pct - expected_pct) * np.log(actual_pct / expected_pct))

# rule of thumb: PSI < 0.1 no significant shift, 0.1-0.25 moderate, > 0.25 significant
```

This is the statistical core of what Drift Detection and Monitoring & Observability build into always-on production systems — dashboards, alerting thresholds, and automated retraining triggers, rather than a one-off script.

## Where the rest of this lives

MLOps as a whole is bigger than these two concepts — this note is deliberately just the foundation. The rest of the workflow it motivates is split across dedicated topics:

- [Data Versioning](/topic/data-versioning) — DVC, experiment tracking (MLflow, Weights & Biases), data lineage, reproducible environments. How you make a training run reproducible in the first place.
- [CI/CD for ML](/topic/ci-cd-for-ml) — testing pipelines, model registries, canary/blue-green deployment. How a retrained model safely replaces the one in production.
- [Monitoring & Observability](/topic/monitoring-and-observability) — drift detection, logging & tracing, and LLM-specific observability (prompt/response logging, token usage). How the drift concepts above run continuously in production rather than as a one-off check.
- [A/B Testing & Online Evaluation](/topic/ab-testing-and-online-evaluation) — shadow deployment, champion/challenger. How you decide a new model is actually better before it fully replaces the old one.

Modern model serving infrastructure itself is covered separately under [Model Serving](/topic/model-serving) and [Inference Optimization](/topic/inference-optimization), since for LLMs specifically it's a large enough topic — [GPU memory](/topic/hardware-for-ai), [Batching](/topic/batching-strategies), [KV cache](/topic/kv-cache) — to warrant its own section rather than a subsection here.

## How this loops back

Nothing here is a one-time setup. A drift alert sends you back to [ML Pipeline](/topic/ml-pipeline)'s data collection or feature engineering stage; a training-serving skew bug sends you back to how features are computed in the first place. MLOps isn't a separate pipeline bolted onto the end of the ML lifecycle — it's the reason the lifecycle keeps looping instead of running once.