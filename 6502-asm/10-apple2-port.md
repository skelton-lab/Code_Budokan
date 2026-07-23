# Module 10 — Porting to the Apple II/IIe

The third platform, and the one where the CPU story is the simplest of the three (a plain 6502, no instruction-set quirk the way the NES's 2A03 had) but the *graphics* story is the strangest of any platform this guide covers. Same tier as Modules 8–9: documented, not executed — `sim65` has no soft-switch I/O space, no hi-res framebuffer, and no speaker to toggle, and this guide has no scriptable Apple II emulator locally, only AppleWin or MAME's `apple2e` driver (named in this guide's setup section), both GUI tools useful for manually loading and eyeballing a build the way VICE and FCEUX/Mesen were for Modules 8–9. Feeds Capstone 7.

## The memory map and soft switches

**You'll be able to:** explain what a "soft switch" is and why it's a different I/O model from both prior platforms.

**Concept**

The Apple II's CPU is an unmodified 6502 — no bank-switching I/O port like the C64's 6510, no disabled instruction like the NES's 2A03. Its I/O model is instead built entirely from **soft switches**: a block of addresses (`$C000`–`$C0FF`) where simply *accessing* the address — sometimes a read, sometimes a write, sometimes either one — triggers a hardware action, with no data byte's actual value mattering for many of them. This is a genuinely different pattern from both the C64's ordinary "write a value into a register" model and the NES's PPU/APU register writes.

| Range | Contents |
|---|---|
| `$0000`–`$00FF` | Zero page (same 6502-wide significance as every other platform this guide covers) |
| `$0400`–`$07FF` | Text page 1 — the 40×24 text screen, memory-mapped but laid out non-linearly (see below) |
| `$2000`–`$3FFF` | Hi-res graphics page 1 — 8KB, 280×192 pixels, also non-linear |
| `$C000`–`$C0FF` | Soft switches — keyboard, speaker, and display-mode control |
| `$D000`–`$FFFF` | System monitor ROM (bank-switchable to RAM via a Language Card on an original Apple II; built-in on the IIe) |

**Example**

```asm
; a soft switch: accessing this address IS the action -- the byte value read/written is irrelevant
TXTCLR = $C050        ; access = switch to graphics mode
TXTSET = $C051          ; access = switch to text mode

    LDA TXTCLR          ; the LDA is only here to generate the access -- the loaded value is unused
```

> **Pitfall:** because a soft switch's effect comes from the *access itself*, not the value transferred, it's easy to write code that reads a soft switch expecting a meaningful value back (the way `LDA` normally works) and get confused when the returned byte is effectively noise — for most soft switches, the only correct use is "access it, discard whatever comes back."

**Practice**

- Look up `$C052`/`$C053` (mixed-mode vs. full-screen graphics) and `$C054`/`$C055` (page 1 vs. page 2) and note, without wiring them up yet, which combination this module's capstone will need.
- Explain why the Apple II needs no equivalent of the C64's `CHAREN` bit — what does "soft switch" replace that mechanism with instead?

## Getting a program running: monitor calls

**You'll be able to:** call the system monitor's character-output routine, the Apple II's equivalent of CHROUT.

**Concept**

Like the C64's KERNAL, the Apple II's system monitor ROM exposes a small set of stable, documented entry points regardless of exact ROM revision. The most commonly used:

| Routine | Address | Does |
|---|---|---|
| `COUT` | `$FDED` | Write the character in `A` to the current output device |
| `RDKEY` | `$FD0C` | Wait for and return a keypress in `A` |
| `HOME` | `$FC58` | Clear the text screen and home the cursor |

cc65's `apple2`/`apple2enh` targets — the two remaining "official" targets this guide's toolchain section named — handle the startup/loading boilerplate the way the `c64` and `nes` targets did for their platforms; `cl65 -t apple2 -o game.bin *.s` produces a binary loadable through the monitor or an emulator's built-in loader, without a hand-written boot stub.

**Example**

```asm
COUT = $FDED

_print_char:
    LDA #'H'
    JSR COUT
    LDA #'I'
    JSR COUT
    RTS
```

Documented monitor-ROM usage — `COUT`'s address and calling convention (character in `A`, `JSR`, no return value to check) are a stable, decades-old public contract, the same category of fact as the C64's `CHROUT` in Module 8, not executed here since `sim65` has no Apple II monitor ROM mapped in.

**Practice**

- Write a loop that `JSR`s `COUT` for each character of a short null-terminated string (the same pattern as Module 8's KERNAL practice problem).
- Compare `COUT`'s role here to `CHROUT` (Module 8) and `PPUCTRL`-driven rendering (Module 9) — which of the three platforms' "get a character or pixel on screen" mechanism is the most similar to a plain subroutine call, and which is the least?

## Hi-res graphics: the interleaved page layout

**You'll be able to:** compute the correct memory address for a given screen row in hi-res mode, despite the layout being non-linear.

**Concept**

This is the strangest thing in this entire guide. Hi-res page 1 occupies a contiguous 8KB block (`$2000`–`$3FFF`), and each screen row is 40 bytes wide (280 pixels ÷ 7 usable pixel-bits per byte, rounded to a byte boundary) — but **consecutive screen rows are not stored at consecutive addresses**. The 192 rows are split into three 64-row groups, and within each group, rows are further interleaved. Given row `R` (0–191):

```
a = R / 64            (which third of the screen: 0, 1, or 2)
b = (R mod 64) / 8    (which 8-row band within that third: 0-7)
c = (R mod 64) mod 8  (which row within that band: 0-7)

row_base_address = $2000 + a*$28 + b*$80 + c*$400
```

Row 0 lands at `$2000` as expected, but row 1 jumps to `$2400` — a full `$400` (1KB) away — not `$2000+40` the way a naive linear framebuffer would place it. Every real Apple II hi-res program either computes this formula or, far more commonly, uses a **precomputed 192-entry table of row base addresses** built once and indexed by row number, because the interleaving makes live per-pixel computation both slow and error-prone compared to a table lookup.

Within a row, each byte covers 7 horizontal pixels (bits 0–6); bit 7 selects a color-palette grouping used by the hi-res color-artifacting technique, which is real but out of scope here — this module treats hi-res purely as a monochrome bitmap (bit 7 left `0`), matching the capstone's "hi-res shape" requirement without needing NTSC color-artifact theory.

**Example**

```asm
; row_table: precomputed base address (low byte, high byte) for each of the 192 rows,
; built once at startup rather than recomputed per pixel -- the standard technique.
row_table_lo: .res 192
row_table_hi: .res 192

_build_row_table:
    LDX #0
build_loop:
    TXA
    ; --- a = X/64, b = (X mod 64)/8, c = (X mod 64) mod 8; base = $2000 + a*$28 + b*$80 + c*$400 ---
    ; (full division/multiply sequence omitted here -- Module 2's arithmetic techniques cover the
    ;  shifts/masks needed, since all three divisors are powers of two or reduce to them)
    INX
    CPX #192
    BNE build_loop
    RTS
```

Documented, cross-checked against the address formula's known anchor points (row 0 = `$2000`, row 1 = `$2400`, row 8 = `$2080`, row 64 = `$2028` — all independently verifiable against published Apple II reference tables) — the formula itself is settled hardware fact, but the table-building routine's actual arithmetic sequence is sketched, not fully written out or run, since it depends on Module 2 techniques applied to specific constant divisors rather than introducing anything new.

> **Pitfall:** treating hi-res memory as if it were a linear framebuffer (row N at `base + N*40`, the naive assumption every other platform in this guide would actually satisfy) produces a program that assembles perfectly and then draws visually scrambled output — rows appearing in the wrong screen position — with nothing about the mistake looking wrong in the source.

**Practice**

- Using the formula, compute the base address for row 100 by hand (`a = 100/64 = 1`, work through `b` and `c` from there).
- Explain why a precomputed table is preferred over computing the formula every time a game needs to plot a pixel during real-time gameplay.

## The one-bit speaker

**You'll be able to:** produce a tone using the Apple II's speaker soft switch.

**Concept**

Exactly the technique Module 4 named the Apple II as the canonical real-world example of: a single soft switch, `$C030`, where *any access at all* (read or write) toggles the speaker's output state. This is the same "toggle a bit, delay, repeat" logic Module 4 verified and Capstone 1 reused — the only thing that changes here is which address performs the toggle.

**Example**

```asm
SPKR = $C030

; toggles the speaker N times (N in A), with a delay between toggles -- same shape as Module 4's
; _make_tone, with the toggle itself now a soft-switch access instead of an ORA bit flip
_make_tone:
    STA count_save
tone_loop:
    LDA SPKR              ; the access itself toggles the speaker -- the loaded value is discarded
    LDX #10
delay:
    DEX
    BNE delay
    DEC count_save
    BNE tone_loop
    RTS
count_save: .byte 0
```

Documented soft-switch behavior, not executed — same status as Module 4's own VIA-based tone generator, which flagged the exact same limitation (pitch depends on real hardware clock speed, not modeled by `sim65`).

> **Pitfall:** because `$C030` toggles on *any* access, an instruction that reads it as a side effect of something else (rare, but possible with certain addressing-mode quirks) can silently produce an extra, unintended toggle — unlike Module 4's VIA-based `ORA` toggle, where only a deliberate `EOR`-then-`STA` sequence changes the pin state.

**Practice**

- Compare this routine to Module 4's original `_make_tone` line by line — identify the exact one line that changed, and confirm every other line (the delay loop, the count-down) is untouched.
- Extend to a 16-bit delay counter, exactly as Module 4's own practice problem suggested, for a lower-pitched tone.

## Keyboard soft-switch input

**You'll be able to:** read a keypress and correctly clear the "new key" strobe.

**Concept**

Keyboard input uses two related soft switches: `$C000` (read) returns bit 7 set if a key has been pressed since the strobe was last cleared, with bits 0–6 holding the ASCII code of the *last* key pressed regardless of whether the strobe bit is currently set; `$C010` (any access) clears the strobe bit only — it does **not** clear the character bits, which keep reporting the last key pressed until a new one arrives.

**Example**

```asm
KBD    = $C000
KBDSTRB = $C010

; A out: the ASCII code of a new keypress, or 0 if none is waiting
_poll_key:
    LDA KBD
    BPL no_key            ; bit 7 clear = no new key since last strobe clear
    AND #%01111111           ; strip the strobe bit, keep the ASCII code
    STA _result
    LDA KBDSTRB                ; any access clears the strobe -- value read is irrelevant
    RTS
no_key:
    LDA #0
    STA _result
    RTS
_result: .byte 0
```

Documented behavior — the strobe/character-bits split and the "any access clears it" convention for `$C010` are stable, well-established public facts about the Apple II's keyboard hardware, not executed, since `sim65` has no keyboard soft switches to poll.

> **Pitfall:** assuming `$C000` reads back to `0` after `$C010` clears the strobe is a natural but wrong expectation carried over from Module 4's polled-input pattern (which *did* explicitly clear its `_port` byte to `0` after reading) — the Apple II's `$C000` low 7 bits simply keep showing the last key pressed forever, with only the strobe (bit 7) telling you whether *that specific* keypress is "new." Code that checks `KBD == 0` to mean "nothing has ever been pressed" will misbehave after the very first keypress.

**Practice**

- Explain, using the routine above, what `_poll_key` returns on a second call with no new keypress in between, and why that's correct behavior rather than a bug.
- Compare this two-register split (data bits + separate strobe-clear address) to Module 4's single-byte polled port (data and acknowledge combined in one write) — what problem does splitting them solve?

## Manual shape collision

**You'll be able to:** detect overlap between two hi-res shapes using the same software test the NES module needed.

**Concept**

Like the NES (Module 9), the Apple II has no hardware collision detection of any kind — hi-res graphics are just bytes in memory the CPU happens to interpret as pixels; nothing about the video hardware watches for overlapping shapes. Module 7's `_test_collide8` AABB test applies here exactly as it did on the NES, unchanged, operating on whatever coordinate system the game keeps for each shape's logical position (independent of the interleaved-row address formula, which only matters at *draw* time, not at collision-test time).

**Example**

```asm
; identical to Module 7's and Module 9's version -- a third platform, the same unmodified routine
_test_collide8:
    LDA val_a
    SEC
    SBC val_b
    BCS already_positive
    EOR #$FF
    CLC
    ADC #1
already_positive:
    CMP #8
    BCC is_hit
    LDA #0
    STA hit_result
    RTS
is_hit:
    LDA #1
    STA hit_result
    RTS
```

Verification status carries over from Module 7 exactly as it did for the NES capstone: already assembled, run, and checked under `sim65`; nothing platform-specific changes this routine at all.

> **Pitfall:** keep the shape's *logical* row/column position (small integers, easy to compare) separate from the interleaved hi-res *address* used only when actually plotting pixels — running collision math directly against interleaved addresses would compare numbers whose ordering has nothing to do with actual screen proximity (row 1's address, `$2400`, is numerically far from row 0's `$2000`, despite the rows being adjacent on screen).

**Practice**

- Confirm, by re-reading the row-address formula, why two logically adjacent rows (say, row 7 and row 8) have addresses that are *not* numerically close (row 7 = `$2000 + 7*$400 = $3C00`; row 8 = `$2000 + 1*$80 = $2080`) — and why this makes logical-position collision math the only sane approach.
- Run the two-axis version (x and y calls to `_test_collide8`, combined with `AND`) exactly as Module 7's and Module 9's practice problems described.

## Capstone 7 — Move a hi-res shape, software collision, speaker cue

**Proves:** screen memory (hi-res page), keyboard input, sound, **software** collision (Modules 4, 7, 10).

The third and final instance of Capstones 5–7's shared structure: logical position driven by Module 7's `_step_position`, hi-res drawing through the row-table technique above, `_test_collide8` for collision exactly as the NES capstone used it, and the one-bit speaker soft switch for the hit cue.

```asm
SPKR    = $C030
KBD     = $C000
KBDSTRB = $C010
TXTCLR  = $C050
HIRESON = $C057
MIXCLR  = $C053
PAGE1   = $C054

pos_hi: .byte 20          ; logical row/column position -- NOT a hi-res memory address
pos_lo: .byte 0
vel_hi: .byte 0
vel_lo: .byte 0
val_a:  .byte 0
val_b:  .byte 0
hit_result: .byte 0
row_table_lo: .res 192
row_table_hi: .res 192

_setup:
    LDA TXTCLR             ; graphics mode
    LDA HIRESON               ; hi-res (not lo-res)
    LDA MIXCLR                  ; full-screen graphics, no text lines
    LDA PAGE1                     ; page 1
    JSR _build_row_table
    RTS

; one frame: poll keyboard, set velocity, step position, plot (sketched), check collision, beep
_frame:
    LDA KBD
    BPL no_key
    AND #%01111111
    CMP #'D'                     ; 'D' = move right, this capstone's minimal control scheme
    BNE not_right
    LDA #2
    STA vel_lo
not_right:
    LDA KBDSTRB
no_key:
    CLC
    LDA pos_lo
    ADC vel_lo
    STA pos_lo
    LDA pos_hi
    ADC vel_hi
    STA pos_hi

    ; plotting the shape at (pos_hi's column, a fixed row) via row_table is Module 10's drawing
    ; step -- omitted here to keep the collision/sound structure visible; see the hi-res session
    ; above for the row-address lookup this would use.

    LDA pos_hi
    STA val_a
    LDA #60                      ; fixed obstacle column
    STA val_b
    JSR _test_collide8
    LDA hit_result
    BEQ frame_done
    LDA #20
    JSR _make_tone                ; Module 10's speaker-toggle tone, reused unchanged
frame_done:
    RTS

_test_collide8:
    LDA val_a
    SEC
    SBC val_b
    BCS already_positive
    EOR #$FF
    CLC
    ADC #1
already_positive:
    CMP #8
    BCC is_hit
    LDA #0
    STA hit_result
    RTS
is_hit:
    LDA #1
    STA hit_result
    RTS

_make_tone:
    STA count_save
tone_loop:
    LDA SPKR
    LDX #10
delay:
    DEX
    BNE delay
    DEC count_save
    BNE tone_loop
    RTS
count_save: .byte 0

_build_row_table:
    RTS                             ; sketched in the hi-res session above; full arithmetic omitted here
```

Same split as Capstones 5 and 6: `_step_position` and `_test_collide8` are Module 7's actually-verified routines, unchanged for a third platform in a row — the strongest demonstration in this guide that hardware-agnostic CPU logic really does port for free. Everything touching `$C0xx` soft switches is documented Apple II hardware behavior, assembled correctly against the tables above but not run. As with Capstones 5 and 6, loading the build into AppleWin or MAME's `apple2e` driver and watching the shape actually move and click at the obstacle is a manual check this guide points to but doesn't automate.

> **Pitfall:** this listing deliberately leaves `_build_row_table`'s actual arithmetic and the pixel-plotting step unwritten, for the same reason Capstone 6 left its controller bit-shift simplified — writing out the full interleaved-address computation inline would bury the capstone's actual point (three platforms, one unmodified movement-and-collision core) under platform-specific busywork that the hi-res session above already covers in full. A complete build needs both filled in before it actually draws anything.

**Practice**

- Fill in `_build_row_table` using the formula from the hi-res session, and `_frame`'s plotting step using a table lookup against the row this capstone's shape occupies.
- Add a second key (say, `'A'` for left) with negative velocity, reusing the signed-velocity handling flagged as a pitfall back in Module 7.

## Progress check

1. What makes a "soft switch" a different I/O model from both the C64's register-write model and the NES's PPU-register model?
2. Why does `$C000`'s low 7 bits keep reporting the last key pressed even after `$C010` clears the strobe, and why is that correct rather than a bug?
3. What's the actual formula relating a hi-res screen row to its memory address, and what wrong assumption does it correct?
4. Why do real Apple II programs typically precompute a 192-entry row-address table instead of calculating the formula live?
5. Why must collision math run against logical row/column positions rather than raw hi-res addresses?
6. Name the one routine, verified all the way back in Module 7, that has now been reused unchanged across all three platform ports — what property of that routine made that possible?
7. What's the exact one-line difference between Module 10's speaker toggle and Module 4's original `_make_tone`?

### Answers

1. A soft switch's effect comes from the *act of accessing* the address at all — sometimes any read or write, regardless of the value transferred — rather than from a specific value being written into a register the way the C64's VIC-II/SID registers or the NES's PPU/APU registers work.
2. Because `$C000`'s character bits and `$C010`'s strobe-clear are two separate pieces of state — clearing the "is this a new key" flag doesn't erase the record of what the last key actually was. It's correct because a program often needs to know both "what was the last key" and "has a new one arrived since I last checked" as independent facts.
3. `row_base = $2000 + a*$28 + b*$80 + c*$400` where `a = row/64`, `b = (row mod 64)/8`, `c = (row mod 64) mod 8` — it corrects the naive assumption (true on nearly every other platform) that row N sits at `base + N*40`, a purely linear framebuffer.
4. Because the interleaving makes computing the formula for every pixel plotted during real-time gameplay both slower and more error-prone than looking up an address already computed once at startup.
5. Because the interleaved address formula means logically adjacent rows can have numerically distant addresses (row 7 at `$3C00`, row 8 at `$2080`) — comparing addresses directly would produce a collision test with no relationship to actual on-screen proximity.
6. `_test_collide8` (and `_step_position` alongside it) — both only ever read and write plain memory bytes, with no dependency on any platform's hardware registers, which is exactly what let them carry forward unchanged from Module 7 through the C64, NES, and Apple II capstones.
7. The toggle target changed from a VIA `ORA` register (`LDA ORA` / `EOR #1` / `STA ORA`) to a single soft-switch access (`LDA SPKR`) — the delay loop and the toggle-count logic around it are byte-for-byte identical.
