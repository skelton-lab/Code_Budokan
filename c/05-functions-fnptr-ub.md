# Module 5 — Functions, Function Pointers, and Undefined Behavior

Function pointers — the direct setup for Capstones 3 and 5 — and a hard look at what "undefined behavior" actually means in C, verified by triggering it and reading the sanitizer's output. Plus a brief, practical tour of the preprocessor. Feeds Capstones 3, 5; sets up Module 6.

## Functions and parameters

**You'll be able to:** define functions, pass parameters by value and by pointer, and know which one you need.

**Concept**

C passes everything **by value** — a function gets a copy of whatever you pass it, so modifying a parameter inside a function never affects the caller's variable, *unless* what you passed was a pointer, in which case the copy is of the address, and dereferencing it reaches the caller's real data. This is Module 2's `swap` practice problem, generalized: "pass by reference" in C is just "pass a pointer," made explicit rather than hidden behind special syntax.

**Practice**

- Write a function that takes an `int` by value and one that takes an `int *`, modify the parameter inside each, and confirm only the pointer version affects the caller.
- Write a function taking a `struct` by value versus by pointer, and reason about which is more expensive for a large struct (a full copy vs. copying just an address).

## Function pointers

**You'll be able to:** declare a function pointer, store several in an array, and call through them to build a dispatch table.

**Concept**

A function itself has an address, just like a variable does — `int (*fp)(int, int)` declares `fp` as "a pointer to a function taking two `int`s and returning `int`." An array of function pointers, indexed by some value, gives you a dispatch table — call the right function without a chain of `if`/`else`, exactly the pattern 6502 Module 3 built by hand with an indirect `JMP` and a table of addresses. This is the direct foundation for Capstone 3's bytecode VM and Capstone 5's manual vtables.

**Example**

```c
int add(int a, int b) { return a + b; }
int sub(int a, int b) { return a - b; }
int mul(int a, int b) { return a * b; }

typedef int (*BinOp)(int, int);

int main(void) {
    BinOp ops[3] = { add, sub, mul };
    const char *names[3] = { "add", "sub", "mul" };
    for (int i = 0; i < 3; i++) {
        printf("%s(4,3) = %d\n", names[i], ops[i](4, 3));
    }
    return 0;
}
```

Verified: prints `add(4,3) = 7`, `sub(4,3) = 1`, `mul(4,3) = 12` — confirming the table correctly dispatches to a different function per index, with no `if`/`switch` chain needed to pick one.

> **Pitfall:** `typedef int (*BinOp)(int, int);` is worth memorizing as a pattern rather than parsing character-by-character every time — C's function pointer syntax is genuinely one of the least readable corners of the language, and a `typedef` is how real code avoids repeating it.

**Practice**

- Add a `div` function to the table and confirm dispatch still works.
- Compare this pattern directly against 6502 Module 3's jump table: what's the C compiler doing for you that you did by hand there (building the table of addresses, computing an offset, executing an indirect jump)?

## Undefined behavior, triggered and read

**You'll be able to:** name two concrete examples of undefined behavior and explain why "it happened to work" is not evidence of correctness.

**Concept**

C's standard defines some invalid operations as **undefined behavior** — not "an error," not "a specific wrong result," but "the compiler is allowed to assume this never happens, and do anything at all if it does." This is different from, say, Fortran's `v(::-1)` mistake earlier in this series (that was well-defined-but-surprising behavior); undefined behavior means the compiler can legitimately optimize *assuming* your program never hits it, which can produce results stranger than a simple wrong answer.

**Example — signed integer overflow:**

```c
#include <limits.h>
int x = INT_MAX;
int y = x + 1;    /* UB */
```

Verified — UBSan's actual output: `runtime error: signed integer overflow: 2147483647 + 1 cannot be represented in type 'int'`, and the program then printed `-2147483648` (two's-complement wraparound) and kept running. **This is the trap**: on this specific platform, right now, it "looks like" harmless wraparound — but the standard doesn't guarantee that, so a future compiler, optimization level, or platform is free to produce something else entirely, including deleting code that the compiler proves is "unreachable" if it assumes the overflow can't happen.

**Example — reading an uninitialized variable:**

```c
int x;
if (x > 0) { ... }    /* UB: x's value is indeterminate */
```

Verified: caught here by a plain **compile-time** warning (`-Wuninitialized`), not by the address/UB sanitizers this guide anchors on — this specific bug class is what MemorySanitizer specifically targets, and it isn't part of this guide's sanitizer combination. The lesson generalizes: no single tool catches every category of UB, which is exactly why `-Wall -Wextra` and sanitizers are both worth running, not either/or.

> **Pitfall:** unsigned integer overflow is explicitly **not** undefined behavior in C — it's defined to wrap around (Module 1's `(unsigned int)-1` example). Signed overflow is undefined. These look like the same category of "number got too big" and behave completely differently under the standard — worth knowing cold, since it's a very easy pair to conflate.

**Practice**

- Trigger the signed-overflow example yourself and read UBSan's line-and-column-precise output.
- Look up (or predict) what `-O2` optimization does differently to code that's proven, by the compiler, to only be reachable after undefined behavior has already occurred.

## The preprocessor, briefly

**You'll be able to:** use `#define` for constants and simple macros, and recognize `#ifndef`/`#define`/`#endif` header guards on sight (fully explained in Module 6).

**Concept**

The preprocessor runs *before* compilation and does pure text substitution — `#define MAX_ENTITIES 64` replaces every later occurrence of `MAX_ENTITIES` with `64`, textually, before the compiler ever sees C syntax. Macros with parameters (`#define SQUARE(x) ((x)*(x))`) are more powerful but more dangerous — because it's text substitution, not a real function call, `SQUARE(a+b)` without those extra parentheses would expand to `a+b*a+b`, not `(a+b)*(a+b)`.

**Example**

```c
#define MAX_ENTITIES 64
#define SQUARE(x) ((x) * (x))

int entities[MAX_ENTITIES];
int nine = SQUARE(3);        /* expands to ((3) * (3)) */
```

> **Pitfall:** always fully parenthesize both the macro's parameters and its whole expansion (`((x) * (x))`, not `x * x`) — this is the standard defense against the text-substitution trap above, and it's why real macros look more heavily parenthesized than you'd expect.

**Practice**

- Write `SQUARE(x)` without the inner parentheses, expand it by hand for `SQUARE(2+3)`, and confirm you get the wrong answer.
- Preview: `#ifndef HEADER_H` / `#define HEADER_H` / `#endif` is the exact same substitution mechanism, used to stop a header file's contents being pasted in twice — Module 6 covers why that matters.

## Progress check

1. Why does modifying an `int` parameter inside a function never affect the caller's variable, while modifying through an `int *` parameter does?
2. What does a function pointer's declaration syntax actually mean, in plain English, for `int (*fp)(int, int)`?
3. What's the practical difference between "undefined behavior" and "well-defined but surprising behavior" (like Fortran's `v(::-1)`)?
4. Is unsigned integer overflow undefined behavior in C? Signed?
5. Why does "it printed the value I expected" not prove a piece of UB-triggering code is actually correct?
6. What's the standard defense against the macro-expansion trap where `SQUARE(x)` without inner parens breaks on `SQUARE(a+b)`?

### Answers

1. C passes everything by value — a plain `int` parameter gets a copy, so changes to it are local to the function. An `int *` parameter's *copy* is of an address, and dereferencing that address reaches the original caller's memory directly.
2. `fp` is a pointer to a function that takes two `int` parameters and returns an `int` — you can assign any matching function's name to it and call through it exactly like calling that function directly.
3. Well-defined-but-surprising behavior (like `v(::-1)`) always does the *same*, specifiable thing — it's just not what you expected. Undefined behavior has no specified outcome at all; the compiler may assume it never happens and optimize accordingly, which can produce results well beyond "just the wrong number."
4. Unsigned overflow is explicitly defined to wrap around. Signed overflow is undefined behavior — despite both looking like "the same kind of mistake," the standard treats them completely differently.
5. Because the observed result (like the wraparound value from signed overflow) is only what happened on this specific compiler, optimization level, and platform, right now — the standard doesn't guarantee it, so nothing prevents a different build from producing a different, possibly much stranger, result.
6. Fully parenthesize both the parameters and the whole expansion — `((x) * (x))` rather than `x * x` — so the substituted text can't be reinterpreted by surrounding operators in a way that changes the intended grouping.
