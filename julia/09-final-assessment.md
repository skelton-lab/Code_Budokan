# Final Assessment

Across all seven modules and three capstones. Work through these before running anything — precision in your own reasoning is the actual test.

1. What's the difference between a function and a method in Julia's own terminology?
2. What did the `Shape`/`Circle`/`Rectangle` example demonstrate that Haskell's equivalent capstone needed extra machinery (an existential wrapper and a language extension) to achieve?
3. In `combine(a::Int, b::Int)`, `combine(a::String, b::String)`, `combine(a::Int, b::String)`, why couldn't the third method be distinguished by dispatching on only the first argument?
4. What's the real, structural difference between Julia's dispatch and Clojure's multimethods, beyond syntax — specifically regarding built-in operators like `+`?
5. In Capstone 1's collision system, why did nearly every ordered pair of types need its own method (or an explicit delegation)?
6. What does it mean, precisely, for a Julia function to be type-stable?
7. What did `Base.return_types` reveal about `unstable_fn`, and why is that a stronger claim than "it's probably slower"?
8. Why did Capstone 2's `balance / 1` — mathematically a no-op — destabilize an entire function's type inference?
9. Why does a fair Julia benchmark need a warm-up call before timing with `@elapsed`?
10. What was the measured performance gap in Module 4's example, and in Capstone 2's — and why does this guide treat the difference in magnitude as itself a real finding, not an inconsistency to hide?
11. Why is `.` required for `v .+ 10` in Julia, when neither APL nor NumPy require an equivalent marker for their own elementwise addition?
12. What does `f.(v)` do, and does `f` itself need special syntax to support being broadcast?
13. What's the real difference between `sum(m, dims=1)` and `sum(m, dims=2)`?
14. What real assumption does this guide warn a NumPy-trained reader against, regarding Julia's array storage order?
15. What direct, independently-verified fact ties Capstone 3 to `apl/03-capstone-statistics-engine.md`?

## Answers

1. A function (like `area` or `combine`) is the shared name callers use; a method is one specific, type-annotated implementation that function might dispatch to — a function can have many methods.
2. A heterogeneous array holding two genuinely different concrete types, with correct polymorphic dispatch on each, with no wrapper type or language extension needed at all.
3. Because the first argument's type (`Int`) was identical across two different methods (`(Int, Int)` and `(Int, String)`) — only the second argument's type distinguished which should run, requiring dispatch on both arguments together.
4. Julia's own built-in `+` has many methods in Base Julia itself, and a user can add a genuinely new method to that same `+` for their own type; Clojure's ordinary function calls (including `+`) are entirely unrelated to the separate, explicitly-opted-into `defmulti`/`defmethod` machinery.
5. Because behavior genuinely depended on both objects' types together, and neither object was more naturally "the receiver" than the other — a case single dispatch can't express directly without an artificial workaround.
6. That every variable's type is determined and fixed from the start of the function, provable by the compiler ahead of time, with no runtime uncertainty about which concrete type a variable holds.
7. That the compiler itself could not guarantee a single concrete return type (`Union{Float64, Int64}`) — a directly checkable fact, not an inference from reading the code or a guess about likely behavior.
8. Because `/` in Julia always returns a `Float64`, regardless of its operands' types — even dividing by `1`, which changes nothing about the numeric value, still changes the *type* of the result, and that type change propagates through the rest of the function's type inference.
9. Because Julia compiles a function the first time it's called with a given set of argument types — timing an uncompiled first call would measure compilation time mixed into the result, not a fair measurement of actual execution performance.
10. Roughly 6700× in Module 4's example, roughly 11× in Capstone 2's — treated as a real finding because the actual magnitude of the type-instability tax depends on real factors (how often a destabilizing branch fires, what surrounds it, the computation's scale), not a single universal multiplier; both numbers are real and both prove the same underlying point.
11. Because Julia made broadcasting a deliberate, opt-in, syntactically-visible choice at every call site, distinct from both APL's "every operator is elementwise by default" and NumPy's "arithmetic operators are elementwise without a special marker."
12. It applies `f` elementwise across every element of `v`; `f` itself needs no special syntax at all — it's an ordinary scalar function, and the `.` is what turns the call into a broadcast.
13. `dims=1` collapses each column to a single value; `dims=2` collapses each row to a single value — the axis-control concept, expressed as a keyword argument.
14. That Julia's arrays are column-major (like Fortran), not row-major (like C/NumPy) — a reader assuming row-major filling by default would predict the wrong layout for something like `reshape(1:6, 2, 3)`.
15. That Julia's Capstone 3, run against the identical ten-value dataset, produced exactly the same mean (`46.8`), variance (`587.16`), and standard deviation (`≈24.231`) as APL's own independently-computed result — the same numbers, verified twice, in two languages 50 years apart.
