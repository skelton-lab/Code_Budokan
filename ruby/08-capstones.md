# Module 8 — Capstones

Five projects built from Modules 1–7. Every one verified by actually running it against real data.

## Capstone 1 — Shapes, the fourth and final time

**Proves:** duck typing (Module 4) — the close of this entire series' polymorphism thread.

See Module 4 for the fully-verified `Circle`/`Rectangle`/`WeirdSquare` example, deliberately built with zero shared ancestry beyond `Object` itself — and, if you've read the Smalltalk guide, that module's callout on why this isn't Ruby independently reinventing Smalltalk's model, but inheriting it directly.

**Practice**

- Write the one-paragraph comparison Module 4's practice problem asked for — C's vtable, Simula's `Virtual` (if you've read that guide), C++'s `virtual`, JavaScript's prototype chain, Smalltalk's message dispatch, Ruby's duck typing — and treat it as this whole series' actual final exam question.

## Capstone 2 — A mixin combining custom behavior with a built-in module

**Proves:** `include` across unrelated classes (Module 3), composed with Ruby's own built-in `Comparable` module.

```ruby
module Priceable
  include Comparable
  def <=>(other) = price <=> other.price
  def affordable?(budget) = price <= budget
end

class Product
  include Priceable
  attr_reader :name, :price
  def initialize(name, price) = (@name = name; @price = price)
end

class Service
  include Priceable
  attr_reader :name, :price
  def initialize(name, price) = (@name = name; @price = price)
end

items = [Product.new("Widget", 25), Service.new("Consulting", 200), Product.new("Gadget", 75)]
puts items.sort.map(&:name).inspect
puts items.max.name
puts items.select { |i| i.affordable?(50) }.map(&:name).inspect
```

Verified: `items.sort` correctly orders `["Widget", "Gadget", "Consulting"]` by price, `.max` correctly picks `"Consulting"` — **neither `.sort` nor `.max` was written anywhere in this code.** Defining one method (`<=>`, the "spaceship operator") and including Ruby's built-in `Comparable` module gives every comparison operator and every sort/min/max method, for free, across two completely unrelated classes (`Product`, `Service`).

> **This is `Priceable` itself including `Comparable`** — a module including another module, composing mixins the same way you'd compose anything else. `affordable?(50)` correctly selects only `"Widget"` (`25 <= 50`), confirming the custom method and the borrowed `Comparable` behavior coexist correctly on the same mixed-in module.

**Practice**

- Add a `Bundle` class combining several `Product`s and `Service`s, giving it its own `price` method (a sum), and confirm `Priceable`/`Comparable` work on it identically with zero extra code.

## Capstone 3 — An `Enumerable` data pipeline

**Proves:** `map`/`select`/`reduce` chaining (Module 5), on a richer dataset than the teaching example.

Build the direct Ruby equivalent of the JavaScript guide's product-tax-pipeline capstone:

```ruby
products = [
  { name: "Widget", price: 25, in_stock: true },
  { name: "Gadget", price: 75, in_stock: false },
  { name: "Gizmo", price: 40, in_stock: true },
  { name: "Doohickey", price: 15, in_stock: true },
]

with_tax = products
  .select { |p| p[:in_stock] }
  .map { |p| p.merge(price_with_tax: (p[:price] * 1.1).round(2)) }
  .sort_by { |p| p[:price_with_tax] }

with_tax.each { |p| puts "#{p[:name]}: #{p[:price_with_tax]}" }
```

**Practice**

- Verify this yourself and compare the output directly against the JavaScript guide's identical capstone — same data, same computation, different syntax (`.merge` here plays the same non-mutating role JavaScript's `{ ...product, ... }` spread did there).
- Add `.sum { |p| p[:price] }` for the total in-stock value, matching the JavaScript capstone's equivalent line.

## Capstone 4 — A dynamic accessor DSL with validation

**Proves:** `define_method` (Module 6), directly foreshadowing how a Rails model class actually works.

```ruby
class Model
  def self.attribute(name, type)
    define_method(name) { instance_variable_get("@#{name}") }
    define_method("#{name}=") do |val|
      raise TypeError, "#{name} must be a #{type}" unless val.is_a?(type)
      instance_variable_set("@#{name}", val)
    end
  end
end

class Book < Model
  attribute :title, String
  attribute :year, Integer
end

b = Book.new
b.title = "Metaprogramming Ruby"
b.year = 2010
puts "#{b.title} (#{b.year})"

b.year = "not a number"   # raises TypeError: year must be a Integer
```

Verified: `Book`'s `title`/`title=`/`year`/`year=` methods — none hand-written — work correctly, and assigning a wrong-typed value correctly raises `TypeError: year must be a Integer`, exactly matching the validation logic inside `attribute`.

> **`attribute :title, String` reading almost exactly like real ActiveRecord/`dry-types` declarative syntax is not a coincidence** — this is genuinely the shape real Ruby ORMs and validation libraries take, built from exactly this mechanism, scaled up.

**Practice**

- Add a third `attribute` (say, `:price, Float`) and confirm it works with zero changes to `Model`.
- Add a `required` option (`attribute :title, String, required: true`) that raises if the value is ever set to `nil`.

## Capstone 5 — A file-processing report generator

**Proves:** real file I/O, the `CSV` standard library, `group_by`/`max_by` (Module 7) — a callback to both the C and Fortran guides' own file-processing capstones.

```ruby
require "csv"

records = CSV.read("scores.csv", headers: true).map(&:to_h)

by_student = records.group_by { |r| r["name"] }
by_student.each do |name, rows|
  avg = rows.sum { |r| r["score"].to_f } / rows.size
  puts "#{name}: average #{avg.round(1)}"
end

top_scorer = records.max_by { |r| r["score"].to_i }
puts "top single score: #{top_scorer["name"]} in #{top_scorer["subject"]} (#{top_scorer["score"]})"
```

Verified against a real 6-row CSV (3 students, 2 subjects each): correctly computes each student's average (`Ada: 91.5`, `Alan: 81.0`, `Grace: 92.0`) and correctly identifies the single highest score (`Grace in Math (99)`) — `group_by` and `max_by` doing real, checkable aggregation work, not just iteration.

**Practice**

- Write the computed averages back out to a new CSV file (shown in the verified version: `File.write("report.csv", ...)`), and read it back to confirm round-trip correctness.
- Compare this directly against C Capstone 4 (the key-value file tool) and the Fortran guide's data-pipeline capstone — same underlying task (read structured data, compute a summary, report it), three languages, three very different amounts of code required.

## Progress check

1. What single method did `Priceable` need to define to gain `.sort`, `.max`, and every comparison operator via `Comparable`?
2. What does `.merge` do in Capstone 3's pipeline, and why does it matter that it's non-mutating?
3. What real-world Ruby pattern does Capstone 4's `attribute :title, String` syntax directly resemble?
4. What does `group_by` return, structurally, and how does Capstone 5 use that structure?
5. Across this series, which language needed the least code for "read structured data from a file, compute a summary, report it" — and is less code automatically better?

### Answers

1. `<=>` (the spaceship operator) — `Comparable` implements every comparison operator and array-comparison method (`sort`, `max`, `min`, `<`, `>`, `between?`, and more) purely in terms of whatever `<=>` returns.
2. It returns a new hash with the existing key-value pairs plus the added one, leaving the original untouched — matching the non-mutating discipline `.select`/`.map`/`.sort_by` already maintain, and directly analogous to the JavaScript guide's spread-operator (`{ ...product, ... }`) equivalent.
3. Real Ruby ORMs and validation libraries (ActiveRecord being the most prominent) — declaring an attribute's name and type generates real accessor methods with built-in validation, exactly the pattern `Model.attribute` implements here at a smaller scale.
4. A hash mapping each distinct group key to an array of the records sharing that key (`{"Ada" => [...], "Alan" => [...], "Grace" => [...]}`) — Capstone 5 iterates that hash directly, computing each student's average from their own array of score records.
5. Ruby's version is noticeably terser than C's hand-rolled parsing (Capstone 4 there) thanks to the `CSV` standard library and `Enumerable` methods doing most of the structural work — but terser isn't automatically better: C's version makes every allocation, buffer size, and parsing step explicit and controllable, which matters enormously in contexts (embedded systems, tight performance budgets) where Ruby's convenience has real, corresponding runtime costs.
