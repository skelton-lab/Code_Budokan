# Module 9 — Porting to the NES

The second platform port, and the one where "same CPU, different chips" stops being quite true — the NES's CPU has one genuine instruction-set difference from the 6502 this guide has used through Module 8, and its graphics chip demands strict timing discipline that has no equivalent on the C64. Same verification tier as Module 8: everything here is documented, not executed — `sim65` has no PPU, APU, or controller shift register, and this guide has no scriptable NES emulator available locally (FCEUX/Mesen are real, GUI-based, and useful for manually loading a `.nes` ROM and watching it run, the same role VICE played for Module 8, but not part of this guide's automated loop). Feeds Capstone 6.

## The 2A03, the memory map, and mappers

**You'll be able to:** explain what's actually different about the NES's CPU, and why cartridges need "mappers" at all.

**Concept**

The NES's CPU is the Ricoh 2A03 — a 6502 core, plus the APU (Module 9's sound session) built onto the same die, with **one deliberate instruction-set change**: the decimal (`D`) flag and `SED`/`CLD` still exist and can be set, but Ricoh physically left out the BCD circuitry, so `ADC`/`SBC` **always operate in pure binary mode regardless of `D`**, unlike every other guide platform. Code that assumes `SED` changes arithmetic behavior (as it genuinely would on a real MOS 6502) silently gets ordinary binary math instead — no error, no warning.

The CPU-visible memory map:

| Range | Contents |
|---|---|
| `$0000`–`$07FF` | 2KB internal RAM (mirrored three more times up to `$1FFF` — the top 3 address bits of this region are ignored by the hardware) |
| `$2000`–`$2007` | PPU registers (mirrored every 8 bytes up to `$3FFF`) |
| `$4000`–`$4017` | APU and I/O registers (sound channels, controller ports) |
| `$4020`–`$FFFF` | Cartridge space — PRG-ROM, and on many cartridges, mapper registers and/or battery-backed save RAM |

Unlike the C64 (one fixed 64KB layout the PLA switches between three configurations of) or the bare-metal boards from Modules 1–7, an NES cartridge can carry *more* PRG-ROM and CHR-ROM (the pattern-table graphics data, covered in the next session) than the CPU's `$8000`–`$FFFF` window or the PPU's 8KB pattern-table window can address directly. A **mapper** — bank-switching hardware built into the cartridge itself, not the console — swaps different banks of ROM into that fixed window in response to writes to specific cartridge addresses. **Mapper 0 (NROM)**, this module's target, has no bank switching at all: a fixed 16KB or 32KB of PRG-ROM sits permanently at `$8000`–`$FFFF`, which is exactly the simplicity this guide's capstone needs and the reason NROM is the conventional first mapper to target.

**Example**

```asm
; NROM has no bank-switch registers to configure -- PRG-ROM is just permanently
; mapped at $8000-$FFFF. The vectors at the top of that space work exactly like
; every other 6502 platform this guide has covered (Module 5).
.segment "VECTORS"
    .word nmi_handler       ; $FFFA -- PPU fires this every vblank; see the PPU session
    .word reset
    .word irq_handler        ; $FFFE -- unused by this capstone; APU frame-IRQ is disabled instead
```

> **Pitfall:** `SED`/`CLD` compiling and assembling without error gives no signal that decimal mode is a no-op on this specific chip — a routine ported from, say, the C64 or a real breadboard 6502 that relies on `SED` for BCD score-counter arithmetic (a common 8-bit-game pattern) will assemble cleanly for NES and simply produce wrong totals, with nothing in the toolchain flagging the mismatch.

**Practice**

- Explain why NROM (mapper 0) needs zero extra registers or write-triggered bank swaps, in terms of how much PRG-ROM a simple game actually needs versus the CPU's addressable window.
- Look up one other common mapper (e.g. MMC1 or UNROM) and note, without needing to use it, what problem it solves that NROM can't.

## The iNES header and getting a ROM running

**You'll be able to:** produce a loadable `.nes` file and explain what each header byte controls.

**Concept**

An NES ROM file uses the **iNES format**: a fixed 16-byte header, followed by the PRG-ROM data, followed by the CHR-ROM data (if the cartridge has any — some games generate graphics data at runtime into CHR-*RAM* instead, out of scope here).

| Byte(s) | Meaning |
|---|---|
| 0–3 | Magic constant `"NES"` followed by `$1A` — identifies the file as iNES |
| 4 | PRG-ROM size, in 16KB units |
| 5 | CHR-ROM size, in 8KB units (`0` means CHR-RAM instead) |
| 6 | Flags: mirroring type (bit 0), battery-backed RAM present (bit 1), trainer present (bit 2), mapper number's low nibble (bits 4–7) |
| 7 | Flags: mapper number's high nibble (bits 4–7), plus format-version bits |

cc65's `nes` target — the second of the two "official" targets this guide's toolchain section named alongside `c64` — generates this header automatically from linker config settings; `cl65 -t nes -o game.nes *.s` produces a loadable `.nes` file with no hand-assembled header bytes required, the same convenience the `c64` target provided for the BASIC stub in Module 8.

**Example**

```asm
; cc65's nes.cfg linker config emits the iNES header and places these segments
; correctly; the assembly source itself just needs the right segment names.
.segment "HEADER"           ; cc65 fills this from linker-config settings (mapper 0, PRG/CHR sizes)
.segment "CODE"
.segment "VECTORS"
.segment "CHARS"              ; CHR-ROM pattern data
```

> **Pitfall:** getting the PRG-ROM size byte (header byte 4) wrong relative to how much code and data a program actually assembles to isn't caught at assembly time — it's caught, if at all, by an emulator either refusing to load the file or loading it with garbage past the real code, which is a much later and less obvious failure point than a linker error would be.

**Practice**

- Compute the header byte 4 value for a game with exactly 16KB of PRG-ROM, and separately for one with 32KB.
- Explain why CHR-ROM size `0` (CHR-RAM) wouldn't work for a game whose graphics data is fixed, hand-drawn tile art rather than something generated at runtime.

## The PPU and OAM hardware sprites

**You'll be able to:** enable rendering, and place a hardware sprite via OAM.

**Concept**

The Picture Processing Unit (PPU) is a separate chip the CPU talks to only through eight memory-mapped registers at `$2000`–`$2007` (mirrored every 8 bytes through `$3FFF` — a real trap if code assumes only the base addresses are valid, since `$2008`, `$2010`, etc. all alias right back to `$2000`–`$2007`). Sprites live in a separate 256-byte memory the PPU alone owns, **OAM** (Object Attribute Memory) — 64 sprites × 4 bytes each: Y position, tile index, attributes (palette, priority, H/V flip), X position, in that byte order.

| Register | Address | Purpose |
|---|---|---|
| `PPUCTRL` | `$2000` | NMI-on-vblank enable (bit 7), sprite pattern table select, VRAM address auto-increment |
| `PPUMASK` | `$2001` | Rendering enable — bit 3 shows background, bit 4 shows sprites; both must be set or nothing draws |
| `PPUSTATUS` | `$2002` | Bit 7 = vblank flag; **reading this register clears the flag and resets the internal write-toggle used by `$2005`/`$2006`** |
| `OAMADDR`/`OAMDATA` | `$2003`/`$2004` | Direct byte-at-a-time OAM access (rarely used per-frame; see `OAMDMA` below) |
| `OAMDMA` | `$4014` | Writing a page number here triggers a hardware DMA that copies all 256 bytes of that CPU RAM page into OAM in one burst — the standard way to update all sprites every frame |

**Example**

```asm
PPUCTRL  = $2000
PPUMASK  = $2001
PPUSTATUS = $2002
OAMDMA   = $4014

; one-time setup: enable NMI-on-vblank and turn on sprite + background rendering
_ppu_init:
    LDA PPUSTATUS         ; dummy read -- clears any stale vblank flag, resets the write toggle
    LDA #%10000000
    STA PPUCTRL              ; NMI on vblank
    LDA #%00011000
    STA PPUMASK                ; show background + sprites
    RTS

; called from the vblank NMI handler, once per frame: push the whole OAM shadow page via DMA
oam_shadow: .res 256, 0        ; a CPU-RAM page mirroring OAM's layout, built up during the frame
_flush_oam:
    LDA #>oam_shadow             ; high byte of the shadow page's address = the page number OAMDMA wants
    STA OAMDMA
    RTS
```

Documented PPU behavior — the register layout, the DMA mechanism, and the write-toggle side effect on `$2002` are all stable, extensively cross-corroborated facts about how the PPU behaves, not run here, since `sim65`'s hosted environment has no PPU to render anything or fire a real vblank NMI against.

> **Pitfall — a real, well-known NES trap:** a sprite's stored Y byte in OAM is **the sprite's top edge minus one scanline** — a sprite meant to appear at screen row 50 needs `49` written to its OAM Y byte, a genuinely documented hardware quirk with no software workaround except "always subtract 1 when writing OAM Y," easy to forget and easy to mistake for an off-by-one bug in your own code instead of the platform's actual behavior.
>
> **Pitfall — PPU register writes outside vblank:** writing to `$2006`/`$2007` (VRAM address/data — not shown above, needed once graphics beyond sprites are involved) while the PPU is actively rendering corrupts the picture, because the PPU is using its internal address latches for rendering at that exact moment. The standard discipline is: do all PPU register writes inside the vblank NMI handler, where the PPU has finished the frame and is idle until the next one starts.

**Practice**

- Write the `_flush_oam` call site: an NMI handler that calls `_flush_oam` first thing, before doing anything else that frame.
- Work out the OAM byte offset for sprite index 5's X position, given the 4-bytes-per-sprite layout (hint: `sprite_index * 4 + 3`).

## Software collision detection

**You'll be able to:** detect sprite overlap on a platform with no hardware collision registers at all.

**Concept**

This is the direct opposite of Module 8's headline point: the NES's PPU has **no sprite-sprite or sprite-background collision hardware** (its one collision-adjacent feature, "sprite 0 hit," only fires for a single specific sprite crossing a specific rendering condition and isn't a general-purpose collision system). Every NES game with collision — which is nearly all of them — computes it in software, which means Module 7's AABB test, built and verified back when this guide had no hardware to target at all, is exactly what this platform needs, completely unchanged.

**Example**

```asm
; identical to Module 7's _test_collide8 -- no NES-specific change needed at all
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

Verification status carries over directly from Module 7: this routine was assembled and run under `sim65` with results checked there (four cases, all correct) — nothing about targeting NES changes the CPU-side logic, so nothing about it needs re-verifying here.

> **Pitfall:** because OAM Y coordinates are stored minus one (previous session's pitfall), a collision test that reads sprite positions straight out of the OAM shadow buffer is comparing already-offset values — consistent as long as *both* sprites' positions come from the same OAM-Y convention, but a bug if one operand comes from OAM and the other from an un-adjusted game-logic position byte kept separately.

**Practice**

- Wire `_test_collide8` to read both operands directly from two entities' `oam_shadow` Y bytes, and confirm the offset-by-one convention doesn't affect correctness as long as it's applied consistently on both sides.
- Extend to a two-axis check exactly as Module 7's practice problems described, reusing the x-axis and y-axis calls against OAM X and (offset) Y bytes respectively.

## APU sound

**You'll be able to:** play a tone on a pulse channel, and understand why the channel gets re-triggered by a specific register write.

**Concept**

The 2A03's built-in APU has five channels — two pulse (square-wave) channels, one triangle, one noise, and one delta-modulation (DMC, for sample playback) — each with its own register block starting at `$4000`. `$4015` is the master enable/status register: writing it turns individual channels on or off; reading it reports which channels' length counters are still active. This module only needs Pulse 1.

| Register | Address | Purpose |
|---|---|---|
| `SQ1_VOL` | `$4000` | Duty cycle (bits 6–7), volume/envelope (bits 0–3), constant-volume flag (bit 4) |
| `SQ1_LO`/`SQ1_HI` | `$4002`/`$4003` | 11-bit timer period (pitch); the high byte's top 5 bits also load the length counter |
| `SND_CHN` | `$4015` | Bit 0 = enable Pulse 1 |

**Example**

```asm
SQ1_VOL = $4000
SQ1_LO  = $4002
SQ1_HI  = $4003
SND_CHN = $4015

_play_beep:
    LDA #%00000001
    STA SND_CHN            ; enable pulse channel 1
    LDA #%10111111
    STA SQ1_VOL              ; duty 50%, constant volume, volume = 15
    LDA #$50
    STA SQ1_LO
    LDA #%00001000
    STA SQ1_HI                ; timer high bits + length counter load -- writing this RESETS phase
    RTS
```

Documented APU behavior, cross-checked against established public documentation, not executed — no APU exists in `sim65`'s hosted environment to synthesize or measure a waveform against.

> **Pitfall:** writing `SQ1_HI` doesn't just set the top bits of the pitch timer — it **restarts the pulse generator's phase and reloads the envelope**, the NES's version of the exact "waveform and gate must land together" constraint Module 8's SID session flagged. Writing `SQ1_LO` alone to change pitch mid-note, without touching `SQ1_HI`, is the way to bend a pitch smoothly; writing `SQ1_HI` for every small pitch tweak instead audibly re-clicks the note on every change.

**Practice**

- Write a version using Pulse 2 (`$4004`/`$4006`/`$4007`, the mirror-image register block one channel over) instead of Pulse 1.
- Explain, from the register table, why changing only `SQ1_LO` mid-note is the right technique for a sliding pitch effect and changing `SQ1_HI` is not.

## Controller reading via the $4016 shift register

**You'll be able to:** read the state of all 8 buttons on a standard controller.

**Concept**

Unlike the C64's parallel-bit joystick ports (Module 8), NES controllers report through a **serial shift register**: writing `$4016` toggles a "strobe" line that latches the controller's current button states, and then eight successive reads of `$4016` (controller 1) or `$4017` (controller 2) each return the next button's state in bit 0, in a fixed order — `A, B, Select, Start, Up, Down, Left, Right`.

**Example**

```asm
JOYPAD1 = $4016

_read_controller1:               ; fills button_state, one bit per button, in the fixed order above
    LDA #1
    STA JOYPAD1          ; strobe high...
    LDA #0
    STA JOYPAD1            ; ...then low -- latches the current button states

    LDX #8
read_loop:
    LDA JOYPAD1
    AND #1                  ; isolate the button bit -- other bits are open bus, must be masked
    STA button_state        ; caller shifts this into a result byte per iteration, one bit at a time
    LSR button_state
    DEX
    BNE read_loop
    RTS
```

Documented behavior — the strobe/latch sequence and fixed button order are a stable, well-established public standard (every NES game and every emulator agrees on this order), not executed, since `sim65` has no controller shift register to strobe.

> **Pitfall:** `$4016`'s dual purpose — a *write* strobes the controllers, but a *read* returns controller 1's next serial bit, and `$4017` is simultaneously the APU's frame-counter-mode register on write and controller 2's read port — mirrors exactly the shared-register trap Module 8 flagged for CIA1's dual keyboard/joystick role. Writing to `$4017` intending to affect a controller does nothing to any controller at all; it reconfigures the APU's frame IRQ instead.

**Practice**

- Trace through the 8-iteration read loop and write down which physical button corresponds to bit 0 versus bit 7 of the final assembled `button_state` byte.
- Explain why the strobe sequence (`1` then `0`) has to happen *before* the eight reads, not once per read.

## Capstone 6 — Move a hardware sprite, software collision, APU cue

**Proves:** screen memory (PPU), controller input, sound, **software** collision (Modules 4, 7, 9).

The direct structural mirror of Capstone 5, with every hardware-specific substitution point swapped: OAM instead of VIC-II sprite registers, `_test_collide8` (verified, unchanged since Module 7) instead of `SPSPCL`, the APU pulse channel instead of SID, and the `$4016` shift register instead of CIA1.

```asm
PPUCTRL  = $2000
PPUMASK  = $2001
PPUSTATUS = $2002
OAMDMA   = $4014
JOYPAD1  = $4016
SQ1_VOL  = $4000
SQ1_LO   = $4002
SQ1_HI   = $4003
SND_CHN  = $4015

.segment "HEADER"
.segment "CODE"

oam_shadow: .res 256, 0     ; sprite 0's bytes: oam_shadow+0..3 (Y, tile, attr, X)
pos_hi: .byte 100
pos_lo: .byte 0
vel_hi: .byte 0
vel_lo: .byte 0
val_a:  .byte 0
val_b:  .byte 0
hit_result: .byte 0

_setup:
    LDA PPUSTATUS
    LDA #%10000000
    STA PPUCTRL
    LDA #%00011000
    STA PPUMASK
    LDA #%00000001
    STA SND_CHN
    LDA #49                    ; Y = 50 on screen -> OAM stores 49 (Module 9's Y-minus-1 quirk)
    STA oam_shadow
    LDA #1
    STA oam_shadow+1              ; tile index 1
    LDA #0
    STA oam_shadow+2                ; no flip, palette 0, front priority
    RTS

; called from the vblank NMI handler
_frame:
    LDA #1
    STA JOYPAD1
    LDA #0
    STA JOYPAD1

    LDX #8
    LDA #0
read_loop:
    PHA
    LDA JOYPAD1
    AND #1
    STA vel_lo              ; last read (bit 7 = Right, per Module 9's fixed button order) wins
    PLA
    DEX
    BNE read_loop

    CLC
    LDA pos_lo
    ADC vel_lo
    STA pos_lo
    LDA pos_hi
    ADC vel_hi
    STA pos_hi
    LDA pos_hi
    STA oam_shadow+3           ; X position -> OAM

    LDA oam_shadow+3            ; sprite's X vs. a fixed obstacle at val_b
    STA val_a
    LDA #150
    STA val_b
    JSR _test_collide8
    LDA hit_result
    BEQ no_hit
    LDA #%10111111
    STA SQ1_VOL
    LDA #$50
    STA SQ1_LO
    LDA #%00001000
    STA SQ1_HI                  ; retrigger the beep
no_hit:
    LDA #>oam_shadow
    STA OAMDMA                    ; push this frame's sprite state to the PPU
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
```

Same split as Capstone 5: `_step_position` and `_test_collide8` carry Module 7's actual `sim65`-verified status forward unchanged (this is precisely why Module 7 built them hardware-agnostic in the first place); the PPU, APU, and controller-register calls are documented, assembled-correctly-against-the-spec, not executed. Loading the `.nes` output into FCEUX or Mesen and confirming the sprite visibly moves right and beeps at the obstacle is, as with Module 8, a manual check this guide can point to but not automate.

> **Pitfall:** the read loop above is simplified to keep only the last bit read (Right, per the fixed A/B/Select/Start/Up/Down/Left/Right order) — a real capstone build needs to shift all 8 bits into a proper `button_state` byte (this module's controller-reading practice problem) and test the specific bit for Right rather than whatever the loop happens to leave behind, which this listing deliberately leaves as an exercise rather than obscuring the core DMA/collision/sound structure with a full bit-shift routine repeated from the session above.

**Practice**

- Replace the simplified read loop with the full 8-bit shift-into-`button_state` version from this module's controller session, and branch on the correct bit for Right.
- Add a second stationary sprite as the obstacle (its own 4 OAM bytes), and draw it via the same `oam_shadow`/`OAMDMA` mechanism as sprite 0.

## Progress check

1. What's the one 6502 instruction-set behavior that's genuinely different on the NES's 2A03 versus a real 6502, and why doesn't the assembler catch code that assumes otherwise?
2. Why does NROM (mapper 0) need no bank-switching registers at all, while other mappers do?
3. What does reading `PPUSTATUS` ($2002) do, beyond just returning the vblank bit?
4. Why must PPU register writes touching `$2006`/`$2007` happen during vblank rather than any time convenient?
5. What is the documented OAM Y-coordinate quirk, and why can't it be "fixed" in software?
6. Why does this module's collision code need zero changes from Module 7, while the C64 module's collision session used completely different registers?
7. Why does writing `SQ1_HI` re-trigger a pulse channel's phase, and what's the practical consequence for a sliding-pitch effect?
8. Why does `$4017` behave completely differently depending on whether it's read or written?

### Answers

1. Decimal (BCD) mode: `SED` still sets the `D` flag, but the 2A03 has no BCD arithmetic circuitry, so `ADC`/`SBC` always run in binary regardless of `D`. The assembler only checks instruction syntax, not what a specific chip variant's silicon actually does with a valid instruction, so no error or warning is possible at assembly time.
2. Because NROM provides a fixed 16KB or 32KB of PRG-ROM permanently mapped at `$8000`–`$FFFF` — for a game small enough to fit in that fixed window, there's nothing to switch; bank-switching mappers exist specifically for games whose ROM is larger than that fixed window can address at once.
3. It clears the vblank flag (bit 7) and resets the internal write-toggle that `$2005`/`$2006` share for their two-byte-write protocol — both are side effects of the read, not just the returned value.
4. Because the PPU is actively using its internal VRAM address latches to render the picture outside of vblank; writing to them at that moment corrupts whatever's currently being drawn. Vblank is the one window per frame where the PPU is idle and safe to reconfigure.
5. A sprite's OAM Y byte holds its actual top-edge row minus one — a documented, fixed hardware behavior of the PPU's sprite-evaluation logic, not a bug; there's no register or mode that changes it, so every write to a sprite's Y byte must account for the offset by convention, in software, every time.
6. Because Module 7's collision test only ever reads and writes plain memory bytes — it never depended on any hardware register to begin with, so porting it to a new platform requires no changes at all. The NES has no hardware collision registers to substitute in, unlike the C64's `SPSPCL`/`SPBGCL`, which is exactly why Module 8's and Module 9's capstones differ at that one specific point and nowhere else.
7. `SQ1_HI`'s write both loads the timer's high bits and reloads the length counter, and as a documented side effect resets the pulse generator's phase and envelope. For a sliding pitch, that means only `SQ1_LO` should be written on each pitch update; writing `SQ1_HI` on every tweak re-clicks the note instead of smoothly bending its pitch.
8. `$4016`/`$4017` are two of the platform's dual-purpose registers: a write to `$4017` reconfigures the APU's frame-counter/IRQ mode, while a read from `$4017` returns controller 2's next serial bit — read and write aren't two views of the same state, they're two unrelated pieces of hardware sharing one address.
