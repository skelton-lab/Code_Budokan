# Companion — Python (Budokan Module 15)

**Founding document:** van Rossum, G. (1991). CWI Technical Report (Python's own original release documentation, Centrum Wiskunde & Informatica, Amsterdam). — sourced directly from the Code Budokan Reading Workbook, Strand C.

## Historical note

Python's own origin, per the Code Budokan history's own [Era VII milestone table](history/era-7-deep-learning.md), is dated precisely to a specific practical frustration: Guido van Rossum built it at CWI as a successor to ABC (a teaching language he'd worked on) specifically to be more approachable than C for scripting tasks, while retaining real, structured programming discipline ABC-family languages emphasized. Python's own dominance in this series didn't arrive with the language itself — the History-of-Computing document's own milestone table dates "Python becomes dominant language" to 2010, a full nineteen years after the 1991 release, driven specifically by "ease of use and scientific libraries (NumPy, SciPy)" — the exact library layer `python/08-numpy-vectorization.md` covers directly, and this series' own array-oriented thread (companion: `apl.md`) traces back to APL's 1962 origin through.

`python/00-overview.md` states the guide's own real reason for existing in this series bluntly: Python earned a dedicated guide "because it's the language the deep-learning ecosystem is actually built in" — not because dynamic typing or duck typing were novel (Ruby and Smalltalk, companions `ruby.md`/`smalltalk.md`, already covered that ground in depth). The guide's own second half — PyTorch's tensor/autograd layer, then Keras's higher-level declarative layer on top of it — is this companion's own most direct bridge into Strand A, the AI Canon, since nearly every paper in that strand assumes exactly this stack.

## Reflection prompts

- Python's own dominance arrived nineteen years after its release, driven by libraries built by other people, for reasons van Rossum's own 1991 design didn't specifically anticipate. What does this suggest about how much of a language's own eventual influence is actually decided by its original design, versus by what the ecosystem happens to build on top of it later?
- `python/00-overview.md` explicitly declines to re-teach dynamic/duck typing since Ruby and Smalltalk already covered it. Read `ruby/04-duck-typing.md` and `python/01-foundations.md` back to back — what, if anything, is genuinely different about Python's own version of duck typing, beyond syntax?

## Short-answer questions

1. **What language was Python originally designed as a successor to, and what was van Rossum's own specific goal?** ABC, a teaching language van Rossum had worked on — the goal was a language more approachable than C for scripting tasks, while retaining real structured-programming discipline.
2. **When did Python become the dominant language, per the Code Budokan history's own milestone table, and what specifically drove that — not the 1991 release itself?** 2010 — driven by ease of use and the scientific library ecosystem (NumPy, SciPy specifically), nineteen years after Python's own original release.
3. **What does `python/00-overview.md` state as the real, specific reason this series gives Python a dedicated guide, distinct from "another dynamically-typed OOP language"?** Because it's the language the deep-learning ecosystem is actually built in — the guide moves quickly past ground Ruby and Smalltalk already covered and spends its real weight on the PyTorch/Keras material specifically.

## Links into the guide

- [`python/08-numpy-vectorization.md`](../python/08-numpy-vectorization.md) — the library-level realization of the array-oriented thread this companion's `apl.md` traces to its 1962 origin.
- [`python/09-pytorch-tensors-autograd.md`](../python/09-pytorch-tensors-autograd.md) and [`python/13-keras.md`](../python/13-keras.md) — the direct bridge into Strand A, the AI Canon.

## Cross-thread connection

The Budokan workbook's own master table pairs Python with Brown et al.'s 2020 GPT-3 paper — "Python as the AI glue language" — and separately names the user's own Calderbank.AI paper as a Hunter-thread connection. The GPT-3 connection needs no elaboration beyond what it states plainly: every paper in Strand A from 2012 onward (AlexNet, Word2Vec, the transformer itself) was implemented, trained, and deployed in Python — this series' own `python/09-pytorch-tensors-autograd.md` and `python/13-keras.md` are, in a real sense, hands-on labs in the exact toolchain every paper in the AI Canon assumes its reader already has.
