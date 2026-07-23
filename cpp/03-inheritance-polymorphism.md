# Module 3 — Inheritance and Polymorphism

The C guide's closing capstone was building a vtable by hand — a struct with a function pointer as its first member, dispatched through manually. This module re-solves the exact same problem with `virtual`, and shows you precisely what the compiler now does for you — and, if you've read this series' `simula/` guide, precisely where the word `virtual` itself came from. Feeds Capstone 2.

## Virtual functions and abstract classes

**You'll be able to:** define an abstract base class with pure virtual functions, derive concrete classes from it, and call through a base reference/pointer to get the right behavior automatically.

**Concept**

`virtual` on a member function means "the actual function called is decided by the object's real type at runtime, not by the type of the reference/pointer you're calling through." `= 0` after a virtual function's declaration makes it **pure virtual** — no implementation in that class, and the class becomes **abstract**: you can't create a `Shape` directly, only a concrete type that provides every pure virtual function. `: public Shape` on a derived class establishes inheritance; `override` on the derived implementation isn't strictly required by the language, but it's a compiler-checked promise that you're actually overriding something that exists in the base class (catching typos in the function signature at compile time instead of silently creating an unrelated function).

**Example**

```cpp
class Shape {
public:
    virtual double area() const = 0;
    virtual const char *name() const = 0;
    virtual ~Shape() = default;
};

class Circle : public Shape {
public:
    Circle(double r) : radius_(r) {}
    double area() const override { return M_PI * radius_ * radius_; }
    const char *name() const override { return "circle"; }
private:
    double radius_;
};

class Rectangle : public Shape {
public:
    Rectangle(double w, double h) : width_(w), height_(h) {}
    double area() const override { return width_ * height_; }
    const char *name() const override { return "rectangle"; }
private:
    double width_, height_;
};

void print_area(const Shape &shape) {
    std::cout << shape.name() << " area = " << shape.area() << "\n";
}
```

Verified: `print_area` correctly prints `circle area = 12.5664` and `rectangle area = 12` for both a direct call and through a `Shape *shapes[2]` array — `print_area` never knows or checks which concrete type it's holding.

**This is exactly C Capstone 5, one language later.** There: `Shape base` as a struct's first member, holding a function pointer you assigned by hand in `make_circle`/`make_rectangle`. Here: `class Circle : public Shape`, `virtual`, and the compiler generates that same function-pointer table (the real "vtable") and wires it up automatically in the constructor. Same mechanism, same dispatch — you now know exactly what's happening underneath every line of this module.

> **Where the word `virtual` actually comes from, if you've read this series' `algol/`, `simula/`, and `smalltalk/` guides:** this isn't C++ independently choosing a fitting-sounding word. Simula 67 introduced a `Virtual` procedure specification — a base-class procedure a subclass could redefine, dispatched by the object's real type at runtime, exactly the mechanism above — and Bjarne Stroustrup has stated directly, in his own published account of building "C with Classes," that he carried Simula's own terminology across for the identical mechanism (traced in full in the Simula guide's Module 4 and Module 6). The abstract-base-class pattern itself (`Shape` with no working `area`, requiring every concrete subclass to provide one) mirrors Simula's own `Class Shape; Virtual: Procedure area;` shape closely enough that reading the two side by side is worth doing once. And if you've read the Smalltalk guide too: Smalltalk shows the *other* answer to "how should objects dispatch" — every call resolved dynamically at runtime with no compile-time class checking at all. `virtual` here is C++ (via Simula) choosing the opposite: dispatch checked and fixed at compile time everywhere *except* the specific points you mark `virtual` — a deliberate, bounded escape hatch rather than Smalltalk's uniform dynamism, for exactly the performance reasons the Smalltalk guide's own Module 7 works through.

**Practice**

- Add a `Triangle` class — confirm `print_area` needs zero changes, the exact property the C capstone's practice problem asked you to verify by hand.
- Try instantiating `Shape` directly (`Shape s;`) and read the compiler error about the pure virtual functions.
- If you've read the Simula guide: open its Module 4 side by side with this section and map every piece — `Class Shape; Virtual: Procedure area;` against `virtual double area() const = 0;` — the same shape, three decades apart.

## The virtual destructor pitfall

**You'll be able to:** explain why a base class's destructor needs to be `virtual` the moment you `delete` through a base pointer.

**Concept**

If `Shape`'s destructor weren't `virtual`, deleting a `Circle` through a `Shape *` would only run `Shape`'s destructor — `Circle`'s destructor, and any cleanup it does, simply never executes. This is undefined behavior by the standard, and it's a real, easy-to-miss leak trap the moment any derived class owns a resource.

**Example — verified, concrete leak:**

```cpp
class BaseNoVirtual {
public:
    ~BaseNoVirtual() { std::cout << "~BaseNoVirtual\n"; }
};
class DerivedNoVirtual : public BaseNoVirtual {
public:
    DerivedNoVirtual() { data = new int[10]; }
    ~DerivedNoVirtual() { std::cout << "~DerivedNoVirtual\n"; delete[] data; }
private:
    int *data;
};

BaseNoVirtual *b = new DerivedNoVirtual();
delete b;    // prints ONLY "~BaseNoVirtual" -- DerivedNoVirtual's destructor never runs
```

Verified: this prints only `~BaseNoVirtual` — `~DerivedNoVirtual` (and its `delete[] data`) never runs, a real, silent leak. Making the base destructor `virtual` (`Circle`/`Rectangle`'s ancestor `Shape` already does this correctly above) fixes it completely: the same pattern with a `virtual ~BaseVirtual()` correctly prints both `~DerivedVirtual` and `~BaseVirtual`, in the right order.

> **Platform note, consistent with the C guide's finding:** ASan's leak detector isn't available on macOS, so this leak doesn't get flagged automatically here either — the missing `~DerivedNoVirtual` print in the verified output above is the actual evidence, not a sanitizer report. The rule this teaches: **any base class meant to be used polymorphically (deleted through a base pointer) needs a `virtual` destructor**, full stop — `Shape`'s `virtual ~Shape() = default;` above wasn't decoration.

**Practice**

- Reproduce both versions yourself and confirm the printed output matches exactly.
- State the general rule in one sentence: when does a class need a virtual destructor, and when is a non-virtual one fine?

## Progress check

1. What does `virtual` on a member function actually change about how a call is resolved?
2. What does `= 0` after a virtual function declaration mean, and what does it make the containing class?
3. Is `override` required by the language? What does it actually protect against?
4. What C capstone does this module's `Shape`/`Circle`/`Rectangle` example directly re-solve, and what's the one-sentence mapping between the two?
5. What breaks if a base class used polymorphically has a non-virtual destructor?
6. Why didn't ASan flag the non-virtual-destructor leak automatically in this session?
7. Is C++'s `virtual` an independently-chosen word for a similar idea, or something more direct — and what does `virtual` choosing dispatch-at-marked-points-only have to do with Smalltalk's design?

### Answers

1. It makes the actual function called depend on the object's real runtime type, not the static type of the pointer/reference used to call it — this is what enables `print_area` to work correctly without knowing which concrete `Shape` it has.
2. It means the function has no implementation in this class and must be provided by any concrete derived class; the containing class becomes abstract and can't be instantiated directly.
3. No — dispatch works without it. `override` is a compiler-checked promise that the function actually overrides something in the base class, catching signature-mismatch typos (that would otherwise silently create an unrelated new function) as a compile error instead of a runtime surprise.
4. C Capstone 5 (manual vtables via a `Shape base` struct with a function-pointer member). The mapping: `virtual` + inheritance is the compiler automatically generating and wiring up the same function-pointer dispatch table you built and assigned by hand in `make_circle`/`make_rectangle`.
5. Deleting a derived object through a base pointer only runs the base class's destructor — the derived class's destructor, and any cleanup or resource release it performs, never runs. This is undefined behavior and a real leak source.
6. ASan's leak detector (`LeakSanitizer`) isn't supported on macOS, the same platform limitation the C guide's Module 4 hit directly — the missing destructor call had to be confirmed by reading the printed output, not by a sanitizer report.
7. Something more direct — Stroustrup's own published account states he carried Simula's own `Virtual` terminology across for the identical mechanism. `virtual` marking only specific dispatch points (rather than every call being dynamically resolved, as in Smalltalk) is C++ choosing compile-time-checked dispatch everywhere except a deliberate, bounded set of exceptions — structurally close to Simula's own static discipline, and a direct rejection of Smalltalk's fully dynamic, uniform message-dispatch model, for the raw-performance reasons neither Simula nor Smalltalk alone could give Stroustrup.
