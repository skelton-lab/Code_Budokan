# Module 11 — Beyond This Guide

Every topic here failed the capstone-impact test (00-overview.md's ecosystem-breadth triage table) — none of them change how Capstones 1–7 turn out, and none are required by an exercise you've been assigned. That's a scoping decision, not an oversight: each entry says what it is, why it matters, and where to go deeper when you actually need it.

### Cycle-accurate timing and raster effects

**What it is:** techniques that exploit the *exact* number of CPU cycles an instruction takes, synchronized against exactly where the video chip currently is in drawing a frame — mid-scanline palette changes, split-screen scrolling, and similar effects that made platform-specific hardware look like it was doing more than its raw specs suggest.

**Why it matters:** it's the difference between "something's on screen" (this guide's capstone bar) and real, polished C64/NES demoscene- or commercial-game-quality programming. Modules 8–9 flagged it explicitly as a pitfall callout (raster timing isn't something a simple moving-sprite capstone needs to get right) rather than teaching it, because getting it right requires counting cycles per instruction against a specific chip revision's exact timing — a genuinely deep, platform-specific skill in its own right.

**Where to go next:** the NESdev Wiki's PPU timing pages for NES-specific raster tricks; c64-wiki.com's articles on "raster interrupts" and "FLI" (Flexible Line Interpretation) for C64-specific ones.

### Illegal / undocumented opcodes

**What it is:** the NMOS 6502's instruction decoder isn't fully populated — many of the "undefined" opcode bytes still do *something* consistent (a side effect of how the decoding logic is wired, not an intentional feature), and real commercial software on several platforms this guide covers actually shipped code relying on specific illegal opcodes for extra speed or compactness.

**Why it matters:** doesn't touch any capstone in this guide, but it's a real, documented corner of 6502 history, and it's part of why the 65C02 (next entry) exists — Western Design Center's explicit goal with the 65C02 was partly to fully define every opcode, which as a side effect broke software that depended on specific NMOS illegal-opcode behavior.

**Where to go next:** 6502.org's opcode reference pages, which catalog the well-known illegal opcodes (`LAX`, `SAX`, `DCP`, and others) and their consistent, documented behavior.

### 65C02 vs. NMOS 6502 instruction differences

**What it is:** the 65C02 (used in, among other things, the Apple IIe you targeted in Module 10) added several genuinely useful instructions the original NMOS 6502 lacks — `PHX`/`PLX`/`PHY`/`PLY` (direct stack push/pull for `X`/`Y`, which Module 5's ISR example had to work around via `TXA`/`PHA`), `BRA` (an unconditional relative branch), and `STZ` (store zero without needing to load `A` first) — plus it fixed a handful of well-known NMOS bugs, including the indirect-`JMP` page-boundary bug this guide's 6502.org-class documentation would flag if this guide targeted raw hardware bring-up.

**Why it matters:** named upfront in Module 1 as something to know exists; genuinely relevant the moment you target real 65C02-based hardware (a IIe, or a modern 65C02 breadboard build) rather than treating "6502" as one undifferentiated target the way this guide's `sim65`-based Modules 1–7 could get away with.

**Where to go next:** the Western Design Center's own 65C02 datasheet; 6502.org's "6502 vs 65C02" comparison pages.

### Writing your own assembler or emulator

**What it is:** a different (meta) skill from everything this guide teaches — instead of writing 6502 programs, you write the tool that turns assembly text into machine code, or the tool that executes machine code and simulates the CPU's registers/flags/memory cycle by cycle.

**Why it matters:** genuinely valuable for understanding the 6502 at a level even this guide's `sim65`-verified modules don't require (you don't need to know how `sim65` itself works to use it correctly) — and it's how tools like `sim65` and `ca65` themselves came to exist. A well-specified, well-documented target instruction set with a completed CPU (unlike, say, a modern superscalar processor) makes the 6502 one of the most approachable real CPUs to build a from-scratch emulator for.

**Where to go next:** Visual6502.org, a transistor-level simulator of the actual 6502 die, useful for understanding *why* the documented behavior (including the illegal opcodes above) is what it is, down to the silicon; 8bitworkshop.com, a browser-based IDE with an integrated 6502 assembler and multi-platform (including C64, NES, and Apple II) emulator, useful as a reference implementation once you're building your own.

### cc65's C compiler as an alternative to hand-written assembly

**What it is:** the same cc65 suite this guide has used throughout (`ca65`/`ld65`/`sim65`, and the `c64`/`nes`/`apple2`/`apple2enh` targets from Modules 8–10) also ships a full C compiler, `cc65` itself, targeting all the same platforms — meaning everything this guide built by hand in assembly could instead be written in C and compiled down.

**Why it matters:** out of scope by design — this guide is assembly-first specifically to teach what the hardware is actually doing at the register and addressing-mode level, which a C compiler would abstract away. Worth knowing it exists for exactly the moment that trade-off flips: once a project's logic is complex enough that hand-written assembly's development speed cost outweighs the value of hand-placed instructions, cc65's C compiler is the natural next tool, on the exact same toolchain and targets this guide already has installed.

**Where to go next:** the [cc65 documentation](https://cc65.github.io/doc/cc65.html)'s own "Introduction" and platform-specific library reference pages (`c64.h`, `nes.h`, `apple2.h`), which name the same hardware registers this guide's assembly modules addressed directly by symbolic constant.

### The wider ecosystem

- **6502.org** — the single best general-purpose 6502 reference outside a specific platform's own wiki: opcode tables, illegal-opcode documentation, hardware design articles, forum archives going back decades.
- **NESdev Wiki** — the NES community's exhaustive technical reference; goes far deeper into PPU/APU/mapper behavior than Module 9's scope needed.
- **c64-wiki.com** — the equivalent depth for the C64: KERNAL routine catalogs, VIC-II/SID register documentation beyond Module 8's scope, and the demoscene techniques (raster effects, FLI) named above.
- **Ben Eater's breadboard 6502 series** — the physical-hardware complement to this guide's simulator-and-emulator-based approach; builds the exact VIA-based I/O model Module 4 documented, on real chips, from scratch.
