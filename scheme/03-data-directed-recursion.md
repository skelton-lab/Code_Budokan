# Module 3 — Data-Directed Recursion

By the end of this module you'll be able to write predicates and selectors that classify and take apart nested S-expressions representing structured data — the exact technique Capstone 1 uses to walk and rebuild algebraic expressions. Feeds Capstone 1 directly.

## Predicates and selectors over expression structure

**You'll be able to:** write a predicate that recognizes a specific expression shape, and selector functions that name its parts.

**Concept**

Since an algebraic expression like `x + y` can be represented directly as the list `(+ x y)`, "processing an expression" becomes ordinary list processing: check what the first element is (`car`), and pull out the operands by position (`cadr`, `caddr` — shorthand for `(car (cdr expr))` and `(car (cdr (cdr expr)))`). Wrapping this in named predicate/selector functions, rather than writing raw `car`/`cadr` calls everywhere, is what makes the resulting code read like it's about algebra, not about list plumbing.

**Example**

```scheme
(define (sum? expr) (and (pair? expr) (eq? (car expr) '+)))
(define (product? expr) (and (pair? expr) (eq? (car expr) '*)))
(define (addend expr) (cadr expr))
(define (augend expr) (caddr expr))

(display (sum? '(+ x y))) (newline)
(display (product? '(+ x y))) (newline)
(display (addend '(+ x y))) (newline)
(display (augend '(+ x y))) (newline)
```

```
#t
#f
x
y
```

Verified directly: `(+ x y)` correctly classifies as a sum and not a product, and `addend`/`augend` correctly pull out `x` and `y` respectively — `eq?` compares the symbol `+` for identity, distinguishing it from any other operator symbol that might occupy that position.

> **Pitfall:** `(and (pair? expr) (eq? (car expr) '+))` checks `pair?` *first*, deliberately — calling `(car expr)` on something that isn't a pair (a bare number or symbol) is an error, the same `car`-on-`'()` hazard Module 1 already flagged. `and`'s short-circuit evaluation is what makes checking `pair?` before `car` actually safe here, not just stylistically tidy.

**Practice**

- Write `difference?`/`minuend`/`subtrahend` for expressions of the form `(- x y)`, following the same pattern.
- Predict what `(addend 5)` does before running it, given `5` is a bare number, not a sum expression.

## Classifying and recursively walking a nested expression

**You'll be able to:** write a `cond`-based classifier that distinguishes numbers, variables, and compound expressions, and recursively process a tree of arbitrary depth.

**Concept**

`number?` and `symbol?` identify the two "leaf" cases of an expression tree; the predicates from the previous section identify the "branch" cases. A `cond` chain checking each in turn — number, then variable, then each compound form — is the standard shape for any function that needs to process a whole expression tree, not just recognize one node.

**Example**

```scheme
(define (classify expr)
  (cond ((number? expr) 'number)
        ((symbol? expr) 'variable)
        ((sum? expr) 'sum)
        ((product? expr) 'product)
        (else 'unknown)))
(display (classify 5)) (newline)
(display (classify 'x)) (newline)
(display (classify '(+ x 5))) (newline)
(display (classify '(* x y))) (newline)

(define (count-nodes expr)
  (cond ((not (pair? expr)) 1)
        (else (+ 1 (count-nodes (cadr expr)) (count-nodes (caddr expr))))))
(display (count-nodes '(+ x (* y 5)))) (newline)
```

```
number
variable
sum
product
5
```

Verified directly: `classify` correctly distinguishes all four cases, and `count-nodes` correctly recurses into *both* branches of a compound expression, counting `(+ x (* y 5))` as `5` nodes total — the `+`-node itself, `x`, and the three nodes making up `(* y 5)` (the `*`-node, `y`, and `5`). This recursive-descent-into-both-branches shape is exactly what Capstone 1's differentiation function needs, just producing a new expression instead of a count.

> **Pitfall:** `count-nodes` recurses into `(cadr expr)` and `(caddr expr)` unconditionally, assuming every compound expression has exactly two operands — correct for this module's `+`/`*` shape, but it would need generalizing (or a different traversal entirely) for an operator with a different number of operands, like unary negation.

**Practice**

- Extend `classify` to recognize a `difference?` expression as `'difference`, using the predicate you wrote in the previous section.
- Write a function `variables-in` that returns a list of every distinct variable symbol appearing anywhere in a nested expression (hint: you'll need to recurse into both branches, like `count-nodes`, but collect symbols instead of counting).

## Progress check

1. Why does `sum?` check `pair?` before calling `(car expr)`?
2. What do `cadr` and `caddr` each mean as shorthand?
3. What are the two "leaf" cases every expression-classifying `cond` needs to check before checking for compound forms?
4. In the `count-nodes` example, why does `(+ x (* y 5))` count as `5` nodes, not `3`?
5. What assumption does `count-nodes` make about every compound expression it processes, and where would that assumption break?

### Answers

1. Because `(car expr)` is an error if `expr` isn't a pair — checking `pair?` first, combined with `and`'s short-circuit evaluation, means `car` is never called on something that can't safely receive it.
2. `cadr` is shorthand for `(car (cdr expr))` — the second element; `caddr` is shorthand for `(car (cdr (cdr expr)))` — the third element.
3. `number?` (a literal numeric value) and `symbol?` (a variable name) — every other case in this module's classifier is a compound expression built from operators applied to sub-expressions.
4. Because `count-nodes` counts every node in the tree, not just the top-level elements: the `+`-node itself (1), `x` (1), and the entire `(* y 5)` sub-expression (3 more: the `*`-node, `y`, and `5`) — `1 + 1 + 3 = 5`.
5. It assumes every compound expression has exactly two operands, accessed via `cadr`/`caddr` — this breaks for an operator with a different arity, like unary negation (one operand) or a function call with three or more arguments.
