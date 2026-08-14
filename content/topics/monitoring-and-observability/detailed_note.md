# Monitoring & Observability

## Motivation

[MLOps Fundamentals](/topic/mlops-fundamentals) introduced *why* a model degrades — training-serving skew, data drift, concept drift. [CI/CD for ML](/topic/ci-cd-for-ml) covered how a new model safely reaches production in the first place. Neither one answers a question that only starts mattering after a model has been live for weeks: is it still doing well *right now*?

A one-off drift check, run by hand, only tells you about the moment you ran it. Drift doesn't announce itself — it creeps in gradually, between the times anyone thought to look. Monitoring & Observability turns drift detection from a manual, occasional check into an always-on system: dashboards, alerts, and logs that catch a problem the day it starts, not the day a user complains.

## Why ML Monitoring Isn't Just SWE Monitoring

Traditional software monitoring watches for **hard failures**: the server is down, a request threw an exception, latency spiked, error rate crossed a threshold. These failures are loud. Something visibly breaks, and an alert fires.

ML systems can fail **silently**. A model that's 15% less accurate than last month doesn't crash. It doesn't throw an exception. It returns a confident, well-formatted, completely wrong answer, and every traditional health check — uptime, latency, HTTP 200s — stays green the entire time. The service is "up." It's just wrong.

This is the core reason ML needs its own monitoring discipline on top of standard SWE monitoring, not instead of it:

| | Traditional SWE Monitoring | ML Monitoring |
|---|---|---|
| What fails | The system (crashes, timeouts, 5xxs) | The *predictions* (quietly wrong, system stays "up") |
| Failure signal | Loud — exceptions, error codes | Silent — no exception is thrown for a bad prediction |
| Ground truth | Not usually needed to detect a bug | Often delayed by hours, days, or never arrives at all |
| What changes | Code, deployed deliberately | Code *and* the real-world data distribution, which shifts on its own |
| Root cause | Usually a specific commit or config | Could be code, data, or the world changing — harder to isolate |

The delayed-ground-truth problem deserves its own callout: for a fraud model, the "was this actually fraud" label might arrive weeks later after a chargeback. For a churn model, "did they actually churn" is only known months out. ML monitoring has to lean on proxy signals — input drift, prediction distribution shifts, confidence scores — *before* the real label ever shows up, precisely because SWE-style "did it return the right answer" isn't available in real time.

## What Gets Tracked in Production

Production ML monitoring stacks four layers on top of each other. All four run simultaneously, on different tools, at different speeds.

1. **System metrics** (the SWE layer — still necessary, just not sufficient):
- **Latency (p50, p95, p99):** How long a request takes to get a response. To know whether the system is **fast enough for users** and to catch slow requests.
  - **p50:** Typical response time. To measure the **normal/average** experience.
  - **p95:** 95% of requests are this fast or faster. To find **noticeable slowness** that affects a significant group.
  - **p99:** 99% of requests are this fast or faster. To catch **rare but very slow requests and reliability** problems
- **Throughput (requests/sec):** How many requests the system can handle per second. To know **how much traffic the system can handle**.
- **Error rate:** The percentage of requests that fail. To measure **reliability** and detect problems.
- **Uptime / Availability:** How often the system is working and accessible. To make sure users can **use the system when they need it**.
- **GPU/CPU utilization:** How much of the available processing power is being used. To see whether resources are **underused or overloaded**.
- **Memory usage:** How much RAM/VRAM is being used. To prevent **out-of-memory failures** and understand resource needs.
- **Queue depth:** How many requests are waiting to be processed. To detect **backlogs and bottlenecks** before they hurt performance.

2. **Data quality metrics** (is the *input* healthy):
- Schema validation — expected columns present, expected types, no unexpected nulls
- Missing value rate, out-of-range values, duplicate records
- Freshness — how stale is the data feeding the model right now

3. **Model performance metrics** (is the *model* healthy):
- **Input/feature drift** — PSI, KS test, on individual features (from [MLOps Fundamentals](/topic/mlops-fundamentals))
- **Prediction drift** — has the distribution of the model's *outputs* shifted, even before drift shows up per-feature? Often the earliest warning sign, since it aggregates every input shift into one number.
- **Delayed ground-truth metrics** — accuracy, precision/recall, F1, RMSE, computed the moment real labels finally arrive, to confirm what drift metrics only implied
- **Confidence/calibration** — is the model's predicted probability still trustworthy, or has it grown over/under-confident
- **Outlier rate** — fraction of incoming requests that fall well outside the training distribution entirely

4. **Business metrics** (does it matter to the business):
- Conversion rate, revenue impact, user engagement, task completion — the numbers a model was built to move in the first place. A model can look statistically healthy on every metric above and still be failing the business goal it exists for, which is why this layer is never skipped even though it's the "softest" one to track.

5. **LLM-specific metrics**, on top of all four layers above:
- **Latency shape** — Time-to-First-Token (TTFT) and Time-Per-Output-Token (TPOT), tracked separately, since LLM latency is felt very differently by a user than a single flat "response time" number
- **Cost** — input/output token counts per request, and $ cost per request, tracked continuously (covered in depth under [LLM Cost & Pricing](/topic/llm-cost-and-pricing))
- **Output quality without ground truth** — hallucination rate, toxicity/safety scores, and increasingly LLM-as-judge scores run online against sampled production traffic (covered under [LLM Evaluation](/topic/llm-evaluation))
- **User feedback signals** — explicit (thumbs up/down) and implicit (did the user regenerate the response, abandon the session, or copy the answer out)
- **Guardrail trigger rate** — how often safety filters, PII redaction, or prompt-injection detectors actually fire
- **RAG-specific** — retrieval relevance (are the retrieved chunks actually useful) tracked separately from generation quality, since a bad answer could stem from either stage

## Frameworks & Tools, by What They're For

No single tool covers all four layers — production stacks combine several, each doing one job well.

- **System metrics & dashboards:** Prometheus (metric collection) + Grafana (dashboards) is the default open-source combo for latency/throughput/resource metrics; Datadog and New Relic are the common commercial APM alternatives.
- **Distributed tracing:** OpenTelemetry is the vendor-neutral standard for request tracing across services; Jaeger is a common backend for viewing the traces it produces.
- **Data quality / validation:** *Great Expectations* is the standard for defining and checking data schema/quality rules as code, usually run as a pipeline step before data ever reaches the model.
- **Drift & ML-specific observability platforms:** Evidently AI (open-source, drift + data quality reports), WhyLabs, Arize AI, and Fiddler are purpose-built ML observability platforms — they compute the drift/prediction-distribution metrics above and plug them into dashboards and alerting, so teams don't hand-roll PSI calculations in a cron job.
- **Experiment/run tracking that doubles as monitoring:** MLflow and Weights & Biases, already covered in [Data Versioning](/topic/data-versioning) for training runs, are increasingly used to log production inference too, closing the loop between training-time and serving-time metrics.
- **Error tracking:** Sentry, for catching and grouping the traditional software-layer exceptions — still relevant, since a model service is still a service.
- **Alerting:** PagerDuty and Opsgenie are the standard way threshold breaches, on any of the above, become an actual page to an on-call engineer rather than a chart nobody's watching.
- **LLM-specific observability:** LangSmith, LangFuse, and Helicone are purpose-built for the LLM layer — prompt/response logging, token/cost tracking, and tracing multi-step chains or agent calls, which general-purpose APM tools weren't designed to capture.

## Logging & Tracing

Drift detection and the metrics above answer *that* something changed in aggregate. They don't answer *what happened on one specific request* — which is what's actually needed to debug a bad prediction a user reported.

- **Logging** records the inputs, outputs, and intermediate values for individual requests, so a specific bad prediction can be inspected after the fact instead of reproduced from scratch.
- **Tracing** follows a single request across every service it touches — feature lookup, model inference, post-processing, or for an LLM, every step of a multi-call agent chain — and times each step. This is what turns "the API feels slow sometimes" into "step 3, the retrieval call, is the bottleneck." OpenTelemetry is the common standard for generating these traces regardless of stack.

Together they answer two different questions: logging answers "what did the model see and say," tracing answers "where did the time go, and in what order."

## LLM-Specific Observability, in Practice

LLM systems need this whole stack applied to something structurally different: the output is unstructured text, not a single number or class label, so many of the metrics above have to be reinvented for it.

- **Prompt/response logging** — the full prompt and full completion get logged for every call, since that's the only way to later audit *why* a model gave a specific bad answer. The same prompt template can behave differently depending on retrieved context, so the log has to capture the exact assembled prompt, not just the template.
- **Token usage tracking** — every call's input/output token counts get logged, since that's what cost is billed on. A sudden per-request token spike (a runaway agent loop, an oversized retrieved context) shows up as a cost anomaly before anyone notices a quality problem.
- These logs are also the raw material for LLM-as-judge evaluation, which needs a real record of prompts and completions to grade against — covered later under LLM Evaluation.

## Where this fits

Monitoring answers "is something wrong right now." It doesn't decide whether a *new* model is better than the one currently live — that comparison, made formally with real traffic, is [A/B Testing & Online Evaluation](/topic/ab-testing-and-online-evaluation).

## Further reading

- [Google SRE Book: Monitoring Distributed Systems](https://sre.google/sre-book/monitoring-distributed-systems/)
- [Evidently AI: Machine Learning Monitoring](https://www.evidentlyai.com/ml-in-production/model-monitoring)
- [OpenTelemetry Documentation](https://opentelemetry.io/docs/)