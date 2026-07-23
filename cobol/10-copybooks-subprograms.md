# Module 10 — Copybooks & Subprograms

By the end of this module you'll be able to share a record layout across multiple source files with `COPY`, call a separately-defined subprogram with parameters via `CALL`/`USING`, run a contiguous block of paragraphs with `PERFORM THRU`, and — a genuinely distinctive GnuCOBOL capability — call a plain C function directly from COBOL. Feeds Capstone 4 (Modular Billing System).

## `COPY`: one record layout, many programs

**You'll be able to:** factor a record layout into a separate `.cpy` file and pull it into multiple programs with `COPY`.

**Concept**

`COPY "filename"` textually includes another file's contents at that exact point during compilation — most commonly used for a record layout that needs to be identical across several programs (a customer record read by both a batch-report program and a maintenance program, say). It's the closest COBOL analogue to a C header shared via `#include`, or a shared type definition imported into multiple modules in any of this series' other languages.

**Example**

`custrec.cpy`:
```cobol
       01  CUSTOMER-RECORD.
           05  CUST-ID          PIC 9(5).
           05  CUST-NAME        PIC X(20).
           05  CUST-BALANCE     PIC 9(7)V99.
```

```cobol
       IDENTIFICATION DIVISION.
       PROGRAM-ID. COPYTEST.
       DATA DIVISION.
       WORKING-STORAGE SECTION.
       COPY "custrec.cpy".
       PROCEDURE DIVISION.
           MOVE 10001 TO CUST-ID.
           MOVE "Ada" TO CUST-NAME.
           MOVE 500.00 TO CUST-BALANCE.
           DISPLAY "Via copybook: " CUST-ID " " CUST-NAME
                   " " CUST-BALANCE.
           STOP RUN.
```

```
$ cobc -x -o copytest copytest.cbl && ./copytest
Via copybook: 10001 Ada                  0000500.00
```

Verified directly: `CUST-ID`/`CUST-NAME`/`CUST-BALANCE` are usable exactly as if they'd been typed directly into `WORKING-STORAGE SECTION` — `COPY` is a compile-time textual substitution, not a runtime import.

> **Pitfall:** because `COPY` is purely textual, two programs that `COPY` the same file but were compiled at different times (one before a field was added to the copybook, one after) can silently disagree about a record's actual shape — a real, common source of "it worked in the old program but breaks in the new one" bugs in legacy COBOL shops with a large, slowly-updated set of copybooks in production.

**Practice**

- Add a fourth field to `custrec.cpy` and confirm it becomes usable in `COPYTEST` after recompiling, with no other change to `COPYTEST`'s own source.

## `CALL`/`USING`: subprograms with parameters

**You'll be able to:** write a callable subprogram with a `LINKAGE SECTION`, and call it from another program passing working-storage fields as parameters.

**Concept**

A subprogram declares its parameters in a `LINKAGE SECTION` (storage that belongs to the *caller*, not the subprogram itself) and lists them in `PROCEDURE DIVISION USING param1 param2 ...`. The calling program's own `CALL "PROGRAM-NAME" USING arg1 arg2 ...` passes its own working-storage fields by reference — the subprogram operates directly on the caller's storage, not a copy. `GOBACK` (rather than `STOP RUN`) returns control to the caller instead of ending the whole process.

**Example**

`taxcalc.cbl`:
```cobol
       IDENTIFICATION DIVISION.
       PROGRAM-ID. TAXCALC.
       DATA DIVISION.
       LINKAGE SECTION.
       01  LS-AMOUNT            PIC 9(7)V99.
       01  LS-RATE              PIC 9(2)V99.
       01  LS-TAX               PIC 9(7)V99.
       PROCEDURE DIVISION USING LS-AMOUNT LS-RATE LS-TAX.
           COMPUTE LS-TAX ROUNDED = LS-AMOUNT * LS-RATE / 100.
           GOBACK.
```

`callmain.cbl`:
```cobol
       IDENTIFICATION DIVISION.
       PROGRAM-ID. CALLMAIN.
       DATA DIVISION.
       WORKING-STORAGE SECTION.
       01  WS-AMOUNT            PIC 9(7)V99 VALUE 1000.00.
       01  WS-RATE              PIC 9(2)V99 VALUE 7.50.
       01  WS-TAX               PIC 9(7)V99.
       PROCEDURE DIVISION.
           CALL "TAXCALC" USING WS-AMOUNT WS-RATE WS-TAX.
           DISPLAY "Tax on " WS-AMOUNT " at " WS-RATE
                   "%: " WS-TAX.
           STOP RUN.
```

```
$ cobc -x -o callmain callmain.cbl taxcalc.cbl
$ ./callmain
Tax on 0001000.00 at 07.50%: 0000075.00
```

Verified directly: `1000.00 * 7.50 / 100 = 75.00`, correctly computed inside the subprogram and visible back in the caller through `WS-TAX`, because `LS-TAX` in `TAXCALC` and `WS-TAX` in `CALLMAIN` refer to the *same* storage during the call. Both source files were compiled and linked together in one `cobc` invocation — simpler and more portable than building a separately-loadable dynamic module, and the approach this guide uses throughout.

> **Pitfall:** parameters are matched to `LINKAGE SECTION` entries *by position*, not by name — `TAXCALC`'s `LS-AMOUNT`/`LS-RATE`/`LS-TAX` have no naming relationship to `CALLMAIN`'s `WS-AMOUNT`/`WS-RATE`/`WS-TAX` at all; only their order in the `CALL ... USING` / `PROCEDURE DIVISION USING` lists has to line up, along with matching `PIC` clauses.

**Practice**

- Write a second subprogram that takes a customer balance and a flat fee, returning the balance minus the fee, and call it from a small driver program.
- Swap the order of two parameters in a `CALL` statement (without changing the subprogram) and observe exactly what goes wrong.

## `PERFORM THRU`: running a contiguous range of paragraphs

**You'll be able to:** run a defined sequence of paragraphs with one `PERFORM`, and explain why paragraphs "fall through" into each other.

**Concept**

Unlike a `PERFORM`ed inline block (`PERFORM ... END-PERFORM`), a **paragraph** in COBOL has no automatic "return" boundary — control simply falls into whatever paragraph comes next in the source, unless something explicitly transfers control elsewhere. `PERFORM paragraph-1 THRU paragraph-3` runs `paragraph-1`, then falls through `paragraph-2`, then `paragraph-3`, then returns to whatever called it — treating the whole contiguous range as one unit.

**Example**

```cobol
       PROCEDURE DIVISION.
           PERFORM STEP-ONE THRU STEP-THREE.
           DISPLAY "Back in main flow".
           STOP RUN.

       STEP-ONE.
           DISPLAY "Step one".
       STEP-TWO.
           DISPLAY "Step two".
       STEP-THREE.
           DISPLAY "Step three".
```

```
$ cobc -x -o performthru performthru.cbl && ./performthru
Step one
Step two
Step three
Back in main flow
```

Verified directly: all three steps ran in order, then control genuinely returned to the caller — `STEP-TWO` was never named in the `PERFORM` statement at all, it simply got executed because it's physically between `STEP-ONE` and `STEP-THREE` in the source.

> **Pitfall:** this "fall through" behavior is exactly what Module 12 revisits as a real legacy-code hazard — a paragraph inserted between two others *without* updating a `PERFORM ... THRU` range elsewhere in the program silently becomes part of that range's execution, whether that was intended or not.

**Practice**

- Insert a fourth paragraph, `STEP-FOUR`, physically between `STEP-TWO` and `STEP-THREE`, without changing the original `PERFORM STEP-ONE THRU STEP-THREE` statement — confirm it now runs too.

## Calling C directly: GnuCOBOL's own interop

**You'll be able to:** call a plain C function from a COBOL program, compiled and linked in the same `cobc` invocation.

**Concept**

This series has a running thread on C as the universal FFI target — Fortran's `iso_c_binding`, C++, and others all name it explicitly. GnuCOBOL earns a genuinely direct version of this: because it compiles COBOL itself down to C before producing a native binary, calling a hand-written C function is not a special foreign-function-interface feature bolted on — it's `CALL "function-name" USING args` exactly like calling another COBOL subprogram, just handing the C function raw pointers to each argument's storage.

**Example**

`helper.c`:
```c
#include <string.h>
#include <stdio.h>
#include <stdlib.h>

void double_amount(unsigned char *in, unsigned char *out) {
    char buf[10];
    memcpy(buf, in, 9);
    buf[9] = '\0';
    long v = atol(buf) * 2;
    char result[10];
    snprintf(result, sizeof(result), "%09ld", v);
    memcpy(out, result, 9);
}
```

```cobol
       IDENTIFICATION DIVISION.
       PROGRAM-ID. CCALLDEMO.
       DATA DIVISION.
       WORKING-STORAGE SECTION.
       01  WS-INPUT             PIC 9(7)V99 VALUE 123.45.
       01  WS-OUTPUT            PIC 9(7)V99 VALUE 0.
       PROCEDURE DIVISION.
           CALL "double_amount" USING WS-INPUT WS-OUTPUT.
           DISPLAY "Input:  " WS-INPUT.
           DISPLAY "Output (doubled by C): " WS-OUTPUT.
           STOP RUN.
```

```
$ cobc -x -o ccall ccall.cbl helper.c
$ ./ccall
Input:  0000123.45
Output (doubled by C): 0000246.90
```

Verified directly: `123.45 * 2 = 246.90`, computed entirely inside hand-written C, called from COBOL as if it were just another subprogram. The C function receives each `PIC 9(7)V99` field as its raw 9-byte ASCII-digit representation (`DISPLAY` usage stores digits as literal ASCII characters, no binary encoding) — `atol`/`snprintf` on plain character buffers, nothing COBOL-specific in the C code at all.

> **Pitfall:** this only works cleanly for `DISPLAY`-usage fields, whose in-memory representation is plain ASCII digits — a `COMP`/`COMP-3` field's C-side representation is a genuinely different binary layout (native integer or packed-decimal nibbles respectively), and a C function written assuming ASCII digits would silently misread one.

**Practice**

- Write a second C function that adds two `PIC 9(7)V99` fields and returns the sum, called from COBOL, and cross-check its result against an equivalent `COMPUTE`.

## Progress check

1. What does `COPY` actually do at compile time, and why can that cause two programs to silently disagree about a record's shape?
2. How are `CALL ... USING`'s arguments matched to a subprogram's `LINKAGE SECTION` parameters — by name or by position?
3. What ends a subprogram's execution and returns control to its caller — `STOP RUN` or `GOBACK`?
4. What does `PERFORM paragraph-1 THRU paragraph-3` actually guarantee about `paragraph-2`, even if it's never named in the `PERFORM` statement?
5. Why does GnuCOBOL's C interop work as directly as calling another COBOL subprogram?

### Answers

1. It textually includes the named file's contents at that point in the source, at compile time — if two programs `COPY` the same file but are compiled at different times relative to a change in that file, they can end up compiled against genuinely different record layouts with no compile-time link between them to catch the mismatch.
2. By position — argument order in `CALL ... USING` must match parameter order in `PROCEDURE DIVISION USING`, with matching `PIC` clauses; there's no name-based matching at all.
3. `GOBACK` — `STOP RUN` ends the entire running program (whether it's the main program or a called subprogram), while `GOBACK` returns control to whatever called the current program.
4. That it runs too — `PERFORM ... THRU` executes every paragraph physically between the two named paragraphs (inclusive), regardless of whether they're individually named in the `PERFORM` statement.
5. Because GnuCOBOL compiles COBOL source down to C before producing a native binary — calling a hand-written C function needs no special foreign-function interface layer; it's the same `CALL`/`USING` mechanism as calling another COBOL subprogram, just handing the C function raw pointers to each argument's storage.
