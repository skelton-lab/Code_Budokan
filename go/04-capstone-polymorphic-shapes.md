# Capstone 2 — A Polymorphic Shape Library

Combines every concept from Module 3: three shapes, each implicitly satisfying `Shape`, and two of them *also* implicitly satisfying Go's own standard-library `Stringer` interface — with the standard library itself, `fmt.Printf`, automatically detecting and using it, no explicit check written anywhere.

## The shapes

```go
type Shape interface {
    Area() float64
}

type Circle struct {
    Radius float64
}

func (c Circle) Area() float64 { return math.Pi * c.Radius * c.Radius }
func (c Circle) String() string { return fmt.Sprintf("Circle(r=%.1f)", c.Radius) }

type Rectangle struct {
    Width, Height float64
}

func (r Rectangle) Area() float64 { return r.Width * r.Height }
func (r Rectangle) String() string { return fmt.Sprintf("Rectangle(%vx%v)", r.Width, r.Height) }

type Triangle struct {
    Base, Height float64
}

func (t Triangle) Area() float64 { return 0.5 * t.Base * t.Height }
// deliberately NO String() method on Triangle
```

`Circle` and `Rectangle` each implement **two** interfaces implicitly and simultaneously — `Shape` (this guide's own) and `fmt.Stringer` (a real interface from Go's standard library, requiring exactly one method: `String() string`) — neither type declares either interface anywhere; both are satisfied purely by having the right-shaped methods. `Triangle` deliberately implements only `Shape`, not `Stringer`, on purpose.

## Verification

```go
shapes := []Shape{
    Circle{Radius: 5.0},
    Rectangle{Width: 4.0, Height: 6.0},
    Triangle{Base: 3.0, Height: 8.0},
}
for _, s := range shapes {
    fmt.Printf("%v has area %.2f\n", s, s.Area())
}
fmt.Printf("Total area: %.2f\n", totalArea(shapes))
```

```
Circle(r=5.0) has area 78.54
Rectangle(4x6) has area 24.00
{3 8} has area 12.00
Total area: 114.54
```

Verified directly, and this is the actual point: `fmt.Printf`'s `%v` verb — an ordinary part of the standard library, written with no knowledge of *this program's* specific types — automatically detects that `Circle` and `Rectangle` implement `Stringer` and calls their `String()` methods (`"Circle(r=5.0)"`, `"Rectangle(4x6)"`). `Triangle`, lacking `String()`, falls back to Go's default struct representation (`{3 8}`, its raw field values) — automatically, with zero special-casing anywhere in this capstone's own code. Every area is independently correct: `π·5² ≈ 78.54`, `4×6 = 24.00`, `0.5×3×8 = 12.00`, summing to `114.54`.

> **The actual point of this capstone:** this is implicit interface satisfaction working across a boundary neither side controls — the standard library's `fmt` package was written years before this capstone's `Circle`/`Rectangle`/`Triangle` types existed, and yet it correctly detects and uses their `Stringer` implementations the moment they're passed to `Printf`, with no registration, no import of anything beyond `fmt` itself, no explicit connection at all. This is the real, practical payoff of "implicit, but statically checked" (Module 3) — any type, written by anyone, automatically participates in any interface it happens to satisfy, including ones defined in code that predates it.

> **Pitfall:** `Triangle`'s missing `String()` isn't an error of any kind — `Stringer` is optional, used only when present; a type that doesn't implement it simply falls back to Go's default formatting, exactly as `Triangle` did here. This is a real, deliberate design point: unlike `Shape` (which `totalArea` genuinely requires), `Stringer` is used opportunistically by anything that happens to check for it, never required.

## Extending it yourself

- Add a `String()` method to `Triangle`, confirm `%v` now uses it instead of the default struct representation, and explain why no other code needed to change for this to take effect.
- Write a second standard-library-style interface of your own (say, `Perimeter interface { Perimeter() float64 }`), implement it on `Rectangle` only, and write a function that checks at runtime whether a given `Shape` also satisfies `Perimeter` (research Go's type assertion syntax, `shape.(Perimeter)`, for this).
