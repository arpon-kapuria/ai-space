# Recurrent Neural Network (RNN)

## Sequential processing

An RNN reads a sequence one element at a time, updating a hidden state vector at each step that summarizes everything seen so far. This makes RNNs a natural fit for text, audio, or time series.

## The long-range dependency problem

Because the same weights are applied repeatedly, gradients passed back through many time steps tend to vanish or explode, making it hard for plain RNNs to remember information from far in the past.

## LSTMs and GRUs

Long Short-Term Memory (LSTM) and Gated Recurrent Unit (GRU) cells add learned gates that control what to remember, forget, and output at each step, substantially improving long-range memory over a plain RNN.

## Why transformers replaced them

RNNs process sequences strictly in order, which prevents parallelizing across time during training. Transformers process the whole sequence at once using attention, which trains far faster on modern hardware — this is the main reason they displaced RNNs for most NLP tasks.

