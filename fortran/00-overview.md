# Modern Fortran — A Session-Based Study Guide

**Promise:** by the end, you can read, write, and maintain modern Fortran — including the older code you'll actually encounter in the wild.

**Audience:** comfortable with at least one other programming language; no prior Fortran assumed.

**Toolchain (anchored):** gfortran 13+, `-std=f2008` throughout — `do concurrent` (the parallelism session, Module 6) is itself an F2008 feature; its `reduce()`/locality-specifier extensions are F2018 additions worth knowing about even though this guide's examples don't need them. Build tool: [fpm](https://fpm.fortran-lang.org/) (Fortran Package Manager), introduced once it earns its keep in Module 4. Alternative compiler (Intel `ifx`) and alternative build tools (CMake, Makefiles) are name-checked, not taught in parallel.

**How this differs from a typical "30-day" guide:** there's no calendar. Sessions are grouped by dependency and cognitive load — work through a module in one sitting if you're in flow, or split it across days. The ordinals on filenames (`01-`, `02-`...) are dependency order, not day numbers.

This guide corrects and expands an earlier 30-day draft. The most important fix: that draft's Week 3 quiz claimed `v(::-1)` reverses an array. It doesn't — omitted subscript-triplet bounds default to the array's declared lower/upper bounds regardless of stride sign, so `v(::-1)` returns an **empty section**, not a reversal. That specific error is why this guide has a mandatory verification pass on every code example (see the `StudyGuide` skill's `VerifyGuide` workflow).

## Capstone log

| # | Capstone | What it proves | Fed by modules |
|---|----------|-----------------|-----------------|
| 1 | Statistics CLI | Arrays, sorting, derived types, module design | 1–4 |
| 2 | Numerical quadrature (trapezoidal & Simpson) | Passing procedures as arguments, abstract interfaces | 1–4 |
| 3 | Conway's Game of Life | Whole-array ops, `cshift`, `where`/`elsewhere` | 1–4 |
| 4 | Word-frequency counter | Dynamic arrays, `move_alloc`, string handling | 1–5 |
| 5 | 1-D heat equation solver (+ parallel extension) | PDE discretization, file output, `do concurrent` parallelism | 1–5, parallel extension in 6 |
| 6 | Legacy Fortran modernization | Reading fixed-form/F77 idioms and refactoring them safely | Standalone — needs everything through Module 5 |

Every module below traces to at least one of these. Anything that doesn't gets a signpost in Module 7 instead of silently disappearing.

## Module list

1. **Foundations** — syntax, variables, kinds, operators, I/O, strings, command-line arguments
2. **Control flow** — conditionals, loops, `select case`, the non-short-circuit `.and.`/`.or.` trap
3. **Arrays & formatted output** — 1-D/2-D arrays, allocatable arrays, `where`, the `FORMAT` toolkit, internal I/O
4. **Procedures & modules** — subroutines/functions, `intent`, `pure`/`elemental`/`recursive`, explicit interfaces, introducing `fpm`
5. **Files, pointers, derived types** — file I/O, derived types, operator overloading, pointers, `namelist`
6. **Capstones** — the six projects above, built as an `fpm` project with a lightweight test pattern threaded through
7. **Beyond this guide** — signposted, not taught in depth: C interoperability, OOP/polymorphism beyond operator overloading, MPI/coarrays, IEEE arithmetic, the wider package ecosystem

## Ecosystem-breadth triage

| Topic | Capstone-impact test | Treatment |
|---|---|---|
| Legacy / fixed-form code literacy | Core to "maintain"; gets its own capstone | **Full module** (Capstone 6, Module 6) |
| Parallelism (`do concurrent`) | Directly extends Capstone 5 | **Full session** (Module 6, tied to the heat solver) |
| Build tooling (`fpm`) | Changes how every capstone is actually structured | **Full integration** (introduced Module 4, used throughout Module 6) |
| Testing discipline | Capstones need a way to check themselves | **Full but lightweight** — a minimal assert-style pattern, not a framework deep-dive |
| Operator overloading | Directly assigned as an exercise in the original draft, never taught | **Full session** (Module 5) — this was itself a defect in the source material |
| C interoperability (`iso_c_binding`) | Doesn't change any capstone outcome | **Signpost** (Module 7) |
| OOP / type-bound procedures / polymorphism | Not required by any capstone | **Signpost** (Module 7) |
| MPI / coarrays (distributed parallelism) | Beyond what `do concurrent` covers for the heat solver | **Signpost** (Module 7) |
| IEEE arithmetic, deeper `namelist` | Nice-to-know, not capstone-critical | **Signpost / brief mention** |

## Setup

```bash
# macOS
brew install gcc fpm
# Debian/Ubuntu
sudo apt install gfortran
# fpm: see https://fpm.fortran-lang.org/install/index.html
# Windows: MSYS2, then: pacman -S mingw-w64-ucrt-x86_64-gcc-fortran mingw-w64-ucrt-x86_64-fpm

gfortran --version
fpm --version
```

```bash
$ gfortran -std=f2008 -Wall -Wextra -O2 hello.f90 -o hello
$ ./hello
Hello, Fortran 2008!
```

**Flags worth memorising:** `-std=f2008` (or `-std=f2018` for Module 6's parallel session) enforces standard conformance. `-Wall -Wextra` turns on broad diagnostics. `-fcheck=all -g` adds runtime bounds/array checks for debugging — drop them and add `-O2` for release builds.

## Daily rhythm (however you split it across sessions)

1. Read the concept brief.
2. Type the example by hand — don't paste. Compile, run, then break it on purpose.
3. Solve at least one practice problem before moving on.
4. Note anything you want to revisit; it'll resurface in the next progress check.
