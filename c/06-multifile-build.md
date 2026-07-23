# Module 6 — Multi-File Projects and Build Tooling

Every capstone from here on is more than one file — this module is what makes that actually work, and changes how you build every one of them, the same role `fpm` played for the Fortran guide in this series. Feeds all of Module 7.

## Headers: declarations vs. definitions

**You'll be able to:** split a function's declaration (in a `.h` file) from its definition (in a `.c` file), and explain why that split exists.

**Concept**

A **declaration** tells the compiler a function exists and what its signature is, without providing the body — `int add(int a, int b);`. A **definition** provides the actual body. Splitting these lets one `.c` file `#include` just the declarations it needs from another, compile independently, and get linked together afterward — the compiler doesn't need to see `add`'s implementation to compile code that *calls* `add`, only its signature.

**Example**

```c
/* mathutils.h */
#ifndef MATHUTILS_H
#define MATHUTILS_H

int add(int a, int b);
int square(int x);

#endif
```

```c
/* mathutils.c */
#include "mathutils.h"

int add(int a, int b) { return a + b; }
int square(int x) { return x * x; }
```

```c
/* main.c */
#include <stdio.h>
#include "mathutils.h"

int main(void) {
    printf("add(2,3) = %d\n", add(2,3));
    printf("square(5) = %d\n", square(5));
    return 0;
}
```

Verified: `clang -std=c17 -Wall -Wextra -fsanitize=address,undefined -g main.c mathutils.c -o app` compiles and links all three files correctly, printing `add(2,3) = 5` and `square(5) = 25` — `main.c` never saw `add`'s or `square`'s implementation, only their declarations through the header.

> **Pitfall:** `#include "mathutils.h"` (quotes) looks first in the current directory for a local header; `#include <stdio.h>` (angle brackets) looks in the system's standard library paths. Using the wrong form for your own headers is a common source of "works on my machine" build failures once a project grows past one directory.

**Practice**

- Split a function you wrote in an earlier module into a `.h`/`.c` pair and confirm it still compiles and links correctly from a separate `main.c`.
- Deliberately declare a function in the header with a different parameter type than its definition, and read the compiler/linker error carefully.

## Header guards

**You'll be able to:** explain why `#ifndef`/`#define`/`#endif` appears at the top of essentially every C header, and what breaks without it.

**Concept**

If two different `.c` files both (directly or indirectly, through other headers) `#include` the same header, its contents get pasted in twice into the same compilation — and a header containing a type or function *definition* (not just a declaration) would then be defined twice, an error. The guard pattern from Module 5's preprocessor preview prevents this: the first time a header is included, `MATHUTILS_H` isn't yet defined, so its contents get included and `MATHUTILS_H` gets defined; any subsequent inclusion in the same compilation sees `MATHUTILS_H` already defined and skips the contents entirely.

> **Pitfall:** the guard macro name needs to be unique across your *entire* project, not just locally sensible — two headers both named `utils.h` in different directories, both guarded with `#ifndef UTILS_H`, will silently clash the moment both get included in the same file, with one of them's contents simply never appearing. Prefixing guard names with something project-specific avoids this.

**Practice**

- Remove the guard from `mathutils.h`, `#include` it twice from the same `.c` file (directly, twice), and read the resulting compiler error.
- Look up `#pragma once` — a non-standard but extremely widely supported alternative to the `#ifndef` pattern — and note the one real tradeoff (it's not part of the official C standard, though every mainstream compiler supports it).

## A minimal Makefile

**You'll be able to:** write a `Makefile` that compiles a multi-file project with one command, and explain what each line does.

**Concept**

Typing the full `clang` command with every source file by hand doesn't scale past a couple of files, and definitely doesn't scale to "only recompile what actually changed." `make` reads a `Makefile` describing targets, their dependencies, and the command to build each — and only rebuilds what's out of date.

**Example**

```makefile
CC = clang
CFLAGS = -std=c17 -Wall -Wextra -fsanitize=address,undefined -g
SRCS = main.c mathutils.c
OBJS = $(SRCS:.c=.o)
TARGET = app

$(TARGET): $(OBJS)
	$(CC) $(CFLAGS) -o $(TARGET) $(OBJS)

%.o: %.c
	$(CC) $(CFLAGS) -c $< -o $@

clean:
	rm -f $(OBJS) $(TARGET)

.PHONY: clean
```

Verified: `make` correctly compiles `main.c` and `mathutils.c` into `main.o`/`mathutils.o`, links them into `app`, and running `app` produces the same correct output as the manual `clang` command above.

> **Pitfall:** `Makefile` recipe lines (the command under each target) must be indented with an actual **tab** character, not spaces — this is a genuinely famous, decades-old Make footgun. A space-indented recipe line fails with a cryptic `missing separator` error that gives no hint the problem is whitespace.

**Practice**

- Run `make` twice in a row with no changes and observe that it does nothing the second time (nothing's out of date).
- Touch (modify) only `mathutils.c` and run `make` again — confirm only `mathutils.o` gets recompiled, not `main.o`.
- Run `make clean` and confirm both object files and the binary are removed.

## Progress check

1. What's the practical difference between a declaration and a definition, and why does that split matter for multi-file projects?
2. What's the difference between `#include "local.h"` and `#include <system.h>`?
3. What problem do header guards solve, and what error would you see without them?
4. Why does a guard macro need to be unique across the whole project, not just the one file?
5. What does `make` do that repeatedly typing the full compile command by hand doesn't?
6. What's the single most common cause of a Makefile's cryptic `missing separator` error?

### Answers

1. A declaration tells the compiler a function's signature without its body, letting other files compile against it without seeing (or needing) the implementation. This split is what lets separate `.c` files be compiled independently and linked together afterward.
2. Quotes search the current directory first (for your own project's headers); angle brackets search the system/standard library include paths.
3. They prevent a header's contents from being pasted into the same compilation more than once. Without them, a header containing an actual definition (not just a declaration) included twice would cause a "redefinition" compiler error.
4. Because two unrelated headers using the same guard name would clash the moment both get included in the same file — the second one's contents would be silently skipped, as if `#ifndef` had already seen it.
5. It tracks dependencies and only rebuilds files that actually changed (or whose dependencies changed) — avoiding both the tedium of a long manual command and the wasted time of recompiling everything on every build.
6. Using spaces instead of an actual tab character to indent a recipe line under a target.
