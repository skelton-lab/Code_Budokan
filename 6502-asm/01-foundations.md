# Module 1 — Foundations

What a 6502 actually has (registers, flags, memory), the two regions of memory worth knowing by heart, which exact chip you're targeting, and how you'll verify every example in this guide. Feeds everything downstream.

## What the 6502 gives you

**You'll be able to:** name the 6502's registers and flags; read hex/binary literals in assembly syntax; explain why there's no separate "I/O space."

**Concept**

A 6502 has five registers, all tiny by modern standards:

| Register | Width | Purpose |
|---|---|---|
| `A` | 8-bit | The accumulator — almost all arithmetic and logic goes through here |
| `X`, `Y` | 8-bit | Index registers — loop counters, array indexing, some addressing modes |
| `PC` | 16-bit | Program counter — where execution is |
| `SP` | 8-bit | Stack pointer — an offset *within* a fixed memory page, not an address by itself |
| `P` | 8-bit | Status/flags register |

`P` packs eight flags into one byte: `N V - B D I Z C` (bit 5 is unused, always reads 1). The ones you'll use constantly: `Z` (zero — last result was 0), `C` (carry — arithmetic overflow/borrow at the bit-7 boundary, and the "extra bit" for shifts), `N` (negative — bit 7 of the last result). `D` (decimal mode) and `I` (interrupt disable) get their own sessions.

The address space is one flat 64KB block, `$0000`–`$FFFF`. There's no separate "port" instruction like some other architectures — a peripheral chip's registers just occupy addresses in that same 64KB space (**memory-mapped I/O**, Module 4). `LDA $D000` might read a real byte of RAM or the current state of a joystick, and there's no way to tell which from the instruction alone — only from knowing the memory map you're targeting.

**Example**

```asm
LDA #$05      ; # means "the literal value 5" (immediate addressing)
STA $10       ; store A into the byte AT address $10
LDA #$03
ADC $10       ; add the byte AT address $10 to A (NOT the literal value $10)
```

`$` prefixes hex; `%` prefixes binary; `#` marks "this is a literal value, not an address." Confusing `LDA #$10` (load the number 16) with `LDA $10` (load whatever's stored at address 16) is the single most common beginner mistake in 6502 assembly, and the assembler will not catch it for you — both are completely valid instructions that do something.

> **Pitfall:** losing the `#` doesn't error. It silently changes your program's meaning to "read from address `$10`" instead of "use the number `$10`." Get in the habit of reading every `#` deliberately, especially your own code six months later.

**Practice**

- Convert `%00101010` to hex and decimal by hand, then check yourself with the assembler (assemble a `.byte %00101010` and a `.byte $2A` and confirm they produce the same output byte).
- Write three instructions that are legal but do different things because of a missing/present `#`, and predict each one's effect before assembling.

## Zero page and the stack

**You'll be able to:** explain why zero page is faster; state exactly where the hardware stack lives and how big it is.

**Concept**

**Zero page** is addresses `$0000`–`$00FF` — the first 256 bytes. Instructions addressing zero page are one byte shorter (2 bytes instead of 3) and one cycle faster than the equivalent absolute-address instruction, because the assembler only has to encode the low byte of the address. This isn't a minor detail — idiomatic 6502 code treats zero page like a small set of extra "registers" for anything accessed often (loop variables, pointers), specifically because of this speed/size win.

The **stack** is hardwired to page 1, `$0100`–`$01FF` — not relocatable, not resizable. `SP` holds an 8-bit offset into that page; it starts high (conventionally `$FF`, meaning the next push lands at `$01FF`) and **decrements** as you push, incrementing as you pop. This is why stack overflow on a 6502 doesn't crash with a clean error — it just wraps around and starts silently overwriting the bottom of your stack.

**Example**

```asm
.segment "ZEROPAGE"
counter: .res 1      ; reserve one byte in zero page — a fast "variable"

.segment "CODE"
    LDA #$05
    STA counter        ; two-byte instruction, fast
    LDA #$05
    STA $0300           ; three-byte instruction, slower — same logical operation
```

> **Pitfall:** the stack and zero page are two of the very few memory regions the CPU itself assigns a fixed meaning to. Everything else — where your code lives, where your variables live, where I/O registers sit — is a convention set by whatever memory map you're targeting (Modules 8–10 each have a different one).

**Practice**

- Reserve three zero-page bytes for a tiny "player state" (x position, y position, health) using `.res`.
- Look up (or reason out) how many bytes and cycles `LDA $05` costs versus `LDA $0500` on an NMOS 6502.

## Which chip, exactly?

**You'll be able to:** name the four 6502-family variants this guide touches and the one difference in each that will actually bite you.

**Concept**

"The 6502" is a family, not one chip, and this guide's later platform modules each target a different family member:

| Chip | Where | What's different |
|---|---|---|
| NMOS 6502 | The original; this guide's bare-metal/simulator target | Baseline — everything in Modules 1–7 targets this |
| 65C02 | Later CMOS revision (some breadboard builds, Apple IIe enhanced) | Adds a handful of new instructions/addressing modes, fixes a couple of NMOS bugs — not required for this guide, name-checked in Module 11 |
| 6510 | Commodore 64 | A 6502 core plus a **built-in 6-bit I/O port** at addresses `$00`/`$01` used to bank-switch ROM and RAM in and out of the address space — this is the single biggest C64-specific gotcha (Module 8) |
| 2A03 (Ricoh) | NES | A 6502 core plus a built-in APU (sound), but with **decimal mode physically disabled** — `SED` does nothing useful on real NES hardware (Module 9) |

**Practice**

- Before starting Module 8, be able to say in one sentence why `$00` and `$01` are special on a C64 and *not* special on plain 6502 hardware.
- Before starting Module 9, be able to say why a BCD score-counter routine that works perfectly in Module 2's examples would silently misbehave if you shipped it unmodified on real NES hardware.

## Your first program, and how this guide verifies itself

**You'll be able to:** assemble and run a 6502 program under `sim65`; use the memory-plus-C-harness technique to check that code actually does what you think it does.

**Concept**

`sim65` is a real 6502 simulator, not a toy — it executes actual instruction encodings and actual flag behavior. To read results back out, this guide writes the routine under test in pure assembly, has it store its result into a named memory location, and reads that location from a tiny C driver linked against it. This sidesteps register-return calling-convention subtleties entirely (they're a real footgun, encountered and worked around while building this guide — see the overview's methodology note) and gives you an "assemble, run, inspect" loop.

**Example**

```asm
; routine.s
.export _result
.segment "DATA"
_result: .byte 0

.segment "CODE"
.export _run
_run:
    LDA #$05
    STA counter
    LDA #$03
    CLC
    ADC counter
    STA _result
    RTS

.segment "ZEROPAGE"
counter: .res 1
```

```c
/* harness.c */
#include <stdio.h>
extern unsigned char result;
extern void run(void);
int main(void) {
    run();
    printf("result = %d\n", result);
    return 0;
}
```

```bash
cl65 -t sim6502 -o test.bin routine.s harness.c
sim65 test.bin
```

This prints `result = 8`.

> **Pitfall:** `cl65` is the all-in-one driver (assembles, links, in this case also compiles the C harness). `ca65`/`ld65` are the separate assembler/linker steps `cl65` calls for you — you'll use them directly once you're targeting real platform configs in Modules 8–10, where you assemble with `-t c64`/`-t nes`/`-t apple2` instead of `-t sim6502`.

**Practice**

- Build and run the example above yourself; confirm the printed value.
- Change the routine to compute `250 + 10` and predict the result *before* running it — 6502 arithmetic wraps at 8 bits with no warning (you'll formalize exactly how in Module 2).
- Add a second exported result byte and a second routine to the same test.

## Progress check

1. What's the difference between `LDA #$10` and `LDA $10`?
2. Where exactly does the hardware stack live, and how big is it?
3. Why is zero-page addressing faster than absolute addressing?
4. Name one thing that's different about the C64's 6510 versus a plain NMOS 6502.
5. Why would a decimal-mode (BCD) routine that works in this guide's simulator misbehave on real NES hardware?
6. What does this guide's verification technique avoid having to trust, and why does that matter?

### Answers

1. `LDA #$10` loads the literal value 16 into `A`. `LDA $10` loads whatever byte is currently stored at memory address `$10`. The assembler accepts both without complaint — only the `#` tells them apart.
2. Page 1 of memory, `$0100`–`$01FF` — fixed, not relocatable. `SP` is an 8-bit offset within that page.
3. Zero-page instructions only need to encode one address byte instead of two, making them one byte shorter and (on NMOS 6502) one cycle faster than the equivalent absolute-address instruction.
4. It has a built-in 6-bit I/O port at addresses `$00`/`$01` that controls which ROM/RAM banks are visible in the address space — something a plain 6502 doesn't have.
5. The NES's 2A03 chip has decimal mode physically disabled in hardware; `SED` sets the D flag but `ADC`/`SBC` don't actually perform BCD arithmetic on real hardware, regardless of what a generic NMOS 6502 (or this guide's simulator, which models plain NMOS behavior) would do.
6. It avoids trusting the 6502-to-C calling convention for how a return value gets passed back in registers — a real footgun this guide's own author hit while writing it. Reading a named memory location directly sidesteps that entirely.
