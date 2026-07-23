# Module 6 — Bare-Metal Capstones

The four bare-metal projects, built from Modules 1–5. Each one's core logic is assembled and run under `sim65` with results checked, using a stand-in memory address wherever the real version would touch actual hardware (a VIA, a real interrupt vector) — flagged per-capstone, matching Modules 4–5's verification tiers exactly.

## Capstone 1 — Blink an output line

**Proves:** addressing modes, branching, memory-mapped I/O basics (Modules 1, 2, 4).

```asm
DDRA = $8003          ; stand-in for a real VIA's DDRA — see Module 4 for real offsets
ORA  = $8001

.export _blink
_blink:
    LDA #%00000001      ; pin 0 as output
    STA DDRA
loop:
    LDA ORA
    EOR #1
    STA ORA
    LDX #0
delay:
    DEX
    BNE delay             ; a full 256-count delay per toggle -- tune for real hardware speed
    JMP loop
```

The toggle-and-delay pattern here is the exact logic verified in Module 4's tone-generator session — a blinking LED and an audio tone are the same underlying technique at different rates. `DDRA`/`ORA` at `$8003`/`$8001` stand in for wherever your real board's VIA is decoded to; the toggle logic itself is what's actually being tested here, not the specific address.

**Practice**

- Change the delay loop to a 16-bit counter for a visibly slower blink.
- Add a second output pin toggling out of phase with the first.

## Capstone 2 — Digit/text display + a tone

**Proves:** subroutines, the stack, lookup tables, basic sound generation (Modules 2, 3, 4).

```asm
.segment "RODATA"
seg7: .byte $3F,$06,$5B,$4F,$66,$6D,$7D,$07,$7F,$6F   ; 0..9, common-cathode a-g bit order

.segment "CODE"
.export _digit_to_pattern
; A in: digit 0-9. A out: the 7-segment bit pattern.
_digit_to_pattern:
    TAX
    LDA seg7,X
    RTS
```

Verified: `_digit_to_pattern` correctly returns `$3F` for `0`, `$07` for `7`, `$6F` for `9` — confirming the lookup table and indexing are correct.

> **Pitfall:** the exact segment-to-bit mapping above is a widely used convention, but it depends entirely on how *your* display is wired — treat the table's shape (index by digit, look up a byte) as the verified part, and the specific bit values as something to double-check against your actual hardware's pinout before assuming it's correct for you.

Pair this with Module 4's `make_tone` routine to beep once per digit displayed — e.g., call `make_tone` with a short count each time `digit_to_pattern` runs, giving you an audible "click" per digit change.

**Practice**

- Extend the table to hexadecimal digits A–F.
- Write a routine that displays a 2-digit number (tens digit, ones digit) using two calls to `digit_to_pattern`.

## Capstone 3 — Simple monitor

**Proves:** indirect addressing, jump tables, polled input (Modules 3, 4).

A tiny command interpreter: poll an input port, and if a command byte shows up, dispatch on it.

```asm
.export _tick
; command 1 = write a fixed test value to a "memory" location, command 2 = echo the command byte back
_tick:
    LDA _port
    BEQ done
    CMP #1
    BEQ cmd_write
    CMP #2
    BEQ cmd_echo
    JMP done
cmd_write:
    LDA #$42
    STA _mem_written
    JMP ack
cmd_echo:
    LDA _port
    STA _echo
    JMP ack
ack:
    LDA #0
    STA _port           ; acknowledge, ready for the next command
done:
    RTS
```

Verified across three cases: idle (`_port = 0`) does nothing; command `1` writes `$42` to `_mem_written`; command `2` echoes the command byte into `_echo`; and `_port` is correctly cleared after either command, ready for the next poll.

> **Pitfall:** this is `CMP`/`BEQ` chained per command, not a true jump table — fine for two or three commands, but it stops scaling past a handful. Module 3's indirect-`JMP` jump-table pattern is the right tool once you're past roughly four or five commands; rewriting this dispatch as a real jump table is this capstone's most direct next step.

**Practice**

- Add a third command that writes a caller-supplied value (read from a second port) instead of the fixed `$42`.
- Rewrite the dispatch as a real jump table (Module 3) once you have more than three commands, and confirm the behavior is identical.

## Capstone 4 — Interrupt-driven counter/clock

**Proves:** IRQ/NMI vectors, register save/restore discipline (Module 5).

The vector-table setup below is standard, documented 6502 practice (Module 5) — not independently executed in this session, since it depends on real hardware addresses this guide's test environment reserves for its own use. The counter-incrementing ISR body *is* verified, using the same technique Module 5 used: called repeatedly as an ordinary subroutine, standing in for what happens each time a real timer interrupt fires.

```asm
.segment "VECTORS"           ; placement/name varies by real linker config -- Modules 8-10 show real ones
    .word nmi_handler
    .word reset
    .word irq_handler

.segment "CODE"
reset:
    LDX #$FF
    TXS                       ; initialise the stack pointer (Module 1)
    CLI                        ; enable interrupts
main_loop:
    JMP main_loop                ; idle -- all the real work happens in the ISR

irq_handler:
    PHA
    TXA
    PHA
    INC tick_count
    PLA
    TAX
    PLA
    RTI

nmi_handler:
    RTI                          ; unused here, but every real vector table needs an entry

tick_count: .byte 0
```

Verified (as ordinary repeated subroutine calls, per Module 5's technique): `tick_count` correctly increments once per simulated "tick" with no drift or corruption across many repeated calls — confirming the save/increment/restore body is correct. What isn't independently verified here is the vector table itself actually catching a real hardware IRQ signal, which needs either real hardware or an emulator that models a real timer peripheral (VICE, once you're on the C64 in Module 8, is the first platform in this guide where that's practical).

**Practice**

- Add a second counter that only increments on every 60th tick (a "seconds" counter derived from a 60Hz "ticks" counter, if your real timer source runs at 60Hz).
- Identify which of this capstone's shared state (just `tick_count` here) would need an `SEI`/`CLI` guard (Module 5) if the main loop ever read a multi-byte version of it.

## Progress check

1. What's the one piece of logic shared between Capstone 1's blink and Module 4's tone generator?
2. Why is the 7-segment table's *shape* (index by digit) verified, but its exact bit values only "common convention"?
3. Why does Capstone 3's dispatch chain stop being the right tool past a handful of commands?
4. What part of Capstone 4 was actually executed and checked, and what part wasn't?
5. What real hardware/tooling would let you close that verification gap for Capstone 4?

### Answers

1. Both are "toggle a bit, delay, repeat" — a blinking LED and an audio tone are the same technique at different rates.
2. The lookup mechanism itself (index a table by digit, get back a byte) was assembled and run with checked results. The specific bit-to-segment mapping depends on how a real display is wired, which varies by hardware and can't be verified without that specific hardware.
3. A chain of `CMP`/`BEQ` pairs costs more instructions and more worst-case time (checking every earlier command before reaching a later one) as the command count grows — an indirect-`JMP` jump table (Module 3) dispatches in constant time regardless of how many commands there are.
4. The ISR body's register save/increment/restore logic was executed repeatedly as an ordinary subroutine call and checked for correct, non-corrupting behavior. The vector table actually catching a real hardware interrupt signal was not executed — that depends on real hardware addresses and a real interrupt source this session's test environment doesn't model.
5. Real breadboard hardware, or an emulator that models a real timer peripheral generating actual periodic IRQs — VICE (Module 8) is the first platform in this guide where that becomes practical to test.
