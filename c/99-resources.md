# Resources & Cheat Sheet

## References

| Resource | Why it matters |
|---|---|
| *The C Programming Language* (Kernighan & Ritchie) | The original, still the shortest path to real C fluency |
| [cppreference.com C section](https://en.cppreference.com/w/c) | The most reliable free reference for exact standard behavior |
| Clang/GCC `-Wall -Wextra -fsanitize=address,undefined` docs | The exact toolchain this guide anchors to |
| Apple's `leaks` / Instruments docs | The macOS-specific leak-detection gap this guide hit directly (Module 4) |
| Valgrind docs | The Linux equivalent, with full leak detection |

## One-page cheat sheet

| Idea | Snippet |
|---|---|
| Compile with full checks | `clang -std=c17 -Wall -Wextra -fsanitize=address,undefined -g prog.c -o prog` |
| Pointer basics | `int x = 5; int *p = &x; *p = 10;` |
| Array = pointer arithmetic | `arr[i]` ≡ `*(arr + i)` |
| Struct | `typedef struct { int x, y; } Point;` |
| Heap allocation | `int *p = malloc(n * sizeof(int)); ... free(p);` |
| Grow an allocation | `p = realloc(p, new_n * sizeof(int));` — always reassign |
| Function pointer type | `int (*fp)(int, int);` |
| Dispatch table | `OpFn table[N] = { handler0, handler1, ... }; table[i](args);` |
| Header guard | `#ifndef NAME_H` / `#define NAME_H` / `#endif` |
| Minimal Makefile target | `target: deps` then a **tab**-indented recipe line |
| Manual vtable | struct with a function-pointer member as its *first* field |

## Where to go next

The direct continuation of this track is C++ — you now know, mechanically, what `virtual` automates (Capstone 5), what `new`/`delete` replace (Module 4's `malloc`/`free`), and what a reference formalizes (Module 2's pointers). Beyond that: the signposts in Module 8 (concurrency, deeper undefined behavior, C as the FFI target every other language in this series eventually touches) are the next real gaps once C itself feels solid.
