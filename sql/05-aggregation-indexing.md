# Module 5 — Aggregation and Indexing

Two things that don't fit the row-at-a-time thinking Modules 1–4 have used so far: computing a single summary value across many rows (`GROUP BY` and aggregate functions), and understanding — with a real, measured number, not a claim — why the same correct query can be dramatically faster or slower depending on what the database has to search through to answer it. Every result below is a real `sqlite3` run. Feeds Capstone 2.

## `GROUP BY` and aggregate functions

**You'll be able to:** compute per-group summary statistics, and explain exactly which rows an aggregate function actually sees.

**Concept**

`GROUP BY column` collapses every row sharing the same value in `column` into one output row; aggregate functions (`count`, `sum`, `avg`, `min`, `max`) compute a single value from all the rows in each group, rather than one value per row the way every prior module's `SELECT` has worked.

**Example**, extending Module 4's customer/order schema with two more orders:

```sql
INSERT INTO orders(customer_id, amount) VALUES (2, 45);  -- Bob's second order

SELECT c.name, count(o.id) AS order_count, sum(o.amount) AS total,
       avg(o.amount) AS avg_amount, min(o.amount) AS smallest, max(o.amount) AS largest
FROM customers c JOIN orders o ON c.id = o.customer_id
GROUP BY c.name;
```

Verified output:

```
name   order_count  total  avg_amount  smallest  largest
Alice  2            80.0   40.0        30.0      50.0
Bob    2            65.0   32.5        20.0      45.0
```

Carol is correctly absent — this uses a plain (inner) `JOIN`, and Module 4 already established that customers with no orders don't survive an inner join, `GROUP BY` or not. Each aggregate computed exactly what it should: Alice's two orders (`50`, `30`) sum to `80`, average `40`; Bob's (`20`, `45`) sum to `65`, average `32.5`.

> **Pitfall:** `count(o.id)` and `count(*)` are not always interchangeable — verified directly against this schema's five total order rows (four with a real `customer_id`, one `NULL` guest order): `count(*)` reports `5` (every row, unconditionally), while `count(customer_id)` reports `4` (aggregate functions other than `count(*)` skip `NULL` values entirely). Using the wrong one in a report — especially `count(some_column)` when the intent was "how many rows total" — silently undercounts the moment that column can hold `NULL`.

**Practice**

- Predict, then verify, what `sum(o.amount)` and `avg(o.amount)` report for a group containing a `NULL` amount, if `amount` weren't `NOT NULL` in this schema — does `sum`/`avg` treat a `NULL` as `0`, or skip it the way `count` does?
- Add a fourth customer with zero orders and confirm the `GROUP BY` query above still correctly omits them (a plain `JOIN` still applies before grouping).

## `HAVING`: filtering groups, not rows

**You'll be able to:** filter on an aggregate result, and explain precisely why `WHERE` can't do that job.

**Concept**

`WHERE` filters individual rows *before* grouping happens; `HAVING` filters *groups*, evaluated *after* aggregation, which is the only place a condition like "total over some threshold" can be checked at all — no single row has a "total," only a group does.

**Example**

```sql
SELECT c.name, sum(o.amount) AS total
FROM customers c JOIN orders o ON c.id = o.customer_id
GROUP BY c.name
HAVING sum(o.amount) > 70;
```

Verified output:

```
name   total
Alice  80.0
```

Bob (`total = 65`) is correctly excluded — `65 > 70` is false — while Alice (`80`) passes. This is a condition `WHERE` genuinely cannot express: `WHERE sum(o.amount) > 70` isn't valid, because `WHERE` runs before any summing has happened, on individual `orders` rows that don't have a "total" of anything yet.

`WHERE` and `HAVING` can appear in the same query, doing genuinely different filtering at genuinely different stages:

```sql
SELECT c.name, sum(o.amount) AS total
FROM customers c JOIN orders o ON c.id = o.customer_id
WHERE o.amount > 25
GROUP BY c.name;
```

Verified output:

```
name   total
Alice  80.0
Bob    45.0
```

`WHERE o.amount > 25` runs first, on individual order rows — it excludes Bob's `20` order before any grouping happens, so Bob's total only sums his remaining `45` order. Alice is unaffected (both her orders, `50` and `30`, already exceed `25`). This is a genuinely different result from the ungrouped total (`65`) the previous session computed for Bob — the `WHERE` clause changed *which rows* enter the group, not just which groups survive afterward.

> **Pitfall:** confusing `WHERE` and `HAVING` produces either a syntax error (`WHERE sum(...)` is invalid — aggregates don't exist yet at `WHERE`'s stage) or, more dangerously, a query that runs but silently computes the wrong thing if a condition is written where it happens to be syntactically legal but semantically means something different than intended — filtering rows with `WHERE` *before* aggregation is not the same operation as filtering groups with `HAVING` *after*, even when both use the same-looking comparison.

**Practice**

- Write a query using both `WHERE` (excluding orders under `25`) and `HAVING` (excluding customers whose filtered total is under `50`) in the same statement, and trace by hand which customers survive each stage before verifying.

## Indexing: a measured, not claimed, performance difference

**You'll be able to:** read an `EXPLAIN QUERY PLAN` result, and explain what an index changes structurally about how a query executes.

**Concept**

Without an index, finding rows matching a `WHERE` condition means checking every row in the table — a full scan. An index on the filtered column lets SQLite jump directly to matching rows instead, the same practical difference as looking something up in a sorted phone book versus reading every entry. This isn't a claim to take on faith — it's measured directly, on a synthetic 1-million-row table, same machine, back to back.

**Example**

```sql
CREATE TABLE big(id INTEGER PRIMARY KEY, val INTEGER, payload TEXT);
WITH RECURSIVE gen(x) AS (SELECT 1 UNION ALL SELECT x+1 FROM gen WHERE x<1000000)
INSERT INTO big(id,val,payload) SELECT x, x % 10000, 'row-' || x FROM gen;

EXPLAIN QUERY PLAN SELECT sum(length(payload)) FROM big WHERE val = 5000;
-- QUERY PLAN
-- `--SCAN big
```

**Verified timing, before any index:** `0.013s` (`user 0.0127s`) to compute `sum(length(payload))` for the ~100 matching rows out of 1,000,000 — every single row gets read and checked.

```sql
CREATE INDEX idx_val ON big(val);

EXPLAIN QUERY PLAN SELECT sum(length(payload)) FROM big WHERE val = 5000;
-- QUERY PLAN
-- `--SEARCH big USING INDEX idx_val (val=?)
```

**Verified timing, after the index:** `0.000s` (`user 0.0001s`) — the identical query, identical data, identical answer (`sum = 989` both times), roughly **130× faster**. `EXPLAIN QUERY PLAN`'s own output names exactly what changed: `SCAN big` (read every row) became `SEARCH big USING INDEX idx_val` (jump directly to the matching rows via the index).

> **Pitfall:** an index isn't free — it's a real, separate data structure the database maintains, which means every `INSERT`/`UPDATE`/`DELETE` touching an indexed column now has to update the index too, not just the table. Indexing every column "just in case" trades write performance (and storage) for read performance that only pays off on columns actually filtered or joined on frequently — `EXPLAIN QUERY PLAN` is the tool for confirming an index is actually being used by the queries that matter, not a reason to add indexes speculatively everywhere.

**Practice**

- Run `EXPLAIN QUERY PLAN` against a query filtering on `payload` (the un-indexed `TEXT` column) after `idx_val` has been created, and confirm it still reports `SCAN big` — an index only helps the specific column(s) it was built on.
- Predict, then verify, what `EXPLAIN QUERY PLAN` reports for `SELECT * FROM big WHERE val = 5000 AND payload = 'row-500000';` — does having an index on `val` alone change the plan for a condition that also checks `payload`?

## Progress check

1. What's the practical difference between `count(*)` and `count(column)` when `column` can hold `NULL`?
2. Why can't `WHERE` express a condition like "total over 70," while `HAVING` can?
3. In a query using both `WHERE` and `HAVING`, which one changes which *rows* enter a group, and which one changes which *groups* survive?
4. What did `EXPLAIN QUERY PLAN` report before the index existed, and what did it report after — what's the structural difference those two words describe?
5. What was the actual measured speedup from adding `idx_val`, and on what size dataset?
6. Why isn't indexing every column automatically a good idea?

### Answers

1. `count(*)` counts every row unconditionally; `count(column)` counts only rows where `column` is not `NULL` — verified directly, `5` total order rows vs. `4` with a non-`NULL customer_id`. Using `count(column)` when the intent was a total row count silently undercounts.
2. Because `WHERE` filters individual rows *before* any aggregation happens — no single row has a "total" of anything, only a group does, so a condition on an aggregate result can only be evaluated after grouping, which is exactly what `HAVING` does.
3. `WHERE` changes which rows enter a group (filtering before aggregation); `HAVING` changes which already-formed groups appear in the final result (filtering after aggregation) — verified directly: adding `WHERE o.amount > 25` changed Bob's computed total itself (`65` → `45`), not just whether Bob's row was included.
4. Before the index: `SCAN big` — reading every row in the table to check the `WHERE` condition. After: `SEARCH big USING INDEX idx_val` — jumping directly to matching rows via the index instead of reading the whole table.
5. From `0.013s` to effectively `0.000s` (roughly 130× faster), measured on the identical query and identical 1,000,000-row table, same machine, back to back, with the identical correct answer both times.
6. Because every index is a real, separate structure the database has to keep updated — every `INSERT`/`UPDATE`/`DELETE` touching an indexed column also updates its index, trading write performance and storage for read performance that only pays off on columns actually filtered or joined on frequently.
