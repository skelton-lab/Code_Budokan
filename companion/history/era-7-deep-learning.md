# Era VII — The Deep Learning Era (2006–2017)

The deep learning era begins in 2006 with Geoffrey Hinton's work on training deep neural networks and reaches its culmination in 2017 with the Transformer architecture that made large language models possible. This was the era in which the AI ideas of the 1980s — artificial neural networks, backpropagation — returned to centre stage, supercharged by GPU computing, massive datasets, and the internet's ability to aggregate both. It ends at the threshold of the current moment.

## Profiles

### Geoffrey Hinton (1947– ) · British-Canadian computer scientist, University of Toronto / Google Brain

Geoffrey Hinton spent decades championing neural networks during the long AI winters when they were unfashionable. His foundational 1986 paper on backpropagation (with Rumelhart and Williams) made training multi-layer neural networks practical. His 2006 paper on deep belief networks demonstrated that deep neural networks — many layers — could be trained effectively if pre-trained layer by layer. The AlexNet paper (Krizhevsky, Sutskever, Hinton, 2012) showed that a deep convolutional neural network trained on GPUs could achieve superhuman performance on the ImageNet visual recognition challenge — a result so dramatic that it launched the modern deep learning era. Hinton, Bengio, and LeCun received the Turing Award in 2018 — widely called the Nobel Prize of AI.

**Key contributions**
- Backpropagation algorithm for training multi-layer neural networks (1986)
- Deep belief networks — practical training of deep architectures (2006)
- AlexNet — a deep CNN defeating the ImageNet challenge by a massive margin (2012)
- Boltzmann machines, variational autoencoders
- Capsule networks — an alternative to CNNs
- Won the Turing Award 2018 with Bengio and LeCun

**Legacy.** Hinton is credited with more or less single-handedly keeping neural network research alive during the AI winters of the 1990s and early 2000s, when the approach was out of fashion. His students (Yann LeCun, Yoshua Bengio, Ilya Sutskever) and their students built much of modern deep learning.

**Key work:** *Rumelhart, D. E., Hinton, G. E., & Williams, R. J. (1986). Learning representations by back-propagating errors. Nature, 323, 533–536. Also: Krizhevsky, A., Sutskever, I., & Hinton, G. (2012). ImageNet Classification with Deep Convolutional Neural Networks. NeurIPS 2012.*

### Yann LeCun (1960– ) · French computer scientist, NYU / Meta AI

Yann LeCun developed the convolutional neural network (CNN) architecture during his time at Bell Labs in the late 1980s and 1990s. His LeNet-5 (1998) showed that CNNs could recognise handwritten digits at a level sufficient for practical bank cheque processing. When GPU computing made large-scale CNN training feasible, LeCun's architecture — adapted and scaled into AlexNet — became the foundation of modern computer vision. As Chief AI Scientist at Meta, LeCun has been a prominent (and sometimes contrarian) voice on AI development, arguing that current deep learning approaches will not lead to human-level intelligence.

**Key contributions**
- Invented convolutional neural networks (CNNs) — the architecture of computer vision
- LeNet — practical handwritten-digit recognition (1989/1998)
- Established backpropagation as the universal training algorithm
- Led development of the first applications of neural networks to visual recognition
- Chief AI Scientist at Meta — open research advocacy
- Turing Award 2018 with Hinton and Bengio

**Legacy.** CNNs underpin image recognition, face detection, medical imaging analysis, self-driving car perception, and virtually every computer vision system deployed today. LeCun's work established deep learning as a practical engineering discipline before the GPU era made it ubiquitous.

**Key work:** *LeCun, Y., Bottou, L., Bengio, Y., & Haffner, P. (1998). Gradient-based learning applied to document recognition. Proceedings of the IEEE, 86(11), 2278–2324.*

## Milestones

| Year | Event / invention | Significance |
|---|---|---|
| 2006 | Hinton — Deep Belief Networks | Practical training of deep architectures. Restarts neural network research after the AI winter. |
| 2007 | iPhone — smartphone era | Jobs, Apple. Touchscreen mobile computer. iOS App Store (2008) creates a new software market. |
| 2009 | ImageNet dataset created | Fei-Fei Li, Stanford. 14M+ labelled images. The benchmark that proved deep learning's power. |
| 2010 | Python becomes the dominant language | Ease of use and scientific libraries (NumPy, SciPy). Becomes the language of data science and AI. |
| 2011 | IBM Watson defeats Jeopardy! champions | NLP and information-retrieval AI defeats human champions on live TV. |
| 2012 | AlexNet — ImageNet breakthrough | Krizhevsky, Sutskever, Hinton. GPU-trained CNN reduces ImageNet error rate by 41%. Launches the deep learning era. |
| 2012 | Google Brain — cats from YouTube | Ng, Dean, et al. Neural network learns to detect cats from unlabelled YouTube videos. Unsupervised learning at scale. |
| 2013 | Word2Vec (Google) | Mikolov et al. Word embeddings — distributed representations of words. Foundation of all NLP embeddings. |
| 2014 | GANs invented | Goodfellow et al. Generative Adversarial Networks. Foundation of synthetic image generation. |
| 2015 | TensorFlow open-sourced (Google) | Deep learning framework. Makes neural network training accessible to researchers worldwide. |
| 2016 | AlphaGo defeats Lee Sedol | DeepMind. AI defeats the world Go champion — a game once thought decades away for AI. |
| 2017 | Transformer — "Attention Is All You Need" | Vaswani et al., Google Brain. Self-attention replaces RNNs. Foundation of GPT, BERT, Claude, Gemini, and all LLMs. |

## The road to the Transformer

The transformer did not appear from nowhere. The chain of developments that made it possible runs from word embeddings (Word2Vec, 2013), through sequence-to-sequence models and the attention mechanism (Bahdanau et al., 2014), through the failure modes of RNNs on long sequences, to the insight of Vaswani et al. (2017) that attention could replace recurrence entirely.

The attention mechanism — the idea that a model should be able to "attend" to different parts of its input sequence with different weights when producing each output — was introduced by Bahdanau, Cho, and Bengio in 2014, applied to machine translation. The transformer extended this into multi-head self-attention: every token attends to every other token simultaneously, with multiple attention heads learning different types of relationships. Removing the recurrence eliminated the sequential processing bottleneck that had limited RNNs and LSTMs, enabling massively parallel training on GPU clusters.

**Key paper:** *Bahdanau, D., Cho, K., & Bengio, Y. (2014). Neural Machine Translation by Jointly Learning to Align and Translate. arXiv:1409.0473 — the attention mechanism that preceded the transformer.*

This is also exactly where [`../appendix-ai-orchestration/00-overview.md`](../../appendix-ai-orchestration/00-overview.md) picks up the thread — the 2017 Transformer paper is the hinge between this document's own history and that appendix's post-transformer material.

## In this companion

The 2010 milestone row ("Python becomes the dominant language... driven by NumPy, SciPy") is already cited directly in [`python.md`](../python.md)'s own historical note. The Hinton and LeCun profiles are the direct subject matter of [`python.md`](../python.md)'s own PyTorch and Keras modules (`09-pytorch-tensors-autograd.md` onward) — backpropagation and CNNs are what those modules teach you to build from scratch.

**Previous:** [Era VI — The Internet and the Web](era-6-internet-and-web.md) · **Also see:** [Reading List](reading-list.md) · [Biographical Index](biographical-index.md)
