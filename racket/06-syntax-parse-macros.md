# Module 6 — Beyond `syntax-rules`: `syntax-parse`

By the end of this module you'll be able to write a macro using `syntax-parse`, give it an optional keyword argument, and produce a genuinely helpful compile-time error message for malformed input — none of which `syntax-rules` (`scheme/09-hygienic-macros.md`) does as directly. Feeds Capstone 3.

## `syntax-parse`: syntax classes and real error messages

**You'll be able to:** write a `syntax-parse`-based macro using typed syntax classes (`expr`), and compare its error output directly against an equivalent `syntax-rules` macro's.

**Concept**

`syntax-parse` (from `racket/syntax`) is Racket's more powerful successor to the `syntax-rules` this series' `scheme/` guide covered — same fundamental idea (pattern-match unevaluated syntax, produce new syntax), but with **syntax classes** (`expr`, `id`, and others) annotating what *kind* of syntax each pattern variable should match, which is exactly what lets it report specific, actionable errors instead of a generic "no matching clause."

**Example**

```racket
(require (for-syntax racket/base syntax/parse))

(define-syntax (my-if2 stx)
  (syntax-parse stx
    [(_ c:expr t:expr e:expr)
     #'(cond [c t] [else e])]))

(displayln (my-if2 (> 3 2) 'yes 'no))
```

```
yes
```

**The error-message contrast, verified directly** — a macro requiring exactly three expressions, called with only two:

```racket
(define-syntax (needs-three stx)
  (syntax-parse stx
    [(_ a:expr b:expr c:expr) #'(list a b c)]))
(displayln (needs-three 1 2))
```

```
needs-three: expected more terms starting with expression
  at: ()
  within: (needs-three 1 2)
```

Verified directly: the error names *exactly* what's missing ("expected more terms starting with expression") and *where* ("within: (needs-three 1 2)") — genuinely more actionable than `syntax-rules`' typical "no matching clause" for the same kind of mistake, because `syntax-parse` knows each pattern variable's expected syntax class and can report precisely which one failed to match, rather than just failing the whole pattern silently.

> **Pitfall:** `syntax-parse` requires `(require (for-syntax racket/base syntax/parse))` — the `for-syntax` phase-level import matters here specifically because macros run at *compile time*, a distinct phase from the ordinary runtime `require`s the rest of this guide's code uses; forgetting `for-syntax` produces its own, different error about `syntax-parse` being unbound in the wrong phase.

**Practice**

- Rewrite one of `scheme/09-hygienic-macros.md`'s `syntax-rules` macros (`my-unless`, say) using `syntax-parse` and `expr` syntax classes, and compare the two versions' error output when called with a missing argument.

## Keyword arguments in a macro, via `~optional`

**You'll be able to:** give a macro an optional keyword argument with a default value.

**Concept**

`~optional` (combined with `~seq` for a keyword-plus-value pair) lets a `syntax-parse` pattern accept an argument that may or may not be present, with `#:defaults` supplying a value when it's omitted — a genuinely awkward thing to express with plain `syntax-rules`, which has no built-in concept of "this piece is optional" beyond writing out separate pattern clauses for every combination by hand.

**Example**

```racket
(define-syntax (greet stx)
  (syntax-parse stx
    [(_ name:expr (~optional (~seq #:greeting g:expr) #:defaults ([g #'"Hello"])))
     #'(string-append g ", " name "!")]))

(displayln (greet "Ada"))
(displayln (greet "Ada" #:greeting "Hi"))
```

```
Hello, Ada!
Hi, Ada!
```

Verified directly: calling `greet` without `#:greeting` falls back to `"Hello"` (the `#:defaults` value); supplying `#:greeting "Hi"` overrides it — both handled by a *single* pattern clause, not two separate ones for "with keyword" and "without."

> **Pitfall:** `~optional`'s default (`#:defaults ([g #'"Hello"])`) supplies **syntax**, not a plain value — note the `#'` before `"Hello"`, converting the literal into syntax the macro's expansion can splice in directly. Forgetting the `#'` here is a real, easy mistake, since everywhere else in ordinary Racket code `"Hello"` is just a plain string value, not something needing to be wrapped as syntax.

**Practice**

- Add a second optional keyword argument (`#:punctuation`, defaulting to `"!"`) to `greet`, and confirm all four combinations (both omitted, either one supplied, both supplied) work correctly.

## Progress check

1. What does a syntax class like `expr` in a `syntax-parse` pattern actually annotate?
2. Why did `needs-three`'s error message name specifically what was missing, rather than just failing silently?
3. What does `for-syntax` in a `require` line signal, and why does `syntax-parse` specifically need it?
4. What does `~optional` combined with `#:defaults` let a macro's pattern do that plain `syntax-rules` can't easily express?
5. Why does `#:defaults ([g #'"Hello"])` need `#'` before `"Hello"`, rather than just writing the bare string?

### Answers

1. It annotates what *kind* of syntax that pattern variable is expected to match (an expression, an identifier, etc.) — this is exactly what lets `syntax-parse` report which specific piece failed to match and why, rather than failing the whole pattern as an undifferentiated mismatch.
2. Because `syntax-parse` tracks each pattern variable's expected syntax class and reports precisely which expected piece is missing from the actual input, rather than just reporting that no pattern clause matched at all.
3. It signals that the imported bindings are needed at compile time (the phase macros themselves run in), not at ordinary runtime — `syntax-parse` is a macro-writing tool, so anything using it needs to be available during that compile-time expansion phase, not just when the resulting program actually runs.
4. Accepting an argument that may or may not be present, with a fallback value when it's omitted, expressed as a single pattern clause — `syntax-rules` has no equivalent optionality construct, requiring separate pattern clauses written out by hand for every present/absent combination.
5. Because the default needs to be **syntax** the macro's expansion can splice directly into the output template, not a plain runtime value — `#'` converts the literal into syntax; omitting it would be a type mismatch between what `#:defaults` expects and a bare string value.
