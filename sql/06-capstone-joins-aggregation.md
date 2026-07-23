# Module 6 — Capstone 2: A Sales Report

**Proves:** `INNER`/`LEFT`/`RIGHT`/`FULL OUTER JOIN`, `GROUP BY`/`HAVING`, aggregate functions, and a measured indexing extension (Modules 4–5).

A sales report over the customers/orders schema Modules 4–5 built — the kind of query a real business dashboard would run — that deliberately surfaces the two categories of data an `INNER JOIN`-only version would silently drop: a customer with no orders yet, and an order with no assigned customer. Every result below is a real, verified `sqlite3` run.

## The complete report: nothing silently dropped

```sql
SELECT c.name, count(o.id) AS order_count, coalesce(sum(o.amount), 0) AS total
FROM customers c FULL OUTER JOIN orders o ON c.id = o.customer_id
GROUP BY c.name
ORDER BY c.name;
```

Verified output:

```
name   order_count  total
       1            15.0
Alice  2            80.0
Bob    2            65.0
Carol  0            0
```

`FULL OUTER JOIN` (Module 4) is what makes both edge cases visible in one query: **Carol** (`order_count = 0, total = 0`, via `coalesce`) — a real customer with no purchase history, which an `INNER JOIN` version of this same report would have omitted from the results entirely, not flagged as zero. And a **blank-name row** (`order_count = 1, total = 15.0`) — the guest order with no assigned customer, which neither an `INNER` nor a `LEFT JOIN` (customers-preserving only) version would have surfaced at all. `coalesce(sum(o.amount), 0)` turns `sum`'s `NULL` result for Carol's empty group (Module 5: `sum` over zero matching rows is `NULL`, not `0`) into the `0` a real report should actually display.

## Filtering the report: high-value customers only

```sql
SELECT c.name, sum(o.amount) AS total
FROM customers c JOIN orders o ON c.id = o.customer_id
GROUP BY c.name
HAVING sum(o.amount) > 70
ORDER BY total DESC;
```

Verified output:

```
name   total
Alice  80.0
```

Module 5's `HAVING` mechanism, applied to a real business question — "which customers have spent more than $70 total" — correctly returns only Alice; Bob's real, computed total (`65`) genuinely doesn't clear the threshold.

## Flagging the data-quality problem directly

```sql
SELECT o.id, o.amount FROM orders o WHERE o.customer_id IS NULL;
```

Verified output: order `5`, amount `15.0` — the same guest order the `FULL OUTER JOIN` report surfaced as a blank-name row, now isolated as its own query, the kind a real operations team would run specifically to find and fix unassigned orders rather than let them sit unnoticed inside an otherwise-correct aggregate report.

> **Pitfall:** an `INNER JOIN` version of this exact report (drop the `FULL OUTER`, use plain `JOIN`) still runs without error and still produces plausible-looking output — Alice and Bob's rows are identical either way. The only way to know Carol and the guest order are missing is to already know to check for them, which is precisely why this capstone builds the `FULL OUTER JOIN` version *first*: a report that can't lose rows silently is worth the extra join type, on any schema where "unmatched" is a real, expected state rather than a should-never-happen error condition.

## Extension: what this report costs at real scale — and a real, verified surprise

Module 5's indexing measurement — `0.013s` (full scan) down to `~0.0001s` (indexed search), a real ~130× difference on a 1,000,000-row table — is the reason a production `orders` table needs `CREATE INDEX idx_customer ON orders(customer_id);` for the join condition itself (`c.id = o.customer_id`), not just a `WHERE` filter. But run that same `CREATE INDEX`, then `EXPLAIN QUERY PLAN`, against *this capstone's actual four-row table*, and the honest, verified result is:

```sql
CREATE INDEX idx_customer ON orders(customer_id);
EXPLAIN QUERY PLAN
SELECT c.name, sum(o.amount) FROM customers c JOIN orders o ON c.id = o.customer_id GROUP BY c.name;
```

Verified output — **identical before and after adding the index**:

```
QUERY PLAN
|--SCAN o
|--SEARCH c USING INTEGER PRIMARY KEY (rowid=?)
`--USE TEMP B-TREE FOR GROUP BY
```

SQLite's query planner already picks a genuinely reasonable plan on a five-row `orders` table — scan the small table once, look up each matching customer directly by primary key — and correctly declines to route through the new index at all, because on a table this size a full scan and an indexed search cost about the same, and the planner isn't obligated to use an index just because one exists. This is the honest, complete picture Module 5's dramatic 130× number needs alongside it: an index changes real query plans on real data volumes (verified there, on 1,000,000 rows), but doesn't necessarily change anything at all on a handful of rows — checking with `EXPLAIN QUERY PLAN` beats assuming either way.

## Practice

- Rewrite the complete report using `LEFT JOIN` instead of `FULL OUTER JOIN`, and confirm Carol still appears but the guest order silently disappears — the exact asymmetry Module 4 demonstrated, now inside a real report instead of a teaching example.
- Insert a few hundred thousand synthetic orders into this capstone's schema (reusing Module 5's `WITH RECURSIVE` generation technique) and run `SELECT count(*) FROM orders WHERE customer_id = <some id>;` before and after `CREATE INDEX idx_customer ON orders(customer_id);` — confirm `idx_customer` *does* get used for this direct filter, with a measured timing difference, even though the capstone's own join-based report above didn't need it at any tested scale (the query planner's chosen join order looked up customers by their own primary key instead, sidestepping `idx_customer` entirely for that specific query shape).
- Extend the report to also show each customer's *average* order value (Module 5's `avg`), and confirm Carol's average reports as `NULL` even after the `total` column was `coalesce`d to `0` — why doesn't `coalesce` fix both columns the same way without being applied to each individually?
