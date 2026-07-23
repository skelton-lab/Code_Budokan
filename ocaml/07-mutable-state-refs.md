# Module 7 — Mutable State: `ref` Cells

By the end of this module you'll be able to use `ref` cells and mutable record fields for genuine, first-class mutable state — stated directly: OCaml is not purely functional, and this guide doesn't pretend otherwise. Feeds Capstone 3.

## `ref`, `:=`, and `!`

**You'll be able to:** create a mutable reference cell, update it, and read its current value.

**Concept**

`ref initial_value` creates a mutable cell holding `initial_value`. `cell := new_value` updates it; `!cell` reads its current value. Unlike every value this guide has used so far (which, once bound with `let`, never changes), a `ref` cell's contents genuinely can.

**Example**

```ocaml
let counter = ref 0
let increment () = counter := !counter + 1
let () =
  increment (); increment (); increment ();
  Printf.printf "Counter: %d\n" !counter
```

```
Counter: 3
```

Verified directly: three calls to `increment` correctly leave `counter` holding `3` — genuine, sequential mutation of the same underlying cell, not three independent immutable rebindings.

> **Pitfall:** it's worth being precise about what's actually mutable here — `counter` itself (the name) is an ordinary, immutable `let` binding, referring to *a ref cell*; what's mutable is the cell's *contents*, accessed via `!`/`:=`. This distinction matters the moment a `ref` cell is passed around: the cell itself (and thus any mutation through it) is shared across every reference to it, exactly like Clojure's `atom` (`clojure/06-value-vs-identity-atoms.md`) — a real, direct parallel between two very differently-styled languages solving the same underlying problem.

**Practice**

- Create a `ref` holding a list, and write a function that pushes a new element onto it via `:=`, confirming the list genuinely grows across repeated calls.

## Mutable record fields

**You'll be able to:** declare a record type with an explicitly mutable field, and update it in place with `<-`.

**Concept**

A record field marked `mutable` in its type declaration can be updated in place with `<-`, without needing a separate `ref` wrapper — a genuinely different, second mechanism for mutation, used when the thing that needs to change is naturally one field of a larger structure.

**Example**

```ocaml
type account = { name : string; mutable balance : float }

let deposit acc amount = acc.balance <- acc.balance +. amount
let withdraw acc amount = acc.balance <- acc.balance -. amount

let () =
  let acc = { name = "Ada"; balance = 100.0 } in
  deposit acc 50.0;
  withdraw acc 30.0;
  Printf.printf "%s balance: %f\n" acc.name acc.balance
```

```
Ada balance: 120.000000
```

Verified directly: `100.0 + 50.0 - 30.0 = 120.0`, matching exactly — `acc.balance` was genuinely mutated in place across two separate function calls, while `acc.name` (not marked `mutable`) stays fixed for the record's lifetime.

> **Pitfall:** only fields explicitly marked `mutable` can use `<-` — attempting to reassign `acc.name` would be a compile-time error, not a runtime one. This is a real, deliberate, per-field choice a record's author makes, not an all-or-nothing property of the whole type; a record can freely mix mutable and immutable fields, as `account` does here.

**Practice**

- Add a `mutable transaction_count : int` field to `account`, incrementing it on every `deposit`/`withdraw` call, and confirm it correctly tracks the number of operations performed.

## Progress check

1. What's the difference between what `ref`/`:=`/`!` provide versus a plain `let` binding?
2. What's actually immutable about a `ref` cell's own binding, even though its contents can change?
3. What direct parallel does this module draw to a language from earlier in this series?
4. What's the difference between a `ref` cell and a `mutable` record field, as two mechanisms for the same underlying capability?
5. Can a record type mix mutable and immutable fields? What determines which is which?

### Answers

1. A plain `let` binding, once made, never changes what it refers to; a `ref` cell's *contents* can be updated repeatedly via `:=`, with `!` reading the current value at any point.
2. The name bound to the ref cell itself (e.g., `counter`) is an ordinary, immutable `let` binding — it always refers to the same cell; what changes is that cell's contents, not which cell the name points to.
3. Clojure's `atom` (`clojure/06-value-vs-identity-atoms.md`) — a `ref` cell, like an atom, is a shared, mutable identity that multiple references can point to and update, with the same "the cell is shared, not copied" implication.
4. `ref` creates a standalone mutable cell holding one value on its own; a `mutable` record field is a mutation capability attached to one specific field of a larger, potentially otherwise-immutable structure — used when the thing that changes naturally belongs to a bigger record rather than standing alone.
5. Yes — mutability is a per-field choice, explicitly marked with `mutable` in the type declaration; a record can freely mix mutable and immutable fields, as `account`'s `name` (immutable) and `balance` (mutable) demonstrate.
