# Module 8 — Porting to the Commodore 64

The first real platform. Everything here is the **documented, not executed** tier: `sim65`'s hosted environment has no VIC-II, SID, or CIA to write to, and no scriptable C64 emulator is available locally to drive automatically — only VICE (`x64sc`), a GUI emulator, which is genuinely useful for *manually* loading and eyeballing a `.prg` once you build one, but isn't part of this guide's automated "assemble, run, inspect" verification loop the way `sim65` was for Modules 1–7. Every register table below is cross-checked against well-established, independently-corroborated C64 documentation (the C64 Programmer's Reference Guide and decades of consistent secondary sources), not run. The CPU-side logic this module reuses — fixed-point movement, the AABB collision test, struct-of-arrays entity storage — *was* executed, in Module 7; nothing about running on real 6502 logic changes when the surrounding chips do. Feeds Capstone 5.

## The memory map & the 6510's bank-switching I/O port

**You'll be able to:** explain why the C64's 64KB address space can hold ROM, RAM, and I/O registers that overlap the same addresses, and switch between them safely.

**Concept**

The C64's CPU is technically a 6510 — a 6502 core with six extra I/O pins wired to two extra addresses, `$00` and `$01`, that exist nowhere on a plain 6502. `$00` is the data-direction register for those six pins; `$01` is the actual I/O port. Three of its bits — `LORAM` (bit 0), `HIRAM` (bit 1), and `CHAREN` (bit 2) — control a hardware bank-switcher (the PLA) that decides what's actually visible at three address ranges that would otherwise all be plain RAM:

| Range | If the matching bit is 1 | If it's 0 |
|---|---|---|
| `$A000`–`$BFFF` (`LORAM`) | BASIC ROM | ordinary RAM |
| `$E000`–`$FFFF` (`HIRAM`) | KERNAL ROM | ordinary RAM |
| `$D000`–`$DFFF` (`CHAREN`) | I/O registers (VIC-II, SID, CIA1, CIA2, color RAM) | Character ROM |

RAM underneath every one of these ranges still physically exists — banking just decides which of two (or three) things answers when the CPU addresses that range. The power-on default is `$37` (`LORAM=1, HIRAM=1, CHAREN=1`): BASIC, KERNAL, and the I/O registers are all visible, which is exactly the configuration this module assumes throughout, since it's also cc65's `c64` target default.

**Example**

```asm
IO_PORT_DDR = $00
IO_PORT     = $01

; ensure the default banking config: BASIC+KERNAL+IO all visible
    LDA #%00101111      ; DDR: the 6 real I/O pins as outputs (bits 0-5)
    STA IO_PORT_DDR
    LDA #%00110111       ; LORAM=1, HIRAM=1, CHAREN=1 -- the power-on default ($37)
    STA IO_PORT
```

> **Pitfall:** clearing `CHAREN` (bit 2) doesn't just hide the I/O registers behind Character ROM — it makes VIC-II, SID, and CIA1/CIA2 stop answering at `$D000`–`$DFFF` entirely. Code that writes to, say, `$D000` (a VIC-II sprite-position register) while `CHAREN` is `0` isn't setting a sprite position at all; it's writing into ROM, which silently discards the write. This module never touches `CHAREN`, precisely to avoid that trap — Character ROM access is out of scope here.

**Practice**

- Write the `$01` value that keeps KERNAL and I/O visible but exposes RAM underneath BASIC (useful once a program outgrows `$0801`–`$9FFF` and wants the `$A000`–`$BFFF` range for its own data).
- Explain, from the table, why a program that clears `HIRAM` without first replacing the reset/IRQ vectors with its own RAM-based ones is dangerous.

## Getting a program running: the BASIC stub and KERNAL calls

**You'll be able to:** produce a loadable, runnable `.prg`, and call a KERNAL routine instead of hand-rolling character output.

**Concept**

A C64 program loaded from disk or tape is a raw memory image — a `.prg` file's first two bytes are the load address, and everything after gets copied there verbatim. User programs conventionally load at `$0801` and start with a tiny **BASIC stub**: a one-line tokenized BASIC program (`10 SYS 2064`, where `2064` is `$0810`) that `RUN` can execute, which immediately `SYS`s into the real machine-code entry point just past it. cc65's `c64` target linker config generates this stub automatically — this is one of the two "official" cc65 targets named in this guide's toolchain section, alongside the bare-metal config used in Modules 1–7 — so `cl65 -t c64 -o game.prg *.s` produces a file you can load in VICE with no manual stub-writing required.

The KERNAL (the C64's ROM operating system, visible at `$E000`–`$FFFF` per the table above) exposes a stable, documented table of entry points regardless of the exact ROM revision. The two most commonly needed:

| Routine | Address | Does |
|---|---|---|
| `CHROUT` | `$FFD2` | Write the character in `A` to the current output device (the screen, by default) |
| `GETIN` | `$FFE4` | Read one character from the keyboard buffer into `A` (`A = 0` if nothing's waiting) |

**Example**

```asm
CHROUT = $FFD2

.segment "STARTUP"        ; cc65's c64 target places the SYS stub here automatically
.segment "CODE"
    LDA #'H'
    JSR CHROUT
    LDA #'I'
    JSR CHROUT
    RTS
```

This is standard, documented KERNAL usage — the exact ROM contents behind `$FFD2` vary by KERNAL revision, but the *entry address* and calling convention (character in `A`, `JSR`, nothing returned that needs checking) are a stable, decades-old public contract, which is why this counts as documented rather than an untested guess. It isn't run under `sim65`, which has no C64 KERNAL ROM mapped in.

> **Pitfall:** the bare-metal modules' `.segment "CODE"` habit still applies, but a C64 build additionally needs `.segment "STARTUP"` (or whatever cc65's `c64.cfg` names its entry segment) to actually be present and first, or the linker won't emit the BASIC stub — the resulting `.prg` will still assemble cleanly and simply fail to `RUN` from BASIC, the same "assembles fine, silently wrong" trap this guide has flagged before (00-overview.md's methodology note).

**Practice**

- Write a loop that calls `CHROUT` for each character of a short null-terminated string, advancing a pointer with indexed addressing (Module 2).
- Look up `CLRSCR` (`$E544`) or `PLOT` (`$FFF0`) in a KERNAL reference and note what each is documented to do, without needing to use them yet.

## VIC-II sprites: setup and movement

**You'll be able to:** enable a hardware sprite, position it, and move it every frame.

**Concept**

The VIC-II video chip has eight independent **hardware sprites** — 24×21-pixel objects with their own position, color, and enable bit, drawn by the chip itself with no CPU involvement in the actual pixel output. Each sprite's data is 63 bytes (21 rows × 3 bytes, one bit per pixel), stored in 64-byte-aligned blocks; a **sprite pointer** — one byte per sprite, at the last 8 bytes of whatever 1KB of RAM is currently configured as screen memory (`$07F8`–`$07FF` for the default screen at `$0400`) — holds *which* 64-byte block a sprite's data lives in, as a block number (actual address = pointer value × 64, within the VIC-II's current 16KB bank).

| Register | Address | Purpose |
|---|---|---|
| `SP0X`/`SP0Y` … `SP7X`/`SP7Y` | `$D000`–`$D00F` | X/Y position, sprite 0 through 7 (one X/Y pair per sprite) |
| `MSIGX` | `$D010` | 9th (high) bit of each sprite's X position — one bit per sprite, since X runs 0–511 but the per-sprite register only holds the low 8 bits |
| `SPENA` | `$D015` | Sprite enable — one bit per sprite, `1` = visible |
| `SP0COL` … `SP7COL` | `$D027`–`$D02E` | Each sprite's color (one nibble-range color value per sprite, independent of the sprite's shape data) |

**Example**

```asm
SPENA  = $D015
SP0X   = $D000
SP0Y   = $D001
SP0COL = $D027
SCREEN_SPRITE_PTRS = $07F8

    LDA #12                    ; sprite 0's shape data lives in block 12 -> address 12*64 = $0300
    STA SCREEN_SPRITE_PTRS

    LDA #100
    STA SP0X                    ; X = 100 (within the 0-255 range, MSIGX bit stays 0)
    LDA #100
    STA SP0Y

    LDA #%00000001               ; enable sprite 0 only
    STA SPENA

    LDA #1                       ; color 1 = white, in the VIC-II's fixed 16-color palette
    STA SP0COL
```

Moving the sprite every frame is exactly Module 7's `_step_position` routine, unchanged — write the resulting `pos_hi` byte straight to `SP0X`/`SP0Y` instead of to a plain memory location. The fixed-point math doesn't know or care that its output happens to land on a hardware register instead of RAM.

> **Pitfall:** the sprite pointer is a *block number*, not an address — `STA SCREEN_SPRITE_PTRS` with the shape data's actual address (say, `$0300`) instead of its block number (`$0300 / 64 = 12`) is a very easy off-by-a-factor-of-64 mistake, and the visible symptom (garbage on screen, or the wrong shape entirely, since some *other* block's data gets displayed) doesn't obviously point back to this cause.

**Practice**

- Extend the example to enable and position sprite 1 as well, using `SP1X`/`SP1Y`/`SP1COL` (`$D002`/`$D003`/`$D028`).
- Work out the two-step sequence needed to move a sprite past X position 255 (hint: `MSIGX` at `$D010`).

## Hardware collision detection

**You'll be able to:** detect a sprite-to-sprite or sprite-to-background collision without writing any collision math at all.

**Concept**

This is the C64 port's headline contrast with Modules 9–10 (Module 7's Progress check called this out directly): the VIC-II detects sprite overlaps in hardware, continuously, as a side effect of drawing — Module 7's AABB test isn't needed at all for sprite-vs-sprite or sprite-vs-background collisions on this platform. Two registers report the result; **reading either one clears it**, so a collision is a one-shot event you must catch on the frame it happens, not a level you can poll repeatedly and expect to still see set.

| Register | Address | Bit meaning |
|---|---|---|
| `SPSPCL` | `$D01E` | Sprite-sprite collision — bit *n* set means sprite *n* touched at least one other enabled sprite since this register was last read |
| `SPBGCL` | `$D01F` | Sprite-background collision — bit *n* set means sprite *n* touched a non-background-color pixel of the character display since this register was last read |

**Example**

```asm
SPSPCL = $D01E

; call once per frame; A returns nonzero if sprite 0 collided with any other sprite this frame
_check_sprite0_collision:
    LDA SPSPCL          ; reading clears the register -- must be read exactly once per frame
    AND #%00000001        ; isolate sprite 0's bit
    RTS
```

This is standard, documented VIC-II behavior — the "read clears" semantics specifically are the kind of side-effecting hardware detail this guide's `sim65` environment has no chip to reproduce, so it's flagged documented rather than demonstrated the way Module 7's software AABB test was actually run and checked.

> **Pitfall:** because reading `SPSPCL`/`SPBGCL` clears them, checking the *same* collision twice in one frame (once in a movement routine, once in a scoring routine) means only the first read sees it — the second always reads zero. Read each register exactly once per frame, into a saved byte, and have every interested routine check the saved copy instead of re-reading the hardware register.

**Practice**

- Write a routine that reads `SPBGCL` once per frame, saves it to a byte, and checks bit 0 (sprite 0) and bit 1 (sprite 1) from that saved copy for two different purposes (say, "sprite 0 hit a wall" and "sprite 1 hit a wall").
- Compare this to Module 7's software AABB test: what does the hardware version *not* tell you that the software version does (hint: which axis, or how much overlap)?

## SID sound

**You'll be able to:** play a tone through the SID chip using its actual synthesizer, not a toggled bit.

**Concept**

Unlike the one-bit-speaker toggle from Module 4, the SID (`$D400`–`$D41C`) is a genuine three-voice synthesizer: each voice has a 16-bit frequency register, a selectable waveform, and a hardware ADSR (attack/decay/sustain/release) envelope generator. Starting a note is: set the frequency, set the waveform *and* set the gate bit (bit 0 of the control register) to `1` in the same write; releasing it is clearing just the gate bit, which lets the envelope's release phase play out instead of cutting the sound off instantly.

| Register | Address | Purpose |
|---|---|---|
| `V1FREQLO`/`V1FREQHI` | `$D400`/`$D401` | Voice 1 frequency (16-bit) |
| `V1CTRL` | `$D404` | Waveform select (bits 4–7) + gate (bit 0) |
| `V1AD` | `$D405` | Attack (bits 4–7) / Decay (bits 0–3) |
| `V1SR` | `$D406` | Sustain (bits 4–7) / Release (bits 0–3) |
| `SIGVOL` | `$D418` | Master volume, bits 0–3 (0–15) |

**Example**

```asm
V1FREQLO = $D400
V1FREQHI = $D401
V1AD     = $D405
V1SR     = $D406
V1CTRL   = $D404
SIGVOL   = $D418

_play_beep:
    LDA #$0F
    STA SIGVOL              ; master volume to max
    LDA #$09
    STA V1AD                  ; fast attack, short decay
    LDA #$00
    STA V1SR                    ; no sustain, fast release
    LDA #$25                     ; a mid-range frequency (documented example value, not tuned)
    STA V1FREQLO
    LDA #$10
    STA V1FREQHI
    LDA #%00010001                 ; waveform = triangle (bit 4), gate = 1 (bit 0) -- start the note
    STA V1CTRL
    RTS

_stop_beep:
    LDA #%00010000               ; same waveform bits, gate = 0 -- release, don't cut off
    STA V1CTRL
    RTS
```

Documented SID behavior, not run — there's no SID to synthesize audio inside `sim65`'s hosted environment. The register layout and the "gate on to start, gate off to release" convention are stable, well-established facts about the chip, cross-checked the same way the VIC-II tables above were.

> **Pitfall:** setting `V1CTRL` with the gate bit already `0` (say, by writing a waveform selection without also setting bit 0) never starts a note at all — and conversely, changing the waveform bits *while* gate is still `1` retriggers the attack phase from the beginning rather than smoothly switching waveform mid-note. Waveform and gate share one register specifically so you can set both atomically in one write; splitting them into two writes reliably produces audible clicks or missed notes.

**Practice**

- Write a version of `_play_beep` that uses a pulse waveform (bits `%01000001`) instead of triangle, and adjust `V1FREQLO`/`V1FREQHI` for a different pitch.
- Trace through what happens if `_stop_beep` is never called: does the note ever stop on its own (hint: re-read what Release actually does once Sustain is `0`)?

## CIA keyboard and joystick input

**You'll be able to:** read a joystick port through CIA1, distinguishing it from the keyboard matrix that shares the same chip.

**Concept**

CIA1 (`$DC00`–`$DC0F`) serves two logically separate jobs on the same two 8-bit ports, which is a common point of confusion: **Port A** (`$DC00`) doubles as both the keyboard matrix's column-select output *and* joystick port 2's input; **Port B** (`$DC01`) doubles as the keyboard matrix's row-read input *and* joystick port 1's input. A joystick plugged into either port pulls the corresponding directional bits low when pushed — the port reads **active-low**, meaning a bit reading `0` means "pressed," the opposite of the polled-input convention Module 4 used.

| Bit | Direction (joystick port 2, `$DC00`) |
|---|---|
| 0 | Up |
| 1 | Down |
| 2 | Left |
| 3 | Right |
| 4 | Fire |

**Example**

```asm
CIA1_PRA = $DC00     ; joystick port 2

; A out: 1 if fire is currently pressed, 0 otherwise
_read_fire:
    LDA CIA1_PRA
    AND #%00010000       ; isolate the fire bit
    BEQ fire_down          ; active-low: 0 means pressed
    LDA #0
    RTS
fire_down:
    LDA #1
    RTS
```

Documented CIA behavior — bit assignments and the active-low convention are a stable, well-known hardware fact, not executed here since `sim65` has no CIA to read from.

> **Pitfall:** if a program is also using CIA1 for the keyboard (which nearly every real C64 program is, even indirectly through KERNAL calls that scan the keyboard), reading Port A while a keyboard scan has it configured as a column-select *output* rather than an input can return misleading values — joystick port 2 in particular shares its bits with keyboard column selection in a way port 1 (`$DC01`, the keyboard's row-read port) doesn't. This module's capstone sidesteps the conflict entirely by using joystick port 1 (`$DC01`), which doesn't double as the keyboard's output side.

**Practice**

- Rewrite `_read_fire` to check "up" (bit 0) instead of fire, on joystick port 1 (`$DC01`) instead of port 2.
- Combine direction bits into simultaneous horizontal + vertical movement (e.g., up-and-right pressed together) using two separate `AND`/`BEQ` checks against the same read byte.

## Capstone 5 — Move a hardware sprite, hardware collision, SID cue

**Proves:** screen memory, keyboard/joystick input, sound, **hardware** collision (Modules 4, 7, 8).

Assembled from this module's pieces plus Module 7's movement math, reused unchanged: fixed-point position feeds directly into `SP0X`/`SP0Y`, joystick input from CIA1 sets velocity instead of a keypress branching directly on position, and a `SID` beep plus reading `SPSPCL` replace Module 7's software AABB test entirely — the one substitution this whole capstone exists to demonstrate.

```asm
SP0X    = $D000
SP0Y    = $D001
SPENA   = $D015
SP0COL  = $D027
SPSPCL  = $D01E
CIA1_PRB = $DC01        ; joystick port 1 -- doesn't collide with keyboard scanning
V1FREQLO = $D400
V1FREQHI = $D401
V1AD    = $D405
V1SR    = $D406
V1CTRL  = $D404
SIGVOL  = $D418
SCREEN_SPRITE_PTRS = $07F8

.segment "STARTUP"
.segment "CODE"

pos_hi: .byte 100
pos_lo: .byte 0
vel_hi: .byte 0
vel_lo: .byte 0

_setup:
    LDA #12
    STA SCREEN_SPRITE_PTRS      ; sprite data pre-loaded at block 12 ($0300)
    LDA #100
    STA SP0Y
    LDA #%00000001
    STA SPENA
    LDA #1
    STA SP0COL
    LDA #$0F
    STA SIGVOL
    LDA #$09
    STA V1AD
    LDA #$00
    STA V1SR
    RTS

; one frame: read joystick, set velocity, step position, write to hardware, check collision
_frame:
    LDA CIA1_PRB
    AND #%00001000          ; right
    BNE not_right
    LDA #3
    STA vel_lo
    JMP moved
not_right:
    LDA #0
    STA vel_lo
moved:
    ; --- Module 7's _step_position, unchanged ---
    CLC
    LDA pos_lo
    ADC vel_lo
    STA pos_lo
    LDA pos_hi
    ADC vel_hi
    STA pos_hi

    LDA pos_hi
    STA SP0X                   ; hardware sprite position IS the game's position -- no separate draw step

    LDA SPSPCL                  ; read once this frame; reading clears it
    AND #%00000001
    BEQ no_hit
    LDA #$28                    ; frequency for a hit cue
    STA V1FREQLO
    LDA #$11
    STA V1FREQHI
    LDA #%00010001
    STA V1CTRL                    ; gate on -- start the beep
    JMP frame_done
no_hit:
    LDA #%00010000
    STA V1CTRL                     ; gate off -- let any in-progress note release
frame_done:
    RTS
```

The one piece of this capstone that has *any* automated verification behind it is the CPU-side arithmetic (`_step_position`), because it's byte-for-byte Module 7's already-verified routine — everything touching `SP0X`, `SPSPCL`, `CIA1_PRB`, or the SID registers is documented hardware behavior, assembled correctly against the documented register map above but not run, per this module's stated verification tier. Loading the assembled `.prg` into VICE (`x64sc game.prg`) and watching the sprite actually move and beep on collision with a second, hand-placed sprite is the manual check this guide can point you to but can't itself automate.

> **Pitfall:** the capstone assumes sprite shape data already sits at block 12 (`$0300`) before `_setup` runs — this listing doesn't include the 63-byte sprite bitmap itself. A real build needs a `.segment "DATA"` block reserving and initializing those bytes at the right address (64-byte aligned), or the sprite pointer above will point at whatever happens to already be in RAM there.

**Practice**

- Add a second hardware sprite (sprite 1) as a stationary obstacle, and confirm `SPSPCL` bit 0 sets when sprite 0's fixed-point position walks into it.
- Add up/down movement using `CIA1_PRB` bits 0–1, reusing the same `vel_hi`/`vel_lo` fixed-point pattern for the Y axis.

## Progress check

1. What are the three PLA-controlled ranges the 6510's `$01` port switches between ROM/RAM/I-O, and which bit controls each?
2. Why does clearing `CHAREN` silently break code that writes to VIC-II or SID registers, rather than raising any kind of error?
3. What does a VIC-II sprite pointer byte actually hold — an address, or something else?
4. Why must `SPSPCL`/`SPBGCL` be read exactly once per frame, rather than however many times different routines want to check it?
5. Why does starting a SID note require setting the waveform and the gate bit in the *same* write to `V1CTRL`?
6. Why does this capstone deliberately read joystick port 1 (`$DC01`) rather than port 2 (`$DC00`)?
7. Which single routine from Module 7 does this entire module reuse completely unchanged, and why doesn't porting it to hardware sprite registers require rewriting it?

### Answers

1. `$A000`–`$BFFF` (BASIC ROM vs. RAM) via `LORAM`, bit 0; `$E000`–`$FFFF` (KERNAL ROM vs. RAM) via `HIRAM`, bit 1; `$D000`–`$DFFF` (I/O registers vs. Character ROM) via `CHAREN`, bit 2.
2. Because the underlying hardware simply stops routing that address range to the I/O chips and routes it to Character ROM instead — a write to, say, `$D000` while `CHAREN` is `0` is a write to ROM, which is physically discarded with no fault or signal of any kind.
3. A block number, not an address — the actual sprite data address is the pointer value multiplied by 64, within the VIC-II's current 16KB bank.
4. Because reading either register clears it as a side effect — a second read in the same frame, by a different routine, would always see zero even if a real collision happened, since the first read already consumed the signal.
5. Because changing the waveform bits while gate is still `1` retriggers the envelope's attack phase on an already-sounding note instead of cleanly starting a new one, and setting gate without a waveform (or vice versa, across two separate writes) can produce a silent or clicking result — the two need to land together.
6. Because CIA1 Port A (`$DC00`, joystick port 2) doubles as the keyboard matrix's column-select *output*, which can produce misleading joystick readings if keyboard scanning is also active; Port B (`$DC01`, joystick port 1) is the keyboard's row-read *input* side and doesn't have that conflict.
7. `_step_position`, the fixed-point movement routine — it's reused byte-for-byte because it only ever reads and writes plain memory locations (`pos_hi`/`pos_lo`/`vel_hi`/`vel_lo`); the capstone's only change is writing the *result* to `SP0X` instead of an ordinary byte, which the routine itself has no reason to know or care about.
