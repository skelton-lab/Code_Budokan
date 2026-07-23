# Module 4 — Type Stability and the JIT

By the end of this module you'll be able to explain what type stability means precisely, inspect a function's inferred return type directly, and measure — not assume — the real performance cost of losing it. Feeds Capstone 2.

## What "type stability" actually means

**You'll be able to:** identify whether a function is type-stable by inspecting its compiler-inferred return type directly.

**Concept**

Julia compiles each function, for each combination of argument types it's actually called with, via LLVM — and it can generate genuinely optimal machine code specifically when it can prove, ahead of time, that a variable's type never changes during execution. A function is **type-stable** when every variable's type is determined and fixed from the start; it's **type-unstable** when a variable's type can vary depending on runtime values (an `if` branch that reassigns a variable to a different type, say). `Base.return_types` shows exactly what the compiler inferred, directly and checkably.

**Example**

```julia
function stable_fn(n::Int)
    total = 0
    for i in 1:n
        total += i
    end
    return total
end

function unstable_fn(n::Int)
    total = 0
    for i in 1:n
        if i == 5
            total = total / 2   # total silently becomes a Float64 here
        end
        total += i
    end
    return total
end

println(Base.return_types(stable_fn, (Int,)))
println(Base.return_types(unstable_fn, (Int,)))
```

```
Any[Int64]
Any[Union{Float64, Int64}]
```

Verified directly: the compiler infers `stable_fn` returns exactly `Int64` — one single, concrete type, provable ahead of time. `unstable_fn` infers `Union{Float64, Int64}` — the compiler genuinely cannot guarantee which one it'll be, because `total / 2` (division) converts an `Int` to a `Float64` partway through the loop, and every subsequent `total += i` might now be adding to either type depending on whether that branch ran.

> **Pitfall:** `total = 0` (an `Int` literal) followed later by `total = total / 2` (which produces a `Float64`, since `/` always returns a float in Julia, even for two integers) is a real, easy way to accidentally introduce instability — the bug isn't in the branch logic being wrong, it's that the *type* of a variable silently changed partway through, a category of mistake with no equivalent in a language where variables have one fixed, declared type throughout their lifetime (like OCaml's `let`-bound values).

**Practice**

- Write a function that's type-stable by construction (using `total / 2` from the very first line, so `total` is `Float64` throughout, never starting as `Int`), and confirm `Base.return_types` reports a single concrete type.

## Measuring the real cost, not assuming it

**You'll be able to:** measure a function's execution time with `@elapsed`, correctly excluding JIT compilation time from the measurement.

**Concept**

`@elapsed expression` runs `expression` and returns the wall-clock time it took, in seconds. Because Julia compiles a function the *first* time it's called with a given set of argument types (and caches that compiled code for subsequent calls), a fair timing comparison needs a **warm-up call** first — timing a function's very first invocation would measure compilation time, not execution time, a real, easy mistake to make when benchmarking Julia code.

**Example**

```julia
# warm up (JIT compile) both first
stable_fn(1000)
unstable_fn(1000)

n = 10_000_000
t1 = @elapsed stable_fn(n)
t2 = @elapsed unstable_fn(n)

println("stable: ", t1, " sec")
println("unstable: ", t2, " sec")
```

```
stable: 4.208e-6 sec
unstable: 0.028388833 sec
```

Verified directly, on this exact machine: the type-stable version summed ten million numbers in **4.2 microseconds** — the compiler proved `total` is always `Int64` and generated tight, optimal machine code. The type-unstable version, computing the *identical arithmetic result*, took **28.4 milliseconds** — roughly **6700× slower** — because every single `total += i` inside the loop has to check, at runtime, which concrete type `total` currently holds before it can proceed, a real, repeated cost paid on every iteration that the stable version never incurs at all.

> **Pitfall:** skipping the warm-up call is the single most common Julia benchmarking mistake — a first, uncompiled call to either function would include real compilation time in the measurement, likely making the *unstable* function's first call look artificially similar in cost to the stable one's, completely obscuring the actual runtime difference this module just measured.

**Practice**

- Remove the warm-up calls, re-measure both functions' *first* invocation, and compare those numbers against this module's own warmed-up measurements — confirm directly how misleading an unwarmed benchmark would have been.

## Progress check

1. What does it mean for a Julia function to be "type-stable," precisely?
2. What did `Base.return_types` reveal about `unstable_fn` that made its instability concrete and checkable, rather than merely suspected?
3. What specific line in `unstable_fn` introduced the type instability, and why?
4. Why does a fair Julia benchmark need a warm-up call before timing?
5. What was the actual, measured performance gap between the stable and unstable versions of the identical computation?

### Answers

1. That every variable's type is determined and fixed from the start of the function — the compiler can prove, ahead of time, exactly what type a given variable will always hold, with no runtime uncertainty.
2. That its inferred return type was `Union{Float64, Int64}` — a real, checkable proof that the compiler itself couldn't guarantee a single concrete return type, not just a guess based on reading the code.
3. `total = total / 2` — Julia's `/` operator always returns a `Float64`, even when dividing two integers, so this line silently converts `total` from `Int` to `Float64` the first time that branch runs.
4. Because Julia compiles a function the first time it's called with a given set of argument types — timing an uncompiled first call measures compilation time mixed in with execution time, not a fair measurement of the function's actual runtime performance.
5. Roughly 6700× — 4.2 microseconds for the type-stable version versus 28.4 milliseconds for the type-unstable version, computing the identical arithmetic result.
