# Module 4 — Control Flow

By the end of this module you'll be able to branch with `IF`/`ELSE`/`THEN`, loop a fixed number of times with `DO`/`LOOP`, and loop until a condition holds with `BEGIN`/`UNTIL` — all usable only inside a word definition, operating on the same shared stack every other word does. Feeds Capstone 2.

## `IF`/`ELSE`/`THEN`

**You'll be able to:** branch based on a boolean value already on the stack.

**Concept**

`condition IF true-branch ELSE false-branch THEN` — the condition must already be on the stack (as a flag: `0` for false, any nonzero value, conventionally `-1`, for true) *before* `IF` runs; `IF` consumes it. `ELSE` is optional; `THEN` always ends the construct (it means "end if," not "then do this," a real, easy point of confusion for a reader coming from any other language in this series).

**Example**

```forth
: ABS-VAL ( n -- |n| ) DUP 0 < IF NEGATE THEN ;
-5 ABS-VAL . CR
5 ABS-VAL . CR

: CLASSIFY ( n -- )
  DUP 0 =
  IF ." zero"
  ELSE
    DUP 0 < IF ." negative" ELSE ." positive" THEN
  THEN
  DROP CR ;
0 CLASSIFY
-3 CLASSIFY
7 CLASSIFY
```

```
5
5
zero
negative
positive
```

Verified directly: `ABS-VAL` correctly leaves `5` for both `-5` and `5` — `DUP 0 <` pushes a boolean flag from comparing the duplicated value against `0`, and `IF NEGATE THEN` negates only when that flag was true, consuming it either way. `CLASSIFY` correctly identifies zero, negative, and positive inputs via nested `IF`/`ELSE`/`THEN`.

> **Pitfall:** `THEN` in Forth means "end of this if-construct," not "the branch to take when true" — a reader's first instinct, coming from any C-family or English-reading intuition, is almost always wrong here. `IF ... THEN` alone (no `ELSE`) is a complete, valid construct meaning "do this only if true, otherwise skip it entirely" — `THEN` closes it, it doesn't introduce a branch.

**Practice**

- Write a word `SIGN ( n -- -1|0|1 )` returning `-1`, `0`, or `1` based on the sign of its input, using nested `IF`/`ELSE`/`THEN`.

## `DO`/`LOOP`: counted iteration

**You'll be able to:** write a fixed-count loop, using `I` to access the current loop index.

**Concept**

`limit start DO ... LOOP` runs the body once for each value from `start` up to (but **excluding**) `limit` — note the argument order, limit first, then start, opposite of how you'd read the range aloud. `I`, used inside the loop body, pushes the current index onto the stack.

**Example**

```forth
: COUNTUP ( n -- ) 1 DO I . LOOP ;
6 COUNTUP CR
```

```
1 2 3 4 5
```

Verified directly: `6 COUNTUP` runs `1 DO I . LOOP` — with `6` as the limit (pushed first, by `COUNTUP`'s caller) and `1` as the start (pushed second, literally in the definition) — printing `I` for each value from `1` up to but not including `6`: `1 2 3 4 5`.

> **Pitfall:** `DO`'s limit is exclusive — `6 COUNTUP` prints five numbers (`1` through `5`), not six, a genuinely easy off-by-one mistake for a reader assuming an inclusive range. The argument order (`limit start DO`, limit first) is equally easy to get backward on a first attempt.

**Practice**

- Write a word that prints every number from `10` down to `1` using `DO`/`LOOP` with a negative step (research `+LOOP`, a variant allowing a custom step value, to make this work correctly).

## `BEGIN`/`UNTIL`: loop until a condition holds

**You'll be able to:** write a loop that continues until a computed condition becomes true, for cases where the iteration count isn't known in advance.

**Concept**

`BEGIN loop-body condition UNTIL` repeats `loop-body`, checking `condition` (which must leave a flag on the stack) after each pass — the loop continues while the flag is false, and stops the moment it's true. Unlike `DO`/`LOOP`, there's no separate "index" variable — whatever state the loop needs must be tracked explicitly on the stack (or in a variable, Module 5).

**Example**

```forth
: COUNTDOWN ( n -- )
  BEGIN
    DUP .
    1 -
    DUP 0 =
  UNTIL
  DROP ;
5 COUNTDOWN CR
```

```
5 4 3 2 1
```

Verified directly: each pass prints the current value (`DUP .`), decrements it (`1 -`), then checks whether it's now `0` (`DUP 0 =`) to decide whether to loop again. The final `DROP` cleans up the `0` left on the stack once the loop exits (the `DUP` before the check leaves an extra copy that `UNTIL` consumes as its flag, but the *value itself* — now `0` — is still sitting underneath, needing an explicit `DROP`).

> **Pitfall:** forgetting the final `DROP` after a `BEGIN`/`UNTIL` loop like this one is a real, common mistake — the loop's own exit condition necessarily leaves the terminating value on the stack (it had to be there to be checked), and nothing removes it automatically. Running `COUNTDOWN` without the trailing `DROP` would leave a stray `0` on the stack after every call, silently accumulating across repeated calls until something eventually breaks in an unrelated, confusing way.

**Practice**

- Write a word that repeatedly halves a number (integer division) until it reaches `0` or `1`, printing each intermediate value, using `BEGIN`/`UNTIL`.

## Progress check

1. What must already be true about the stack before `IF` runs?
2. What does `THEN` actually mean in Forth's `IF`/`ELSE`/`THEN`, and why is that easy to misread?
3. In `6 COUNTUP` (defined as `1 DO I . LOOP`), why does it print five numbers, not six?
4. What's the fundamental difference between `DO`/`LOOP` and `BEGIN`/`UNTIL`, in terms of what each one needs to know in advance?
5. Why did `COUNTDOWN` need an explicit `DROP` after its `BEGIN`/`UNTIL` loop?

### Answers

1. A boolean flag (`0` for false, nonzero for true) must already be on top of the stack — `IF` consumes it directly, computed by whatever came before it in the definition.
2. It means "end of this if-construct," not "then do the following" — a reader's natural English-reading instinct almost always misreads it as introducing the true-branch, when it's actually the construct's closing keyword.
3. Because `DO`'s limit argument is exclusive — `1 DO ... 6 LOOP`-equivalent (limit `6`, start `1`) runs for index values `1` through `5`, stopping before ever reaching `6`.
4. `DO`/`LOOP` needs a known start and limit in advance, with `I` automatically tracking the index; `BEGIN`/`UNTIL` needs no predetermined count at all — it just repeats until a condition computed fresh each pass becomes true, with any needed state tracked explicitly by the programmer.
5. Because the loop's own exit condition necessarily left the terminating value (`0`) on the stack after `UNTIL` consumed its own flag copy — nothing removes that leftover value automatically, so it has to be cleaned up explicitly or it silently accumulates on the stack across calls.
