# Module 10 — Beyond This Guide

Every topic here failed the capstone-impact test — real, worth knowing exists, but not required by any of this guide's three capstones. Each entry states what it is, why it matters, and where to go deeper.

### Polymorphic variants

**What it is:** an alternative to Module 2's ordinary variant types — written with a leading backtick (`` `Circle ``) and requiring no type declaration at all before use.

**Why it matters, verified directly:**
```ocaml
let describe = function
  | `Circle r -> Printf.sprintf "circle r=%f" r
  | `Square s -> Printf.sprintf "square s=%f" s

let () =
  print_endline (describe (`Circle 5.0));
  print_endline (describe (`Square 3.0))
```
```
circle r=5.000000
square s=3.000000
```
Confirmed working, with no `type shape = Circle of float | ...` declaration anywhere — the constructors themselves are the type. Genuinely useful for cases needing more structural flexibility than Module 2's closed variants (a function that only needs to accept "some subset of possible cases," for instance), but a real, deeper type-system topic Capstone 1 didn't need.

**Where to go next:** the OCaml manual's chapter on polymorphic variants.

### GADTs (Generalized Algebraic Data Types)

**What it is:** an extension to Module 2's ordinary variant types letting each constructor refine the type parameter of the type it belongs to — enabling genuinely more precise, statically-checked invariants than ordinary ADTs can express.

**Why it matters:** a real, powerful feature for encoding invariants directly in the type system (a classic example: a well-typed expression evaluator where the type system itself guarantees a boolean expression can never accidentally evaluate to an integer), but genuinely advanced territory well beyond what any of this guide's capstones needed.

**Where to go next:** the OCaml manual's GADT chapter; *Real World OCaml*'s own treatment.

### First-class modules

**What it is:** ordinarily, modules exist at a separate "level" from values — Module 4/5's structures and functors are resolved entirely at compile time. First-class modules let a module be packaged up and passed around *as an ordinary value*, at runtime.

**Why it matters:** genuinely useful for choosing a module implementation dynamically (based on a runtime condition, a config file, etc.) rather than the purely-static functor instantiation this guide's Capstone 2 used throughout.

**Where to go next:** the OCaml manual's first-class modules chapter.

### OCaml 5's effect handlers

**What it is:** OCaml 5 (this guide's own anchored major version) introduced algebraic effect handlers — a mechanism for expressing certain control-flow patterns (like Scheme's `call/cc`, `scheme/07-continuations.md`) more directly, and the foundation of OCaml 5's multicore/parallelism support.

**Why it matters, reported honestly:** a genuinely new, modern feature specific to this exact major version. A direct attempt to verify a minimal working example against this guide's own toolchain did **not** succeed on the first try — a syntax error was reported, which may reflect an incorrect attempt at the syntax rather than a real toolchain limitation. Unlike every other claim in this guide, this one is reported as **unverified**, not as a confirmed-working feature, precisely because this guide's own standard (verify before claiming) couldn't be met for this topic without more time than its capstone-impact justified.

**Where to go next:** the OCaml manual's effect handlers chapter, and the release notes for OCaml 5.0, for a verified, working starting example.

### OCaml's object system (`class`)

**What it is:** despite "Objective" being literally in its name, OCaml has a full class-based object system (`class`, inheritance, method dispatch) — genuinely present, but rarely used in idiomatic modern OCaml, where the module system (Modules 4–5) fills most of the role classes play in other languages.

**Why it matters:** worth knowing it exists, precisely so a reader encountering `class` in real OCaml code isn't confused about what it is — but none of this guide's capstones needed it, since the module system already covered this guide's own polymorphism and abstraction needs.

**Where to go next:** the OCaml manual's object-oriented programming chapter.

### Dune project structure

**What it is:** this guide compiled every example as a single file via `ocamlopt file.ml -o binary` — a real OCaml project uses `dune` (installed alongside this guide's toolchain but not exercised) to manage multi-file builds, dependencies, and tests.

**Why it matters:** genuinely necessary the moment a real project outgrows a single file, but this guide's capstones stayed intentionally single-file throughout.

**Where to go next:** the Dune documentation's quick-start guide.

## The wider ecosystem

- **[OCaml manual](https://ocaml.org/manual)** — the anchored toolchain's own authoritative reference.
- **_Real World OCaml_** (Minsky, Madhavapeddy, Hickey) — a widely-recommended, freely available full introduction, including GADTs and first-class modules.
- **This series' [Racket guide](../racket/02-contracts.md)** and **[Clojure guide](../clojure/00-overview.md)** — the module/interface comparisons this guide's Modules 4–5 drew on directly.
- **This series' upcoming Haskell guide** — the direct, honest contrast this guide's Capstone 3 pointed toward: strict vs. lazy, and OCaml's deliberate embrace of mutation versus Haskell's opposite stance.
