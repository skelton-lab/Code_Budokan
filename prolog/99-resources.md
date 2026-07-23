# Resources & Cheat Sheet

## References

| Resource | Why it matters |
|---|---|
| [SWI-Prolog documentation](https://www.swi-prolog.org/pldoc/doc_for?object=manual) | The complete manual for this guide's entire anchored toolchain — every library used here (`lists`, `clpfd`, `plunit`) in full depth |
| *The Art of Prolog* (Sterling & Shapiro) | The classic, still-relevant deep reference on the relational/logic-programming way of thinking, beyond any one implementation |
| *Learn Prolog Now!* (Blackburn, Bos, Striegnitz) | A free, thorough, exercise-driven companion text, useful for more practice in the same paradigm this guide covers |
| [SWI-Prolog C API documentation](https://www.swi-prolog.org/pldoc/man?section=foreign) | Module 10's FFI signpost, in full |
| Robert Kowalski's writing on Prolog's origins | The primary-source context for Module 10's history signpost |
| This series' [ALGOL guide](../algol/01-foundations-history.md) | The genuine, unforced source of Capstone 3's central claim: DCGs are executable Backus-Naur Form, and BNF's own origin traces to ALGOL 60 |
| This series' [C guide](../c/00-overview.md) | The other side of Module 10's C-FFI-target signpost — C as the thing every other language in this series eventually needs to call into or be called from |

## One-page cheat sheet

| Idea | Where |
|---|---|
| Facts, rules, queries, unification | Module 1 |
| Terms: atoms, numbers, variables, compound terms | Module 1 |
| SWI's `=` has no occurs check by default; `unify_with_occurs_check/2` does | Module 1 |
| Recursive rules, backtracking, `findall/3`, `forall/2` | Module 2 |
| Lists: `[H\|T]`, `member/2`, `append/3` (multi-directional), `length/2` | Module 2 |
| `plunit`: `:- begin_tests(Name)` / `test(name) :- Goal.` / `:- end_tests(Name)` | Capstone 1 (Module 3) |
| `is/2` (evaluates) vs. `=` (unifies, no evaluation) vs. `=:=`/`==` | Module 4 |
| `between/3`, generate-and-test, `once/1`, constrain-before-generate | Module 4 |
| `library(clpfd)`: `ins`, `#=`, `#\=`, `all_different/1`, `label/1` | Capstone 2 (Module 5) |
| Difference lists: `Full-Remainder` pairs, O(1) concatenation | Module 6 |
| DCGs: `-->`, terminals `[x]`, nonterminals, `phrase/2`, `{ Goal }` | Module 6 |
| Left-associative accumulator pattern (`expr_rest`/`term_rest`) | Capstone 3 (Module 7) |
| Cut (`!`): green (optimization only) vs. red (correctness-load-bearing) | Module 8 |
| If-then-else: `( Cond -> Then ; Else )` | Module 8 |
| Negation-as-failure `\+/1` — sound only when the goal is fully bound | Module 8 |
| `assert(z\|a)/1`, `retract/1`, `retractall/1`, `:- dynamic` | Module 8 |
| Static rules over a dynamic fact base | Capstone 4 (Module 9) |

## Verification technique used throughout this guide

```bash
swipl -q -f file.pl -g "Goal, format('~w~n', [Result]), halt." -t "halt."
```

Load a file, run a goal, print what actually happened, exit cleanly — this guide's answer to "run it and check," adapted for a language whose unit of work is a query against a database rather than a value returned from a function call. Every code example, every measured timing (Capstone 2's N=8/10/11 numbers), and every quiz answer in this guide was checked this way, not predicted from how the syntax looked like it should behave.

## Where to go now

Prolog closes out as the series' first genuinely different paradigm — no assignment, no imperative control flow as the default, search and unification doing the work every other guide's loops and function calls did. The one direct thread it picked up from earlier in the series wasn't polymorphism or operator overloading (neither has a clean Prolog analogue, and this guide didn't force one) — it was BNF, all the way back to the ALGOL guide's history module, made executable rather than just descriptive. From here, per this series' stated sequencing (`INDEX.md`): **SQL** next, then a Python/PyTorch/Keras group, with Docker alongside it as a fundamental (non-language) deployment technology worth its own guide.
