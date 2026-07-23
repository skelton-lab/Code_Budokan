# Module 7 — Capstone 2: A Packaged, Tested CLI Tool

**Proves:** `uv`/`pyproject.toml` packaging, type hints checked with `ty`, `ruff` linting, `pytest` (Module 6).

Capstone 1's transaction pipeline, wrapped in a real command-line interface — installed as an actual entry-point command (`report`, not just a script you remember to invoke with the right flags), fully covered by `pytest`, and passing both `ty` and `ruff` cleanly. Every command below is a real, verified `uv` run.

## Making the project a real, installable package

Capstone 1's `pipeline.py` lived loose in the project. A real CLI tool needs `pyproject.toml` to declare an actual entry point:

```toml
[project.scripts]
report = "code_rookie_python.cli:main"

[build-system]
requires = ["hatchling"]
build-backend = "hatchling.build"

[tool.hatch.build.targets.wheel]
packages = ["src/code_rookie_python"]
```

`uv sync` (verified directly) builds and installs this project into its own `.venv`, exactly like any other dependency — `report` becomes a real command, runnable via `uv run report`, not a script path someone has to remember.

## The CLI

```python
import argparse
import sys
from code_rookie_python.pipeline import parse_lines, totals_by_category

def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(prog="report", description="Summarize transactions by category.")
    parser.add_argument("file", help="Path to a CSV-like file of customer,amount,category lines")
    parser.add_argument("--min-amount", type=float, default=20.0, help="Ignore transactions below this amount")
    return parser

def run(file_path: str, min_amount: float) -> dict[str, float]:
    with open(file_path) as f:
        lines = f.readlines()
    transactions = parse_lines(lines)
    return totals_by_category(transactions, min_amount)

def main(argv: list[str] | None = None) -> int:
    parser = build_parser()
    args = parser.parse_args(argv)
    totals = run(args.file, args.min_amount)
    for category, total in sorted(totals.items()):
        print(f"{category}: {total:.2f}")
    return 0

if __name__ == "__main__":
    sys.exit(main())
```

Two deliberate design choices make this genuinely testable, not just runnable: `run()` holds all the real logic, separated from argument parsing entirely — a test can call it directly with a file path and a number, no command-line invocation needed. `main()` accepts an *optional* `argv` parameter instead of always reading `sys.argv` — a test can pass its own argument list directly (`main(["file.csv", "--min-amount", "40"])`), with no subprocess spawned and no need to fake `sys.argv`.

## Verified runs

```bash
uv run report /tmp/transactions.csv
```

Verified output: `electronics: 45.00`, `hardware: 80.00` — the same totals Capstone 1 computed, now reachable as an actual command.

```bash
uv run report /tmp/transactions.csv --min-amount 40
```

Verified output: `electronics: 45.00`, `hardware: 50.00` — raising the threshold to `40` correctly drops `Dave`'s `30.0` transaction from the hardware total (`80.0 → 50.0`, leaving only `Alice`'s `50.0`), while `electronics` (`Carol`'s single `45.0` transaction) is unaffected.

```bash
uv run report --help
```

Verified: `argparse` generates a complete, correctly-formatted usage message from the `add_argument` calls alone — no separate help text to keep in sync by hand.

## Tests using real `pytest` fixtures

```python
from code_rookie_python.cli import main, run

def test_run_reads_file_and_totals(tmp_path):
    csv_file = tmp_path / "transactions.csv"
    csv_file.write_text("Alice, 50.0, hardware\nBob, 15.0, hardware\n")
    totals = run(str(csv_file), min_amount=20.0)
    assert totals == {"hardware": 50.0}

def test_main_returns_zero_on_success(tmp_path, capsys):
    csv_file = tmp_path / "transactions.csv"
    csv_file.write_text("Alice, 50.0, hardware\n")
    exit_code = main([str(csv_file)])
    captured = capsys.readouterr()
    assert exit_code == 0
    assert "hardware: 50.00" in captured.out
```

Verified: all `8` tests in this capstone's full suite pass (`8 passed in 0.01s`) — the two shown here plus Capstone 1's original five plus one more covering the `--min-amount` flag. `tmp_path` (a built-in `pytest` fixture) provides a real, isolated, automatically-cleaned-up temporary directory — no test writes to or depends on any file outside its own run. `capsys` captures whatever the code under test printed to `stdout`, letting a test assert on the CLI's actual visible output without any manual redirection.

Both `ty check` and `ruff check` run clean against `cli.py`, verified directly — no type mismatches, no unused imports, no lint warnings.

> **Pitfall:** none of this testability was free — it came specifically from *not* writing `args = parser.parse_args(); totals = run(args.file, ...)` directly inside a bare `if __name__ == "__main__":` block with no `main()` function at all, the way a "just make it work" first draft of a CLI script often looks. Separating parsing (`build_parser`), logic (`run`), and orchestration (`main`, with an overridable `argv`) is what let every test above call real code paths directly, with no subprocess and no `sys.argv` monkey-patching.

## Practice

- Add a `--top-category` flag that prints only the single highest-total category instead of the full breakdown, with a `pytest` test covering it using `tmp_path`/`capsys`.
- Run `uv run ty check` and `uv run ruff check` against your extension and confirm both still pass cleanly.
- Explain why `main(argv: list[str] | None = None)` accepting `None` specifically (rather than requiring callers to always pass a list) is what lets `if __name__ == "__main__": sys.exit(main())` still work correctly for a real command-line invocation, where `argparse.parse_args()`'s own default behavior (reading `sys.argv[1:]` when given nothing) is exactly what's wanted.
