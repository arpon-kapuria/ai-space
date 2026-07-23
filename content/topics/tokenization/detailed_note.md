# Tokenization

## Why not just words

Splitting on whitespace produces an enormous, brittle vocabulary that can't handle typos, rare words, or new languages. Subword tokenization solves this by breaking text into a fixed vocabulary of frequent pieces, so any string can be represented as some sequence of them.

## Byte-Pair Encoding (BPE)

BPE builds its vocabulary by starting from individual characters and iteratively merging the most frequent adjacent pair, stopping at a target vocabulary size. Common words end up as single tokens; rare words get split into meaningful subword chunks.

## Token efficiency

The number of tokens a piece of text produces directly determines LLM API cost and how much fits into a context window. Tokenizers are tuned so common patterns in the training data — including code syntax and common phrases — collapse into as few tokens as possible.

## Downstream effects

Tokenization boundaries affect what a model finds easy or hard — quirks like poor arithmetic on multi-digit numbers or difficulty with letter-counting tasks often trace back to how numbers or words get split into tokens.

