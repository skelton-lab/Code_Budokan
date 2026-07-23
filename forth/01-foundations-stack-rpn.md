# Module 1 — Foundations: The Stack & RPN

By the end of this module you'll be able to perform arithmetic in Forth's postfix (RPN) notation, manipulate the parameter stack directly with `DUP`/`DROP`/`SWAP`/`OVER`, and — verified directly, not just described — see exactly what happens when a word runs out of stack to work with. Feeds Capstone 1.

## Reverse Polish Notation: no parentheses, no precedence

**You'll be able to:** write and evaluate arithmetic expressions in postfix form, and print results with `.`.

**Concept**

Every one of this series' other languages writes `3 + 4` (infix) or `(+ 3 4)` (prefix, in the Lisp family). Forth writes `3 4 +` — operands first, operator last, popping and pushing a single shared **parameter stack**. There is no operator precedence to remember, because there are no ambiguous expressions to resolve — each word consumes exactly what's on top of the stack when it runs, in the exact order things were pushed.

**Example**

```forth
3 4 + . CR
10 3 - . CR
5 6 * . CR
20 4 / . CR
```

```
7
7
30
5
```

Verified directly: `3 4 +` pushes `3`, pushes `4`, then `+` pops both and pushes their sum (`7`); `.` pops and prints it. `10 3 -` computes `10 - 3 = 7` — note the order: the *first* number pushed is the one an operator like `-`/`/` treats as the left-hand operand, since it was pushed first and ends up second-from-top when the operator runs.

> **Pitfall:** `10 3 -` means `10 - 3`, not `3 - 10` — easy to get backward when first reading RPN, since the operator comes *after* both operands with no visual cue about which one is "first." Reading it as "push 10, push 3, then subtract" (in that literal order) is the correct mental model, not "subtract 3 from 10" read left to right the way infix would suggest.

**Practice**

- Compute `(3 + 4) * 2` in RPN, predicting the result before running it.
- Predict, then verify, what `7 2 /` produces (Forth's default `/` performs integer division).

## Stack manipulation: `DUP`, `DROP`, `SWAP`, `OVER`, and `.S`

**You'll be able to:** inspect and rearrange the stack directly using Forth's core stack-manipulation words.

**Concept**

Since there are no named variables in ordinary Forth code — only the stack — a small vocabulary of words exists purely to rearrange stack contents: `DUP` (duplicate the top item), `DROP` (discard the top item), `SWAP` (exchange the top two items), `OVER` (copy the second item to the top). `.S` prints the entire stack's contents without removing them, essential for checking your work.

**Example**

```forth
1 2 3 .S CR
DROP DROP DROP
5 DUP + . CR
3 4 SWAP - . CR
1 2 OVER . . . CR
```

```
<3> 1 2 3
10
1
1 2 1
```

Verified directly: `.S` shows `<3> 1 2 3` — three items, bottom to top, without consuming them (confirmed by needing three explicit `DROP`s afterward to actually clear them). `5 DUP +` duplicates `5` (stack: `5 5`), then adds (`10`). `3 4 SWAP -` exchanges to `4 3`, then subtracts (`4 - 3 = 1`). `1 2 OVER` copies the second item (`1`) to the top, leaving `1 2 1`, and three `.`s pop and print each in turn: `1`, `2`, `1`.

> **Pitfall, verified directly as a real, raw runtime failure — not a compile error:** a word expecting two stack items, given only one, doesn't fail gracefully.

```forth
: BROKEN ( a b -- sum ) + ;
5 BROKEN . CR
```

```
underflow_test.fs:2: Stack underflow
5 BROKEN >>>.<<< CR
Backtrace:
$133004B20 throw 5
```

Verified directly: `+` inside `BROKEN` needs two items; only `5` was ever pushed before calling it. There is no compile-time check that would have caught this — `BROKEN`'s own stack-effect comment, `( a b -- sum )`, is documentation only, never enforced by the language itself. The error only surfaces at the exact moment `+` actually runs and finds the stack empty underneath it.

**Practice**

- Deliberately write a word requiring three stack arguments, call it with only two, and read the exact error GForth reports.
- Use `OVER` and arithmetic words to compute `a² + b²` given `a` and `b` already on the stack, without using any named variables.

## Progress check

1. What does `10 3 -` compute, and why is that not the same as reading it left-to-right as ordinary subtraction?
2. What does `.S` do, and how is it different from `.`?
3. What does `OVER` do, precisely?
4. What did this module's own verified test prove about what happens when a word runs out of stack items to consume?
5. Is a word's stack-effect comment (like `( a b -- sum )`) enforced by the Forth compiler?

### Answers

1. It computes `10 - 3 = 7` — the first-pushed value (`10`) acts as the left-hand operand once `-` actually runs; reading the tokens strictly left to right as if they were an infix expression would give the wrong intuition about which operand is which.
2. `.S` prints the entire stack's contents without removing them, useful for inspecting state; `.` pops and prints exactly one value, permanently removing it from the stack.
3. It copies the second-from-top stack item to the top, leaving the original second item still in place underneath — a way to reuse a value without consuming it via `DUP` on the wrong item.
4. That it produces a real, raw runtime error (`Stack underflow`) exactly at the moment the under-supplied word runs — there is no compile-time check that catches this in advance.
5. No — it's documentation only, written for human readers; the Forth compiler never checks it against how a word is actually called.
