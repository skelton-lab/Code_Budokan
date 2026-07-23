# Resources & Cheat Sheet

## References

| Resource | Why it matters |
|---|---|
| [cc65 documentation](https://cc65.github.io/doc/cc65.html) | The official docs for this guide's entire toolchain — `ca65`, `ld65`, `sim65`, and the `c64`/`nes`/`apple2`/`apple2enh` target linker configs used in Modules 1–10 |
| 6502.org | The single best general-purpose 6502 reference outside a specific platform's own wiki — opcode tables, illegal-opcode documentation (Module 11), hardware design articles |
| NESdev Wiki | The NES community's exhaustive technical reference — goes far deeper into PPU/APU/mapper behavior than Module 9's capstone-driven scope needed |
| c64-wiki.com | The C64 equivalent depth — KERNAL routine catalogs, VIC-II/SID registers beyond Module 8's scope, and raster-effect/FLI techniques (Module 11) |
| *Commodore 64 Programmer's Reference Guide* | The primary historical source this guide's Module 8 VIC-II/SID/CIA tables and 6510 I/O port behavior are cross-checked against |
| Visual6502.org | A transistor-level simulator of the actual 6502 die — the deepest possible answer to "why does the hardware actually behave this way," referenced in Module 11 |
| 8bitworkshop.com | A browser-based IDE with an integrated 6502 assembler and multi-platform emulator (C64, NES, Apple II among others) — a fast way to actually *see* Modules 8–10's documented-tier code run, closing the manual-verification gap this guide's own toolchain couldn't automate |
| Ben Eater's breadboard 6502 video series | The real-hardware complement to this entire guide — builds the VIA-based I/O model Module 4 documented, on physical chips, from scratch |
| This series' [C guide](../c/00-overview.md) | Module 7's struct-of-arrays entity pattern and this guide's own memory-management-without-`malloc` discipline both echo C's manual memory-management mindset directly |

## One-page cheat sheet

| Idea | Where |
|---|---|
| Addressing modes, `ADC`/`SBC` + carry, BCD | Module 2 |
| `JSR`/`RTS`, stack (`PHA`/`PLA`/`PHP`/`PLP`), jump tables | Module 3 |
| Memory-mapped I/O, VIA `DDRA`/`ORA`, polled input | Module 4 |
| Interrupt vectors (`$FFFA`–`$FFFF`), ISR save/restore discipline | Module 5 |
| Bare-metal Capstones 1–4 | Module 6 |
| Fixed-point position/velocity, AABB collision, struct-of-arrays entities | Module 7 — reused unchanged in every platform capstone |
| 6510 I/O port (`$00`/`$01`), KERNAL `CHROUT`/`GETIN`, VIC-II sprites, `SPSPCL`/`SPBGCL` hardware collision, SID | Module 8 (C64) |
| 2A03 (BCD disabled), iNES header, mappers, PPU/OAM sprites, software AABB collision, APU, `$4016` shift register | Module 9 (NES) |
| Soft switches, monitor `COUT`, interleaved hi-res rows, `$C030` speaker, `$C000`/`$C010` keyboard | Module 10 (Apple II) |
| Illegal opcodes, 65C02 differences, raster effects, writing your own emulator, cc65's C compiler | Module 11 — signposts only |

## Verification technique, if you want to reuse it yourself

Write the routine in pure assembly, have it store its result in a named memory location (`.export _result` / `.segment "DATA"`), then drive it from a tiny C harness (`cl65 -t sim6502`) that calls it and `printf`s the result — sidesteps 6502-to-C calling-convention footguns entirely, since you're reading memory by name rather than trusting a register-return convention. This is what made Modules 1–7 (and Module 7's routines, reused in every platform capstone) this guide's fully-executed tier; Modules 8–10 fall back to documented public references specifically because their target hardware (VIC-II, PPU, soft switches) has no equivalent in `sim65`'s hosted environment.

## Where to go now

This closes the 6502 assembly guide: bare-metal fundamentals (Modules 1–7) fully executed and verified under `sim65`, then the same CPU-level logic ported, unmodified, across three genuinely different real machines (Modules 8–10) — the strongest demonstration in this whole series that hardware-agnostic logic really does port for free, while everything that *doesn't* port (hardware collision vs. software, KERNAL vs. PPU vs. soft switches, bank-switched ROM vs. mapper-switched cartridge space vs. no switching at all) is exactly where each platform's own character actually lives. From here: the sequencing in the series' [INDEX.md](../INDEX.md) continues into C, where Capstone-driven, hand-built structures (a `Shape` with a hand-assigned function pointer) pick up the polymorphism thread this guide's platform ports never needed to touch.
