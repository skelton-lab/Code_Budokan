# Final Assessment

Across all ten modules and four capstones. Work through these before compiling anything — precision in your own reasoning is the actual test.

1. What did the `take 2 xs` / `xs !! 3` / `xs !! 2` sequence in Module 1 prove about laziness that "computation happens later" alone would not?
2. Why does `let ones = 1 : ones` not cause an infinite loop when merely defined?
3. What's the real difference between how Clojure's laziness and Haskell's laziness are each achieved?
4. In Capstone 1, what did testing `take 0 fibPrimes` prove, and how does that result compare to Clojure's own equivalent capstone?
5. What determines which `Shape` instance's method gets used for a given call in Haskell's type classes — explicit code, or something inferred?
6. What's the precise distinction between Haskell's type classes and OCaml's functors, both being resolved at compile time?
7. Why did `[Circle 5.0, Rectangle 4.0 6.0]` fail to type-check in Capstone 2, and what did `AnyShape` solve?
8. What does do-notation's `x <- action` do automatically, for a `Maybe`- or `Either`-returning action, that OCaml's evaluator had to do by hand?
9. What real advantage does `Either String a` have over `Maybe a`, and is the short-circuiting mechanism itself different between them?
10. What did the `addOne`/`seq`/`putStrLn "sneaky!"` demonstration prove, more precisely than "pure functions can't do IO"?
11. Why did `addOne :: Int -> Int` compile at all, given it embeds an `IO` action?
12. What determines whether a constructed `IO` value actually executes?
13. In Capstone 4, why is `average` described as "genuinely testable in isolation," and what guarantee does that rest on?
14. What real, honest gap did Capstone 4 acknowledge about `read nStr :: Int`?
15. What's the overall, stated relationship between this guide and the OCaml guide preceding it in this series?

## Answers

1. That the value at index 2 wasn't merely deferred and quietly computed in the background — it was never evaluated at all, proven by the program completing successfully; only directly forcing that specific index (`xs !! 2`) actually triggered the crash, confirming the earlier successful runs genuinely never touched it.
2. Because `:` (cons) doesn't force its second argument — `ones`'s self-reference only needs to unfold as far as something actually demands, and `take` only ever demands a finite prefix.
3. Clojure's laziness is an explicit, opt-in library mechanism (`lazy-seq`) layered onto an otherwise-eager language; Haskell's laziness is the default evaluation strategy for every expression, with no special syntax required anywhere.
4. That zero Fibonacci numbers were tested for primality — genuinely no computation happened, not computed-and-discarded — the identical observable result Clojure's own `(take 0 (traced-fib-primes))` produced, reached through Haskell's default-everywhere laziness rather than Clojure's explicit opt-in.
5. Something inferred — the type checker determines the correct instance purely from the value's type, with no explicit dispatch code written at the call site.
6. Both are resolved at compile time, but functors require an explicit, named application written by the programmer (`MakeSorter (IntOrd)`), producing a separately-named module; type classes are resolved implicitly by the type checker, with no explicit application written anywhere in the calling code.
7. Because a Haskell list's elements must all share one concrete type, and `Circle`/`Rectangle` are different types — `AnyShape`, an existential wrapper (requiring the `ExistentialQuantification` language extension), lets a list hold values of any type satisfying `Shape`, producing a genuinely uniform `[AnyShape]` list underneath which different concrete shapes are hidden.
8. It automatically unwraps the value if the action succeeded, or short-circuits the entire `do` block to `Nothing`/`Left` immediately if it failed — OCaml's evaluator had to write this check out explicitly, by hand, at every single combining step.
9. `Either`'s `Left` case carries a real, descriptive error message rather than `Maybe`'s bare, information-free `Nothing`; the short-circuiting mechanism itself (automatic propagation through do-notation) is otherwise identical between the two.
10. That an `IO` action can be fully constructed, and even forced to weak head normal form via `seq`, inside code with a purity-claiming type signature, without ever actually executing — a sharper, more precise mechanism than the common summary suggests, since the type system permits construction, it just never runs anything not connected to `main`.
11. Because `seq`'s type is fully polymorphic (`a -> b -> b`), and `putStrLn "sneaky!"`'s type, `IO ()`, unifies fine as that first argument — nothing about `seq`'s own type requires actually running it.
12. Whether it's part of the chain of actions reachable from `main`, the single `IO` action the Haskell runtime actually executes when the program runs.
13. Because it has no `IO` anywhere in its type signature at all — it can be called directly with plain lists of `Int` and checked for correctness with total confidence that it never performed a hidden side effect, a guarantee resting entirely on Haskell's type-enforced separation between pure and `IO` code.
14. That `read nStr :: Int` is an unguarded partial function — typing a non-numeric value at that prompt crashes the program with a runtime pattern-match failure, not a graceful `Either`-style error; the capstone's domain validation (score ranges) is safe, but the input-format boundary itself is not.
15. That this guide is the direct, honest counterpoint to `ocaml/` — strict vs. lazy, real mutation vs. enforced purity, exceptions vs. typed failure — written to be read against that guide's own deliberate choices, not as a claim that either language's approach is simply correct.
