# Module 6 — Move Semantics and Smart Pointers

Ownership, formalized. Module 2 showed constructors/destructors guaranteeing cleanup; this module shows how ownership actually *transfers* between objects without copying, and the standard-library types that make manual RAII wrapper-writing (Capstone 1) mostly unnecessary once you understand what they're doing. Extends Capstone 1.

## Move semantics

**You'll be able to:** write a move constructor; explain why moving is cheaper than copying for a resource-owning type; use `std::move` deliberately.

**Concept**

Copying a `Buffer` that owns a heap array means allocating a whole new array and copying every element — expensive, and often unnecessary, especially when the source object is about to be destroyed anyway (a temporary, or something you're explicitly done with). **Moving** instead transfers ownership of the existing heap allocation directly — the new object takes the pointer, the old object is left in a valid-but-empty state (its pointer set to `nullptr`), and no copying happens at all. `std::move(x)` doesn't itself move anything — it casts `x` to signal "you're allowed to move from this," letting the compiler pick the move constructor over the copy constructor.

**Example**

```cpp
class Buffer {
public:
    Buffer(size_t size) : size_(size), data_(new int[size]) {}

    Buffer(Buffer &&other) noexcept   // move constructor
        : size_(other.size_), data_(other.data_) {
        other.data_ = nullptr;         // leave the source empty -- critical
        other.size_ = 0;
    }
    Buffer(const Buffer &other)         // copy constructor, for comparison
        : size_(other.size_), data_(new int[other.size_]) {
        for (size_t i = 0; i < size_; i++) data_[i] = other.data_[i];
    }
    ~Buffer() { delete[] data_; }
private:
    size_t size_;
    int *data_;
};

Buffer b(3);
Buffer c = std::move(b);   // move constructor runs -- c takes b's data_, b's data_ becomes nullptr
```

Verified, with print statements added to each special member function: `Buffer b(3)` constructs normally; `std::move(b)` triggers `MOVED buffer`, not `COPIED buffer`; and at scope end, destructor order confirms `c` destroys with **valid** data (it owns the transferred array) while `b` destroys with **null** data (`delete[] nullptr` is always safe — this is exactly why `other.data_ = nullptr;` in the move constructor matters: it prevents a double-delete of the same array when both objects' destructors eventually run).

Also verified, separately: `Buffer make_buffer() { return Buffer(5); }` followed by `Buffer a = make_buffer();` printed **neither** `MOVED buffer` nor `COPIED buffer` — just the constructor. This is C++17's **mandatory copy elision**: for this specific pattern (constructing a return value directly), the standard *requires* the compiler to build `a` in place, skipping the move entirely, not just permitting it as an optimization.

> **Pitfall:** forgetting to null out the source's pointer in a move constructor is a real, serious bug — both the moved-from and moved-to objects would then hold the *same* pointer, and both destructors would eventually call `delete` on it: a double-free, exactly Module 4 of the C guide's verified bug class, now reachable through C++'s move mechanism if you write it by hand incorrectly.

**Practice**

- Remove the `other.data_ = nullptr;` line, run under `-fsanitize=address`, and read the double-free diagnostic it produces — the exact ASan output format from the C guide's Module 4, now triggered from C++.
- Add move assignment (`Buffer &operator=(Buffer &&other) noexcept`) alongside the move constructor.

## Smart pointers: RAII you don't have to write yourself

**You'll be able to:** use `std::unique_ptr` and `std::shared_ptr` instead of hand-writing Capstone 1's RAII wrapper.

**Concept**

`std::unique_ptr<T>` is a move-only RAII wrapper around a heap allocation — exactly Capstone 1's shape, already written, tested, and part of the standard library. It cannot be copied (only moved), which directly encodes "exactly one owner at a time." `std::shared_ptr<T>` allows multiple owners via reference counting — the underlying object is only destroyed when the *last* `shared_ptr` referring to it is destroyed or reset.

**Example**

```cpp
{
    std::unique_ptr<Widget> up = std::make_unique<Widget>(1);
    // use up->id(), etc.
}   // Widget automatically destroyed here -- no delete anywhere

std::shared_ptr<Widget> sp1 = std::make_shared<Widget>(2);
std::cout << sp1.use_count();          // 1
{
    std::shared_ptr<Widget> sp2 = sp1;    // shares ownership
    std::cout << sp1.use_count();          // 2
}   // sp2 destroyed, but Widget survives -- sp1 still owns it
std::cout << sp1.use_count();            // back to 1
```

Verified: the `unique_ptr`'s `Widget` is created and destroyed exactly at the scope boundaries shown, with no manual `delete`. The `shared_ptr`'s `use_count()` correctly reports `1`, then `2` after the copy, then back to `1` once the inner scope's copy is destroyed — and `Widget 2` is only actually destroyed at the very end of `main`, once the last owning `shared_ptr` goes out of scope.

> **Pitfall:** `use_count()` genuinely matters for reasoning about *when* a shared resource actually gets released — it's not a debugging curiosity. A `shared_ptr` you thought had gone out of scope, but that's secretly still copied into some container or callback elsewhere, is a real, hard-to-track "why hasn't this been freed yet" bug in real `shared_ptr`-heavy code.

**Practice**

- Rewrite Capstone 1's RAII wrapper (once you've built it) to just be a thin usage example of `std::unique_ptr` instead of your own class, and confirm identical behavior with far less code.
- Create two `shared_ptr`s to the same `Widget` from two different starting points (not by copying one into the other) and observe what happens — hint: this requires `make_shared` exactly once, with both `shared_ptr`s sharing that one control block; creating two independent `shared_ptr`s from the same raw pointer is a real, serious bug (double-free at the end), worth trying deliberately to see.

## Progress check

1. What does `std::move` actually do — does it move anything by itself?
2. Why must a move constructor null out the source object's pointer?
3. What specific C bug class becomes reachable if you forget that step?
4. What's C++17's mandatory copy elision, and why did the `make_buffer()` example print no move/copy message at all?
5. What's the one-sentence difference between `unique_ptr` and `shared_ptr`?
6. Why is `use_count()` more than a debugging curiosity in real `shared_ptr` code?

### Answers

1. No — `std::move(x)` is just a cast that marks `x` as "eligible to be moved from," letting the compiler choose the move constructor/assignment over the copy version. The actual data transfer happens inside whichever move constructor gets called.
2. So the moved-from object's destructor sees a null pointer and does nothing (`delete[] nullptr` is always safe), rather than trying to delete memory the new object now also thinks it owns.
3. Double-free — both the moved-from and moved-to objects would hold the same pointer, and both destructors would eventually call `delete` on it.
4. For specific patterns like constructing a value directly in a `return` statement, the C++17 standard *requires* the compiler to build the result in its final location, skipping any move or copy entirely — not just permitting it as an optimization the compiler might choose to make.
5. `unique_ptr` enforces exactly one owner at a time (move-only, no copying); `shared_ptr` allows multiple owners via reference counting, releasing the resource only when the last owner is destroyed.
6. Because it directly tells you whether a resource is still alive and how many places still hold a reference to it — a `shared_ptr` copy living longer than expected (in a container, a callback, a cycle) is a real, common source of resources not being released when a programmer assumed they would be.
