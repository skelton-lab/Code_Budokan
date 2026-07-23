# Module 2 — Defining Words: `:` and `;`

By the end of this module you'll be able to define new words in terms of existing ones, and build up a real vocabulary the way every Forth program actually grows — one small, composable word at a time. Feeds Capstone 1.

## `: name ... ;`

**You'll be able to:** define a new word, and call it exactly like any built-in word.

**Concept**

`: name definition ;` is Forth's *only* abstraction mechanism — no separate function/procedure/method syntax, no distinction in how a user-defined word is called versus a built-in one. Once defined, a new word joins the **dictionary** and is indistinguishable, from the caller's side, from `+` or `DUP` or anything else.

**Example**

```forth
: SQUARE ( n -- n^2 ) DUP * ;
5 SQUARE . CR
```

```
25
```

Verified directly: `SQUARE` duplicates its input and multiplies — `5 SQUARE` leaves `25` on the stack, printed correctly. Calling `SQUARE` looks exactly like calling `DUP` or `+` — there's no special syntax marking it as "user-defined."

> **Pitfall:** the stack-effect comment, `( n -- n^2 )`, is *inside* the definition but plays no functional role at all — Module 1 already demonstrated the compiler never checks it. It exists purely so a human reader knows what `SQUARE` expects and leaves behind, without needing to read the definition's actual body to find out.

**Practice**

- Define a word `HALVE` that divides its input by 2, and confirm `10 HALVE .` prints `5`.

## Building vocabulary: words defined in terms of other words

**You'll be able to:** define a new word that calls a word you defined earlier, and explain why this is how real Forth programs actually grow.

**Concept**

Once `SQUARE` exists, it's just another word — any later definition can call it exactly like a built-in. This is the actual, practical shape of Forth development: start with primitives, define small words in terms of them, then define larger words in terms of those, building a vocabulary specific to whatever problem the program is solving.

**Example**

```forth
: CUBE ( n -- n^3 ) DUP SQUARE * ;
3 CUBE . CR

: GREET ( -- ) ." Hello from a custom word!" CR ;
GREET

: DOUBLE-THEN-SQUARE ( n -- (2n)^2 ) 2 * SQUARE ;
3 DOUBLE-THEN-SQUARE . CR
```

```
27
Hello from a custom word!
36
```

Verified directly: `CUBE` calls `SQUARE` (defined in Module 1's own file) to compute `n × n² = n³` — `3 CUBE = 27`. `GREET` demonstrates `." text"` for printing a literal string, with no stack arguments needed at all. `DOUBLE-THEN-SQUARE` composes `2 *` with a call to `SQUARE` — `3 → 6 → 36`, correctly matching `(2×3)² = 36`.

> **Pitfall:** a word must be **fully defined before** it's used in a later definition — Forth compiles top to bottom, one definition at a time, with no forward-declaration mechanism for ordinary word definitions. `CUBE`'s use of `SQUARE` only works because `SQUARE` was already defined earlier in the same file; reversing the order would fail to compile, reporting `SQUARE` as an unknown word.

**Practice**

- Define `FOURTH-POWER` in terms of `SQUARE`, calling it twice, and confirm `2 FOURTH-POWER .` prints `16`.
- Reorder two of this module's definitions so a word is used before it's defined, and read the exact compile error GForth reports.

## Progress check

1. What's the *only* abstraction mechanism Forth provides for defining new operations?
2. From the caller's perspective, is there any syntactic difference between calling a built-in word like `DUP` and a user-defined word like `SQUARE`?
3. What real role does a stack-effect comment like `( n -- n^2 )` play, functionally?
4. Why does `CUBE`'s definition need `SQUARE` to already exist earlier in the same file?
5. What's the practical, real-world consequence of Forth having no forward-declaration mechanism for ordinary word definitions?

### Answers

1. `: name ... ;` — defining a new word in the dictionary; there's no separate function, procedure, method, or class syntax at all.
2. No — once defined, a word is indistinguishable from a built-in one when called; both are simply names looked up in the dictionary.
3. None, functionally — it's documentation only, read by humans, never checked or enforced by the compiler.
4. Because Forth compiles top to bottom, one definition at a time — a word must be fully defined and already present in the dictionary before any later definition can reference it.
5. Real Forth programs must be structured with primitives first, building up through progressively larger words defined in terms of earlier ones — there's no way to write mutually-recursive definitions, or reference a word that will be defined "later in the file," the way forward declarations allow in other languages.
