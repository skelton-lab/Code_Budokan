# Module 6 — Value vs. Identity: Atoms

By the end of this module you'll be able to use `atom`/`swap!`/`deref` to manage change over time, and explain the philosophy behind why Clojure separates "an immutable value" from "an identity that can point to different values over time" as two genuinely distinct concepts. Feeds Capstone 3, where this module's mechanics get their real, concrete payoff.

## The philosophy: values don't change, identities do

**You'll be able to:** state the distinction Clojure's own design draws between a value and an identity, in your own words.

**Concept**

Every collection this guide has used so far (`{:balance 100}`, `[1 2 3]`) is an immutable **value** — it never changes; `assoc`/`conj` produce new values entirely. But real programs need to model things that genuinely *do* change over time — a bank account's balance, a counter, a piece of shared state. Clojure's answer, distinctly, is to keep the *values* immutable and introduce a separate concept: an **identity** (an `atom`, here) that, at any given moment, *points to* one immutable value, and can be updated to point to a different one. "Change" in Clojure means "this identity now points to a different immutable value" — the old value itself was never mutated, ever.

**Example**

```clojure
(def account (atom {:balance 100}))
(println "Initial:" @account)

(swap! account update :balance + 50)
(println "After deposit:" @account)

(swap! account update :balance - 30)
(println "After withdrawal:" @account)
```

```
Initial: {:balance 100}
After deposit: {:balance 150}
After withdrawal: {:balance 120}
```

Verified directly: `account` is the *identity* — `@account` (shorthand for `(deref account)`) reads whatever immutable value it currently points to. `swap!` doesn't mutate the map `{:balance 100}` in place; it computes a brand-new map (via `update`, which itself just calls `assoc` under the hood) and atomically repoints `account` at that new map. The old map `{:balance 100}` still exists, unchanged, exactly as immutable as it always was — it's simply no longer what `account` currently points to.

> **Pitfall:** `def`-ing an ordinary Clojure value (a plain map, not wrapped in `atom`) and expecting to "update" it in place is a category error under this philosophy — plain values have no mechanism for being repointed at all; only identities (`atom`, and the `ref`/`agent` siblings Module 10 signposts) support that.

**Practice**

- Predict, then verify, what `(swap! account update :balance + 1000)` followed by re-reading the *original* map literal `{:balance 100}` (not `@account`) shows — confirming the original value was never touched.

## `swap!`, `reset!`, and why `swap!` takes a function

**You'll be able to:** update an atom with `swap!` (a function of the current value) and `reset!` (an unconditional new value), and explain why `swap!`'s function-based form matters.

**Concept**

`reset!` unconditionally sets an atom to a new value, discarding whatever it held. `swap!` instead takes a *function* — it's called with the atom's *current* value and whatever extra arguments you supply, and the atom becomes whatever that function returns. This function-based form is what makes `swap!` safe under concurrent access (Capstone 3's whole payoff) — `reset!` simply overwrites, with no way to say "update relative to whatever the value currently is," which is exactly the operation a shared counter or balance actually needs.

**Example**

```clojure
(reset! account {:balance 0})
(println "After reset:" @account)

(def counter (atom 0))
(swap! counter (fn [old] (+ old 1)))
(swap! counter inc)
(println "Counter:" @counter)
```

```
After reset: {:balance 0}
Counter: 2
```

Verified directly: `reset!` discards the account's history entirely, unconditionally. `swap! counter (fn [old] (+ old 1))` and `swap! counter inc` are equivalent — both apply a function to whatever value is currently there, and Clojure's own `inc` is just a plain one-argument function, exactly the shape `swap!` expects.

> **Pitfall:** `reset!` is exactly the wrong tool for "add one to whatever this atom currently holds" under any kind of concurrent access — two `reset!` calls racing to overwrite the same atom based on a value each read *before* the race started can each stomp on the other's update, discarding one entirely. `swap!`'s function-based retry mechanism (covered concretely in Capstone 3) is specifically what prevents this.

**Practice**

- Write a `swap!` call that doubles an atom's current numeric value, using an anonymous function.
- Explain, in your own words, why `(reset! counter (+ @counter 1))` is a genuinely different, riskier operation than `(swap! counter inc)`, even though both "look like" incrementing the counter.

## Progress check

1. What's the actual distinction Clojure draws between a "value" and an "identity"?
2. When `swap!` updates an atom, does it mutate the atom's *previous* value, or produce something new?
3. What's the practical difference between `reset!` and `swap!`?
4. Why does `swap!`'s function-based form matter more than it might first appear to?
5. What real risk does `(reset! counter (+ @counter 1))` carry that `(swap! counter inc)` doesn't?

### Answers

1. A value is immutable and never changes at all; an identity (like an `atom`) is a separate concept that, at any moment, *points to* one immutable value, and can be updated to point to a different one — "change" means repointing the identity, never mutating a value.
2. It produces something new — the atom's previous value is never mutated; `swap!` computes a brand-new value via the supplied function and atomically repoints the atom at it.
3. `reset!` unconditionally sets the atom to a specific new value, discarding whatever it held; `swap!` computes the new value as a function of whatever the atom *currently* holds, at the actual moment of the update.
4. Because computing the new value *as a function of the current value*, evaluated atomically at update time, is exactly what makes concurrent updates from multiple threads safe — a `reset!`-based "read the old value, compute a new one, write it back" sequence has a gap where another thread's concurrent update can be silently lost.
5. Two threads racing on `(reset! counter (+ @counter 1))` can both read the same starting value before either writes back, so one thread's increment is silently discarded when the other's `reset!` overwrites it — `swap!` avoids this because its update function runs as part of an atomic, automatically-retried operation, not two separate read-then-write steps.
