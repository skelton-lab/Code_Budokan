# Module 2 — Comparing Dispatch Mechanisms

By the end of this module you'll be able to state precisely how Julia's multiple dispatch differs from Clojure's multimethods — the closest prior mechanism this series has covered — despite solving the identical underlying problem. Feeds Capstone 1.

## A default catch-all method

**You'll be able to:** write a method with no type annotations, and confirm it acts as a fallback when no more specific method matches.

**Concept**

An untyped parameter matches *any* type — a method like `combine(a, b) = ...` (no `::Type` annotations) is equivalent to explicitly typing both as `::Any`, and Julia always prefers a more specific method over a less specific one when both could match.

**Example**

```julia
combine(a::Int, b::Int) = a + b
combine(a, b) = "no combo for $a and $b"

println(combine(3, 4))
println(combine(3.0, "x"))
```

```
7
no combo for 3.0 and x
```

Verified directly: `combine(3, 4)` — both `Int` — correctly matches the specific `(Int, Int)` method. `combine(3.0, "x")` — a `Float64` and a `String`, matching neither existing specific method — correctly falls through to the untyped catch-all.

> **The direct, precise comparison to Clojure's `:default`:** `clojure/04-multimethods.md`'s `combine` example used an explicit `(defmethod combine :default [a b] ...)` — a *named*, separately-declared fallback case, requiring `defmulti`'s own dispatch function to explicitly produce the `:default` keyword when nothing else matches. Julia's untyped-parameter fallback achieves the identical behavior implicitly, as a natural consequence of "less specific types match more broadly" — no special `:default` keyword, no separate dispatch-function logic to write.

**Practice**

- Add a third specific method (`(String, String)`) to `combine`, and confirm the untyped fallback still correctly catches every remaining combination.

## The real, precise distinction: built-in default vs. opt-in alternative

**You'll be able to:** state exactly what's structurally different between Julia's dispatch and Clojure's multimethods, beyond surface syntax.

**Concept**

Both mechanisms dispatch on runtime values, and both can consider more than one argument. The real, structural difference: in Clojure, **every function has one, fixed dispatch mechanism** — ordinary function calls have no dispatch at all (just direct calls), and multimethod-based dispatch is an entirely separate, explicitly-opted-into construct (`defmulti`/`defmethod`), used specifically when a problem calls for it, alongside protocols as yet a third option for the more common single-dispatch case. In Julia, **there is no separate mechanism to opt into at all** — every function, from `+` to a user's own `combine`, works by having one or more methods, and calling it always dispatches on the argument types present, whether that function has one method or twenty.

> **This is the actual reason Julia's dispatch feels different in practice, not just in syntax:** Clojure's own built-in arithmetic (`+`, `-`) doesn't go through `defmulti`-style dispatch at all — it's ordinary Clojure code, unrelated to the protocol/multimethod machinery `clojure/03-records-protocols.md`/`04-multimethods.md` covered. Julia's own built-in arithmetic **does** go through the same multiple-dispatch mechanism a user's own `combine` uses — `+`, in Julia, has hundreds of methods in Base Julia itself (`Int + Int`, `Float64 + Float64`, `Int + Float64`, and many more), and a user adding a *new* method to `+` for their own custom type genuinely extends the same function everyone already uses, not a separate namespaced version of it.

> **Pitfall:** this pervasiveness is a real, double-edged design point — it means dispatch decisions happen constantly, for essentially every operation in a Julia program, which is exactly why Module 4's type-stability finding matters so much: if the compiler can determine argument types in advance, dispatch resolves once, at compile time, with zero runtime cost; if it can't, every single call pays a real, measurable dispatch cost at runtime, repeatedly.

**Practice**

- Write out, in your own words, what would need to change about Clojure's own `+` to make it participate in `defmulti`-style dispatch the way Julia's `+` already does by default — and why Clojure's designers likely chose not to do this.

## Progress check

1. What does an untyped parameter in a Julia method definition match, and what Clojure construct does this module compare it to?
2. What's the real, structural difference between Julia's dispatch and Clojure's multimethods, beyond syntax?
3. Does Julia's own built-in `+` operator go through the same dispatch mechanism a user's custom function does?
4. Why does this pervasiveness make Module 4's upcoming type-stability finding especially relevant to Julia specifically?
5. In Clojure, is ordinary function calling (like calling `+`) related to the `defmulti`/`defmethod` machinery at all?

### Answers

1. Any type at all — equivalent to explicitly typing the parameter as `::Any`; this module compares it directly to Clojure's explicit `(defmethod name :default [args] ...)` fallback case.
2. In Clojure, multimethod dispatch is a separate, explicitly-opted-into mechanism used alongside ordinary (non-dispatching) function calls; in Julia, there is no separate mechanism at all — every function, including built-ins, works by having one or more methods, and every call dispatches on argument types by default.
3. Yes — Julia's own `+` has many methods in Base Julia itself, and a user can add a genuinely new method to the same `+` for their own custom type, extending the function everyone already uses.
4. Because dispatch happens for essentially every operation in a Julia program by default — if the compiler can determine argument types in advance, dispatch resolves at compile time with no runtime cost; if it can't (type instability), every call pays a real, repeated runtime cost.
5. No — ordinary function calls in Clojure (like calling `+`) are unrelated to the `defmulti`/`defmethod` machinery entirely; multimethod dispatch is a separate construct used only where a program explicitly opts into it.
