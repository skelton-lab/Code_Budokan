# Module 2 — Contracts

By the end of this module you'll be able to attach a runtime contract to a module's exports, and read a contract violation's **blame** message to tell whether the caller or the library itself is at fault. Feeds Capstone 1.

## `contract-out`: attaching contracts to a module's exports

**You'll be able to:** replace a plain `provide` with `contract-out`, describing each export's expected argument and return types.

**Concept**

`(provide (contract-out [name contract] ...))` wraps a module's export in a runtime-enforced contract — `->` describes a function's argument and return contracts, and combinators like `and/c`, `or/c`, `>=/c`, `listof` build up more specific ones. Unlike a static type system, these checks happen at the actual call boundary, at runtime, on real values — closer in spirit to this series' `pytest`/`plunit` verification-discipline thread than to compile-time typing.

**Example**

```racket
(require racket/contract)
(provide (contract-out [safe-div (-> number? (and/c number? (not/c zero?)) number?)]))
(define (safe-div a b) (/ a b))
```

```
$ racket good.rkt   ; (safe-div 10 2)
5
```

Verified directly: a well-formed call passes straight through with no overhead visible to the caller.

> **Pitfall:** contracts only check values that actually cross the module boundary — calling `safe-div` from *inside* the same module it's defined in, without going through `provide`'s contracted interface, skips the check entirely. Contracts protect a module's public interface, not its internal implementation.

**Practice**

- Write a contract for a function taking a non-empty list of numbers and returning their average, using `(and/c list? (not/c empty?))` as the argument contract.

## Blame: knowing *who* violated the contract

**You'll be able to:** read a contract violation's `blaming:` line to determine whether the fault lies with the calling code or the library's own implementation.

**Concept**

A genuinely distinctive feature of Racket's contract system: when a contract is violated, the error message names *which side* of the module boundary is responsible — the caller, for passing a bad argument, or the library itself, for returning something that breaks its own promised contract. This is a real, structural guarantee, not just a more detailed error message.

**Example — caller at fault:**

```racket
(provide (contract-out [safe-sqrt (-> (and/c real? (>=/c 0)) real?)]))
(define (safe-sqrt x) (sqrt x))
```

```
$ racket main.rkt   ; (safe-sqrt -4), called from main.rkt
safe-sqrt: contract violation
  expected: (>=/c 0)
  given: -4
  ...
  blaming: /path/to/main.rkt
   (assuming the contract is correct)
```

**Example — the library itself at fault:**

```racket
(provide (contract-out [broken-square (-> integer? integer?)]))
(define (broken-square x) "oops, not a number")
```

```
$ racket main.rkt   ; (broken-square 5)
broken-square: broke its own contract
  promised: integer?
  produced: "oops, not a number"
  ...
  blaming: /path/to/lib.rkt
   (assuming the contract is correct)
```

Verified directly, both cases: passing `-4` to `safe-sqrt` (violating the *argument* contract) blames `main.rkt` — the caller supplied a bad value. `broken-square` returning a string instead of the promised `integer?` (violating the *return* contract) blames `lib.rkt` — its own implementation, not whoever called it, because the caller did nothing wrong; the function simply failed to honor its own promise. Neither of this series' previous languages' error-handling mechanisms (C's manual checks, COBOL's `ON SIZE ERROR`, Prolog's `plunit`) distinguishes caller-fault from callee-fault this precisely, automatically, as a structural property of the contract system itself.

> **Pitfall:** blame is about *contractual* fault, not runtime crash location — `sqrt` applied to `-4` inside `safe-sqrt`'s body would, without the contract, produce a complex number rather than crashing at all (Racket's `sqrt` handles negative reals by returning a complex result). The contract catches the problem *before* that happens, at the boundary, precisely because a real caller mistake was made — not because the function would otherwise have visibly failed.

**Practice**

- Write a function with a contract where a range violation (`integer-in` or `>=/c`) can be triggered from the caller's side, and confirm the blame message names the calling file.
- Write a function whose contract promises `string?` but that actually returns a number under some condition, and confirm the blame message names the function's own defining file.

## Progress check

1. What's the difference between what a contract checks and what a static type system checks?
2. Does a contract check every call to a function, or only calls that cross a module's `provide` boundary?
3. In `(safe-sqrt -4)`, why does the blame message name the calling file, not the library?
4. In `broken-square`'s example, why does the blame message name the library file, not the caller?
5. Why didn't `safe-sqrt`'s contract violation ever let `sqrt` actually run on `-4` and produce a complex number?

### Answers

1. A contract checks real values at the actual point they cross a module boundary, at runtime; a static type system checks (typically) all possible values a piece of code could produce, at compile time, without running it.
2. Only calls crossing the `provide` boundary — internal calls within the same module, not going through the contracted export, aren't checked.
3. Because the caller supplied `-4`, which violates the *argument* contract (`(>=/c 0)`) — the fault is in what was passed in, which is the calling code's responsibility.
4. Because the function's own body returned a string, violating the *return* contract (`integer?`) it promised — the caller passed a perfectly valid argument (`5`); the fault is entirely in what the function itself produced.
5. Because the contract check on the argument happens *before* the function's body runs — a value violating the argument contract never reaches `sqrt` at all; the contract intercepts it at the boundary.
