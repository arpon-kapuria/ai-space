import os, json

BASE = os.path.join(os.path.dirname(__file__), "..", "content", "topics")

# title, categories, related, tags, difficulty, short, detailed_sections(list of (heading, body))
TOPICS = {
    "linear-algebra": dict(
        title="Linear Algebra for ML",
        categories=["Mathematics"],
        related=["gradient-descent", "neural-network", "embedding"],
        tags=["vectors", "matrices", "math"],
        difficulty="Beginner",
        short="Vectors, matrices, and the operations on them that every ML model is built from.",
        sections=[
            ("Why it matters", "Every layer of a neural network is a matrix multiplication followed by a nonlinearity. Data itself is represented as vectors (a row of pixels, a word, a user) and matrices (a batch of rows). Understanding linear algebra means understanding the actual shape of computation in ML, not just the theory around it."),
            ("Vectors and spaces", "A vector is an ordered list of numbers representing a point or direction in space. In ML, feature vectors, embeddings, and gradients are all vectors. Operations like dot products measure similarity or alignment between two vectors, which underlies everything from attention scores to cosine similarity search."),
            ("Matrices as transformations", "A matrix multiplication is a linear transformation: it rotates, scales, or projects a vector into a new space. A neural network layer `y = Wx + b` is exactly this — W reshapes the input space, b shifts it, and a nonlinearity bends it. Stacking layers stacks transformations."),
            ("Eigenvalues and decomposition", "Eigenvectors are directions a matrix doesn't rotate, only scales — they reveal the natural axes of a transformation. Singular Value Decomposition (SVD) generalizes this to any matrix and underlies techniques like PCA, low-rank adaptation (LoRA), and compression of large weight matrices."),
        ],
    ),
    "gradient-descent": dict(
        title="Gradient Descent",
        categories=["Mathematics", "Machine Learning"],
        related=["linear-algebra", "backpropagation", "neural-network"],
        tags=["optimization", "training"],
        difficulty="Beginner",
        short="The optimization algorithm that nudges model parameters downhill on a loss surface until they converge.",
        sections=[
            ("The core idea", "Gradient descent treats training as finding the lowest point on a loss surface. At each step it computes the gradient — the direction of steepest increase — and moves the parameters a small step in the opposite direction. Repeat enough times and the loss trends toward a minimum."),
            ("Learning rate", "The step size, or learning rate, controls how far each update moves. Too large and training oscillates or diverges; too small and training crawls. Most modern training uses a schedule that warms up, holds, then decays the learning rate over time."),
            ("Variants", "Stochastic Gradient Descent (SGD) estimates the gradient from a mini-batch instead of the full dataset, trading precision for speed. Adam and its variants add per-parameter adaptive learning rates and momentum, which is why they dominate large-scale deep learning training today."),
            ("Where it breaks", "Loss surfaces in deep networks are non-convex, full of saddle points and flat regions rather than a single bowl. Momentum, adaptive optimizers, and careful initialization exist largely to keep gradient descent moving through these regions instead of stalling."),
        ],
    ),
    "backpropagation": dict(
        title="Backpropagation",
        categories=["Machine Learning", "Deep Learning"],
        related=["gradient-descent", "neural-network", "linear-algebra"],
        tags=["training", "autodiff"],
        difficulty="Intermediate",
        short="The chain-rule algorithm that efficiently computes gradients for every parameter in a deep network.",
        sections=[
            ("The problem it solves", "A deep network can have billions of parameters. Computing how the loss changes with respect to each one individually would be intractable. Backpropagation reuses the chain rule of calculus to compute all of these gradients in a single backward pass through the network."),
            ("Forward and backward passes", "During the forward pass, the network computes predictions layer by layer, caching intermediate values. During the backward pass, the error signal is propagated from the output back toward the input, multiplying local derivatives at each layer using the cached values."),
            ("Computational graphs", "Modern frameworks like PyTorch build a computational graph as operations run, then walk it backward automatically — this is called autodiff. Backpropagation is really just reverse-mode automatic differentiation applied to the specific graph shape of a neural network."),
            ("Vanishing and exploding gradients", "Multiplying many small derivatives together shrinks the gradient toward zero in deep networks; multiplying large ones blows it up. Techniques like residual connections, normalization layers, and careful initialization exist specifically to keep gradients flowing through very deep stacks."),
        ],
    ),
    "neural-network": dict(
        title="Neural Network",
        categories=["Machine Learning", "Deep Learning"],
        related=["backpropagation", "gradient-descent", "convolutional-neural-network", "rnn"],
        tags=["fundamentals", "architecture"],
        difficulty="Beginner",
        short="A layered function approximator built from weighted sums and nonlinearities, trained end to end.",
        sections=[
            ("Structure", "A neural network is a stack of layers, each computing a linear transformation of its input followed by a nonlinear activation function. Stacking layers lets the network compose simple transformations into arbitrarily complex ones."),
            ("Why nonlinearity matters", "Without a nonlinear activation between layers, any stack of linear layers collapses into a single linear layer — depth would add no expressive power. Functions like ReLU, GELU, or sigmoid are what let networks approximate complex, curved decision boundaries."),
            ("Training loop", "Training alternates a forward pass (compute predictions and loss), a backward pass (compute gradients via backpropagation), and a parameter update (gradient descent). Repeating this over the dataset for many epochs is what 'training' means in practice."),
            ("From MLPs to modern architectures", "The plain multilayer perceptron (MLP) is the ancestor of every modern architecture. Convolutional networks add spatial weight sharing for images; recurrent networks add memory across time steps; transformers replace recurrence with attention. All still rest on the same weighted-sum-plus-nonlinearity building block."),
        ],
    ),
    "convolutional-neural-network": dict(
        title="Convolutional Neural Network (CNN)",
        categories=["Deep Learning", "Computer Vision"],
        related=["neural-network", "backpropagation"],
        tags=["vision", "architecture"],
        difficulty="Intermediate",
        short="A network architecture that shares weights across spatial locations, built for grid-structured data like images.",
        sections=[
            ("The convolution operation", "Instead of connecting every input pixel to every neuron, a CNN slides a small learnable filter across the image, computing a weighted sum at each position. The same filter is reused everywhere, which drastically cuts the parameter count and builds in translation invariance."),
            ("Feature hierarchies", "Early convolutional layers tend to learn simple detectors like edges and color blobs. Deeper layers combine these into textures, parts, and eventually whole-object detectors. This hierarchy emerges purely from training, not from hand design."),
            ("Pooling and downsampling", "Pooling layers (like max pooling) shrink the spatial resolution between convolutional blocks, reducing computation and giving the network some robustness to small shifts in the input."),
            ("Where CNNs stand today", "Vision Transformers have matched or exceeded CNNs on many large-scale benchmarks, but CNNs remain dominant where data or compute is limited, thanks to their strong built-in spatial bias. Hybrid architectures combining both are common in production vision systems."),
        ],
    ),
    "rnn": dict(
        title="Recurrent Neural Network (RNN)",
        categories=["Deep Learning", "Natural Language Processing"],
        related=["neural-network", "transformer"],
        tags=["sequences", "architecture"],
        difficulty="Intermediate",
        short="A network that processes sequences step by step, carrying a hidden state forward as memory.",
        sections=[
            ("Sequential processing", "An RNN reads a sequence one element at a time, updating a hidden state vector at each step that summarizes everything seen so far. This makes RNNs a natural fit for text, audio, or time series."),
            ("The long-range dependency problem", "Because the same weights are applied repeatedly, gradients passed back through many time steps tend to vanish or explode, making it hard for plain RNNs to remember information from far in the past."),
            ("LSTMs and GRUs", "Long Short-Term Memory (LSTM) and Gated Recurrent Unit (GRU) cells add learned gates that control what to remember, forget, and output at each step, substantially improving long-range memory over a plain RNN."),
            ("Why transformers replaced them", "RNNs process sequences strictly in order, which prevents parallelizing across time during training. Transformers process the whole sequence at once using attention, which trains far faster on modern hardware — this is the main reason they displaced RNNs for most NLP tasks."),
        ],
    ),
    "attention": dict(
        title="Attention Mechanism",
        categories=["Deep Learning", "Natural Language Processing", "Generative AI"],
        related=["transformer", "rnn"],
        tags=["attention", "architecture"],
        difficulty="Intermediate",
        short="A mechanism that lets a model weigh and combine information from every position in a sequence, directly.",
        sections=[
            ("The core idea", "Attention computes, for each element in a sequence, a weighted combination of every other element, where the weights are learned based on relevance. This gives the model direct access to any part of the input, regardless of distance."),
            ("Queries, keys, and values", "Each token is projected into a query, a key, and a value vector. The similarity between a token's query and every other token's key determines the attention weights; those weights are then used to combine the value vectors into the output."),
            ("Self-attention vs cross-attention", "Self-attention relates a sequence to itself, which is what lets a transformer build contextual representations of a sentence. Cross-attention relates one sequence to another, such as a decoder attending over an encoder's output in translation."),
            ("Multi-head attention", "Rather than computing a single attention pattern, transformers compute several in parallel ('heads'), each free to specialize in a different kind of relationship — syntax, coreference, position — and concatenate the results."),
        ],
    ),
    "transformer": dict(
        title="Transformer",
        categories=["Deep Learning", "Natural Language Processing", "Generative AI"],
        related=["attention", "bert", "gpt", "tokenization"],
        tags=["transformer", "attention", "architecture"],
        difficulty="Intermediate",
        short="The attention-only architecture that replaced recurrence and now underlies almost every modern LLM.",
        sections=[
            ("Why it was introduced", "The 2017 'Attention Is All You Need' architecture removed recurrence entirely, relying only on attention and feed-forward layers. This let the whole sequence be processed in parallel during training, which unlocked training on far larger datasets than RNNs ever could."),
            ("Encoder-decoder structure", "The original transformer had an encoder that builds a contextual representation of the input and a decoder that generates output tokens one at a time, attending back over the encoder. Modern LLMs like GPT use a decoder-only variant; models like BERT use an encoder-only variant."),
            ("Positional information", "Because attention has no inherent sense of order, transformers inject positional information explicitly, either through fixed sinusoidal encodings or learned/rotary embeddings, so the model can distinguish 'dog bites man' from 'man bites dog'."),
            ("Scaling behavior", "Transformer performance has followed remarkably predictable scaling laws with model size, data, and compute, which is the main reason the field bet so heavily on this architecture for building ever-larger language models."),
        ],
    ),
    "bert": dict(
        title="BERT",
        categories=["Natural Language Processing", "Deep Learning"],
        related=["transformer", "attention", "embedding"],
        tags=["encoder", "pretraining"],
        difficulty="Intermediate",
        short="A bidirectional encoder-only transformer pretrained with masked language modeling, built for understanding rather than generation.",
        sections=[
            ("Bidirectional context", "Unlike GPT-style models that only look at previous tokens, BERT's encoder attends to the entire input sequence at once in both directions, giving it richer context for tasks like classification and question answering."),
            ("Masked language modeling", "BERT is pretrained by randomly masking a percentage of input tokens and training the model to predict them from context on both sides. This forces it to build genuinely contextual token representations rather than just predicting the next word."),
            ("Fine-tuning for downstream tasks", "After pretraining, BERT is typically fine-tuned with a small task-specific head for classification, named entity recognition, or extractive question answering, often needing only a modest labeled dataset to reach strong performance."),
            ("Legacy", "BERT is not used for open-ended text generation, but its architecture and pretraining recipe shaped nearly every encoder used in modern embedding models and retrieval systems."),
        ],
    ),
    "gpt": dict(
        title="GPT",
        categories=["Natural Language Processing", "Generative AI", "Deep Learning"],
        related=["transformer", "attention", "rlhf", "fine-tuning"],
        tags=["decoder", "generation", "llm"],
        difficulty="Intermediate",
        short="A decoder-only transformer trained to predict the next token, scaled into the large language models used today.",
        sections=[
            ("Autoregressive generation", "GPT generates text one token at a time, feeding each generated token back in as input for predicting the next. Training simply maximizes the likelihood of the next real token given everything before it — a deceptively simple objective at massive scale."),
            ("Causal masking", "Because GPT can only look backward, its attention layers are masked so a token can never attend to positions after it. This is what makes the model usable for generation, where future tokens don't exist yet at inference time."),
            ("From base model to assistant", "A pretrained GPT model is a raw text predictor. Instruction tuning and RLHF are what turn that raw predictor into something that follows instructions and behaves like an assistant rather than just continuing whatever text it's given."),
            ("In-context learning", "Large GPT-style models can adapt to a new task from a handful of examples placed directly in the prompt, without any weight updates — an emergent capability that only becomes reliable at sufficient scale."),
        ],
    ),
    "tokenization": dict(
        title="Tokenization",
        categories=["Natural Language Processing", "Generative AI"],
        related=["transformer", "gpt", "embedding"],
        tags=["preprocessing", "nlp"],
        difficulty="Beginner",
        short="The process of splitting raw text into the discrete units a language model actually operates on.",
        sections=[
            ("Why not just words", "Splitting on whitespace produces an enormous, brittle vocabulary that can't handle typos, rare words, or new languages. Subword tokenization solves this by breaking text into a fixed vocabulary of frequent pieces, so any string can be represented as some sequence of them."),
            ("Byte-Pair Encoding (BPE)", "BPE builds its vocabulary by starting from individual characters and iteratively merging the most frequent adjacent pair, stopping at a target vocabulary size. Common words end up as single tokens; rare words get split into meaningful subword chunks."),
            ("Token efficiency", "The number of tokens a piece of text produces directly determines LLM API cost and how much fits into a context window. Tokenizers are tuned so common patterns in the training data — including code syntax and common phrases — collapse into as few tokens as possible."),
            ("Downstream effects", "Tokenization boundaries affect what a model finds easy or hard — quirks like poor arithmetic on multi-digit numbers or difficulty with letter-counting tasks often trace back to how numbers or words get split into tokens."),
        ],
    ),
    "embedding": dict(
        title="Embedding",
        categories=["Natural Language Processing", "Machine Learning", "Generative AI"],
        related=["vector-database", "bert", "rag"],
        tags=["representation", "vectors"],
        difficulty="Beginner",
        short="A dense vector representation of an object — a word, sentence, or image — placed so that similar meanings end up close together.",
        sections=[
            ("From symbols to vectors", "Raw tokens or images are discrete and don't carry any notion of similarity on their own. An embedding maps them into a continuous vector space where distance and direction encode meaningful relationships, learned from data rather than hand-crafted."),
            ("How they're learned", "Embeddings emerge as a byproduct of training on some objective — predicting neighboring words, contrastive pairs of matching text, or as the internal representation of a larger network — and are then reused directly for search and comparison."),
            ("Similarity search", "Once objects are embedded, finding related ones reduces to a nearest-neighbor search in vector space, typically using cosine similarity or dot product. This is the mechanism behind semantic search, recommendation, and retrieval-augmented generation."),
            ("Embedding spaces aren't universal", "Vectors from different embedding models are not comparable to one another — the space each model learns is specific to its training data and objective. Swapping embedding models generally requires re-embedding an entire dataset."),
        ],
    ),
    "vector-database": dict(
        title="Vector Database",
        categories=["Production AI", "Generative AI"],
        related=["embedding", "rag"],
        tags=["infrastructure", "retrieval"],
        difficulty="Intermediate",
        short="A database built to store embeddings and answer approximate nearest-neighbor queries at scale.",
        sections=[
            ("Why not a normal database", "Traditional databases index for exact matches and ranges. Vector search needs to find the k closest points in a high-dimensional continuous space, which requires fundamentally different index structures to stay fast at scale."),
            ("Approximate nearest neighbor indexes", "Exact nearest-neighbor search is too slow beyond a small dataset, so vector databases use approximate structures like HNSW (a navigable graph) or IVF (clustering-based partitioning) that trade a small amount of recall for large speedups."),
            ("Metadata filtering", "Real workloads rarely want pure similarity search — they want the closest matches within a filtered subset, such as a specific user's documents or a date range. Combining vector search with metadata filters efficiently is a major differentiator between vector database implementations."),
            ("Role in RAG systems", "In a retrieval-augmented generation pipeline, the vector database is the component that turns a user query into a shortlist of relevant chunks before those chunks are handed to the language model as context."),
        ],
    ),
    "rag": dict(
        title="Retrieval-Augmented Generation (RAG)",
        categories=["Generative AI", "Production AI"],
        related=["vector-database", "embedding", "fine-tuning"],
        tags=["retrieval", "llm", "architecture"],
        difficulty="Intermediate",
        short="A pattern that grounds an LLM's answers by retrieving relevant documents and inserting them into the prompt.",
        sections=[
            ("The problem it solves", "A language model's knowledge is frozen at training time and it has no access to private or fast-changing data. RAG works around both limits by retrieving relevant text from an external source at query time and feeding it to the model as context."),
            ("Pipeline shape", "A typical pipeline chunks source documents, embeds each chunk, and stores the vectors in a vector database. At query time, the user's question is embedded, the closest chunks are retrieved, and the model generates an answer conditioned on both the question and the retrieved text."),
            ("Where quality breaks down", "Weak retrieval — bad chunking, mismatched embeddings, or poor filtering — produces irrelevant context, which the model will confidently reason over anyway. Most real-world RAG debugging effort goes into the retrieval half of the pipeline, not the generation half."),
            ("Beyond naive RAG", "Production systems commonly add re-ranking, query rewriting, hybrid keyword-plus-vector search, and agentic multi-step retrieval loops to improve on the accuracy of a single embed-and-fetch pass."),
        ],
    ),
    "fine-tuning": dict(
        title="Fine-Tuning",
        categories=["Generative AI", "Machine Learning"],
        related=["gpt", "lora", "rlhf"],
        tags=["training", "adaptation"],
        difficulty="Intermediate",
        short="Continuing to train a pretrained model on a smaller, task-specific dataset to adapt its behavior.",
        sections=[
            ("Why start from pretrained weights", "Pretraining on huge general corpora teaches broad language and world knowledge that would be far too expensive to relearn from scratch for every task. Fine-tuning reuses that foundation and specializes it with a much smaller, targeted dataset."),
            ("Full fine-tuning vs parameter-efficient methods", "Full fine-tuning updates every weight in the model, which is accurate but expensive in memory and storage — a full copy of the weights per task. Parameter-efficient methods like LoRA freeze the base model and train small additional matrices instead."),
            ("Instruction tuning", "Fine-tuning a base model on examples of instructions paired with good responses is what turns a raw next-token predictor into something that reliably follows directions — a prerequisite step before RLHF in most modern LLM training pipelines."),
            ("Risks", "Fine-tuning on a narrow dataset can cause catastrophic forgetting, where the model loses general capabilities it had before, or overfits to quirks of the fine-tuning set that don't generalize."),
        ],
    ),
    "lora": dict(
        title="LoRA (Low-Rank Adaptation)",
        categories=["Generative AI", "Machine Learning"],
        related=["fine-tuning", "linear-algebra"],
        tags=["peft", "efficiency"],
        difficulty="Advanced",
        short="A parameter-efficient fine-tuning method that trains small low-rank matrices instead of the full weight matrix.",
        sections=[
            ("The core trick", "Instead of updating a full weight matrix during fine-tuning, LoRA freezes it and learns a low-rank decomposition — two much smaller matrices whose product approximates the needed update. This cuts trainable parameters by orders of magnitude."),
            ("Why low rank works", "Empirically, the change needed to adapt a pretrained model to a new task tends to live in a much lower-dimensional space than the full parameter count, so a low-rank approximation captures most of the useful update."),
            ("Practical benefits", "Because the base weights never change, a single base model can be served with many small LoRA adapters swapped in per task or per customer, at a fraction of the storage and memory cost of full fine-tuned copies."),
            ("Trade-offs", "LoRA typically slightly underperforms full fine-tuning on tasks that require deep changes to the model's knowledge or behavior, though the gap is often small relative to the efficiency gained."),
        ],
    ),
    "rlhf": dict(
        title="RLHF (Reinforcement Learning from Human Feedback)",
        categories=["Generative AI", "Reinforcement Learning"],
        related=["gpt", "fine-tuning", "reinforcement-learning-intro"],
        tags=["alignment", "training"],
        difficulty="Advanced",
        short="A training technique that shapes model behavior using a reward signal learned from human preference comparisons.",
        sections=[
            ("Why not just supervised fine-tuning", "Writing an ideal response by hand for every possible prompt doesn't scale, and 'good' is often easier to recognize than to produce. RLHF instead collects human preference comparisons between candidate responses and uses that signal to steer the model."),
            ("Reward modeling", "A separate reward model is trained to predict which of two responses a human would prefer, based on a dataset of labeled comparisons. That learned reward function then substitutes for a human in the loop during large-scale training."),
            ("Policy optimization", "The language model is then treated as a policy and updated with reinforcement learning — commonly PPO, or increasingly simpler alternatives like DPO — to increase the reward model's score on its generations, while a penalty keeps it from drifting too far from its starting behavior."),
            ("What it actually changes", "RLHF mostly reshapes style, helpfulness, and safety behavior on top of capabilities the base model already has from pretraining — it is not primarily where a model learns new facts or reasoning ability."),
        ],
    ),
    "reinforcement-learning-intro": dict(
        title="Reinforcement Learning",
        categories=["Reinforcement Learning", "Machine Learning"],
        related=["q-learning", "rlhf"],
        tags=["rl", "fundamentals"],
        difficulty="Beginner",
        short="A learning paradigm where an agent learns to act by trial and error, guided by reward signals from its environment.",
        sections=[
            ("The agent-environment loop", "At each time step, an agent observes the state of its environment, takes an action, and receives a reward along with a new state. The agent's goal is to learn a policy — a mapping from states to actions — that maximizes cumulative reward over time."),
            ("Exploration vs exploitation", "An agent must balance exploiting actions it already knows are good against exploring new actions that might be better. Too little exploration gets stuck in a mediocre policy; too much wastes reward chasing unknowns."),
            ("Value functions and policies", "Value-based methods learn to estimate how good each state or action is and act greedily with respect to that estimate. Policy-based methods instead directly learn the mapping from states to actions, which scales better to continuous action spaces."),
            ("Where RL is actually used", "Beyond games and robotics, RL's biggest recent impact has been RLHF for aligning language models — using human preferences as the reward signal instead of a hand-coded environment reward."),
        ],
    ),
    "q-learning": dict(
        title="Q-Learning",
        categories=["Reinforcement Learning"],
        related=["reinforcement-learning-intro"],
        tags=["value-based", "rl"],
        difficulty="Intermediate",
        short="A value-based reinforcement learning algorithm that learns the expected return of taking an action in a state, without needing a model of the environment.",
        sections=[
            ("The Q-function", "Q-learning learns a function Q(state, action) estimating the total expected future reward of taking that action in that state and then acting optimally afterward. Once learned, the optimal policy is simply to pick the action with the highest Q-value in each state."),
            ("The update rule", "After observing a transition, Q-learning updates its estimate toward the observed reward plus the discounted value of the best action in the next state — a form of bootstrapping known as temporal-difference learning."),
            ("Off-policy learning", "Q-learning is off-policy: it can learn the optimal policy's values while actually behaving differently, such as exploring randomly. This lets it reuse past experience freely, which is central to why it works well with experience replay."),
            ("Scaling to deep Q-networks", "For environments with huge or continuous state spaces, a neural network replaces the lookup table for Q, giving Deep Q-Networks (DQN) — the algorithm behind early landmark results like learning to play Atari games from raw pixels."),
        ],
    ),
    "diffusion-models": dict(
        title="Diffusion Models",
        categories=["Generative AI", "Deep Learning", "Computer Vision"],
        related=["neural-network"],
        tags=["generative", "image"],
        difficulty="Advanced",
        short="Generative models that learn to reverse a gradual noising process, turning pure noise back into structured data.",
        sections=[
            ("Forward and reverse processes", "Training starts from real data and adds a small amount of Gaussian noise at each of many steps until it becomes pure noise. The model then learns to reverse this process, predicting the noise added at each step so it can be subtracted away."),
            ("Sampling as iterative denoising", "To generate a new sample, the model starts from pure random noise and repeatedly applies its learned denoising step, gradually revealing coherent structure over many iterations rather than in a single forward pass."),
            ("Conditioning", "Text-to-image diffusion models condition the denoising process on a text embedding at every step, typically via cross-attention, so the noise removed at each step is steered toward matching the given prompt."),
            ("Trade-offs vs other generative approaches", "Diffusion models tend to produce higher-quality, more diverse samples than earlier GAN-based approaches, at the cost of needing many iterative steps to generate a single sample — though distillation techniques have cut this substantially."),
        ],
    ),
    "mlops-basics": dict(
        title="MLOps Fundamentals",
        categories=["Production AI"],
        related=["rag", "vector-database"],
        tags=["infrastructure", "deployment"],
        difficulty="Beginner",
        short="The practices and tooling for reliably building, deploying, and operating machine learning systems in production.",
        sections=[
            ("Why ML needs its own ops discipline", "A trained model is only part of a production system — it also depends on a specific data distribution, a preprocessing pipeline, and a serving environment, all of which can silently drift or break in ways traditional software testing doesn't catch."),
            ("The pipeline", "A typical MLOps pipeline covers data versioning, reproducible training, automated evaluation against held-out benchmarks, packaging the model for serving, and rollout with monitoring — treating the model as one component in a larger, testable system."),
            ("Monitoring in production", "Beyond uptime and latency, ML systems need monitoring for data drift, prediction distribution shifts, and quality regressions — problems that won't show up as an error or a crash, only as silently degrading outputs."),
            ("LLMOps as a specialization", "Serving large language models adds its own concerns on top of classic MLOps — prompt versioning, token cost tracking, latency-sensitive batching and caching, and evaluation frameworks built for open-ended generated text rather than fixed labels."),
        ],
    ),
}

for slug, data in TOPICS.items():
    folder = os.path.join(BASE, slug)
    os.makedirs(folder, exist_ok=True)

    # metadata.yaml
    cats = "\n".join(f"  - {c}" for c in data["categories"])
    rel = "\n".join(f"  - {r}" for r in data["related"])
    tags = "\n".join(f"  - {t}" for t in data["tags"])
    meta = f'''title: {data["title"]}
slug: {slug}
categories:
{cats}
related:
{rel}
tags:
{tags}
difficulty: {data["difficulty"]}
'''
    with open(os.path.join(folder, "metadata.yaml"), "w") as f:
        f.write(meta)

    # short_note.md
    with open(os.path.join(folder, "short_note.md"), "w") as f:
        f.write(data["short"] + "\n")

    # detailed_note.md
    body = f"# {data['title']}\n\n"
    for heading, text in data["sections"]:
        body += f"## {heading}\n\n{text}\n\n"
    with open(os.path.join(folder, "detailed_note.md"), "w") as f:
        f.write(body)

print(f"Generated {len(TOPICS)} topics.")
