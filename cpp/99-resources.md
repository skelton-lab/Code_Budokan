# Resources & Cheat Sheet

## References

| Resource | Why it matters |
|---|---|
| *A Tour of C++* (Stroustrup) | Short, from the language's own designer, covers exactly this guide's scope and more |
| *Effective Modern C++* (Meyers) | The standard reference for move semantics, smart pointers, and the C++11-and-later idioms this guide leans on |
| [cppreference.com](https://en.cppreference.com/w/cpp) | The most reliable free reference for exact standard behavior, including which C++ version added what |
| CMake documentation | The build tool this guide anchors to |
| This series' [C guide](../c/00-overview.md) and [Fortran guide](../fortran/00-overview.md) | Every callback in this guide ("this is what C Capstone 5 built by hand," "same idea as Fortran's operator overloading") points back here |
| This series' [ALGOL](../algol/00-overview.md), [Simula](../simula/00-overview.md), and [Smalltalk](../smalltalk/00-overview.md) guides | Where `class` and `virtual` actually come from — Module 2 and Module 3's historical callouts depend on these directly, especially Simula's Module 4 and Smalltalk's Module 7 |
| Bjarne Stroustrup, *The Design and Evolution of C++* | The primary source for the Simula-to-C++ history these callouts summarize — read directly rather than secondhand if you want the full account |

## One-page cheat sheet

| Idea | Snippet |
|---|---|
| Compile with full checks | `clang++ -std=c++20 -Wall -Wextra -fsanitize=address,undefined -g prog.cpp -o prog` |
| Reference parameter | `void f(int &r)` — modifies caller's variable, no `&`/`*` needed at call or use site |
| RAII | Acquire in constructor, release in destructor — cleanup guaranteed by scope |
| Abstract base + virtual | `virtual double area() const = 0;` then `class Circle : public Shape { double area() const override { ... } };` |
| Virtual destructor | `virtual ~Base() = default;` — required for any class deleted through a base pointer |
| Function template | `template <typename T> T my_max(T a, T b) { ... }` |
| Class template | `template <typename T> class Box { ... };` then `Box<int>`, `Box<std::string>` |
| Operator overload | `Vec2 operator+(const Vec2 &other) const { return Vec2(...); }` |
| Move constructor | `T(T &&other) noexcept : member(other.member) { other.member = nullptr; }` |
| Smart pointers | `std::make_unique<T>(...)`, `std::make_shared<T>(...)` |
| STL "not found" | Compare against `container.end()`, never a sentinel value |
| Lambda | `[capture](params) { return ...; }` |
| Structured bindings | `for (const auto &[key, value] : some_map)` |
| CMake build | `cmake -B build -S .` then `cmake --build build` |

## Where to go next

This is the deliberate end of the "6502 → C → C++" systems track. Where you go from here depends on what you're building: game/embedded work stays close to what this whole series taught (manual memory awareness, now with RAII and templates to make it safer); general application work might branch toward a garbage-collected language next, where you'll notice, by contrast, everything C++ makes you handle explicitly. Module 10's signposts (concurrency, multiple inheritance, C++23) are the next real gaps once C++ itself feels solid.
