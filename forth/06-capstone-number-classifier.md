# Capstone 2 — A Number-Classifying Loop Program

Combines every concept from Modules 4–5: a real FizzBuzz — counted iteration, nested conditionals, and two `VARIABLE`-backed running counters — with correct output verified against the well-known expected sequence.

## The program

```forth
VARIABLE FIZZ-COUNT
VARIABLE BUZZ-COUNT

: FIZZ? ( n -- flag ) 3 MOD 0 = ;
: BUZZ? ( n -- flag ) 5 MOD 0 = ;

: FIZZBUZZ-ONE ( n -- )
  DUP FIZZ? OVER BUZZ? AND
  IF
    ." FizzBuzz"
    1 FIZZ-COUNT +!
    1 BUZZ-COUNT +!
  ELSE DUP FIZZ?
    IF ." Fizz" 1 FIZZ-COUNT +!
    ELSE DUP BUZZ?
      IF ." Buzz" 1 BUZZ-COUNT +!
      ELSE DUP .
      THEN
    THEN
  THEN
  DROP CR ;

: FIZZBUZZ ( n -- )
  0 FIZZ-COUNT !
  0 BUZZ-COUNT !
  1+ 1 DO I FIZZBUZZ-ONE LOOP
  ." Fizz count: " FIZZ-COUNT @ . CR
  ." Buzz count: " BUZZ-COUNT @ . CR ;

15 FIZZBUZZ
```

`FIZZ?`/`BUZZ?` are small, named predicates (Module 2's vocabulary-building instinct, now producing boolean flags instead of numbers). `+!` — new here, a natural one-word extension of Module 5's `@`/`!` — takes `( n addr -- )` and adds `n` directly to whatever's stored at `addr`, the Forth equivalent of `+=`. `FIZZBUZZ-ONE`'s nested `IF`/`ELSE`/`THEN` checks "both" before checking "either alone," exactly the order that matters — a number divisible by both 3 and 5 needs to print `"FizzBuzz"` once, not `"Fizz"` and `"Buzz"` separately, and needs to increment *both* counters.

## Verification

```
$ gforth capstone2.fs
1
2
Fizz
4
Buzz
Fizz
7
8
Fizz
Buzz
11
Fizz
13
14
FizzBuzz
Fizz count: 5
Buzz count: 3
```

Checked directly against the well-known expected FizzBuzz sequence for 1–15 — every single line matches. The counts are independently verifiable too: multiples of 3 in `1..15` are `3, 6, 9, 12, 15` (five numbers) — matching `Fizz count: 5` exactly, since `15` (FizzBuzz) correctly incremented `FIZZ-COUNT` alongside the four pure `"Fizz"` cases. Multiples of 5 are `5, 10, 15` (three numbers) — matching `Buzz count: 3`.

> **Pitfall:** the "both" check (`DUP FIZZ? OVER BUZZ? AND`) has to come **first**, before the individual `FIZZ?`/`BUZZ?` checks — if the individual checks ran first, `15` would match `FIZZ?` alone and print `"Fizz"`, never reaching the "both" branch at all. Ordering matters here in exactly the same way it would in any other language's `if`/`elif` chain, just expressed through nested Forth `IF`/`ELSE`/`THEN` instead.

> **Pitfall, a real stack-juggling detail:** `DUP FIZZ? OVER BUZZ? AND` needs `OVER`, not `DUP`, for its second check — after `DUP FIZZ?` runs, the stack holds `[n, fizz-flag]`; `OVER` copies `n` (the second item) back to the top so `BUZZ?` can consume a fresh copy of it, leaving `fizz-flag` safely underneath for `AND` to combine with `BUZZ?`'s own result afterward.

## Extending it yourself

- Add a third rule (`"Buzzfizz"` for multiples of 7, say) and confirm the three-way combined case for a number divisible by 3, 5, *and* 7 works correctly.
- Rewrite `FIZZBUZZ-ONE` to build its output as a string (using `S"` or similar) rather than printing directly, and explain what would need to change about how it's called from `FIZZBUZZ`'s loop.
