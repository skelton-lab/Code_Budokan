# Module 5 — Interrupts

How the 6502 lets hardware (or software, via `BRK`) grab the CPU's attention without the main program having to poll for it. This module leans harder on the documented-not-executed tier than any other bare-metal module: the vector table and the exact push/pop choreography are settled, official 6502 facts, but they depend on real hardware memory addresses (`$FFFA`–`$FFFF`) that this guide's hosted `sim65` test environment reserves for its own runtime and won't let this session write to or dispatch through. The *discipline* an interrupt service routine needs — save everything you touch, restore it in reverse order — is ordinary stack mechanics from Module 3, and that part is verified the normal way. Feeds Capstone 4.

## The vector table, documented

**You'll be able to:** name the three interrupt vectors and what triggers each.

**Concept, documented from the 6502's official behavior (not executed in this session):**

The top 6 bytes of the address space are reserved, always, on every 6502:

| Vector | Address | Triggered by |
|---|---|---|
| NMI | `$FFFA`–`$FFFB` | Non-maskable interrupt — a hardware line that fires regardless of the `I` flag; can't be disabled by software |
| RESET | `$FFFC`–`$FFFD` | Power-on or a hardware reset line — where execution starts from cold |
| IRQ/BRK | `$FFFE`–`$FFFF` | A maskable hardware interrupt line, **or** the software `BRK` instruction — they share one vector |

Each vector holds a 2-byte pointer (low byte first) to where execution should jump. Your program (or, on a real platform, the platform's ROM) fills these in — on bare-metal hardware, you'd typically burn them directly into your EEPROM image at the fixed addresses.

**Practice**

- Look up your own toolchain/board's convention for where the vector table gets placed in your ROM image (this varies by linker config — Modules 8–10 each show a real one).
- Write down, from memory, which of the three vectors is the one you can't mask/disable in software.

## What actually happens on IRQ/BRK, documented

**You'll be able to:** explain the exact push sequence on interrupt entry and exit; distinguish a hardware IRQ from a `BRK` at the vector level.

**Concept, documented (not executed in this session's hosted environment):**

On a hardware IRQ (if the `I` flag is clear) or a `BRK` instruction (which fires regardless of `I`), the CPU:

1. Pushes the high byte, then low byte, of the return address — for `BRK` specifically, this is **PC + 2**, not PC + 1, because `BRK` is technically a 1-byte instruction but is conventionally followed by a padding/signature byte the return skips past.
2. Pushes the status register `P`, with the `B` flag bit set to `1` if this was a software `BRK`, `0` if it was a real hardware IRQ — this is the *only* way your handler can tell the two apart, since they share one vector.
3. Sets the `I` flag (disabling further IRQs until you explicitly clear it or `RTI` restores the previous state).
4. Jumps through the `$FFFE`/`$FFFF` vector.

`RTI` reverses this: pops `P` (restoring the flags, including whatever `I` was before), then pops the return address and jumps to it — no `+1` adjustment, unlike `RTS`, because the pushed value was already the correct return address.

NMI follows the same push choreography but through its own vector (`$FFFA`/`$FFFB`) and without the `B`-flag distinction, since nothing else shares its vector.

> **Pitfall, worth internalizing precisely because it can't be demonstrated by execution here:** IRQ and BRK sharing one vector means a real ISR's first job, if it needs to know which one fired, is to check the `B` flag in the pushed `P` (by reading it back off the stack before doing anything else that would disturb it). Skipping this check and assuming every entry to your handler was a hardware IRQ is a real, documented source of confusing bugs once any code path uses `BRK` for anything (including some debuggers, which use `BRK` to implement breakpoints).

**Practice**

- Write out, from memory, the four things that happen (in order) when a hardware IRQ fires while `I` is clear.
- Explain why `RTI` doesn't need a `+1` adjustment on the return address the way `RTS` does.

## ISR discipline: what you can actually verify

**You'll be able to:** write an interrupt handler body that doesn't corrupt the code it interrupted.

**Concept**

Whatever registers your handler uses, it must save them on entry and restore them — in reverse order — before returning, because the code it interrupted has no idea an interrupt happened and expects every register to hold whatever it left there. This is exactly the `PHA`/`PLA` discipline from Module 3, just with a stricter consequence for getting it wrong: a corrupted register in interrupted *main* code is much harder to trace back to its cause than a corrupted register in a normal subroutine call, because the interruption could have happened anywhere.

**Example**

```asm
isr_body:
    PHA                ; save A
    TXA
    PHA                 ; save X (via A, since there's no direct PHX on NMOS 6502)

    ; --- do the actual interrupt work ---
    INC counter
    ; (real ISR body would touch hardware here too)

    PLA                  ; restore X
    TAX
    PLA                   ; restore A
    RTI                    ; (RTS if you're testing this as an ordinary subroutine, as below)
```

Verified (as an ordinary callable subroutine, standing in for what happens when this body actually runs under a real interrupt): called three times in a row, `counter` correctly reaches `3` — confirming the save/work/restore pattern doesn't leak or corrupt state across repeated invocations, which is the property that actually matters for a routine that might fire many times a second.

> **Pitfall:** there's no `PHX`/`PHY` on the original NMOS 6502 (the 65C02 added them) — to save `X` or `Y` you route through `A` (`TXA` then `PHA`), which means if you also need to preserve `A` itself, you need to save `A` *first*, before you clobber it moving `X` into it. Get the order backwards and you'll silently lose the caller's actual `A` value.
>
> **Pitfall — re-entrancy:** if your main program is in the middle of updating a multi-byte value (say, a 16-bit score, low byte then high byte) and an interrupt fires between the two writes, an ISR that reads that same value will see a "torn" half-updated state. On a single-core 6502 the usual fix is to disable interrupts (`SEI`) around the handful of instructions where a shared multi-byte value is genuinely mid-update, then `CLI` immediately after — kept as short as possible, since `SEI` also blocks the timing-sensitive work your ISR might exist to do.

**Practice**

- Extend the verified example to also save and restore `Y`.
- Identify, in Capstone 4 (Module 6) once you build it, exactly which multi-byte value (if any) needs an `SEI`/`CLI` guard around its update.

## Progress check

1. Name the three interrupt vectors and one thing that triggers each.
2. Why do IRQ and `BRK` share a vector, and how does a handler tell them apart?
3. Why does the pushed return address for `BRK` account for `PC + 2`, not `PC + 1`?
4. Why doesn't `RTI` need the `+1` adjustment that `RTS` needs?
5. Why is this module's confidence in the vector table different from its confidence in the ISR save/restore pattern?
6. What's a "torn read," and what's the standard 6502 fix?

### Answers

1. NMI (`$FFFA`/`$FFFB`, a hardware line that can't be masked), RESET (`$FFFC`/`$FFFD`, power-on/hardware reset), IRQ/BRK (`$FFFE`/`$FFFF`, a maskable hardware line or the software `BRK` instruction).
2. They share one vector because the CPU only has one entry point for "maskable interrupt happened." A handler distinguishes them by checking the `B` flag bit in the `P` byte it pops off the stack — set for `BRK`, clear for a real hardware IRQ.
3. `BRK` is a 1-byte instruction conventionally followed by a padding/signature byte; the return address skips past that byte so execution resumes correctly after both.
4. Because the address pushed for IRQ/BRK/NMI is already the correct return address (unlike `JSR`, which pushes the address of its own last byte) — no adjustment is needed on the way back out.
5. The vector table and push/pop choreography are official, settled 6502 facts, but rely on real hardware addresses (`$FFFA`–`$FFFF`) this session's hosted test environment reserves for its own runtime and can't dispatch through. The save/restore pattern is ordinary stack mechanics (Module 3), which was verified the normal way, standing in for the same logic an ISR body would run.
6. A torn read is when an interrupt fires in the middle of a multi-byte value being updated (e.g., after the low byte is written but before the high byte is), so code reading that value during the interrupt sees an inconsistent, half-updated state. The standard fix is a brief `SEI`/`CLI` guard around the specific instructions doing the multi-byte update.
