# Ruby — A Session-Based Study Guide

**Promise:** comprehensive Ruby fundamentals, built as the deliberate close of this series' polymorphism thread and a genuine contrast in philosophy — where JavaScript makes objects prototype-chained and untyped, Ruby makes everything (literally: numbers, `nil`, `true`) an object of a real class, dispatched through duck typing rather than any declared interface at all. If you've read this series' `smalltalk/` guide, this isn't a coincidental resemblance: Yukihiro Matsumoto (Matz, Ruby's creator) has stated repeatedly that Smalltalk's object model directly shaped Ruby's own design, and that lineage is called out precisely, not just gestured at, throughout this guide.

**Audience:** comfortable with JavaScript fundamentals (this series' `javascript/` companion). No prior Ruby assumed.

**Toolchain (anchored):** Ruby **4.0.6** via Homebrew, **not** the system Ruby macOS ships. This matters concretely, not just as trivia: macOS ships Ruby 2.6.10 (from 2022) at `/usr/bin/ruby`, and it shadows a Homebrew install on `PATH` by default. Every command in this guide assumes `/opt/homebrew/opt/ruby/bin` is ahead of `/usr/bin` on `PATH` — verify with `ruby --version` before anything else; if it reports `2.6.10`, the setup below hasn't taken effect yet.

## Capstone log

| # | Capstone | Proves | Callback |
|---|---|---|---|
| 1 | Shapes, a fourth time | Duck typing / single inheritance | **Closes the polymorphism thread**: manual vtable (C) → `Virtual` (Simula, the origin) → `virtual` (C++) → prototype chain (JS, via Self) → message dispatch (Smalltalk) → duck typing (Ruby, Smalltalk's direct descendant) |
| 2 | A mixin-based capstone | `include`/`extend` modules | Ruby's actual answer to C++'s multiple-inheritance/diamond-problem signpost |
| 3 | An `Enumerable` data pipeline | Blocks, `map`/`select`/`reduce` | Continues JS's `map`/`filter`/`reduce`, C++'s STL + lambdas |
| 4 | A tiny dynamic-accessor DSL | `method_missing`/`define_method` | Deliberately foreshadows Rails — the mechanism ActiveRecord runs on |
| 5 | A small file-processing script | File I/O, real scripting use case | Callback to the C and Fortran guides' file-processing capstones |

## Module list

1. **Foundations: from JavaScript to Ruby** — everything is an object, symbols vs. strings, Ruby's truthy rules, toolchain/`PATH` setup
2. **Blocks, procs, and lambdas** — Ruby's closures
3. **Classes, modules, and mixins** — single inheritance + `include`/`extend` → Capstones 1, 2
4. **Duck typing and polymorphism** → Capstone 1
5. **`Enumerable` and functional-style iteration** → Capstone 3
6. **Metaprogramming basics** — `method_missing`, `define_method` → Capstone 4
7. **Files, gems, and testing** — `Bundler`/`Gemfile`, `minitest` → Capstone 5
8. **Capstones** — all five
9. **Beyond this guide** — signposts, including Rails as an explicit placeholder
10. **Final assessment** + **Resources**

## Ecosystem-breadth triage

| Topic | Test | Treatment |
|---|---|---|
| Mixins | Directly answers C++'s multiple-inheritance signpost | **Full**, Module 3 |
| Metaprogramming | Load-bearing for Capstone 4, sets up Rails | **Full but scoped**, Module 6 |
| Testing (`minitest`) | Cheap, real, consistent with every prior guide | **Full but light**, Module 7 |
| Rails | An explicit separate future decision | **Signpost**, named directly |
| Other Ruby implementations (JRuby, TruffleRuby) | Doesn't touch a capstone | **Signpost** |
| Concurrency (Ractors, Fibers) | Doesn't touch a capstone | **Signpost** |

## Setup

```bash
brew install ruby
echo 'export PATH="/opt/homebrew/opt/ruby/bin:$PATH"' >> ~/.zshrc   # or your shell's rc file
# open a new shell, then:
ruby --version   # must report 4.x, not 2.6.10
```

```bash
ruby program.rb
```
