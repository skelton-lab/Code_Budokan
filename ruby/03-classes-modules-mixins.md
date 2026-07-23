# Module 3 — Classes, Modules, and Mixins

Ruby has single inheritance only — one direct parent class, full stop, no C++-style multiple inheritance and no diamond problem. **Mixins** are Ruby's actual answer to "I want shared behavior across otherwise-unrelated classes": not a second parent, but a module inserted directly into a class's method lookup chain. Feeds Capstones 1, 2.

> **A point of comparison, if you've read the Simula guide:** Simula (1967) also chose single inheritance only — its prefix-class mechanism (that guide's Module 3) allows exactly one prefix per class, the same one-direct-parent constraint Ruby lands on here. The two languages solve "shared behavior across otherwise-unrelated classes" differently, though — Simula's report has no mixin-equivalent mechanism at all; Ruby's `include` is its own, later answer to the same underlying problem C++'s multiple inheritance also tries to solve (Module 4's duck typing sidesteps needing a shared type at all, a third distinct answer to a version of the same question).

## Single inheritance

**You'll be able to:** define a class hierarchy and confirm what `is_a?` and `ancestors` reveal about it.

**Concept**

`class Dog < Animal` is straightforward single inheritance — `Dog` gets everything `Animal` defines, can override it, and `d.is_a?(Animal)` is `true` for any `Dog` instance. `SomeClass.ancestors` reveals the full method-lookup chain, in the order Ruby actually searches it.

**Example**

```ruby
class Animal
  def initialize(name) = (@name = name)
  def speak = "#{@name} makes a sound"
end

class Dog < Animal
  def speak = "#{@name} barks"
end

d = Dog.new("Rex")
puts d.speak                # "Rex barks"
puts d.is_a?(Animal)          # true
puts Dog.ancestors.inspect     # [Dog, Animal, Object, Kernel, BasicObject]
```

Verified: exactly as shown — `Dog.ancestors` reveals not just `Animal`, but the full built-in chain every Ruby object ultimately inherits from (`Object`, `Kernel`, `BasicObject`), confirming this is a real, single, linear lookup path.

> **Pitfall:** `def speak = "#{@name} makes a sound"` (single-line method definition, no `end` needed) is modern Ruby syntax (3.0+) — you'll see the older, equivalent `def speak; "#{@name} makes a sound"; end` or multi-line form constantly in existing code. Both are the same language feature; this guide uses the terser form where it fits on one line.

**Practice**

- Add a `Cat` class also inheriting from `Animal`, overriding `speak`, and confirm `Cat.ancestors` mirrors `Dog`'s structure with `Cat` in place of `Dog`.
- Call `Dog.new("Rex").speak` and `Animal.instance_method(:speak).bind(d).call` — the latter deliberately calls the *overridden* version directly, bypassing `Dog`'s override, to see the ancestor chain being walked explicitly.

## Mixins: `include`

**You'll be able to:** define a module and mix it into multiple, otherwise-unrelated classes.

**Concept**

A `module` groups methods without being instantiable on its own. `include SomeModule` inside a class inserts that module directly into the class's ancestor chain — not as textual copy-paste, but as a genuine additional link Ruby's method lookup walks through. Two classes with no inheritance relationship to each other can both `include` the same module and both gain its behavior.

**Example**

```ruby
module Greetable
  def greet
    "Hello, I'm #{name}"
  end
end

class Person
  include Greetable
  attr_reader :name
  def initialize(name) = (@name = name)
end

class Robot
  include Greetable
  attr_reader :name
  def initialize(name) = (@name = name)
end

puts Person.new("Ada").greet     # "Hello, I'm Ada"
puts Robot.new("R2D2").greet      # "Hello, I'm R2D2"
puts Person.ancestors.inspect      # [Person, Greetable, Object, Kernel, BasicObject]
```

Verified: both `Person` and `Robot` — with no relationship to each other beyond both including `Greetable` — correctly gain a working `greet` method, and `Person.ancestors` confirms `Greetable` is genuinely inserted into the lookup chain (right after `Person`, before `Object`), not merely simulated.

**This is Ruby's direct answer to C++'s multiple-inheritance signpost.** C++ lets a class inherit from two full base classes, with the diamond problem as the price if those bases share an ancestor. Ruby sidesteps the entire problem by allowing only one true parent class, while letting you `include` as many modules as you want — each one a clean, ordered insertion into a single, linear ancestor chain, never a genuine diamond.

> **Pitfall:** `Greetable#greet` calls `name`, a method it doesn't define itself — it works because whatever class includes `Greetable` is expected to provide `name` (here, via `attr_reader :name` in both `Person` and `Robot`). This is a real, deliberate mixin pattern: a module often depends on the including class providing certain methods, similar in spirit to Module 4's duck typing, but worth calling out explicitly since nothing enforces the contract until you actually call `greet` on a class that forgot to define `name`. Verified: including `Greetable` in a class with no `name` method and calling `.greet` raises `NameError: undefined local variable or method 'name'` — not `NoMethodError`, because `name` is called bare, with no explicit receiver, so Ruby reports it as an unresolved identifier rather than a failed method call on a specific object.

**Practice**

- Include `Greetable` in a third class that *doesn't* define `name`, call `.greet` on it, and read the resulting `NameError`.
- Add a second module (`Nameable`, say, providing a shared `full_name` helper) and include both in the same class — confirm `.ancestors` shows both, in the order they were included.

## Progress check

1. Can a Ruby class have more than one direct parent class?
2. What does `include SomeModule` actually do to a class's ancestor chain — copy methods in, or something else?
3. What real problem does Ruby's approach avoid that C++'s multiple inheritance can run into?
4. Why does `Greetable#greet` work correctly on both `Person` and `Robot` despite them sharing no inheritance relationship?
5. What happens if a class includes `Greetable` but doesn't define the `name` method it depends on?

### Answers

1. No — Ruby has single inheritance only; a class has exactly one direct parent (defaulting to `Object` if none is specified).
2. It inserts the module directly into the class's ancestor chain, as a genuine additional link Ruby's method lookup walks through — not a textual copy of the module's methods into the class.
3. The diamond problem — two base classes sharing a common ancestor, creating ambiguity about which version of an inherited method/member should apply. Ruby's single-inheritance-plus-modules design never creates that structure in the first place.
4. Both classes `include Greetable`, which inserts the same module (and its `greet` method) into each class's own ancestor chain — no relationship between `Person` and `Robot` themselves is needed for both to gain the mixed-in behavior.
5. Calling `.greet` raises `NameError: undefined local variable or method 'name'` the moment it tries to resolve the bare `name` — the dependency is real but entirely unenforced until the method actually runs.
