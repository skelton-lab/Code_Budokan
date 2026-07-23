# C++ — A Session-Based Study Guide

**Promise:** comprehensive C++ fundamentals, built as the deliberate close of the "6502 → C → C++" systems track. Every module answers a specific question: what does this C++ feature automate over what you already built by hand in C (or, for operator overloading, in Fortran)? Where a feature's history runs deeper than C, this guide traces it further back — `class` and `virtual` specifically descend from Simula (1967) by way of a direct, primary-sourced line through Bjarne Stroustrup's own account of what led him to write "C with Classes." If you've read this series' `algol/`, `simula/`, and `smalltalk/` guides, those callbacks will land immediately; if not, they're pointed to inline wherever they matter.

**Audience:** comfortable with C fundamentals (this guide's own `c/` companion). No prior C++ assumed.

**Toolchain (anchored):** `clang++ -std=c++20 -Wall -Wextra -fsanitize=address,undefined -g`. C++17 is name-checked as the fallback for an older real-world toolchain; C++23 as the current edge. Confirmed working locally.

## Capstone log

| # | Capstone | Proves | Callback |
|---|---|---|---|
| 1 | RAII wrapper (mini smart pointer) | Constructors/destructors, exception safety | C Module 4's manual `malloc`/`free` discipline |
| 2 | Shapes, rebuilt with real inheritance | `virtual`, abstract base classes | Directly re-solves C Capstone 5 — and directly descends from Simula's `Virtual` procedures (same word, same mechanism, three decades earlier) |
| 3 | Generic container (template class) | Templates vs. type erasure | C Capstone 1 + its `void*` genericize practice problem |
| 4 | `Vec2`/`Fraction` with overloaded operators | `operator+`, `operator==` | Fortran's `interface operator(+)` |
| 5 | C bytecode VM / key-value tool, rebuilt with STL | `vector`/`map`/`string`, algorithms, lambdas | What the standard library gives you over C Capstones 1–4 |

## Module list

1. **Foundations: from C to C++** — `class`/`struct`, references vs. pointers, `iostream`, namespaces
2. **Classes and RAII** — constructors/destructors, exceptions and stack unwinding → Capstone 1
3. **Inheritance and polymorphism** — `virtual`, abstract classes → Capstone 2; where `virtual` actually comes from (Simula, directly)
4. **Templates and generic programming** → Capstone 3
5. **Operator overloading** → Capstone 4
6. **Move semantics and smart pointers** — `std::move`, `unique_ptr`/`shared_ptr` → extends Capstone 1
7. **The STL** — containers, algorithms, iterators, lambdas → Capstone 5
8. **Multi-file projects & CMake**
9. **Capstones** — all five
10. **Beyond this guide** — signposts
11. **Final assessment** + **Resources**

## Ecosystem-breadth triage

| Topic | Test | Treatment |
|---|---|---|
| Move semantics | Central to modern ownership, extends Capstone 1 | **Full module** (6) |
| Exceptions | The actual reason RAII matters | **Folded into Module 2** |
| Lambdas | Used constantly with STL algorithms | **Folded into Module 7** |
| Multiple inheritance / diamond problem | Doesn't touch a capstone | **Signpost** |
| Concurrency (`std::thread`) | Doesn't touch a capstone; C signposted `pthreads` | **Signpost, cross-referenced** |
| Templates metaprogramming / concepts | Beyond what Capstone 3 needs | **Signpost** |

## Setup

```bash
clang++ -std=c++20 -Wall -Wextra -fsanitize=address,undefined -g program.cpp -o program
./program
```
