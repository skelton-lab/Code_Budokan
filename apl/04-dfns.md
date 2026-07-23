# Module 4 — dfns: Defining Your Own Functions

By the end of this module you'll be able to define your own monadic and dyadic functions with `{}` (dfns), using `⍵` and `⍺` for the right and left arguments. Feeds Capstone 2.

## Monadic dfns: `{⍵}`

**You'll be able to:** define a function taking a single argument, referenced as `⍵`.

**Concept**

`{expression involving ⍵}` defines a monadic (single-argument) function — `⍵` refers to whatever the function is applied to. Assign it a name with `←` exactly like any other value.

**Example**

```apl
double←{2×⍵}
double 21
square←{⍵×⍵}
square ⍳5
```

```
42
1 4 9 16 25
```

Verified directly: `double 21 = 42`. `square ⍳5` applies `{⍵×⍵}` to the entire five-element vector `⍳5` at once (Module 1's scalar-extension/elementwise principle again, now inside a user-defined function) — producing `1 4 9 16 25`, every element squared, still with no explicit loop.

> **Pitfall:** `⍵` inside a dfn takes on the *entire* argument as given — calling `square` on a vector doesn't call the function once per element; the function's own body (`⍵×⍵`) is what naturally applies elementwise, because `×` itself is elementwise. A dfn written with a non-elementwise operator inside won't automatically vectorize just by virtue of being a dfn.

**Practice**

- Define a monadic dfn `cube` and confirm `cube ⍳4` gives `1 8 27 64`.

## Dyadic dfns: `{⍺ ⍵}`

**You'll be able to:** define a function taking two arguments, referenced as `⍺` (left) and `⍵` (right).

**Concept**

The same `{}` syntax, referencing both `⍺` and `⍵`, defines a dyadic function — called with one argument on each side, exactly like APL's own built-in dyadic operators (`+`, `×`, and the rest).

**Example**

```apl
add←{⍺+⍵}
10 add 5
```

```
15
```

Verified directly: `10 add 5` calls the dfn with `⍺←10` and `⍵←5`, computing `15` — a user-defined function called with exactly the same left-argument/right-argument syntax as any of APL's built-in operators.

> **Pitfall, a real, verified toolchain-specific finding:** GNU APL's **guard syntax** for conditional logic inside a dfn (`condition:result⋄...`, the standard way most APL dialects express "if this, else that" inside a `{}` function body) was tested directly against this guide's exact invocation mode (`apl -s --safe -f script.apl`) and **failed outright** — even the simplest possible guard (`{⍵>0:99}`) produces `Illegal : in immediate execution`, on this toolchain, in this invocation mode. This isn't a claim taken from documentation; it's a directly tested, reproducible result. Neither of this guide's remaining capstones actually needs conditional logic inside a dfn — outer product, transpose, and grade-up/down are all unconditional array operations — so this guide simply doesn't rely on guards anywhere. A reader who needs conditional dfns in real GNU APL work should verify guard syntax interactively before depending on it in a script, rather than assuming this guide's own experience generalizes to every invocation mode.

**Practice**

- Define a dyadic dfn `avg2` computing the average of its two arguments, and confirm `10 avg2 20` gives `15`.

## Progress check

1. What do `⍵` and `⍺` each refer to inside a dfn?
2. Why does `square ⍳5` correctly square every element, without the dfn needing to loop internally?
3. What real, directly-tested finding did this module report about GNU APL's guard syntax, in this guide's specific invocation mode?
4. Why don't Capstones 2 and 3 need conditional dfn logic at all?
5. What should a reader do before relying on guard syntax in their own GNU APL scripts, given this module's finding?

### Answers

1. `⍵` refers to a monadic function's single argument, or a dyadic function's right-hand argument; `⍺` refers to a dyadic function's left-hand argument only (monadic functions have no `⍺`).
2. Because the dfn's own body (`⍵×⍵`) uses `×`, which is itself elementwise — the vectorization comes from the operator inside the dfn, not from any special looping behavior of `{}` itself.
3. That the guard syntax (`condition:result`) fails outright with `Illegal : in immediate execution`, tested directly, even for the simplest possible case — a real, reproducible result specific to this toolchain and invocation mode, not assumed from documentation.
4. Because outer product, transpose, and grade-up/down (the operations both capstones actually use) are all unconditional array operations — none of them need an "if this, else that" branch inside a user-defined function.
5. Test it interactively, directly against their own actual invocation mode, before depending on it — this module's finding is specific to one toolchain version and one invocation mode (piped script input), and shouldn't be assumed to generalize without checking.
