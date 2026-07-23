# ALGOL — A Historical & Conceptual Study Guide

**Promise:** this guide is shaped differently from every other guide in this series, deliberately. There's no "ship a working program in ALGOL" promise — nobody builds production software in it in 2026. The actual promise: understand ALGOL 60's pivotal contributions well enough to recognize them everywhere downstream — block structure (`{ }` scoping in every C-family language descends from ALGOL's `begin...end`), the first language specification formally written in BNF (Backus-Naur Form, named for two of ALGOL's own designers), and the first mainstream language with genuine recursion. Positioned, per your own sequencing, between the Fortran and C guides — read this before C to see exactly where C's block structure actually came from.

**Audience:** comfortable with Fortran fundamentals (this series' `fortran/` companion). No prior ALGOL assumed.

**The toolchain reality — read this before anything else:**

There is no maintained ALGOL **60** compiler available to install and verify against. What's installed and verified here is **[Algol 68 Genie](https://jmvdveer.home.algol68genie.nl/)** (`a68g`) — a real, actively maintained interpreter, but for ALGOL **68**, a later (1968), related but genuinely distinct standard from the historically pivotal ALGOL **60** this guide is actually about.

That split runs through the whole guide, and every module says explicitly which side of it applies:

- **Executed and verified** via `a68g`: block structure, lexical scoping, recursion, `for` loops, arrays — all shared cleanly enough between the two standards to verify directly.
- **Documented, not executed**: call-by-name and Jensen's Device (ALGOL 60 features ALGOL 68 doesn't have — it uses a different, explicit parameter-passing model), and the dangling-else problem (ALGOL 60's famous ambiguity — ALGOL 68 actually *fixed* it with mandatory `FI`/`OD` closing keywords, verified directly as a contrast). These are sourced from the actual 1960 ALGOL 60 Report and well-established secondary sources, not reasoned through from first principles.

One genuinely interesting finding from actually installing the toolchain: `a68g` requires reserved words in **UPPERCASE** by default (`BEGIN`, not `begin`) — this is a real historical convention called **stropping** (Module 1), not a toolchain quirk.

## Module list

1. **Foundations & historical context** — why ALGOL matters, stropping conventions, toolchain setup
2. **Block structure and lexical scoping** — verified
3. **Procedures and recursion** — verified; contrasted with early Fortran's lack of it
4. **Control structures and the dangling-else problem** — ALGOL 60's ambiguity (documented) vs. ALGOL 68's fix (verified)
5. **Parameters: call-by-value vs. call-by-name, and Jensen's Device** — documented, not executed
6. **Arrays and data** — verified
7. **Small demonstrations** — combining the above (not "capstones" in the usual sense — the territory here is narrower by design)
8. **Beyond this guide** — signposts, including explicit forward pointers into the Simula and Smalltalk guides that now exist as this series' next stops
9. **Final assessment** + **Resources**

## Setup

```bash
brew install algol68g
a68g --version
```

```bash
a68g program.a68
```
