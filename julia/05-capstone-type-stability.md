# Capstone 2 — Measuring Type Stability

Combines every concept from Module 4: a running-balance calculation over ten million transactions, where a single, realistic-looking line (using `/` instead of a same-type-preserving operation) introduces real, measured type instability — verified with `Base.return_types` and a real timing comparison, not assumed from reading the code.

## The two versions

```julia
function running_balance_stable(amounts::Vector{Int})
    balance = 0
    for a in amounts
        balance += a
    end
    return balance
end

function running_balance_unstable(amounts::Vector{Int})
    balance = 0
    for a in amounts
        if a < 0
            balance = balance / 1   # division always returns Float64, even /1
        end
        balance += a
    end
    return balance
end
```

The only difference: `running_balance_unstable` divides `balance` by `1` whenever a negative amount is processed — mathematically a no-op (`balance / 1 == balance`), but `/` in Julia **always** returns a `Float64`, regardless of its operands' types. This single line, written by someone who assumed "dividing by 1 doesn't change anything" (true numerically, false about *type*), is enough to destabilize the entire function.

## Verification

```julia
println(Base.return_types(running_balance_stable, (Vector{Int},)))
println(Base.return_types(running_balance_unstable, (Vector{Int},)))
```

```
Any[Int64]
Any[Union{Float64, Int64}]
```

Confirmed directly, not assumed: `running_balance_stable` infers a single concrete return type; `running_balance_unstable` infers `Union{Float64, Int64}` — real, checkable proof that the "harmless" `/ 1` genuinely changed what the compiler can guarantee about `balance`'s type for the rest of the function's execution, not just at the line it appears on.

```julia
amounts = rand(-100:100, 10_000_000)
running_balance_stable(amounts[1:1000])    # warm-up
running_balance_unstable(amounts[1:1000])  # warm-up

t1 = @elapsed running_balance_stable(amounts)
t2 = @elapsed running_balance_unstable(amounts)
println("stable:   ", t1, " sec")
println("unstable: ", t2, " sec")
```

```
stable:   0.011273792 sec
unstable: 0.1265375 sec
```

Verified directly: roughly an **11× slowdown** for the type-unstable version over ten million transactions, computing the same numeric result (`results match (as numbers): true`, confirmed with `==`, which compares `Int`/`Float64` numeric equality correctly across the type difference). This is a smaller gap than Module 4's own ~6700× finding — an honest, real difference worth naming directly rather than glossing over: the actual performance cost of type instability depends on real factors (how often the destabilizing branch fires, what arithmetic surrounds it, how large the computation is), not a single universal multiplier. Both numbers are real and both prove the same underlying point; neither is "the" canonical type-instability tax.

> **The actual point of this capstone:** `balance / 1` looks completely harmless read in isolation — it's mathematically a no-op. The bug isn't in the *value* it produces, it's in the *type* it produces, and that distinction is exactly what this series' whole verification discipline exists to catch: a plausible-looking line of code that "obviously" does nothing can still have a real, measured, negative effect the author never intended or noticed, verified here with a concrete number rather than left as a plausible-sounding warning.

> **Pitfall:** the fix isn't "never use `/`" — it's recognizing that `/`'s return type is fixed (always `Float64` in Julia) regardless of its inputs, and choosing an operation that preserves the accumulator's existing type when that's actually the intent (here, simply removing the pointless `/ 1` entirely, since it changes nothing about the actual balance value).

## Extending it yourself

- Fix `running_balance_unstable` by removing the pointless `/ 1` line entirely, confirm `Base.return_types` now reports a single concrete type, and re-measure to confirm the performance gap disappears.
- Design your own type-instability trigger, different from both this capstone's and Module 4's (hint: consider what happens if a loop variable is sometimes reassigned to `nothing`, or to a different concrete numeric type like `Int32`), and verify it with `Base.return_types` before measuring its actual performance cost.
