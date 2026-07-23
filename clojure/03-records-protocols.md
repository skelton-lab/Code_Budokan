# Module 3 — Records & Protocols

By the end of this module you'll be able to define structured types with `defrecord`, declare a shared interface with `defprotocol`, and — the genuinely distinctive part — retroactively extend an *existing* type, including a built-in Java type you don't own, to implement a new protocol. Feeds Capstone 2.

## `defrecord` and `defprotocol`

**You'll be able to:** define a protocol (a named set of required operations) and a record type implementing it, and call those operations polymorphically.

**Concept**

`defprotocol` declares a set of function signatures, similar in spirit to Racket's `interface` (`racket/04-classes-objects.md`) — a contract on what operations a type supports. `defrecord` defines a structured data type (like a `struct`, but a record can implement one or more protocols directly in its own definition) with generated constructor functions (`->TypeName`).

**Example**

```clojure
(defprotocol Shape
  (area [this])
  (describe [this]))

(defrecord Circle [radius]
  Shape
  (area [this] (* Math/PI radius radius))
  (describe [this] (str "Circle r=" radius)))

(defrecord Rectangle [width height]
  Shape
  (area [this] (* width height))
  (describe [this] (str "Rect " width "x" height)))

(def shapes [(->Circle 5) (->Rectangle 4 6)])
(doseq [s shapes]
  (println (describe s) "area=" (area s)))
```

```
Circle r=5 area= 78.53981633974483
Rect 4x6 area= 24
```

Verified directly: `(area s)` dispatches to whichever record type `s` actually is, over a mixed vector — `π·5² = 78.53981633974483` for the circle, `4·6 = 24` for the rectangle — the same polymorphism shape this series has traced since `c/`'s hand-built function pointers, now expressed with Clojure's own record/protocol pair instead of `racket/class`'s inheritance.

> **Pitfall:** unlike Racket's `class`/`extend` inheritance chain, `defrecord` has no notion of one record type inheriting from another — each record's protocol implementations are written out completely, with no `super`-style call to reuse a "parent" record's logic, because there's no parent relationship between records at all. Shared logic between record types is factored into ordinary functions both records' method bodies call, not inheritance.

**Practice**

- Add a `Triangle` record (base, height) implementing `Shape`, and confirm it works correctly in the same mixed `shapes` vector.
- Add a second protocol method, `perimeter`, and implement it for all three shapes.

## `extend-type`: adding a protocol to a type after the fact

**You'll be able to:** make an existing type — including one you don't own the source of — implement a protocol it wasn't originally written with.

**Concept**

`extend-type` retroactively attaches a protocol implementation to any existing type, including Java's own built-in classes. This is genuinely different from every polymorphism mechanism this series has covered so far: Racket's `class*` requires declaring an interface at the point a class is *defined*; Clojure lets you extend a type's capabilities from entirely separate code, after the type already exists, with no access to or modification of its original definition required.

**Example**

```clojure
(extend-type java.lang.Long
  Shape
  (area [this] (* this this))
  (describe [this] (str "Square-number " this)))

(println (describe 7) "area=" (area 7))
```

```
Square-number 7 area= 49
```

Verified directly: `java.lang.Long` — a built-in Java class this code neither wrote nor can modify — now genuinely implements the `Shape` protocol. Calling `(area 7)` on a plain integer literal works exactly like calling it on a `Circle` or `Rectangle` record, because `7` (an ordinary Clojure integer) *is* a `java.lang.Long` under the hood on the JVM.

> **Pitfall:** `extend-type`'s power is a real, double-edged design tradeoff — it lets any piece of code in a program add capabilities to any type, including ones defined far away in a library you don't control, which is both genuinely useful (retrofitting old code with new interfaces) and a real source of "which of several `extend-type` calls scattered across a large codebase actually took effect for this type" confusion at scale. Racket's closed class hierarchies trade this flexibility away specifically to avoid that ambiguity.

**Practice**

- Use `extend-type` to make `java.lang.String` implement `Shape` in some way that makes sense for a string (perhaps treating its length as one dimension of a notional 1×n rectangle), and confirm `(area "hello")` works.

## Progress check

1. What does `defprotocol` declare, and what's it most similar to from the Racket guide?
2. Why doesn't `defrecord` have anything analogous to Racket's `super` call?
3. What's genuinely different about `extend-type` compared to Racket's `class*`/interface declaration?
4. What did extending `java.lang.Long` with the `Shape` protocol actually demonstrate?
5. What's the real tradeoff `extend-type`'s flexibility introduces?

### Answers

1. A named set of required operations a type must implement — closest to Racket's `interface`, a contract on a type's shape/capabilities rather than a check on individual function arguments (which would be a `racket/contract` concern instead).
2. Because records have no inheritance relationship between them at all — each record's protocol implementations are written completely independently; shared logic is factored into ordinary functions both records' methods call, not inherited from a parent type.
3. `extend-type` attaches a protocol implementation to a type *after* that type already exists, from separate code with no access to or modification of the type's original definition — Racket's `class*` requires declaring interface implementation at the point a class is originally defined.
4. That a built-in Java type — one this code neither wrote nor could modify — could be retroactively given a new capability (the `Shape` protocol), proving `extend-type` genuinely works on types you don't own, not just your own custom record types.
5. It makes it easy to retrofit new capabilities onto existing types from anywhere in a codebase, but at the cost of it potentially being unclear, in a large program, which of several scattered `extend-type` calls is responsible for a given type's behavior.
