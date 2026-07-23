# Module 4 — Blocks

Smalltalk's closures — `[ :x | ... ]` — the mechanism Module 3's conditionals and loops are actually built from, and the direct ancestor of Ruby's own blocks (which took both their name and much of their syntax shape from here). Verified.

## Blocks as closures

**You'll be able to:** write a block, call it with `value:`, and confirm it closes over its creating scope exactly like Ruby's blocks/procs/lambdas.

**Concept**

`[ :x | expression ]` is a block — a piece of code, with parameters, that's itself an object (an instance of class `BlockClosure`) you can store, pass around, and invoke later with `value` (no arguments), `value:` (one argument), `value:value:` (two), and so on. Like Ruby's blocks, a Smalltalk block closes over the variables from its creating scope.

**Example**

```smalltalk
| square |
square := [ :x | x * x ].
Transcript showCr: (square value: 5) printString.

| makeAdder add5 |
makeAdder := [ :n | [ :x | x + n ] ].
add5 := makeAdder value: 5.
Transcript showCr: (add5 value: 10) printString.
Transcript showCr: (add5 value: 20) printString.
```

Verified: `square value: 5` correctly returns `25`. `makeAdder value: 5` returns a *new block* that closes over `n = 5`; calling that returned block (`add5`) with `10` and `20` correctly returns `15` and `25` — confirming the inner block genuinely captured `n` from `makeAdder`'s scope, exactly like a Ruby closure (or a JavaScript closure, or a C++ lambda) would.

> **This is precisely Ruby's `Proc`/lambda mechanism, one language earlier.** Ruby's own blocks/procs/lambdas (that guide's Module 2) are a direct syntactic and conceptual descendant of Smalltalk's blocks — the `[ ... ]` bracket syntax itself, not just the underlying closure idea, carried across close to directly.

**Practice**

- Confirm `square value: 5` yourself, then write a `cube` block and confirm it independently.
- Build a second, independent adder (`add10`) from the same `makeAdder` block and confirm it doesn't interfere with `add5`'s captured `n`.

## Blocks driving collection iteration

**You'll be able to:** use `collect:`, `select:`, and `inject:into:` — Smalltalk's names for what you already know as `map`/`filter`/`reduce`.

**Concept**

Every collection responds to `collect:` (transform each element — Ruby/JavaScript's `map`), `select:` (keep elements where the block is true — Ruby's `select`, JavaScript's `filter`), and `inject:into:` (combine every element into one value — Ruby/JavaScript's `reduce`). Same idea, same underlying "pass a block to a collection method" shape you've now seen in three languages.

**Example**

```smalltalk
| nums doubled evens total |
nums := #(1 2 3 4 5).
doubled := nums collect: [ :n | n * 2 ].
evens := nums select: [ :n | n even ].
total := nums inject: 0 into: [ :acc :n | acc + n ].

Transcript showCr: doubled printString.
Transcript showCr: evens printString.
Transcript showCr: total printString.
```

Verified: `doubled` correctly prints `(2 4 6 8 10 )`, `evens` correctly prints `(2 4 )`, `total` correctly computes `15` — the same dataset, same results, as this series' Ruby and JavaScript guides' equivalent examples, just under Smalltalk's own method names.

**Practice**

- Chain `select:` and `collect:` together (`nums select: [...] thenCollect: [...]`, or nested calls) and compare directly against the JavaScript guide's `.filter(...).map(...)` chain on the identical data.
- Write `inject:into:` to find the maximum value in a collection, without using a dedicated `max` method.

## Progress check

1. What class does a Smalltalk block belong to, and how do you invoke one with an argument?
2. In the `makeAdder`/`add5` example, what specifically does `add5` capture from `makeAdder`'s scope?
3. What are Smalltalk's names for `map`, `filter`, and `reduce`?
4. What direct syntactic evidence connects Smalltalk's blocks to Ruby's own blocks/procs/lambdas?

### Answers

1. `BlockClosure`. Invoke it with `value:` (one argument), or `value` for no arguments, `value:value:` for two, and so on.
2. The parameter `n`, bound to `5` at the moment `makeAdder value: 5` ran — `add5` is a distinct block object that retains its own captured `n`, independent of any other block created from the same `makeAdder`.
3. `collect:` (map), `select:` (filter), `inject:into:` (reduce).
4. The `[ ... ]` bracket syntax itself — Ruby's block literal syntax is a direct descendant of Smalltalk's, not just conceptually similar by coincidence.
