# Module 8 — Multi-File Projects and CMake

The same problem C Module 6 solved with a Makefile, solved with the tool the real C++ ecosystem actually converged on. Feeds Module 9's capstones.

## `#pragma once`, and headers revisited

**You'll be able to:** structure a C++ header the idiomatic way.

**Concept**

Everything from C Module 6 about declarations-vs-definitions and header guards applies unchanged in C++ — `.hpp` files declare, `.cpp` files define, and something needs to stop a header's contents from being pasted in twice. C++ code overwhelmingly uses `#pragma once` at the top of a header instead of the `#ifndef`/`#define`/`#endif` pattern — not part of the official standard, but supported by every mainstream compiler and universally preferred for being one line instead of three, with no name to accidentally collide.

**Example**

```cpp
// mathutils.hpp
#pragma once
int add(int a, int b);
int square(int x);
```

**Practice**

- Convert one of your own headers from the `#ifndef` guard pattern to `#pragma once` and confirm identical behavior.

## A minimal CMake project

**You'll be able to:** structure a multi-file C++ project with `CMakeLists.txt` and build it with one command.

**Concept**

`CMake` doesn't compile anything itself — it *generates* the actual build system (Makefiles, Ninja files, an Xcode project, whatever your platform prefers) from one portable `CMakeLists.txt` description. This is the real reason it dominates C++ projects over hand-written Makefiles: a Makefile is inherently platform- and toolchain-specific; a `CMakeLists.txt` describing "these source files, this standard, these flags" generates the right thing for whoever's building it.

**Example**

```
myproject/
  CMakeLists.txt
  src/
    main.cpp
    mathutils.hpp
    mathutils.cpp
```

```cmake
cmake_minimum_required(VERSION 3.20)
project(MathApp CXX)

set(CMAKE_CXX_STANDARD 20)
set(CMAKE_CXX_STANDARD_REQUIRED ON)

add_compile_options(-Wall -Wextra -fsanitize=address,undefined -g)
add_link_options(-fsanitize=address,undefined)

add_executable(app src/main.cpp src/mathutils.cpp)
```

```bash
cmake -B build -S .      # configure: generates the actual build system into build/
cmake --build build       # build: invokes whatever CMake generated
./build/app
```

Verified: this exact project structure and `CMakeLists.txt` configures, builds both source files, links them, and runs correctly (`add(2,3) = 5`, `square(5) = 25`) — with this guide's full sanitizer flags applied via `add_compile_options`/`add_link_options`, exactly as they've been applied by hand to every `clang++` command so far in this guide.

> **Pitfall:** the separate **configure** step (`cmake -B build -S .`) and **build** step (`cmake --build build`) trip up people used to a single Makefile invocation — configure only needs rerunning when `CMakeLists.txt` itself changes (a new source file added, a new flag), not on every code change; `cmake --build build` alone is enough for ordinary edit-compile cycles, and it's smart about only rebuilding what changed, exactly like `make` was in the C guide.

**Practice**

- Add a third source file to `src/`, add it to `add_executable`'s list, rerun both `cmake` steps, and confirm it builds in.
- Look up `target_link_libraries` and `find_package` — the mechanisms real CMake projects use to pull in external libraries, once a project needs more than what you've written yourself.

## Progress check

1. What does `#pragma once` do, and why does most real C++ code prefer it over `#ifndef` guards?
2. What does CMake actually do — does it compile your code directly?
3. Why is a `CMakeLists.txt` more portable than a hand-written Makefile?
4. What are the two separate steps in a CMake build, and when does each need rerunning?
5. Why does this guide's `CMakeLists.txt` include `add_compile_options(-fsanitize=address,undefined)`?

### Answers

1. It prevents a header's contents from being included more than once in the same compilation — one line, no name to manage, versus the three-part `#ifndef`/`#define`/`#endif` pattern. Not part of the official standard, but supported everywhere and preferred for its simplicity.
2. No — it generates an actual, platform-appropriate build system (Makefiles, Ninja, an IDE project) from the `CMakeLists.txt` description; that generated system is what actually invokes the compiler.
3. A Makefile is written for one specific build system on one platform. A `CMakeLists.txt` describes the project abstractly (source files, standard, flags) and CMake generates whatever's appropriate for the machine actually building it.
4. Configure (`cmake -B build -S .`, generates the build system — rerun when `CMakeLists.txt` itself changes) and build (`cmake --build build`, actually compiles and links — rerun on ordinary code changes, and it's incremental like `make`).
5. To carry this guide's entire verification discipline (the same sanitizer flags used by hand throughout every earlier module) into the multi-file capstones, rather than dropping it the moment a real build system enters the picture.
