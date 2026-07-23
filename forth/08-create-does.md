# Module 8 — `CREATE` and `DOES>`: Defining New Defining Words

By the end of this module you'll be able to write a word that itself defines *other* words — each with its own private data and shared custom behavior — Forth's own answer to language-oriented programming, verified directly with two working examples. Feeds Capstone 3.

## `CREATE`: making a new word with its own data

**You'll be able to:** use `CREATE` to define a new word that, when called, pushes its own reserved memory address.

**Concept**

`CREATE name` defines a new word, `name`, that — when later called — pushes the address of a small piece of memory reserved for it, similar in spirit to `VARIABLE` (Module 5), but as a building block: `CREATE` alone doesn't say what happens *after* that address is pushed. `,` ("comma") compiles the top of the parameter stack into the most recently created word's data area, storing an initial value there.

**Example — a constant, built from `CREATE`:**

```forth
: CONSTANT2 ( n "name" -- ) CREATE , DOES> @ ;
100 CONSTANT2 HUNDRED
HUNDRED . CR
```

```
100
```

`CONSTANT2` is itself a **word that defines other words** — calling `100 CONSTANT2 HUNDRED` doesn't just run some code; it creates a brand-new word, `HUNDRED`, with `100` stored in its own private data cell. `DOES>` is the piece that makes this work: everything after `DOES>` in `CONSTANT2`'s own definition becomes the **runtime behavior of every word `CONSTANT2` creates** — here, `@` (fetch the stored value). Verified directly: `HUNDRED` — a word that didn't exist until `CONSTANT2` was called — correctly pushes `100` when invoked.

> **This is the direct, precise parallel to `racket/`'s custom `#lang`:** Racket's Capstone 4 built an entirely new *language*, with its own restricted vocabulary, hosted on Racket's platform. `CONSTANT2` builds an entirely new *class of words* — every word `CONSTANT2` creates shares the same `DOES>` behavior, defined once, applied to as many differently-named, differently-valued words as needed. Same underlying instinct — extend the language's own vocabulary, rather than merely using it — expressed one level down, at individual word definitions rather than a whole file's syntax.

**Practice**

- Use `CONSTANT2` to define three more named constants and confirm each independently holds and returns its own correct value.

## A richer example: building an array-maker

**You'll be able to:** use `CREATE`/`DOES>` together with `CELLS`/`ALLOT` to define a genuine, working array-defining word.

**Concept**

`CELLS` converts a count into the equivalent number of memory-cell-sized bytes; `ALLOT` reserves that many additional bytes in the most recently created word's data area. Combined, `n CELLS ALLOT` reserves space for `n` cells — a real array, not just one value.

**Example**

```forth
: ARRAY ( n "name" -- ) CREATE CELLS ALLOT DOES> SWAP CELLS + ;
5 ARRAY MYARRAY

10 0 MYARRAY !
20 1 MYARRAY !
30 2 MYARRAY !
0 MYARRAY @ . CR
1 MYARRAY @ . CR
2 MYARRAY @ . CR
```

```
10
20
30
```

Verified directly: `5 ARRAY MYARRAY` creates `MYARRAY` with room for 5 cells. `MYARRAY`'s own `DOES>` behavior (`SWAP CELLS + `) takes an index already on the stack, converts it to a byte offset, and adds it to `MYARRAY`'s own base address — producing the correct address for `@`/`!` to read or write that specific element. Storing `10`, `20`, `30` at indices `0`, `1`, `2` and reading them back confirms every value landed at the correct offset, independently verified rather than just trusted because the code compiled.

> **Pitfall:** neither `CONSTANT2` nor `ARRAY` check their own bounds or types at all — `MYARRAY`'s `DOES>` code will happily compute an address for index `99` on a 5-cell array, silently reading or writing memory that doesn't belong to it, with no error of any kind. This is the exact same "no safety net" philosophy Module 1's stack-underflow finding demonstrated, now showing up at the level of custom-defined data structures: `CREATE`/`DOES>` gives real power with zero built-in protection against misuse.

**Practice**

- Modify `ARRAY`'s `DOES>` code to bounds-check the index against the array's declared size (hint: you'll need `ARRAY` itself to store the size alongside the allocated cells, using `,` the way `CONSTANT2` did), and confirm an out-of-range access is now caught rather than silently corrupting memory.

## Progress check

1. What does `CREATE name` do, on its own, before any `DOES>` is involved?
2. What does everything after `DOES>` in a defining word's own definition become?
3. What's the direct, precise parallel this module draws to `racket/`'s custom `#lang` capstone?
4. In the `ARRAY` example, what does `SWAP CELLS +` compute, and why does it need `SWAP` first?
5. What real, honest limitation does this module state about both `CONSTANT2` and `ARRAY`?

### Answers

1. It defines a new word that, when later called, pushes the address of a small piece of memory reserved specifically for it — nothing about what happens after that address is pushed is determined yet.
2. The runtime behavior shared by every word the defining word itself creates — defined once, in the defining word's own body, applied identically to each differently-named word it's used to create.
3. That both are the same underlying instinct — extending the language's own vocabulary rather than merely using it — expressed at different levels: Racket's custom `#lang` builds an entirely new language for a whole file; `CREATE`/`DOES>` builds an entirely new class of words, sharing custom behavior, within ordinary Forth.
4. It computes the memory address of a specific array element — the index, converted to a byte offset via `CELLS`, added to the array's base address. `SWAP` is needed because `DOES>`'s code runs with the array's own base address already on top of the stack (pushed automatically when the array word is called); `SWAP` reorders it so `CELLS` operates on the index, not the address.
5. That neither performs any bounds or type checking at all — an out-of-range index silently reads or writes memory outside the array with no error raised, the same "no safety net" philosophy verified directly in Module 1's stack-underflow finding, now showing up at the level of custom data structures.
