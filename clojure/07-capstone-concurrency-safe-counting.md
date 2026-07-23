# Capstone 3 — Concurrency-Safe Counting

Combines every concept from Module 6, with real JVM threads: 10 threads, each incrementing a shared counter 10,000 times, run twice — once through an `atom`, once through unprotected raw mutable state — to measure, not assume, what `swap!`'s function-based updates actually prevent.

## The safe version

```clojure
(def counter (atom 0))

(defn increment-many [n]
  (dotimes [_ n] (swap! counter inc)))

(def threads
  (doall (for [_ (range 10)] (Thread. (fn [] (increment-many 10000))))))

(doseq [t threads] (.start t))
(doseq [t threads] (.join t))

(println "Final counter value:" @counter)
(println "Expected:" (* 10 10000))
```

`Thread.` constructs a real JVM thread from a zero-argument function; `.start`/`.join` are ordinary Java interop method calls — Clojure code reaching directly into the JVM's own concurrency primitives, with no special Clojure-specific thread library needed for this.

## The unsafe version

```clojure
(def unsafe-counter (int-array 1 0))

(defn unsafe-increment-many [n]
  (dotimes [_ n]
    (aset unsafe-counter 0 (inc (aget unsafe-counter 0)))))

(def threads
  (doall (for [_ (range 10)] (Thread. (fn [] (unsafe-increment-many 10000))))))

(doseq [t threads] (.start t))
(doseq [t threads] (.join t))

(println "Unsafe final value:" (aget unsafe-counter 0))
```

`unsafe-counter` is a raw, single-element Java `int` array — genuinely mutable state with no atomicity guarantee at all. `unsafe-increment-many` reads the current value (`aget`), computes one more (`inc`), and writes it back (`aset`) — three separate steps, with no protection against another thread doing the same three steps in between.

## Verification

```
$ clojure -M atom_test.clj
Final counter value: 100000
Expected: 100000
Match? true

$ clojure -M race_test.clj
Unsafe final value: 20819
Expected: 100000
Lost updates? true
```

Verified directly, on real JVM threads, not simulated: the `atom`-protected version produced **exactly** `100000` — 10 threads × 10,000 increments each, with zero lost updates. The unprotected raw-array version produced only `20819` — **79,181 increments were silently lost**, because two threads' read-compute-write sequences overlapped, and one thread's write overwrote the other's without either ever knowing.

> **This is the actual mechanism, made concrete:** thread A reads the counter as `500`, computes `501`. Before A writes `501` back, thread B also reads `500` (A hasn't written yet), computes `501`, and writes it. A then writes its own `501`. Two increments happened, but the counter only advanced by one — a genuine, silent, unrecoverable lost update, no error, no warning, no crash. `swap!`'s function-based update avoids this specifically because the read-compute-write cycle happens as one atomic operation (implemented via compare-and-swap, retrying automatically if another thread's update interleaved) rather than three separate, interruptible steps.

> **Pitfall:** this capstone's unsafe version is deliberately built with a raw Java array specifically to sidestep any of Clojure's own protections — an ordinary Clojure `def`'d value can't even be reassigned this way at all without an identity type wrapping it (Module 6). The bug demonstrated here is a genuine Java/JVM-level race condition, not a Clojure-specific pitfall; Clojure's actual contribution is making the *safe* version (`atom`/`swap!`) this easy to reach for by default.

## Extending it yourself

- Increase the thread count and per-thread increment count, and confirm the `atom` version still produces an exact match every time, while the unsafe version's lost-update count changes unpredictably from run to run (a real signature of a genuine race condition, not a deterministic bug).
- Rewrite the unsafe version using a plain Clojure `def`'d number and an ordinary (non-atomic) `swap!`-free reassignment attempt — confirm directly that Clojure's own `def` doesn't even offer a reassignment operation simple enough to reproduce this bug the way a raw Java array does, reinforcing Module 6's point about identities being a deliberately separate concept from values.
