# Q-Learning

## The Q-function

Q-learning learns a function Q(state, action) estimating the total expected future reward of taking that action in that state and then acting optimally afterward. Once learned, the optimal policy is simply to pick the action with the highest Q-value in each state.

## The update rule

After observing a transition, Q-learning updates its estimate toward the observed reward plus the discounted value of the best action in the next state — a form of bootstrapping known as temporal-difference learning.

## Off-policy learning

Q-learning is off-policy: it can learn the optimal policy's values while actually behaving differently, such as exploring randomly. This lets it reuse past experience freely, which is central to why it works well with experience replay.

## Scaling to deep Q-networks

For environments with huge or continuous state spaces, a neural network replaces the lookup table for Q, giving Deep Q-Networks (DQN) — the algorithm behind early landmark results like learning to play Atari games from raw pixels.

