# Module 4 — The Module System: Structures & Signatures

By the end of this module you'll be able to define a module's interface with `module type`, implement it with `module ... : SIG = struct ... end`, and — verified directly, not asserted — confirm that a signature genuinely hides implementation details from anything outside the module, enforced by the compiler. Feeds Capstone 2.

## `module type` and `module ... : SIG = struct ... end`

**You'll be able to:** declare a signature (an interface) and a structure (an implementation) satisfying it.

**Concept**

`module type NAME = sig ... end` declares a signature — a set of required type and value declarations, similar in spirit to Racket's `interface` or a Java interface, but for an entire module rather than a single object. `module Impl : NAME = struct ... end` implements it — the `: NAME` ascription is what enforces that `Impl` actually satisfies every requirement `NAME` declares.

**Example**

```ocaml
module type STACK = sig
  type 'a t
  val empty : 'a t
  val push : 'a -> 'a t -> 'a t
  val pop : 'a t -> ('a * 'a t) option
end

module ListStack : STACK = struct
  type 'a t = 'a list
  let empty = []
  let push x s = x :: s
  let pop = function
    | [] -> None
    | x :: rest -> Some (x, rest)
end

let s = ListStack.push 3 (ListStack.push 2 (ListStack.push 1 ListStack.empty))
```

```
Top: 3
```

Verified directly: pushing `1`, `2`, `3` and popping returns `3` — correct LIFO behavior, implemented internally as an ordinary `'a list`, accessed entirely through `ListStack`'s own exported operations.

> **Pitfall:** `type 'a t` in the signature — with no `= 'a list` after it — declares the type **abstractly**: the signature says "this module has some type `'a t`," without revealing what it actually *is*. This single line is what the next section's verification depends on entirely.

**Practice**

- Add a `size` operation to `STACK` and `ListStack`, and confirm it correctly reports how many elements are on the stack.

## Real, compiler-enforced abstraction

**You'll be able to:** confirm directly that code outside a module genuinely cannot exploit knowledge of its internal representation, even when that representation is "just" a familiar built-in type.

**Concept**

Because `STACK`'s signature declares `type 'a t` abstractly (no `= 'a list`), anything outside the module sees `'a t` as an opaque type — genuinely unrelated, as far as the type checker is concerned, to the fact that `ListStack` happens to implement it as a plain list internally.

**Example — a real, verified compile failure:**

```ocaml
let s = ListStack.push 1 ListStack.empty
let bad = List.length s
```

```
File "m4.ml", line 20, characters 22-23:
20 | let bad = List.length s
                           ^
Error: The value s has type int ListStack.t
       but an expression was expected of type 'a list
```

Verified directly: even though `ListStack.t` really is implemented as an ordinary `'a list` internally, code outside the module **cannot** call `List.length` on a `ListStack.t` value at all — the compiler reports its type as the abstract `int ListStack.t`, not `'a list`, and refuses to treat the two as interchangeable. This is genuine, compiler-enforced information hiding: not a naming convention (an underscore prefix, a "please don't touch this" comment) that a caller could simply ignore, but a real type error that makes bypassing the module's own interface impossible without deliberately breaking the abstraction (`struct ... end` with no `: STACK` ascription at all, which would defeat the purpose entirely).

> **The direct comparison to this series' earlier guides:** this is a stronger guarantee than Racket's `struct` without `#:transparent` (`racket/01-foundations-modules.md`) — Racket's opacity hides a struct's *field values* from casual inspection, but OCaml's module abstraction hides the *entire representation choice* itself, to the point that even a completely unrelated built-in function (`List.length`) that would happen to work correctly at runtime is rejected at compile time, before the program ever executes.

> **Pitfall:** this abstraction is a real design decision the module's author makes deliberately (writing `type 'a t` with no `=`) — omitting the ascription entirely (`module ListStack = struct ... end`, no `: STACK`) exposes the concrete `'a list` type directly, and `List.length` would then work fine. Abstraction in OCaml's module system is opt-in, precise, and visible in the signature's own source, not automatic.

**Practice**

- Remove the `: STACK` ascription from `ListStack`'s definition, recompile, and confirm `List.length s` now works — directly observing what the abstraction was actually preventing.

## Progress check

1. What does `module type` declare, and what's it closest to from earlier guides in this series?
2. What does the `: STACK` ascription in `module ListStack : STACK = struct ... end` actually enforce?
3. What does declaring `type 'a t` in a signature, with no `= ...` after it, accomplish?
4. Why did `List.length s` fail to compile, even though `ListStack.t` really is a plain list internally?
5. How does this module's abstraction guarantee compare to Racket's non-`#:transparent` struct opacity?

### Answers

1. A set of required type and value declarations a module must provide — closest to Racket's `interface`, but for an entire module (potentially many types and functions) rather than a single object's methods.
2. That the module actually satisfies every requirement the named signature declares — if any required value or type were missing, or had an incompatible type, the compiler would reject the definition.
3. It makes the type abstract — code outside the module can use values of that type only through the module's own exported operations, with no way to see or rely on how it's actually represented internally.
4. Because outside the module, the compiler treats `ListStack.t` as a genuinely distinct, opaque type from `'a list` — even though the internal implementation really is a list, the type checker enforces the abstraction boundary the signature declared, rejecting any operation not explicitly exported.
5. It's a stronger guarantee — Racket's struct opacity hides field *values* from casual inspection at the object level; OCaml's module abstraction hides the entire representation *choice*, rejecting even unrelated, would-otherwise-work built-in operations at compile time, before the program runs at all.
