# Module 1 — Foundations: Persistent Collections

By the end of this module you'll be able to work with Clojure's core immutable collection types, understand why `conj` means something different depending on which collection it's given, and — the real payoff — explain *and measure* why "immutable" doesn't mean "every change copies everything." Feeds Capstone 1.

## Vectors, maps, sets, keywords: the core literals

**You'll be able to:** recognize and construct Clojure's four everyday collection literals, plus its distinct keyword type.

**Concept**

Where Scheme and Racket built almost everything from `cons`-pair lists, Clojure gives four first-class collection literals: `[1 2 3]` (vector, indexed), `{:a 1 :b 2}` (map, key-value), `#{1 2 3}` (set, unique unordered), and `'(1 2 3)` (list, still present but now one option among several, not the default). **Keywords** (`:name`) are a distinct type from symbols — self-evaluating, most commonly used as map keys, and, distinctively, **callable as functions** that look themselves up in a map argument.

**Example**

```clojure
(def m {:name "Ada" :age 36})
(println (get m :name))
(println (:name m))          ; keyword-as-function lookup
(println (m :name))          ; map-as-function lookup
```

```
Ada
Ada
Ada
```

Verified directly: three genuinely different syntactic forms — `get`, a keyword called as a function, and a map called as a function — all produce the identical result. `(:name m)` is the idiom you'll see most often in real Clojure code; it reads almost like a getter method, without one ever being defined.

> **Pitfall:** `(:missing m "default")` and `(get m :missing "default")` both accept a third argument as a fallback for a missing key — but a bare `(m :missing)` with no fallback and no matching key returns `nil`, not an error. Every one of this series' earlier languages that used `car`/`cdr` on an empty list (Scheme, Racket) treated that as a hard error; Clojure's map lookup treats a missing key as a normal, representable outcome (`nil`) unless you ask it to do otherwise.

**Practice**

- Build a small map representing a person (name, age, city) and retrieve each field using all three lookup styles shown above.
- Predict, then verify, what `(:name 5)` does — calling a keyword as a function on something that isn't a map at all.

## `conj`: one function, different meanings per collection

**You'll be able to:** predict where `conj` inserts an element, based on which collection type it's given.

**Concept**

`conj` ("conjoin," add an element) behaves differently depending on the collection's own natural insertion point — a vector's is the end (its fast side, for a vector's underlying structure), a list's is the front (its fast side, for a linked structure). This isn't inconsistency; it's each collection exposing the operation that's actually efficient for its own representation.

**Example**

```clojure
(println (conj [1 2 3] 4))    ; vector: adds at end
(println (conj '(1 2 3) 4))   ; list: adds at front
(println (conj #{1 2 3} 4))   ; set: adds if not present
```

```
[1 2 3 4]
(4 1 2 3)
#{1 4 3 2}
```

Verified directly: the same call shape, `(conj collection 4)`, produces `4` at the *end* for a vector and at the *front* for a list — a real, load-bearing difference to internalize before writing code that assumes one behavior universally. A set's `conj` simply ensures membership, with no defined "position" at all (Clojure's sets, like most languages' sets, don't guarantee iteration order).

> **Pitfall:** code that builds a sequence with repeated `conj` calls and later assumes a specific element order needs to know which collection type it started with — swapping a vector for a list (or vice versa) as a small refactor can silently reverse the effective build order of everything added.

**Practice**

- Build a list and a vector from the same sequence of `conj` calls, and confirm their final element orders are opposite.

## Persistence and structural sharing, measured directly

**You'll be able to:** explain what "persistent" means for a Clojure collection, and back the claim that "immutable but efficient" isn't a contradiction with a real measurement.

**Concept**

Clojure's core collections are **persistent**: an operation like `assoc` or `conj` never mutates its argument — it returns a *new* collection reflecting the change, while the original remains fully intact and usable. The obvious naive implementation of that guarantee would copy the entire structure on every change, which would be prohibitively expensive at scale. Clojure's actual collections avoid this with **structural sharing** — internally, a persistent vector is a shallow tree (a 32-way branching trie), and "changing" one element only needs to rebuild the small path of tree nodes from the root down to that element, sharing every other branch, unchanged, with the original.

**Example — measured, not asserted:**

```clojure
(def big (vec (range 1000000)))

(let [start (System/nanoTime)]
  (dotimes [i 1000] (assoc big i :x))
  (println "1000 assoc ops on a 1M-element vector:"
           (/ (- (System/nanoTime) start) 1000000.0) "ms"))

(let [start (System/nanoTime)]
  (dotimes [i 1000] (into [] big))
  (println "1000 full (into []) copies of a 1M-element vector:"
           (/ (- (System/nanoTime) start) 1000000.0) "ms"))
```

```
1000 assoc ops on a 1M-element vector: 0.723041 ms
1000 full (into []) copies of a 1M-element vector: 4953.424542 ms
```

Verified directly, on this exact machine: 1000 `assoc` operations on a 1-million-element vector took under a millisecond total; 1000 genuine full copies of the same vector (`into []`, which really does rebuild every element) took nearly 5 seconds — roughly a **6800× difference**. This is the concrete, measured evidence behind "persistent collections aren't secretly doing a full copy under the hood" — if they were, `assoc` would cost roughly what the full-copy benchmark cost, and it plainly doesn't.

> **Pitfall:** structural sharing means the *original* collection is completely unaffected by an `assoc`/`conj` on a "derived" one — but it's still a genuinely new object (`identical?` on the two returns `false`), not the same object with hidden internal mutation. Code that relies on reference identity (rather than value equality, `=`) to detect "did this change" needs to compare the right thing.

**Practice**

- Repeat this module's timing comparison at a different vector size (100,000 or 10,000,000 elements) and see how the gap scales.
- Confirm directly that `(identical? big (assoc big 0 :x))` is `false`, while the original `big` itself is provably unchanged (`(= (get big 0) 0)` still holds after the `assoc`).

## Progress check

1. What's the practical difference between a keyword called as a function and a map called as a function, on a valid lookup?
2. What does a missing-key lookup on a Clojure map return by default, and how does that differ from Scheme/Racket's `car`-on-empty-list behavior?
3. Why does `conj` add to the end of a vector but the front of a list?
4. What claim did this module's own timing measurement actually prove, and what would you expect to see instead if persistent collections secretly copied on every change?
5. Does `identical?` returning `false` on an original collection and its `assoc`-derived version mean the original was mutated?

### Answers

1. Nothing on a valid lookup — both produce the same result; they're two equivalent syntactic idioms for the same underlying `get` operation.
2. It returns `nil`, a normal, representable value, rather than raising an error — Scheme's and Racket's `car`/`cdr` on `'()` are hard errors, requiring an explicit `null?` check beforehand; Clojure's map lookup treats absence as a legitimate outcome by default.
3. Because each collection exposes the insertion point that's actually cheap for its own internal representation — a vector's fast end is its tail; a linked list's fast end is its head.
4. That `assoc` on a large persistent vector is dramatically cheaper than a genuine full copy (roughly 6800× in this module's own measurement) — if persistent collections secretly copied everything on every change, `assoc`'s timing would be roughly comparable to the full-copy benchmark's, not orders of magnitude faster.
5. No — it means the operation produced a genuinely new, distinct object rather than mutating in place; the original collection remains fully intact and unaffected, confirmed by checking its own values directly (not by reference identity, which is expected to differ).
