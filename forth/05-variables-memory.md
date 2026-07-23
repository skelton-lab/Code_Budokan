# Module 5 — Variables & Memory

By the end of this module you'll be able to declare persistent, named storage with `VARIABLE`, and read/write it with `@`/`!` — Forth's answer to state that needs to outlive a single word's execution, distinct from the stack. Feeds Capstone 2.

## `VARIABLE`, `@` (fetch), and `!` (store)

**You'll be able to:** declare a variable, store a value into it, and read it back.

**Concept**

`VARIABLE name` reserves one cell of memory and creates a word, `name`, that — when called — pushes that cell's **address**, not its value. `@` ("fetch") pops an address and pushes the value stored there; `!` ("store") pops a value and an address (value first, then address, since `!`'s stack effect is `( value addr -- )`) and writes the value to that address.

**Example**

```forth
VARIABLE COUNTER
0 COUNTER !
COUNTER @ . CR

COUNTER @ 1 + COUNTER !
COUNTER @ . CR

COUNTER @ 1 + COUNTER !
COUNTER @ . CR
```

```
0
1
2
```

Verified directly: `0 COUNTER !` stores `0` into `COUNTER`'s cell. `COUNTER @ .` fetches and prints it. Each subsequent `COUNTER @ 1 + COUNTER !` reads the current value, adds `1`, and writes it back — genuine, persistent mutation across separate top-level statements, unlike anything the stack alone could represent (the stack is emptied of intermediate values by each `.`; `COUNTER`'s cell persists independently).

> **Pitfall:** `COUNTER` (called with no arguments) pushes its **address**, not its stored value — `COUNTER .` would print some large memory address, not `0`/`1`/`2`. Forgetting the `@` is a genuinely common mistake; `COUNTER` and `COUNTER @` mean very different things.

**Practice**

- Declare a `VARIABLE TOTAL`, initialize it to `0`, and write a word `ADD-TO-TOTAL ( n -- )` that adds `n` to it — confirm calling it several times correctly accumulates.

## Wrapping variable access in a word

**You'll be able to:** define a word that encapsulates a common variable-manipulation pattern, rather than repeating the raw `@`/`1 +`/`!` sequence everywhere.

**Concept**

Exactly like Module 2's vocabulary-building, a common `@`/`!` pattern is worth naming as its own word — the same instinct as every other language in this series wrapping a repeated pattern in a function.

**Example**

```forth
: INCREMENT-COUNTER ( -- ) COUNTER @ 1 + COUNTER ! ;
INCREMENT-COUNTER
INCREMENT-COUNTER
COUNTER @ . CR
```

```
4
```

Verified directly, continuing from the running `COUNTER` value of `2` after the previous section: two more calls to `INCREMENT-COUNTER` bring it to `4` — correctly reading the persistent, growing state.

> **Pitfall:** `INCREMENT-COUNTER` closes over `COUNTER` by name, directly — there's no parameter, no explicit "which variable" argument, unlike a function in most other languages. This is a real, deliberate simplicity/rigidity tradeoff: `INCREMENT-COUNTER` can only ever increment `COUNTER` specifically; a version that worked on any variable would need to take that variable's *address* as an explicit stack argument instead.

**Practice**

- Generalize `INCREMENT-COUNTER` into `INCREMENT ( addr -- )`, taking a variable's address as an explicit argument, and confirm it works correctly on two separately-declared variables.

## Progress check

1. What does calling `COUNTER` (with no other words) actually push onto the stack?
2. What's the difference between `@` and `!`, in terms of what each expects on the stack and what each does?
3. Why does `COUNTER @ 1 + COUNTER !` correctly accumulate across separate top-level statements, when the stack itself doesn't persist values between them?
4. What real, common mistake does this module warn about regarding `COUNTER` vs. `COUNTER @`?
5. What's the tradeoff `INCREMENT-COUNTER`'s design makes, by referring to `COUNTER` directly rather than taking an address argument?

### Answers

1. `COUNTER`'s own memory address — not its stored value; reading the value requires an explicit `@` afterward.
2. `@` ("fetch") expects an address on the stack and pushes the value stored there; `!` ("store") expects a value and then an address (`( value addr -- )`) and writes the value into that address's memory cell.
3. Because `VARIABLE`-declared storage is separate from the stack entirely — it's a persistent memory cell that keeps its value between statements, unlike stack contents, which get consumed by whatever word processes them (here, `.` each time).
4. That `COUNTER` alone pushes the variable's address, not its value — a common mistake is calling `COUNTER .` expecting to see the stored value, and instead seeing a raw memory address.
5. Simplicity and directness at the cost of flexibility — `INCREMENT-COUNTER` is easy to read and write but can only ever operate on `COUNTER` specifically; a more general version would need to accept a variable's address as an explicit stack argument to work on any variable.
