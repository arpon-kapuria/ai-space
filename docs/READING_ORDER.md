# Reading order — single source of truth.
# Used both as the human-readable curriculum path and as the sort
# order for the program (top to bottom = read order).
# To insert a new topic: add its slug on its own line, in the
# right place. No numbering, no metadata — position in this file
# IS the order.

# ===== Mathematics =====
linear-algebra
calculus-and-differentiation
probability-and-statistics
information-theory
optimization-theory
numerical-stability

# ===== Machine Learning =====
learning-paradigms
supervised-learning
unsupervised-learning
semi-supervised-learning
gradient-descent
loss-functions
bias-variance-tradeoff
linear-regression
logistic-regression
k-nearest-neighbors
support-vector-machines
naive-bayes
decision-tree
ensemble-methods
clustering
dimensionality-reduction
feature-engineering
regularization
evaluation-metrics
hyperparameter-tuning
ml-pipeline
ml-algorithm-selection-guide

# ===== Deep Learning =====
perceptron
mlp
activation-functions
backpropagation
gradient-instability
weight-initialization
normalization-techniques
optimizers
learning-rate-scheduling
generalization-techniques
autoencoders
self-supervised-learning
gnn
transfer-learning

# ===== Natural Language Processing =====
classical-nlp
language-modeling
word-embeddings
rnn
lstm
seq2seq
nlp-evaluation-metrics
attention-mechanism
tokenization
transformer
elmo
bert
sentence-bert
sequence-labeling
gpt-1
t5
state-space-models-mamba

# ===== Computer Vision =====
classical-cv
cnn
cnn-evolution
alexnet
vgg
resnet
inception
efficientnet
cv-evaluation-metrics
object-detection
r-cnn-family
yolo
ssd
image-segmentation
u-net
mask-r-cnn
deeplab
segment-anything-sam
vision-transformer
self-supervised-vision
clip
large-vision-models
document-understanding
video-understanding

# ===== Generative AI =====
autoregressive-generative-models
vae
gan
normalizing-flows
diffusion-models
multimodal-generative-models
comparing-generative-model-families

# ===== LLM Engineering =====
pretraining
mixture-of-experts
rl-foundations
fine-tuning
peft
embedding-fine-tuning
instruction-tuning
alignment
llm-landscape
prompt-engineering
long-context-techniques
rag
context-engineering
vector-databases
ai-agents-and-tool-use
harness-engineering
agentic-architectures
gpt-family
claude-family
llama-family
other-open-weight-models
llm-evaluation
llm-safety-and-security

# ===== Production AI =====
hardware-for-ai
gpu-programming
distributed-training
model-compression
parameter-and-memory-estimation
inference-engineering
request-lifecycle
prefill-vs-decode
kv-cache
batching-strategies
speculative-decoding
streaming-and-response-delivery
model-serving
inference-optimization
multi-lora-serving
local-and-edge-inference
llm-cost-and-pricing
cost-optimization
production-failure-modes
mlops-fundamentals
data-versioning
ci-cd-for-ml
monitoring-and-observability
ab-testing-and-online-evaluation
system-design