# Data Versioning

## Motivation

[MLOps Fundamentals](/topic/mlops-fundamentals) covered what goes wrong after a model ships — skew and drift. This note covers a problem that shows up earlier: reproducing the model in the first place.

Git solves this for code. Any commit hash gets you back to the exact source that built a given release. But a model isn't just code. It's code, plus a specific dataset, plus a specific set of hyperparameters, plus a specific set of library versions. Git tracks the first one well and the rest not at all.

Datasets are usually too large for Git, and they change constantly — new rows get appended, labels get corrected, a preprocessing script gets tweaked. Six months later, someone asks "what data trained the model currently in production?" and there's no good answer. Retraining on "the same" data quietly produces a different model, because the data was never actually pinned down. This is the reproducibility gap that data versioning closes.

## DVC (Data Version Control)

**DVC** extends Git's mental model to large files. Instead of storing a 50GB dataset directly in Git, DVC stores a small pointer file (a content hash) in Git, and the actual data sits in separate storage — S3, GCS, or a local drive.

Checking out an old Git commit checks out the old pointer file too. Running `dvc pull` then fetches the exact matching version of the data from storage. The result: `git checkout <commit>` reproduces both the code and the data it was paired with, not just the code.

This also make datasets diffable and shareable the way code already is — teammates `dvc pull` the right data version instead of emailing zip files around.

## Experiment Tracking (MLflow, Weights & Biases)

Pinning the data down answers "what data was used." It doesn't answer "what happened when we trained on it." A single project can easily produce hundreds of training runs — different learning rates, different architectures, different feature sets — and without a system, that history lives in scattered notebooks and someone's memory.

**Experiment tracking** tools like MLflow and Weights & Biases log, for every run: the hyperparameters used, the resulting metrics, the exact code version (often the Git commit hash), and the trained model artifact itself. Each run becomes a permanent, comparable record instead of a print statement someone forgot to save.

This turns "which run had the best validation F1, and what config produced it?" from an archaeology project into a filter on a dashboard.

## Data Lineage

**Data lineage** is the record of everywhere a piece of data came from and everywhere it went — which raw source it was extracted from, which transformations were applied, and which downstream model or report consumed it.

It matters for two very different reasons:

- **Debugging.** If a model's predictions suddenly look wrong, lineage lets you trace backward: which upstream table changed, and when, that could have caused it.
- **Compliance.** If a user asks to be forgotten under GDPR, lineage answers a much harder question than "delete this row from the database" — it tells you every downstream table, feature, and possibly even trained model that row's data flowed into.

Without lineage tracking, both of these become manual detective work across a maze of pipelines.

## Reproducible Environments

Even with the exact data and the exact code pinned, a training run can still fail to reproduce because of a fourth, easy-to-forget variable: the software environment itself. A different CUDA version, a different PyTorch minor version, or even a different underlying hardware architecture can produce a numerically different model from identical code and data.

The standard fix is to pin the environment as precisely as the code:

- A `requirements.txt` or `environment.yml` with **exact** pinned versions, not loose ranges.
- A Docker container, which pins the OS, system libraries, and drivers alongside the Python packages — the strongest guarantee, since it packages everything the code needs to run identically anywhere.

Between DVC (data), experiment tracking (runs and results), and a pinned environment (everything the code depends on to execute), a training run becomes fully reproducible: same code, same data, same environment, same result.

## Further reading

The [DVC documentation](https://dvc.org/doc) and [MLflow documentation](https://mlflow.org/docs/latest/index.html) are the best starting points for the two tools covered above, and Weights & Biases' [Experiment Tracking Guide](https://docs.wandb.ai/guides/track) covers the same workflow on that platform.