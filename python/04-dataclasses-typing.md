# Module 4 — Dataclasses and Type Hints

A struct-like way to declare data (`@dataclass`) that turns out to directly guard against Module 1's mutable-default trap in one specific context, and Python's optional, gradually-adoptable type-hint system, checked for real with `ty` — a genuinely current tool (Astral, the same team behind `uv` and `ruff`), not a hypothetical. Every example below is a real, verified `uv run` execution. Feeds Capstone 1.

## `@dataclass`: auto-generated `__init__`, `__repr__`, and `__eq__`

**You'll be able to:** declare a data-holding class in a few lines and get correct construction, printing, and value equality for free.

**Concept**

`@dataclass` reads a class's type-annotated attributes and generates `__init__` (one parameter per field), `__repr__` (a readable printout), and `__eq__` (field-by-field value comparison) automatically — the boilerplate every prior guide's "simple data-holding class" pattern (a C `struct`, a Ruby `Struct`, a JavaScript plain object) has needed some version of, made a one-line annotation here.

**Example**

```python
from dataclasses import dataclass

@dataclass
class Point:
    x: float
    y: float

p1 = Point(1.0, 2.0)
p2 = Point(1.0, 2.0)
print(p1)
print(p1 == p2, p1 is p2)
```

Verified: `Point(x=1.0, y=2.0)`, then `True False` — `__repr__` produces a genuinely readable printout with no code written for it, and `__eq__` correctly compares field values (`True`), distinct from `is` (`False`, since `p1` and `p2` are two separately-constructed objects).

**Practice**

- Add a `label: str = "point"` field with a default value, and confirm `Point(1.0, 2.0)` (no third argument) still works, using the default.

## Mutable defaults: the language actually guards against this one

**You'll be able to:** use `field(default_factory=...)` for a mutable default field, and explain why plain `= []` doesn't even get the chance to cause Module 1's bug here.

**Concept**

Module 1 established that a plain function's mutable default argument is evaluated once, shared across every call. `@dataclass` fields have the identical underlying risk — but here, the language actively **refuses to let it happen**: a mutable default value on a dataclass field raises an error at class-definition time, forcing `field(default_factory=...)` (a callable that produces a fresh value per instance) instead.

**Example**

```python
from dataclasses import dataclass, field

@dataclass
class Record:
    name: str
    tags: list[str] = field(default_factory=list)

r1 = Record("a")
r2 = Record("b")
r1.tags.append("x")
print(r1.tags, r2.tags, r1.tags is not r2.tags)
```

Verified: `['x'] [] True` — `r1`'s mutation is correctly invisible to `r2`; each instance genuinely got its own list, called fresh from `default_factory=list` at construction time.

```python
@dataclass
class BadRecord:
    name: str
    tags: list = []
```

Verified: this raises `ValueError: mutable default <class 'list'> for field tags is not allowed: use default_factory` — **at class-definition time**, before `BadRecord` is ever instantiated. `@dataclass` specifically detects a mutable default and refuses to generate the trap Module 1 spent an entire pitfall on, rather than silently reproducing it.

> **Pitfall:** this protection is specific to `@dataclass` fields — it does **not** extend to ordinary function default arguments (Module 1's `def append_item(item, target=[])` still silently shares state, unprotected, verified there directly). The language learned this one specific lesson in one specific place; the general function-default-argument trap is exactly as real as Module 1 found it, everywhere else.

**Practice**

- Predict, then verify, whether `@dataclass` also rejects a mutable `dict` or `set` default the same way it rejected `list`, or whether the protection is `list`-specific.

## `frozen=True`: real immutability, enforced

**You'll be able to:** declare a dataclass whose fields genuinely cannot be reassigned after construction.

**Concept**

`@dataclass(frozen=True)` disables `__setattr__` on instances entirely — an attempt to reassign any field after construction raises `FrozenInstanceError`, not a silent no-op and not a convention-only "please don't mutate this."

**Example**

```python
@dataclass(frozen=True)
class ImmutablePoint:
    x: float
    y: float

ip = ImmutablePoint(1.0, 2.0)
ip.x = 5.0
```

Verified: `FrozenInstanceError: cannot assign to field 'x'` — genuinely enforced, not just documented intent.

**Practice**

- Explain why a `frozen=True` dataclass with a mutable field (say, `tags: list = field(default_factory=list)`) is only *shallowly* immutable — can `ip.tags.append(...)` still succeed, even though `ip.tags = [...]` cannot?

## Type hints, checked for real with `ty`

**You'll be able to:** write function signatures with type hints using modern syntax, and catch a real type mismatch before running the code.

**Concept**

Python's type hints are optional and unenforced *at runtime* — `def greet(name: str) -> str:` doesn't stop anyone from calling `greet(42)` while the program is actually running. Their value comes from a separate **static type checker** reading the hints and flagging mismatches before execution. This guide uses `ty` — Astral's type checker, the same team behind `uv` and `ruff`, genuinely current tooling rather than the long-established `mypy` this reader might expect by default.

**Example**

```python
def greet(name: str) -> str:
    return "Hello, " + name

greet(42)
```

Verified: running this with plain `python3` executes without error until it hits `"Hello, " + 42` inside `greet`, which then raises `TypeError` at runtime — the type hint alone caught nothing. Running `uv run ty check` against the same file instead:

```
error[invalid-argument-type]: Argument to function `greet` is incorrect
 --> bad_types.py:4:7
  |
4 | greet(42)
  |       ^^ Expected `str`, found `Literal[42]`
```

Verified: `ty` correctly flags the mismatch **before** the code ever runs, from the type hints alone — genuinely static analysis, not execution.

Modern union syntax (`X | Y`, Python 3.10+, replacing the older `typing.Optional[X]`/`typing.Union[X, Y]`):

```python
def find_user(user_id: int) -> str | None:
    return None if user_id < 0 else f"user_{user_id}"

print(find_user(5), find_user(-1))
```

Verified: `user_5 None` — and `ty` would separately flag any code path that used `find_user(...)`'s result without first checking for `None` where the hint promises it might be there, which is the actual point of writing `str | None` instead of just `str`.

> **Pitfall:** type hints are advisory to the Python interpreter itself — `greet(42)` *runs* under plain `python3`, it just fails later, from the actual string-concatenation error, not from the type hint. A hint with no type checker ever run against it (no `ty`, no `mypy`, no editor integration) is pure documentation, easy to let drift out of sync with what the code actually does, since nothing enforces it staying accurate.

`ruff` (Module 6 covers it as part of this guide's tooling) is a genuinely different tool from `ty` — a **linter**, catching unused imports, unused variables, and style issues, not type mismatches:

```python
import os
import sys

def foo(x):
    y = 5
    return x
```

Verified: `uv run ruff check` reports `os` and `sys` as unused imports (`F401`) and `y` as an unused local variable (`F841`) — none of which `ty` would catch (nothing about an unused import is a type error), and none of which `ruff` would catch a type mismatch for either. The two tools are complementary, not overlapping.

**Practice**

- Add a type hint to a function that's actually violated somewhere in its own body (not just at a call site) — e.g., `def double(x: int) -> int: return x * 2.0` — and confirm `ty` flags the return type mismatch even though no caller anywhere is involved yet.

## Progress check

1. What three methods does `@dataclass` generate automatically from a class's annotated fields?
2. Why did `p1 == p2` report `True` while `p1 is p2` reported `False`?
3. What happens, precisely, when a `@dataclass` field is given a plain mutable default like `tags: list = []`?
4. Why doesn't `@dataclass`'s mutable-default protection also apply to Module 1's `def append_item(item, target=[])`?
5. What's the practical difference between a type hint and a type *checker*, demonstrated directly by `greet(42)`?
6. Why are `ty` and `ruff` complementary tools rather than overlapping ones?

### Answers

1. `__init__` (one parameter per annotated field), `__repr__` (a readable printout of field values), and `__eq__` (field-by-field value comparison) — all generated from the class's type-annotated attributes with no code written for them.
2. `==` uses the generated `__eq__`, which compares field values (`x` and `y` both equal between `p1` and `p2`); `is` compares object identity, and `p1`/`p2` are two independently constructed objects, so `is` correctly reports `False` regardless of their equal contents.
3. `@dataclass` raises `ValueError` at class-definition time, before the class can even be instantiated — verified directly (`mutable default <class 'list'> for field tags is not allowed: use default_factory`), refusing to generate Module 1's mutable-default-argument trap in this specific context.
4. Because the protection is specific to how `@dataclass` processes field annotations — it's a check `@dataclass`'s own code performs, not a general Python language rule about default arguments. Ordinary function definitions have no equivalent check, so the identical-looking trap remains fully live there, verified directly in Module 1.
5. A type hint alone changes nothing about what actually runs — `greet(42)` executes under plain Python and only fails later, from the real `TypeError` inside string concatenation. A type checker (`ty`) reads the hints and flags the mismatch statically, before the code runs at all, without needing to execute the failing line to find the problem.
6. `ty` checks whether values match their declared types; `ruff` lints for unused imports, unused variables, and style issues — verified directly, `ruff` flagged unused imports and an unused variable that have nothing to do with type correctness, and neither tool's checks would catch the other's category of problem.
