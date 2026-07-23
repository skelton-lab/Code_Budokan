# Module 2 — CRUD and Basic Queries

The four operations every schema exists to support — Create, Read, Update, Delete — plus enough of `SELECT`'s filtering and ordering vocabulary to make `Read` actually useful. Every query below is a real, verified `sqlite3` run against the same small `products` table. Feeds Capstone 1.

## `INSERT`: creating rows

**You'll be able to:** insert one or several rows in a single statement.

**Concept**

`INSERT INTO table(columns) VALUES (...)` — naming columns explicitly (rather than relying on declaration order) is the safer habit this guide uses throughout, since it keeps working correctly even if the table's column order ever changes. A single `INSERT` can supply several rows at once, separated by commas.

**Example**

```sql
CREATE TABLE products(id INTEGER PRIMARY KEY, name TEXT NOT NULL, price REAL NOT NULL, category TEXT);
INSERT INTO products(name, price, category) VALUES
    ('Widget', 9.99, 'hardware'),
    ('Gadget', 19.99, 'hardware'),
    ('Gizmo', 14.50, 'electronics'),
    ('Doohickey', 4.25, 'hardware');
SELECT * FROM products;
```

Verified output:

```
id  name       price  category
1   Widget     9.99   hardware
2   Gadget     19.99  hardware
3   Gizmo      14.5   electronics
4   Doohickey  4.25   hardware
```

Four rows, one statement, `id` auto-assigned via Module 1's rowid rule (each new row gets one more than the current maximum, so `1` through `4` in insertion order here since nothing's been deleted yet).

**Practice**

- Insert a fifth product with no `category` given, and confirm — using Module 1's `NOT NULL` knowledge — that `category` is allowed to be absent (it wasn't declared `NOT NULL` above) while `name` and `price` are not.

## `SELECT`: filtering, ordering, and limiting

**You'll be able to:** write a `WHERE` clause using comparison, range, set-membership, and pattern-matching conditions, and control result order and count.

**Concept**

`SELECT columns FROM table WHERE condition ORDER BY column [ASC|DESC] LIMIT n` — `WHERE` filters *before* any ordering or limiting happens, so `LIMIT 2` after `ORDER BY price DESC` genuinely means "the two highest-priced matching rows," not "the first two rows found, then sorted."

**Example**

```sql
SELECT name, price FROM products WHERE category='hardware' ORDER BY price DESC LIMIT 2;
```

Verified output:

```
name    price
Gadget  19.99
Widget  9.99
```

Correctly the two most expensive *hardware* items specifically — `Doohickey` (also hardware, at `4.25`) is excluded by the `LIMIT`, and `Gizmo` (more expensive than `Widget` at `14.50`) is correctly excluded entirely, since it's `electronics`, not `hardware` — `WHERE` ran first.

Three more condition forms, all verified against the same table:

```sql
SELECT name FROM products WHERE name LIKE 'G%';
-- Gadget, Gizmo

SELECT name FROM products WHERE category IN ('hardware','electronics');
-- Widget, Gadget, Gizmo, Doohickey  (all four — every row matches one of the two categories)

SELECT name FROM products WHERE price BETWEEN 5 AND 15;
-- Widget, Gizmo
```

`LIKE 'G%'` pattern-matches (`%` is any-length wildcard, `_` would be exactly-one-character), `IN (...)` checks set membership, `BETWEEN a AND b` is an inclusive range check — verified directly: `Widget` at exactly `9.99` and `Gizmo` at `14.50` both match a `5`–`15` range, while `Gadget` (`19.99`, above) and `Doohickey` (`4.25`, below) are correctly excluded.

**Practice**

- Write a query returning every product whose name contains the letter `o` anywhere (hint: `%` on both sides of the pattern), and confirm it correctly matches `Doohickey` and `Gizmo` but not `Widget` or `Gadget`.
- Predict, then verify, whether `BETWEEN` includes its endpoints exactly — is a product priced at exactly `5.00` included by `WHERE price BETWEEN 5 AND 15`?

## `UPDATE` and `DELETE`: the two operations `WHERE` protects you from

**You'll be able to:** modify or remove specific rows, and explain precisely what happens if `WHERE` is omitted.

**Concept**

`UPDATE table SET column = expression WHERE condition` and `DELETE FROM table WHERE condition` both apply to *every row matching the condition* — including, if the condition is left off entirely, every row in the table, unconditionally. Nothing about either statement's syntax requires a `WHERE` clause; nothing warns if one is missing.

**Example**

```sql
UPDATE products SET price = price * 1.1 WHERE category='hardware';
SELECT name, price FROM products;
```

Verified output:

```
name       price
Widget     10.989
Gadget     21.989
Gizmo      14.5
Doohickey  4.675
```

Every `hardware` price increased by 10% (`price` on the right-hand side reads each row's *own current value* before the update applies — this isn't a fixed replacement, it's computed per row); `Gizmo` (`electronics`) is untouched, exactly as `WHERE` specified.

```sql
DELETE FROM products WHERE price < 5;
SELECT name FROM products;
```

Verified output (against the original, pre-`UPDATE` table): `Widget`, `Gadget`, `Gizmo` remain — `Doohickey` (`4.25`, the only row under `5`) is gone.

> **Pitfall, verified directly and genuinely dangerous:** `DELETE FROM products;` with no `WHERE` clause at all — verified against this exact table — removes **all four rows**, correctly and silently, with no confirmation prompt and no error. `UPDATE` behaves identically: `UPDATE products SET price = 0;` with no `WHERE` would zero every row's price in one statement. This is the single most consequential real-world SQL mistake — typing the condition-free version of a statement by accident, especially against a table one meant to filter first with a `SELECT ... WHERE` to preview which rows would be hit. Module 9's transactions session covers `ROLLBACK` as the actual safety net for exactly this class of mistake, run inside a transaction that hasn't been committed yet.

**Practice**

- Before running any `UPDATE`/`DELETE` against unfamiliar data, write the equivalent `SELECT * FROM table WHERE <same condition>` first and check the row count — confirm this habit by writing both the `SELECT` preview and the real `DELETE` for "every product under `$5`," in that order.
- Predict, then verify, what `UPDATE products SET price = price * 1.1;` (no `WHERE`) does to `Gizmo`'s price, compared to the `WHERE category='hardware'` version above.

## Progress check

1. Why is naming columns explicitly in `INSERT INTO table(columns) VALUES (...)` safer than relying on declaration order?
2. In `SELECT ... WHERE ... ORDER BY ... LIMIT n`, in what order do filtering, ordering, and limiting actually apply?
3. What's the difference between `LIKE 'G%'` and `IN ('hardware','electronics')` as condition types?
4. What does `UPDATE products SET price = price * 1.1 WHERE category='hardware';` compute `price * 1.1` from — a fixed starting value, or each row's own current value?
5. What happens, precisely, when `DELETE FROM products;` is run with no `WHERE` clause?
6. What's the recommended habit for avoiding an accidental unconditional `UPDATE`/`DELETE`?

### Answers

1. Because it keeps working correctly even if the table's column order changes later — `INSERT INTO table VALUES (...)` with no column list depends on the values being supplied in exactly the table's current physical column order, which is a hidden dependency that breaks silently if that order ever changes.
2. `WHERE` filters first, `ORDER BY` sorts the filtered results, and `LIMIT` takes from the top of that sorted, filtered set last — `LIMIT 2` after `ORDER BY price DESC` correctly means "the two highest-priced rows that also passed the filter," not an arbitrary first two rows.
3. `LIKE` does pattern matching against a single text value (with `%`/`_` wildcards); `IN` checks whether a value equals any one of a fixed list of exact values — pattern-based partial matching versus exact-match set membership.
4. Each row's own current value — `price * 1.1` is evaluated per row, using that row's existing `price` at the moment the statement runs, not some single fixed number applied uniformly.
5. Every row in the table is deleted, unconditionally and silently — no confirmation, no error, no partial effect. The statement is entirely valid SQL; the danger is that `WHERE`'s absence isn't syntactically distinguishable from "correctly deciding to delete everything on purpose."
6. Write the equivalent `SELECT * FROM table WHERE <same condition>` first, check that the returned rows are actually the ones intended, and only then run the real `UPDATE`/`DELETE` with the same condition.
