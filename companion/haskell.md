# Companion — Haskell (Budokan Module 14)

**Founding papers:** Hudak, P., Hughes, J., Peyton Jones, S. & Wadler, P. (2007). "A History of Haskell: Being Lazy with Class." *Proceedings of the Third ACM SIGPLAN History of Programming Languages Conference (HOPL III)*. Wadler, P. (1992). "The Essence of Functional Programming." *Proceedings of POPL '92*, 1–14. — both sourced directly from the Code Budokan Reading Workbook, Strand C.

## Historical note

Haskell is a genuinely unusual case among this companion's languages: it was never built to solve one team's practical problem the way FORTRAN, C, or Unix were. A committee of academics set out, in the late 1980s, to design what they believed a "properly" lazy, purely functional language should look like — and the Budokan workbook's own framing is precise: they "accidentally created one of the most influential languages in history — not through deployment but through ideas." `haskell/00-overview.md` states the guide's own organizing contrast directly: laziness as the language's genuine *default* (not `ocaml/`'s eager evaluation, and not Clojure's own opt-in `lazy-seq`), type classes as a third, distinct polymorphism mechanism, and IO handled as a real value in the type system rather than a special case.

Wadler's 1992 paper is the harder read, and the workbook says so plainly: read it "after you have spent 10 hours in Haskell, not before." Monads are the mechanism that lets a purely functional language sequence effectful operations (IO, state, failure) without breaking purity — and `haskell/08-io-as-a-value.md`/`haskell/09-capstone-io-concrete.md` make that concrete: IO as an inert value, only actually executed once connected to `main`'s own action chain, verified directly rather than asserted.

## Reflection prompts

- The Budokan workbook notes that "features that originated in Haskell research... now appear in mainstream languages." `haskell/06-maybe-either-do-notation.md` covers `Maybe`/`Either` directly — where else in `code-rookie` has this series already met the same idea under a different name (consider `rust/04-option-result-panics.md`)?
- Haskell was designed by committee, with no original deployment target at all — the opposite of C's origin story (companion: `c.md`). What does it mean that the language built with *no* practical constraint turned out to be the one whose ideas (lazy evaluation, type classes, monads) diffused most widely into languages that *were* built under practical constraints?

## Short-answer questions

1. **What was genuinely unusual about Haskell's own origin, relative to nearly every other language this companion covers?** It wasn't built to solve a specific team's practical deployment problem — an academic committee designed it as an attempt at the "ideal" lazy, purely functional language, and its influence came through the ideas it introduced, not through Haskell itself being widely deployed.
2. **What real, verified finding does `haskell/08-io-as-a-value.md` establish about IO in Haskell, using a deliberately "sneaky" example?** That an `IO` action is inert data — a function typed `Int -> Int` can embed a `putStrLn` call via `seq` and compile cleanly, but running it never actually prints anything, because an IO action only executes once it's connected to `main`'s own action chain.
3. **What does the Budokan workbook recommend about when to read Wadler's 1992 monads paper, and why?** After spending roughly 10 hours actually writing Haskell, not before — the paper is notoriously difficult to absorb in the abstract, and Haskell's own `do` notation (syntactic sugar for the monadic bind operation Wadler describes) is far more legible once you've used it directly first.

## Links into the guide

- [`haskell/08-io-as-a-value.md`](../haskell/08-io-as-a-value.md) and [`haskell/09-capstone-io-concrete.md`](../haskell/09-capstone-io-concrete.md) — IO as a real value, the concrete payoff of Wadler's own monad paper.
- [`haskell/04-type-classes.md`](../haskell/04-type-classes.md) — the third polymorphism mechanism this series' own thread names precisely.

## Cross-thread connection

The Budokan workbook's own master table pairs Haskell with Wei et al.'s 2022 chain-of-thought paper — "laziness and emergence." The pairing is suggestive rather than mechanically identical: Haskell's own laziness means a computation isn't actually performed until its result is genuinely needed, sometimes producing capabilities (like working with conceptually infinite data structures) that weren't explicitly designed for; chain-of-thought prompting's own core surprise is that simply asking a model to "think step by step" elicits reasoning capability that wasn't explicitly trained for either — both are examples of a real capability emerging from a structural property of the system, rather than being deliberately engineered feature by feature.
