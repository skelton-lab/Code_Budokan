# Module 8 — Capstone 3: An Org Chart Report

**Proves:** `OVER`/`PARTITION BY`, the rank family, running comparisons, `WITH RECURSIVE` (Module 7).

An eight-person org chart with department and salary data — combining Module 7's two genuinely separate tools in one report: window functions to compare each employee against their department without collapsing any rows, and a recursive CTE to compute something no `GROUP BY` could ever express — how many people, direct and indirect, report up through each person. Every result below is a real, verified `sqlite3` run.

## The schema

```sql
CREATE TABLE employees(
    id INTEGER PRIMARY KEY,
    name TEXT NOT NULL,
    manager_id INTEGER REFERENCES employees(id),
    department TEXT NOT NULL,
    salary REAL NOT NULL
);
```

Eight employees: Cara (CEO, no manager) → Dan (Engineering) and Eve (Sales) → Frank (Engineering, reports to Dan) → Grace and Hank (Engineering, report to Frank); Ivy and Jack (Sales, report to Eve).

## Salary rank within department

```sql
SELECT department, name, salary,
    RANK() OVER (PARTITION BY department ORDER BY salary DESC) AS dept_rank
FROM employees ORDER BY department, dept_rank;
```

Verified output:

```
department   name   salary    dept_rank
Engineering  Dan    180000.0  1
Engineering  Frank  150000.0  2
Engineering  Grace  120000.0  3
Engineering  Hank   115000.0  4
Executive    Cara   220000.0  1
Sales        Eve    175000.0  1
Sales        Ivy    110000.0  2
Sales        Jack   105000.0  3
```

`PARTITION BY department` restarts the ranking independently for each department — Dan's rank `1` in Engineering has nothing to do with Eve's rank `1` in Sales; they're simply each the top earner in their own, separate partition. All eight employees still appear, unlike a `GROUP BY department` version of this query, which would have collapsed each department to one row and lost the individual names entirely.

## Every employee versus their department's average — without collapsing anything

```sql
SELECT department, name, salary,
    ROUND(AVG(salary) OVER (PARTITION BY department), 2) AS dept_avg,
    ROUND(salary - AVG(salary) OVER (PARTITION BY department), 2) AS vs_avg
FROM employees ORDER BY department, salary DESC;
```

Verified output:

```
department   name   salary    dept_avg  vs_avg
Engineering  Dan    180000.0  141250.0  38750.0
Engineering  Frank  150000.0  141250.0  8750.0
Engineering  Grace  120000.0  141250.0  -21250.0
Engineering  Hank   115000.0  141250.0  -26250.0
Executive    Cara   220000.0  220000.0  0.0
Sales        Eve    175000.0  130000.0  45000.0
Sales        Ivy    110000.0  130000.0  -20000.0
Sales        Jack   105000.0  130000.0  -25000.0
```

This is the specific thing a plain aggregate `AVG(salary) ... GROUP BY department` genuinely cannot produce in one query: every individual row *and* that row's department average *and* the difference between them, together. `dept_avg` correctly computes to `141250.0` for Engineering (`(180000+150000+120000+115000)/4`) and `130000.0` for Sales, each individual employee's row still fully present to compare against it.

## Recursive: total reports, direct and indirect, per manager

```sql
WITH RECURSIVE org_size(id, name, report_id) AS (
    SELECT id, name, id FROM employees
    UNION ALL
    SELECT org_size.id, org_size.name, e.id
    FROM employees e JOIN org_size ON e.manager_id = org_size.report_id
)
SELECT id, name, count(*) - 1 AS total_reports
FROM org_size GROUP BY id, name ORDER BY total_reports DESC, id;
```

Verified output:

```
id  name   total_reports
1   Cara   7
2   Dan    3
3   Eve    2
4   Frank  2
5   Grace  0
6   Hank   0
7   Ivy    0
8   Jack   0
```

The recursive technique here is worth naming precisely: the anchor gives every employee a starting row where `report_id` equals their own `id`; the recursive member then walks *upward* — for each employee `e`, if `e.manager_id` matches a `report_id` already reached, add a new row for `e`'s original `id`/`name` with `report_id` now pointing at `e`'s manager. Run to completion, this accumulates, for every original employee, one row per manager anywhere above them in the chain (plus the one self-row from the anchor). Grouping by the original `id`/`name` and counting (`- 1` to exclude the self-row) gives exactly "how many people have this person somewhere in their management chain" — Cara, the CEO, correctly has `7` (everyone else in the company); the four individual contributors (Grace, Hank, Ivy, Jack) correctly have `0`.

> **Pitfall:** this recursive query walks the hierarchy in the *opposite* direction from Module 7's org-chart `depth` example (which walked downward from the root, accumulating `depth`). Both are legitimate recursive-CTE patterns over the same kind of self-referencing table — the direction of the walk (down from a root, or up from every leaf simultaneously) depends entirely on which question is being asked, not on any fixed rule about how a hierarchy "should" be traversed.

## Practice

- Combine all three techniques into one report: for each employee, show their department salary rank, their `vs_avg` difference, and their `total_reports` count, joining this capstone's recursive result against the window-function query.
- Add a ninth employee reporting to Grace, and confirm `total_reports` updates correctly for Grace (now `1`), Frank (now `3`), Dan (now `4`), and Cara (now `8`) — the recursive query needs no changes, only new data.
- Explain why `RANK()` rather than `ROW_NUMBER()` was the right choice for `dept_rank` above, in terms of what would happen if two employees in the same department had identical salaries.
