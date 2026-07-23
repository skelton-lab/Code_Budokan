# Forth — A Session-Based Study Guide

**Promise:** read and write real Forth — RPN/stack-based computation, defining new words as the language's fundamental unit of abstraction, structured control flow, and Forth's own answer to language-oriented programming: `CREATE`/`DOES>`, letting a program define entirely new *classes* of words with custom behavior. This is a direct parallel, at the vocabulary level, to `racket/`'s custom-`#lang` capstone at the whole-language level — the same instinct (extend the language itself, rather than merely using it), expressed by a language designed in 1970, decades before Racket's own take on the same idea.

**Audience:** this series' existing reader, meeting a genuinely sixth paradigm — stack-based/concatenative programming — after procedural (`c/`), object-oriented (`simula/`/`smalltalk/`/`cpp/`), logic (`prolog/`), and two functional-language arcs (Scheme/Racket/Clojure, OCaml/Haskell). No prefix or infix expressions anywhere in this guide; no operator precedence; every computation is a sequence of operations on a shared stack.

**Toolchain (anchored):** **GForth 0.7.3** (Homebrew: `brew install gforth`). Every example runs as `gforth file.fs`.

**A methodology note specific to this language:** Forth trusts the programmer more completely than any other language in this series. A word declared to need two stack arguments and given only one doesn't fail to compile, doesn't raise a typed exception, doesn't return `None`/`Nothing` — it produces a raw runtime `Stack underflow` the moment it actually runs, verified directly against this guide's own toolchain. There is no static type checking, no arity checking, no compile-time safety net of any kind beyond what a programmer chooses to write by hand. This isn't a limitation to route around quietly — it's a genuine, deliberate design point this guide states directly, the same honesty this series applied to every other language's real tradeoffs.

## Capstone log

| # | Capstone | Proves |
|---|---|---|
| 1 | A Stack-Based Calculator | RPN arithmetic, `DUP`/`DROP`/`SWAP`/`OVER`, a real vocabulary built word-by-word, with the verified stack-underflow finding as the central "no safety net" lesson |
| 2 | A Number-Classifying Loop Program | Structured control flow and `VARIABLE`-based state, built into a real FizzBuzz-style program |
| 3 | Defining New Defining Words | `CREATE`/`DOES>`, building a working constant-maker and array-maker — Forth's own self-extension mechanism |

## Module list

1. **Foundations: The Stack & RPN** — arithmetic, `DUP`/`DROP`/`SWAP`/`OVER`/`.S`, the verified stack-underflow finding → sets up Capstone 1
2. **Defining Words: `:` and `;`** — building vocabulary → feeds Capstone 1
3. **Capstone 1** — A Stack-Based Calculator
4. **Control Flow** — `IF`/`THEN`, `DO`/`LOOP`, `BEGIN`/`UNTIL` → feeds Capstone 2
5. **Variables & Memory** — `VARIABLE`, `@`, `!` → feeds Capstone 2
6. **Capstone 2** — A Number-Classifying Loop Program
7. **The Return Stack** — `>R`/`R>` → feeds Capstone 3
8. **`CREATE` and `DOES>`: Defining New Defining Words** → feeds Capstone 3
9. **Capstone 3** — Custom Defining Words
10. **Beyond This Guide** — signposts only
11. **Final Assessment** + **Resources**

## Ecosystem-breadth triage

| Topic | Capstone-impact test | Treatment |
|---|---|---|
| Forth's real embedded/spacecraft/Open Firmware history | Doesn't touch a capstone, but a genuine, notable practical hook | **Signpost** |
| Immediate words / compile-time metaprogramming beyond `DOES>` | Doesn't touch a capstone; genuinely deeper self-extension territory | **Signpost** |
| Local variables (`{ ... }`) | Doesn't touch a capstone | **Signpost** |
| Floating point | Doesn't touch a capstone | **Signpost** |
| ANS Forth standard vs. GForth-specific extensions | Doesn't touch a capstone | **Signpost**, named honestly |

## Setup

```bash
brew install gforth
gforth --version   # confirmed: gforth 0.7.3
```

Verification pattern used throughout this guide:

```bash
gforth file.fs
```

Every script ends with `bye` to exit cleanly after running.
