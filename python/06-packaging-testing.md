# Module 6 — Packaging and Testing

This guide's entry in the series' running verification-discipline thread (Fortran's `check()`, SQL's measured claims, Prolog's `plunit`) — a real project structure, managed by `uv`, and a real `pytest` suite that catches a genuine bug this module deliberately introduces and then fixes. Every command below is a real, verified `uv`/`pytest` run. Feeds Capstone 2.

## `uv`: project structure, not just a package installer

**You'll be able to:** explain what `uv init`/`uv add` actually set up, and why this guide never touches system Python.

**Concept**

`uv init` creates a `pyproject.toml` (the project's declared dependencies and metadata) and an isolated `.venv` — a virtual environment containing only this project's packages, entirely separate from the system's or Anaconda's Python installation. `uv add <package>` installs into that `.venv` and records the dependency in `pyproject.toml`; `uv run <command>` runs inside it automatically, with no manual "activate the virtualenv" step required.

**Example**, this guide's actual `pyproject.toml`:

```toml
[project]
name = "code-rookie-python"
version = "0.1.0"
requires-python = ">=3.12"
dependencies = [
    "keras>=3.15.0",
    "numpy>=2.5.1",
    "torch>=2.13.0",
]

[dependency-groups]
dev = [
    "pytest>=9.1.1",
    "ruff>=0.15.22",
    "ty>=0.0.61",
]
```

`dependencies` (what the actual program needs at runtime) and `dependency-groups.dev` (tools only needed while developing — a test runner, a linter, a type checker) are kept separate; `uv add --dev pytest` is what populated the second group, `uv add torch` the first.

> **Pitfall:** this project's `python3` on `$PATH` outside any `uv run` command is Anaconda's system-wide install (`/opt/anaconda3/bin/python3`), the same "system Python isn't the one you actually want" trap `ruby/00-overview.md` flagged for macOS's shipped Ruby. Every command in this guide runs through `uv run` specifically to guarantee it's using this project's isolated `3.12` interpreter and exact dependency versions, not whatever happens to be first on `$PATH`.

**Practice**

- Run `uv run python3 --version` and separately `python3 --version` (no `uv run`) and confirm they report different versions — that difference is exactly what `uv run` exists to eliminate as a source of "works on my machine" bugs.

## A real project layout: `src/`, and a real import error

**You'll be able to:** structure a project so `pytest` can actually find the code under test, and recognize the specific error when it can't.

**Concept**

A `pytest` test file needs the code it's testing to be importable — which, for a project layout with source files sitting loose next to a `tests/` directory, isn't automatic. This guide uses the standard `src/` layout: real code under `src/code_rookie_python/`, tests under `tests/`, and `pyproject.toml` telling `pytest` where to look.

**Example — the real error, hit directly while building this guide:**

```python
# tests/test_pipeline.py, first attempt
from pipeline import parse_lines, totals_by_category, Transaction
```

Verified: running `uv run pytest` against this exact import produced `ModuleNotFoundError: No module named 'pipeline'` — `pytest` correctly can't find a bare `pipeline` module, because nothing on the Python path points at wherever that file actually lives relative to `tests/`.

**The fix**, verified directly — add to `pyproject.toml`:

```toml
[tool.pytest.ini_options]
pythonpath = ["src"]
```

...and import via the full package path:

```python
from code_rookie_python.pipeline import parse_lines, totals_by_category, Transaction
```

Verified: with both changes, the identical test file's imports resolve correctly and `pytest` collects and runs every test without error.

> **Pitfall:** this specific error is genuinely common in real Python projects, not a beginner-only trap — it's a direct consequence of Python having no single, forced project-layout convention the way, say, a Rust `cargo` project or a Java Maven project does. `pythonpath = ["src"]` is one standard, `pytest`-native fix; other real projects instead make the package properly `pip install -e`-able (an "editable install," out of this guide's scope) — either way, the error's presence means the project's layout and its test configuration disagree about where the code lives, not that anything about the code itself is wrong.

**Practice**

- Remove `pythonpath = ["src"]` from `pyproject.toml`, rerun `uv run pytest`, and confirm the exact `ModuleNotFoundError` reappears — then restore the fix.

## `pytest`: real tests, and a real caught bug

**You'll be able to:** write `pytest` tests using plain `assert`, and explain what a failing assertion's diff output is telling you.

**Concept**

A `pytest` test is a function named `test_*`, containing plain `assert` statements — no special assertion-method vocabulary (`assertEqual`, `assertTrue`) the way Python's older built-in `unittest` needs. `pytest` rewrites `assert` at collection time to produce a detailed diff on failure, showing exactly what didn't match.

**Example**, testing this guide's transaction pipeline (`pipeline.py`, from Capstone 1):

```python
from code_rookie_python.pipeline import Transaction, totals_by_category

def test_totals_excludes_below_minimum():
    transactions = [
        Transaction("Alice", 50.0, "hardware"),
        Transaction("Bob", 15.0, "hardware"),
    ]
    totals = totals_by_category(iter(transactions))
    assert totals == {"hardware": 50.0}

def test_boundary_amount_is_included():
    transactions = [Transaction("Eve", 20.0, "hardware")]
    totals = totals_by_category(iter(transactions))
    assert totals == {"hardware": 20.0}
```

Verified: all four tests in this module's actual suite pass (`4 passed in 0.01s`), including the boundary case — a transaction at *exactly* the `20.0` minimum is correctly included, not excluded, matching `totals_by_category`'s `if t.amount < min_amount: continue` (strictly-less-than, so `20.0` itself never triggers the `continue`).

**A real bug, introduced and caught, verified directly:** changing that one line to `if t.amount <= min_amount: continue` (a very plausible off-by-one slip — "below the minimum" reads ambiguously as either `<` or `<=` on first glance) and rerunning:

```
E       AssertionError: assert {} == {'hardware': 20.0}
E
E       Right contains 1 more item:
E       {'hardware': 20.0}
```

Verified: `test_boundary_amount_is_included` fails immediately, with `pytest`'s diff showing precisely what's missing — the boundary-exactly-`20.0` transaction was wrongly excluded. Reverting to `<` makes all four tests pass again, confirmed directly.

> **Pitfall:** this bug would have shipped invisibly without the boundary test specifically — `test_totals_excludes_below_minimum` (an amount clearly under the threshold) and `test_totals_sums_same_category` (amounts clearly over it) both still pass under the buggy `<=` version, since neither uses a value sitting exactly on the boundary. A test suite that only checks clearly-inside and clearly-outside cases, never the boundary itself, will not catch an off-by-one error at the boundary — exactly the kind of gap this guide's own boundary test was written to close.

**Practice**

- Write a test for the empty-input case (`totals_by_category(iter([]))` should return `{}`), run it, and confirm it passes against the current, correct code.
- Deliberately introduce a different bug — swap `t.category` for the hardcoded string `"hardware"` in `totals_by_category` — rerun the full suite, and confirm the genuinely surprising, verified result: **every test still passes**. Every fixture in this suite happens to use `"hardware"` as its only category, so a bug that hardcodes exactly that string produces exactly the same output these tests check for — a real test-coverage gap, not a hypothetical one, and the fix is a test using a *second*, different category to actually exercise the part of the code this bug breaks.

## Progress check

1. What does `uv run` guarantee about which Python interpreter and package versions a command actually uses?
2. Why does `dependencies` versus `dependency-groups.dev` in `pyproject.toml` matter as a distinction?
3. What specific error did this guide hit when its first test file tried `from pipeline import ...`, and what was the actual root cause?
4. What's the fix this guide applied, and what two changes did it require together?
5. Why did the off-by-one bug (`<=` instead of `<`) pass two of this guide's four tests and fail only the third?
6. What does a failing `pytest` `assert totals == {...}` show in its output, beyond just "this test failed"?

### Answers

1. That the command runs against this specific project's isolated `.venv` and the exact dependency versions recorded in `pyproject.toml`/`uv.lock` — not whatever Python happens to be first on `$PATH` (which, on this machine, is a different, Anaconda-managed interpreter entirely).
2. `dependencies` are what the actual program needs to run; `dependency-groups.dev` are tools only needed during development (a test runner, a linter, a type checker) that a real deployment of the program shouldn't need to install at all.
3. `ModuleNotFoundError: No module named 'pipeline'` — the root cause was that nothing told `pytest` where the actual source file lived relative to the `tests/` directory; a bare `pipeline` import has no path to resolve against by default in a `src/`-layout project.
4. Adding `pythonpath = ["src"]` under `[tool.pytest.ini_options]` in `pyproject.toml`, and changing the test's import to the full package path (`from code_rookie_python.pipeline import ...`) — both were needed together; either alone still fails.
5. Because the other two tests use amounts clearly inside (`50.0`) or clearly outside (`15.0`, correctly excluded either way) the threshold, and never test the value sitting exactly *on* the boundary (`20.0`) — only a test at the boundary itself can distinguish `<` from `<=` behavior.
6. It shows a detailed diff of what the two sides of the comparison actually were — in this guide's caught bug, `assert {} == {'hardware': 20.0}` reported specifically that the right-hand side "contains 1 more item," pinpointing exactly which expected entry was missing rather than just reporting "not equal."
