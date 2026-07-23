# Module 1 — Foundations: Python's Data Model

Dynamic typing and duck typing are not new ground for this reader — Ruby and Smalltalk already covered that territory in depth. This module moves quickly, covering only what's genuinely Python-specific: truthiness rules that diverge from Ruby's, a real and famous mutability trap, and the precise difference between `==` and `is`. Every claim below is a real, verified `uv run python3` execution. Feeds Capstone 1.

## Truthiness: Python sides with JavaScript here, not Ruby

**You'll be able to:** correctly predict which values are falsy in a Python `if`, without carrying over the wrong guide's rule.

**Concept**

`ruby/01-foundations.md` established that Ruby's only falsy values are `nil` and `false` — `0` and `""` are both truthy there, a deliberate contrast with JavaScript's looser rules. Python goes the *other* way: `0`, `0.0`, `""`, `[]`, `{}`, `set()`, and `None` are all falsy, alongside `False` itself — much closer to JavaScript's rules than Ruby's.

**Example**

```python
falsy_values = [0, 0.0, "", [], {}, set(), None, False]
for v in falsy_values:
    print(repr(v), "->", bool(v))
```

Verified output: every one of `0`, `0.0`, `''`, `[]`, `{}`, `set()`, `None`, `False` reports `bool(v) == False`. Separately verified: `bool([0])` (a *non-empty* list, even one containing a falsy element) and `bool("0")` (a *non-empty* string, even the string `"0"`) both report `True` — emptiness is what matters for containers and strings, not the content.

> **Pitfall:** code carried over from this series' Ruby guide, where `if count` genuinely means "if `count` is not `nil`/`false`," behaves differently the moment it reaches Python — `if count:` where `count` happens to be `0` will not execute, exactly the JavaScript-style behavior Ruby's own guide called out as the thing it was deliberately avoiding. Use `if count is not None:` when the intent is specifically "has a value been set," not "is the value truthy."

**Practice**

- Predict, then verify, whether `bool((0,))` (a one-element tuple containing `0`) is truthy or falsy, and explain why in terms of the emptiness rule above.

## Mutable default arguments: a real, famous trap

**You'll be able to:** explain why a mutable default argument is shared across every call that doesn't override it, and avoid the pattern.

**Concept**

A function's default argument value is evaluated **once**, when the function is *defined*, not once per call. For an immutable default (a number, a string) this is invisible — nothing about it can change. For a **mutable** default (a list, a dict), every call that doesn't supply its own value shares the exact same object, and mutations from one call are visible in the next.

**Example**

```python
def append_item(item, target=[]):
    target.append(item)
    return target

r1 = append_item(1)
r2 = append_item(2)
print("r1:", r1, "r2:", r2, "same object:", r1 is r2)
```

Verified output: `r1: [1, 2]  r2: [1, 2]  same object: True`. `r2`'s call never touched `r1` — but because `target=[]` is the *same* list object every time `append_item` is called without its own `target`, `r1`'s earlier `.append(1)` is still sitting there when `r2`'s call adds `2`, and both names point at the identical, now-shared list.

> **Pitfall:** this reads as correct on first glance — `target=[]` looks exactly like "give me a fresh empty list each time," and every prior guide in this series' equivalent default-argument syntax (Ruby's `def foo(x, y=[])`, JavaScript's `function foo(x, y=[])`) genuinely *does* evaluate a literal default fresh per call. Python's one-evaluation-at-definition-time rule is the real, specific divergence, and it's exactly the kind of assumption that would otherwise carry over silently. The standard fix: default to `None`, and construct the real empty list inside the function body — `def append_item(item, target=None): target = [] if target is None else target`.

**Practice**

- Rewrite `append_item` using the `target=None` fix, and verify `r1`/`r2` are now correctly independent, single-element lists.
- Predict, then verify, whether the identical trap applies to a default argument of `target=()` (an empty tuple) — does mutating `target` even compile, given tuples are immutable?

## `==` versus `is`: value equality versus identity

**You'll be able to:** choose correctly between `==` and `is`, and explain a real, easy-to-misread CPython implementation detail.

**Concept**

`==` compares values (do these two things represent the same content); `is` compares identity (are these two names bound to the literal same object in memory). Two separately-constructed lists with identical contents are `==` but not `is` — no surprise there. The real trap is specifically about small integers.

**Example**

```python
a = [1, 2, 3]
b = [1, 2, 3]
print("a == b:", a == b, "a is b:", a is b)
```

Verified: `a == b: True`, `a is b: False` — exactly as expected for two independently-built lists.

```python
a = int("100")
b = int("100")
print("100 is 100 (runtime-constructed):", a is b)

a2 = int("257")
b2 = int("257")
print("257 is 257 (runtime-constructed):", a2 is b2)
```

Verified output: `100 is 100 (runtime-constructed): True`, but `257 is 257 (runtime-constructed): False`. This is a real, documented CPython implementation detail — small integers, roughly `-5` to `256`, are pre-allocated once and interned, so *every* reference to `100` anywhere in a running program is the identical object; integers outside that range are ordinary heap objects, freshly allocated each time, even when they hold the same value.

> **Pitfall, and a genuinely tricky one to verify correctly:** a naive test of this exact behavior using literal arithmetic in the same function — `a = 200 + 57; b = 200 + 57; a is b` — reports `True` even for `257`, which looks like it contradicts the interning-range rule above. It doesn't; it's a *different* mechanism (the compiler constant-folds and interns identical literal expressions within one code object at compile time, independent of the runtime integer cache). This module's example deliberately uses `int("257")` — constructed from a string at runtime, where the compiler has no constant to fold — specifically to isolate the actual small-integer-cache behavior from this unrelated compile-time optimization. Either way, `is` should never be used to compare integer *values* in real code (`==` is both correct and unambiguous); this behavior matters only for understanding *why* a buggy `is`-based integer comparison might happen to work by accident for small numbers and then mysteriously stop working for larger ones.

**Practice**

- Verify directly: does the same `int("...")`-constructed test show identical `is` behavior for `-5` and `-6` — where does the negative side of CPython's small-integer cache actually end?
- Explain why `==` is always the correct choice for comparing two numbers' values, regardless of which side of the caching boundary they fall on.

## Progress check

1. Which values are falsy in Python, and how does this list differ from Ruby's (`ruby/01-foundations.md`)?
2. Why does a non-empty tuple containing only falsy elements (like `(0,)`) still evaluate as truthy?
3. When is a function's default argument value actually evaluated — once per call, or once at definition time?
4. Why did `r1` change after `r2`'s call to `append_item`, even though `r2`'s call never referenced `r1` by name?
5. What's the standard fix for the mutable-default-argument trap?
6. Why does `int("100") is int("100")` report `True` while `int("257") is int("257")` reports `False`, and why is testing this with literal arithmetic (`200 + 57`) instead of `int("257")` misleading?

### Answers

1. `0`, `0.0`, `""`, `[]`, `{}`, `set()`, `None`, and `False` are all falsy — verified directly. Ruby's only falsy values are `nil` and `false`; Python's rule is much closer to JavaScript's, treating empty containers and zero-valued numbers as falsy too.
2. Because truthiness for a container depends on whether it's *empty*, not on the truthiness of its contents — a one-element tuple has one element, regardless of what that element's own value is, so it's non-empty and therefore truthy.
3. Once, at definition time — not once per call. This is the entire reason a mutable default argument becomes a shared, persistent object across every call that relies on the default.
4. Because `target=[]` created exactly one list object when `append_item` was defined, and every call without its own `target` argument reuses that identical object — `r1` and `r2` are two names both pointing at the same underlying list, verified directly (`r1 is r2` reports `True`).
5. Default the argument to `None`, then construct a genuinely fresh mutable object inside the function body if `None` was received: `def append_item(item, target=None): target = [] if target is None else target`.
6. CPython pre-allocates and interns small integers (roughly `-5` to `256`) once, so every reference to one of those values anywhere in a running program is the identical object; integers outside that range are freshly allocated on each construction, even when equal in value. Testing with literal arithmetic in the same function is misleading because the compiler can constant-fold `200 + 57` at compile time and intern the *result* as a shared constant within that code object — a completely different mechanism from the runtime integer cache, which only `int("257")` (built from a string, with no constant for the compiler to fold) correctly isolates.
