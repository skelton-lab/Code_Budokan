# Module 15 — Beyond This Guide

Every topic here failed the capstone-impact test (`00-overview.md`'s ecosystem-breadth triage table) — none of them change how Capstones 1–5 turn out, and none are required by an exercise you've been assigned. That's a scoping decision, not an oversight: each entry says what it is, why it matters, and where to go deeper when you actually need it.

### `async`/`await` and concurrency

**What it is:** Python's `async def`/`await` syntax for cooperative concurrency (many I/O-bound tasks making progress by yielding control at `await` points, on a single thread), alongside `threading` (real OS threads, historically limited by the Global Interpreter Lock, or GIL) and `multiprocessing` (separate processes, sidestepping the GIL entirely at the cost of process-boundary overhead).

**Why it matters:** none of this guide's five capstones is I/O-bound (waiting on network requests, file handles, or other external, slow-relative-to-CPU operations) or needs genuine parallel execution across CPU cores — Capstone 2's CLI tool reads one file and exits; every ML capstone's actual bottleneck is tensor computation, already handled by PyTorch's own internal parallelism (and, for Modules 11/12, MPS). `async`/`await` earns its complexity the moment a program is genuinely waiting on many slow external things at once, which this guide's scope never required.

**Where to go next:** the [official `asyncio` documentation](https://docs.python.org/3/library/asyncio.html); real-world use cases tend to be web servers and API clients, not the data-and-model-building work this guide covered.

### The GIL, and Python 3.13's experimental free-threading

**What it is:** CPython's Global Interpreter Lock has historically meant only one thread executes Python bytecode at a time, even on a multi-core machine — real parallel *computation* across threads has needed `multiprocessing` or a library (like PyTorch itself) that drops into non-Python code for the parallel part. Python 3.13 (this project's own Python version, confirmed: `3.13.5`) introduced an experimental, opt-in **free-threaded** build (PEP 703) that removes the GIL entirely — confirmed via `sys._is_gil_enabled()`, a new 3.13 API, which reports `True` on this project's ordinary (non-free-threaded) build, since free-threading is a separate, specially-compiled interpreter variant, not the default.

**Why it matters:** doesn't touch any capstone here — none needed genuine multi-threaded Python-level parallelism (PyTorch's own tensor operations already parallelize internally, in C++/CUDA/Metal code, entirely outside the GIL's reach). Free-threading is a genuinely significant, very current change to how Python's own concurrency story works, worth knowing exists the moment CPU-bound, pure-Python parallelism (not delegated to a library like PyTorch) becomes relevant.

**Where to go next:** [PEP 703](https://peps.python.org/pep-0703/) itself, and the "Free-threaded CPython" section of the official Python documentation for the current, evolving state of this feature.

### `pandas`

**What it is:** the standard library for tabular, spreadsheet-like data manipulation in Python — `DataFrame`s with labeled columns, group-by/aggregation operations, and a huge ecosystem of file-format readers.

**Why it matters:** this guide's data handling stayed deliberately at the list/dict (Capstone 1) and NumPy-array (Modules 8–14) level throughout — genuinely sufficient for everything this guide's capstones needed, and closer to the actual tensor operations Modules 9–14 build on. `pandas` is the right tool the moment real-world, messy, labeled tabular data (mixed types, missing values, named columns) is the actual problem, rather than clean numeric arrays.

**Where to go next:** the [official pandas documentation](https://pandas.pydata.org/docs/), specifically its "10 minutes to pandas" quickstart.

### `scikit-learn`

**What it is:** the standard library for classical (non-deep-learning) machine learning in Python — decision trees, random forests, support vector machines, clustering, and a large collection of classical statistical models, all behind one consistent `.fit()`/`.predict()` interface.

**Why it matters:** deliberately out of scope by design, not oversight — this guide builds models two genuinely different ways (by hand, via autograd, in Capstone 3; via two real deep-learning frameworks in Capstones 4–5), specifically to show what's happening underneath a neural network's training loop. `scikit-learn`'s classical algorithms solve a different, often better-fitting class of problem (smaller datasets, tabular data, when a neural network would be overkill), with entirely different internals from anything Modules 9–14 covered.

**Where to go next:** the [official scikit-learn documentation](https://scikit-learn.org/stable/), specifically its own decision guide for "which algorithm should I use."

### JAX

**What it is:** a third real tensor/autograd framework (alongside PyTorch and TensorFlow/Keras), built around function transformations — `grad()` (automatic differentiation, this guide's Module 9 mechanism, expressed as a function transform instead of a method call), `jit()` (just-in-time compilation), and `vmap()` (automatic vectorization over batches) — popular in research settings for exactly this compositional, functional style.

**Why it matters:** doesn't touch any capstone — this guide deliberately used two frameworks (PyTorch directly, Keras on top of it) to make one specific point (what a higher abstraction level costs and buys you), not a survey of every available framework. JAX's functional style is genuinely different from both PyTorch's and Keras's object-oriented, stateful-model conventions.

**Where to go next:** the [official JAX documentation](https://jax.readthedocs.io/), particularly its own "JAX as accelerated NumPy" introduction, which connects directly back to this guide's own Module 8.

### Publishing a package

**What it is:** the remaining steps between Capstone 2's locally-installed CLI tool and a real, publicly distributable package — building a wheel (`uv build`), and uploading it to PyPI (`uv publish` or `twine`) so `pip install`/`uv add` can fetch it by name from anywhere.

**Why it matters:** Capstone 2 built and installed the `report` command locally, inside this project's own `.venv` — genuinely sufficient for everything this guide needed to demonstrate about packaging and testing. Distributing a package publicly is a separate concern (namespace registration, versioning discipline, a public changelog) layered on top of what `pyproject.toml` already set up.

**Where to go next:** the [Python Packaging User Guide](https://packaging.python.org/), specifically its "Packaging Python Projects" tutorial, which picks up exactly where this guide's `pyproject.toml` left off.

### Docker

**What it is:** this series' very next guide — containerization, the standard modern answer to "this ran correctly on my machine, how do I guarantee it runs correctly anywhere else."

**Why it matters:** every guide in this series so far has had some version of "which exact toolchain version" as a real, named concern (Ruby's Homebrew-not-system flag, this guide's own `uv`-isolated `.venv` instead of Anaconda's system Python) — Docker is the more general, industry-standard answer to that entire class of problem, packaging not just the interpreter but the entire operating-system-level environment a program actually runs in.

**Where to go next:** this series' own `docker/00-overview.md`, next in the stated sequencing.

### Serving a model or a data pipeline: Flask, FastAPI

**What it is:** Flask and FastAPI are Python *backend-only* web frameworks — no UI story at all, unlike Rails (companion: `rails/`) or a JavaScript full-stack framework. Flask is the older, deliberately minimal one: routing and request/response handling, with everything else (ORM, auth, validation) left to you. FastAPI is the newer alternative, built specifically to use Python's own type hints (Module 4's `dataclasses`/`typing` material, directly) for automatic request validation and auto-generated OpenAPI/Swagger docs, and it's async-native rather than async-optional the way Flask has traditionally been.

**Why it matters here specifically:** the real-world case for either one, in this series' own context, is serving what Modules 9–14 already built — a trained PyTorch or Keras model, or `05-capstone-data-pipeline.md`'s own pipeline — as an HTTP endpoint, without rewriting any of that logic in another language. That's the actual reason "Python backend" is a common real pairing: the ML/data code is already Python, so the API layer staying Python avoids a second implementation of the same logic. The frontend that talks to it is very often a separate JavaScript project entirely — plain `fetch()` calls (Module 6 of `javascript/`, `07-server.md`) or a framework like Vue — since Flask/FastAPI have no opinion about what's on the other end of the HTTP request.

**Contrast — the other industry-standard shape:** React + Next.js + Node is the mainstream *full-stack* JavaScript answer, and it solves a different problem than Flask/FastAPI do. Next.js is a framework built on top of React that adds server-side rendering and API routes, and those API routes run on Node underneath — meaning frontend and backend are one language, one project, start to finish. That's a genuinely different tradeoff from "Python backend, separate JS frontend": one language throughout versus reusing existing Python logic without a rewrite. Neither is more "correct" — they answer different questions about where a team's existing code already lives.

**Where to go next:** [Flask's own quickstart](https://flask.palletsprojects.com/en/stable/quickstart/) or [FastAPI's tutorial](https://fastapi.tiangolo.com/tutorial/) — both are short enough to read end to end in under an hour, and FastAPI's tutorial in particular assumes exactly the type-hint fluency Module 4 already built.

### The wider ecosystem

- **[Python documentation](https://docs.python.org/3/)** — the complete reference for everything this guide used (the iterator protocol, `dataclasses`, `typing`) in full depth beyond this guide's capstone-driven scope.
- **[PyTorch documentation](https://pytorch.org/docs/stable/index.html)** and **[Keras documentation](https://keras.io/api/)** — the complete references for Modules 9–14's two frameworks.
- **Real Python** (realpython.com) — a large, generally reliable library of Python-specific deep dives, useful for any of this module's signposted topics.
