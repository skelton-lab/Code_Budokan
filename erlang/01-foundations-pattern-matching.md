# Module 1 — Foundations: Single-Assignment Variables & Pattern Matching

By the end of this module you'll be able to explain precisely what `=` does in Erlang — and verify directly that it's the same underlying idea as Prolog's unification, not a coincidental syntactic echo. Feeds Capstone 1.

## `=` is pattern matching, not assignment

**You'll be able to:** bind a variable with `=`, and verify directly what happens when you try to "reassign" it.

**Concept**

Every language this series has covered *except* Prolog treats `=` (or `let`, or `:=`) as assignment — a name now refers to a new value, discarding whatever it held before. Erlang's `=` is **pattern matching**: `Name = Value` succeeds if `Name` is unbound (binding it to `Value`) or if `Name` is already bound to something that matches `Value`. If `Name` is already bound to something *different*, the match fails — a real, raised error, not a silent overwrite.

**Example**

```erlang
try_rebind(X) ->
    try
        X = 10,
        rebind_succeeded
    catch
        error:{badmatch, _} -> rebind_failed
    end.

main() ->
    X = 5,
    io:format("X = ~p~n", [X]),
    Result = try_rebind(X),
    io:format("Rebinding result: ~p~n", [Result]),
    X = 5,
    io:format("Matching X to 5 again works~n").
```

```
X = 5
Rebinding result: rebind_failed
Matching X to 5 again works
```

Verified directly: `X = 5` binds `X`. Attempting `X = 10` inside `try_rebind` — where `X` is already bound to `5` — fails with a real `{badmatch, _}` error, caught and reported as `rebind_failed`. But `X = 5` again, matching the *same* value `X` already holds, succeeds cleanly — because that's a genuine match, not a conflicting rebind.

> **The direct, verified connection to `prolog/`:** this is *exactly* Prolog's own unification semantics (`prolog/01-foundations.md`) — a Prolog variable, once bound, only ever "matches" against that same value again; attempting to bind it to something different fails the same way. Erlang's `=` isn't merely reminiscent of this — it's the identical underlying idea, carried over directly from the language Erlang's own first implementation was written in.

> **Pitfall:** a variable is scoped to the function clause it's bound in — `X = 5` inside one function has no relationship to an `X` inside a different function; there's no global rebinding hazard the way a mutable variable in most other languages could create. The "can't rebind" rule applies only within one binding's own scope.

**Practice**

- Predict, then verify, what happens if you write `Y = 5` followed immediately by `Y = 5` again in the same function — does the second line succeed or fail, and why?
- Write a function that takes two arguments and uses `=` to assert they're equal, returning `true` if they match and using `try`/`catch` to return `false` if they don't.

## Progress check

1. What does Erlang's `=` actually do — assignment, or something else?
2. What happens when you attempt to bind an already-bound variable to a *different* value?
3. What happens when you "rebind" an already-bound variable to the *same* value it already holds?
4. What direct, verified connection does this module draw to `prolog/`?
5. Is a variable's binding scoped globally, or to the function clause it's bound within?

### Answers

1. Pattern matching — it succeeds by binding an unbound variable, or by confirming an already-bound variable matches the given value; it's not assignment in the sense of unconditionally overwriting a previous value.
2. It fails with a real `{badmatch, _}` error, raised and catchable, not a silent overwrite.
3. It succeeds — matching a variable against the value it already holds is a genuine, successful match, not an error.
4. That Erlang's `=` is the identical underlying idea as Prolog's own unification, not merely a similar-looking syntax — a direct carryover from the language Erlang's first implementation was written in.
5. To the function clause it's bound within — there's no global rebinding hazard the way a mutable variable in most other languages creates.
