# Capstone 4 — Metacircular Evaluator

Combines every concept from this entire guide: S-expressions as data (Module 1), data-directed recursion over expression structure (Module 3), closures (Module 6), and environments (Module 11) — to build a working Scheme interpreter, written in Scheme, that correctly evaluates its own recursive procedure definitions. This is the canonical SICP capstone, and the moment homoiconicity stops being a slogan and becomes a program you can run.

## The expression-type predicates

Every expression Module 3's `classify` pattern would recognize gets its own predicate and selector functions here, exactly the same technique, applied to Scheme's own syntax instead of algebraic expressions:

```scheme
(define (self-evaluating? expr) (or (number? expr) (string? expr) (boolean? expr)))
(define (variable? expr) (symbol? expr))
(define (tagged-list? expr tag) (and (pair? expr) (eq? (car expr) tag)))
(define (quoted? expr) (tagged-list? expr 'quote))
(define (text-of-quotation expr) (cadr expr))
(define (if? expr) (tagged-list? expr 'if))
(define (if-predicate expr) (cadr expr))
(define (if-consequent expr) (caddr expr))
(define (if-alternative expr) (if (pair? (cdddr expr)) (cadddr expr) #f))
(define (lambda? expr) (tagged-list? expr 'lambda))
(define (lambda-params expr) (cadr expr))
(define (lambda-body expr) (cddr expr))
(define (make-lambda params body) (cons 'lambda (cons params body)))

(define (definition? expr) (tagged-list? expr 'define))
(define (definition-var expr)
  (if (symbol? (cadr expr)) (cadr expr) (caadr expr)))
(define (definition-val expr)
  (if (symbol? (cadr expr))
      (caddr expr)
      (make-lambda (cdadr expr) (cddr expr))))

(define (begin? expr) (tagged-list? expr 'begin))
(define (begin-actions expr) (cdr expr))
(define (application? expr) (pair? expr))
(define (operator expr) (car expr))
(define (operands expr) (cdr expr))
```

`definition-var`/`definition-val` handle **both** definition shapes Scheme allows: `(define x 5)` directly, and the shorthand `(define (square x) (* x x))`, which is really sugar for `(define square (lambda (x) (* x x)))` — `definition-val` builds that equivalent `lambda` form explicitly when it detects the shorthand (`(cadr expr)` being a pair, not a bare symbol).

## `my-eval` and `my-apply`

```scheme
(define-record-type compound-procedure
  (make-procedure params body env)
  compound-procedure?
  (params procedure-params)
  (body procedure-body)
  (env procedure-env))
(define (primitive-procedure? proc) (procedure? proc))

(define (my-eval expr env)
  (cond ((self-evaluating? expr) expr)
        ((variable? expr) (lookup-variable-value expr env))
        ((quoted? expr) (text-of-quotation expr))
        ((if? expr)
         (if (my-eval (if-predicate expr) env)
             (my-eval (if-consequent expr) env)
             (my-eval (if-alternative expr) env)))
        ((lambda? expr) (make-procedure (lambda-params expr) (lambda-body expr) env))
        ((definition? expr)
         (define-variable! (definition-var expr) (my-eval (definition-val expr) env) env)
         'ok)
        ((begin? expr) (eval-sequence (begin-actions expr) env))
        ((application? expr)
         (my-apply (my-eval (operator expr) env)
                   (map (lambda (o) (my-eval o env)) (operands expr))))
        (else (error "Unknown expression type" expr))))

(define (eval-sequence exprs env)
  (cond ((null? (cdr exprs)) (my-eval (car exprs) env))
        (else (my-eval (car exprs) env) (eval-sequence (cdr exprs) env))))

(define (my-apply proc args)
  (cond ((primitive-procedure? proc) (apply proc args))
        ((compound-procedure? proc)
         (eval-sequence (procedure-body proc)
                        (extend-environment (procedure-params proc) args (procedure-env proc))))
        (else (error "Unknown procedure type" proc))))
```

This is the actual eval/apply cycle every real interpreter runs: `my-eval` dispatches on an expression's *shape* (Module 3's technique, applied to Scheme's own grammar); evaluating an application recursively evaluates the operator and every operand, then hands them to `my-apply`; `my-apply` either calls straight through to the *host* Scheme's real procedure (for a primitive like `+`) or — for a user-defined `compound-procedure` — extends its **stored** environment (Module 11's `extend-environment`, capturing exactly the closure behavior Module 6 demonstrated) with the new argument bindings, and evaluates the procedure's body in that new environment.

## Verification

```scheme
(define global-env
  (extend-environment
    '(+ - * / = < > <= >= car cdr cons null? not)
    (list + - * / = < > <= >= car cdr cons null? not)
    the-empty-environment))

(display (my-eval 5 global-env)) (newline)
(display (my-eval '(+ 1 2) global-env)) (newline)
(display (my-eval '(quote (a b c)) global-env)) (newline)
(display (my-eval '(if (> 3 2) 'yes 'no) global-env)) (newline)

(my-eval '(define (square x) (* x x)) global-env)
(display (my-eval '(square 7) global-env)) (newline)

(my-eval '(define (fact n) (if (= n 0) 1 (* n (fact (- n 1))))) global-env)
(display (my-eval '(fact 10) global-env)) (newline)

(my-eval '(define (my-len lst) (if (null? lst) 0 (+ 1 (my-len (cdr lst))))) global-env)
(display (my-eval '(my-len (quote (a b c d e))) global-env)) (newline)
```

```
5
3
(a b c)
yes
49
3628800
5
```

Verified directly, every line checked by hand: self-evaluation, primitive application, `quote`, `if`, and — the real test — two **recursive** user-defined procedures, `fact` and `my-len`, both correctly calling *themselves* through `my-eval`/`my-apply`, with `fact 10` landing on the exactly-correct `3628800` and `my-len` correctly counting a five-element list. That recursive self-reference working correctly is the whole payoff of Module 11's environment chain: when `fact` calls itself inside its own body, that inner reference to the symbol `fact` gets looked up in an environment chain leading back to `global-env`, where `fact` itself was `define!`d — the closure captured *the environment*, not a frozen value, so `fact`'s own later mutation-free redefinition of itself (there isn't one here, but the *mechanism* that would allow it) is genuinely available.

> **The honest scope of this capstone:** this evaluator handles enough of Scheme to prove the eval/apply cycle actually works — self-evaluation, variables, `quote`, `if`, `lambda`, `define` (both shapes), `begin`, and application. It doesn't implement `let`, `cond`, `and`/`or`, tail-call optimization within itself (recursive Scheme calls to `my-eval`/`my-apply` are *not* guaranteed tail calls the way Module 5's native Scheme code is, since `eval-sequence`'s final call *is* in tail position but is running on the *host* Scheme's stack either way), `call/cc`, or macros. Every one of those is a real, substantial addition to a production metacircular evaluator — SICP's own version spends significant additional material on exactly this expansion. This capstone proves the mechanism, not a complete language.

## Extending it yourself

- Add `cond` support, translating it to nested `if`s the way a real Scheme compiler's macro-expansion phase would (this is genuinely how `cond` is often implemented under the hood).
- Add `let`, translating `(let ((x 1) (y 2)) body)` into `((lambda (x y) body) 1 2)` — an actual application, exactly the transformation a real Scheme implementation performs.
- Trace, by hand, exactly what `my-eval`/`my-apply` do step by step for `(square 7)` — write out each recursive call and its result before checking your trace against the verified output above.
