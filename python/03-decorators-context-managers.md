# Module 3 — Decorators and Context Managers

Two Python features built on the same underlying idea — a function that wraps another operation — but solving genuinely different problems: decorators modify what a function *does* when called; context managers guarantee cleanup *happens*, exception or not. Every example below is a real, verified `uv run python3` execution. Feeds Capstone 1.

## Closures: the foundation decorators are built on

**You'll be able to:** write a function that returns another function, capturing a variable from its enclosing scope.

**Concept**

A closure is a function that remembers variables from the scope it was defined in, even after that outer function has returned. This is ordinary, ungimmicked Python — no special syntax beyond defining one function inside another and returning the inner one.

**Example**

```python
def make_multiplier(n):
    def multiplier(x):
        return x * n
    return multiplier

double = make_multiplier(2)
triple = make_multiplier(3)
print(double(5), triple(5))
```

Verified: `10 15` — `double` and `triple` are two separate closures, each remembering its own `n` (`2` and `3` respectively) from its own call to `make_multiplier`, even though `make_multiplier` itself has long since returned by the time `double(5)` runs.

**Practice**

- Write `make_counter()`, returning a closure that returns an incrementing count each time it's called (`counter = make_counter(); counter() → 1; counter() → 2; ...`) — this needs `nonlocal` to modify the captured variable from inside the inner function; look up why a plain assignment inside the closure wouldn't work.

## Decorators: wrapping a function's behavior

**You'll be able to:** write a decorator with `@`, and explain the real metadata-loss trap it introduces without `functools.wraps`.

**Concept**

`@decorator` above a function definition is shorthand for `func = decorator(func)` — a decorator is just a closure that takes a function, returns a new function (usually one that calls the original and adds behavior around it), and Python rebinds the name to the wrapped version automatically.

**Example**

```python
import time

def timer(func):
    def wrapper(*args, **kwargs):
        start = time.perf_counter()
        result = func(*args, **kwargs)
        elapsed = time.perf_counter() - start
        print(f"{func.__name__} took {elapsed:.6f}s")
        return result
    return wrapper

@timer
def slow_add(a, b):
    """Adds two numbers slowly."""
    time.sleep(0.01)
    return a + b

print(slow_add(2, 3))
print(slow_add.__name__, slow_add.__doc__)
```

Verified output: `slow_add took 0.015021s`, then `5` (the correct sum), then `wrapper None` — the timing genuinely works, but `slow_add.__name__` reports `'wrapper'`, not `'slow_add'`, and `slow_add.__doc__` reports `None`, not the original docstring. The decorator replaced `slow_add` with `wrapper` entirely — every bit of introspectable identity the original function had is gone, replaced by the wrapper's own.

> **Pitfall, verified precisely:** this silently breaks anything that inspects a decorated function's identity — debuggers, `help()`, documentation generators, `pytest`'s own test-name reporting (relevant the moment Module 6 decorates a test function). The fix is `functools.wraps`:
> ```python
> import functools
> def timer_fixed(func):
>     @functools.wraps(func)
>     def wrapper(*args, **kwargs):
>         ...
> ```
> Verified directly: with `@functools.wraps(func)` added to `wrapper`, `slow_add2.__name__` correctly reports `'slow_add2'` and `slow_add2.__doc__` correctly reports `'Adds two numbers slowly.'` — every real decorator in this guide from here forward uses `functools.wraps`, specifically because omitting it is the kind of mistake that works fine until something downstream depends on the wrapped function's real identity.

**Practice**

- Write a `@retry` decorator that calls the wrapped function up to 3 times if it raises an exception, re-raising only after the third failure — remember `functools.wraps`.

## Context managers: guaranteed cleanup, exception or not

**You'll be able to:** write a class-based context manager with `__enter__`/`__exit__`, and explain why `with` guarantees cleanup even when the block raises.

**Concept**

`with expr as name:` calls `expr.__enter__()` (binding its return value to `name`) before the block runs, and unconditionally calls `expr.__exit__(exc_type, exc_val, exc_tb)` after the block ends — whether it ended normally or via an exception. This is Python's answer to the "always release this resource" problem every language in this series has needed some version of (C's manual `free`, C++'s RAII, JavaScript's `try`/`finally`).

**Example**

```python
class Timer:
    def __enter__(self):
        self.start = time.perf_counter()
        return self
    def __exit__(self, exc_type, exc_val, exc_tb):
        self.elapsed = time.perf_counter() - self.start
        print(f"elapsed: {self.elapsed:.6f}s, exception occurred: {exc_type is not None}")
        return False  # don't suppress the exception

with Timer() as t:
    total = sum(range(1000))
```

Verified: `elapsed: 0.000009s, exception occurred: False` — `__exit__` correctly receives `exc_type = None` for a block that completed normally, and `t.elapsed` is accessible after the `with` block ends (`__enter__` returned `self`, so `t` really is the `Timer` instance).

```python
try:
    with Timer() as t2:
        raise ValueError("boom")
except ValueError as e:
    print("exception propagated correctly:", e)
```

Verified: `elapsed: 0.000001s, exception occurred: True`, then `exception propagated correctly: boom` — `__exit__` still ran (cleanup happened) even though the block raised, and because `__exit__` returned `False`, the exception continued propagating past the `with` statement to the surrounding `try`, exactly as `return False` promises. Returning `True` from `__exit__` instead would *suppress* the exception entirely — a real, deliberate tool, not a mistake, for a context manager that's specifically designed to swallow certain errors.

`contextlib.contextmanager` writes the same pattern as a generator function instead of a class:

```python
@contextlib.contextmanager
def managed_resource(name):
    print(f"acquiring {name}")
    try:
        yield name
    finally:
        print(f"releasing {name}")

try:
    with managed_resource("file-handle") as res:
        raise RuntimeError("fail mid-use")
except RuntimeError as e:
    print("caught:", e)
```

Verified output: `acquiring file-handle`, then `releasing file-handle`, then `caught: fail mid-use` — **the resource is released even though the `with` block raised partway through**, because the generator's `try`/`finally` (Module 2's `yield` mechanics, reused here) guarantees the `finally` block runs when the generator is closed, whether that closing happens normally or via an exception propagating back through the `yield`.

> **Pitfall:** the `finally` in a `contextlib.contextmanager` generator is not optional decoration — without it, an exception raised inside the `with` block propagates straight through the generator without ever reaching the cleanup code after `yield`, since the exception is thrown *into* the generator at the `yield` point and, with no `try`/`finally` wrapping it, simply exits without running whatever came after.

**Practice**

- Remove the `try`/`finally` from `managed_resource` (leaving just `print(f"acquiring {name}"); yield name; print(f"releasing {name}")`), rerun the exception-during-use test, and confirm the "releasing" message no longer prints — direct proof that `finally` specifically is what guarantees cleanup runs.
- Write a class-based context manager that temporarily changes a module-level setting (e.g., a logging verbosity flag) for the duration of a `with` block and restores the original value in `__exit__`, regardless of whether the block raised.

## Progress check

1. What does a closure remember, and for how long does it remember it?
2. What does `@decorator` above a function definition actually expand to?
3. What specifically breaks about a decorated function without `functools.wraps`, verified directly?
4. What does `with expr as name:` guarantee about `expr.__exit__()`, regardless of how the block ends?
5. What's the difference between `__exit__` returning `False` versus `True`?
6. Why did removing the `try`/`finally` from a `contextlib.contextmanager` generator break its cleanup guarantee specifically during an exception, even though the normal (no-exception) path might still look like it works?

### Answers

1. Every variable from its enclosing function's scope that it actually references — and it remembers them for as long as the closure itself (the returned inner function) still exists, even after the outer function has returned, verified directly with `double`/`triple` each independently remembering their own `n`.
2. `func = decorator(func)` — the decorator is called with the original function, and whatever it returns replaces the original name in the enclosing scope.
3. The wrapped function's `__name__` and `__doc__` (and other introspectable metadata) report the *wrapper's* identity, not the original function's — verified directly: `slow_add.__name__` reported `'wrapper'` and `slow_add.__doc__` reported `None` without `functools.wraps`.
4. It guarantees `__exit__()` is called exactly once after the block, whether the block completed normally or raised an exception — verified directly for both cases, including confirming `exc_type is not None` correctly reports which case occurred.
5. Returning `False` (or any falsy value) lets an exception that occurred in the block continue propagating past the `with` statement, unchanged. Returning `True` suppresses it entirely — the `with` statement completes as if no exception happened.
6. Because the exception is thrown directly into the generator at its `yield` point — without a `try`/`finally` wrapping that `yield`, the exception simply propagates straight out of the generator with nothing after `yield` ever executing. The normal, no-exception path can still look correct without `try`/`finally` (the code after `yield` runs in sequence either way when nothing goes wrong), which is exactly why the missing guarantee is easy to miss until an exception actually occurs.
