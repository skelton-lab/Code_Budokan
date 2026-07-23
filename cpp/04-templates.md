# Module 4 — Templates and Generic Programming

C's answer to "I want this code to work for any type" was `void*` and manual casting (or a macro, with all of Module 5's C-guide text-substitution risk) — neither checked by the compiler until something goes wrong at runtime. Templates are C++'s answer: genuinely generic code, fully type-checked at compile time. Feeds Capstone 3.

## Function templates

**You'll be able to:** write one function that works correctly for multiple types, checked by the compiler for each type it's actually used with.

**Concept**

`template <typename T>` before a function declares `T` as a placeholder type, filled in by the compiler based on how the function is called (or explicitly, with `my_max<std::string>(...)`). Unlike C's `void*` approach, the compiler generates a real, type-specific version of the function for each type you actually use it with, and checks every operation inside against that specific type — `a > b` on `T` only compiles if `>` is actually defined for whatever `T` ends up being.

**Example**

```cpp
template <typename T>
T my_max(T a, T b) {
    return (a > b) ? a : b;
}

std::cout << my_max(3, 7) << "\n";                        // T deduced as int -> 7
std::cout << my_max(3.5, 2.1) << "\n";                      // T deduced as double -> 3.5
std::cout << my_max<std::string>("apple", "banana") << "\n"; // T explicit -> "banana"
```

Verified: `7`, `3.5`, `banana` — the same function body, correctly type-checked and correctly comparing three completely different types (`int`, `double`, `std::string`), each via that type's own `>` operator (Module 5 shows you how to define `>` for your own types).

> **Pitfall:** template type errors happen at the point of *use*, not the point of *definition* — write `my_max` once, and it compiles cleanly even if some hypothetical type without a `>` operator would break it; the error only appears the moment someone actually tries `my_max` with that type. This is different from C's `void*` genericity, which compiles regardless of what you pass and fails (or silently misbehaves) at *runtime* instead.

**Practice**

- Call `my_max` with two `Circle`s from Module 3 and read the compiler error carefully — it should be about `>` not being defined for `Circle`, at the call site, not somewhere mysterious.
- Write a `template <typename T> T my_min(T a, T b)`.

## Class templates

**You'll be able to:** write a class that works for any type, and instantiate it for several different types in the same program.

**Concept**

The same `template <typename T>` mechanism applies to classes — `Box<T>` is a template; `Box<int>` and `Box<std::string>` are two completely distinct, independently-compiled types generated from the same template, each fully type-checked. This is what makes real generic containers (`std::vector<T>`, Module 7) possible without giving up compile-time type safety.

**Example**

```cpp
template <typename T>
class Box {
public:
    Box(T value) : value_(value) {}
    T get() const { return value_; }
    void set(T value) { value_ = value; }
private:
    T value_;
};

Box<int> bi(42);
Box<std::string> bs("hello");
```

Verified: `bi.get()` and `bs.get()` correctly return `42` and `"hello"` — two genuinely different generated types (`Box<int>` and `Box<std::string>`), each holding and returning the right type with no casting anywhere.

> **This is the direct answer to C Capstone 1's "genericize it" practice problem.** The `void *`-based approach there requires the caller to pass an element size and the code to do manual, unchecked pointer arithmetic on raw bytes — nothing stops you from storing an `int` and reading it back as a `double`. `Box<T>` (and Capstone 3's generic container) can't make that mistake: the compiler enforces the type at every access, for every instantiation, at zero runtime cost.

**Practice**

- Add a `Box<double>` and confirm it works with no changes to the `Box` template itself.
- Sketch (in comments, formalized in Capstone 3) what a `template <typename T> class Vector` would need beyond `Box`'s single value — a pointer, a count, a capacity, exactly like C Capstone 1's `IntArray`, but generic.

## Progress check

1. What does `template <typename T>` actually do to a function or class?
2. Why is a template genuinely more type-safe than C's `void *` approach, given both claim to be "generic"?
3. When does a template type error actually surface — at definition, or at use?
4. What real generic container from the standard library does `Box<T>` directly foreshadow?
5. What's the concrete C Capstone 1 practice problem this module's `Box<T>` example directly answers?

### Answers

1. It declares a placeholder type (`T`), filled in by the compiler based on how the template is used — the compiler then generates a distinct, fully type-checked version of the function or class for each concrete type it's actually instantiated with.
2. `void *` genericity relies entirely on the programmer casting correctly by hand, with nothing checked by the compiler — mismatched casts compile fine and fail (or silently corrupt data) at runtime. A template is checked, per instantiation, by the actual compiler, at compile time.
3. At the point of *use* — a template compiles cleanly regardless of what operations it contains, and only produces an error when instantiated with a type that can't actually support those operations.
4. `std::vector<T>` (and the STL's other containers, Module 7) — they're built on exactly this mechanism.
5. "Genericize it: instead of hardcoding `int`, use `void *` elements and a caller-supplied element size" — `Box<T>` (and Capstone 3's full generic container) is the fully type-checked version of that same idea.
