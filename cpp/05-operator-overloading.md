# Module 5 — Operator Overloading

The same idea the Fortran guide in this series taught with `interface operator(+)`, and the thing C Module 5 explicitly deferred ("C has no operator overloading") — now with C++'s own syntax. Feeds Capstone 4.

## Overloading arithmetic and comparison operators

**You'll be able to:** define `+`, `==`, and other operators for your own class, so instances behave like a built-in numeric type where that reads naturally.

**Concept**

`Type operator+(const Type &other) const { ... }` as a member function defines what `a + b` means for two `Type` instances — the compiler translates `a + b` into `a.operator+(b)` automatically. Comparison operators work the same way. This is the identical underlying idea to Fortran's `interface operator(+)` block naming a `module procedure` — every language in this series that supports it ends up needing the same three pieces: a function implementing the operation, a way to register it as *the* implementation of that operator, and (in C++'s case, unlike Fortran's separate `interface` block) that registration is just where you define the function.

**Example**

```cpp
class Vec2 {
public:
    Vec2(double x, double y) : x_(x), y_(y) {}

    Vec2 operator+(const Vec2 &other) const {
        return Vec2(x_ + other.x_, y_ + other.y_);
    }
    bool operator==(const Vec2 &other) const {
        return x_ == other.x_ && y_ == other.y_;
    }
private:
    double x_, y_;
};

Vec2 a(1.0, 2.0), b(3.0, 4.0);
Vec2 c = a + b;                  // calls a.operator+(b)
bool same = (c == Vec2(4.0, 6.0)); // calls c.operator==(...)
```

Verified: `c = a + b` correctly produces `(4, 6)`, and `c == Vec2(4,6)` is `true` while `c == a` is `false` — confirming both operators dispatch correctly and `+` genuinely produces a new `Vec2`, not a mutation of either operand (exactly the property Fortran's guide flagged as a requirement: an overloaded operator should behave like the built-in ones, which never mutate their operands).

> **Pitfall:** `operator+` returning `Vec2` by value (a new object), rather than modifying `*this` and returning a reference to it, is deliberate and important — `a + b` must not change `a`, the same expectation you'd have of `3 + 4` never changing `3`. This is the exact same discipline the Fortran guide's operator-overloading pitfall called out: "the function backing an overloaded operator must not mutate its arguments."

**Practice**

- Add `operator-` and `operator*` (scalar multiplication: `Vec2 operator*(double scalar) const`) to `Vec2`.
- Write `operator!=` in terms of `operator==` (`return !(*this == other);`) rather than reimplementing the comparison — a real, common pattern for keeping paired operators consistent by construction.

## Overloading `<<` for printing

**You'll be able to:** make your own type printable with `std::cout <<`, the same way built-in types are.

**Concept**

`std::cout << value` is itself just `operator<<(std::cout, value)` — an operator overload defined by the standard library for its own types. You can define your own overload for a custom type, but it has to be a **free function** (not a member of your class), because the left-hand operand is `std::ostream`, not your type — `friend` grants it access to your class's private members without making it a full member function.

**Example**

```cpp
friend std::ostream &operator<<(std::ostream &os, const Vec2 &v) {
    os << "(" << v.x_ << ", " << v.y_ << ")";
    return os;
}
```

Verified: `std::cout << c` (with `Vec2 c(4,6)`) correctly prints `(4, 6)`, and — because it returns the `ostream` reference — chains correctly with further `<<` calls on the same line (`std::cout << "c = " << c << "\n";` worked exactly as written).

> **Pitfall:** forgetting `return os;` compiles (the function's declared return type still has to be satisfied, so omitting it is actually a compile error, not a silent bug — but it's an extremely common one to hit while writing this exact pattern for the first time, precisely because printing "feels" like it shouldn't need a return value).

**Practice**

- Add a matching `operator<<` for a `Fraction` class (numerator/denominator) formatted as `"3/4"`.
- Compare this session's approach directly against the Fortran guide's `interface operator(+)` block — same underlying idea (register a function as an operator's implementation), different mechanics (a separate `interface` block naming a `module procedure`, versus a member function whose name *is* the operator).

## Progress check

1. What does `a + b` actually translate to when `a` and `b` are instances of a class with `operator+` defined?
2. Why must `operator+` return a new object rather than modifying and returning `*this`?
3. Why does `operator<<` for printing have to be a free function rather than a member of your class?
4. What does `friend` grant a free function, in the context of `operator<<`?
5. What's the one underlying idea shared by Fortran's `interface operator(+)` and C++'s `operator+`, despite the different syntax?

### Answers

1. `a.operator+(b)` — the compiler translates the operator syntax into a call to the member function of that name.
2. Because `a + b` must not change `a`, matching how every built-in arithmetic operator behaves — returning a new object preserves that expectation; mutating and returning `*this` would silently change the left operand, breaking code that assumes `+` is non-destructive.
3. Because the left-hand operand of `os << v` is `std::ostream`, not your type — a member `operator<<` would need to be a member of `ostream`, which you can't add to; a free function taking both operands as parameters is the only way to define it.
4. Access to the class's private members, without making the function an actual member of the class — necessary here because `operator<<` needs to read `Vec2`'s private `x_`/`y_` fields but can't be a `Vec2` member itself.
5. Both let you name a function as the implementation of an operator for your own type, so instances of that type can be used with the operator syntax (`a + b`) instead of an explicit function call (`add(a, b)`) — the mechanics differ (a separate `interface` block vs. a specially-named member function), but the goal and the underlying dispatch are the same idea.
