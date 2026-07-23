# Module 10 — Beyond This Guide

Every topic here failed the capstone-impact test — real, worth knowing exists, but not required by any of this guide's three capstones. Each entry states what it is, why it matters, and where to go deeper.

### Forth's real history: spacecraft and Open Firmware

**What it is:** Forth's tiny footprint and interactive, self-extending development style made it a genuine, repeated choice for embedded and resource-constrained systems — Sun's and Apple's Open Firmware boot ROMs, and several NASA spacecraft (including instruments on the Philae comet lander and various probes) ran real Forth code.

**Why it matters:** this is the practical, real-world payoff of everything this guide covered — a language designed in 1970 for controlling a telescope, still genuinely deployed decades later precisely because `CREATE`/`DOES>`-style extensibility and a minimal runtime footprint remain valuable in exactly the domains where most modern languages are too heavy to fit at all.

**Where to go next:** the Forth Interest Group's own historical writeups; NASA's public documentation on Forth-based flight software.

### Local variables (`{ a b -- sum }`)

**What it is:** a GForth extension letting a word's definition use named local variables instead of pure stack juggling — verified directly:
```forth
: LOCALS-TEST { a b -- sum } a b + ;
3 4 LOCALS-TEST . CR
```
```
7
```
Confirmed working — `a`/`b` behave like ordinary named parameters inside the definition, an explicit escape hatch from RPN stack discipline when a computation's stack juggling would otherwise be hard to read correctly.

**Why it matters:** genuinely useful for words with complex stack manipulation (Capstone 1's `HYPOT-SQ` bug might never have happened with named locals), but this guide deliberately stayed with pure stack discipline throughout, since internalizing *why* stack-based composition is hard is the actual point of a first Forth guide.

**Where to go next:** the GForth manual's locals chapter.

### Immediate words and compile-time metaprogramming

**What it is:** `CREATE`/`DOES>` (Module 8) is real, powerful metaprogramming, but Forth goes further — **immediate words**, marked to execute *during compilation* of another word rather than being compiled into it, are how Forth itself implements `IF`/`ELSE`/`THEN`, `DO`/`LOOP`, and every other control-flow word this guide used. A sufficiently determined Forth programmer can define genuinely new control-flow structures this way.

**Why it matters:** this is Forth's deepest, most self-referential capability — the language's own control flow isn't special-cased in the compiler, it's ordinary immediate words, the same mechanism available to any program. Capstone 3's custom defining words are real self-extension; immediate words are a level deeper still.

**Where to go next:** the GForth manual's chapter on `IMMEDIATE` and compiling words; studying GForth's own source for how `IF`/`THEN` are actually implemented.

### Floating point

**What it is:** Forth maintains a *separate* floating-point stack from the integer parameter stack this entire guide used — verified directly:
```forth
3.5e0 2.5e0 F+ F. CR
```
```
6.
```
Confirmed working — `F+`/`F.` are the floating-point equivalents of `+`/`.`, operating on their own stack entirely, never mixing with integer values the way this guide's `+`/`.` did throughout.

**Why it matters:** genuinely necessary for any Forth program doing real-valued math, but none of this guide's capstones needed anything beyond integer arithmetic.

**Where to go next:** the GForth manual's floating-point chapter.

### ANS Forth standard vs. GForth extensions

**What it is:** this guide used some words (`{ a b -- sum }` locals, certain GForth-specific conveniences) that are GForth extensions, not part of the ANS Forth standard every conforming Forth implementation must support.

**Why it matters:** code relying on GForth-specific extensions isn't automatically portable to a different Forth implementation (an embedded target's own vendor Forth, say) — worth knowing precisely which parts of a program are standard versus implementation-specific before assuming portability.

**Where to go next:** the ANS Forth standard document itself; the GForth manual's own notes on where it extends beyond the standard.

## The wider ecosystem

- **[GForth manual](https://www.gnu.org/software/gforth/manual/)** — the anchored toolchain's own authoritative documentation.
- **_Starting Forth_** and **_Thinking Forth_** (Leo Brodie) — both freely available online, the canonical introductions to Forth's philosophy and idioms.
- **This series' [Racket guide](../racket/08-language-oriented-programming.md)** — the direct, whole-language-level parallel to this guide's `CREATE`/`DOES>` capstone.
- **This series' [6502 Assembly guide](../6502-asm/00-overview.md)** — the closest sibling in this series for "close to the metal" programming, though via a genuinely different route.
