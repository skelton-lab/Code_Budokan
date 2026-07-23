# Module 4 — Memory-Mapped I/O

How the 6502 talks to the outside world: no separate I/O instructions, just ordinary loads and stores aimed at addresses that happen to be wired to hardware instead of RAM. This module has both verification tiers in play — the CPU-side logic (toggle a bit, poll a value, act on it) is executed and checked; the specific real chip whose registers you'd actually be writing to (a VIA 6522, if you're on Ben Eater–style breadboard hardware) is documented, not executed, since this sandbox has no simulated VIA to write to. Feeds Capstones 1, 2, 3.

## The bus model, and a real I/O chip

**You'll be able to:** explain memory-mapped I/O in one sentence; name the handful of VIA 6522 registers you'd actually touch first.

**Concept**

There's no `IN`/`OUT` instruction on a 6502. A peripheral chip is wired onto the same address bus as RAM, and claims a range of addresses — writing to one of those addresses doesn't store a byte in memory, it changes something in the real world (an LED, a relay, a speaker), because that's what the chip does when its "memory" gets written. Reading works the same way in reverse.

The classic breadboard-6502 I/O chip is the **VIA 6522** (Versatile Interface Adapter) — it gives you two 8-bit ports (`A` and `B`) you can independently configure, pin by pin, as input or output. The two registers you need to get a single output pin blinking:

| Register | Offset from VIA base | Purpose |
|---|---|---|
| `DDRA` | base + 3 | Data Direction Register A — each bit: `1` = that pin is an output, `0` = input |
| `ORA` | base + 1 | Output Register A — write to set output pin states; read to see input pin states |

*(If your own breadboard build uses a different chip or a simpler discrete latch instead of a VIA, the register offsets differ — this table is documented VIA behavior, not something this session's simulator can confirm, since it has no simulated VIA to write to.)*

**Example**

```asm
VIA_BASE = $8000        ; wherever your build's address decoding puts it
DDRA = VIA_BASE + 3
ORA  = VIA_BASE + 1

    LDA #%11111111       ; all 8 pins of port A as outputs
    STA DDRA
    LDA #%00000001         ; set pin 0 high, everything else low
    STA ORA
```

> **Pitfall:** forgetting to set `DDRA` before writing `ORA` is a very common first mistake — the pin stays configured as an input (or whatever it defaulted to at power-on), so your output write has no visible effect, and nothing about the assembly looks wrong.

**Practice**

- Write the two-instruction sequence to configure port A pin 3 as an output and set it high, leaving the rest unchanged (hint: you'll need `ORA` — bitwise OR — to set one bit without disturbing the others, once you're not doing a full `DDRA` write).
- Look up the VIA 6522's `PCR` register (peripheral control) and note, without needing to use it yet, what kind of behavior it controls.

## Your first sound: a tone as a timed toggle

**You'll be able to:** generate a square-wave tone by toggling an output bit at a controlled rate.

**Concept**

The simplest possible 8-bit "sound chip" is no chip at all — toggle a single output bit on and off, with a consistent delay between toggles, and a speaker wired to that pin produces a tone at a frequency set by the delay length. This is genuinely how the Apple II's one-bit speaker works (Module 10), and it's a fine way to get *some* sound out of bare-metal hardware with no dedicated sound chip at all.

**Example**

```asm
; toggles _speaker N times (N passed in A), with a short delay between toggles
_make_tone:
    STA count_save
tone_loop:
    LDA _speaker
    EOR #1               ; flip bit 0
    STA _speaker
    ; --- delay: bigger X = lower pitch ---
    LDX #10
delay:
    DEX
    BNE delay
    DEC count_save
    BNE tone_loop
    RTS
count_save: .byte 0
```

Verified: calling this with `N = 6` toggles the (simulated) speaker byte exactly 6 times, landing back at `0` (an even number of toggles returns to the starting state) — confirming the toggle-and-count logic is correct. The *pitch* itself (the delay-loop length translated to an actual audible frequency) depends on your CPU's real clock speed, which this guide's hosted simulator doesn't model — get that number from your specific hardware's datasheet when you build this for real.

> **Pitfall:** a delay loop's length in cycles, not instructions, determines pitch — `DEX`/`BNE` takes a different number of cycles depending on whether the branch is taken, so "how many times around the loop" isn't quite the same as "how many CPU cycles." Close enough to tune by ear on real hardware; worth knowing about if you're trying to hit an exact frequency.

**Practice**

- Change the delay loop to use a 16-bit counter (two zero-page bytes) for a much longer, lower-pitched tone.
- Wire the toggle to a real `ORA` bit instead of a plain memory byte, once you have VIA hardware to test on.

## Polled keyboard-style input

**You'll be able to:** read a memory-mapped input port and react to a value appearing there.

**Concept**

Polling means checking an input location repeatedly in a loop, rather than waiting for an interrupt (Module 5 covers the interrupt-driven alternative). For a simple keypad or button matrix wired to an input port, the pattern is: read the port, if it's nonzero something's pressed, store what it is, and — depending on your hardware — acknowledge/clear the input latch so the same keypress isn't read twice.

**Example**

```asm
; poll the port -- if nonzero, a key is pressed; store it and clear the port (ack)
_poll:
    LDA _port
    BEQ no_key
    STA _result
    LDA #0
    STA _port          ; acknowledge / clear the input latch
    RTS
no_key:
    LDA #0
    STA _result
    RTS
```

Verified: with `_port = 0`, `_result` comes out `0`. With `_port` pre-loaded to `65` (ASCII `'A'`), `_result` comes out `65` and `_port` is cleared afterward — confirming both the no-key and key-pressed paths, including the acknowledge step.

> **Pitfall:** real keypads and keyboard matrices bounce — a single physical press can register as several rapid on/off transitions electrically. This guide's verified example above is a clean digital-input pattern; a real hardware keypad needs a debounce delay (poll, see a press, wait a few milliseconds, poll again to confirm it's still pressed) layered on top, which becomes directly relevant once you build the monitor capstone (Module 6) on real hardware rather than the simulator.

**Practice**

- Add a debounce delay (reuse the tone-generator's delay-loop technique) between detecting a keypress and acting on it.
- Extend the poll routine to distinguish "no key" from "key released" if your hardware can report both states.

## Progress check

1. Why doesn't the 6502 need a separate "read from a device" instruction?
2. What are `DDRA` and `ORA` for, on a VIA 6522, and why does the order you write them in matter?
3. Why is this guide's confidence in the VIA register table different from its confidence in the tone-generator toggle logic?
4. What determines the pitch of the simple toggle-based tone generator?
5. What does "polling" mean, and what's the alternative approach (covered next module)?
6. Why does a real keypad usually need debouncing that this session's clean simulated example didn't need?

### Answers

1. Because memory-mapped I/O means a peripheral chip's registers just occupy addresses on the same bus as RAM — an ordinary `LDA`/`STA` at the right address *is* the read/write.
2. `DDRA` sets which pins of port A are inputs vs. outputs; `ORA` reads/writes the actual pin states. Writing `ORA` before configuring `DDRA` has no visible effect on pins still set as inputs, so `DDRA` needs to be set first.
3. The toggle logic (flip a bit, count toggles, loop with a delay) is pure CPU logic and was actually assembled and run under `sim65` with the result checked. The VIA register table is real chip documentation this session's simulator can't execute against, since it has no simulated VIA hardware to write to.
4. The length of the delay loop between toggles — a longer delay means a lower-pitched tone, and the exact frequency also depends on the real CPU's clock speed, which varies by hardware.
5. Polling means the CPU actively checks an input location in a loop. The alternative is interrupt-driven input, where the hardware itself signals the CPU (via IRQ/NMI) when something needs attention, instead of the CPU having to keep asking — covered in Module 5.
6. A single physical keypress can produce several rapid electrical on/off transitions as the switch contacts settle, which a naive poll would read as multiple separate presses; a real debounce delay filters that out.
