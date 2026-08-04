# AI-Dictionary Guide

Modern AI knowledge is fragmented. Definitions live in one place, research papers in another, tutorials somewhere else, and the relationships between concepts are often left for you to figure out.

AI-Dictionary is an attempt to organize that knowledge into a single visual reference. Instead of treating concepts as isolated entries, it connects them into a knowledge graph where every concept is linked to the ideas that explain it, build upon it, or apply it. The goal isn't just to define terms—it's to provide context.

All topics are divided into eight categories (though more maybe be added in the future, if needed). Since many concepts overlap across multiple areas and are often adapted to different domains, assigning each topic to a single category was challenging. The categorization is therefore based on where each topic fits most naturally and the primary problem it was originally introduced to solve, even when the boundaries are not perfectly defined.

**Categories**

1. Maths
2. Machine Learning
3. Deep Learning
4. Natural Language Processing
5. Computer Vision
6. Generative AI
7. LLM Engineering
8. Production AI

I have tried to present a clear picture of the field's evolution. The topics are arranged in roughly chronological order so readers can understand how each new idea emerged to address the limitations of previous approaches. As the field continues to evolve, new topics will be added accordingly.

## Writing Convention

Every topic has two types of notes: **Short Notes** and **Detailed Notes**. 

When a node is clicked (or tapped on mobile), it opens a side panel (or a bottom sheet on mobile) containing the **Short Note**,  which provides the core idea of the topic. From there you can navigate to the corresponding **Detailed Note** for an in-depth explanation. 

The **Detailed Note** is organized into multiple sections, and whenever applicable, includes implementation details, code examples, references, and additional learning resources. 

One section is common to every detailed note: **Motivation**.

The **Motivation** section explains the limitations of previous approaches, why the current idea was introduced, and how it addresses those limitations. Starting every note with this section makes it easier to understand the evolution of ideas and quickly recall the intuition behind a concept without having to read the entire note.

## Topic Organization

### Mathematics

- [ ] Linear Algebra
  - [ ] Vectors & Matrices
  - [ ] Matrix Multiplication as Transformation
  - [ ] Eigenvalues & Eigenvectors
  - [ ] Singular Value Decomposition (SVD)
  - [ ] Norms (L1, L2, Frobenius)
- [ ] Calculus & Differentiation
  - [ ] Derivatives & Partial Derivatives
  - [ ] Chain Rule
  - [ ] Gradients, Jacobians, Hessians
  - [ ] Taylor Series
- [ ] Probability & Statistics
  - [ ] Descriptive Statistics (Mean, Median, Mode, Variance, Standard Deviation)
  - [ ] Quantiles & Percentiles
  - [ ] Skewness & Kurtosis
  - [ ] Distributions (Gaussian, Bernoulli, Binomial)
  - [ ] Bayes' Theorem
  - [ ] Maximum Likelihood Estimation (MLE) & MAP
  - [ ] Central Limit Theorem
  - [ ] Hypothesis Testing (p-values, Confidence Intervals)
- [ ] Information Theory
  - [ ] Entropy
  - [ ] Cross-Entropy
  - [ ] KL Divergence
  - [ ] Mutual Information
- [ ] Optimization Theory
  - [ ] Convexity
  - [ ] Constrained Optimization (Lagrange Multipliers, KKT Conditions)
  - [ ] Local Minima & Saddle Points
- [ ] Numerical Stability
  - [ ] Floating-Point Representation
  - [ ] Log-Sum-Exp Trick
  - [ ] Softmax Overflow

### Machine Learning

- [x] Learning Paradigms
  - [x] Supervised Learning
  - [x] Unsupervised Learning
  - [x] Semi-Supervised Learning
  - [x] Self-Supervised Learning 
  - [x] Reinforcement Learning 
- [x] Supervised Learning
- [x] Unsupervised Learning
- [x] Semi-Supervised Learning
- [x] Gradient Descent
  - [x] Batch, Stochastic, Mini-batch
  - [x] Convergence behavior (Optimization Theory)
  - [ ] Code
- [x] Linear Regression
  - [ ] Code
- [x] Logistic Regression
  - [ ] Code
- [x] Bias-Variance Tradeoff
  - [x] Cross-Validation
- [x] Regularization
  - [x] L1 (Lasso)
  - [x] L2 (Ridge)
  - [x] Elastic Net
  - [ ] Code
- [x] k-Nearest Neighbors 
  - [x] Curse of Dimensionality
  - [ ] Code
- [x] Naive Bayes 
  - [ ] Code
- [x] Decision Tree 
  - [ ] Code
- [x] Ensemble Methods
  - [x] Bagging
  - [x] Random Forest
  - [x] Boosting (AdaBoost, Gradient Boosting) 
  - [x] XGBoost / LightGBM
  - [ ] Code
- [x] Support Vector Machines
  - [ ] Code
- [x] Clustering
  - [x] k-Means
  - [x] Hierarchical
  - [x] DBSCAN
  - [x] Gaussian Mixture Models (GMM)
  - [ ] Code
- [ ] Dimensionality Reduction
  - [ ] PCA
  - [ ] t-SNE
  - [ ] UMAP
- [ ] Feature Engineering
  - [ ] Scaling / Encoding
  - [ ] Missing Data
  - [ ] Class Imbalance (SMOTE, class weights)
- [ ] Evaluation Metrics
  - [ ] Precision / Recall / F1
  - [ ] ROC-AUC vs PR-AUC
  - [ ] Confusion Matrix
- [ ] Hyperparameter Tuning
  - [ ] Grid Search
  - [ ] Random Search
  - [ ] Bayesian Optimization

### Deep Learning

- [ ] Perceptron
- [ ] MLP
  - [ ] Kolmogorov-Arnold Networks (KAN) — brief mention as a recent alternative
- [ ] Activation Functions
  - [ ] Sigmoid / Tanh
  - [ ] ReLU / Leaky ReLU
  - [ ] GELU / Swish
- [ ] Loss Functions
  - [ ] MSE / Huber Loss
  - [ ] Binary Cross-Entropy vs. Categorical Cross-Entropy
  - [ ] Hinge Loss
  - [ ] KL Divergence
- [ ] Backpropagation
- [ ] Gradient Instability
  - [ ] Vanishing Gradients
  - [ ] Exploding Gradients
- [ ] Weight Initialization
  - [ ] Xavier / Glorot
  - [ ] He Initialization
- [ ] Optimizers
  - [ ] SGD
  - [ ] Momentum
  - [ ] Nesterov Accelerated Gradient
  - [ ] Adagrad
  - [ ] RMSprop
  - [ ] Adam / AdamW
- [ ] Learning Rate Scheduling
  - [ ] Step Decay
  - [ ] Cosine Annealing
  - [ ] Warmup
  - [ ] One-Cycle Policy
- [ ] Normalization Techniques
  - [ ] BatchNorm
  - [ ] LayerNorm
  - [ ] RMSNorm
- [ ] Generalization Techniques
  - [ ] Dropout
  - [ ] Weight Decay
  - [ ] Early Stopping
  - [ ] Data Augmentation
  - [ ] Label Smoothing
- [ ] Autoencoders
  - [ ] Representation Learning
- [ ] Self-Supervised Learning
  - [ ] Contrastive Learning
  - [ ] Pretext Tasks
- [ ] GNN
  - [ ] GCN
  - [ ] GraphSAGE
  - [ ] GAT
- [ ] Transfer Learning

### Natural Language Processing

- [ ] Classical NLP 
  - [ ] Pre-Neural Era
  - [ ] Rule-Based / Symbolic Systems
  - [ ] Bag-of-Words & TF-IDF
  - [ ] N-gram Models
  - [ ] Hidden Markov Models (HMM)
  - [ ] Conditional Random Fields (CRF)
  - [ ] Statistical Machine Translation
- [ ] Language Modeling
  - [ ] N-gram → Neural LM (Bengio 2003)
  - [ ] Perplexity
- [ ] Word Embeddings
  - [ ] Word2Vec (CBOW / Skip-gram)
  - [ ] GloVe
  - [ ] fastText
- [ ] RNN
- [ ] LSTM
  - [ ] GRU (variant)
- [ ] Seq2Seq 
  - [ ] Encoder-Decoder
  - [ ] Teacher Forcing
  - [ ] Beam Search
- [ ] NLP Evaluation Metrics
  - [ ] BLEU
  - [ ] ROUGE
  - [ ] METEOR
- [ ] Attention Mechanism
  - [ ] Bahdanau (Additive) Attention
  - [ ] Luong (Multiplicative) Attention
  - [ ] Self-Attention
  - [ ] Multi-Head Attention
- [ ] Tokenization
  - [ ] Byte-Pair Encoding (BPE)
  - [ ] WordPiece
  - [ ] SentencePiece / Unigram
- [ ] Transformer
  - [ ] Positional Encoding
  - [ ] Encoder-Decoder vs. Decoder-Only
- [ ] ELMo
  - [ ] Deep Bidirectional LSTM (Contextual Embeddings)
- [ ] BERT
  - [ ] Masked LM
  - [ ] Next Sentence Prediction (NSP)
  - [ ] Fine-Tuning Paradigm
  - [ ] Variations: RoBERTa, DistilBERT, ALBERT, ELECTRA, XLNet
- [ ] Sentence-BERT 
  - [ ] Siamese / Triplet Networks
  - [ ] Pooling Strategies
  - [ ] Multiple Negatives Ranking Loss
  - [ ] Sentence-Transformers Library
  - [ ] Library Extensions (MPNet, MiniLM)
- [ ] Sequence Labeling 
  - [ ] NER & POS Tagging
  - [ ] HMM → CRF → BiLSTM-CRF → BERT-based
- [ ] GPT-1
  - [ ] Generative Pretraining + Fine-Tuning
- [ ] T5
  - [ ] Text-to-Text Unification
- [ ] State Space Models (Mamba)
  - [ ] S4
  - [ ] Mamba
  - [ ] Mamba-2 / Hybrid Architectures (Jamba-style)

### Computer Vision

- [ ] Classical CV
  - [ ] Edge Detection (Sobel, Canny)
  - [ ] SIFT / HOG
- [ ] CNN
  - [ ] Convolution & Pooling
  - [ ] Parameter Sharing & Receptive Fields
- [ ] CNN Evolution (quick-prep overview)
- [ ] AlexNet
- [ ] VGG
- [ ] ResNet
  - [ ] Residual Connections
- [ ] Inception
- [ ] EfficientNet
- [ ] CV Evaluation Metrics
  - [ ] IoU
  - [ ] mAP
  - [ ] Dice Coefficient
- [ ] Object Detection (quick-prep overview)
- [ ] R-CNN Family
  - [ ] R-CNN → Fast R-CNN → Faster R-CNN
- [ ] YOLO
- [ ] SSD
- [ ] Image Segmentation (overview)
  - [ ] Semantic vs. Instance vs. Panoptic
  - [ ] FCN (as the opening "what it got wrong")
- [ ] U-Net
- [ ] Mask R-CNN
- [ ] DeepLab
- [ ] Segment Anything (SAM)
- [ ] Vision Transformer
  - [ ] Patch Embeddings
- [ ] Self-Supervised Vision
  - [ ] SimCLR
  - [ ] MAE
  - [ ] DINO
- [ ] CLIP
  - [ ] Contrastive Image-Text Pretraining
- [ ] Large Vision Models
  - [ ] Foundation Vision Encoders (DINOv2, SAM, CLIP)
- [ ] Document Understanding
  - [ ] OCR Pipeline
  - [ ] Layout Analysis
  - [ ] LayoutLM Family
  - [ ] Document VQA
- [ ] Video Understanding
  - [ ] Action Recognition
  - [ ] 3D-CNN / I3D
  - [ ] Video Transformers (brief)

### Generative AI

- [ ] Autoregressive Generative Models
  - [ ] PixelRNN / PixelCNN
- [ ] VAE
  - [ ] Reparameterization Trick
  - [ ] β-VAE
- [ ] GAN
  - [ ] DCGAN
  - [ ] Conditional GAN
  - [ ] StyleGAN
  - [ ] CycleGAN
- [ ] Normalizing Flows
  - [ ] NICE
  - [ ] RealNVP
  - [ ] Glow
- [ ] Diffusion Models
  - [ ] DDPM
  - [ ] Latent Diffusion (Stable Diffusion)
  - [ ] Classifier-Free Guidance
- [ ] Multimodal Generative Models
  - [ ] Text-to-Image (DALL-E)
  - [ ] Image-to-Text: Flamingo → BLIP-2 → LLaVA
- [ ] Comparing Generative Model Families

### LLM Engineering

<!-- Phase 1: Building & Aligning the Model -->
- [ ] Pretraining
  - [ ] Scaling Laws (Chinchilla)
  - [ ] Data Curation & Mixture
  - [ ] Compute-Optimal Training
- [ ] Mixture of Experts
  - [ ] Switch Transformer
  - [ ] Mixtral
  - [ ] Routing & Load Balancing
- [ ] RL Foundations
  - [ ] Policy / Reward / Advantage
  - [ ] PPO Basics
- [ ] Fine-Tuning (evolution overview)
  - [ ] Full Fine-Tuning
  - [ ] Feature-Based Transfer
  - [ ] Adapter Layers
  - [ ] LoRA / PEFT (brief — see own node)
  - [ ] Instruction Tuning / SFT (brief — see own node)
  - [ ] Alignment - RLHF / DPO (brief — see own node)
- [ ] LoRA & PEFT
  - [ ] LoRA
  - [ ] QLoRA
  - [ ] Prefix Tuning
  - [ ] Adapters
- [ ] Embedding Fine-Tuning
  - [ ] Contrastive Fine-Tuning
  - [ ] Hard Negative Mining
  - [ ] Matryoshka Embeddings
  - [ ] Instruction-Tuned Embeddings (e5, bge)
  - [ ] MTEB Evaluation
- [ ] Instruction Tuning
  - [ ] SFT & Chat Formatting
  - [ ] Catastrophic Forgetting
- [ ] Alignment
  - [ ] RLHF
  - [ ] Reward Modeling
  - [ ] PPO Training Loop
  - [ ] Variations: DPO, GRPO, RLAIF
<!-- Phase 2: Building With the Model -->
- [ ] Prompt Engineering
  - [ ] Zero-Shot / Few-Shot
  - [ ] Chain-of-Thought
  - [ ] Self-Consistency
  - [ ] Tree-of-Thought
- [ ] Long-Context Techniques
  - [ ] RoPE Scaling
  - [ ] ALiBi
  - [ ] Position Interpolation
  - [ ] Sliding Window Attention
- [ ] RAG
  - [ ] Naive RAG
  - [ ] Advanced RAG (Query Rewriting, Re-ranking, HyDE, RAG-Fusion)
  - [ ] Agentic / Adaptive RAG (Self-RAG, Corrective RAG, GraphRAG)
  - [ ] RAG Evaluation
- [ ] AI Agents & Tool Use
  - [ ] Tool / Function Calling
  - [ ] Memory Systems
  - [ ] Structured Output / JSON Mode
  - [ ] Agent Harnesses & Evaluation
- [ ] Agentic Architectures
  - [ ] ReAct
  - [ ] Reflexion
  - [ ] Plan-and-Execute
  - [ ] Multi-Agent Orchestration
  - [ ] LLM Compiler / Parallel Tool Graphs
- [ ] GPT Family
- [ ] Claude Family
- [ ] Llama Family
- [ ] Other Open-Weight Models
  - [ ] Mistral / Mixtral
  - [ ] Gemma
  - [ ] Qwen
  - [ ] DeepSeek
- [ ] LLM Landscape
  - [ ] Context Window & Tokens
  - [ ] Open-Weight vs. Open-Source vs. Closed-Source
  - [ ] System Prompts & Chat Templates
  - [ ] Foundation Models vs. Fine-Tuned Derivatives
  - [ ] LLM Leaderboards & Arenas
- [ ] LLM Evaluation
  - [ ] Benchmarks (MMLU, HellaSwag, GSM8K)
  - [ ] LLM-as-Judge
  - [ ] Hallucination Detection & Mitigation
- [ ] LLM Safety & Security
  - [ ] Prompt Injection
  - [ ] Jailbreaking
  - [ ] Guardrails
  - [ ] Red-Teaming

### Production AI

<!-- MLOps Foundations -->
- [ ] MLOps Fundamentals
  - [ ] ML Lifecycle (Data → Train → Deploy → Monitor → Retrain)
  - [ ] Data Drift vs. Concept Drift
  - [ ] Training-Serving Skew
- [ ] Data Versioning
  - [ ] DVC
  - [ ] Experiment Tracking (MLflow, Weights & Biases)
  - [ ] Data Lineage
  - [ ] Reproducible Environments
- [ ] CI/CD for ML
  - [ ] Testing Pipelines
  - [ ] Model Registries
  - [ ] Canary / Blue-Green Deployment
- [ ] Monitoring & Observability
  - [ ] Drift Detection
  - [ ] Logging & Tracing
  - [ ] LLM-Specific Observability (Prompt/Response Logging, Token Usage)
- [ ] A/B Testing & Online Evaluation
  - [ ] Shadow Deployment
  - [ ] Champion / Challenger

<!-- Infrastructure & Hardware -->
- [ ] Hardware for AI
  - [ ] GPUs vs. CPUs vs. TPUs
  - [ ] Memory Bandwidth & Compute Bottlenecks
  - [ ] Interconnects (NVLink, InfiniBand)
- [ ] GPU Programming
  - [ ] CUDA Programming Model (Threads, Blocks, Grids, Warps)
  - [ ] Memory Hierarchy (Global / Shared / Register Memory, Coalescing)
  - [ ] Kernel Fusion (links to FlashAttention under Inference Optimization)
  - [ ] Triton (OpenAI Kernel Language — Python-Level Custom Kernels)
- [ ] Distributed Training
  - [ ] Data Parallelism
  - [ ] Tensor Parallelism
  - [ ] Pipeline Parallelism
  - [ ] Sequence Parallelism
  - [ ] ZeRO / Fully Sharded Data Parallel (FSDP)
- [ ] Vector Databases
  - [ ] HNSW / IVF Indexing
  - [ ] Metadata Filtering
  - [ ] Popular Systems (Pinecone, Weaviate, Qdrant, pgvector)

<!-- Model Compression & Efficiency -->
- [ ] Model Compression
  - [ ] Post-Training Quantization (PTQ): GPTQ, AWQ, SmoothQuant, bitsandbytes/NF4
  - [ ] Quantization-Aware Training (QAT)
  - [ ] Mixed-Precision Training (FP32/FP16/BF16, AMP, Loss Scaling)
  - [ ] Pruning (Structured vs. Unstructured)
  - [ ] Knowledge Distillation
  - [ ] Model Formats (GGUF, safetensors, ONNX, PyTorch Checkpoints)
- [ ] Model Sizing
  - [ ] Counting Parameters (Embedding + Per-Layer Attention/FFN × Layers)
  - [ ] Parameter Count → Memory Formula
  - [ ] Optimizer State Memory
  - [ ] Activation Memory & Gradient Checkpointing
  - [ ] Estimating GPUs Needed (Training vs. Inference)

<!-- LLM Serving & Inference -->
- [ ] Model Serving
  - [ ] vLLM
  - [ ] TensorRT-LLM
  - [ ] NVIDIA Triton Inference Server
  - [ ] ONNX Runtime
  - [ ] SGLang
- [ ] Inference Optimization
  - [ ] Batch vs. Real-Time Inference
  - [ ] Latency vs. Throughput Tradeoffs
  - [ ] Operator Fusion & Graph Optimization
  - [ ] FlashAttention
- [ ] Multi-LoRA Serving
  - [ ] Adapter Batching (S-LoRA-style)
  - [ ] Base Model + Adapter Swapping
- [ ] Local & Edge Inference
  - [ ] Ollama
  - [ ] llama.cpp
  - [ ] MLX
- [ ] Request Lifecycle (overview)
  - [ ] Tokenization → Prefill → Decode → Detokenization → Response
- [ ] Batching Strategies
  - [ ] Static Batching
  - [ ] Dynamic Batching
  - [ ] Continuous Batching (Iteration-Level Scheduling)
- [ ] KV Cache
  - [ ] Why It Grows Linearly with Sequence Length
  - [ ] Multi-Query Attention (MQA)
  - [ ] Grouped-Query Attention (GQA)
- [ ] Prefill
  - [ ] Compute-Bound Phase, Parallel over Prompt Tokens
- [ ] Decode
  - [ ] Memory-Bound Phase, Sequential Token Generation
- [ ] Speculative Decoding
  - [ ] Draft Model + Verification
  - [ ] Medusa / Lookahead Decoding
- [ ] Caching
  - [ ] Semantic Caching
  - [ ] Prefix Caching (RadixAttention)
  - [ ] Response Caching

<!-- System Design -->
- [ ] System Design
  - [ ] ML System Design (Data Pipelines, Recommendation/Fraud/Search Case Studies)
  - [ ] Modern AI System Design (RAG Pipelines, Agentic Systems, LLM Serving at Scale)

<!-- Cost & Economics -->
- [ ] LLM Cost & Pricing
  - [ ] Token-Based API Pricing
  - [ ] Input/Output Cost Asymmetry
  - [ ] Cost Optimization Levers (Routing, Caching, Batching)