# Companion — Forth (not in the original Budokan module list)

**Founding paper: independently supplied.** Rather, E.D., Colburn, D.R. & Moore, C.H. (1993). "The Evolution of Forth." *ACM SIGPLAN Notices*, 28(3), 177–199. (HOPL-II — the same 1993 conference as Ritchie's C paper, Kay's Smalltalk paper, and Colmerauer & Roussel's Prolog paper; Forth's own creator, Chuck Moore, is a co-author.) Forth doesn't appear in the Budokan workbook's own module list — added to `code-rookie` after the original plan was set.

## Historical note

Moore's own co-authored retrospective traces Forth's origin to a real, specific practical need: efficient, interactive control of telescope instrumentation at Kitt Peak National Observatory in 1970, on hardware too limited for the languages available at the time. Forth's own defining shape — a shared data stack, Reverse Polish (postfix) notation with no operator precedence or parsing to speak of, and "words" (Forth's own term for procedures) as the fundamental, extensible unit of the language itself — emerged directly from that constraint, not from a theoretical position about what programming should look like. `forth/00-overview.md` names the guide's own real payoff precisely: Forth's `CREATE`/`DOES>` mechanism lets a program define entirely new *classes* of words with custom behavior — "a direct parallel, at the vocabulary level," to Racket's own custom-`#lang` capstone (companion: `racket.md`) at the whole-language level, the same instinct (extend the language itself, not merely use it) expressed forty-five years earlier.

`forth/00-overview.md` also states something genuinely rare among this companion's guides: Forth is "a genuinely sixth paradigm" this series covers — stack-based/concatenative programming — with no prefix or infix expressions anywhere, no operator precedence at all, every computation a sequence of operations on a shared stack. This series' own real bugs found while building the guide (`forth/03-capstone-calculator.md`'s `HYPOT-SQ` producing 259 instead of 25, the second `SQUARE` squaring the first `SQUARE`'s own result rather than the intended second operand) are themselves a direct, concrete demonstration of what "no operator precedence, everything is stack manipulation" actually costs in practice, not merely a slogan about Forth's own minimalism.

## Reflection prompts

- Moore's own retrospective ties Forth's shape directly to a real hardware constraint (limited telescope-control hardware, 1970). `python/00-overview.md`'s own toolchain runs on hardware and infrastructure Moore couldn't have imagined. What, if anything, would Forth's own design have looked different if Moore had access to modern hardware from the start — or is stack-based thinking valuable independent of the original constraint?
- `forth/03-capstone-calculator.md`'s own real bug (`HYPOT-SQ` producing 259 instead of 25) is kept in this series as deliberate teaching material, not silently fixed. Trace through the exact stack operations by hand and identify precisely where "the second `SQUARE` operates on whatever is currently on top" produces the wrong operand.

## Short-answer questions

1. **What real, specific practical need directly motivated Forth's original creation, per its own co-authored 1993 retrospective?** Efficient, interactive control of telescope instrumentation at Kitt Peak National Observatory in 1970, on hardware too limited for the languages available at the time.
2. **What does `forth/00-overview.md` name as the direct, vocabulary-level parallel to Racket's own whole-language custom-`#lang` capstone?** Forth's `CREATE`/`DOES>` mechanism — letting a program define entirely new classes of words with custom behavior, the same "extend the language itself" instinct as Racket's own flagship capability, expressed forty-five years earlier.
3. **What real bug did this series' own construction of `forth/03-capstone-calculator.md` find, and why was it kept in rather than silently fixed?** `HYPOT-SQ`, defined as `SQUARE SQUARE +`, produced 259 instead of 25 for a 3-4-5 triangle — the second `SQUARE` squared the first `SQUARE`'s own result rather than the intended second operand, since an operator only ever touches whatever currently sits on top of the stack; kept in deliberately as concrete teaching material about what "no operator precedence" actually costs.

## Links into the guide

- [`forth/03-capstone-calculator.md`](../forth/03-capstone-calculator.md) — the real, kept-in `HYPOT-SQ` bug, a direct demonstration of stack-based computation's own real pitfalls.
- [`forth/08-create-does.md`](../forth/08-create-does.md)/[`forth/09-capstone-custom-defining-words.md`](../forth/09-capstone-custom-defining-words.md) — `CREATE`/`DOES>`, the vocabulary-level parallel to Racket's own language-extension capability.

## Cross-thread connection

No direct Budokan-workbook pairing exists for Forth specifically, since it isn't in the workbook's own original module list. The genuinely relevant connection is internal to `code-rookie` itself: `forth/00-overview.md` names Forth as this series' own "sixth paradigm" (after procedural, object-oriented, logic, and two functional-language arcs), closing out a deliberate tour of fundamentally different ways of thinking about computation — every one of them verified by actually running real code, none merely described.
