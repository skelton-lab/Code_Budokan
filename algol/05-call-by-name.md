# Module 5 — Parameters: Call-by-Value vs. Call-by-Name, and Jensen's Device

The single clearest case in this entire series of "genuinely important historical idea, no longer reproducible with this guide's toolchain." Everything in this module is documented from the actual 1960 ALGOL 60 Report and well-established secondary sources — none of it is executed, because ALGOL 68 replaced this mechanism with a different, explicit parameter model rather than carrying it forward.

## Call-by-value vs. call-by-name, documented

**Concept, documented (not executed — ALGOL 68 does not have this mechanism):**

**Call-by-value** (the default parameter-passing mode in essentially every language in this series) copies the argument's *current value* into the procedure at the moment of the call — the procedure works with its own independent copy, and nothing it does can affect the caller's variable through that parameter.

ALGOL 60's default was different, and genuinely unusual by modern standards: **call-by-name**. A by-name parameter isn't a copied value — it's closer to substituting the *actual argument expression itself*, textually, everywhere the parameter name appears in the procedure body, and then **re-evaluating that expression fresh, every single time it's referenced**. (ALGOL 60's report formalized this as the "copy rule" — with careful renaming to avoid variable name clashes between the caller's and callee's scopes.) If the argument expression is something simple like a single variable, call-by-name behaves a lot like passing a reference to it. If the argument expression is something that changes value each time it's evaluated — an array access using a loop variable that's still changing, for instance — call-by-name means the parameter tracks that change, live, on every reference.

> **Why every language after ALGOL 60 abandoned this:** re-evaluating an expression fresh on every reference is both a real performance cost (a supposedly cheap parameter reference might silently re-run an expensive computation every single time it's touched) and a source of behavior that's very difficult to reason about if the expression has side effects. Call-by-name essentially disappeared from mainstream language design after ALGOL 60 — this module's "why did this matter" answer is almost entirely historical, not practical.

## Jensen's Device, documented

**You'll be able to:** trace through the classic example that made call-by-name simultaneously famous and notorious.

**Concept, documented (the canonical historical example, reproduced from standard secondary sources, not executed):**

```algol60
real procedure Sum(i, lo, hi, term);
value lo, hi;
integer i, lo, hi;
real term;
begin
  real temp;
  temp := 0;
  for i := lo step 1 until hi do
    temp := temp + term;
  Sum := temp
end;
```

Note the `value lo, hi;` declaration — `lo` and `hi` are explicitly forced to call-by-value (ALGOL 60 let you override the by-name default this way). `i` and `term` are **not** listed there, so they default to call-by-name.

Called as `Sum(i, 1, 100, a[i])` — this sums `a[1] + a[2] + ... + a[100]`. Trace through *why*, precisely: `term` is called by name, so every time the loop body's `temp := temp + term` runs, `term` is re-evaluated fresh from the actual argument expression, `a[i]`. But `i` is *also* called by name — and `i` in the caller's argument expression `a[i]` refers to the exact same variable `i` that `Sum`'s own `for i := lo step 1 until hi do` is simultaneously counting through. So each iteration, `term` re-evaluates `a[i]` using whatever value the loop has just set `i` to — producing a correct running sum of the entire array, from one generic summation procedure that never mentions the array `a` anywhere in its own definition.

**This is genuinely the trick, and genuinely why it's called a "device":** the same `Sum` procedure, unchanged, can be called as `Sum(i, 1, 100, a[i] * b[i])` to compute a dot product instead, or `Sum(i, 1, 100, a[i] * a[i])` for a sum of squares — because `term` isn't a value at all, it's a live, re-evaluated expression, parameterized entirely by whatever the caller writes as the fourth argument.

> **Why this became notorious, not just clever:** Jensen's Device is frequently cited as *the* canonical example of call-by-name's power — and, in the same breath, as exactly the kind of cleverness that makes code fiendishly hard to read and reason about. It depends on a subtle aliasing relationship (the caller's `i` and the callee's loop variable `i` being the very same variable) that isn't visible from either the call site or the procedure definition alone — you need to trace through the substitution rule by hand, exactly as this module just did, to see why it works at all.

**Practice**

- Trace through, on paper, what `Sum(i, 1, 3, a[i])` does step by step for `a = [10, 20, 30]` — write out each iteration's value of `i`, the re-evaluated `term`, and the running `temp`.
- In your own words, write one paragraph explaining why call-by-value (what every later language in this series actually uses) makes this exact trick impossible — what specifically would need to be true of `term` for the "re-evaluate on every reference" behavior to happen, and why call-by-value never provides that.

## Progress check

1. What does call-by-value do with an argument at the moment of a call?
2. What does call-by-name do differently, and how does ALGOL 60's "copy rule" describe it?
3. In Jensen's Device, why does `term` (`a[i]`) correctly track the current value of `i` on every loop iteration?
4. Why was `lo`/`hi` explicitly declared `value` in the `Sum` procedure, while `i`/`term` were left as the default?
5. Why did essentially every language after ALGOL 60 abandon call-by-name as a default parameter-passing mode?

### Answers

1. It copies the argument's current value into the procedure at the moment of the call — the procedure receives an independent copy, and nothing it does can reach back to affect the caller's original variable through that parameter.
2. Call-by-name substitutes the actual argument *expression* (not its value) for every occurrence of the parameter name in the procedure body, re-evaluating that expression fresh each time it's referenced — described formally as textual substitution with renaming to avoid variable-name clashes between caller and callee scopes.
3. Because `i` is also passed by name, and the caller's argument expression `a[i]` refers to the exact same `i` variable that `Sum`'s own loop (`for i := lo step 1 until hi do`) is simultaneously updating — each time `term` is re-evaluated, it picks up whatever value that shared `i` currently holds.
4. `lo` and `hi` are simple loop bounds — there's no benefit to re-evaluating them repeatedly, and forcing them to call-by-value avoids the (here, unnecessary) overhead and complexity of by-name's repeated re-evaluation. `i` and `term` are left by-name specifically because the entire trick depends on `term` being re-evaluated fresh on every reference.
5. Repeatedly re-evaluating an expression on every reference is both a real performance cost and a source of behavior that's difficult to reason about when the expression has side effects — mainstream language design converged on call-by-value (and, separately, explicit reference/pointer passing) as clearer and more predictable defaults instead.
