# Module 5 — Error Handling: Explicit Return Values

By the end of this module you'll be able to write and check Go's `(result, error)` return pattern — and, verified directly rather than taken on reputation, confirm the single most common real criticism of it: nothing stops you from ignoring the error entirely. Feeds Capstone 3.

## `(result, error)`: failure as an ordinary return value

**You'll be able to:** write a function returning both a result and an error, and check it with the idiomatic `if err != nil` pattern.

**Concept**

Go has no exceptions for ordinary error conditions — a function that might fail simply returns an additional `error` value alongside its normal result. `error` is itself an interface (`error interface { Error() string }`, Module 3's own mechanism) — `errors.New("message")` creates a simple one. The idiomatic pattern, `if err != nil { handle it }`, appears after nearly every call to a function that can fail.

**Example**

```go
func safeDivide(a, b int) (int, error) {
    if b == 0 {
        return 0, errors.New("division by zero")
    }
    return a / b, nil
}

func main() {
    result, err := safeDivide(10, 2)
    if err != nil {
        fmt.Println("Error:", err)
    } else {
        fmt.Println("Result:", result)
    }

    result2, err2 := safeDivide(10, 0)
    if err2 != nil {
        fmt.Println("Error:", err2)
    } else {
        fmt.Println("Result:", result2)
    }
}
```

```
Result: 5
Error: division by zero
```

Verified directly: `safeDivide(10, 2)` succeeds, returning `(5, nil)` — `err == nil` signals success. `safeDivide(10, 0)` returns `(0, "division by zero")` — a real, checkable error, correctly reported.

> **The direct, precise comparison to this series' other error-handling approaches:** this is structurally similar to OCaml's `int option` (`ocaml/03-capstone-expression-evaluator.md`) or Haskell's `Either String Int` (`haskell/07-capstone-safe-composition.md`) — failure represented as an ordinary value, not a separate control-flow mechanism like an exception. The real difference: neither OCaml's compiler nor Haskell's forces a caller to *do* anything with a `Maybe`/`Either` result beyond what pattern-matching naturally requires to extract the value at all — but Go's two separate return values (`result` *and* `err`) can be received and the error simply never inspected, which the next section verifies directly.

**Practice**

- Write a function `safeSqrt(x float64) (float64, error)` returning an error for negative input, and confirm both the success and failure paths report correctly.

## Verified: ignoring the error is genuinely silent

**You'll be able to:** confirm directly that discarding a Go error with `_` compiles cleanly and produces no warning at all.

**Concept**

`result, _ := someCall()` is completely valid Go — `_` is the blank identifier, explicitly discarding a value. Nothing in the language requires that a returned `error` ever be inspected.

**Example — the real, verified finding this guide's own overview opened with:**

```go
result, _ := safeDivide(10, 0)
fmt.Println("Result (error ignored):", result)
```

```
Result (error ignored): 0
```

Verified directly: this compiles with **zero warnings**, runs with **zero errors**, and prints `0` — the zero-value default for `int` — with absolutely nothing distinguishing it from a genuine, intended result of `0`. The actual division-by-zero failure that occurred is completely invisible at this point in the program; a reader looking only at this output has no way to know whether `0` is a real answer or a silently swallowed error.

> **The direct comparison this finding earns:** OCaml's `option`/Haskell's `Either` make ignoring a possible failure structurally awkward — you have to actively pattern-match `Some`/`None` or `Right`/`Left` to get a plain value out at all, and the *type* of a `Maybe Int`/`int option` is visibly different from a plain `Int`/`int`, forcing the distinction to be handled somewhere. Go's `(int, error)` return keeps the result's own type identical (`int`, not something like `Result[int]`) whether or not the call actually succeeded — the error is a genuinely separate value a caller can discard with one extra character (`_`) and no other consequence at all.

> **Pitfall:** this isn't a claim that Go's error handling is broken — explicit, ordinary-value error handling is a real, deliberate design choice with genuine benefits (no hidden control-flow jumps, errors visible directly in a function's own signature). It's a claim that the language provides no enforcement mechanism preventing a specific, common mistake, verified directly rather than asserted from Go's own reputation for this exact criticism.

**Practice**

- Rewrite `safeDivide`'s caller to check `err` correctly, and then deliberately reintroduce the `_`-discarding version — compile both and confirm neither produces a compiler warning, only a behavioral difference at runtime.

## Progress check

1. What does Go's `(result, error)` pattern represent, structurally, compared to Haskell's `Either`?
2. What does `errors.New("message")` create?
3. Verified directly: does discarding a returned error with `_` produce a compiler warning?
4. What was actually printed when `safeDivide(10, 0)`'s error was ignored, and why is that specific value potentially misleading?
5. What's the real, structural reason Go's error can be ignored more easily than OCaml's `option` or Haskell's `Either`?

### Answers

1. The same underlying idea — failure represented as an ordinary value rather than a separate exception-based control-flow mechanism — but as two separate return values (`result`, `error`) rather than one combined type like `Either String Int`.
2. A simple `error` value carrying the given message, satisfying Go's `error` interface (`Error() string`).
3. No — verified directly, it compiles cleanly with zero warnings of any kind.
4. `0`, the zero-value default for `int` — potentially misleading because nothing distinguishes it from a genuine, intended result of `0`; the actual failure that occurred is completely invisible at that point in the program.
5. Because Go's `(int, error)` keeps the result's own type identical (`int`) regardless of success or failure, and a caller can discard the separate `error` value with the single blank identifier `_`; OCaml's `option`/Haskell's `Either` make the success/failure distinction part of the value's own type, requiring active pattern-matching to extract a plain value at all.
