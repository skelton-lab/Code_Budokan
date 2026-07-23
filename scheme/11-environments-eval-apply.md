# Module 11 — Environments & the Eval/Apply Cycle

By the end of this module you'll be able to represent an environment as a chain of frames using `define-record-type`, and look up, define, and mutate variables through that chain with correct shadowing behavior. Feeds Capstone 4 directly — this *is* the data structure a real evaluator's variable lookup runs on.

## Representing an environment as a chain of frames

**You'll be able to:** build a record-based environment representation, and explain what "a chain of frames" means concretely.

**Concept**

An environment is what makes `x` mean something specific at a given point in a program — and in a language with nested scopes (a procedure call creates a new, inner scope), an environment is naturally a **chain**: a frame of bindings for the current scope, plus a pointer to the enclosing environment to search if the current frame doesn't have what's being looked up. `define-record-type` (introduced without comment until now — it's exactly what it looks like: a way to define a new structured data type with named fields) is the natural tool for this.

**Example**

```scheme
(define-record-type frame
  (make-frame bindings)
  frame?
  (bindings frame-bindings set-frame-bindings!))

(define-record-type environment
  (make-env-record frame parent)
  environment?
  (frame env-frame)
  (parent env-parent))

(define the-empty-environment '())

(define (extend-environment vars vals base-env)
  (make-env-record (make-frame (map cons vars vals)) base-env))
```

`extend-environment` builds a *new* environment whose frame binds `vars` to `vals`, with `base-env` as its parent — exactly what happens conceptually every time a procedure is called: a fresh frame for its parameters, chained to whatever environment was in scope when the procedure was defined.

> **Pitfall:** `frame-bindings` stores an association list (a list of `(variable . value)` pairs, built with `map cons`) — a real, working choice for a small evaluator, but a linear list scanned from the front on every lookup. A production Scheme implementation uses a genuinely faster structure (a hash table, typically); this module's choice trades performance for being easy to read and verify by eye, which is exactly what this guide's own capstone needs.

**Practice**

- Build an environment binding `'(a b c)` to `(list 1 2 3)`, with `the-empty-environment` as its parent, and inspect its frame's bindings directly.

## Lookup, definition, and mutation through the chain

**You'll be able to:** look up a variable's value by searching outward through the environment chain, add a new binding, and mutate an existing one — with correct shadowing.

**Concept**

`lookup-variable-value` searches the current frame first; if not found, it recurses into the parent environment, continuing until either a binding is found or `the-empty-environment` is reached (an unbound-variable error). `define-variable!` always adds to the *current* frame. `set-variable-value!` searches like lookup, but mutates whichever frame's binding it actually finds — critically, **not** necessarily the current one.

**Example**

```scheme
(define global-env (extend-environment '(x y) (list 10 20) the-empty-environment))
(display (lookup-variable-value 'x global-env)) (newline)

(define inner-env (extend-environment '(x) (list 99) global-env))
(display (lookup-variable-value 'x inner-env)) (newline)
(display (lookup-variable-value 'y inner-env)) (newline)

(set-variable-value! 'x 111 global-env)
(display (lookup-variable-value 'x global-env)) (newline)
(display (lookup-variable-value 'x inner-env)) (newline)
```

```
10
99
20
111
99
```

Verified directly: `inner-env`'s own `x` (`99`) correctly **shadows** `global-env`'s `x` (`10`) — looking up `x` through `inner-env` finds the inner frame's binding first and never even looks at the outer one. Looking up `y` through `inner-env`, which has no `y` of its own, correctly falls through to `global-env`'s `y` (`20`). And the sharpest result: mutating `x` through `global-env` with `set-variable-value!` changes `global-env`'s `x` to `111`, but `inner-env`'s own `x` — a genuinely separate binding, not a reference to the global one — stays `99`, completely unaffected. This is exactly what lexical scoping and shadowing mean, made mechanically concrete rather than asserted.

> **Pitfall:** it's easy to assume `set-variable-value!` on a name that's shadowed somewhere "should" affect the shadowing binding, since that's the one actually visible at the call site — but `set-variable-value!` searches from *whatever environment you hand it*, exactly like `lookup-variable-value` does. Calling it with `global-env` searches starting from the global frame, genuinely bypassing `inner-env`'s shadow entirely, because `inner-env` was never part of that particular search.

**Practice**

- Build a three-level chain (global → middle → inner) with a variable shadowed at all three levels, and confirm looking it up from each level returns the expected, level-specific value.
- Predict, then verify, what happens when `set-variable-value!` is called for a variable that doesn't exist anywhere in the chain.

## Progress check

1. What does an environment's "chain" structure actually represent, conceptually?
2. Why does `extend-environment` need both a set of `vars`/`vals` and a `base-env`?
3. What's the essential difference in behavior between `define-variable!` and `set-variable-value!`?
4. In the worked example, why did `inner-env`'s `x` stay `99` even after `set-variable-value!` was called on `x` via `global-env`?
5. What tradeoff did this module's frame representation (an association list) make, and why is it acceptable here?

### Answers

1. Nested lexical scope — each frame represents one level of scope (like a procedure call's local variables), and the chain of parent pointers represents "if it's not defined here, look in the scope this one is nested inside."
2. `vars`/`vals` establish the new frame's own bindings (what's local to this new scope); `base-env` is what that new frame is chained onto — without it, the new environment would have no way to find anything not defined in its own immediate frame.
3. `define-variable!` always adds a binding to the *current* frame, regardless of whether an outer frame already has a variable by that name (creating a new, shadowing binding); `set-variable-value!` searches outward through the chain and mutates whichever existing binding it actually finds, wherever that is.
4. Because `set-variable-value!` was called with `global-env`, not `inner-env` — it only ever searches the chain starting from the environment it's given, so it never saw or touched `inner-env`'s separate, shadowing `x` binding at all.
5. It traded lookup speed (a linear scan through an association list) for simplicity and readability — acceptable here because this module's environments are small and built for demonstrating the mechanism clearly, not for the performance a production interpreter would need.
