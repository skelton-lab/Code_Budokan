# 6502 Assembly — A Session-Based Study Guide

**Promise:** understand the 6502 well enough to build and debug real programs on bare hardware (or a faithful simulation of it), then carry that understanding onto three real historical machines — Commodore 64, NES, Apple II/IIe — each finishing with a genuinely playable, if tiny, game.

**Audience:** comfortable with at least one other language; no prior assembly assumed.

**Toolchain (anchored):** the [cc65](https://cc65.github.io/) suite — `ca65` (assembler), `ld65` (linker), `sim65` (simulator) — because it's the one toolchain that genuinely spans every target this guide needs: a custom bare-metal linker config, and official `c64`, `nes`, `apple2`/`apple2enh` targets. Confirmed installed and working locally (`brew install cc65`).

**A methodology note specific to this language, refined while actually building the toolchain:** Fortran had a compiler catching a huge class of mistakes before anything ran. 6502 assembly barely has that — code assembles cleanly and still silently corrupts a register or writes to the wrong address. `sim65`'s `sim6502` target turned out to be a *hosted* test environment (it runs a small OS-like runtime so a C harness can `printf` results), not a raw simulation of a 6502 sitting at power-on with real hardware addressing — its own runtime occupies the interrupt vectors and the top of memory for its own use. That means there are genuinely two verification tiers in this guide, not one, and they don't split cleanly along the bare-metal/platform line I first assumed:

- **Executed and checked** (pure CPU logic — addressing modes, arithmetic/carry behavior, logic/shifts, compares/branches, subroutine call/return, stack discipline, all of the game-math module): assembled and run under `sim65` with results read back via the named-memory-plus-C-harness technique below. This is Modules 2, 3, and 7 in full, and the CPU-logic portions of 4 and 6.
- **Documented, not executed** (anything that depends on the *real* 6502 hardware memory map rather than the CPU's internal logic — actual interrupt-vector entry/exit mechanics, the famous `JMP` indirect page-boundary bug, real VIA/VIC-II/SID/PPU/APU register behavior): cross-checked against well-established, independently-corroborated public documentation instead. This covers Module 5's hardware-vector mechanics, the hardware side of Module 4's I/O chip, and all of Modules 8–10's platform-specific chip behavior.

Every claim in this tier is labeled as such at the point it's made, rather than presented with the same confidence as something actually run.

**The verification technique, if you want to reuse it yourself:** write the routine in pure assembly, have it store its result in a named memory location (`.export _result` / `.segment "DATA"`), then drive it from a tiny C harness (`cl65 -t sim6502`) that calls it and `printf`s the result. This sidesteps 6502-to-C calling-convention footguns entirely — you're reading memory by name, not trusting a register-return convention — and gives you the same "assemble, run, inspect" loop a real compiler gives you for free in a higher-level language.

## Capstone log

| # | Capstone | Proves | Target |
|---|---|---|---|
| 1 | Blink an output line | Addressing modes, branching, memory-mapped I/O basics | Bare-metal |
| 2 | Digit/text display + a tone | Subroutines, the stack, lookup tables, basic sound generation | Bare-metal |
| 3 | Simple monitor (keypad in, memory write, echo back) | Indirect addressing, jump tables, polled keyboard-style input | Bare-metal |
| 4 | Interrupt-driven counter/clock | IRQ/NMI vectors, register save/restore discipline | Bare-metal |
| 5 | Mini game: move a hardware sprite, hardware collision detection, SID sound cue | Screen memory, keyboard/joystick input, sound, **hardware** collision | Commodore 64 |
| 6 | Mini game: move a hardware sprite, software collision detection, APU sound cue | Screen memory (PPU), controller input, sound, **software** collision | NES |
| 7 | Mini game: move a hi-res shape, software collision detection, one-bit speaker cue | Screen memory (hi-res page), keyboard input, sound, **software** collision | Apple II/IIe |

Capstones 5–7 are the same conceptual game — move a thing, detect when it hits another thing, make a sound — solved three genuinely different hardware ways. That contrast (C64's dedicated collision-detection *registers* vs. NES/Apple II doing it in software) is one of the more interesting things about 8-bit hardware and is deliberately kept, not smoothed away.

## Module list

1. **Foundations** — what a CPU/ISA is, registers (A/X/Y/PC/SP/P), the 64KB address space, zero page, the stack page, hex literacy, which exact chip variant you're targeting and why it matters, first program under `sim65`
2. **Addressing modes & arithmetic** — every addressing mode and why it exists, `ADC`/`SBC` and the carry flag, decimal (BCD) mode, logic/shifts, compare-and-branch → feeds Capstones 1–2
3. **Subroutines & the stack** — `JSR`/`RTS`, `PHA`/`PLA`/`PHP`/`PLP`, jump tables via indirect `JMP` → feeds Capstones 2–3
4. **Memory-mapped I/O** — the bus model, a real I/O chip (VIA 6522), your first tone (sound as a timed square wave), polled keypad input → feeds Capstones 1, 2, 3
5. **Interrupts** — RESET/NMI/IRQ vectors, ISR discipline, re-entrancy → feeds Capstone 4
6. **Bare-metal capstones** — Capstones 1–4, fully built and verified under `sim65`
7. **Game math on an 8-bit CPU** — fixed-point arithmetic (no FPU), position/velocity update, gravity as constant acceleration, axis-aligned bounding-box collision math, storing multiple game entities without `malloc` → feeds Capstones 5–7 directly
8. **Porting to the Commodore 64** — memory map, the 6510's bank-switching I/O port, KERNAL/BASIC calls, VIC-II sprites and **hardware** sprite/background collision registers, SID sound, CIA keyboard/joystick reading → Capstone 5
9. **Porting to the NES** — PPU basics, iNES header, cartridge mapping, OAM hardware sprites, **software** AABB collision (no hardware collision on NES), APU sound, controller reading via the `$4016` shift register, the 2A03's disabled decimal mode → Capstone 6
10. **Porting to the Apple II/IIe** — memory map, monitor ROM calls, the interleaved hi-res page layout, one-bit speaker, keyboard soft-switch, manual shape collision → Capstone 7
11. **Beyond this guide** — signposts only
12. **Final assessment** + **Resources/cheat sheet**

## Ecosystem-breadth triage

| Topic | Capstone-impact test | Treatment |
|---|---|---|
| Memory management (address space, zero page, banking, entity storage without `malloc`) | Threaded through nearly every capstone | **Full, distributed** across Modules 1, 4, 7, 8–10 rather than one module — it's not a separable topic on this architecture |
| Sound | Directly requested; each platform capstone needs it | **Full** — simple tone in Module 4 (bare-metal), then SID/APU/one-bit speaker per platform module |
| Keyboard/controller input | Directly requested; every capstone needs it | **Full** — polled keypad in Module 4, then platform-specific input in Modules 8–10 |
| Screen memory mapping | Directly requested | **Full** — per-platform in Modules 8–10 (text/sprite registers, PPU, hi-res page) |
| Sprites & collision detection | Directly requested, now load-bearing for Capstones 5–7 | **Full** — shared math in Module 7, hardware-vs-software contrast in Modules 8–10 |
| Simple game physics/mechanics | Directly requested | **Full** — Module 7 |
| Decimal (BCD) mode | Real, cheap to teach alongside `ADC`/`SBC` | **Folded into Module 2**, not a separate module |
| Cycle-accurate timing / raster effects | Doesn't change the *minimum* viable capstone, but separates "something's on screen" from real C64/NES programming | **Pitfall callouts** in Modules 8–9; deep optimization technique → signpost |
| Illegal/undocumented opcodes | Doesn't touch any capstone | **Signpost** |
| 65C02 vs. NMOS 6502 instruction differences | Named upfront (Module 1), not deep-taught | **Brief mention + signpost** |
| Writing your own assembler/emulator | Different (meta) skill | **Signpost** |
| cc65's C compiler as an alternative to hand-written assembly | Out of scope — this guide is assembly-first by design | **Signpost** |

## Setup

```bash
# macOS
brew install cc65      # ca65, ld65, sim65 — the whole bare-metal + platform toolchain
brew install vice       # C64 emulator (x64sc) — GUI; useful once you're off bare-metal verification
# NES: an emulator with good debugging (FCEUX or Mesen) — install separately per your OS
# Apple II: AppleWin (Windows) or MAME's apple2e driver (cross-platform)
```

```bash
ca65 --version
sim65 --version
```

Bare-metal verification loop (Modules 1–7), using the technique described above:

```bash
cl65 -t sim6502 -o test.bin routine.s harness.c
sim65 test.bin
```
