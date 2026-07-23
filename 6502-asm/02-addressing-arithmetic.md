# Module 2 — Addressing Modes & Arithmetic

Every way the 6502 lets you say "this value" or "the value at this location," plus what actually happens in the ALU when you add, subtract, compare, and shift. Every example below was assembled and run under `sim65`, with results read back by name (Module 1's technique) — this is pure CPU-internal logic, none of it depends on a real hardware memory map, so it's all in this guide's "executed and checked" verification tier. Feeds Capstones 1–2.

## The addressing-mode tour

**You'll be able to:** read any 6502 instruction and know exactly which byte(s) it touches, without guessing.

**Concept**

The same instruction (`LDA`, say) can get its value from many places. The addressing mode is *how* the operand is found:

| Mode | Syntax | Means |
|---|---|---|
| Immediate | `LDA #$05` | The literal value `$05` |
| Zero page | `LDA $10` | The byte at address `$10` |
| Zero page,X / ,Y | `LDA $10,X` | The byte at `$10 + X` (wraps within zero page — never carries into page 1) |
| Absolute | `LDA $0300` | The byte at address `$0300` |
| Absolute,X / ,Y | `LDA $0300,X` | The byte at `$0300 + X` (can cross into the next page, costs an extra cycle when it does) |
| Indexed indirect | `LDA (ptrtab,X)` | Treat `ptrtab+X` as the address of a **2-byte pointer**, then load from *that* address — "pick which pointer from a table, then follow it" |
| Indirect indexed | `LDA (ptr),Y` | Treat `ptr` as a 2-byte pointer, follow it, then add `Y` to the result — "follow one pointer, then offset into what it points to" |
| Relative | `BNE label` | A signed offset from the *next* instruction — only branches use this |
| Implied / Accumulator | `TAX` / `ASL A` | No operand, or operates directly on `A` |

The two indirect modes are the ones people mix up, so hold onto the distinction with the comma's position: `(ptrtab,X)` — the index is *inside* the parens, so it picks a pointer first. `(ptr),Y` — the index is *outside*, so it offsets the result of following one pointer.

**Example**

```asm
.segment "ZEROPAGE"
ptrtab: .res 4      ; two 2-byte pointers back to back
ptr:    .res 2       ; one 2-byte pointer

.segment "RODATA"
tableA: .byte 111
tableB: .byte 222     ; placed immediately after tableA

.segment "CODE"
; --- (zp,X): X selects which pointer, then we follow it ---
    LDA #<tableA
    STA ptrtab+2       ; pointer #1 -> tableA
    LDA #>tableA
    STA ptrtab+3
    LDX #2
    LDA (ptrtab,X)      ; follows the pointer at ptrtab+2 -> reads tableA -> A = 111

; --- (zp),Y: one pointer, then offset by Y ---
    LDA #<tableA
    STA ptr
    LDA #>tableA
    STA ptr+1
    LDY #1
    LDA (ptr),Y          ; follow ptr (-> tableA), then +1 -> reads tableB -> A = 222
```

`#<label` and `#>label` extract the low and high byte of a 16-bit address as an immediate value — the standard way to split a pointer into the two bytes you need to store it.

> **Pitfall:** the `(ptr),Y` example above only reads `tableB` because `tableA` and `tableB` were declared back-to-back with nothing between them — the assembler placed them adjacently because nothing told it not to. Relying on declaration-order adjacency like this is a real, common technique (it's how you build lookup tables), but it's also fragile if you later insert something between the two declarations. Prefer an explicit table (`.byte 111, 222`) when the adjacency actually matters, so it's declared as one thing, not two things that happen to be next to each other.

**Practice**

- Write a loop using zero-page,X indexing to copy 5 bytes from one array to another (shown fully in the example below).
- Predict, then verify, what `LDA $10,X` does when `X = $F8` and the byte at `$10` is zero page — confirm it wraps within zero page rather than reading into page 1.
- Build a 3-entry pointer table and use `(ptrtab,X)` to dispatch to one of three different single bytes based on `X`.

## Arithmetic and the carry flag

**You'll be able to:** chain `ADC`/`SBC` correctly; explain what carry means after each; predict 8-bit wraparound.

**Concept**

`ADC` computes `A = A + M + C` — the carry flag is *added in*, which is why you `CLC` before the first `ADC` in a sequence (otherwise you're silently adding a stray 1). After the add, carry is set if the true result needed a 9th bit — i.e., unsigned overflow.

`SBC` computes `A = A - M - (1 - C)` — carry acts as "NOT borrow." `SEC` before the first `SBC` in a sequence means "no incoming borrow," giving you a clean subtraction. After the subtract, carry is set if *no* borrow was needed (i.e., `A >= M` before the operation, treating both as unsigned).

**Example**

```asm
    SEC
    LDA #10
    SBC #3            ; A = 10 - 3 - 0 = 7 (carry was set: no incoming borrow)
                        ; -> A = 7, carry ends up set (10 >= 3)

    CLC
    LDA #10
    SBC #3             ; A = 10 - 3 - 1 = 6 (carry was clear: pretends there's a borrow already)

    CLC
    LDA #200
    ADC #100            ; 200+100 = 300, wraps to 44 in A, carry ends up SET (unsigned overflow)
```

> **Pitfall:** forgetting `CLC` before a fresh `ADC`, or `SEC` before a fresh `SBC`, doesn't error — it silently folds in whatever carry was left over from the last unrelated flag-affecting instruction. This is the single most common source of "my math is off by exactly one" bugs in 6502 code.
>
> **Pitfall:** `STA`, `LDA`, `LDX`, `LDY`, `TAX`/`TXA`/etc. do **not** affect the carry flag (loads/transfers affect N and Z, not C). Only arithmetic, shifts/rotates, and compares touch carry. Verified directly: storing a result with `STA` between an overflowing `ADC` and a `BCC`/`BCS` check does not clear or change the carry that the `ADC` set.

**Practice**

- Chain three `ADC`s to add three numbers, with `CLC` only once at the start — confirm it's correct because carry only needs clearing before the *first* add in a chain (each subsequent `ADC` legitimately wants to consume the carry the previous one produced, for multi-byte addition — you'll use this directly in Module 7).
- Write a routine that subtracts two 16-bit numbers (low byte then high byte, each `SBC`, only the first one preceded by `SEC`).
- Predict the carry state after `LDA #0; SBC #1` with `SEC` first, then verify.

## Decimal (BCD) mode

**You'll be able to:** turn decimal mode on/off; explain what changes; know when *not* to use it.

**Concept**

`SED` sets the D flag, putting `ADC`/`SBC` into **packed BCD** mode: each byte is treated as two decimal digits (0–9 per nibble), and the ALU adjusts its result so `$09 + $01` gives `$10` (the byte value that *displays* as "10"), not `$0A` (which would be the binary sum). `CLD` returns to normal binary arithmetic. This is genuinely useful for score counters and other displayed decimal values, since converting binary to decimal digits for display is more work than just doing the arithmetic in BCD to begin with.

**Example**

```asm
    SED
    CLC
    LDA #$09
    ADC #$01
    ; A = $10  (BCD "10") -- NOT $0A, which is what plain binary addition would give

    CLC
    LDA #$45
    ADC #$38
    ; A = $83  (BCD 45 + 38 = decimal 83)

    CLD               ; back to normal — always CLD when you're done, or every later ADC/SBC breaks
```

> **Pitfall, flagged now for Module 9:** this behavior is confirmed correct on the plain NMOS 6502 this guide's simulator models. The NES's 2A03 chip has decimal mode **physically disabled** — `SED` sets the flag bit, but `ADC`/`SBC` on real NES hardware just do binary arithmetic regardless. Code verified here will misbehave, silently, if you ship it unmodified as a NES score counter.

**Practice**

- Build a two-digit BCD counter that increments by 1 each call, wrapping `99 -> 00`.
- Predict what `SED; CLC; LDA #$99; ADC #$01` produces (careful: this isn't simply "100," since a byte can't hold three BCD digits) and verify.

## Logic, shifts, and rotates

**You'll be able to:** use `AND`/`ORA`/`EOR` for bit manipulation; explain the difference between a shift and a rotate.

**Concept**

`AND`, `ORA`, `EOR` are bitwise and/or/xor against `A`. `ASL`/`LSR` shift left/right, dropping one end's bit into carry and filling the other end with 0. `ROL`/`ROR` do the same shift, but fill the vacated bit *from* carry instead of with 0 — which is how you chain a shift across multiple bytes (rotate the low byte, then rotate the high byte, and the bit that fell off the low byte flows into the high byte via carry).

**Example**

```asm
    LDA #%00000011
    LSR A              ; A = %00000001, carry gets the bit that fell off (1)

    SEC                 ; carry = 1 going in
    LDA #%01000000
    ROL A                ; A = %10000001 -- old bit7 (0) went to carry-out, carry-in (1) filled bit0
```

**Practice**

- Use `AND #%00001111` to mask off the low nibble of a byte, and `AND #%11110000` for the high nibble.
- Chain `ROL` across two zero-page bytes to shift a 16-bit value left by one bit.
- Use `EOR #$FF` and explain in one sentence why that's a one's-complement (bitwise NOT).

## Compare and branch

**You'll be able to:** use `CMP`/`CPX`/`CPY` correctly; pick the right branch after a compare.

**Concept**

`CMP`/`CPX`/`CPY` perform `A - M` (or `X - M`, `Y - M`) purely to set flags — they never change the register. After a compare: `BEQ` branches if equal, `BNE` if not, `BCS` if the register was `>=` the value (unsigned), `BCC` if it was `<` the value (unsigned).

**Example**

```asm
    LDA #10
    CMP #10
    BEQ equal_case       ; branches: 10 == 10

    LDA #5
    CMP #10
    BCC less_case         ; branches: 5 < 10 (unsigned)
```

> **Pitfall:** `CMP`/branch comparisons are unsigned by default. For signed comparisons you need `N`/`V` flag combinations (`BMI`/`BPL` plus overflow checking), which is a real but rarer need — flagged here so you know to look it up rather than assume `BCC` does what you'd expect on negative numbers.

**Practice**

- Write a loop counting from 0 to 4 using `CPX #5` / `BNE`, storing values into a 5-byte zero-page array (shown fully above in the addressing-mode example).
- Write a three-way branch (less/equal/greater) using one `CMP` and two branches.

## Progress check

1. What's the difference between `LDA (ptr,X)` and `LDA (ptr),Y`?
2. Why must you `CLC` before the first `ADC` in a chain, but not before the second and third?
3. What does carry mean immediately after a `SBC`?
4. Why does `SED; LDA #$09; ADC #$01` give `$10` and not `$0A`?
5. Why will a BCD routine that works correctly in this guide's simulator not work on a real NES?
6. What's the difference between `ASL` and `ROL`?
7. Does `CMP` change the accumulator?

### Answers

1. `(ptr,X)` — indexed indirect: `X` selects which of several 2-byte pointers (starting at `ptr`) to follow. `(ptr),Y` — indirect indexed: there's exactly one pointer at `ptr`; `Y` is added to the address it points to *after* following it.
2. Each `ADC` after the first legitimately wants to consume the carry the previous `ADC` produced — that's how multi-byte addition works (Module 7). Clearing carry mid-chain would silently drop a carried bit.
3. Carry is set if no borrow was needed (the value being subtracted was `<=` the accumulator, unsigned); clear if a borrow occurred.
4. Decimal mode makes the ALU treat each nibble as a decimal digit and carry between nibbles like decimal addition, not binary — `9 + 1 = 10` in decimal terms, represented as the byte `$10`.
5. The NES's 2A03 chip has decimal mode disabled in hardware — `SED` sets the flag bit but `ADC`/`SBC` still do plain binary arithmetic on real NES hardware.
6. `ASL` shifts and fills the vacated bit with `0`. `ROL` shifts and fills the vacated bit with whatever was in carry *before* the instruction — which is what lets you chain a shift across multiple bytes.
7. No — compares only set flags (`N`, `Z`, `C`); the register being compared is never modified.
