# Module 2 — Multi-Clause Functions & Guards

By the end of this module you'll be able to write functions as a series of pattern-matched clauses — including tuple and `[H|T]` list matching — the same structural idea as a Prolog predicate defined by multiple clauses. Feeds Capstone 1.

## Multiple function clauses, resolved by pattern matching

**You'll be able to:** define a function as several clauses, each matching a different argument shape, with a numeric guard on one of them.

**Concept**

`name(Pattern1) -> Body1; name(Pattern2) when Guard -> Body2.` — a function can have multiple clauses, separated by `;`, each with its own argument pattern (and optionally a `when` guard). Calling the function tries each clause's pattern in order, running the first one that matches.

**Example**

```erlang
factorial(0) -> 1;
factorial(N) when N > 0 -> N * factorial(N - 1).

main() ->
    io:format("5! = ~p~n", [factorial(5)]).
```

```
5! = 120
```

Verified directly: `factorial(5)` correctly computes `120` — the first clause (`factorial(0)`) provides the base case; the second (`factorial(N) when N > 0`) provides the recursive case, guarded to only match positive numbers.

> **The direct, verified connection to `prolog/`:** this is structurally identical to a Prolog predicate defined by multiple clauses (`prolog/02-recursion-backtracking-lists.md`) — a base-case clause and a recursive-case clause, tried in order, exactly the same base-case/recursive-case shape, just written as function clauses instead of predicate clauses.

**Practice**

- Write a three-clause `fibonacci` function (base cases for `0` and `1`, a recursive case for everything else), and confirm `fibonacci(10)` gives `55`.

## Tuple and `[H|T]` list pattern matching

**You'll be able to:** write function clauses matching different tuple shapes, and destructure a list with `[H|T]` notation.

**Concept**

A tuple like `{circle, 5.0}` can be matched directly in a function's argument pattern — `describe({circle, R})` binds `R` to `5.0` when called with that exact tuple shape. `[H|T]` — borrowed directly from Prolog's own list notation — matches a non-empty list, binding `H` to its first element and `T` to the rest.

**Example**

```erlang
describe({circle, R}) -> {area, 3.14159 * R * R};
describe({rectangle, W, H}) -> {area, W * H};
describe({triangle, A, B, C}) ->
    S = (A + B + C) / 2,
    {area, math:sqrt(S * (S - A) * (S - B) * (S - C))}.

classify([]) -> empty;
classify([_]) -> single;
classify([_, _ | _]) -> many.
```

```
{area,78.53975}
{area,24.0}
{area,6.0}
empty single many
```

Verified directly: `describe` correctly dispatches on each tuple's shape and size — a `{circle, R}` two-tuple, a `{rectangle, W, H}` three-tuple, a `{triangle, A, B, C}` four-tuple — computing the correct area for each (a circle of radius `5.0`: `π·25 ≈ 78.53975`; a `4×6` rectangle: `24.0`; a 3-4-5 triangle via Heron's formula: `6.0`). `classify` correctly distinguishes an empty list, a single-element list, and a list with two or more elements, using `[]`, `[_]`, and `[_, _ | _]` as three genuinely different list-shape patterns.

> **The direct, verified connection to `prolog/`:** `[H|T]` is not merely similar to Prolog's list notation — it's the *same* notation, borrowed directly (`prolog/02-recursion-backtracking-lists.md`'s own `[Head|Tail]` pattern). `classify`'s three clauses are the same technique this series has now seen twice: dispatch by matching a data structure's shape directly in a function/predicate's own head, rather than testing it with `if`/`case` inside a single, undifferentiated body.

> **Pitfall, verified directly:** clause order matters — Erlang tries clauses top to bottom, using the *first* one whose pattern matches, and a genuinely general pattern placed before a more specific one silently shadows it. `classify`'s three patterns (`[]`, `[_]`, `[_, _ | _]`) happen to be mutually exclusive by construction, so reordering them changes nothing — but a bare variable pattern is a real hazard:
> ```erlang
> describe_num(N) -> {other, N};
> describe_num(0) -> zero.
> ```
> The compiler itself catches this: `Warning: this clause for describe_num/1 cannot match because a previous clause at line 4 always matches`. Running it confirms the warning is correct — `describe_num(0)` returns `{other, 0}`, never reaching the `zero` clause beneath it, because `N` (an unbound variable pattern) matches absolutely anything, including `0`. This is the identical ordering discipline `haskell/04-type-classes.md`'s exhaustiveness checking and COBOL's `WHEN OTHER` both required, expressed here as "write the most specific pattern first" — but only genuinely *overlapping* patterns create this hazard, not merely differently-shaped ones.

**Practice**

- Write a function `sum_list([])`/`sum_list([H|T])` that recursively sums a list of numbers using `[H|T]` matching, with no built-in `lists:sum/1` allowed.
- Reorder `describe_num`'s two clauses so `describe_num(0) -> zero` comes first, recompile, and confirm the compiler warning disappears and `describe_num(0)` now correctly returns `zero`.

## Progress check

1. How does Erlang decide which clause of a multi-clause function to run for a given call?
2. What does `factorial`'s two-clause structure directly mirror from `prolog/`?
3. What does `[H|T]` match, and what gets bound to `H` and `T`?
4. Why does clause order matter for `classify`'s three list-shape patterns?
5. What real, verified mistake did placing `describe_num(N) -> {other, N}` before `describe_num(0) -> zero` cause, and how did the compiler itself catch it?

### Answers

1. It tries each clause's pattern, in the order written, top to bottom, running the body of the first one whose pattern (and guard, if present) matches the actual argument(s).
2. The base-case/recursive-case shape of a Prolog predicate defined by multiple clauses — the same structural idea, expressed as function clauses instead of predicate clauses.
3. It matches a non-empty list, binding `H` to its first element and `T` to every remaining element as a (possibly empty) list — the same notation Prolog uses for the identical purpose.
4. Because Erlang always uses the *first* matching clause — a more general pattern placed before a more specific one would incorrectly intercept calls that should have reached the specific clause.
5. Calling `describe_num(0)` returned `{other, 0}` instead of `zero`, because the unbound variable pattern `N` in the first clause matches absolutely anything, including `0`, permanently shadowing the second clause. The compiler caught it directly at compile time with a real warning: `this clause for describe_num/1 cannot match because a previous clause at line 4 always matches` — verified by actually running it, confirming the warning was correct, not just a theoretical possibility.
