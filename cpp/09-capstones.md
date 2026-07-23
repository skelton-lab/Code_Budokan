# Module 9 — Capstones

Five projects, each directly answering a specific "what does this feature save me" question raised across Modules 1–8. Every one compiled and ran with this guide's full sanitizer flags.

## Capstone 1 — A mini `unique_ptr`, from scratch

**Proves:** constructors/destructors (Module 2), move-only semantics (Module 6), templates (Module 4).

```cpp
template <typename T>
class MyUniquePtr {
public:
    explicit MyUniquePtr(T *ptr = nullptr) : ptr_(ptr) {}
    ~MyUniquePtr() { delete ptr_; }

    MyUniquePtr(const MyUniquePtr &) = delete;              // no copying
    MyUniquePtr &operator=(const MyUniquePtr &) = delete;

    MyUniquePtr(MyUniquePtr &&other) noexcept : ptr_(other.ptr_) {
        other.ptr_ = nullptr;
    }
    MyUniquePtr &operator=(MyUniquePtr &&other) noexcept {
        if (this != &other) {
            delete ptr_;
            ptr_ = other.ptr_;
            other.ptr_ = nullptr;
        }
        return *this;
    }

    T *operator->() const { return ptr_; }
    T &operator*() const { return *ptr_; }
    T *get() const { return ptr_; }
private:
    T *ptr_;
};
```

Verified against a `Widget` class printing on construction/destruction: exactly **one** `"Widget 1 destroyed"` prints at the end, despite the object being moved from `p` to `q` partway through — confirming no double-delete. `p.get()` correctly reports `nullptr` after the move, and `q->id()` still works, holding the transferred ownership.

**Practice**

- Compare this directly against `std::unique_ptr` (Module 6) — every line here maps to something the standard-library version already does.
- Add `operator bool()` so `if (p)` works, checking whether the pointer is non-null.

## Capstone 2 — Shapes, with real inheritance

**Proves:** `virtual`, abstract base classes (Module 3) — this capstone *is* Module 3's fully-built example; revisit it here as one stop on this series' running polymorphism thread (C's manual vtable → Simula's `Virtual`, the direct historical origin, if you've read that guide → C++'s `virtual` here → JavaScript's prototype chain → Ruby's duck typing).

See Module 3 in full for the verified `Shape`/`Circle`/`Rectangle` hierarchy — and, if you've read the Simula guide, Module 3's callout there tracing `virtual` back to Simula 67's own identically-named mechanism. The capstone extension: add a `Triangle` and confirm `print_area` needs zero changes — the property that makes polymorphism worth the vtable machinery in the first place.

**Practice**

- Add `Triangle` (three side lengths, area via Heron's formula) without touching `print_area`.
- Add a non-pure virtual function with a default implementation (e.g., `virtual void describe() const { std::cout << name() << ", area " << area() << "\n"; }`) and override it in just one derived class — confirm the others correctly fall back to the base version.

## Capstone 3 — A generic growable container, from scratch

**Proves:** templates (Module 4) applied to Capstone 1 (C guide)'s exact problem, with move semantics (Module 6) used correctly in the growth logic.

```cpp
template <typename T>
class Vector {
public:
    Vector() : data_(nullptr), size_(0), capacity_(0) {}
    ~Vector() { delete[] data_; }

    void push_back(const T &value) {
        if (size_ == capacity_) grow();
        data_[size_++] = value;
    }
    T &operator[](size_t i) { return data_[i]; }
    size_t size() const { return size_; }
    size_t capacity() const { return capacity_; }
    T *begin() { return data_; }
    T *end() { return data_ + size_; }

private:
    void grow() {
        size_t new_cap = capacity_ == 0 ? 4 : capacity_ * 2;
        T *new_data = new T[new_cap];
        for (size_t i = 0; i < size_; i++) new_data[i] = std::move(data_[i]);
        delete[] data_;
        data_ = new_data;
        capacity_ = new_cap;
    }
    T *data_;
    size_t size_, capacity_;
};
```

Verified: `Vector<int>` grows `0 → 4 → 8 → 16` across 10 `push_back` calls (identical capacity progression to C Capstone 1's `IntArray`), and the same template works unmodified for `Vector<std::string>` — genericity C's `void*` approach could never give you with compile-time type checking.

> **Note:** `grow()` uses `std::move(data_[i])` when transferring elements to the new array — using plain copy-assignment here would work for `int` but would be needlessly expensive (and, for a type without a copy constructor, wouldn't compile at all) for something like `std::string`. This is Module 6's move semantics doing real work, not just a syntax choice.

**Practice**

- Compare directly against `std::vector` (Module 7) — you've now built, by hand, a simplified version of what it does internally.
- Add bounds-checked `at(i)` (throwing `std::out_of_range` on an invalid index) alongside the unchecked `operator[]`.

## Capstone 4 — `Vec2` and `Fraction`, with overloaded operators

**Proves:** operator overloading (Module 5) — a direct three-language callback to Fortran's `interface operator(+)`.

See Module 5 for the fully-verified `Vec2` (`operator+`, `operator==`, `operator<<`). Capstone extension: build `Fraction` (numerator/denominator) the same way.

```cpp
class Fraction {
public:
    Fraction(int num, int den) : num_(num), den_(den) {}
    Fraction operator+(const Fraction &other) const {
        return Fraction(num_ * other.den_ + other.num_ * den_, den_ * other.den_);
    }
    friend std::ostream &operator<<(std::ostream &os, const Fraction &f) {
        os << f.num_ << "/" << f.den_;
        return os;
    }
private:
    int num_, den_;
};
```

**Practice**

- Build and verify `Fraction` yourself, including a test case like `Fraction(1,2) + Fraction(1,3)` (expect `5/6`, unreduced — note in a comment that a real implementation would reduce via GCD, and that's a deliberate scope cut, not an oversight).
- Add `operator*` for `Fraction` multiplication.

## Capstone 5 — The C key-value tool, rebuilt with the STL

**Proves:** what `std::map`, `std::string`, and `<fstream>` give you over C Capstone 4's hand-rolled version (Module 7).

```cpp
std::map<std::string, std::string> load_kv(const std::string &path) {
    std::map<std::string, std::string> pairs;
    std::ifstream f(path);
    std::string line;
    while (std::getline(f, line)) {
        auto eq = line.find('=');
        if (eq == std::string::npos) continue;
        pairs[line.substr(0, eq)] = line.substr(eq + 1);
    }
    return pairs;
}
```

Verified against the same 3-line `key=value` file used in the C guide: loads all 3 pairs, `lang` correctly resolves to `"C++"`, and a missing key correctly reports not-found via the `end()` convention.

**Directly compare this against C Capstone 4:** no `fopen`/`fclose` (an `ifstream`'s destructor closes the file automatically — RAII, Module 2, doing real work again), no fixed-size `char[32]`/`char[64]` buffers or `snprintf` bounds juggling (`std::string` grows itself), no `strchr`/`strcspn` manual parsing (`.find('=')` and `.substr()`), and no fixed `max_pairs` cap (`std::map` grows on its own, the way `std::vector` does). Every one of those simplifications is a specific earlier module's payoff, not a coincidence.

**Practice**

- Add `save_kv`, writing the map back out to a file with `std::ofstream`.
- Time-box exercise: reimplement C Capstone 3 (the bytecode VM) using `std::vector<Instr>` and a `std::vector` of `std::function` for dispatch, and decide for yourself whether the STL version is actually clearer than the raw C array-of-function-pointers — not every STL rewrite is automatically better, and this is a good one to form your own opinion on.

## Progress check

1. What single verified fact confirms Capstone 1's `MyUniquePtr` has no double-delete bug?
2. What property of Capstone 2's design makes adding `Triangle` require zero changes to `print_area`?
3. Why does Capstone 3's `grow()` use `std::move` instead of plain copy-assignment when transferring elements?
4. What C-guide problem does Capstone 4 directly answer, across three different languages in this series?
5. Name three specific things Capstone 5's STL version doesn't need to manage that C Capstone 4 had to handle by hand.

### Answers

1. Exactly one `"Widget 1 destroyed"` printed at the end of the program, despite the object being moved partway through — if the move constructor had failed to null the source pointer, both `p` and `q`'s destructors would eventually call `delete` on the same pointer, printing the destruction message (or crashing) twice.
2. `print_area` only ever interacts with the `Shape` interface (`area()`, `name()`), never with any concrete type directly — any new class deriving from `Shape` and implementing those virtual functions works with existing code automatically, with no modification needed anywhere that only knows about `Shape`.
3. Move-assigning transfers ownership of each element's resources directly rather than copying them — correct and cheap for `int` (no real difference), but necessary for correctness or performance for types like `std::string` that own their own heap memory.
4. Operator overloading for a custom type — the same underlying idea as Fortran's `interface operator(+)` and C's explicit "not available" note, now with C++'s own `operator+` syntax.
5. Manual buffer sizing (`char[32]`/`char[64]` with `snprintf`), manual file open/close (`fopen`/`fclose`), and a fixed maximum pair count (`max_pairs`) — `std::string`, `ifstream`'s RAII-based lifetime, and `std::map`'s automatic growth replace all three respectively.
