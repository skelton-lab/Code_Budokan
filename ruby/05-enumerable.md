# Module 5 — Enumerable and Functional-Style Iteration

The same `map`/`filter`/`reduce` idea from the JavaScript and C++ guides, with Ruby's own names and a genuinely distinctive shorthand (symbol-to-proc) neither of those languages has. Feeds Capstone 3.

## `map`, `select`, `reject`, `reduce`

**You'll be able to:** transform, filter, and combine a collection using Ruby's `Enumerable` methods.

**Concept**

`.map { |n| ... }` transforms every element (same as JavaScript's `.map`). `.select { |n| ... }` keeps elements where the block is truthy (JavaScript calls this `.filter`); `.reject` is `.select`'s exact inverse. `.reduce(initial) { |acc, n| ... }` combines every element into one value (same as JavaScript's `.reduce`) — and Ruby adds a shorthand: `.reduce(:+)` applies the `+` operator between every element directly, no block needed at all.

**Example**

```ruby
nums = [5, 3, 8, 1, 9, 2, 7]

doubled = nums.map { |n| n * 2 }
evens = nums.select { |n| n.even? }
odds = nums.reject { |n| n.even? }
sum = nums.reduce(0) { |acc, n| acc + n }
sum2 = nums.reduce(:+)     # identical result, terser
sum3 = nums.sum              # even terser -- a dedicated method for the common case

puts doubled.inspect   # [10, 6, 16, 2, 18, 4, 14]
puts evens.inspect      # [8, 2]
puts odds.inspect        # [5, 3, 1, 9, 7]
puts sum, sum2, sum3      # 35, 35, 35
```

Verified: all three sum computations agree (`35`), `evens`/`odds` correctly partition the array, and `doubled` matches doubling every element — the same dataset and the same results as this series' JavaScript guide's equivalent example, confirming the underlying idea transfers directly even as the method names differ (`.select`, not `.filter`).

> **Pitfall:** `.select` versus `.filter` isn't just a naming quirk to memorize — Ruby *does* also have `.filter` as an alias for `.select` (they're identical), so you'll see both in real code. `.reject`, though, has no `.filter`-style JavaScript equivalent as a single built-in method; JavaScript code doing the equivalent typically negates the predicate inside `.filter` instead.

**Practice**

- Chain `.select { |p| p > 2 }.map { |n| n * n }.reduce(:+)` and confirm it matches the JavaScript guide's identical chained result (`228`) on the same input.
- Use `.sort { |a, b| b <=> a }` for a descending sort, and explain what `<=>` (the "spaceship operator," returning `-1`, `0`, or `1`) is doing.

## Symbol-to-proc: `&:method_name`

**You'll be able to:** use `&:method_name` as shorthand for a block that just calls one method on each element.

**Concept**

`arr.map { |x| x.upcase }` and `arr.map(&:upcase)` do exactly the same thing — `&:upcase` converts the symbol `:upcase` into a proc that calls `.upcase` on whatever it's given, then passes that proc as the block. This shorthand is idiomatic Ruby specifically because "call this one method on every element" is such a common case that spelling out the full block feels redundant once you know the shorthand.

**Example**

```ruby
words = ["hello", "world"]
puts words.map(&:upcase).inspect   # ["HELLO", "WORLD"]
```

Verified: identical result to the full-block version `words.map { |w| w.upcase }`.

> **Pitfall:** `&:method_name` only works for a block that takes exactly one argument and does nothing but call that one method on it — the moment you need any additional logic (even something as small as `x.upcase + "!"`), you're back to a full block. It's a shorthand for a specific common case, not a general replacement for blocks.

**Practice**

- Rewrite `nums.select { |n| n.even? }` using `&:even?`.
- Find one case in your own earlier practice code where `&:method_name` would apply, and rewrite it.

## Progress check

1. What Ruby method is the direct equivalent of JavaScript's `.filter`?
2. What does `.reject` do, in terms of `.select`?
3. What does `.reduce(:+)` do, and how does it differ from `.reduce(0) { |acc, n| acc + n }`?
4. What does `&:upcase` expand to, conceptually, when passed as a block argument?
5. When does the `&:method_name` shorthand stop being usable?

### Answers

1. `.select` (also aliased as `.filter`, identical to `.select`) — keeps elements where the block returns truthy.
2. It's `.select`'s exact inverse — it keeps elements where the block returns falsy (equivalently, rejects elements where the block is truthy).
3. `.reduce(:+)` applies the `+` operator directly between every element with no explicit block — functionally identical to `.reduce(0) { |acc, n| acc + n }`, just terser, since `+` needs no accumulator logic spelled out beyond "combine these two values."
4. A block that takes one argument and calls `.upcase` on it — equivalent to `{ |x| x.upcase }`.
5. The moment the block needs to do anything beyond calling exactly one method with no arguments on each element — any additional logic requires falling back to a full block.
