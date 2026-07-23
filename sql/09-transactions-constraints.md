# Module 9 — Transactions and Constraints

What actually happens to a group of statements when one of them fails partway through, and a real, verified SQLite-specific trap that would otherwise silently undermine every foreign key this guide has written so far. Every claim below is a real, verified `sqlite3` run. Feeds Capstone 4.

## `BEGIN`, `COMMIT`, `ROLLBACK`

**You'll be able to:** group several statements into one atomic unit, and undo all of them if something goes wrong.

**Concept**

`BEGIN` starts a transaction — every statement after it is provisional until `COMMIT` makes the changes permanent, or `ROLLBACK` discards every change made since `BEGIN` as if none of it happened.

**Example**

```sql
CREATE TABLE t(id INTEGER PRIMARY KEY, val INTEGER);
INSERT INTO t VALUES (1, 100);
BEGIN;
UPDATE t SET val = 200 WHERE id=1;
COMMIT;
SELECT * FROM t;
```

Verified: `1|200` — the update, wrapped in `BEGIN`/`COMMIT`, persisted.

```sql
BEGIN;
UPDATE t SET val = 200 WHERE id=1;
ROLLBACK;
SELECT * FROM t;
```

Verified, run against a fresh `val = 100` row: `1|100` — the identical update, this time wrapped in `BEGIN`/`ROLLBACK`, is completely undone. As far as any query after the `ROLLBACK` can tell, the `UPDATE` never happened.

**Practice**

- Run three `UPDATE` statements inside one `BEGIN`/`ROLLBACK` pair and confirm all three are undone together, not just the last one.

## What actually happens when a statement inside a transaction fails

**You'll be able to:** predict, precisely, what state a transaction is left in after one of its statements violates a constraint — not what "should" happen, what SQLite actually does.

**Concept**

This is a real, easy-to-assume-wrong detail: a failed statement inside a `BEGIN`/`COMMIT` block does **not** automatically roll back the whole transaction in SQLite. The failing statement itself is rejected; every change already made earlier in the same transaction stays applied, and the transaction stays open, waiting for an explicit `COMMIT` (accepting the partial state) or `ROLLBACK` (discarding it).

**Example**

```sql
CREATE TABLE t(id INTEGER PRIMARY KEY, val INTEGER CHECK(val >= 0));
INSERT INTO t VALUES (1, 100), (2, 50);
BEGIN;
UPDATE t SET val = val - 30 WHERE id=1;   -- succeeds: 100 - 30 = 70
UPDATE t SET val = val - 100 WHERE id=2;  -- fails: 50 - 100 = -50, violates CHECK
SELECT id, val FROM t;
```

Verified output, run immediately after the failed second `UPDATE`, **still inside the open transaction**:

```
1  70
2  50
```

The first `UPDATE` (`id = 1`) genuinely succeeded and is reflected here — `70`, not `100`. The second failed and left `id = 2` at its original `50`, not some corrupted intermediate value. Nothing rolled back automatically. Continuing the exact same session with an explicit `ROLLBACK`:

```sql
ROLLBACK;
SELECT id, val FROM t;
```

Verified: `1|100`, `2|50` — *now* both rows are back to their pre-transaction values, because `ROLLBACK` was issued explicitly.

> **Pitfall, and the entire reason Capstone 4 exists:** code that assumes "an error inside a transaction automatically undoes everything" and doesn't issue its own `ROLLBACK` on failure will leave a transaction sitting open with a genuinely partial, inconsistent state — exactly the situation Capstone 4's bank transfer needs to guard against explicitly, not assume the database handles for free. The discipline this demands: **catch the error yourself, and issue `ROLLBACK` yourself** — SQLite gives you the primitive, not the automatic behavior.

**Practice**

- Reproduce this exact sequence, but `COMMIT` instead of `ROLLBACK` after the failed second `UPDATE` — confirm the partial state (`id=1` at `70`, `id=2` still at `50`) becomes permanent, which is almost certainly not what a caller who didn't check for the error actually wanted.

## Foreign keys: off by default, and a real trap

**You'll be able to:** correctly enable foreign key enforcement, and explain precisely why a `REFERENCES` clause alone doesn't guarantee anything.

**Concept**

Every `REFERENCES` clause this guide has written since Module 4 (`orders.customer_id REFERENCES customers(id)`) has been declaring *intent*, not enforcing anything by itself — SQLite ships with foreign key enforcement **off by default**, and it must be turned on explicitly, **per connection**, with `PRAGMA foreign_keys = ON;`.

**Example**

```sql
CREATE TABLE p(id INTEGER PRIMARY KEY);
CREATE TABLE c(id INTEGER, pid INTEGER REFERENCES p(id));
INSERT INTO c VALUES (1, 99);  -- pid=99 doesn't exist in p at all
```

Verified: this **succeeds**, silently, with no pragma set — `PRAGMA foreign_keys;` on a fresh connection reports `0`. The `REFERENCES p(id)` clause changed nothing about whether this insert was accepted.

```sql
PRAGMA foreign_keys = ON;
INSERT INTO c VALUES (1, 99);
```

Verified, with the pragma set first: `FOREIGN KEY constraint failed` — the identical insert, now correctly rejected.

> **Pitfall, verified precisely and genuinely dangerous:** the pragma is **per-connection**, not a property of the database file itself. Verified directly: turning it `ON` in one `sqlite3` session, then opening the *same* database file in a brand-new connection, reports `PRAGMA foreign_keys` back to `0` — the setting didn't persist, and the same previously-rejected dangling insert succeeds again in the new connection. Every one of this guide's earlier modules (4 through 8) that declared a `REFERENCES` clause was, by SQLite's actual default behavior, not enforcing it at all unless the specific connection running those queries had explicitly turned the pragma on first. Real applications set `PRAGMA foreign_keys = ON;` as the first statement of every single connection they open, precisely because forgetting it even once silently reopens every foreign-key gap this guide's schemas were written to prevent.

**Practice**

- Confirm directly: with `PRAGMA foreign_keys = ON;` set, does `DELETE FROM p WHERE id = 1;` succeed if row `c(1, 1)` still references it, or does it correctly fail the same way the dangling insert did?
- Write the exact one-line pragma statement that should be the very first thing run against this guide's Capstone 4 database, before any transfer logic at all.

## Progress check

1. What does `ROLLBACK` undo, precisely — everything ever done to the database, or something more specific?
2. When a statement inside an open `BEGIN`/`COMMIT` transaction fails a `CHECK` constraint, what happens to statements that already succeeded earlier in the same transaction?
3. What's the practical consequence of SQLite not automatically rolling back a transaction on a mid-transaction failure?
4. What does `PRAGMA foreign_keys;` report on a brand-new connection, by default, verified directly?
5. Why did the dangling-reference insert succeed even though `pid INTEGER REFERENCES p(id)` was declared in the schema?
6. Why is turning `PRAGMA foreign_keys = ON;` on once, in one session, not sufficient for a real application that opens multiple connections over its lifetime?

### Answers

1. Every change made since the most recent `BEGIN` — not the database's entire history, just the current, still-open transaction's uncommitted changes.
2. They remain applied — verified directly: the first `UPDATE` in the example (`id=1`, `100 → 70`) stayed at `70` even after the second `UPDATE` failed, with no automatic rollback of the whole transaction.
3. Application code must explicitly check for errors and issue its own `ROLLBACK` on failure — assuming the database automatically undoes a partially-failed transaction is wrong, and would leave genuinely inconsistent partial state committed if the code just moves on (or issues `COMMIT`) without checking.
4. `0` — foreign key enforcement is off by default on every new connection, verified directly.
5. Because `REFERENCES` alone declares intent, not enforcement — SQLite only actually checks foreign key constraints when `PRAGMA foreign_keys = ON;` has been set on the specific connection running the insert, which it hadn't been in that example.
6. Because the pragma is a per-connection setting, not saved into the database file itself — verified directly: a brand-new connection to the identical, already-`PRAGMA`'d database reports `foreign_keys` back to `0`, meaning every new connection has to set it again, or its foreign key constraints are silently unenforced for that connection's entire lifetime.
