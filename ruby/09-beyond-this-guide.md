# Module 9 — Beyond This Guide

None of these change how any of the five capstones turn out.

### Rails — the explicit placeholder for the supplementary discussion you mentioned wanting

**What it is:** the dominant Ruby web framework, and the thing that made Ruby famous outside its own community — models (ActiveRecord, running directly on Module 6's `define_method` mechanism, scaled up), views, controllers, routing, migrations, all built on Ruby's metaprogramming and mixin capabilities.

**Why it's a signpost here, deliberately:** you asked for Rails as a *supplementary discussion*, not folded into this guide's core — the same reasoning that kept TypeScript inside the JavaScript guide (additive tooling on the same language) but is now keeping Rails separate (a large, opinionated framework with its own conventions, best treated as its own `DesignCurriculum` pass once you want it).

**What this guide already prepared you for, concretely:** Capstone 4's `attribute :title, String` is structurally the same idea as an ActiveRecord model's column-derived accessors. `Priceable`/`Comparable` (Capstone 2) is the same mixin composition Rails' own modules (`ActiveModel::Validations`, and many others) use throughout. Duck typing (Module 4) is why Rails code reads as unusually trusting of "if it responds to the right methods, it works" — that's not a framework quirk, it's the language underneath it.

### Other Ruby implementations

**What it is:** MRI/CRuby (what this guide anchors to) is the reference implementation. JRuby runs on the JVM (real interop with Java libraries); TruffleRuby (GraalVM-based) targets high-performance workloads with JIT compilation.

**Why it's a signpost:** MRI is what essentially all Ruby code, including Rails, targets by default; the alternatives solve specific problems (JVM interop, raw performance) neither of this guide's capstones needed.

### Concurrency: Fibers and Ractors

**What it is:** `Fiber` gives cooperative, manually-controlled coroutines (the low-level primitive underneath Ruby's own `Enumerator` lazy-iteration machinery). `Ractor` (Ruby 3+) provides genuine parallel execution with enforced isolation between ractors — Ruby's answer to safely using multiple CPU cores, given MRI's Global VM Lock otherwise serializes threaded code.

**Why it's a signpost:** matches the same reasoning the C, C++, and JavaScript guides gave for their own concurrency signposts (`pthreads`, `std::thread`) — real and important, but not load-bearing for any of this guide's five capstones.

### RSpec vs. `minitest`

**What it is:** RSpec is a separate, extremely widely-used testing gem with its own DSL (`describe`/`it`/`expect(...).to eq(...)`), stylistically quite different from `minitest`'s more ordinary-Ruby `assert_equal` style.

**Why it's a signpost:** `minitest` (Module 7) ships with Ruby and needed no extra tooling to demonstrate this guide's verification discipline — real-world Ruby projects, especially Rails ones, lean heavily toward RSpec, worth knowing about the moment you're reading or contributing to existing Ruby code rather than starting fresh.
