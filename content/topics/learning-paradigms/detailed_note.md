# Learning Paradigms

## Motivation

Before you pick an algorithm, you need to know what kind of data you actually have. Do you have correct answers for every example, or none at all? Is labeling even possible for this problem, or is it too expensive to do at scale? The paradigm you're working in isn't a minor detail — it decides which entire families of algorithms are even applicable. Confusing "I don't have labels" with "I don't need labels" is a common way people pick the wrong tool for a problem.

## Supervised Learning

You have a dataset where every input comes paired with the correct output — an email tagged spam or not spam, a house with its sale price attached. The goal is to learn a function that generalizes from those examples to new, unseen inputs. This is the paradigm most people learn first, and it's the one most production ML systems still run on, because labeled data — however expensive to collect — gives you a very direct signal of what "correct" means.

→ See [Supervised Learning](/topic/supervised-learning) for the full picture.

## Unsupervised Learning

No labels at all. You're handed a pile of data and asked to find structure in it — which points naturally group together, which few dimensions actually explain most of the variation, what the data "looks like" underneath the noise. It's a fundamentally different kind of question than supervised learning, because there's no ground truth to check your answer against, only internal consistency.

→ See [Unsupervised Learning](/topic/unsupervised-learning) for the full picture.

## Semi-Supervised Learning

A small labeled set plus a much larger unlabeled one. This sits between the previous two — it exists because in most real problems, labels are the expensive part and raw data is cheap. Throwing away the unlabeled data (as pure supervised learning does) wastes information; ignoring the labels you do have (as pure unsupervised learning does) wastes the most reliable signal you own.

→ See [Semi-Supervised Learning](/topic/semi-supervised-learning) for the full picture.

## Self-Supervised Learning

A special case worth calling out on its own, because it's easy to confuse with semi-supervised learning: instead of relying on human-provided labels at all, you generate the labels automatically from the data itself — mask a word and predict it, rotate an image and predict the rotation. There's no "small labeled set" here; the supervision is manufactured, which is what let this paradigm scale to internet-sized datasets. It's the mechanism behind [BERT](/topic/bert)'s pretraining and most modern vision foundation models.

→ Covered in depth under [Self-Supervised Learning](/topic/self-supervised-learning) (Deep Learning).

## Reinforcement Learning

An agent takes actions in an environment and receives a reward signal, with the goal of learning a policy that maximizes cumulative reward over time. There's no dataset handed to you upfront the way there is in the other four paradigms — the agent has to generate its own experience by interacting with the environment, and it only finds out how good an action was, not what the best action would have been.

Modern AI's most visible use of this idea isn't robotics or game-playing anymore — it's aligning large language models. RLHF treats "does a human prefer this response" as the reward signal and nudges the model's behavior toward responses people rate more highly, using the same policy-and-reward machinery this paradigm is built on.

→ See [RL Foundations](/topic/rl-foundations) (LLM Engineering) for how this is actually applied to language models.

<details>
<summary>Math: how the paradigms differ formally</summary>

**Supervised learning:** given a dataset $\{(x_i, y_i)\}_{i=1}^n$ drawn from a joint distribution $P(X, Y)$, find $f: X \to Y$ minimizing expected loss $\mathbb{E}_{(x,y)}[\mathcal{L}(f(x), y)]$.

**Unsupervised learning:** given $\{x_i\}_{i=1}^n$ drawn from $P(X)$ alone, find structure — a density estimate $\hat{p}(x)$, a partition into clusters, or a lower-dimensional mapping $g: X \to Z$ that preserves what matters about $X$.

**Semi-supervised learning:** given a labeled set $\{(x_i, y_i)\}_{i=1}^{n_l}$ and an unlabeled set $\{x_j\}_{j=1}^{n_u}$ with $n_u \gg n_l$, use $P(X)$ estimated from the full pool to constrain or regularize the function learned from the labeled subset.

**Reinforcement learning:** an agent, environment, and reward function $(S, A, P, R)$ — states, actions, transition dynamics, and reward — with the objective of learning a policy $\pi(a \mid s)$ maximizing expected cumulative reward $\mathbb{E}\left[\sum_t \gamma^t R_t\right]$.

</details>

## Further reading

This is a standard taxonomy covered in most machine learning textbooks rather than something introduced by a single paper — see Tom Mitchell's "Machine Learning" (1997) or Bishop's "Pattern Recognition and Machine Learning" (2006) for the classical treatment.