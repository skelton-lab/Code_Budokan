# Module 4 — Multimethods

By the end of this module you'll be able to write a `defmulti`/`defmethod` dispatch on an arbitrary computed value, and — the genuinely distinctive capability — dispatch on a *combination* of multiple arguments at once, something single-dispatch protocols cannot express at all. Feeds Capstone 2.

## `defmulti`/`defmethod`: dispatch on anything, not just type

**You'll be able to:** write a multimethod whose dispatch function computes an arbitrary value, not just a type check.

**Concept**

Module 3's protocols dispatch on exactly one thing: the runtime type of the first argument (`this`). A multimethod's dispatch function can compute *anything* from its arguments — a multimethod is `defmulti`'d with that dispatch function, and each `defmethod` handles one possible dispatch value.

**Example**

```clojure
(defmulti classify-triangle
  (fn [a b c]
    (cond
      (= a b c) :equilateral
      (or (= a b) (= b c) (= a c)) :isosceles
      :else :scalene)))

(defmethod classify-triangle :equilateral [a b c] "equilateral triangle")
(defmethod classify-triangle :isosceles [a b c] "isosceles triangle")
(defmethod classify-triangle :scalene [a b c] "scalene triangle")

(println (classify-triangle 3 3 3))
(println (classify-triangle 3 3 5))
(println (classify-triangle 3 4 5))
```

```
equilateral triangle
isosceles triangle
scalene triangle
```

Verified directly against three genuine triangle shapes: `(3,3,3)` correctly classifies as equilateral, `(3,3,5)` as isosceles, `(3,4,5)` as scalene — with the dispatch function's own logic (comparing all three side lengths) doing real classification work no type check alone could express, since all three calls pass plain numbers of the identical type.

> **Pitfall:** a `defmulti` with no matching `defmethod` for a given dispatch value, and no `:default` method defined, throws a real runtime error rather than silently doing nothing — the same "handle the fallthrough explicitly" discipline this series flagged for COBOL's `WHEN OTHER` and Scheme's `cond` `else` clause, now showing up in a third, structurally different language.

**Practice**

- Add a fourth triangle classification, `:invalid`, for side lengths that can't form a real triangle (where one side is ≥ the sum of the other two), and a matching `defmethod`.

## Dispatch on multiple arguments together

**You'll be able to:** write a multimethod whose dispatch value depends on more than one argument at once.

**Concept**

Because a multimethod's dispatch function can compute anything, it can combine information from *every* argument into one dispatch value — commonly, a vector of each argument's type. This is the capability protocols fundamentally cannot offer: a protocol's `this` is always exactly one designated argument; there's no protocol mechanism for "dispatch based on the types of *both* the first and second arguments together."

**Example**

```clojure
(defmulti combine (fn [a b] [(class a) (class b)]))
(defmethod combine [String String] [a b] (str a b))
(defmethod combine [Long Long] [a b] (+ a b))
(defmethod combine :default [a b] (str "no combo for " a " and " b))

(println (combine "foo" "bar"))
(println (combine 3 4))
(println (combine 3 "bar"))
```

```
foobar
7
no combo for 3 and bar
```

Verified directly: `combine` genuinely dispatches on the *pair* of both arguments' types — `String`+`String` concatenates, `Long`+`Long` adds, and the mismatched `Long`+`String` case correctly falls through to `:default` rather than matching either single-type method. There is no way to express this with `defprotocol`/`extend-type` alone — a protocol method is always attached to and dispatched on one type.

> **Pitfall:** multiple-argument dispatch, while genuinely more expressive than protocols, is also genuinely slower at runtime — a protocol method call resolves through a fast, type-based mechanism the JVM can optimize well; a multimethod's dispatch function runs as an arbitrary function call on *every* invocation. This is a real, worthwhile tradeoff to know about, not a reason to avoid multimethods where their extra expressiveness is actually needed.

**Practice**

- Write a multimethod `describe-pair` dispatching on `[(class a) (class b)]` for at least three different type combinations, including a `:default` case.
- Explain, in your own words, why `defprotocol`/`extend-type` could not express `combine`'s behavior directly, even in principle.

## Progress check

1. What does a multimethod's dispatch function actually compute, compared to a protocol's dispatch mechanism?
2. What happens when a `defmulti` has no matching `defmethod` and no `:default`?
3. Why can't a protocol express dispatch on a combination of two different arguments' types?
4. What real cost does multimethod dispatch's extra flexibility trade against protocol dispatch?
5. In the `combine` example, why did `(combine 3 "bar")` fall through to `:default` rather than matching either the `[String String]` or `[Long Long]` method?

### Answers

1. A multimethod's dispatch function can compute any value at all from its arguments (a classification, a vector of types, anything); a protocol's dispatch mechanism is fixed to checking the runtime type of exactly one designated argument.
2. It throws a real runtime error — there's no silent fallthrough, the same explicit-fallthrough discipline this series has flagged in COBOL and Scheme.
3. Because a protocol method is always attached to and dispatched through exactly one type (the receiver); there's no protocol-level mechanism for combining information from more than one argument into a single dispatch decision.
4. Runtime speed — a protocol method call resolves through a fast, type-based mechanism; a multimethod's dispatch function runs as a genuine function call on every single invocation, which is real overhead relative to protocol dispatch.
5. Because its dispatch value, `[(class 3) (class "bar")]` = `[Long String]`, doesn't match either the `[String String]` or `[Long Long]` method's declared dispatch value — only `:default` matches when no more specific `defmethod` applies.
