# Capstone 4 — Infinite Sequences, Proven Lazy

Combines every concept from Module 8: two composed infinite lazy sequences — an infinite Fibonacci sequence, filtered by primality, itself also infinite — with a real, traced count proving exactly how much upstream computation `take` actually forces, not more.

## The program

```clojure
(defn prime? [n]
  (and (> n 1)
       (not-any? #(zero? (mod n %)) (range 2 (inc (int (Math/sqrt n)))))))

(defn fib-seq []
  ((fn fib [a b] (lazy-seq (cons a (fib b (+ a b))))) 0 1))

(def tested-count (atom 0))
(defn traced-fib-primes []
  (filter (fn [n] (swap! tested-count inc) (prime? n))
          (fib-seq)))
```

`traced-fib-primes` composes two lazy operations: `fib-seq` (itself infinite and lazy, from Module 8) and `filter` (which is *also* lazy — filtering an infinite sequence produces another infinite sequence, not an attempt to filter "everything" up front). `tested-count`, an `atom` from Module 6, tracks exactly how many Fibonacci numbers actually get tested for primality — the same call-counting technique Module 8 used to prove laziness, now applied to a genuinely useful computation instead of a toy trace.

## Verification

```clojure
(println "First 8 Fibonacci primes:" (take 8 (traced-fib-primes)))
(println "Fibonacci numbers actually tested for primality:" @tested-count)
```

```
First 8 Fibonacci primes: (2 3 5 13 89 233 1597 28657)
Fibonacci numbers actually tested for primality: 24
```

Verified directly: the first eight Fibonacci primes are correctly found — `2, 3, 5, 13, 89, 233, 1597, 28657` — and the trace shows **exactly 24** Fibonacci numbers were tested for primality to find them, not the entire (infinite, impossible-to-fully-compute) Fibonacci sequence. `take 8` on a `filter` over an infinite `lazy-seq` only forces as much of the underlying computation as is actually needed to satisfy the request — proven by the counter, not claimed from documentation.

**The sharper proof — asking for nothing tests nothing:**

```clojure
(reset! tested-count 0)
(def none (take 0 (traced-fib-primes)))
(println "Elements consumed:" (doall none) " tested-count:" @tested-count)
```

```
Elements consumed: ()  tested-count: 0
```

Verified directly: `(take 0 (traced-fib-primes))`, even forced with `doall`, tests **zero** Fibonacci numbers for primality. Nothing was asked for, so nothing was computed — not "computed and then discarded," genuinely never evaluated at all. This is the concrete, checkable version of the abstract claim "laziness means computation only happens when needed" — most languages that offer some form of lazy evaluation ask you to trust that claim; this capstone measured it directly, twice.

> **Pitfall:** composing two lazy operations (`fib-seq` then `filter`) doesn't change the fact that each step is still lazy individually — it would be a real mistake to assume `filter`'s laziness is somehow "used up" or bypassed by being composed with another lazy sequence. Laziness composes: a lazy operation over a lazy sequence is itself lazy, all the way down, which is exactly why `take 0` above tested nothing even through two layers of composition.

## Extending it yourself

- Change `prime?`'s trial-division bound and confirm the Fibonacci-prime results don't change (they shouldn't — a correct primality test shouldn't depend on which correct algorithm implements it), but that the `tested-count` trace timing might.
- Build a third lazy layer on top — Fibonacci primes that are themselves odd — and confirm the composed three-layer lazy pipeline still only computes exactly as much as `take n` actually needs.
