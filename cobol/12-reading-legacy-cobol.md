# Module 12 — Reading Legacy-Style COBOL

Every module so far has taught you to *write* disciplined, structured COBOL. "Maintain" — the second half of this guide's stated promise — means being able to *read* code that predates that discipline, without getting lost or making a change that breaks something the original author never documented. No capstone here; this module trades a buildable project for a reading-comprehension skill this series' stated promise requires directly.

## `GO TO`-based control flow

**You'll be able to:** trace a `GO TO`-driven loop by hand, and rewrite it using structured `PERFORM`.

**Concept**

Before `PERFORM UNTIL` was standard idiom, loops were written with `GO TO` jumping back to a paragraph label, guarded by an `IF`/`GO TO` exit check — functionally a loop, but with the loop's shape scattered across separate paragraphs rather than visually bounded by `PERFORM`/`END-PERFORM`.

**Example**

```cobol
       PROCEDURE DIVISION.
           GO TO LOOP-START.

       LOOP-START.
           IF WS-COUNTER > 5
               GO TO LOOP-END
           END-IF.
           ADD WS-COUNTER TO WS-SUM.
           DISPLAY "Counter: " WS-COUNTER " Running sum: " WS-SUM.
           ADD 1 TO WS-COUNTER.
           GO TO LOOP-START.

       LOOP-END.
           DISPLAY "Final sum: " WS-SUM.
           STOP RUN.
```

```
$ cobc -x -o legacy legacy.cbl && ./legacy
Counter: 01 Running sum: 0001
Counter: 02 Running sum: 0003
Counter: 03 Running sum: 0006
Counter: 04 Running sum: 0010
Counter: 05 Running sum: 0015
Final sum: 0015
```

**Verified directly as a genuinely safe refactor, not just a plausible-looking one** — rewriting this with `PERFORM UNTIL`:

```cobol
       PROCEDURE DIVISION.
           PERFORM UNTIL WS-COUNTER > 5
               ADD WS-COUNTER TO WS-SUM
               DISPLAY "Counter: " WS-COUNTER " Running sum: " WS-SUM
               ADD 1 TO WS-COUNTER
           END-PERFORM.
           DISPLAY "Final sum: " WS-SUM.
           STOP RUN.
```

```
$ diff <(./legacy) <(./refactored) && echo "IDENTICAL OUTPUT"
IDENTICAL OUTPUT
```

Byte-for-byte identical output, confirmed with `diff` rather than eyeballing it — exactly the discipline this series applies to every refactor, in any language: a refactor is only "safe" once its output has actually been checked against the original, not because the new version merely reads more cleanly.

> **Pitfall:** the `GO TO` version's loop *shape* is only visible by tracing labels across three separate paragraphs — `LOOP-START`'s `IF...GO TO LOOP-END` is the loop's exit condition, but nothing about `LOOP-END`'s own text tells you it's a loop's exit point without reading backward from `LOOP-START` first. This is exactly the cost `PERFORM UNTIL` eliminates: the loop's entire shape is visible in one place.

**Practice**

- Trace, entirely on paper, what `WS-SUM` holds after each iteration before running either version — confirm your trace matches the actual output.
- Rewrite a `GO TO`-based countdown-from-10 loop as `PERFORM UNTIL`, and verify with `diff` the way this module did.

## `ALTER`: the infamous one

**You'll be able to:** recognize `ALTER` when you see it in real legacy code, and explain precisely why it's dangerous — not just "old and bad," but what specifically it does that a plain `GO TO` doesn't.

**Concept**

`ALTER paragraph-name TO PROCEED TO other-paragraph` doesn't jump anywhere itself — it silently *rewrites the destination* of a `GO TO` statement sitting inside a **different, named paragraph**, elsewhere in the program, so that the next time control reaches that paragraph's `GO TO`, it goes somewhere the paragraph's own text never mentioned. `ALTER` was removed from the COBOL standard in 2002 specifically because of what this example shows.

**Example**

```cobol
       PROCEDURE DIVISION.
           ALTER STEP-A TO PROCEED TO STEP-C.
           GO TO STEP-A.

       STEP-A.
           GO TO STEP-B.

       STEP-B.
           DISPLAY "Step B (should be skipped after ALTER)".
           GO TO STEP-DONE.

       STEP-C.
           DISPLAY "Step C (reached via ALTER)".

       STEP-DONE.
           DISPLAY "Done".
           STOP RUN.
```

```
$ cobc -x -o altertest altertest.cbl && ./altertest
Step C (reached via ALTER)
Done
```

Verified directly: `STEP-B` never runs, even though `STEP-A`'s own source text plainly reads `GO TO STEP-B` — the `ALTER` statement, positioned entirely separately at the top of the program, silently changed what that specific `GO TO` actually does at runtime. Reading `STEP-A` in isolation gives you the *wrong* answer for what it does; you have to already know an `ALTER` targeting it exists somewhere else in the program, with no guarantee it's anywhere nearby.

> **Pitfall — this is the whole lesson:** a maintainer who reads `STEP-A.  GO TO STEP-B.` and confidently changes `STEP-B` has no static guarantee that's actually where control goes, if an `ALTER` targeting `STEP-A` exists anywhere else in the codebase. This is precisely why `ALTER` earned its reputation as the single most dangerous construct in classic COBOL, and why recognizing it on sight — rather than reading past it as "just another GO TO" — is a real, specific skill this guide's stated promise requires.

**Practice**

- Search (by eye, then by `grep -n "ALTER" *.cbl` if you have more than one file) any real legacy COBOL source you can find for `ALTER` statements before assuming you understand a `GO TO`'s actual behavior.
- Explain, in your own words, why `ALTER` is a fundamentally different hazard from an ordinary `GO TO` — what exactly does a reader have to know that isn't visible at the `GO TO` statement itself?

## Progress check

1. What's structurally different about a `GO TO`-based loop's exit condition compared to a `PERFORM UNTIL` loop's?
2. What did this module use to prove the `GO TO` and `PERFORM UNTIL` versions were truly equivalent, rather than just "similar-looking"?
3. What does `ALTER paragraph-name TO PROCEED TO other-paragraph` actually change?
4. Why can't you determine where `STEP-A`'s `GO TO STEP-B` actually goes by reading `STEP-A` alone, in a program containing an `ALTER` targeting it?
5. Why was `ALTER` removed from the COBOL standard in 2002?

### Answers

1. A `GO TO`-based loop's exit condition is an `IF`/`GO TO` pair sitting inside the loop body, jumping to a separate label paragraph — its shape is only visible by tracing labels across paragraphs; `PERFORM UNTIL`'s exit condition is stated once, in the same place the loop itself is declared.
2. `diff` against both versions' actual captured output, confirming byte-for-byte identical results — not a visual read-through comparison.
3. It changes the actual runtime destination of a specific `GO TO` statement located in a different, named paragraph — without altering that paragraph's own source text at all.
4. Because `ALTER` can retarget that specific `GO TO` from somewhere entirely separate in the program, with no requirement that the `ALTER` statement be anywhere near the paragraph it affects — the paragraph's own text is no longer a reliable description of its own behavior.
5. Because it makes a program's actual control flow undiscoverable from local reading — a `GO TO`'s real destination can be silently changed by code elsewhere in the source, defeating any attempt to reason about a paragraph's behavior in isolation.
