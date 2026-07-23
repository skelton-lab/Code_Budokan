# Final Assessment

Across all ten modules. Try each on paper first.

1. What's the one real difference between `class` and `struct` in C++?
2. What's the difference between a reference and a pointer — name two concrete distinctions?
3. What is RAII, in one sentence, and why does it matter more in C++ than in C?
4. In the verified exception example, why did a destructor's output print *before* the `catch` block ran?
5. What does `virtual` change about how a function call is resolved, and what C capstone does it directly automate?
6. Why does a base class used polymorphically need a `virtual` destructor?
7. When does a template type error actually surface — definition or use — and why does that matter compared to C's `void *`?
8. What does `a + b` translate to when `operator+` is defined as a member function?
9. Why must `std::move(x)` be followed by *not using `x` normally afterward*?
10. What bug class does forgetting to null a moved-from pointer reproduce, and where else in this series was that exact bug class first demonstrated?
11. What's the one-sentence difference between `unique_ptr` and `shared_ptr`?
12. What STL convention does both `std::find` and `std::map::find` share for "not found"?
13. What does CMake actually generate, and why is that more portable than a hand-written Makefile?
14. Name two capstones in this guide that directly answer a "genericize/extend this" practice problem from the C guide.
15. What did the unsynchronized `std::thread` example actually demonstrate, unstaged?

## Answers

1. Default member access — `struct` defaults to `public`, `class` defaults to `private`; everything else is identical.
2. A reference can't be null and can't be reassigned to a different variable after initialization; a pointer can be both. A reference also needs no dereference operator to use.
3. Resource Acquisition Is Initialization — tying a resource's lifetime to an object's constructor/destructor so cleanup is guaranteed by scope rules rather than manual discipline. It matters more in C++ because exceptions can jump through code, skipping any manually-placed cleanup calls C-style error handling would have relied on.
4. Because the object's destructor fires automatically as the stack unwinds through its scope, which happens *before* control ever reaches the `catch` block further up the call stack.
5. It makes the actual function called depend on the object's real runtime type rather than the static type of the reference/pointer. It directly automates C Capstone 5's manually-built vtable (a struct with a function-pointer member, assigned by hand).
6. Deleting a derived object through a base pointer with a non-virtual destructor only runs the base class's destructor — the derived class's destructor (and any cleanup it performs) never runs, a real, undefined-behavior leak.
7. At the point of use, not definition — a template compiles regardless of its contents until instantiated with a type that can't support the operations it needs. This is safer than C's `void *`, which compiles regardless of what's passed and fails (or silently misbehaves) at runtime instead.
8. `a.operator+(b)` — the compiler translates the operator syntax into a call to the member function of that name.
9. Because `std::move` doesn't move anything itself — it just marks `x` as eligible to be moved from. The actual move constructor/assignment leaves `x` in a valid-but-unspecified (commonly empty) state, so using it normally afterward relies on state that's no longer guaranteed to be there.
10. Double-free — first verified in the C guide's Module 4 by deliberately calling `free` twice on the same pointer; reproduced here through an incorrectly-written move constructor that fails to null the source's pointer, leaving two objects both believing they own (and will eventually delete) the same memory.
11. `unique_ptr` enforces exactly one owner at a time (move-only); `shared_ptr` allows multiple owners via reference counting, releasing the resource only when the last owner is destroyed.
12. Returning an iterator equal to the container's `end()` on failure, checked with `!=`/`==` against `end()` rather than a sentinel value like `-1` or `nullptr`.
13. An actual, platform-appropriate build system (Makefiles, Ninja files, an IDE project) from one portable description — a hand-written Makefile is specific to one build tool and platform, while `CMakeLists.txt` generates whatever's appropriate for whoever's actually building it.
14. Capstone 1 (the mini `unique_ptr`) directly answers C Capstone 1's implicit ownership question; Capstone 3 (the generic `Vector<T>`) directly answers C Capstone 1's "genericize it with `void *`" practice problem, properly type-checked this time.
15. That unsynchronized concurrent writes to shared output produce genuinely interleaved, garbled results — a real, first-hand demonstration of why concurrent code needs synchronization, observed directly rather than just described.
