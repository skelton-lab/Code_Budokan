# Python (+ PyTorch + Keras) — A Session-Based Study Guide

**Promise:** read, write, and maintain idiomatic Python — comprehensions, generators, decorators, context managers, dataclasses, and the packaging/testing tooling a real project needs — then use it to build and train real small neural networks with PyTorch (the tensor/autograd level) and Keras (the higher-level declarative level on top of it), understanding precisely what each layer buys you over the one below it.

**Audience:** this series' existing reader — ten guides in, fluent in C, C++, JavaScript, Ruby, Smalltalk, Simula, ALGOL, Fortran, 6502 assembly, Prolog, and SQL. Python's dynamic typing and duck typing are not new concepts here (Ruby and Smalltalk already covered that ground in depth); this guide moves quickly past what's merely "another dynamically-typed OOP language" and spends its real weight on what's genuinely Python-specific — the iterator protocol, decorators as a first-class language feature, the packaging ecosystem's actual current state — before spending the second half on the reason Python earned a dedicated guide in this series at all: it's the language the deep-learning ecosystem is actually built in.

**Toolchain (anchored):** **Python 3.12**, managed via **`uv`** — not system Python, not a global `pip install`, the same "clean, isolated, non-system toolchain" discipline this series' Ruby guide established (`ruby/00-overview.md`: Homebrew Ruby, not the macOS-shipped 2.6.10). Every command in this guide runs inside a `uv`-managed project (`uv init`, `uv add`, `uv run`), confirmed working locally. Three libraries anchor the second half:

- **PyTorch 2.13.0** — confirmed installed and working, including **MPS** (Metal Performance Shaders — Apple Silicon GPU acceleration), confirmed available on this machine (`torch.backends.mps.is_available()` reports `True`). Modules 9–12 use real GPU acceleration, not a simulated or hypothetical comparison.
- **Keras 3.15.0** — confirmed installed and running on **the PyTorch backend specifically** (`KERAS_BACKEND=torch`), not TensorFlow. This is a real, current fact about Keras 3's design (backend-agnostic since the 3.0 rewrite) this guide uses deliberately: Keras sits on the exact same tensor engine Modules 9–12 already installed, rather than pulling in a second, heavier deep-learning framework just to teach a higher-level API.
- **NumPy 2.5.1** — the vectorization foundation both PyTorch's tensor API and this guide's own measured performance comparisons are built on.

**A methodology note specific to this guide:** the second half's whole point is a *contrast* — the same small neural network, built once at PyTorch's explicit, low-level `nn.Module`/autograd layer, and again at Keras's declarative, higher-level layer, run back to back with real, comparable numbers. This guide's now-established habit — measure, don't assert (SQL's 130× indexing speedup, Prolog's `clpfd` N-Queens comparison) — applies here to something new: measuring the actual *engineering* trade-off between two real abstraction levels over identical computation, not just one implementation's raw speed.

## Capstone log

| # | Capstone | Proves |
|---|---|---|
| 1 | A data-processing pipeline | Comprehensions, generators/iterators, decorators, context managers, dataclasses — idiomatic Python's own distinctive character |
| 2 | A packaged, tested CLI tool | `uv`/`pyproject.toml`, type hints, `pytest` — this guide's verification-discipline thread entry |
| 3 | Linear regression via hand-rolled gradient descent | NumPy vectorization (measured against a hand-written loop), PyTorch tensors and `autograd` from first principles, no `nn.Module` yet |
| 4 | A small PyTorch neural network | `nn.Module`, `optim`, a real training loop, a measured CPU-vs-MPS comparison |
| 5 | The same network, in Keras | `Sequential`/functional API, `.compile()`/`.fit()`, a direct, measured contrast against Capstone 4 on the identical problem |

## Module list

1. **Foundations** — Python's data model, mutability, truthiness, f-strings (kept tight — dynamic typing and duck typing are not new ground for this reader)
2. **Comprehensions, generators, and iterators** — the iterator protocol, laziness → feeds Capstone 1
3. **Decorators and context managers** — closures, function-wrapping, `with`/`__enter__`/`__exit__` → feeds Capstone 1
4. **Dataclasses and type hints** — `@dataclass`, `typing`, static checking via `ruff` → feeds Capstone 1
5. **Capstone 1** — Data pipeline
6. **Packaging and testing** — `uv`, `pyproject.toml`, `pytest` → feeds Capstone 2
7. **Capstone 2** — CLI tool
8. **NumPy and vectorization** — arrays, broadcasting, a measured loop-vs-vectorized comparison → feeds Capstone 3
9. **PyTorch tensors and autograd** — `requires_grad`, `.backward()`, gradients from first principles → feeds Capstone 3
10. **Capstone 3** — Linear regression via hand-rolled gradient descent
11. **PyTorch neural networks** — `nn.Module`, `optim`, training loops, measured CPU vs. MPS → feeds Capstone 4
12. **Capstone 4** — A small PyTorch neural network
13. **Keras** — `Sequential`/functional API, `.compile()`/`.fit()`, the shared-backend fact → feeds Capstone 5
14. **Capstone 5** — The same network in Keras, measured against Capstone 4
15. **Beyond this guide** — signposts only
16. **Final assessment** + **Resources**

## Ecosystem-breadth triage

| Topic | Capstone-impact test | Treatment |
|---|---|---|
| Packaging/testing (`uv`, `pytest`) | Directly required by Capstone 2, continues the series' verification-discipline thread | **Full**, Module 6 |
| Vectorized-vs-loop performance | Directly, measurably changes Capstone 3's approach and result | **Full**, Module 8 |
| GPU acceleration (MPS) | Directly measured in Capstone 4 | **Full**, Module 11 |
| `async`/`await`, concurrency, the GIL and 3.13's free-threading | Doesn't touch any capstone here (none is I/O-bound or needs true parallelism) | **Signpost** |
| `pandas` | Doesn't touch a capstone — this guide's data handling stays at the list/dict/NumPy-array level throughout | **Signpost** |
| `scikit-learn` | Deliberately out of scope — this guide builds models by hand (Capstone 3) and via two real deep-learning frameworks (Capstones 4–5), not a third, classical-ML-focused library | **Signpost** |
| JAX | A third real tensor/autograd framework, doesn't touch a capstone | **Signpost** |
| Publishing a package (PyPI, wheels) | Capstone 2's CLI tool is built and tested locally; distribution is a separate concern | **Signpost** |
| Docker | Named directly — this series' next guide, and the natural "how do you actually ship this" answer to everything Capstone 2 builds | **Signpost**, with the cross-guide pointer made explicit |

## Setup

```bash
uv init --python 3.12 --name code-rookie-python
uv add torch numpy keras
uv add --dev pytest ruff ty
```

Verified installed versions: `torch==2.13.0`, `keras==3.15.0` (backend: `torch`), `numpy==2.5.1`, `pytest==9.1.1`, `ruff==0.15.22`, `ty==0.0.61`. `ty` — Astral's type checker, the same team behind `uv` and `ruff` — is Module 4's static type-checking tool; `ruff` is a separate linter, not a type checker (Module 4 verifies both directly, on the same file, catching genuinely different classes of problem).

Verification pattern used throughout this guide:

```bash
uv run python3 script.py
uv run pytest
```

Keras's backend is set once, per project, in a `.venv`-scoped environment variable rather than per-invocation:

```bash
echo 'export KERAS_BACKEND=torch' >> .venv/bin/activate
# or, per-invocation: KERAS_BACKEND=torch uv run python3 script.py
```
