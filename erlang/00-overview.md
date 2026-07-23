# Erlang — A Session-Based Study Guide

**Promise:** read and write real Erlang — leaning into a direct, documented historical connection this series can finally cash in: Erlang's first implementation was literally written in Prolog (Ericsson, 1986), and its syntax still shows it. Single-assignment pattern matching, multi-clause functions, and `[H|T]` list notation are borrowed directly from Prolog, not merely similar in spirit. From there: the actor model — genuine share-nothing concurrency via message passing, a real structural contrast to Clojure's shared-memory `atom` — and Erlang's most famous design principle, "let it crash," made concrete with a working supervisor rather than left as a quoted slogan.

**Audience:** this series' existing reader, arriving via `prolog/` with unification and multi-clause predicates already familiar. This guide treats that as direct preparation, not coincidence — Module 1 verifies the connection precisely rather than asserting it.

**Toolchain (anchored):** **Erlang/OTP 29.0.3** (Homebrew: `brew install erlang`). Every example compiles with `erlc file.erl` and runs via `erl -noshell -s module main -s init stop`.

**A methodology note specific to this language:** this guide's own Capstone 3 went through a real, live debugging process worth naming directly. A first attempt at a supervisor used a globally registered process name (`register(myworker, Pid)`) so an external caller could keep messaging "the current worker" across restarts — and hit a genuine race condition: re-registering a name immediately after the previous holder crashed could fail or hang, depending on exact timing between the crash notification and the respawn. Rather than patching around it with longer sleeps, the capstone was redesigned to avoid the race entirely — the supervisor demonstrates the crash-detect-restart cycle self-contained, with no external synchronization needed at all. The race condition itself isn't shown in the shipped capstone, but the reasoning that led away from it is worth stating: an easy-to-reach-for synchronization pattern (fixed sleeps between actions) is a real, common source of exactly this kind of flaky bug in concurrent Erlang code.

## Capstone log

| # | Capstone | Proves |
|---|---|---|
| 1 | Pattern Matching: Prolog's Direct Descendant | Single-assignment `=`, multi-clause functions, tuple and `[H\|T]` list matching, verified side by side against `prolog/`'s own syntax |
| 2 | A Stateful Counter Process | `spawn`/`!`/`receive` — genuine share-nothing concurrency, a direct structural contrast to `clojure/06-value-vs-identity-atoms.md`'s shared-memory model |
| 3 | A Self-Healing Supervisor | A real, verified crash-detect-restart loop — "let it crash," made concrete |

## Module list

1. **Foundations: Single-Assignment Variables & Pattern Matching** — `=` as unification, not assignment → sets up Capstone 1
2. **Multi-Clause Functions & Guards** — multiple function heads, `[H|T]` list matching, tuple matching → feeds Capstone 1
3. **Capstone 1** — Pattern Matching: Prolog's Direct Descendant
4. **The Actor Model: Processes & Message Passing** — `spawn`, `!`, `receive` → feeds Capstone 2
5. **Capstone 2** — A Stateful Counter Process
6. **Let It Crash: Links, Trapping Exits, and Supervisors** → feeds Capstone 3
7. **Capstone 3** — A Self-Healing Supervisor
8. **Beyond This Guide** — signposts only
9. **Final Assessment** + **Resources**

## Ecosystem-breadth triage

| Topic | Capstone-impact test | Treatment |
|---|---|---|
| Full OTP behaviors (`gen_server`, real `supervisor` module) | Capstone 3 builds the *concept* by hand; production Erlang uses OTP's own battle-tested implementations | **Signpost** |
| Distributed Erlang (multi-node) | Doesn't touch a capstone | **Signpost** |
| Hot code loading | Doesn't touch a capstone, but a genuinely famous Erlang capability | **Signpost** |
| ETS tables (in-memory shared storage) | Doesn't touch a capstone | **Signpost** |

## Setup

```bash
brew install erlang
erl -version   # confirmed: Erlang (SMP,ASYNC_THREADS) (BEAM) emulator version 17.0.3
```

Verification pattern used throughout this guide:

```bash
erlc file.erl
erl -noshell -s module_name main -s init stop
```
