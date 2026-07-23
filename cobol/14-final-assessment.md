# Final Assessment

Across all thirteen modules and four capstones. Work through these before compiling anything — precision in your own reasoning is the actual test.

1. Which two DIVISIONs are strictly required in every COBOL program, and which two are optional?
2. What region of fixed-form source is Area A, and what has to start there?
3. What did this guide's own first attempt at testing column-72 truncation get wrong, and how was it caught?
4. What does `V` in a `PIC` clause mean, and how much physical storage does it occupy?
5. What happens, verified directly in this guide, to an unguarded `COMPUTE`/`ADD` that overflows its receiving field?
6. Why does `0.10 + 0.20` equal exactly `0.30` in a COBOL `PIC S9V99` field, but not in Python, JavaScript, Ruby, or C's `double`?
7. What's the difference between `EVALUATE field WHEN literal` and `EVALUATE TRUE WHEN condition`?
8. What does an 88-level entry actually declare?
9. In the standard sequential-file read loop, why must every `READ` have an `AT END` clause?
10. What silent corruption did this guide's own `sales.dat` example run into, and what was the actual fix?
11. What does the control-break pattern's "first record" guard prevent?
12. Why does `SORT` need its own `SD` record and `FILE-CONTROL` entry, even though the program never opens that file directly?
13. What must be true of a table's real data for `SEARCH ALL` to behave correctly?
14. What does `REDEFINES` actually share between two field views?
15. What kind of file organization and access mode let a program fetch, update, or delete one specific record directly by key?
16. How are `CALL ... USING` arguments matched to a subprogram's `LINKAGE SECTION` — by name or position?
17. What ends a subprogram and returns control to its caller, and how does that differ from ending the whole program?
18. Why does GnuCOBOL's C interop work as directly as calling another COBOL subprogram?
19. What does `ALTER` change, and why is it considered uniquely dangerous compared to an ordinary `GO TO`?
20. What verification pattern did this guide build in place of a standard test framework, and what's its one real weakness?

## Answers

1. `IDENTIFICATION DIVISION` and `PROCEDURE DIVISION` — `ENVIRONMENT DIVISION` and `DATA DIVISION` are optional, needed only when the program touches files/configuration or declares data, respectively.
2. Columns 8–11; DIVISION/SECTION headers, paragraph names, and `01`/`77` level numbers must start there.
3. A first test claimed GnuCOBOL didn't truncate text past column 72, based on a line where the "past 72" content was actually still within columns ≤72 — a miscounted test, not a real result. Caught by printing the exact character at each column position rather than trusting a visual line-length count; redone correctly, the truncation was confirmed real.
4. It marks where an implied decimal point sits — it occupies zero physical storage; a `PIC S9(7)V99` field is 9 digits of actual storage, not 10.
5. Verified directly: it silently keeps only the low-order digits that fit, exactly like modular arithmetic — no crash, no error, and the field ends up holding a completely wrong but still plausible-looking number.
6. Because COBOL's `PIC`-with-`V` fields store and compute decimal digits directly, with no binary approximation step — the other four languages' default numeric types are IEEE 754 binary floating point, which cannot represent most decimal fractions (including `0.1` and `0.2`) exactly.
7. The first form compares one field against a series of literal values; `EVALUATE TRUE` evaluates each `WHEN`'s own full condition in order, functioning as an if/elif chain for conditions that aren't all testing the same field against literals.
8. No storage of its own — a name for a specific value (or range) of the data field it's declared directly under, letting code test that condition by name.
9. Because reaching the end of the file with no more data is a real, expected condition every sequential read loop must explicitly handle — there's no other defined way to detect it.
10. The amount field was written with a literal decimal point (`01234.50`, 8 characters) into a `PIC 9(5)V99` field occupying only 7 characters in the file — misaligning every subsequent field. Fixed by writing the raw digits with no punctuation (`0123450`), since `V` is implied and stores no character at all.
11. It prevents a spurious "group changed" detection on the very first record, since the comparison field starts out as spaces before any real record has been read.
12. `SORT`'s working storage during the sort is itself a file-like structure GnuCOBOL manages internally — it still needs a `SELECT`/`ASSIGN` entry in `FILE-CONTROL` even though the program's own code never issues an `OPEN`/`READ`/`CLOSE` against it directly.
13. The table must genuinely be sorted in ascending order by the declared key field — if it isn't, `SEARCH ALL`'s binary search can silently report "not found" for a present entry, or return the wrong one.
14. The storage itself — the identical physical bytes, viewed through a different `PIC` layout; changing either view changes what the other reads immediately.
15. `ORGANIZATION IS INDEXED` with `ACCESS MODE IS RANDOM` and a declared `RECORD KEY` — `READ`/`REWRITE`/`DELETE` all act directly on the record identified by the current key value.
16. By position — argument order in `CALL ... USING` must match parameter order in `PROCEDURE DIVISION USING`, with matching `PIC` clauses; there's no name-based matching.
17. `GOBACK` returns control to the caller; `STOP RUN` ends the entire running program, whether called from the main program or from inside a subprogram.
18. Because GnuCOBOL compiles COBOL source down to C before producing a native binary — calling a hand-written C function needs no special FFI layer, just `CALL`/`USING` handing the C function raw pointers to each argument's storage.
19. `ALTER paragraph-name TO PROCEED TO other-paragraph` silently rewrites the destination of a `GO TO` statement located inside a different, named paragraph elsewhere in the source, without changing that paragraph's own text at all — a plain `GO TO`'s destination is at least visible by reading the statement itself; an altered `GO TO`'s real destination depends on code that could be anywhere else in the program.
20. Capturing a program's actual output and diffing it against a known-good expected file, using `diff`'s own exit code as the pass/fail signal. Its real weakness: it's only as correct as the expected-output file's first creation — if a bug is present the moment that baseline gets captured, the harness certifies the bug as correct forever after, unless that first capture was independently, by-hand verified.
