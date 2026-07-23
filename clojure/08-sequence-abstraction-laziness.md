# Module 8 — The Sequence Abstraction & Laziness

By the end of this module you'll be able to use `first`/`rest`/`map`/`filter` uniformly across every collection type, build infinite sequences with `lazy-seq`, and — proven, not asserted — confirm exactly when a lazy sequence's elements actually get computed. Feeds Capstone 4.

## One sequence abstraction, every collection type

**You'll be able to:** use the same `first`/`rest`/`map`/`filter` operations across vectors, lists, maps, and sets, and explain what a map "becomes" when treated as a sequence.

**Concept**

Every collection this guide has used — vectors, lists, maps, sets — supports the same **sequence abstraction**: `first`, `rest`, and every higher-order function built on them (`map`, `filter`, `reduce`) work identically regardless of the underlying collection type. A map, sequenced, yields a sequence of `[key value]` two-element vectors — a real, consistent representation, not a special case.

**Example**

```clojure
(println (first [1 2 3]))
(println (first '(1 2 3)))
(println (first {:a 1 :b 2}))
(println (rest [1 2 3]))
(println (map inc [1 2 3]))
(println (map inc '(1 2 3)))
(println (filter even? #{1 2 3 4 5 6}))
```

```
1
1
[:a 1]
(2 3)
(2 3 4)
(2 3 4)
(4 6 2)
```

Verified directly: `(first {:a 1 :b 2})` returns `[:a 1]` — a genuine two-element vector, the map's first key-value pair treated as a sequence entry, not a special map-specific return shape. `map inc` produces identical results (`(2 3 4)`) whether given a vector or a list — the exact same function, over the exact same sequence abstraction, regardless of which concrete collection type it started from.

> **Pitfall:** a set's iteration order is genuinely unspecified — `(filter even? #{1 2 3 4 5 6})` returning `(4 6 2)` rather than `(2 4 6)` isn't a bug or a randomization; sets simply make no ordering guarantee at all, unlike vectors and lists, which preserve insertion/positional order.

**Practice**

- Write one function that computes the sum of any collection's elements using `reduce`, and confirm it works identically on a vector, a list, and a set.

## `lazy-seq`: infinite sequences, and proving when they actually compute

**You'll be able to:** build an infinite lazy sequence, and prove — with a real counter, not an assumption — exactly which elements actually get computed and when.

**Concept**

`lazy-seq` wraps a sequence-producing expression so that it isn't evaluated until something actually asks for its first element — and critically, this is a genuine, verifiable property of the runtime, not merely "the computation happens to be deferred as an implementation detail." `iterate` builds an infinite lazy sequence by repeatedly applying a function; `take` pulls a finite prefix from a (possibly infinite) lazy sequence.

**Example — Fibonacci, built lazily:**

```clojure
(defn fib-seq []
  ((fn fib [a b] (lazy-seq (cons a (fib b (+ a b))))) 0 1))
(println (take 10 (fib-seq)))
```

```
(0 1 1 2 3 5 8 13 21 34)
```

**The actual proof of laziness — a traced, counted sequence:**

```clojure
(def call-count (atom 0))
(defn traced-naturals []
  (letfn [(step [n]
            (lazy-seq
              (swap! call-count inc)
              (cons n (step (inc n)))))]
    (step 0)))

(def first-five (take 5 (traced-naturals)))
(println "Before realizing: call-count =" @call-count)
(println "Realized:" (doall first-five))
(println "After realizing 5: call-count =" @call-count)
```

```
Before realizing: call-count = 0
Realized: (0 1 2 3 4)
After realizing 5: call-count = 5
```

Verified directly, and this is the actual proof, not an assertion: `call-count` is `0` immediately after calling `(take 5 (traced-naturals))` — `take` itself is *also* lazy; merely calling it computes nothing at all. Only `doall` (forcing full realization) triggers computation, and it triggers **exactly 5** increments — not more, not fewer, precisely matching the 5 elements actually consumed. This is `scheme/07-continuations.md`'s own "the rest of the computation" idea from a different angle: a lazy sequence genuinely hasn't happened yet, in a checkable, provable sense, until something forces it.

**`take` terminating correctly on a genuinely infinite sequence:**

```clojure
(println (reduce + (take 100000 (iterate inc 0))))
```

```
4999950000
```

Verified by hand: `0 + 1 + ... + 99999 = 99999 · 100000 / 2 = 4999950000`, matching exactly — `(iterate inc 0)` is a genuinely infinite sequence (it would never terminate if fully realized), and `take 100000` correctly stops after exactly that many elements without ever attempting to force the rest.

> **Pitfall:** calling a function like `count` on an infinite lazy sequence (without a `take` bounding it first) will genuinely never terminate — `count` needs to walk the entire sequence to completion, and there is no "entire" for a sequence like `(iterate inc 0)`. This is a real, easy-to-trigger mistake, not a hypothetical one.

**Practice**

- Write a lazy, infinite sequence of prime numbers (a simple, unoptimized filter over `(iterate inc 2)` using `prime?` is enough), and `take` the first ten.
- Deliberately call `count` on an infinite `iterate` sequence in a way you can interrupt, and observe it never returning — then fix it by wrapping it in `take` first.

## Progress check

1. What does a map "become" when treated as a sequence via `first`/`rest`?
2. Why does a set's `filter` result not preserve any particular order?
3. What did this module's `call-count` experiment prove that a simple assertion ("lazy sequences defer computation") would not have?
4. Why was `call-count` still `0` immediately after calling `(take 5 (traced-naturals))`, before `doall` ran?
5. What real, easy mistake does calling `count` on an infinite lazy sequence risk?

### Answers

1. A sequence of `[key value]` two-element vectors, one per map entry — a consistent, genuine sequence representation, not a special case handled differently from other collections.
2. Because sets make no ordering guarantee at all, unlike vectors and lists, which preserve insertion or positional order — this is a real property of the collection type, not a bug or inconsistency.
3. That laziness is a checkable, provable runtime property — realizing exactly `n` elements causes exactly `n` computations, confirmed by a real counter, rather than merely trusting that "lazy" means "deferred" without verifying how much or how little actually ran.
4. Because `take` itself is also lazy — merely calling `take` on a lazy sequence doesn't force any of it; only `doall` (or another operation that actually needs concrete values) triggers real computation.
5. That it will never terminate — `count` needs to walk a sequence to its end to know its length, and a genuinely infinite sequence like `(iterate inc 0)` has no end to reach.
