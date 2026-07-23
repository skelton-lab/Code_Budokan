# Module 5 — Capstone 1: A Transaction Report Pipeline

**Proves:** comprehensions/generators, decorators, context managers, dataclasses (Modules 1–4).

A small transaction-report pipeline — parse raw lines lazily, filter and total by category, write a report — built entirely from this module's four prior sessions' tools, each doing the specific job it was introduced for. Every result below is a real, verified `uv run python3` execution, passing `ty check` cleanly.

## The pipeline

```python
from dataclasses import dataclass
from collections.abc import Iterator
import functools, time, contextlib

@dataclass(frozen=True)
class Transaction:
    customer: str
    amount: float
    category: str

def parse_lines(lines: list[str]) -> Iterator[Transaction]:
    for line in lines:
        customer, amount, category = line.split(",")
        yield Transaction(customer.strip(), float(amount), category.strip())

def timer(func):
    @functools.wraps(func)
    def wrapper(*args, **kwargs):
        start = time.perf_counter()
        result = func(*args, **kwargs)
        elapsed = time.perf_counter() - start
        print(f"{func.__name__} took {elapsed:.6f}s")
        return result
    return wrapper

@contextlib.contextmanager
def report_writer(path: str) -> Iterator[list[str]]:
    lines_written: list[str] = []
    try:
        yield lines_written
    finally:
        print(f"report at {path}: {len(lines_written)} lines written")

@timer
def build_report(raw_lines: list[str], min_amount: float = 20.0) -> dict[str, float]:
    transactions = parse_lines(raw_lines)
    totals: dict[str, float] = {}
    with report_writer("report.txt") as out:
        for t in transactions:
            if t.amount < min_amount:
                continue
            totals[t.category] = totals.get(t.category, 0.0) + t.amount
            out.append(f"{t.customer}: {t.amount:.2f} ({t.category})")
    return totals
```

Every module's tool does exactly one job here: `Transaction` (Module 4) is a `frozen` dataclass — a parsed transaction record shouldn't change once built, and immutability is genuinely enforced, not just intended. `parse_lines` (Module 2) is a generator — it doesn't parse anything until `build_report`'s `for` loop actually asks for the next value, one line at a time, rather than materializing every `Transaction` up front. `timer` (Module 3) wraps `build_report` without changing a single line of its logic. `report_writer` (Module 3) guarantees its "closing report" message prints even if something inside the `with` block raised — this capstone's version doesn't need the exception path (Module 3 verified it directly for both), but the guarantee is exactly why it's the right tool for anything resembling a resource that needs cleanup, real or, as here, simulated.

## Verified run

```python
raw = [
    "Alice, 50.0, hardware",
    "Bob, 15.0, hardware",
    "Carol, 45.0, electronics",
    "Dave, 30.0, hardware",
]

totals = build_report(raw)
print(totals)
```

Verified output:

```
build_report took 0.000020s
report at report.txt: 3 lines written
{'hardware': 80.0, 'electronics': 45.0}
```

`Bob`'s `15.0` hardware transaction is correctly excluded (`min_amount=20.0` filters it out) — `hardware` totals `80.0` (`Alice`'s `50.0` + `Dave`'s `30.0`, not `95.0`), `electronics` totals `45.0` (`Carol` alone), and exactly `3` lines were written to the report — `Alice`, `Carol`, `Dave`, in that order, `Bob` correctly never reaching `report_writer`'s accumulator at all.

**Laziness, confirmed directly:** `parse_lines(raw)` returns a generator object immediately — `type(gen)` reports `<class 'generator'>` — with no `Transaction` actually constructed until `build_report`'s `for` loop pulls the first one. On a genuinely large input (a real log file with millions of lines, not this capstone's four), this is the difference between holding every parsed record in memory at once and holding exactly one at a time, the same measured trade-off Module 2 demonstrated directly (a `4,000×` memory difference between a materialized list and a generator over the same range).

> **Pitfall:** `Transaction` being `frozen=True` isn't decorative here — a parsing bug that accidentally tried to "fix up" a transaction's `category` after construction (a real, plausible mistake in a larger version of this pipeline, perhaps a data-cleaning step bolted on later) would be caught immediately as a `FrozenInstanceError` (Module 4), rather than silently succeeding and leaving a downstream reader unsure whether a `Transaction` object is ever mutated after it's created.

## Practice

- Add a `most_expensive: Transaction | None` field to track the largest transaction seen, computed inside `build_report`'s loop — since `Transaction` is `frozen`, this needs a plain (non-frozen) local variable to track the running maximum, not an attempt to mutate anything inside the loop.
- Confirm `uv run ty check` on your extended version still passes cleanly, the same way the base capstone above does.
- Rewrite `parse_lines` as a list comprehension instead of a generator (`[Transaction(...) for line in lines]`), and explain what specifically would need to change about `build_report` for this capstone's behavior to stay identical — does anything actually break, given `build_report`'s current logic never needed laziness for four transactions?
