# Capstone 4 — Modular Billing System

Combines every concept from Module 10: a shared copybook record used by two separately-compiled programs, `CALL`/`USING` between them, and `PERFORM THRU` structuring the main program's flow — closing out this guide's "maintain" promise by building something genuinely split across files the way a real production COBOL system is.

## The shared copybook

`billrec.cpy` — one record layout, used identically by both programs below, so a billing subprogram and its caller can never silently disagree about the record's shape as long as both are recompiled from the same copybook:

```cobol
       01  BILL-RECORD.
           05  BR-CUST-ID       PIC 9(5).
           05  BR-CUST-NAME     PIC X(20).
           05  BR-USAGE-UNITS   PIC 9(5).
           05  BR-RATE          PIC 9(2)V99.
           05  BR-AMOUNT        PIC 9(7)V99.
```

## The billing subprogram

```cobol
       IDENTIFICATION DIVISION.
       PROGRAM-ID. BILLCALC.
       DATA DIVISION.
       LINKAGE SECTION.
       COPY "billrec.cpy".
       PROCEDURE DIVISION USING BILL-RECORD.
           COMPUTE BR-AMOUNT ROUNDED =
                   BR-USAGE-UNITS * BR-RATE.
           IF BR-USAGE-UNITS > 500
               COMPUTE BR-AMOUNT ROUNDED = BR-AMOUNT * 0.9
           END-IF.
           GOBACK.
```

Note `COPY "billrec.cpy"` inside a `LINKAGE SECTION` here, rather than `WORKING-STORAGE` — the copybook works identically either way, since `COPY` is just textual inclusion regardless of which section it lands in.

## The main program

```cobol
       IDENTIFICATION DIVISION.
       PROGRAM-ID. BILLMAIN.
       DATA DIVISION.
       WORKING-STORAGE SECTION.
       COPY "billrec.cpy".
       01  WS-EDITED-AMOUNT     PIC $$$,$$9.99.
       PROCEDURE DIVISION.
           PERFORM PRINT-HEADER THRU PRINT-FOOTER.
           STOP RUN.

       PRINT-HEADER.
           DISPLAY "===== Billing Report =====".

       PROCESS-CUSTOMERS.
           MOVE 10001 TO BR-CUST-ID.
           MOVE "Ada Lovelace" TO BR-CUST-NAME.
           MOVE 200 TO BR-USAGE-UNITS.
           MOVE 12.50 TO BR-RATE.
           CALL "BILLCALC" USING BILL-RECORD.
           MOVE BR-AMOUNT TO WS-EDITED-AMOUNT.
           DISPLAY BR-CUST-NAME " units=" BR-USAGE-UNITS
                   " bill=" WS-EDITED-AMOUNT.

           MOVE 10002 TO BR-CUST-ID.
           MOVE "Grace Hopper" TO BR-CUST-NAME.
           MOVE 600 TO BR-USAGE-UNITS.
           MOVE 12.50 TO BR-RATE.
           CALL "BILLCALC" USING BILL-RECORD.
           MOVE BR-AMOUNT TO WS-EDITED-AMOUNT.
           DISPLAY BR-CUST-NAME " units=" BR-USAGE-UNITS
                   " bill=" WS-EDITED-AMOUNT
                   " (bulk discount applied)".

       PRINT-FOOTER.
           DISPLAY "===== End of Report =====".
```

`PERFORM PRINT-HEADER THRU PRINT-FOOTER` runs all three paragraphs — `PRINT-HEADER`, then falling through into `PROCESS-CUSTOMERS` (never named directly in the `PERFORM`), then `PRINT-FOOTER` — exactly the fall-through mechanics Module 10 verified directly.

## Verification

```bash
$ cobc -x -o billmain billmain.cbl billcalc.cbl
$ ./billmain
===== Billing Report =====
Ada Lovelace         units=00200 bill= $2,500.00
Grace Hopper         units=00600 bill= $6,750.00 (bulk discount applied)
===== End of Report =====
```

Verified by hand: Ada's bill is `200 * 12.50 = 2500.00` exactly, no discount (`200` units is below the `500`-unit threshold `BILLCALC` checks). Grace's bill starts at `600 * 12.50 = 7500.00`, then the `> 500` branch fires, applying the `0.9` discount factor: `7500.00 * 0.9 = 6750.00` — exactly what's displayed, confirming the discount logic actually executed inside the separately-compiled subprogram, not just that the call didn't crash.

> **Pitfall:** `BILLMAIN` and `BILLCALC` are compiled as two separate `.cbl` files, linked together in one `cobc` invocation — if `billrec.cpy` changes and only one of the two programs gets recompiled against the new version, the two programs' in-memory record layouts silently disagree the moment they're linked together and run, exactly the copybook-drift pitfall Module 10 named directly.

## Optional extension: a C subroutine in the same system

GnuCOBOL's C interop (Module 10) means one of this modular system's "subprograms" doesn't have to be COBOL at all. A late-fee calculator, written in plain C:

```c
#include <string.h>
#include <stdio.h>
#include <stdlib.h>

void apply_late_fee(unsigned char *amount, unsigned char *fee) {
    char abuf[8], fbuf[8];
    memcpy(abuf, amount, 7); abuf[7] = '\0';
    memcpy(fbuf, fee, 7);    fbuf[7] = '\0';
    long a = atol(abuf);
    long f = atol(fbuf);
    long total = a + f;
    char result[8];
    snprintf(result, sizeof(result), "%07ld", total);
    memcpy(amount, result, 7);
}
```

```cobol
       CALL "apply_late_fee" USING WS-AMOUNT WS-LATE-FEE.
```

```
$ cobc -x -o billmainc billmainc.cbl apply_late_fee.c && ./billmainc
Before late fee: 02500.00
After late fee (via C):  $2,515.00
```

Verified directly: `2500.00 + 15.00 = 2515.00` — a real design choice this modular system could genuinely make, not a toy demo: a numeric-heavy helper routine implemented in C and called exactly like any other subprogram, since GnuCOBOL's whole compilation pipeline already goes through C.

## Extending it yourself

- Add a third customer whose usage sits exactly at the `500`-unit boundary and confirm, by reading `BILLCALC`'s own `IF` condition, whether the discount applies at exactly `500` or only above it.
- Wire `apply_late_fee` into `BILLMAIN`'s `PROCESS-CUSTOMERS` paragraph for customers whose bill exceeds some threshold, combining both extension styles in one program.
