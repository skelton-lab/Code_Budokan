# Resources & Cheat Sheet

## References

| Resource | Why it matters |
|---|---|
| [GForth manual](https://www.gnu.org/software/gforth/manual/) | The anchored toolchain's own authoritative reference |
| *Starting Forth* (Leo Brodie) | Freely available online, the canonical friendly introduction |
| *Thinking Forth* (Leo Brodie) | Freely available online, the philosophy and design-discipline companion to *Starting Forth* |
| This series' [Racket guide](../racket/08-language-oriented-programming.md) | The direct, whole-language-level parallel to this guide's `CREATE`/`DOES>` capstone |

## One-page cheat sheet

| Idea | Where |
|---|---|
| `a b +` — postfix/RPN, no precedence rules, no parentheses | Module 1 |
| `DUP`/`DROP`/`SWAP`/`OVER`/`.S` — the core stack-manipulation vocabulary | Module 1 |
| Stack underflow is a real runtime error — no compile-time arity checking at all | Module 1 |
| `: name ... ;` — the only abstraction mechanism; words are built from words | Module 2 |
| `SQUARE SQUARE` bug — an operator only ever touches the current top, not "the second operand from before" | Capstone 1 |
| `IF ... ELSE ... THEN` — `THEN` means "end if," not "then do this" | Module 4 |
| `limit start DO ... LOOP` — limit is exclusive, argument order is limit-first | Module 4 |
| `BEGIN ... condition UNTIL` — no automatic index; loop state must be tracked explicitly | Module 4 |
| `VARIABLE`/`@`/`!` — persistent storage distinct from the stack | Module 5 |
| `>R`/`R>` — a second stack, genuinely removing a value from the parameter stack's reach | Module 7 |
| `CREATE ... DOES> ...` — defining a word that defines other words, sharing custom behavior | Module 8 |
| Accumulation-pattern bug — the first term of a sum needs no trailing operator, only subsequent ones do | Capstone 3 |

## A note on this guide's verification tier

Every code example in this guide was run against GForth 0.7.3 — no example was written from memory of the language's documentation and left unverified. This guide surfaced two genuine, live-caught bugs during its own capstone construction — a stack-position error in `HYPOT-SQ` (Capstone 1) and an accumulation-pattern error in `WEIGHTED-SUM` (Capstone 3) — both kept in deliberately as teaching material, following this series' own standing practice, precisely because they represent two of the most common real mistakes anyone writing genuinely stack-based code for the first time is likely to make.

## Where to go now

This guide closes out the functional-language path this series opened with `scheme/`, and completes the tour of genuinely distinct programming paradigms alongside `prolog/`'s logic programming and the Scheme/Racket/Clojure and OCaml/Haskell arcs — procedural, object-oriented, logic, two functional lineages, and now stack-based/concatenative, six fundamentally different ways of thinking about computation, each verified by actually running real code. From here, `INDEX.md`'s remaining queued candidates — Julia, Erlang, Go, Rust — are all still open.
