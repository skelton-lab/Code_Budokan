# Module 7 — Game Math on an 8-bit CPU

Fixed-point position/velocity, gravity as constant acceleration, a real collision test, and how to store several game objects without anything resembling `malloc`. Pure computation, no hardware dependency — every example here is in this guide's fully-executed tier. This module is what makes Capstones 5–7 (Modules 8–10) actually be *games* rather than "one sprite sits on screen."

## Fixed-point position and velocity

**You'll be able to:** move an object smoothly using only integer arithmetic.

**Concept**

The 6502 has no floating-point hardware, and software floating point is slow and complicated for something as simple as "move a sprite a fraction of a pixel per frame." The standard 8-bit-game answer is **fixed-point**: represent a position as two bytes — a high byte (the actual on-screen pixel position) and a low byte (a fractional "sub-pixel" accumulator, treated as 256ths of a pixel). Velocity is represented the same way. Each frame, you add velocity to position as a 16-bit add — and because `ADC` naturally carries from the low byte into the high byte, "did we cross into the next whole pixel this frame" falls out of the addition for free.

**Example**

```asm
; pos_hi:pos_lo += vel_hi:vel_lo  (one frame's movement)
_step_position:
    CLC
    LDA pos_lo
    ADC vel_lo
    STA pos_lo
    LDA pos_hi
    ADC vel_hi          ; the carry from the low-byte add flows in automatically
    STA pos_hi
    RTS
```

Verified: starting at `pos = (5, 200)` with `vel = (0, 100)`, one step correctly produces `pos = (6, 44)` — `200 + 100 = 300` wraps to `44` in the low byte and carries `1` into the high byte, moving the object one whole pixel while preserving the leftover fraction. Run this every frame with a small `vel_lo` (say `10`–`50`) and the object visibly creeps forward at sub-pixel-per-frame speed instead of jumping in whole-pixel steps — this is what makes 8-bit game movement look smooth instead of jittery.

> **Pitfall:** this example only handles positive velocity moving in one direction. A real game needs to move backward too — either by treating velocity as signed (two's complement) and handling the borrow case symmetrically with `SBC`, or by keeping a separate "direction" flag and always adding a positive magnitude. Pick one convention and apply it consistently across every entity, or you'll end up with two subtly different movement codepaths to debug.

**Practice**

- Add gravity: a small constant added to `vel_hi:vel_lo` every frame (same 16-bit-add pattern, just accumulating into velocity instead of position) — verify that velocity grows every frame and, fed into `_step_position`, the object accelerates.
- Add a simple "hits the ground" check: once `pos_hi` reaches some floor value, zero out `vel_lo`/`vel_hi` instead of continuing to fall through it.

## A real collision test

**You'll be able to:** detect whether two same-sized objects overlap, using only comparisons and branches.

**Concept**

The general collision test for two rectangles is "do their spans overlap on both axes" — four comparisons combined with a logical AND. On a 6502 there's no short-circuit `AND` between conditions; you write it as a chain of branches, each one bailing out to "no collision" the moment a condition fails. For two objects of the **same known size** (a very common simplification for a first game — most simple 8-bit games use fixed-size sprites), the test collapses to something simpler: they overlap if `abs(x1 - x2) < size` and `abs(y1 - y2) < size`.

Computing an absolute difference without a dedicated `ABS` instruction: subtract, and if a borrow occurred (meaning the first value was smaller), negate the result via two's complement (`EOR #$FF` then `ADC #1`, equivalently `INC`-after-`EOR`).

**Example**

```asm
; abs(val_a - val_b) < 8 ?  -> hit_result = 1 or 0
_test_collide8:
    LDA val_a
    SEC
    SBC val_b
    BCS already_positive     ; carry set = no borrow = result already correct
    EOR #$FF
    CLC
    ADC #1                     ; two's-complement negate
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

Verified across four cases: `(10,15)` → hit (difference 5), `(10,25)` → no hit (difference 15), `(25,10)` → no hit (same magnitude, arguments reversed — confirming the abs computation is symmetric), `(10,17)` → hit (difference exactly 7, correctly under the threshold of 8).

> **Pitfall, encountered directly while building this guide:** an earlier draft of this exact test tried to pass `val_a`/`val_b` as C function arguments to test it, assuming cc65's calling convention would just work without checking it carefully — it produced garbage output. Switching to this guide's established pattern (named memory locations, a plain `void` routine, values set before the call) fixed it immediately. This isn't a hypothetical caution — it's what actually happened, and it's exactly the kind of "looks obviously fine" mistake this guide's whole verification discipline exists to catch.

For a real two-axis check, run this test once for the x-axis pair and once for the y-axis pair, and only report a collision if both come back true.

**Practice**

- Run the collide-test twice (once per axis) and combine the results with a plain `AND` on the two 0/1 result bytes.
- Extend the test to two *different*-sized objects (you'll need each object's width/height, not one shared constant).

## Storing entities without malloc

**You'll be able to:** manage several game objects in fixed memory, the way 8-bit games actually do it.

**Concept**

There's no heap, no `malloc`, and typically no reason to want one — a simple game has a small, fixed maximum number of objects (enemies, bullets, particles), so you reserve arrays sized for the maximum up front and use an index (usually in `X`) to select "which one." This is the **struct-of-arrays** pattern: instead of one array of `{x, y, active}` records, you keep a separate array for each field — `entity_x`, `entity_y`, `entity_active` — all indexed by the same entity number. It reads slightly less naturally than an array-of-structs at first, but it maps directly onto how the 6502's indexed addressing modes actually work, and it's the standard approach across real 8-bit game code.

**Example**

```asm
entity_x: .byte 10, 20, 30, 40     ; up to 4 entities' x positions

_sum_entities:                        ; example: sum all 4 entities' x positions
    LDX #0
    LDA #0
loop_ent:
    CLC
    ADC entity_x,X
    INX
    CPX #4
    BNE loop_ent
    STA sum_x
    RTS
```

Verified: with entities at `x = 10, 20, 30, 40`, the loop correctly sums to `100` — confirming indexed iteration across a fixed-size entity array.

> **Pitfall:** an "inactive" entity (a used-up bullet, a defeated enemy) still occupies its slot in every array — you don't shrink the arrays, you mark the slot inactive (an `entity_active` byte, `0`/`1`) and skip it in your update/draw/collision loops. Forgetting to check `entity_active` before processing a slot is how dead entities keep moving, colliding, or drawing.

**Practice**

- Add an `entity_active` array and modify the sum loop to skip inactive entities.
- Add a "spawn" routine that finds the first inactive slot (scanning `entity_active` for a `0`) and activates it — this is the entire "allocation" strategy a small fixed-entity-count game needs.

## Progress check

1. Why does 8-bit game code use fixed-point instead of trying to do real floating point?
2. Why does adding `vel_lo` to `pos_lo` via `ADC` correctly handle crossing into the next pixel, with no extra logic?
3. How do you compute an absolute difference on a 6502 with no `ABS` instruction?
4. Why does this guide's collision test only need one axis-comparison routine, called twice, rather than a completely separate y-axis version?
5. What's the struct-of-arrays pattern, and why does it fit 6502 indexed addressing so naturally?
6. Why do inactive entities stay in their arrays instead of being removed?

### Answers

1. There's no floating-point hardware, and software floating point is far more instructions than a game update loop can afford every frame for something as simple as smooth movement — fixed-point gets sub-pixel precision from plain integer arithmetic.
2. `ADC` naturally carries out of the low byte into the high byte when the sum exceeds 255 — exactly the condition "the fractional accumulator wrapped around, so the whole-pixel position needs to increase by one," with no separate check needed.
3. Subtract the two values; if a borrow occurred (carry clear after the `SBC`), the true difference was negative, so two's-complement-negate the result (`EOR #$FF`, `ADC #1`) to get its magnitude.
4. The axis test itself (`abs(a-b) < size`) doesn't care whether the values are x-coordinates or y-coordinates — it's the same comparison either way, so one routine, called with x-values once and y-values once, covers both axes.
5. Keeping a separate array per field (`entity_x`, `entity_y`, ...), all indexed by the same entity number in `X` or `Y`. It fits naturally because 6502 indexed addressing (`LDA entity_x,X`) is exactly "array base plus an index register," which is precisely what this pattern needs.
6. There's no dynamic allocation to shrink into — removing a slot would mean shifting every entity after it down by one in every array, which is far more work than just marking the slot inactive and skipping it in the update/draw/collision loops.
