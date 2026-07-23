# Prolog — A Session-Based Study Guide

**Promise:** read, write, and maintain real Prolog — model a problem as relations rather than procedures, use backtracking and search deliberately instead of stumbling into it, know precisely when and why to reach for cut and negation-as-failure and exactly where their sharp edges are, and recognize Definite Clause Grammars as a genuinely different way to build a parser: a grammar that *is* the program, not a description of one.

**Audience:** this series' existing reader — fluent in C, C++, JavaScript, Ruby, and Smalltalk already, encountering Prolog as the series' first genuinely different (logic/declarative) paradigm. This guide does not re-teach what recursion or a variable is; it leans entirely into what's actually novel here: unification, backtracking-as-search, "there is no assignment," and the specific, real gotchas that trip up experienced imperative programmers on first contact with this model.

**Toolchain (anchored):** **SWI-Prolog 10.0.2** via Homebrew, invoked as `swipl`. Confirmed installed and working locally (`brew install swi-prolog`). It's the actively maintained, ISO-plus-extensions default and ships the two libraries this guide's capstones specifically need: `clpfd` (constraint logic programming over finite domains, Capstone 2's extension) and `plunit` (predicate-level testing, this guide's instance of the series' running verification-discipline thread). GNU Prolog (a lighter, strictly-ISO, natively-compiled alternative) and SICStus (the commercial, industry-standard implementation) are name-checked once here and once in the Beyond This Guide module — this guide builds no parallel cross-toolchain track.

**A methodology note specific to this language:** every prior guide in this series taught a variant of "how do I compute a value." Prolog's actual unit of work is a *query against a database of relations*, resolved by search — the verification technique changes to match. Instead of "run this and check the output," most examples here are verified as `swipl -q -f file.pl -g "Goal, format(...), halt." -t "halt."` — load a file of facts/rules, run a goal, print what actually happened. Every code example in this guide was run this way and its actual output recorded, not predicted from how the syntax "should" behave — a discipline this series has needed before (00-overview.md's counterpart note in the Fortran and 6502 guides both flag a real error the author shipped by trusting a plausible-looking pattern instead of running it).

## Capstone log

| # | Capstone | Proves |
|---|---|---|
| 1 | Kinship knowledge base | Facts vs. rules, unification, backtracking, recursive predicates, `findall/3` |
| 2 | N-Queens / cryptarithmetic solver | Arithmetic (`is` vs. `=`), generate-and-test search, `between/3`, cut-for-pruning, goal-ordering — then the same problem again, idiomatically, with `clpfd` |
| 3 | DCG arithmetic-expression parser/evaluator | Difference lists, `-->` grammar rules, `phrase/2` |
| 4 | Rule-based expert system | Cut semantics (green vs. red), if-then-else, negation-as-failure's real unsoundness gotcha, `assert`/`retract`/`:- dynamic` — Prolog's one form of mutable state in an otherwise stateless paradigm |

Capstone 3's DCG notation is a direct, unforced callback to this series' own history module: `algol/01-foundations-history.md` credits ALGOL 60's 1960 report as the origin of Backus-Naur Form and states plainly that "every language in this series" describes its grammar with a BNF descendant. Prolog is the one guide in the series where that's true of the *running code*, not just the documentation — a DCG rule is executable BNF.

## Module list

1. **Foundations** — facts, rules, queries, terms (atoms/numbers/variables/compound terms), unification → sets up Capstone 1
2. **Recursion, backtracking & lists** — recursive predicates, `;` backtracking at the toplevel, `findall/3`, list basics → feeds Capstone 1
3. **Capstone 1** — Kinship knowledge base, with a `plunit` example
4. **Arithmetic & search** — `is` vs. `=`, `=:=`/`==` vs. structural equality, `between/3`, generate-and-test, `once/1`, goal-ordering → feeds Capstone 2
5. **Capstone 2** — N-Queens/cryptarithmetic, plus a `clpfd` extension
6. **Difference lists & DCGs** — the grammar notation, `phrase/2` → feeds Capstone 3
7. **Capstone 3** — DCG arithmetic parser/evaluator
8. **Control and mutable state** — cut, if-then-else, negation-as-failure, `assert`/`retract`/`:- dynamic` → feeds Capstone 4
9. **Capstone 4** — Rule-based expert system
10. **Beyond this guide** — signposts only
11. **Final assessment** + **Resources**

## Ecosystem-breadth triage

| Topic | Capstone-impact test | Treatment |
|---|---|---|
| `clpfd` (constraint logic programming) | Directly changes Capstone 2's outcome — the idiomatic, efficient way real Prolog solves this class of problem | **Full**, as a Capstone 2 extension rather than a bolted-on separate unit |
| Predicate-level testing (`plunit`) | Cheap, real, continues the series' verification-discipline thread (Fortran's `check()`, C/C++'s sanitizers, JS's `bun test`, Ruby's `minitest`) | **Full but light**, folded into Capstone 1's module |
| Goal-ordering / search performance | Directly affects whether Capstone 2's solver finishes in reasonable time | **Full**, Module 4 |
| SWI's C foreign-function interface | Doesn't touch a capstone, but is this series' "C as universal FFI target" thread from the other side | **Signpost** |
| The module system (`:- module(...)`) | Doesn't touch a capstone at this guide's single-file scale | **Signpost** |
| WAM internals, clause indexing, last-call optimization | Doesn't change a capstone's correctness (goal-ordering, which does, is taught directly) | **Signpost** |
| Other Prolog systems (GNU Prolog, SICStus, Trealla) | Doesn't touch a capstone | **Signpost**, name-check only |
| CHR / broader constraint-logic programming beyond `clpfd` | Doesn't touch a capstone | **Signpost** |
| Prolog's AI-history context (expert systems, the AI winter, Datalog/answer-set programming lineage) | Doesn't touch a capstone | **Signpost**, with historical color |

## Setup

```bash
brew install swi-prolog
swipl --version   # confirmed: SWI-Prolog version 10.0.2 for arm64-darwin
```

Verification pattern used throughout this guide — load a file, run a goal, print the result, exit cleanly:

```bash
swipl -q -f file.pl -g "Goal, format('~w~n', [Result]), halt." -t "halt."
```

Interactive toplevel, for exploration:

```bash
swipl file.pl
```
