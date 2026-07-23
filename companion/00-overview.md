# Companion — Historical Context for the Language Modules

**What this is:** a parallel reference layer, not a rewrite. Every one of `code-rookie`'s 28 language/framework guides stays exactly as verified and shipped — this companion sits alongside them, linking *into* specific sections rather than being linked *from* them, so the guides stay stable while this layer can be revised, extended, or reordered freely.

**Source material:** this companion is built from two documents prepared outside `code-rookie` itself — *Code Budokan: A History of Computer Science & Programming* (a seven-era history of computing, Babbage to the Transformer, with biographical profiles and milestone tables) and the *Code Budokan Grand Reading Workbook* (three parallel strands: the AI Canon, the Hunter Thread on AI-and-law, and the Language Lineage — founding papers mapped to what that workbook calls "Budokan modules," which correspond closely to `code-rookie`'s own guide sequence). Citations, reading guides, and reflection prompts drawn directly from those documents are marked as such; where a citation had to be supplied independently (a well-known paper the source workbook named only in passing, or didn't cover at all), that's marked too — the same "verified, not assumed" discipline the guides themselves were built on applies here.

## Structure, per language

Each companion file follows the same shape:

1. **Founding paper(s)** — full citation, sourced either from the Budokan workbook directly or independently where noted.
2. **Historical note** (~200–250 words) — concise, substantive context: why this paper mattered, what it displaced, what it made possible. Not a copy of the source material — a synthesis, written to stand on its own.
3. **Reflection prompts** — open-ended, in the Budokan workbook's own "vibe coding loop" style: read the paper, then sit with these before moving on.
4. **Short-answer questions** — concise question/answer pairs, matching the Progress Check style already used throughout every `code-rookie` guide, for a reader who wants a checkable answer rather than an open reflection.
5. **Links into the guide** — specific sections of the actual language guide where this history is most directly relevant, not just the guide's own overview.
6. **Cross-thread connections** — where the Budokan workbook's own master table names a contemporary AI-canon paper or a Hunter-thread (AI-and-law) connection from the same era, it's carried over here as a genuine, sourced link, not a forced one.

## What's covered

All 28 `code-rookie` guides now have a companion file. Twenty are covered by citations sourced directly from the Budokan workbook's own Strand C (or, for Assembly, its master appendix table); eight — Clojure, COBOL, Docker, Forth, Modula-2, OCaml, Rails, and Erlang's own precise module number — needed a citation independently supplied or transparently reconciled, since they either predate the workbook's own original module list or (Erlang) sit at a numbering inconsistency within the source document itself. Every file says which case it is, in its own opening line.

| File | Guide | Source |
|---|---|---|
| [`fortran.md`](fortran.md) | [`fortran/`](../fortran/00-overview.md) | Budokan Module 1 |
| [`scheme.md`](scheme.md) | [`scheme/`](../scheme/00-overview.md) | Budokan Module 2 |
| [`algol.md`](algol.md) | [`algol/`](../algol/00-overview.md) | Budokan Module 3 |
| [`c.md`](c.md) | [`c/`](../c/00-overview.md) | Budokan Module 4 |
| [`simula.md`](simula.md) | [`simula/`](../simula/00-overview.md) | Budokan Module 5 |
| [`pascal.md`](pascal.md) | [`pascal/`](../pascal/00-overview.md) | Budokan Module 6 |
| [`cpp.md`](cpp.md) | [`cpp/`](../cpp/00-overview.md) | Budokan Module 7 (citation independently supplied) |
| [`sql.md`](sql.md) | [`sql/`](../sql/00-overview.md) | Budokan Module 8 |
| [`smalltalk.md`](smalltalk.md) | [`smalltalk/`](../smalltalk/00-overview.md) | Budokan Module 9 (shared with Ruby) |
| [`ruby.md`](ruby.md) | [`ruby/`](../ruby/00-overview.md) | Budokan Module 9 (shared with Smalltalk) |
| [`javascript.md`](javascript.md) | [`javascript/`](../javascript/00-overview.md) | Budokan Module 10 |
| [`apl.md`](apl.md) | [`apl/`](../apl/00-overview.md) | Budokan Module 11 |
| [`prolog.md`](prolog.md) | [`prolog/`](../prolog/00-overview.md) | Budokan Module 12 |
| [`racket.md`](racket.md) | [`racket/`](../racket/00-overview.md) | Budokan Module 13 |
| [`haskell.md`](haskell.md) | [`haskell/`](../haskell/00-overview.md) | Budokan Module 14 |
| [`python.md`](python.md) | [`python/`](../python/00-overview.md) | Budokan Module 15 |
| [`go.md`](go.md) | [`go/`](../go/00-overview.md) | Budokan Module 16 |
| [`julia.md`](julia.md) | [`julia/`](../julia/00-overview.md) | Budokan Module 17 |
| [`rust.md`](rust.md) | [`rust/`](../rust/00-overview.md) | Budokan Module 18 |
| [`6502-asm.md`](6502-asm.md) | [`6502-asm/`](../6502-asm/00-overview.md) | Budokan "Assembly" |
| [`erlang.md`](erlang.md) | [`erlang/`](../erlang/00-overview.md) | Budokan Concurrent/Systems Lineage (module-number drift in the source, noted transparently) |
| [`ocaml.md`](ocaml.md) | [`ocaml/`](../ocaml/00-overview.md) | Not in original module list — citation (Milner) sourced directly; OCaml-specific lineage independently supplied |
| [`clojure.md`](clojure.md) | [`clojure/`](../clojure/00-overview.md) | Not in original module list — citation independently supplied |
| [`cobol.md`](cobol.md) | [`cobol/`](../cobol/00-overview.md) | Not in original module list — citation independently supplied |
| [`modula2.md`](modula2.md) | [`modula2/`](../modula2/00-overview.md) | Not in original module list — citation independently supplied |
| [`forth.md`](forth.md) | [`forth/`](../forth/00-overview.md) | Not in original module list — citation independently supplied |
| [`docker.md`](docker.md) | [`docker/`](../docker/00-overview.md) | Not a language; not in original module list — citation independently supplied |
| [`rails.md`](rails.md) | [`rails/`](../rails/00-overview.md) | Not a language; not in original module list — no academic founding paper exists; closest equivalent independently supplied |

## Three framing papers, read before any module

The Budokan workbook names three papers that cut across every lineage and should be read first, returned to after each module:

- **Knuth, D.E. (1974). "Computer Programming as an Art."** *Communications of the ACM*, 17(12), 667–673. Knuth's own Turing Award lecture — read in full for this companion, not just cited. The humanistic case for programming as craft: "Science is knowledge which we understand so well that we can teach it to a computer; and if we don't fully understand something, it is an art to deal with it." Directly relevant to every guide's own "Beyond This Guide" material — the parts of a language's use that remain taste and judgment, not yet reducible to a rule.
- **Dijkstra, E.W. (1968). "Go To Statement Considered Harmful."** *Communications of the ACM*, 11(3), 147–148. Three hundred words that launched structured programming — read this alongside `fortran/02-control-flow.md` and `algol/04-control-dangling-else.md` specifically.
- **Iverson, K.E. (1980). "Notation as a Tool of Thought."** *Communications of the ACM*, 23(8), 444–465. Iverson's own Turing Award lecture (APL's creator) — the argument that notation shapes thought, the intellectual foundation the Budokan workbook names for the entire multi-paradigm project `code-rookie` itself turned out to be. Read alongside `apl/00-overview.md`.

## History of Computing — the full seven-era document

The History-of-Computing document's own seven eras (Babbage to the Transformer) are now fully converted from the source `.docx` into ten linkable markdown files in [`history/`](history/00-overview.md) — every biographical profile, milestone table, reading-list entry, and the biographical index, restructured for the web without cutting anything. Six of the 28 companion files above ([`cobol.md`](cobol.md), [`c.md`](c.md), [`go.md`](go.md), [`sql.md`](sql.md), [`javascript.md`](javascript.md), [`python.md`](python.md)) now link directly into specific era profiles or milestone rows where their own historical notes previously named an era only in prose. Start at [`history/00-overview.md`](history/00-overview.md).
