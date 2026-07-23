# Final Assessment

Across all ten modules and three capstones. Work through these before compiling anything — precision in your own reasoning is the actual test.

1. What does `ocamlc -i` show, and why does it matter for verifying claims about type inference?
2. Why does `3 + 4.0` fail to compile, when it would work in most other languages this series has covered?
3. What did this guide's own direct test show about evaluation order for `side_effect "a" 1 + side_effect "b" 2`, and what does that prove was and wasn't guaranteed?
4. What does the compiler's exhaustiveness warning name specifically, when a `match` is missing a case?
5. Why does `eval` in Capstone 1 need `let rec`, not plain `let`?
6. In Capstone 1, what's the real, load-bearing difference between using `option` and using an exception for a function that might fail?
7. What did the verified compile failure on `List.length s` prove about OCaml's module abstraction, beyond what Racket's non-`#:transparent` structs guarantee?
8. What does a functor take as input and produce as output, and how is that different from every polymorphism mechanism earlier in this series?
9. In Capstone 2, what fundamental correctness property did `IntBST.to_list` verify, and why did it matter that the insertion order was deliberately shuffled?
10. What's the difference between a `ref` cell and a `mutable` record field, as two distinct mutation mechanisms?
11. Verified directly: does `10.0 /. 0.0` raise `Division_by_zero`? What does it produce instead?
12. In Capstone 3, why does the transaction log print in reverse chronological order, and is that a bug?
13. Why did a failed `withdraw` in Capstone 3 leave both the account balance and the transaction log completely untouched?
14. What genuinely new OCaml 5 feature did this guide attempt to verify but report as unverified, and why was it reported that way rather than simply omitted?
15. What's the honest, stated contrast this guide sets up for the next guide in this series (Haskell)?

## Answers

1. It compiles just far enough to print the compiler's own inferred type signatures, with no binary produced — proof that type inference genuinely happened from usage alone, checkable directly rather than trusted from documentation.
2. Because `+` is specifically an `int` operator with no implicit conversion to or from `float` — `4.0` is a `float` literal, so mixing it with `+` is a compile-time type mismatch, not a runtime coercion.
3. That `side_effect "b"` printed before `side_effect "a"`, even though `"a"` appears first in the source — proving both were genuinely evaluated (confirming strictness) but not in left-to-right order, which OCaml's strict-evaluation guarantee does not promise.
4. The exact missing case (e.g., `Triangle (_, _, _)`), not merely that the match is incomplete.
5. Because `eval` calls itself recursively inside its own body — `rec` explicitly brings the function's own name into scope for its body; without it, the definition wouldn't compile.
6. `option` makes the possibility of failure part of a function's own type signature, forcing every caller to handle both cases explicitly at compile time; an exception's possibility is invisible in the type signature, so a caller can forget to catch it and the program crashes at runtime instead of failing to compile.
7. That even an unrelated, would-otherwise-work built-in function (`List.length`) is rejected outright at compile time against an abstractly-typed module value — a stronger guarantee than hiding field values from casual inspection, since it hides the entire representation choice itself.
8. A functor takes a module (matching a specified signature) as its argument and produces a new module as its result, resolved entirely at compile time — every earlier polymorphism mechanism in this series (Racket's `class*`, Clojure's protocols/multimethods) instead dispatched on runtime values.
9. That `to_list`'s in-order traversal produces genuinely sorted output — the fundamental correctness property of a binary search tree. The shuffled insertion order mattered because it proved the tree's *search-tree* correctness, not merely that data happened to come back in the same order it went in.
10. `ref` creates a standalone mutable cell holding one value on its own; a `mutable` record field is a mutation capability attached to one specific field of a larger structure — used when the thing that changes naturally belongs to a bigger record rather than standing alone.
11. No — verified directly, it produces `inf` (IEEE 754 infinity) with no exception raised; the program continues running normally, unlike integer division by zero.
12. Because `log` always prepends new entries (`msg :: !transaction_log`) rather than appending — the natural, efficient way to grow a list in OCaml. It's not a bug; a caller wanting chronological order needs to reverse the log explicitly at display time.
13. Because `withdraw`'s `if amount > acc.balance` check happens *before* any mutation or logging — raising the exception at that point means neither `acc.balance <- ...` nor `log (...)` is ever reached for a failed withdrawal.
14. OCaml 5's effect handlers — reported as unverified because a direct attempt at a minimal working example produced a syntax error, and this guide's own standard (verify before claiming) couldn't be met for this specific topic without more time than its capstone-impact justified; it was reported honestly rather than either claimed as working or silently omitted.
15. That OCaml is strict and deliberately not purely functional (real mutation via `ref`/`mutable`, exceptions as an accepted control-flow mechanism), setting up a direct, honest comparison against Haskell's opposite design choices — laziness and enforced purity — rather than presenting either language's approach as simply "correct."
