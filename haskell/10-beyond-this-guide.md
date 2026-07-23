# Module 10 — Beyond This Guide

Every topic here failed the capstone-impact test — real, worth knowing exists, but not required by any of this guide's four capstones. Each entry states what it is, why it matters, and where to go deeper.

### The full `Functor`/`Applicative`/`Monad` hierarchy

**What it is:** this guide used `Maybe`/`Either`/`IO`'s do-notation concretely without naming the abstract type-class hierarchy underneath it — `Functor` (`fmap`, mapping a function over a wrapped value), `Applicative` (`<*>`, combining wrapped values with a wrapped function), and `Monad` (the do-notation mechanism itself).

**Why it matters, verified directly:**
```haskell
print (fmap (+1) (Just 5))       -- Just 6
print (fmap (+1) Nothing)        -- Nothing
print ((+) <$> Just 3 <*> Just 4) -- Just 7
```
Confirmed working — `fmap`/`<$>`/`<*>` are the more general, composable operations do-notation is convenient sugar for. Every `Maybe`/`Either`/`IO` computation in this guide could be rewritten using these operators directly, without `do` at all — genuinely useful to know exists, but this guide's capstones never needed the fully general, abstract hierarchy to work correctly.

**Where to go next:** *Learn You a Haskell for Great Good!* (Lipovača) — freely available online, and the canonical friendly introduction to this exact hierarchy.

### Monad transformers

**What it is:** a technique for combining multiple monadic effects (say, `IO` *and* `Either` together, so an interactive program's IO actions can also short-circuit on a domain error) into one composed type.

**Why it matters:** Capstone 4 handled this by keeping `IO` and `Either` in genuinely separate functions (`main`'s `IO` calling the pure `average`'s `Either`) rather than combining them into one monadic stack — a real, valid design choice for this guide's scope, but monad transformers are how larger, real Haskell programs handle this more systematically.

**Where to go next:** the `mtl` (Monad Transformer Library) package documentation.

### Space leaks and lazy-evaluation performance pitfalls

**What it is:** Module 1's own laziness guarantee — nothing evaluates until demanded — has a real, well-known dark side: a long chain of unevaluated *thunks* (deferred computations) can accumulate in memory, causing genuine, hard-to-diagnose performance problems (a classic case: a naive `foldl` over a large list building up a huge unevaluated addition chain instead of a running total).

**Why it matters:** this guide focused entirely on *correctness* under laziness, verified directly and precisely — it did not measure or address *performance* under laziness at all, a real, honest gap given how central this exact tradeoff is to writing production Haskell.

**Where to go next:** the "Haskell Performance" chapter of *Real World Haskell* (freely available online); `foldl'` (strict left fold) as the most common first fix for this exact class of problem.

### GADTs (Generalized Algebraic Data Types)

**What it is:** an extension to ordinary variant types (Haskell calls them "algebraic data types," the identical underlying concept `ocaml/02-adts-pattern-matching.md` covered) letting constructors refine type parameters more precisely than plain ADTs can.

**Why it matters:** genuinely powerful for encoding stronger invariants directly in the type system, the same territory `ocaml/10-beyond-this-guide.md` signposted for OCaml — neither guide's capstones needed this level of type-system sophistication.

**Where to go next:** the GHC user's guide's GADTs chapter.

### Stack and Cabal

**What it is:** Haskell's two major project/dependency management tools — this guide compiled every example directly with `ghc -o binary file.hs`, the same single-file discipline `ocaml/`'s guide used with `ocamlopt`.

**Why it matters:** genuinely necessary the moment a real Haskell project needs external library dependencies or multi-file organization, neither of which this guide's capstones required.

**Where to go next:** the Stack documentation's quick-start guide.

## The wider ecosystem

- **[GHC User's Guide](https://downloads.haskell.org/ghc/latest/docs/users_guide/)** — the anchored toolchain's own authoritative reference.
- **_Learn You a Haskell for Great Good!_** (Miran Lipovača) — freely available online, the canonical friendly full introduction.
- **This series' [OCaml guide](../ocaml/00-overview.md)** — the direct, matched counterpoint this entire guide was written against.
- **This series' [Clojure guide](../clojure/08-sequence-abstraction-laziness.md)** — the opt-in-laziness comparison Capstone 1 drew on directly.
