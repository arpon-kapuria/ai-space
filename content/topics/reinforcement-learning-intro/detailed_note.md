# Reinforcement Learning

## The agent-environment loop

At each time step, an agent observes the state of its environment, takes an action, and receives a reward along with a new state. The agent's goal is to learn a policy — a mapping from states to actions — that maximizes cumulative reward over time.

## Exploration vs exploitation

An agent must balance exploiting actions it already knows are good against exploring new actions that might be better. Too little exploration gets stuck in a mediocre policy; too much wastes reward chasing unknowns.

## Value functions and policies

Value-based methods learn to estimate how good each state or action is and act greedily with respect to that estimate. Policy-based methods instead directly learn the mapping from states to actions, which scales better to continuous action spaces.

## Where RL is actually used

Beyond games and robotics, RL's biggest recent impact has been RLHF for aligning language models — using human preferences as the reward signal instead of a hand-coded environment reward.

