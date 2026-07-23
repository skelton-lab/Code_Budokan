# Module 4 — Duck Typing and Polymorphism

The most radical mechanism in this series' whole polymorphism thread — and, if you've read the Smalltalk guide, not a Ruby invention: no shared base class required at all, no declared interface, nothing checked until the method is actually called. "If it responds to `.area`, it's usable as something with an area." Feeds Capstone 1.

## Polymorphism with no shared type

**You'll be able to:** write a function that works on any object responding to the right methods, regardless of class hierarchy.

**Concept**

C needed a hand-built struct with a function pointer. C++ needed `virtual` and a declared base class. TypeScript needed an `interface` and `implements`. Ruby needs **none of that** — `print_area(shape)` calls `shape.area` and `shape.name`; if the object responds to both, it works, completely independent of what class it is or what it inherits from. This is **duck typing**: "if it walks like a duck and quacks like a duck, treat it as a duck" — the check is entirely at the point of use, entirely at runtime, with no declared contract anywhere.

**Example**

```ruby
class Circle
  def initialize(radius) = (@radius = radius)
  def area = Math::PI * @radius ** 2
  def name = "circle"
end

class Rectangle
  def initialize(w, h) = (@w = w; @h = h)
  def area = @w * @h
  def name = "rectangle"
end

# Circle and Rectangle share NO base class, NO module, NOTHING -- not even Object
# beyond what every Ruby class already gets automatically.
def print_area(shape)
  puts "#{shape.name}: area = #{shape.area}"
end

[Circle.new(2), Rectangle.new(3, 4)].each { |s| print_area(s) }
```

Verified: `circle: area = 12.566370614359172` and `rectangle: area = 12` — `print_area` works on both, and `Circle.ancestors.include?(Rectangle)` is confirmed `false`: they are genuinely, verifiably unrelated classes. Nothing about `print_area` cares.

**This closes the polymorphism thread running through this entire series.** C: a struct with a function pointer, assigned by hand. Simula (1967), if you've read that guide: `Virtual` procedures — the actual historical origin of C++'s keyword, still requiring a declared common base class. C++: `virtual`, a compiler-generated function-pointer table, same requirement. JavaScript: a live prototype chain, still requiring a shared prototype somewhere in the chain, itself traced (JavaScript guide's Module 3) to Self and the Smalltalk lineage. Smalltalk itself, if you've read that guide: message sends resolved entirely at runtime against whatever object receives them — no shared type required, no compile-time check, ever, because Smalltalk never had one to route around. Ruby here: the identical no-shared-type-required outcome, arrived at from the language that Matz has himself stated took Smalltalk's object model as direct inspiration (Module 1). This isn't Ruby independently landing on the same idea a fifth time — the Smalltalk guide's own Module 5 makes the claim explicitly: Ruby's duck typing is a direct descendant of Smalltalk's model, not an approximation of it. Genuinely different mechanisms across the rest of this list, the same observable outcome each time: the right code runs for the right object.

**Example — proof this generalizes to genuinely unrelated types:**

```ruby
class WeirdSquare
  def initialize(side) = (@side = side)
  def area = @side * @side
  def name = "weird square (not even related to Circle/Rectangle)"
end
print_area(WeirdSquare.new(5))   # works perfectly -- area = 25
```

> **Pitfall, and a precise contrast with Module 3's `NameError`:** calling `print_area` on an object *missing* `area` — `Broken.new` with only a `name` method — raises `NoMethodError: undefined method 'area' for an instance of Broken`, not the `NameError` Module 3's bare `name` call produced. The distinction is exactly the receiver: `shape.area` (an explicit receiver, here) fails as `NoMethodError`; a bare, receiver-less identifier that Ruby can't resolve as either a local variable or a method (Module 3's `name` inside `Greetable#greet`) fails as `NameError`. Both are "this didn't respond the way I expected," but the exact error class — and the debugging instinct it should trigger — differs.

**Practice**

- Build a fourth "shape" class with a completely different internal structure (say, storing pre-computed area at construction instead of a formula) and confirm `print_area` still works, unmodified.
- Deliberately trigger both `NameError` (Module 3's pattern) and `NoMethodError` (this module's pattern) side by side, and write one sentence distinguishing when each occurs.

## Progress check

1. What does `print_area(shape)` actually require of `shape`, and what does it explicitly *not* require?
2. What polymorphism mechanisms has this series covered, one per language, and what's the one-sentence version of each?
3. Why does calling `.area` on an object missing that method raise `NoMethodError` rather than `NameError`?
4. What concrete evidence proves `Circle` and `Rectangle` in this module's example are genuinely unrelated, not just organized to look that way?
5. What's the practical tradeoff duck typing makes compared to TypeScript's `interface`/`implements` approach from the JavaScript guide?
6. Is Ruby's duck typing an independently-arrived-at idea, or a direct descendant of an earlier language's model? What's the evidence?

### Answers

1. It requires that `shape` responds to `.area` and `.name` — nothing about which class `shape` is, what it inherits from, or any declared interface. Duck typing checks entirely by attempting the call, at the moment it's made.
2. C: a hand-built struct with a function pointer, assigned manually. Simula: `Virtual` procedures, the historical origin of C++'s keyword. C++: `virtual`, a compiler-generated function-pointer table (vtable), requiring a declared common base class. JavaScript: a live, runtime-walked prototype chain. Smalltalk: message sends resolved entirely at runtime, no shared type ever required. Ruby: the same no-shared-type-required outcome as Smalltalk, arrived at as its direct descendant.
3. Because `.area` is called with an explicit receiver (`shape.area`) — Ruby unambiguously knows this is a method call on a specific object and that object doesn't define it, which is precisely what `NoMethodError` reports. `NameError` (Module 3) occurs for a bare, receiver-less identifier Ruby can't resolve as either a local variable or an implicit-`self` method call.
4. `Circle.ancestors.include?(Rectangle)` returns `false` — their ancestor chains share nothing beyond Ruby's universal built-in classes (`Object`, `Kernel`, `BasicObject`), confirming no deliberate relationship exists between them.
5. Duck typing gets checked only when the method is actually called, at runtime, with no compile-time verification and no declared contract to read — TypeScript's `interface`/`implements` catches a missing method at compile time, before the program ever runs, at the cost of requiring an explicit, declared interface every implementing class must state conformance to.
6. A direct descendant, per the Smalltalk guide's own Module 5 — Smalltalk's object model (runtime-resolved message dispatch, no compile-time type system) is the historical origin of "if it responds to the message, it works." Ruby didn't arrive at this independently; it inherited the lineage, the same way Matz has stated Ruby's object model generally took Smalltalk as direct inspiration (Module 1).
