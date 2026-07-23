# Capstone 3 — Customer Master File Maintenance

Combines every concept from Module 8: an indexed customer master file updated by a batch of transactions, each transaction record parsed via `REDEFINES` rather than delimiters, with `WRITE`/`READ`/`REWRITE`/`DELETE` all guarded by `INVALID KEY`.

## The transaction file format

Each line of `transactions.dat` is a fixed-width, 33-character record: a 1-character action code (`A`dd/`U`pdate/`D`elete), a 5-digit customer ID, a 20-character name (used only for `A`), and a 7-digit amount (`PIC 9(5)V99`, no literal decimal point — Module 5's own verified lesson about implied decimals applies here too).

```cobol
       FD  TRANS-FILE.
       01  TRANS-RECORD         PIC X(33).
       01  TRANS-FIELDS REDEFINES TRANS-RECORD.
           05  TR-ACTION        PIC X.
           05  TR-ID            PIC 9(5).
           05  TR-NAME          PIC X(20).
           05  TR-AMOUNT        PIC 9(5)V99.
```

Reading the whole record into `TRANS-RECORD` as one 33-character block, then viewing it through `TRANS-FIELDS`' `REDEFINES`, is a genuinely different technique from Capstone 2's `SORT`-and-delimited-by-position approach — no delimiter characters at all, just fixed column positions, which is exactly how a huge amount of real legacy COBOL data is actually laid out.

## The program

```cobol
       IDENTIFICATION DIVISION.
       PROGRAM-ID. MASTERMAINT.
       ENVIRONMENT DIVISION.
       INPUT-OUTPUT SECTION.
       FILE-CONTROL.
           SELECT CUSTOMER-FILE ASSIGN TO "custmaster.dat"
               ORGANIZATION IS INDEXED
               ACCESS MODE IS RANDOM
               RECORD KEY IS CUST-ID.
           SELECT TRANS-FILE ASSIGN TO "transactions.dat"
               ORGANIZATION IS LINE SEQUENTIAL.
       DATA DIVISION.
       FILE SECTION.
       FD  CUSTOMER-FILE.
       01  CUSTOMER-RECORD.
           05  CUST-ID          PIC 9(5).
           05  CUST-NAME        PIC X(20).
           05  CUST-BALANCE     PIC 9(7)V99.
       FD  TRANS-FILE.
       01  TRANS-RECORD         PIC X(33).
       01  TRANS-FIELDS REDEFINES TRANS-RECORD.
           05  TR-ACTION        PIC X.
           05  TR-ID            PIC 9(5).
           05  TR-NAME          PIC X(20).
           05  TR-AMOUNT        PIC 9(5)V99.
       WORKING-STORAGE SECTION.
       01  WS-TRANS-EOF         PIC X VALUE "N".
           88  WS-NO-MORE-TRANS         VALUE "Y".
       01  WS-RESULT            PIC X(20).
       01  WS-DETAIL            PIC X(30).
       01  WS-EDITED-BAL        PIC $$$,$$9.99.
       PROCEDURE DIVISION.
           OPEN OUTPUT CUSTOMER-FILE.
           CLOSE CUSTOMER-FILE.
           OPEN I-O CUSTOMER-FILE.
           OPEN INPUT TRANS-FILE.

           PERFORM UNTIL WS-NO-MORE-TRANS
               READ TRANS-FILE
                   AT END
                       SET WS-NO-MORE-TRANS TO TRUE
                   NOT AT END
                       PERFORM APPLY-TRANSACTION
                       DISPLAY WS-RESULT " id=" TR-ID " "
                               FUNCTION TRIM(WS-DETAIL)
               END-READ
           END-PERFORM.

           CLOSE TRANS-FILE.
           CLOSE CUSTOMER-FILE.
           STOP RUN.

       APPLY-TRANSACTION.
           MOVE SPACES TO WS-DETAIL.
           EVALUATE TR-ACTION
               WHEN "A"
                   MOVE TR-ID TO CUST-ID
                   MOVE TR-NAME TO CUST-NAME
                   MOVE TR-AMOUNT TO CUST-BALANCE
                   WRITE CUSTOMER-RECORD
                       INVALID KEY
                           MOVE "ADD-FAILED" TO WS-RESULT
                       NOT INVALID KEY
                           MOVE "ADD-OK" TO WS-RESULT
                           MOVE TR-NAME TO WS-DETAIL
                   END-WRITE
               WHEN "U"
                   MOVE TR-ID TO CUST-ID
                   READ CUSTOMER-FILE
                       INVALID KEY
                           MOVE "UPDATE-FAILED" TO WS-RESULT
                       NOT INVALID KEY
                           ADD TR-AMOUNT TO CUST-BALANCE
                           REWRITE CUSTOMER-RECORD
                           MOVE "UPDATE-OK" TO WS-RESULT
                           MOVE CUST-BALANCE TO WS-EDITED-BAL
                           MOVE WS-EDITED-BAL TO WS-DETAIL
                   END-READ
               WHEN "D"
                   MOVE TR-ID TO CUST-ID
                   DELETE CUSTOMER-FILE
                       INVALID KEY
                           MOVE "DELETE-FAILED" TO WS-RESULT
                       NOT INVALID KEY
                           MOVE "DELETE-OK" TO WS-RESULT
                   END-DELETE
           END-EVALUATE.
```

Note the structural choice: `APPLY-TRANSACTION` is a separate paragraph, invoked with plain `PERFORM APPLY-TRANSACTION` (a single, non-inline `PERFORM` — a preview of Module 10's fuller treatment of paragraphs as call targets). Each branch sets `WS-RESULT`/`WS-DETAIL` rather than displaying directly, and the single `DISPLAY` after `PERFORM APPLY-TRANSACTION` handles output once — flattening what would otherwise be deeply, awkwardly nested `STRING` calls inside every `INVALID KEY` branch.

## Verification

Five transactions: add two customers, update one's balance, delete the other, then attempt to update a customer ID that was never created.

```
$ cobc -x -o mastermaint mastermaint.cbl && ./mastermaint
ADD-OK               id=10001 Ada Lovelace
ADD-OK               id=10002 Grace Hopper
UPDATE-OK            id=10001 $510.00
DELETE-OK            id=10002 
UPDATE-FAILED        id=19999
```

Verified by hand: customer `10001` started with a `500.00` balance (from the `A` transaction), the `U` transaction added `10.00`, giving `510.00` — exactly what's displayed. Customer `10002` was added, then successfully deleted. The final transaction, against ID `19999` — never added — correctly fails with `UPDATE-FAILED` rather than silently doing nothing or crashing.

> **Pitfall carried forward from Module 8:** the `U` and `D` branches both `MOVE TR-ID TO CUST-ID` before their `READ`/`DELETE` — without that, the indexed file operation would act on whatever key value happened to be left in `CUST-ID` from the *previous* transaction, not the one currently being processed. This is the fixed-width-record equivalent of forgetting to reset a loop variable.

## Extending it yourself

- Add a fourth transaction type, `"L"` (lookup, no modification), that reads and displays a customer without changing anything.
- Feed the program a transaction file where an `A` (add) uses a customer ID that already exists, and confirm `ADD-FAILED` fires as expected — indexed files enforce key uniqueness the same way SQL's `PRIMARY KEY` does.
