# Resources & Cheat Sheet

## References

| Resource | Why it matters |
|---|---|
| [Python documentation](https://docs.python.org/3/) | The complete reference for this guide's language-level material (Modules 1–4) |
| [uv documentation](https://docs.astral.sh/uv/) | This guide's entire project/dependency toolchain (Module 6) |
| [ty documentation](https://github.com/astral-sh/ty) | Module 4's type checker — genuinely current, actively evolving tooling |
| [pytest documentation](https://docs.pytest.org/) | Module 6/Capstone 2's testing tools, including `tmp_path`/`capsys` fixtures |
| [PyTorch documentation](https://pytorch.org/docs/stable/index.html) | Modules 9–12's tensor/autograd/`nn.Module` material in full |
| [Keras documentation](https://keras.io/api/) | Modules 13–14's higher-level API in full |
| [NumPy documentation](https://numpy.org/doc/stable/) | Module 8's vectorization/broadcasting foundation |
| This series' [Ruby guide](../ruby/00-overview.md) | The "clean, non-system toolchain" precedent (`ruby/00-overview.md`'s Homebrew-not-system flag) this guide's `uv`-managed `.venv` follows directly |
| This series' [SQL guide](../sql/00-overview.md) | The measure-don't-assume precedent (the 130× indexing speedup, and the honest "no change at small scale" finding) this guide's own GPU and Keras-overhead measurements follow directly |

## One-page cheat sheet

| Idea | Where |
|---|---|
| Python's truthiness diverges from Ruby's (`0`, `""`, `[]` are falsy) | Module 1 |
| Mutable default arguments are evaluated once, shared across calls | Module 1 |
| `==` (value) vs. `is` (identity); small-int cache (`-5` to `256`) | Module 1 |
| List/dict/set comprehensions; the `__iter__`/`__next__` protocol | Module 2 |
| Generators (`yield`) are lazy and single-use | Module 2 |
| Decorators (`@decorator`); always pair with `functools.wraps` | Module 3 |
| Context managers (`with`, `__enter__`/`__exit__`, `contextlib.contextmanager`) guarantee cleanup, exception or not | Module 3 |
| `@dataclass`: auto `__init__`/`__repr__`/`__eq__`; rejects mutable defaults; `frozen=True` | Module 4 |
| Type hints checked by `ty` (static); linting is a separate job, done by `ruff` | Module 4 |
| `uv init`/`uv add`/`uv run`; `src/` layout + `pythonpath = ["src"]` for `pytest` | Module 6 |
| `pytest`: plain `assert`, `tmp_path`, `capsys` fixtures | Module 6 |
| `argparse`; separate `run()` (logic) from `main(argv=None)` (orchestration) for testability | Capstone 2 |
| NumPy vectorization: ~13× measured speedup over a naive loop; broadcasting rules | Module 8 |
| NumPy's fixed-width `int64` can silently overflow on `.sum()` — no warning | Module 8 |
| `torch.from_numpy()` shares memory; `torch.tensor()` copies | Module 9 |
| `requires_grad=True`, `.backward()`, `.grad` — accumulates, needs `.zero_()` | Module 9 |
| `torch.no_grad()` required for manual parameter updates | Module 9 |
| `nn.Module`, `nn.Linear`, `torch.optim`, `optimizer.step()`/`zero_grad()` | Module 11 |
| MPS: real GPU acceleration, but only pays off above a real workload-size threshold — measure with `torch.mps.synchronize()` | Module 11 |
| A nonlinear hidden layer (`ReLU`) is what makes a non-linearly-separable problem solvable — not more training | Capstone 4 |
| Keras `Sequential`/functional API, `.compile()`/`.fit()` — same PyTorch tensors underneath (`keras.backend.backend()`) | Module 13 |
| Keras `.fit()`'s convenience has a real, measurable cost — investigate before trusting a dramatic number | Capstone 5 |

## Verification technique used throughout this guide

```bash
uv run python3 script.py
uv run pytest
uv run ty check file.py
uv run ruff check file.py
```

Run everything through `uv run`, inside this project's isolated `.venv` — never the system/Anaconda `python3` that happens to be first on `$PATH`. Every code example, every measured timing (the NumPy vectorization speedup, the CPU/MPS comparisons, the Keras-overhead investigation), and every quiz answer in this guide was checked this way — including two real, caught-during-verification findings kept in deliberately: a silent `int64` overflow in a NumPy `.sum()` with zero warnings raised, and an initially dramatic 221× Keras-vs-PyTorch timing gap that turned out to be mostly an unmatched batch-size artifact, corrected to a real, still-meaningful ~22× once investigated properly.

## Where to go now

This guide closes the Python/PyTorch/Keras group with the same discipline every guide in this series has insisted on since Fortran's `v(::-1)` error: measure, don't assume, and when a number looks too dramatic to be true, investigate before reporting it, the way Capstone 5's Keras timing needed a second, corrected look. From here, per this series' stated sequencing (`INDEX.md`): **Docker** — this series' next guide, and the direct, general answer to the "which exact toolchain version" concern that's run through every guide since Ruby's Homebrew-not-system flag.
