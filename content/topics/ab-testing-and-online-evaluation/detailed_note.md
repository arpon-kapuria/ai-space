# A/B Testing & Online Evaluation

## Motivation

[CI/CD for ML](/topic/ci-cd-for-ml) covered testing pipelines — checking that a new model beats a minimum bar on a held-out test set before it ships. That test set is offline: static data, collected once, no real users involved.

Offline metrics can mislead. A model can score higher on a held-out set and still perform worse in the real world, because the test set doesn't perfectly capture what real users actually do — how they react to a recommendation, whether they click, whether a slightly different tone in a generated response changes engagement. The only way to know for certain is to show the new model to real traffic and measure what actually happens. That's what A/B testing and online evaluation exist to do, safely, without betting the entire user base on an unproven model.

## What A/B Testing Actually Is

**A/B testing** is a controlled experiment: real users are randomly split into two (or more) groups, each group sees a different version — A, the current system, and B, the candidate — and a predefined metric decides which one wins.

The word "randomly" is doing the important work. Random assignment is what makes the comparison fair: if the two groups are statistically similar in every other way (same mix of new vs. returning users, same mix of devices, same time-of-day patterns), then any *difference* in the outcome metric can be attributed to the thing that actually changed — which version they saw — rather than to some other underlying difference between the groups.

**Online evaluation** is the broader umbrella A/B testing sits under: any evaluation method that uses real, live traffic rather than a static offline dataset. A/B testing is the most common form, but not the only one — shadow deployment and multi-armed bandits, both covered below, are also online evaluation, just structured differently.

## What Has to Be Decided Before Running One

A test isn't just "split traffic and see what happens." Getting a trustworthy answer means fixing several things in advance, before a single user is exposed:

- **The primary metric (the OEC — Overall Evaluation Criterion).** One metric, chosen before the test starts, decides the winner. Picking a metric that "looks good" after peeking at partial results defeats the entire point of the test — this is a common enough mistake that it has its own name, *p-hacking*.
- **Guardrail metrics.** Metrics that must *not* get worse, even if the primary metric improves — latency, error rate, unsubscribe rate. A model that lifts conversion 2% but doubles page load time is not a win; guardrails catch that trade-off automatically.
- **Sample size and statistical power.** How many users need to see each version before a real difference can be told apart from random noise. Too small a sample, and even a real effect won't reach statistical significance; this is calculated in advance from the expected effect size and the traffic volume available.
- **Test duration.** Long enough to cover a full weekly cycle (weekday vs. weekend behavior differs) and long enough to outlast **novelty effects** — users often react differently to something simply because it's *new*, not because it's better, and that effect fades within the first days of exposure.
- **Statistical significance.** Once results come in, a hypothesis test (commonly a `t-test` for continuous metrics like revenue, or a `chi-square test` for conversion-style binary outcomes) produces a `p-value` — the probability of seeing this large a difference if there were actually no real difference at all. The conventional bar is `p < 0.05`, alongside a confidence interval on the effect size itself, not just a single pass/fail number.

## Common Pitfalls

- **Sample Ratio Mismatch (SRM).** If the traffic split was supposed to be 50/50 but the actual observed split is meaningfully off — say 52/48 with a large sample — something is broken in the assignment mechanism itself, and the whole test's results become untrustworthy until that's fixed. Checking for SRM is a standard sanity check before trusting any other result.
- **The multiple-testing problem.** Checking many metrics at once inflates the odds that *something* looks "significant" purely by chance — the more metrics tested, the higher the chance of a false positive. Pre-registering a single primary metric (per the OEC above) is the main defense.
- **Network effects / interference.** If A-group and B-group users interact with each other — a social feed, a two-sided marketplace, a chat feature — one group's behavior can leak into and contaminate the other's outcomes, violating the assumption that each user's outcome is independent of how anyone else was assigned. Marketplace and social-network experiments often need cluster-based or geographic randomization instead of per-user randomization to get around this.
- **Peeking.** Checking results daily and stopping the moment they look significant is a subtly biased way to run a test — significance calculated for a fixed sample size doesn't hold if the stopping point itself was chosen based on the data. Sequential testing methods exist specifically to allow valid early stopping, but a naive "check and stop when it looks good" approach does not.

## Shadow Deployment

Before risking real users on a new model at all, **shadow deployment** runs the candidate alongside the live model on real traffic — but only the live model's output is ever shown to users. The candidate's predictions are logged and compared against the live model's, silently.

This catches the most basic failure mode for free: does the new model crash, time out, or return something obviously broken under real production load? Shadow deployment answers that with zero user-facing risk. What it can't tell you is whether users actually *prefer* the new model's answers — for that, real users need to see it, which is what A/B testing is for.

## Champion / Challenger

**Champion/challenger** is the general pattern underlying most online model comparisons: the **champion** is the model currently serving production traffic, and the **challenger** is the candidate trying to prove it's better. A challenger doesn't replace the champion just by existing — it earns the spot by winning an A/B test on live traffic, following the process described above. Only after winning does it get promoted, usually via the gradual canary rollout already covered in [CI/CD for ML](/topic/ci-cd-for-ml), rather than an instant full swap.

## Multi-Armed Bandits (the Alternative to a Fixed Split)

A standard A/B test commits to a fixed traffic split — say 50/50 — for the entire test duration, even while it's becoming increasingly clear which version is winning. That's wasteful: every user shown the losing version during that time is a user who got a worse experience for the sake of statistical rigor.

**Multi-armed bandits** address this by continuously shifting more traffic toward whichever version is currently performing best, while still sending a smaller fraction to the others to keep learning — the classic *explore-exploit* trade-off. **Contextual bandits** go further, choosing the best version *per user* based on that user's context (device, location, history) rather than picking one global winner for everyone.

The trade-off: bandits optimize for outcome during the test itself, which is valuable when the cost of showing users a worse version is high. But because traffic isn't held at a fixed ratio, the statistical guarantees are weaker than a clean A/B test's — bandits are the right tool when speed of convergence matters more than a rigorous, reportable p-value.

## Interleaving (Search & Ranking)

For search and ranking systems specifically, **interleaving** offers a more sensitive alternative to a full A/B test: instead of splitting *users* between two ranking algorithms, results from both algorithms are merged into a single result list shown to *every* user, and clicks are attributed back to whichever algorithm contributed each result. Because every user acts as their own control, interleaving typically needs far less traffic than a standard A/B test to detect a real difference — a meaningful advantage on lower-traffic search products.

## Online Evaluation for LLMs

LLM output is unstructured text, not a click or a conversion, so "did version B win" needs different signals layered on top of everything above:

- **Explicit feedback** — thumbs up/down, star ratings — direct but sparse, since most users never click either button.
- **Implicit feedback** — did the user regenerate the response, copy it out, abandon the session, or continue the conversation productively? These fire on every interaction, not just the rare explicit ones, which makes them a denser (if noisier) signal.
- **Online LLM-as-judge** — a separate model grades sampled live responses against a rubric, giving a proxy for quality at a scale human review can't match; covered in depth under LLM Evaluation.

These online signals get compared between champion and challenger the same way a conversion rate would be — same OEC-and-guardrail-metric discipline, just with LLM-appropriate metrics substituted in.

## Where this fits

Shadow deployment de-risks "does it even work" with zero user exposure. A/B testing (or a bandit, when convergence speed matters more than rigor) then answers the harder question — "is it actually better" — with real users, under the champion/challenger framing. Together with [Monitoring & Observability](/topic/monitoring-and-observability) watching for problems throughout, this closes the loop [MLOps Fundamentals](/topic/mlops-fundamentals) opened: a model goes from "retrained" to "proven better in production," never risking the whole user base on an unproven guess.

## Further reading

Kohavi, Tang & Xu's book [*Trustworthy Online Controlled Experiments*](https://www.cambridge.org/core/books/trustworthy-online-controlled-experiments/D97B26382EB0EB2DC2019A7A7B518F59) is the standard reference for everything on A/B Testing, Google's paper on [overlapping experiment infrastructure](https://research.google/pubs/overlapping-experiment-infrastructure-more-better-faster-experimentation/) covers how large-scale experimentation platforms are actually built, and [Chapelle, Joachims, Radlinski & Yue's paper on interleaved search evaluation](https://dl.acm.org/doi/10.1145/2229179.2229181) is the reference for the interleaving technique.