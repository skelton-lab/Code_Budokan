# Resources & Cheat Sheet

## References

| Resource | Why it matters |
|---|---|
| [ruby-doc.org](https://ruby-doc.org/) | The official API reference — `Enumerable`, `Comparable`, and every core class's full method list |
| *Programming Ruby* ("the Pickaxe book") | The classic, still-relevant deep reference |
| *Metaprogramming Ruby* (Paolo Perrotta) | The direct next step after Module 6 — this guide's `AutoAccessor`/`attribute` examples are simplified versions of that book's territory |
| [RubyGems.org](https://rubygems.org/) | The gem ecosystem `Bundler`/`Gemfile` (Module 7) pulls from |
| This series' [JavaScript guide](../javascript/00-overview.md) | Every "same idea, different name" callback (`.select` vs. `.filter`, `Comparable` vs. manual sort comparators) points back here |
| This series' [Smalltalk guide](../smalltalk/00-overview.md) | Where "everything is an object" and duck typing actually originate — Modules 1 and 4's central callouts depend on it, especially that guide's own Module 5 |
| This series' [Simula guide](../simula/00-overview.md) | Module 3's single-inheritance comparison |
| Yukihiro Matsumoto, various interviews and talks on Ruby's design history | The primary source for the Smalltalk-influence claims in Modules 1 and 4 |

## One-page cheat sheet

| Idea | Snippet |
|---|---|
| Everything is an object | `5.class`, `nil.class`, `true.class` all report real classes |
| Ruby's only falsy values | `nil` and `false` — **not** `0` or `""`, unlike JavaScript |
| Empty check (never truthiness) | `arr.empty?`, not `if arr` |
| Symbol vs. string | `:status` (interned identifier) vs. `"status"` (text data) |
| Lambda (preferred over bare proc) | `square = ->(x) { x * x }`, called as `square.call(x)` / `square.(x)` |
| Class + single inheritance | `class Dog < Animal; end` |
| Mixin | `module Greetable; def greet; ...; end; end` then `include Greetable` |
| Duck typing | No shared type needed — just respond to the method being called |
| Enumerable chain | `arr.select { }.map { }.reduce(:+)` |
| Symbol-to-proc | `arr.map(&:upcase)` |
| `method_missing` | Intercepts undefined method calls dynamically, every time |
| `define_method` | Generates a real method once, at class-definition time |
| Comparable mixin | Define `<=>`, `include Comparable`, get `<`/`>`/`.sort`/`.max` for free |
| Minimal test | `require "minitest/autorun"` then `assert_equal expected, actual` inside a `Minitest::Test` subclass |

## Where to go now

This closes the polymorphism thread that ran through the entire series — C, Simula, C++, JavaScript, Smalltalk, Ruby, several genuinely different mechanisms converging on the same observable idea, with Ruby's own version traced directly back to Smalltalk's rather than treated as a coincidental echo of it. From here: Rails (Module 9's explicit placeholder) is the natural next step if the web-framework layer is what you want next; otherwise, this is a reasonable point to consider the whole "coding polyglot" arc — Fortran, ALGOL, 6502 Assembly, C, Simula, Smalltalk, C++, JavaScript, Ruby — complete enough to read, write, and reason from first principles in whichever of these a given context actually calls for.
