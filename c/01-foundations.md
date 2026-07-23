# Module 1 — Foundations

Your first C program, what the basic types actually cost in memory, and the operators/control-flow you already know from every other language, in C's specific syntax. Feeds everything downstream.

## Your first program

**You'll be able to:** compile and run a C program with `clang`, using the sanitizer-enabled flags this whole guide builds with.

**Concept**

A C program's entry point is `int main(void)`. `#include <stdio.h>` pulls in the standard I/O declarations (`printf` and friends) — C has no built-in `print`; everything beyond the bare language is a library function.

**Example**

```c
#include <stdio.h>
int main(void) {
    printf("Hello, C!\n");
    return 0;
}
```

```bash
clang -std=c17 -Wall -Wextra -fsanitize=address,undefined -g hello.c -o hello
./hello
```

> **Pitfall:** `return 0` from `main` means "success" — this is a real, checkable exit status your shell (or a calling program) can read, not just a formality. Non-zero means something went wrong; you'll use this deliberately once error handling shows up in the capstones.

**Practice**

- Compile with the flags above and confirm zero warnings.
- Change the return value to `1` and check `echo $?` after running — confirm the shell actually sees it.
- Try running without `#include <stdio.h>` and read the compiler's error carefully.

## Types and what they cost

**You'll be able to:** declare the core C types; use `sizeof` to find out exactly how much memory something occupies.

**Concept**

Unlike a dynamically-typed language, every C variable has a fixed type, decided at compile time, that determines its size and how the bits are interpreted. The core types: `int` (a whole number, typically 4 bytes), `char` (1 byte — usually a small integer or an ASCII character), `float` (4-byte approximate real number), `double` (8-byte, more precise). `sizeof` tells you exactly how many bytes a type or variable occupies — genuinely useful, not just trivia, since it's what you'll hand to `malloc` in Module 4.

**Example**

```c
#include <stdio.h>
int main(void) {
    int a = 5;
    char c = 'A';
    float f = 3.14f;
    double d = 3.14159265358979;
    printf("sizeof(int)=%zu sizeof(char)=%zu sizeof(float)=%zu sizeof(double)=%zu\n",
           sizeof(int), sizeof(char), sizeof(float), sizeof(double));
    printf("a=%d c=%c f=%f d=%.10f\n", a, c, f, d);
    return 0;
}
```

Verified: `sizeof(int)=4 sizeof(char)=1 sizeof(float)=4 sizeof(double)=8` on this toolchain — these exact sizes aren't actually guaranteed by the C standard (only minimums are), but they're what you'll see on essentially every current mainstream platform.

> **Pitfall:** `%zu` is the format specifier for `size_t` (what `sizeof` returns) — using `%d` for it compiles with a warning under `-Wall` and is technically undefined behavior on platforms where `size_t` and `int` differ in size. This is a small, concrete first taste of the theme Module 5 goes deep on: C lets you do the wrong thing, and it's on you (and your warning flags) to catch it.

**Practice**

- Print `sizeof` for a `long`, `short`, and a pointer type (`int *`) — predict each before checking.
- Declare an `unsigned int` and assign it `-1`; print it and explain what you see (this previews a Module 5 undefined-behavior topic, but the *observable* result here is well-defined — unsigned wraparound is one of the few overflow behaviors C actually guarantees).

## Operators and expressions

**You'll be able to:** use C's arithmetic, comparison, and logical operators; know what integer division does.

**Concept**

Arithmetic (`+ - * / %`), comparison (`== != < <= > >=`), logical (`&& || !`) — mostly unsurprising if you know any C-family language, because most C-family languages copied this syntax from C. The one C-specific trap: `/` between two integers is integer division (truncates), exactly like Fortran's default — `7 / 2` is `3`, not `3.5`.

**Example**

```c
#include <stdio.h>
int main(void) {
    printf("7 / 2 = %d\n", 7 / 2);
    printf("7.0 / 2 = %f\n", 7.0 / 2);
    printf("7 %% 2 = %d\n", 7 % 2);
    return 0;
}
```

> **Pitfall:** `&&` and `||` **do** short-circuit in C (unlike Fortran's `.and.`/`.or.` from the earlier guide in this series) — `a && b` never evaluates `b` if `a` is false. This is guaranteed by the standard, not a compiler courtesy, and real code relies on it (`ptr != NULL && ptr->value > 0` is safe specifically because of this guarantee).

**Practice**

- Predict, then verify, `-7 / 2` (careful — C's truncation direction for negative integer division was implementation-defined before C99, and is now defined to truncate toward zero, so `-7/2` is `-3`).
- Write an expression relying on `&&` short-circuiting to avoid a null-pointer dereference (you won't have real pointers until Module 2 — sketch it in comments if needed).

## Control flow

**You'll be able to:** write `if`/`else`, `while`, `for`, and `switch` in C syntax.

**Concept**

All familiar shapes, C-flavored: `if (cond) { } else { }`, `while (cond) { }`, `for (init; cond; step) { }`, `switch (expr) { case X: ...; break; default: ...; }`. The one C-specific trap in `switch`: cases **fall through** to the next case unless you `break` — this is different from most modern languages' `switch`/`match`, which default to not falling through.

**Example**

```c
#include <stdio.h>
int main(void) {
    for (int i = 0; i < 5; i++) {
        if (i % 2 == 0) {
            printf("%d is even\n", i);
        } else {
            printf("%d is odd\n", i);
        }
    }

    int day = 3;
    switch (day) {
        case 1:
        case 7:
            printf("Weekend\n");
            break;
        case 2: case 3: case 4: case 5: case 6:
            printf("Weekday\n");
            break;
        default:
            printf("Invalid\n");
    }
    return 0;
}
```

> **Pitfall:** an accidentally-omitted `break` in a `switch` doesn't error — it silently falls into the next case's code, executing both. This is common enough that modern compilers warn about it (`-Wimplicit-fallthrough`, on by default under `-Wextra`) unless you explicitly mark a fall-through as intentional.

**Practice**

- Write the classic "off-by-one" `for` loop bug on purpose (`i <= 5` instead of `i < 5` over a 5-element array) and observe what `-fsanitize=address` does with it once you have real arrays (Module 2).
- Rewrite the `switch` above using `if`/`else if` and confirm identical behavior.

## Progress check

1. What does `return 0` from `main` actually communicate, and to whom?
2. Why is `%zu`, not `%d`, the correct format specifier for a `sizeof` result?
3. What does `7 / 2` evaluate to in C, and why?
4. Do `&&`/`||` short-circuit in C? Contrast with Fortran's `.and.`/`.or.`.
5. What happens if you omit `break` in a `switch` case?

### Answers

1. The process's exit status — readable by the shell (`echo $?`) or any program that launched it, as a machine-checkable success/failure signal, not just documentation.
2. `sizeof` returns a `size_t`, which isn't guaranteed to be the same size as `int` on every platform — `%zu` is the specifier that actually matches its type.
3. `3` — integer division truncates toward zero; C doesn't automatically promote to a floating-point result the way some languages do.
4. Yes, guaranteed by the C standard. Fortran's `.and.`/`.or.` explicitly do **not** guarantee short-circuiting — real C code relies on the guarantee (e.g., checking a pointer isn't null before dereferencing it in the same expression), which would be unsafe to rely on in Fortran.
5. Execution falls through into the next case's code and keeps running until it hits a `break` or the end of the `switch` — a common, compiler-warned-about source of bugs.
