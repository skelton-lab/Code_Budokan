# Module 4 — Joins

Every guide-worthy SQL query eventually needs data from more than one table. This module builds a small two-table schema — customers and their orders, deliberately including one customer with no orders and one order with no customer — specifically so all four join types produce genuinely different, verifiable row counts, not just a syntax variation on the same result. Feeds Capstone 2.

## The schema

```sql
CREATE TABLE customers(id INTEGER PRIMARY KEY, name TEXT NOT NULL);
CREATE TABLE orders(id INTEGER PRIMARY KEY, customer_id INTEGER REFERENCES customers(id), amount REAL NOT NULL);

INSERT INTO customers(name) VALUES ('Alice'), ('Bob'), ('Carol');
INSERT INTO orders(customer_id, amount) VALUES (1, 50), (1, 30), (2, 20), (NULL, 15);
```

`orders.customer_id REFERENCES customers(id)` declares a foreign key (enforced in full starting Module 9 — for now, it's documentation of intent). Three customers: Alice has two orders, Bob has one, **Carol has none**. Four orders: three tied to a customer, **one with `customer_id = NULL`** — a guest checkout, unassigned to any customer. Both of those deliberately unmatched rows are what make the four join types actually diverge.

## `INNER JOIN`: only the matches

**You'll be able to:** write a join that returns exactly the rows where both sides have a match, and predict its row count precisely.

**Concept**

`INNER JOIN` (or plain `JOIN` — they're the same in SQLite) returns one output row for every pair where the `ON` condition is true on both sides. A row with nothing to match on either side simply doesn't appear at all.

**Example**

```sql
SELECT c.name, o.amount FROM customers c INNER JOIN orders o ON c.id = o.customer_id
ORDER BY c.name, o.amount;
```

Verified output:

```
name   amount
Alice  30.0
Alice  50.0
Bob    20.0
```

Three rows — Alice's two orders and Bob's one. **Carol is entirely absent** (no order references her), and **the guest order is entirely absent** (its `customer_id = NULL` matches no customer). `INNER JOIN` doesn't report "unmatched" rows in any form; it simply never produces them.

## `LEFT JOIN`: every row from the left, matched or not

**You'll be able to:** write a join that preserves every row from one specific table, filling in `NULL` where no match exists.

**Concept**

`LEFT JOIN` (or `LEFT OUTER JOIN`) keeps every row from the table named first (the "left" side), regardless of whether it has a match on the right — when it doesn't, every right-side column comes back `NULL` instead of the row being dropped.

**Example**

```sql
SELECT c.name, o.amount FROM customers c LEFT JOIN orders o ON c.id = o.customer_id
ORDER BY c.name, o.amount;
```

Verified output:

```
name   amount
Alice  30.0
Alice  50.0
Bob    20.0
Carol
```

Four rows now — **Carol appears**, with `amount` reported as `NULL` (blank in this output), because she's guaranteed a row regardless of matching. The guest order is still absent — `LEFT JOIN` only guarantees the *left* table's rows, and `orders` is on the right here.

## `RIGHT JOIN` and `FULL OUTER JOIN`: the other side, and both sides

**You'll be able to:** write a join preserving the other table's unmatched rows, and one preserving both sides' unmatched rows simultaneously.

**Concept**

`RIGHT JOIN` is `LEFT JOIN` with the guarantee on the other table — every row from the table named *second* survives, matched or not. `FULL OUTER JOIN` guarantees rows from **both** tables survive; anything unmatched on either side gets `NULL`s for the columns it has no counterpart for.

**Example**

```sql
SELECT c.name, o.amount FROM customers c RIGHT JOIN orders o ON c.id = o.customer_id
ORDER BY o.amount;
```

Verified output:

```
name   amount
       15.0
Bob    20.0
Alice  30.0
Alice  50.0
```

Four rows — the guest order (`amount = 15.0`, `name` blank/`NULL`) now appears, since `orders` is the right-hand table here and `RIGHT JOIN` guarantees its rows. Carol is absent — the guarantee flipped sides.

```sql
SELECT c.name, o.amount FROM customers c FULL OUTER JOIN orders o ON c.id = o.customer_id
ORDER BY c.name, o.amount;
```

Verified output:

```
name   amount
       15.0
Alice  30.0
Alice  50.0
Bob    20.0
Carol
```

Five rows — **both** unmatched rows survive simultaneously: the guest order (blank name) and Carol (blank amount), alongside the three genuinely matched rows. Verified row counts across all four join types, same schema, same `ON` condition, nothing else changed: **inner = 3, left = 4, right = 4, full = 5**.

> **Pitfall:** these four numbers being different isn't a performance detail or an implementation quirk — it's the actual point of choosing a join type. Code that defaults to `INNER JOIN` out of habit, on data where some rows are genuinely expected to be unmatched (a customer who hasn't ordered yet, a not-yet-assigned order), silently *drops real data* from the result — Carol and the guest order don't appear as errors or warnings, they simply aren't in the output, exactly the same "no signal, wrong answer" failure shape Prolog's negation-as-failure gotcha (`prolog/08-control-mutable-state.md`) produced for a completely different reason. Choosing a join type is choosing which unmatched rows are allowed to silently disappear.

**Practice**

- Add a second guest order (`customer_id = NULL, amount = 8`) and re-verify all four row counts — which of the four changes, and by how much?
- Write the query that answers "which customers have never placed an order" using `LEFT JOIN` plus `WHERE o.id IS NULL` (a real, common idiom — filtering *for* the unmatched rows a `LEFT JOIN` produces), and confirm it returns exactly `Carol`.

## Progress check

1. Why does `INNER JOIN` never produce a row with a `NULL` on either side, by construction?
2. What guarantee does `LEFT JOIN` make that `INNER JOIN` doesn't, and which table does that guarantee apply to?
3. Given this module's schema, why does `RIGHT JOIN` include the guest order but exclude Carol, while `LEFT JOIN` does the opposite?
4. What's the one guarantee `FULL OUTER JOIN` adds beyond what `LEFT JOIN` and `RIGHT JOIN` each provide alone?
5. Why is defaulting to `INNER JOIN` out of habit a real correctness risk, not just a style preference?
6. What SQL idiom answers "which rows on the left have no match on the right," and what does it combine?

### Answers

1. Because `INNER JOIN` only ever produces output for pairs where the `ON` condition actually holds true on both sides — a row with no matching counterpart has nothing to pair with, so it's excluded from the result entirely rather than being included with a `NULL` filled in.
2. `LEFT JOIN` guarantees every row from the table named first (the left side) appears in the result at least once, whether or not it has a match — `INNER JOIN` makes no such guarantee for either table.
3. `RIGHT JOIN` guarantees rows from the table named second — here, `orders` — so the unmatched guest order survives while unmatched-on-the-right `customers` rows (Carol) don't. `LEFT JOIN` guarantees the opposite table (`customers`), so it keeps Carol and drops the guest order.
4. It guarantees *both* tables' unmatched rows survive simultaneously — `LEFT JOIN` alone would drop the guest order, `RIGHT JOIN` alone would drop Carol, but `FULL OUTER JOIN` keeps both in the same result.
5. Because on data where some rows are genuinely expected to have no match (a customer with no orders yet, an order not yet assigned to a customer), `INNER JOIN` silently omits those rows from the result with no error or warning — real data goes missing without any signal that it happened.
6. `LEFT JOIN` combined with `WHERE <right-table-column> IS NULL` — the `LEFT JOIN` guarantees every left-side row appears, filling unmatched right-side columns with `NULL`; filtering for exactly those `NULL`s isolates the rows that had no match at all.
