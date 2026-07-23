# Module 7 — Window Functions and Recursive CTEs

Two genuinely modern SQL features that `GROUP BY` alone can't express: a running or ranked value computed *per row*, without collapsing rows into groups, and a query that searches an arbitrarily deep hierarchy — the same problem Prolog's `ancestor/2` (`prolog/02-recursion-backtracking-lists.md`) solved with recursion, solved here the SQL way. Every result below is a real, verified `sqlite3` run. Feeds Capstone 3.

## Window functions: per-row results that see other rows

**You'll be able to:** rank rows within groups without collapsing them, using `OVER`/`PARTITION BY`.

**Concept**

`GROUP BY` (Module 5) collapses many rows into one summary row per group — the individual rows are gone from the output. A **window function** computes something that depends on *other* rows (a rank, a running total) while keeping every original row intact. `OVER (PARTITION BY column ORDER BY column)` defines the "window" — `PARTITION BY` restarts the computation for each group, exactly like `GROUP BY` chooses groups, but nothing collapses.

**Example**

```sql
SELECT customer, amount, ROW_NUMBER() OVER (PARTITION BY customer ORDER BY amount DESC) AS rn
FROM orders ORDER BY customer, rn;
```

Verified output, against a table where Alice has three orders (`50, 30, 30`) and Bob has two (`45, 20`):

```
customer  amount  rn
Alice     50.0    1
Alice     30.0    2
Alice     30.0    3
Bob       45.0    1
Bob       20.0    2
```

Every original row survives — five rows in, five rows out, unlike `GROUP BY`'s collapse to one row per customer. `ROW_NUMBER()` restarts at `1` for each customer (`PARTITION BY customer`) and counts within that customer's orders in descending-amount order.

**Practice**

- Predict, then verify, what removing `PARTITION BY customer` (keeping just `ORDER BY amount DESC`) changes about the `rn` column — does it still restart per customer, or number every row globally?

## `RANK()` and `DENSE_RANK()`: two different answers to "what about ties"

**You'll be able to:** choose between the rank family's tie-handling behaviors deliberately, not by accident.

**Concept**

`ROW_NUMBER()` always assigns strictly increasing, unique numbers — it never produces a tie, even when the underlying values do. `RANK()` and `DENSE_RANK()` both handle ties by giving equal values the same rank, but disagree about what happens *after* a tie: `RANK()` leaves a gap equal to the tie's size; `DENSE_RANK()` doesn't.

**Example**, a customer with orders `50, 30, 30, 10`:

```sql
SELECT amount,
    RANK() OVER (ORDER BY amount DESC) AS rnk,
    DENSE_RANK() OVER (ORDER BY amount DESC) AS drnk
FROM orders ORDER BY amount DESC;
```

Verified output:

```
amount  rnk  drnk
50.0    1    1
30.0    2    2
30.0    2    2
10.0    4    3
```

Both tied `30`s correctly get rank `2` under either function — the divergence shows up on the row *after* the tie: `RANK()` gives `10.0` a rank of `4` (accounting for the two rows that tied at `2`, as if they'd each occupied a separate slot), while `DENSE_RANK()` gives it `3` (treating the tie as one occupied rank, not two). Neither is "more correct" — they answer genuinely different questions ("what position would this be in a strict ordering with ties broken arbitrarily" vs. "how many distinct values rank above this one"), and picking the wrong one for a leaderboard or a "top N distinct scores" query produces a plausible-looking but wrong answer.

**Practice**

- Predict, then verify, what `RANK()` and `DENSE_RANK()` report for a dataset with *no* ties at all — do they ever disagree when every value is unique?

## Running totals: a window function without ranking

**You'll be able to:** compute a running total across ordered rows.

**Concept**

`SUM(column) OVER (ORDER BY column)`, with no `PARTITION BY`, computes a **running total**: for each row, the sum of that row's value and every row before it in the specified order — not the grand total repeated on every row, the way a plain aggregate `SUM` would if it were somehow used without collapsing rows.

**Example**

```sql
SELECT id, customer, amount, SUM(amount) OVER (ORDER BY id) AS running_total FROM orders ORDER BY id;
```

Verified output:

```
id  customer  amount  running_total
1   Alice     50.0    50.0
2   Alice     30.0    80.0
3   Alice     30.0    110.0
4   Bob       20.0    130.0
5   Bob       45.0    175.0
```

Each row's `running_total` is the sum of every `amount` from row `1` up through that row, in `id` order — `130.0` at row `4` is `50+30+30+20`, correctly including Bob's order even though the running total isn't partitioned by customer here; adding `PARTITION BY customer` would restart the running total at each customer's first row instead.

**Practice**

- Add `PARTITION BY customer` to the running-total query above, and confirm Bob's running total correctly restarts from his own first order (`20.0`) instead of continuing from Alice's `110.0`.

## `WITH RECURSIVE`: Prolog's recursive rules, in SQL

**You'll be able to:** write a recursive CTE that searches an arbitrarily deep hierarchy, and recognize its structural resemblance to a recursive Prolog rule.

**Concept**

`WITH RECURSIVE name(columns) AS (anchor UNION ALL recursive-member) SELECT ...` has the exact same shape as Prolog's `ancestor/2`: an **anchor** member (the base case — here, the root of a hierarchy, with no parent) `UNION ALL`'d with a **recursive** member that refers back to the CTE's own name (the recursive case — "one more level down from whatever's already found"), run repeatedly until it stops producing new rows. `prolog/02-recursion-backtracking-lists.md`'s `ancestor(X,Y) :- parent(X,Y).` / `ancestor(X,Y) :- parent(X,Z), ancestor(Z,Y).` pair is the same base-case/recursive-case structure, in a different syntax and running under a different execution model.

**Example**, an org chart:

```sql
WITH RECURSIVE org(id, name, manager_id, depth) AS (
    SELECT id, name, manager_id, 0 FROM employees WHERE manager_id IS NULL
    UNION ALL
    SELECT e.id, e.name, e.manager_id, org.depth + 1
    FROM employees e JOIN org ON e.manager_id = org.id
)
SELECT id, name, depth FROM org ORDER BY depth, id;
```

Verified output, against a six-person org chart (a CEO, two VPs, one engineering manager, two engineers):

```
id  name              depth
1   Cara (CEO)        0
2   Dan (VP Eng)      1
3   Eve (VP Sales)    1
4   Frank (Eng Mgr)   2
5   Grace (Engineer)  3
6   Hank (Engineer)   3
```

The anchor (`WHERE manager_id IS NULL`) finds the CEO alone, at `depth = 0`. The recursive member joins `employees` back against `org` itself, finding everyone whose manager is already in `org`, one level deeper each pass — exactly Prolog's `ancestor` recursing through `parent` facts one link at a time, until no new matches appear and the recursion stops on its own.

```sql
WITH RECURSIVE reports(id, name) AS (
    SELECT id, name FROM employees WHERE id = 2
    UNION ALL
    SELECT e.id, e.name FROM employees e JOIN reports ON e.manager_id = reports.id
)
SELECT id, name FROM reports WHERE id != 2 ORDER BY id;
```

Verified output: `Frank`, `Grace`, `Hank` — every direct *and* indirect report under Dan (`id = 2`), correctly reaching two levels deep (Frank reports directly to Dan; Grace and Hank report to Frank, not to Dan) without the query needing to know the hierarchy is two levels deep ahead of time, the same open-ended reach Prolog's `ancestor/2` had over an arbitrarily long chain of `parent/2` facts.

> **Pitfall:** a recursive CTE with no way to stop growing (a cyclic hierarchy — an employee somehow their own indirect manager, or a self-referencing row) runs forever, the identical failure shape as a Prolog recursive rule with an unreachable base case (`prolog/02-recursion-backtracking-lists.md`'s exact pitfall, restated in SQL). SQLite doesn't detect this automatically; it will keep evaluating the recursive member until an internal safety limit or available memory is exhausted, not politely stop on its own the way a well-formed hierarchy naturally terminates.

**Practice**

- Add `Ivy (Engineer)`, reporting to `Frank`, and confirm both the depth query and the "reports under Dan" query correctly pick her up without any change to the CTE itself.
- Explain, in your own words, why `UNION ALL` (not plain `UNION`) is the right choice here — what would deduplication cost in a query that's supposed to walk every level of a hierarchy exactly once per row?

## Progress check

1. What's the fundamental difference between what `GROUP BY` does to rows and what a window function does to rows?
2. What does `PARTITION BY` do inside an `OVER (...)` clause, and how is it similar to `GROUP BY`?
3. Given a tie, what's the precise difference between what `RANK()` and `DENSE_RANK()` report for the row immediately after that tie?
4. What does `SUM(amount) OVER (ORDER BY id)`, with no `PARTITION BY`, compute for each row?
5. What are the two parts of a `WITH RECURSIVE` CTE, and what's the direct structural parallel to a recursive Prolog rule?
6. What happens if a recursive CTE's hierarchy contains a cycle, and why doesn't SQLite catch it automatically?

### Answers

1. `GROUP BY` collapses every row in a group into one summary output row — the individual rows are gone. A window function computes a value that depends on other rows (via `OVER (...)`) while leaving every original row intact in the output.
2. It restarts the window function's computation for each distinct value of the partitioning column(s) — similar to `GROUP BY` choosing which rows belong together, but without collapsing them into one row per group.
3. `RANK()` leaves a gap after a tie equal to the number of tied rows (e.g., two rows tied at rank `2` push the next distinct value to rank `4`); `DENSE_RANK()` leaves no gap (the next distinct value gets rank `3`) — verified directly on a dataset with one tie.
4. The sum of that row's own value plus every row before it in the specified order — a running total, not the single grand total repeated on every row.
5. An anchor member (the base case, run once) and a recursive member (referring back to the CTE's own name, run repeatedly), combined with `UNION ALL`. The direct parallel is Prolog's base-case clause plus recursive clause (`ancestor(X,Y) :- parent(X,Y).` / `ancestor(X,Y) :- parent(X,Z), ancestor(Z,Y).`) — same two-part shape, different execution model.
6. It runs indefinitely, repeatedly evaluating the recursive member against rows that keep producing new matches, until an internal safety limit or available memory is exhausted — SQLite has no general way to detect a cycle in arbitrary hierarchical data automatically, the same reason an unreachable base case in a recursive Prolog rule doesn't get caught before it's actually run.
