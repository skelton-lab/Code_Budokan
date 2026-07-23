# C — A Session-Based Study Guide

**Promise:** comprehensive fundamentals of C — enough to read, write, and safely reason about real C code — built as the deliberate bridge from the 6502 assembly track toward C++. Where useful, this guide draws a direct line from a 6502 concept you already have to the C feature that formalizes it; nothing here requires the 6502 guide to make sense on its own.

**Audience:** comfortable programmer; assembly-literate readers will see extra callbacks to that guide, but they're bonus context, not prerequisites.

**Toolchain (anchored):** `clang`, `-std=c17 -Wall -Wextra -fsanitize=address,undefined -g`. On this Mac, `gcc` is aliased to Apple Clang — either command reaches the same compiler. The sanitizer flags are load-bearing, not optional extras: they're the closest thing C has to the safety net a compiler gives you for free in a higher-level language, and this guide's whole verification discipline (Module 4 especially) leans on them to actually *show* a bug, not just describe one. Confirmed working locally — it catches a real null-pointer write with a full diagnostic.

## Capstone log

| \\# | Capstone                                           | Proves                                        | Note                                                                       |
| --- | -------------------------------------------------- | --------------------------------------------- | -------------------------------------------------------------------------- |
| 1   | Growable dynamic array (`malloc`/`realloc`/`free`) | Heap allocation, ownership                    | The thing 6502 code never had — fixed-size arrays only                     |
| 2   | Singly linked list                                 | Pointers, structs, manual traversal           |                                                                            |
| 3   | Tiny stack-based bytecode VM                       | Structs, function-pointer dispatch loop       | Same shape as a hand-built 6502 command dispatcher, one level up           |
| 4   | File-based key-value tool                          | Parsing, strings, file I/O, ties 1–2 together | A real, small, useful program                                              |
| 5   | Polymorphic shapes via manual vtables              | Structs of function pointers as dispatch      | **Deliberate close** — this is what a C++ compiler generates for `virtual` |

## Module list

1. **Foundations** — first program, types and `sizeof`, operators, control flow
2. **Pointers and the memory model** — pointers as addresses, pointer arithmetic, arrays-as-pointers, stack vs. heap
3. **Structs and data layout** — array-of-structs vs. struct-of-arrays, padding and alignment
4. **Dynamic memory** — `malloc`/`realloc`/`free`, ownership, the classic bugs, sanitizers as the verification tool → feeds Capstones 1, 4
5. **Functions, function pointers, and undefined behavior** — function pointers → feeds Capstones 3, 5; a dedicated UB session; the preprocessor, briefly
6. **Multi-file projects & build tooling** — headers, header guards, separate compilation, a minimal Makefile
7. **Capstones** — all five
8. **Beyond this guide** — signposts: concurrency, C as the universal FFI target, deeper undefined behavior, C23 vs. C17, Valgrind
9. **Final assessment** + **Resources**

## Ecosystem-breadth triage

| Topic                              | Test                                                                 | Treatment                      |
| ---------------------------------- | -------------------------------------------------------------------- | ------------------------------ |
| Undefined behavior                 | Core to writing any capstone safely                                  | **Full module** (5)            |
| Build tooling (headers, Makefiles) | Changes how every capstone past one file is structured               | **Full module** (6)            |
| Preprocessor/macros                | Cheap, used constantly in real code                                  | **Folded into Module 5**       |
| Concurrency (pthreads)             | Doesn't touch any of the 5 capstones                                 | **Signpost**                   |
| C as FFI target                    | Doesn't touch a capstone, but closes a loop the Fortran guide opened | **Signpost, cross-referenced** |
| Strict aliasing / deeper UB        | Real, beyond what capstone-safety needs                              | **Signpost**                   |

## Setup

```bash
clang --version     # or: gcc --version -- on macOS this is the same compiler
```

```bash
clang -std=c17 -Wall -Wextra -fsanitize=address,undefined -g program.c -o program
./program
```
