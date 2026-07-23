# Module 10 — Beyond This Guide

None of these change how any of the five capstones turn out — signposts, not gaps.

### Multiple inheritance and the diamond problem

**What it is:** a class can inherit from more than one base class in C++ (unlike single-inheritance-only languages). If two bases both inherit from a common ancestor, a derived class inheriting from both ends up with two copies of that ancestor unless you explicitly use `virtual` inheritance to share it — the classic "diamond" (`D` inherits from `B` and `C`, both of which inherit from `A`).

**Why it's a signpost, not a module:** none of this guide's capstones need it, and it's genuinely one of the more debated corners of C++ design — plenty of real style guides restrict or ban multiple inheritance entirely in favor of composition. Worth knowing, if you've read the Simula guide: Simula itself only ever had single inheritance (its prefix-class mechanism, one prefix per class) — multiple inheritance is a C++-era addition, not something carried over from where `class` and `virtual` originated.

**Where to go next:** *Effective C++* (Meyers) has a well-regarded treatment of when (rarely) it's the right tool.

### Concurrency: `std::thread`

**What it is:** the C++ standard library's own thread abstraction — directly comparable to C's `pthreads` (signposted in that guide), now wrapped in RAII-friendly, exception-aware C++ types.

**Minimal taste, verified:**

```cpp
#include <thread>
#include <vector>

void worker(int id) { std::cout << "worker " << id << " running\n"; }

std::vector<std::thread> threads;
for (int i = 0; i < 3; i++) threads.emplace_back(worker, i);
for (auto &t : threads) t.join();
```

Running this produced genuinely interleaved, occasionally garbled output (`worker 1worker  running\n2 running`) — three threads writing to `std::cout` concurrently, with no synchronization, exactly as unsynchronized concurrent output is expected to behave. This wasn't staged; it's the first real lesson concurrency teaches, before you've written a single line of synchronization code.

**Why it's a signpost:** doesn't touch any of this guide's five capstones, and — same as C's `pthreads` signpost — introduces data races as a bug category, which needs `-fsanitize=thread` (mutually exclusive with the `-fsanitize=address` this whole guide anchors on) to hunt properly.

**Where to go next:** `std::mutex`/`std::lock_guard` for the synchronization this example is missing; `-fsanitize=thread` for the same verification rigor this guide applied to memory bugs.

### Templates metaprogramming and concepts (C++20)

**What it is:** templates can do far more than generic containers — compile-time computation, `constexpr` functions evaluated at compile time, and C++20 **concepts**, which let you constrain a template parameter (`template <typename T> requires std::integral<T>`) with a readable, compiler-checked requirement instead of relying on the error message from deep inside a failed instantiation.

**Why it's a signpost:** Module 4's function/class templates cover everything the five capstones need; concepts specifically improve *error messages* and *documentation* for template constraints, valuable but not load-bearing for anything built here.

**Where to go next:** cppreference's `<concepts>` page, and any recent (post-2020) C++ template metaprogramming reference — this area changed substantially with C++20 and older material may teach outdated patterns.

### C++23, briefly

**What it is:** the standard newer than this guide's C++20 anchor — `std::expected` (a typed alternative to exceptions for recoverable errors), `std::print` (a `printf`-like, type-safe formatted output function, finally closing the `std::cout <<` chaining verbosity this guide's own examples lean on), and more.

**Why C++20, not C++23, was the anchor:** broader toolchain support as of this guide's writing. Worth checking your own compiler's C++23 support before assuming a feature you've read about is available — the same caution the C guide gave for C23 vs. C17.
