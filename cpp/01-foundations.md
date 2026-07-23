# Module 1 — Foundations: From C to C++

What's actually different, what's just new syntax for something you already know, and the one genuinely new concept (references) that isn't in C at all. Feeds everything downstream.

## `class` and `struct`: one real difference

**You'll be able to:** declare a class with member functions; state the one thing that actually distinguishes `class` from `struct` in C++.

**Concept**

C's `struct` only ever held data — Capstone 5 of the C guide had to bolt a function pointer *into* a struct by hand to get dispatch. C++'s `struct` and `class` can both hold data **and** member functions directly. The only real difference between the two keywords: `struct` members default to `public`, `class` members default to `private`. Everything else is identical — you can write a `class` that behaves exactly like a `struct` by marking everything `public`, and vice versa.

**Example**

```cpp
#include <iostream>

struct Point {
    int x, y;                         // public by default
    void print() const { std::cout << "(" << x << ", " << y << ")\n"; }
};

class Counter {
public:
    void increment() { count++; }
    int get() const { return count; }
private:
    int count = 0;                     // private by default
};

int main() {
    Point p{3, 4};
    p.print();

    Counter c;
    c.increment(); c.increment(); c.increment();
    std::cout << "count = " << c.get() << "\n";
}
```

Verified: prints `(3, 4)` and `count = 3` — `Point`'s fields are directly accessible (public by default); `Counter`'s `count` is only reachable through `increment`/`get`, which is the entire point of `private`.

> **Pitfall:** `const` after a member function's parameter list (`int get() const`) means "this function doesn't modify the object" — it's a real, compiler-enforced promise, not documentation. Get in the habit of marking every member function `const` unless it genuinely needs to modify state; it catches accidental mutation and lets you call the function on `const` objects.

**Practice**

- Convert `Point` to a `class` with `private` fields and public `getX()`/`getY()` accessors, and confirm direct field access (`p.x`) now fails to compile.
- Add a constructor to `Counter` that takes a starting value instead of always starting at `0`.

## References: the genuinely new concept

**You'll be able to:** declare and use a reference; explain how it differs from a pointer.

**Concept**

A reference (`int &r = x;`) is an alias for an existing variable — not a new variable holding an address, an *alternate name* for the same storage. Unlike a pointer, a reference can't be null, can't be reassigned to refer to something else after initialization, and needs no `*` to use — you use it exactly like the original variable. Function parameters taken by reference (`void f(int &r)`) give you C's "pass a pointer to modify the caller's variable" pattern, without the caller needing `&` at the call site or the function needing `*` to use it.

**Example**

```cpp
void increment_ptr(int *p) { (*p)++; }
void increment_ref(int &r) { r++; }

int main() {
    int x = 5;
    increment_ptr(&x);      // caller must pass the address
    increment_ref(x);        // caller just passes x -- looks like pass-by-value, isn't

    int &alias = x;
    alias = 100;               // modifies x directly -- alias IS x, not a pointer to it
}
```

Verified: `increment_ptr` and `increment_ref` both correctly modify the caller's `x` (6, then 7), and assigning through `alias` changes `x` directly to `100` — confirming a reference really is the same storage under a second name, not a separate pointer variable.

> **Pitfall:** because a reference parameter looks identical to a by-value parameter at the call site (`increment_ref(x)`, no `&` needed), it's easy to accidentally modify a caller's variable without realizing the function takes a reference — reading a function's signature, not just its call site, is the only way to know. This is a real, common source of surprise moving from C, where `&` at the call site was always your visual cue that a function might modify what you passed.

**Practice**

- Write a function taking a `const int &` and explain why that's a common pattern for read-only parameters of types more expensive to copy than an `int` (you won't feel the cost with `int` itself, but the pattern matters once parameters are larger structs — Module 5 revisits this directly).
- Try declaring a reference without initializing it (`int &r;`) and read the compiler error — confirm this is a compile-time restriction, not a runtime one.

## `iostream` and namespaces

**You'll be able to:** print with `std::cout` instead of `printf`; explain what `std::` actually means.

**Concept**

`std::cout << value` is C++'s stream-based output — `<<` is an overloaded operator (Module 5 covers writing your own), chosen for exactly this kind of "the type figures out how to print itself" extensibility, which `printf`'s format-string approach can't offer without extra format specifiers per type. `std` is a **namespace** — a named scope holding the standard library's names, preventing them from colliding with your own `cout`, `vector`, etc. `std::cout` means "the `cout` inside the `std` namespace," fully qualified.

**Example**

```cpp
#include <iostream>
int main() {
    int x = 42;
    std::cout << "x = " << x << ", doubled = " << x * 2 << "\n";
}
```

> **Pitfall:** `using namespace std;` at the top of a file avoids typing `std::` everywhere, and you'll see it in a lot of tutorials — but it also reintroduces exactly the namespace-collision risk namespaces exist to prevent, at the scale of an entire file. Real production code almost universally avoids it; this guide writes `std::` explicitly throughout for the same reason.

**Practice**

- Rewrite one of C's `printf`-based examples using `std::cout`, and note which parts got simpler and which (`f8.3`-style precise formatting) got more verbose.
- Declare your own namespace (`namespace mylib { ... }`) around a small function, and call it as `mylib::myfunction()`.

## Progress check

1. What's the one real difference between `class` and `struct` in C++?
2. What does `const` after a member function's parameter list actually promise?
3. How does a reference differ from a pointer — name two concrete differences?
4. Why is a reference parameter easy to accidentally misuse compared to a pointer parameter?
5. What does `std::` actually mean?
6. Why does this guide avoid `using namespace std;`?

### Answers

1. Default member access — `struct` members are `public` by default, `class` members are `private` by default. Every other capability is identical between the two keywords.
2. That the member function doesn't modify the object's state — compiler-enforced, not just a comment; it also enables calling the function on `const` instances of the type.
3. A reference can't be null and can't be reassigned to refer to a different variable after initialization; a pointer can be null and can be reassigned freely. A reference also needs no dereference operator to use.
4. Because calling a function that takes a reference looks syntactically identical to calling one that takes a plain value — there's no `&` at the call site to signal "this might modify what I'm passing," unlike C's pointer convention.
5. It's the `std` namespace-qualification — `std::cout` means "the `cout` name that lives inside the `std` namespace," disambiguating it from any `cout` you might define yourself.
6. It pulls every name from the `std` namespace into the global scope for the whole file, reintroducing the collision risk namespaces exist to prevent — real production code almost universally qualifies explicitly instead.
