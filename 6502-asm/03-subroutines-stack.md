# Module 3 — Subroutines and the Stack

How to structure 6502 code into callable pieces, save state safely, and dispatch through a table of routines. `JSR`/`RTS` and `PHA`/`PLA`/`PHP`/`PLP` are pure stack/PC mechanics — verified by execution. The famous indirect-`JMP` hardware bug is real and extremely well-documented, but depends on real absolute-address placement this session's simulator doesn't model faithfully — it's flagged as documented, not executed. Feeds Capstones 2–3.

## JSR, RTS, and the stack's role

**You'll be able to:** call and return from a subroutine; explain exactly what `JSR`/`RTS` push and pop.

**Concept**

`JSR label` pushes the address of the *last byte of the JSR instruction itself* onto the stack (not the next instruction — a real, easy-to-misremember detail), then jumps to `label`. `RTS` pops that address back off and jumps to it **plus one** — which is what makes it correctly land on the instruction after the `JSR`. You don't need to think about the off-by-one in practice (the CPU handles it consistently every time), but it explains why `JSR`/`RTS` and interrupt entry/exit (Module 5) push slightly different things and why you can't casually mix `RTS` with a return path meant for `RTI`.

**Example**

```asm
_run:
    LDA #7
    JSR double_it
    STA _r1           ; result lands here after double_it returns -- expect 14
    RTS

double_it:
    ASL A              ; shift left = multiply by 2
    RTS
```

Verified: this produces `14` in `_r1`, confirming the call returns to exactly the instruction after `JSR`.

> **Pitfall:** a subroutine that never executes `RTS` on some code path (a branch that skips it, or an accidental fall-through into the next routine's code) doesn't error — it keeps executing whatever bytes come next as if they were instructions. This is one of the more disorienting classes of 6502 bug precisely because nothing about it looks wrong at the point where it goes off the rails.

**Practice**

- Write a subroutine `square(x)` following this guide's memory-based verification pattern (Module 1), calling it from a driver.
- Deliberately remove an `RTS` from the middle of a two-subroutine file, assemble it, and describe (before running) what you'd expect to happen.

## Saving state: PHA, PLA, PHP, PLP

**You'll be able to:** save and restore `A` and the flags around a subroutine that needs to preserve caller state.

**Concept**

`PHA`/`PLA` push/pop `A`. `PHP`/`PLP` push/pop the whole flags byte. There's no hardware-enforced calling convention on the 6502 — if a subroutine clobbers `X`, `Y`, or the flags and the caller needed them preserved, that's entirely on you to handle, by convention, every time.

**Example**

```asm
    LDA #99
    PHA               ; save A
    LDA #1             ; clobber A doing unrelated work
    PLA                ; restore A
    ; A is 99 again
```

Verified: produces `99`, confirming `PLA` restores exactly what `PHA` saved even after `A` was overwritten in between.

> **Pitfall:** pushes and pops must balance *exactly* on every code path through a routine, including early returns. A `PHA` followed by an early `RTS` that skips the matching `PLA` leaves one stale byte on the stack forever — harmless once, but stack up a few of these across a long-running program and you'll eventually corrupt a return address. This is exactly the discipline Module 5's interrupt service routines depend on.

**Practice**

- Write a subroutine that preserves `X` and `Y` (push both at entry, pop both — in reverse order — before `RTS`) while still returning a result in `A`.
- Explain in one sentence why `PLA` must undo pushes in the *reverse* order they were made.

## Jump tables via indirect JMP

**You'll be able to:** dispatch to one of several routines based on a runtime value, without a chain of compares.

**Concept**

`JMP (address)` reads a 2-byte pointer from `address` and jumps to *that*. Combined with a table of addresses indexed by some value (a command byte, a game-object type), this gives you the 6502 equivalent of a switch statement or a function-pointer array — build the target address in a zero-page pointer, then `JMP` through it.

**Example**

```asm
    LDX #1                ; pick handler #1
    LDA table_lo,X
    STA vec
    LDA table_hi,X
    STA vec+1
    JMP (vec)

handler0: LDA #100 : STA _r1 : RTS
handler1: LDA #200 : STA _r1 : RTS
handler2: LDA #250 : STA _r1 : RTS

table_lo: .byte <handler0, <handler1, <handler2
table_hi: .byte >handler0, >handler1, >handler2
```

Verified: with `X = 1`, this correctly dispatches to `handler1` (`_r1` comes out `200`).

> **Real hardware bug, documented not executed here:** on the original NMOS 6502, if the *pointer itself* (not the target) sits at an address ending in `$xxFF` — the last byte of a memory page — `JMP (address)` fetches the high byte of the target from `$xx00` (the start of the *same* page) instead of correctly crossing into `$(xx+1)00`. This is one of the most widely documented hardware bugs in retrocomputing (it's in the original datasheet errata and cited across essentially every serious 6502 reference); the 65C02 fixed it. This guide's `sim65`-based verification loop runs in a hosted test environment that doesn't model raw hardware address placement precisely enough to reproduce this specific bug on demand, so it isn't independently re-verified by execution here — but treat it as settled fact, not folklore. Practical takeaway: **never let a jump-table's pointer bytes land at a page boundary**; pad or reorder your data if you're placing tables by hand near a `$xx00` boundary, especially on real (non-65C02) hardware.

**Practice**

- Build a 4-entry jump table dispatching on a zero-page "current game state" byte.
- Read about the page-boundary bug from an independent source (the 6502.org wiki or NESdev wiki both cover it) and write, in your own words, why padding a table to avoid a `$xxFF`-aligned pointer is worth doing even though it "usually" won't matter.

## Progress check

1. What does `JSR` actually push onto the stack?
2. Why must `PHA`/`PLA` (and `PHP`/`PLP`) pairs balance on every code path through a routine?
3. What's the practical risk of a subroutine that falls through without an `RTS`?
4. What does `JMP (vec)` do, given a 2-byte pointer at `vec`?
5. What's the NMOS 6502's indirect-`JMP` page-boundary bug, and what's the practical rule that avoids it?
6. Why is this guide's confidence in the page-boundary bug labeled differently from its confidence in, say, the `ADC`/carry behavior from Module 2?

### Answers

1. The address of the last byte of the `JSR` instruction itself — not the next instruction. `RTS` compensates by popping that address and jumping to it plus one.
2. An imbalanced push/pop leaves stale data on the stack. It's invisible at first, but it accumulates — eventually it corrupts something that actually matters, like a saved return address from an unrelated `JSR`.
3. Execution just keeps going into whatever bytes come next, executing them as instructions regardless of what they actually are — a silent, hard-to-diagnose failure mode.
4. It reads a 2-byte address starting at `vec` and jumps to that address — an indirect jump, the building block for jump tables.
5. If the pointer being dereferenced sits at an address ending in `$xxFF`, the CPU incorrectly fetches the target's high byte from `$xx00` instead of `$(xx+1)00`. Avoid it by never placing an indirect-`JMP` pointer's bytes at a page boundary.
6. The `ADC`/carry behavior was assembled and actually run under `sim65`, with the result read back and checked. The page-boundary bug depends on real hardware address placement that this session's hosted test environment doesn't faithfully reproduce, so it's stated on the strength of well-corroborated external documentation instead of an execution trace from this guide.
