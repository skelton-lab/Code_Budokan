# Module 1 — Foundations: Schema and Types

SQL's declarative core — state what a table looks like, what must always be true of its rows, and let the database enforce it — starts here, along with the one genuinely SQLite-specific wrinkle worth knowing precisely before writing a single `CREATE TABLE`: this toolchain's types are looser than "SQL" generally implies. Every claim below is a real, verified `sqlite3` run. Feeds Capstone 1.

## `CREATE TABLE` and SQLite's type affinity

**You'll be able to:** declare a table with typed columns, and correctly predict what happens when a value doesn't match its column's declared type.

**Concept**

`CREATE TABLE` declares column names and types, the same shape as every SQL database — but SQLite's actual behavior here is a real, named divergence from the PostgreSQL/MySQL norm this series' `sql/11-beyond-this-guide.md` treats honestly rather than glossing over: a declared column type in SQLite is an **affinity**, a preference for how to store a value, not an enforced constraint. A value that doesn't match still gets stored — as whatever type it actually was.

```sql
CREATE TABLE t(id INTEGER, name TEXT, price REAL);
```

**Example**

```sql
INSERT INTO t VALUES (1, 'widget', 9.99);
INSERT INTO t VALUES ('not a number', 42, 'also not a number');
SELECT id, typeof(id), name, typeof(name), price, typeof(price) FROM t;
```

Verified output:

```
1|integer|widget|text|9.99|real
not a number|text|42|text|also not a number|text
```

The first row behaves exactly as expected. The second is the real point: `'not a number'` inserted into the `INTEGER`-affinity `id` column stays exactly as given — `typeof(id)` reports `text`, not an error and not a silent coercion — because SQLite can't losslessly convert that string to a number, so it stores what it was actually given. `42` inserted into the `TEXT`-affinity `name` column *does* get converted, to the text `'42'`, because that conversion is lossless. Affinity is a soft *preference*, applied when it can be, not a hard constraint enforced regardless.

> **Pitfall, and the single most important SQLite-specific fact in this guide:** code (or a mental model) carried over from a stricter SQL database will assume `INSERT INTO t VALUES ('not a number', ...)` against an `INTEGER` column either converts or errors. In SQLite it does neither by default — it silently stores a string in a column that looks, from the schema, like it should only ever hold integers. If a table genuinely needs enforced typing, SQLite 3.37+ supports `CREATE TABLE t(...) STRICT` — verified directly: the identical mismatched insert against a `STRICT` table correctly raises `cannot store TEXT value in INTEGER column`. This guide uses `STRICT` tables from here forward specifically to avoid teaching a habit that would misbehave the moment a reader points the same schema at PostgreSQL.

**Practice**

- Recreate the `t` table above with `STRICT` added, and confirm both inserts from the example now behave differently — one still succeeds, one now correctly errors.
- Predict, then verify, what `typeof(price)` reports for a row where `price` was inserted as the integer `10` rather than `10.0` — does `REAL` affinity convert it?

## Primary keys and rowids

**You'll be able to:** declare a primary key, and explain exactly how SQLite assigns new key values when none is given.

**Concept**

`INTEGER PRIMARY KEY` in SQLite isn't just a constraint — it's an alias for the table's own internal `rowid`, the integer SQLite already uses to physically identify every row. Leaving it out of an `INSERT` (or supplying `NULL` for it) makes SQLite assign the next available value automatically, computed fresh each time as **one more than whatever the current maximum rowid in the table happens to be** — which has a sharper consequence than "IDs never repeat" once deletions enter the picture.

**Example — deleting the current maximum, then inserting again**

```sql
CREATE TABLE t(id INTEGER PRIMARY KEY, name TEXT);
INSERT INTO t(name) VALUES ('a');
INSERT INTO t(name) VALUES ('b');
DELETE FROM t WHERE name='b';
INSERT INTO t(name) VALUES ('c');
SELECT * FROM t;
```

Verified output:

```
1|a
2|c
```

`'a'` got `id = 1`, `'b'` got `id = 2`. Deleting `'b'` removes the row holding the table's current maximum rowid entirely — so when `'c'` is inserted next, the current maximum (recomputed from what's actually left in the table) is `1`, and `'c'` gets `2`, **reusing** the value `'b'` just vacated. This is easy to get backwards on first guess (it certainly was on this guide's own first pass) — the rule isn't "track a high-water mark that only ever goes up," it's "one more than whatever's actually the highest row present right now."

**Example — deleting a middle row instead**

```sql
CREATE TABLE t(id INTEGER PRIMARY KEY, name TEXT);
INSERT INTO t(name) VALUES ('a');
INSERT INTO t(name) VALUES ('b');
INSERT INTO t(name) VALUES ('c');
DELETE FROM t WHERE name='b';
INSERT INTO t(name) VALUES ('d');
SELECT * FROM t;
```

Verified output:

```
1|a
3|c
4|d
```

Here `'b'` (`id = 2`) is a *middle* row, not the current maximum — deleting it doesn't lower the table's maximum at all (`'c'`, at `id = 3`, is still there), so `'d'` correctly gets `4`, and `id = 2` stays permanently unused for the rest of this table's life. The reuse behavior from the first example is specifically about the *maximum* rowid being deleted, not deletion in general.

> **Pitfall, verified precisely and corrected from this guide's own first draft:** it's tempting to assume SQLite's default rowid behavior "never reuses a deleted ID" — true for a middle-row deletion, false for a maximum-row deletion, and the difference is easy to miss without testing both cases directly, which is exactly what caught this guide's own first-draft error. If strict, no-reuse-ever-under-any-circumstances IDs are specifically required, SQLite's `AUTOINCREMENT` keyword provides that stronger guarantee, tracked in a separate internal `sqlite_sequence` table rather than recomputed from the current maximum each time — verified directly: rerunning the first example above with `id INTEGER PRIMARY KEY AUTOINCREMENT` instead gives `'c'` an id of `3`, not the reused `2`. This guide's capstones don't need that stronger guarantee, since none of them depend on a deleted ID never reappearing.

**Practice**

- Predict, then verify, what happens if every row in a table is deleted and a new one is then inserted — with plain `INTEGER PRIMARY KEY`, does the new row's id restart from `1`, or continue from the old maximum?
- Explain why an `INTEGER PRIMARY KEY` column is a special case, specifically, compared to declaring `id INTEGER UNIQUE` instead — what capability does aliasing the rowid provide that a unique index alone wouldn't?

## `NOT NULL`, `UNIQUE`, and `CHECK`

**You'll be able to:** declare column-level constraints and predict exactly which insert they'll reject.

**Concept**

Beyond types (loose, per the first session) and primary keys (identity), SQLite enforces three real, unconditional constraints the moment a row would violate them: `NOT NULL` (a column may never hold `NULL`), `UNIQUE` (no two rows may share a value in this column), and `CHECK(expression)` (a row-level boolean condition that must hold for every row).

**Example**

```sql
CREATE TABLE t(id INTEGER PRIMARY KEY, name TEXT NOT NULL, age INTEGER CHECK(age >= 0));
INSERT INTO t(name, age) VALUES (NULL, 5);
```

Verified: `NOT NULL constraint failed: t.name`.

```sql
INSERT INTO t(name, age) VALUES ('bob', -5);
```

Verified, against the same table: `CHECK constraint failed: age >= 0`.

```sql
CREATE TABLE u(email TEXT UNIQUE);
INSERT INTO u VALUES ('a@b.com');
INSERT INTO u VALUES ('a@b.com');
```

Verified: the second, duplicate insert fails with `UNIQUE constraint failed: u.email`; the first succeeds.

> **Pitfall:** `UNIQUE` and `PRIMARY KEY` both build an index and both reject duplicates, which makes it easy to treat them as interchangeable — they aren't quite. A table may have at most one primary key (built into the rowid, per the previous session) but any number of separate `UNIQUE` columns, and unlike `NOT NULL`, a `UNIQUE` column *can* hold multiple `NULL`s — SQLite (matching the SQL standard here) treats `NULL` as never equal to another `NULL`, even for uniqueness purposes, so two rows with `email = NULL` don't violate the constraint above the way two rows with the identical real address would.

**Practice**

- Verify the previous pitfall's claim directly: insert two rows with `email = NULL` into the `u` table above and confirm both succeed.
- Add a `CHECK` constraint requiring `name` to be at least 2 characters long (`length(name) >= 2`), and confirm a one-character name is correctly rejected.

## Progress check

1. What does a column's declared type actually mean in SQLite by default — a guarantee, or something weaker?
2. What did `typeof(id)` report for the row where `'not a number'` was inserted into an `INTEGER`-affinity column, and why didn't SQLite reject or convert it?
3. What does adding `STRICT` to a `CREATE TABLE` statement change, verified directly?
4. Deleting `'b'` (`id = 2`) caused the next insert to reuse `id = 2` in the first rowid example, but deleting `'b'` (also `id = 2`) in the second example left `id = 2` permanently unused. What's the one structural difference between the two deletions that explains it?
5. What's the real difference between `PRIMARY KEY` and `UNIQUE`, beyond "both reject duplicates"?
6. Why can a `UNIQUE` column hold more than one `NULL` value without violating the constraint?

### Answers

1. Something weaker — an affinity, a preference for how to store a value when a lossless conversion is possible, not an enforced guarantee that only values of that type can ever be stored.
2. It reported `text` — SQLite couldn't losslessly convert the string `'not a number'` into a number, so it stored the value exactly as given rather than erroring or forcing a conversion; affinity only converts when it safely can.
3. It makes the table enforce declared types strictly — the identical insert that silently succeeded (storing a text value in an integer-affinity column) against an ordinary table correctly raises an error against a `STRICT` one.
4. In the first example, `'b'` held the table's current *maximum* rowid at the moment it was deleted, so the next insert's "one more than the current maximum" computation dropped back down and reused `2`. In the second example, `'c'` (a higher rowid) was still present after `'b'` was deleted, so the current maximum never changed, and the next insert continued past it instead of reusing `2`. The rule is always "one more than whatever's currently the highest row present" — it just produces reuse only when the deleted row happened to be that highest row.
5. A table can have only one `PRIMARY KEY`, and (for an `INTEGER PRIMARY KEY` specifically) it's an alias for the table's own internal rowid, not just an index. A table can have any number of separate `UNIQUE` columns, each building its own index, with no special relationship to the rowid.
6. Because SQL's `NULL` is never considered equal to another `NULL`, even for the purposes of a uniqueness check — two rows both holding `NULL` in a `UNIQUE` column aren't treated as "the same value duplicated," so the constraint has nothing to reject.
