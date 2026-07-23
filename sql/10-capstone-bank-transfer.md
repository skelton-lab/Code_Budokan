# Module 10 — Capstone 4: A Bank Transfer

**Proves:** `BEGIN`/`COMMIT`/`ROLLBACK`, constraint enforcement, ACID in practice (Module 9).

The textbook demonstration of why transactions exist, built for real: a transfer between two accounts is two separate `UPDATE` statements — debit one, credit the other — and Module 9 already established, precisely, that SQLite does **not** automatically undo the first if the second fails. This capstone makes that failure mode actually happen, watches money briefly go missing mid-transaction, and then fixes it the only way Module 9 said it could be fixed: an explicit `ROLLBACK`. Every number below is a real, verified `sqlite3` run.

## The schema

```sql
CREATE TABLE accounts(
    id INTEGER PRIMARY KEY,
    owner TEXT NOT NULL,
    balance REAL NOT NULL CHECK(balance BETWEEN 0 AND 1000)
) STRICT;

INSERT INTO accounts(owner, balance) VALUES ('Alice', 100), ('Bob', 950);
```

A `CHECK` constraint enforcing both a floor (no negative balances — Module 1's pattern, extended) and, deliberately, a **cap** (`1000`) — an artificial but realistic stand-in for any real account limit (a credit ceiling, a regulatory cap, a fraud-prevention threshold). Bob starts at `950`, close enough to that cap to make it relevant.

## The happy path: a transfer within the cap

```sql
BEGIN;
UPDATE accounts SET balance = balance - 40 WHERE owner='Alice';
UPDATE accounts SET balance = balance + 40 WHERE owner='Bob';
COMMIT;
SELECT id, owner, balance FROM accounts;
SELECT sum(balance) AS total FROM accounts;
```

Verified output:

```
id  owner  balance
1   Alice  60.0
2   Bob    990.0

total
1050.0
```

Alice: `100 → 60`. Bob: `950 → 990`. Total money in the system: `1050.0`, unchanged from before the transfer (`100 + 950`) — money moved, none was created or destroyed. This is the property a transfer absolutely must preserve, and the easy case doesn't test whether the code actually preserves it under failure.

## The failure path: the credit exceeds the cap

```sql
BEGIN;
UPDATE accounts SET balance = balance - 100 WHERE owner='Alice';
UPDATE accounts SET balance = balance + 100 WHERE owner='Bob';
SELECT id, owner, balance FROM accounts;
```

Verified output — the second `UPDATE` fails (`Bob`'s balance would become `1050`, over the `1000` cap), and the `SELECT` runs immediately after, **inside the still-open transaction**:

```
Runtime error: CHECK constraint failed: balance BETWEEN 0 AND 1000

id  owner  balance
1   Alice  0.0
2   Bob    950.0
```

This is Module 9's exact warning, now with real stakes: **Alice's debit succeeded** (`100 → 0`) and **Bob's credit failed** — the total money visible in the system at this exact moment is `0 + 950 = 950`, not `1050`. `$100` has, temporarily, vanished — not destroyed, but sitting in neither account, because the transaction is genuinely, verifiably in a partial, inconsistent state, exactly as Module 9 predicted for any transaction that doesn't get an explicit `ROLLBACK` on failure.

## The fix: `ROLLBACK` restores consistency

```sql
BEGIN;
UPDATE accounts SET balance = balance - 100 WHERE owner='Alice';
UPDATE accounts SET balance = balance + 100 WHERE owner='Bob';
ROLLBACK;
SELECT id, owner, balance FROM accounts;
SELECT sum(balance) AS total FROM accounts;
```

Verified output:

```
id  owner  balance
1   Alice  100.0
2   Bob    950.0

total
1050.0
```

Both accounts back to their exact pre-transfer values, total restored to `1050.0` — the `ROLLBACK`, issued explicitly after detecting the second `UPDATE`'s failure, is what actually closes the gap Module 9 warned about. Nothing about SQLite did this automatically; the application-level discipline of checking for the error and issuing `ROLLBACK` is the entire mechanism.

> **Pitfall:** this capstone's failure was deliberately triggered by a `CHECK` constraint (the cap) to make it easy to reproduce on demand — but the identical partial-state risk exists for *any* reason a statement inside a transaction might fail: a `NOT NULL` violation, a foreign key violation (Module 9's other lesson — only relevant at all if `PRAGMA foreign_keys = ON;` was set on this connection), a disk-full error, an application crash between the two `UPDATE`s. The fix is the same regardless of *why* the second statement failed: never assume a multi-statement transaction cleaned up after itself; check, and `ROLLBACK` explicitly on any failure.

## Practice

- Wrap this capstone's transfer logic in a version that checks the source account's balance *before* attempting the debit (`SELECT balance FROM accounts WHERE owner='Alice'`) rather than relying on the `CHECK` constraint to catch an insufficient-funds transfer after the fact — is checking first, catching-and-rolling-back after, or doing both together the more robust real-world pattern, and why?
- Add a third account and write a transfer that moves money through all three (Alice → Bob → Carol) as one single transaction — confirm that a failure on the *second* leg (Bob → Carol) still requires rolling back the *first* leg (Alice → Bob) to restore full consistency, since Module 9 already established that success earlier in a transaction doesn't get undone automatically just because something later in the same transaction failed.
- Verify directly: does `PRAGMA foreign_keys = ON;` (Module 9) have any bearing on this capstone's `CHECK` constraint failures at all, or are `CHECK` and `FOREIGN KEY` two entirely independent enforcement mechanisms?
