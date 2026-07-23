# RLHF (Reinforcement Learning from Human Feedback)

## Why not just supervised fine-tuning

Writing an ideal response by hand for every possible prompt doesn't scale, and 'good' is often easier to recognize than to produce. RLHF instead collects human preference comparisons between candidate responses and uses that signal to steer the model.

## Reward modeling

A separate reward model is trained to predict which of two responses a human would prefer, based on a dataset of labeled comparisons. That learned reward function then substitutes for a human in the loop during large-scale training.

## Policy optimization

The language model is then treated as a policy and updated with reinforcement learning — commonly PPO, or increasingly simpler alternatives like DPO — to increase the reward model's score on its generations, while a penalty keeps it from drifting too far from its starting behavior.

## What it actually changes

RLHF mostly reshapes style, helpfulness, and safety behavior on top of capabilities the base model already has from pretraining — it is not primarily where a model learns new facts or reasoning ability.

