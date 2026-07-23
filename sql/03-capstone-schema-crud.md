# Module 3 — Capstone 1: A Task Tracker Schema

**Proves:** type affinity vs. `STRICT`, `PRIMARY KEY`, `NOT NULL`/`UNIQUE`/`CHECK`, `INSERT`/`UPDATE`/`DELETE`, `SELECT`/`WHERE`/`ORDER BY`/`LIMIT` (Modules 1–2).

A small task-tracker table — the kind of schema a real to-do or project-tracking tool would actually use — built as a single `STRICT` table with every constraint type from Module 1 doing real work, then exercised through a full create/read/update/delete lifecycle. Every statement below is a real, verified `sqlite3` run.

## The schema

```sql
CREATE TABLE tasks(
    id INTEGER PRIMARY KEY,
    title TEXT NOT NULL CHECK(length(title) >= 3),
    status TEXT NOT NULL CHECK(status IN ('todo','in_progress','done')) DEFAULT 'todo',
    priority INTEGER NOT NULL CHECK(priority BETWEEN 1 AND 5) DEFAULT 3,
    due_date TEXT
) STRICT;
```

Five constraints doing genuinely different jobs: `PRIMARY KEY` (identity, Module 1's rowid alias), `NOT NULL` on `title` (every task needs one), a `CHECK` enforcing a minimum title length, a `CHECK ... IN (...)` restricting `status` to exactly three valid values (SQL's version of an enum, with no dedicated enum type of its own), a `CHECK ... BETWEEN` bounding `priority`, and `STRICT` (Module 1's stronger guarantee) so a caller can't quietly store the wrong type in any column. `DEFAULT` values mean `status` and `priority` don't have to be supplied on every insert.

## Populating it

```sql
INSERT INTO tasks(title, priority, due_date) VALUES
    ('Write SQL guide', 5, '2026-07-25'),
    ('Review Prolog guide', 3, '2026-07-20'),
    ('Fix build pipeline', 4, NULL);
INSERT INTO tasks(title, status, priority, due_date) VALUES
    ('Deploy release', 'in_progress', 5, '2026-07-22');
```

Verified output:

```
id  title                 status       priority  due_date
1   Write SQL guide       todo         5         2026-07-25
2   Review Prolog guide   todo         3         2026-07-20
3   Fix build pipeline    todo         4
4   Deploy release        in_progress  5         2026-07-22
```

The first three rows correctly default to `status = 'todo'`, since none supplied one; the fourth explicitly overrides it. `Fix build pipeline`'s `due_date` is correctly `NULL` — nothing requires every task to have one.

## Every constraint, verified as actually rejecting bad data

```sql
INSERT INTO tasks(title, status) VALUES ('ok task', 'bogus_status');
-- CHECK constraint failed: status IN ('todo','in_progress','done')

INSERT INTO tasks(title, priority) VALUES ('ok task', 9);
-- CHECK constraint failed: priority BETWEEN 1 AND 5

INSERT INTO tasks(title) VALUES ('ab');
-- CHECK constraint failed: length(title) >= 3

INSERT INTO tasks(title, priority) VALUES ('ok task', 'high');
-- cannot store TEXT value in INTEGER column tasks.priority
```

All four verified directly, each rejected with the specific, correct error — including the last one, which only fails *because* this table is `STRICT`; the identical insert against a non-`STRICT` version of this schema (Module 1's first pitfall) would have silently stored the text `'high'` in the `priority` column instead.

## A realistic query, update, and delete

```sql
SELECT title, priority, due_date FROM tasks
WHERE due_date IS NOT NULL AND due_date < '2026-07-23'
ORDER BY priority DESC;
```

Verified output:

```
title                 priority  due_date
Deploy release        5         2026-07-22
Review Prolog guide   3         2026-07-20
```

Two things worth noting: `due_date IS NOT NULL` correctly excludes `Fix build pipeline` (no due date at all) before the date comparison even runs — comparing `NULL < '2026-07-23'` would itself just evaluate to `NULL`, neither true nor false, so an unfiltered version of this query would silently drop that row anyway, but the explicit `IS NOT NULL` makes the intent visible rather than relying on that behavior implicitly. And `due_date < '2026-07-23'` works as a genuine date comparison despite `due_date` being a `TEXT` column — ISO-8601 dates (`YYYY-MM-DD`) sort correctly as plain strings, which is exactly why that format is the standard convention for storing dates in a column that's really just text underneath.

```sql
UPDATE tasks SET status='done' WHERE id=2;
DELETE FROM tasks WHERE status='done';
SELECT id, title FROM tasks;
```

Verified output: `Review Prolog guide` (`id=2`) is marked done, then correctly removed by the following `DELETE` — the remaining rows are exactly `Write SQL guide`, `Fix build pipeline`, and `Deploy release`, in that order.

> **Pitfall:** `due_date`'s string-based date comparison only works correctly because every value follows ISO-8601 format consistently — a single row stored as `'07/22/2026'` instead of `'2026-07-22'` would compare *lexicographically* against the others (comparing the string `'07/22/2026'` character by character against `'2026-07-20'`), producing a nonsensical ordering with no error to flag it, since both are just valid `TEXT` values as far as this schema's `STRICT` typing is concerned. `STRICT` enforces *type* (this column must hold text), not *format* — a `CHECK` constraint validating the date's shape would be the way to close that specific gap, not something this table currently has.

## Practice

- Add a `CHECK` constraint to `due_date` requiring it to either be `NULL` or match the pattern `YYYY-MM-DD` (hint: `due_date IS NULL OR (length(due_date) = 10 AND due_date LIKE '____-__-__')`), and confirm a malformed date like `'07/22/2026'` is now correctly rejected.
- Write the `SELECT ... WHERE status != 'done'` query that should run *before* any bulk `DELETE FROM tasks WHERE status='done';`, per Module 2's no-`WHERE`-danger pitfall, and confirm its row count matches what the `DELETE` actually removes.
- Add a fifth task with `priority` omitted entirely, and confirm it correctly receives the schema's `DEFAULT 3`.
