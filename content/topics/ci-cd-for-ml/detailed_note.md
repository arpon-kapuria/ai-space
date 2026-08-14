# CI/CD for ML

## Motivation

Traditional CI/CD tests and ships code: a commit triggers tests, and if they pass, the new code goes to production. That pipeline assumes the only thing that changes between releases is code.

ML breaks that assumption. A "release" can happen without a single line of code changing — someone retrains on fresh data, or a nightly job kicks off automatically, and now there's a new model artifact that needs to go out. Regular CI/CD has no idea a model even exists, let alone how to test whether it's good enough to ship. It would happily deploy a model that's technically valid but far worse than the one it's replacing, because "the code compiled" was never a proxy for "the model is accurate."

CI/CD for ML keeps the good parts of CI/CD — automation, testing before shipping, fast rollback — and adds the checks and rollout steps a model specifically needs.

## Testing Pipelines

Regular CI checks that code runs without errors. ML testing pipelines check that in addition to the data and the model:

- **Data tests** — does the incoming data match the expected schema? Are there unexpected nulls, an out-of-range value, or a column that silently vanished?
- **Model tests** — does the newly trained model beat a minimum performance bar on a held-out test set? Does it beat the model currently in production, or at least not fall meaningfully short of it?
- **Behavioral tests** — for a handful of known, hand-picked inputs, does the model give a sane answer? This catches regressions that an aggregate metric can hide — a model's overall accuracy can hold steady while it quietly breaks on an important slice of the data.

Only a model that clears all three moves forward to deployment.

## Model Registries

A **model registry** is a central, versioned catalog of trained models — think of it as the model equivalent of a Docker image registry. Each entry records the model artifact itself, the metrics it scored, which data and code version produced it (traceable back to [Data Versioning](/topic/data-versioning)), and its current stage: staging, production, or archived.

The registry is what lets a rollback be a one-line operation instead of a fire drill: point production traffic back at the previous registry entry, rather than trying to find and re-run the old training job from scratch.

## Canary / Blue-Green Deployment

Even a model that passed every test can still fail in ways only real traffic reveals. Two deployment strategies exist to limit the damage if it does:

- **Canary deployment** — the new model gets a small slice of live traffic (say 5%) while the old model keeps serving the rest. If the new model's metrics hold up, its share of traffic is increased gradually until it fully replaces the old one. If something looks wrong, only that small slice of users was ever affected.
- **Blue-green deployment** — two full production environments run side by side: "blue" (currently live) and "green" (the new version). Once green is verified, traffic switches over all at once, usually via a router or load balancer flip. If a problem appears, traffic switches straight back to blue.

*Canary deployment* is ideal for **high-traffic microservices** and web applications where you want to **test new features** on a **tiny fraction of live users** first. It is usually implemented **within Kubernetes clusters** or at the **CDN edge layer** to safely measure real-world performance metrics before a global rollout.

*Blue-Green deployment* is best for **major monolithic upgrades** or **complex schema changes** where you must **switch 100% of user traffic instantly** between two identical environments. This strategy is typically deployed on **cloud load balancers** or traditional **virtual machines** to provide an **immediate, full-scale rollback** option if critical bugs appear.

## Where this fits

Together, a testing pipeline decides whether a model is *good enough to try*, a model registry tracks *which version is where*, and canary/blue-green deployment decides *how carefully to expose it to real traffic*. Once a model is live, whether that gradual rollout is actually going well is a job for [Monitoring & Observability](/topic/monitoring-and-observability), and whether a challenger model is genuinely better than the champion is decided formally in [A/B Testing & Online Evaluation](/topic/ab-testing-and-online-evaluation).

## Further reading

- [Google Cloud: MLOps — Continuous delivery and automation pipelines in machine learning](https://cloud.google.com/architecture/mlops-continuous-delivery-and-automation-pipelines-in-machine-learning)
- [Martin Fowler: BlueGreenDeployment](https://martinfowler.com/bliki/BlueGreenDeployment.html)