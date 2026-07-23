# SQL — A Session-Based Study Guide

**Promise:** design a real schema, write correct joins and aggregations, use window functions and recursive CTEs for the queries a hand-rolled loop can't express cleanly, and understand transactions and constraints well enough to reason about what a database actually guarantees — not just what syntax runs without erroring.

**Audience:** this series' existing reader, straight off the Prolog guide. Worth naming directly, not treating as coincidence: SQL and Prolog both trace to predicate logic — E.F. Codd's 1970 relational model and Robert Kowalski's logic programming share that ancestry, and Datalog (named as a signpost in `prolog/10-beyond-this-guide.md`) is literally the intersection of the two: a query language that's simultaneously relational-algebra-complete and a restricted Prolog. SQL is the declarative query language this reader almost certainly already uses far more than Prolog day to day; this guide treats that existing familiarity as a head start on the *declarative* mindset ("state what you want, not how to get it," Prolog's Module 1 framing), not a reason to slow down on SQL-specific mechanics.

**Toolchain (anchored):** **SQLite 3.45.3**, already installed locally — no setup step needed, a first for this series. Confirmed directly before anchoring to it: window functions (`ROW_NUMBER() OVER (...)`), recursive CTEs (`WITH RECURSIVE`), and `RIGHT`/`FULL OUTER JOIN` (a genuinely recent SQLite addition, version 3.39+) all work correctly in this exact build. PostgreSQL and MySQL get a real, honest signpost in Module 11 — not just "the fancier option," but the specific, named ways SQLite's own behavior (dynamic typing via *type affinity*, not enforced column types; no stored procedures or roles) diverges from what a production Postgres/MySQL job actually looks like.

**A methodology note specific to this language:** every prior guide in this series verified a *value*. SQL's unit of work is closer to Prolog's — a query against stored data — but unlike Prolog, SQL queries routinely need to be checked against **measured behavior**, not just correct output: whether a query returns the right rows is one question, whether it does so efficiently is a separate, equally real one. This guide verifies both. Every `SELECT` result below was run and its actual output recorded; Module 5's indexing session additionally measures real wall-clock time and a real query plan, before and after, on the same machine, back to back — the same evidentiary standard Prolog's Capstone 2 (`clpfd` vs. plain generate-and-test) set for this series.

## Capstone log

| # | Capstone | Proves |
|---|---|---|
| 1 | Schema design + CRUD | Types and type affinity, `PRIMARY KEY`, `NOT NULL`/`UNIQUE`/`CHECK`, `INSERT`/`UPDATE`/`DELETE`, `SELECT`/`WHERE`/`ORDER BY`/`LIMIT` |
| 2 | Multi-table joins + aggregation | `INNER`/`LEFT`/`RIGHT`/`FULL OUTER JOIN`, `GROUP BY`/`HAVING`, aggregate functions — extended with a measured indexing session |
| 3 | Window functions + recursive CTEs | Ranking/running totals, a recursive hierarchical query — a direct callback to Prolog's recursive rules: a recursive CTE's anchor member `UNION ALL` recursive member is the same base-case/recursive-case shape as Prolog's base clause plus recursive clause, spelled in SQL instead |
| 4 | Bank-transfer transaction | `BEGIN`/`COMMIT`/`ROLLBACK`, ACID in practice, verified against real constraint enforcement |

## Module list

1. **Foundations: schema and types** — SQLite's type affinity, `CREATE TABLE`, `PRIMARY KEY`, `NOT NULL`/`UNIQUE`/`CHECK` → sets up Capstone 1
2. **CRUD and basic queries** — `INSERT`/`UPDATE`/`DELETE`, `SELECT`/`WHERE`/`ORDER BY`/`LIMIT` → feeds Capstone 1
3. **Capstone 1** — Schema + CRUD
4. **Joins** — `INNER`/`LEFT`/`RIGHT`/`FULL OUTER JOIN`, why join type changes results, not just performance → feeds Capstone 2
5. **Aggregation and indexing** — `GROUP BY`/`HAVING`, aggregate functions, `EXPLAIN QUERY PLAN`, a measured index extension → feeds Capstone 2
6. **Capstone 2** — Multi-table joins + aggregation, with the indexing extension
7. **Window functions and recursive CTEs** — `OVER`/`PARTITION BY`, the rank family, `WITH RECURSIVE` → feeds Capstone 3
8. **Capstone 3** — Window functions + recursive hierarchy query
9. **Transactions and constraints** — `BEGIN`/`COMMIT`/`ROLLBACK`, foreign-key enforcement, ACID → feeds Capstone 4
10. **Capstone 4** — Bank-transfer transaction demo
11. **Beyond this guide** — signposts only
12. **Final assessment** + **Resources**

## Ecosystem-breadth triage

| Topic | Capstone-impact test | Treatment |
|---|---|---|
| Indexing / `EXPLAIN QUERY PLAN` | Directly, measurably changes Capstone 2's outcome | **Full**, as a Capstone 2 extension |
| Normalization theory (1NF–3NF/BCNF) | Capstone 1's schema is small enough not to need the formal theory | **Signpost** — a real reader should know it exists even if this guide's schemas don't require formally proving it |
| Stored procedures / triggers | SQLite has triggers but not stored procedures; neither is load-bearing for any capstone here | **Signpost** |
| PostgreSQL/MySQL dialect differences | Doesn't touch a capstone, but a substantive, honestly-named gap in what this guide's anchored toolchain represents | **Signpost**, not glossed over |
| Query planner internals beyond `EXPLAIN QUERY PLAN`'s surface reading | Doesn't change a capstone's correctness (the indexing session's own measured result does, and is taught in full) | **Signpost** |
| NoSQL / document-store contrast | Doesn't touch a capstone | **Signpost** |
| Datalog | Doesn't touch a capstone, but closes the loop back to the Prolog guide's own signpost | **Signpost**, with the cross-guide connection made explicit |

## Setup

None needed — confirmed already installed:

```bash
sqlite3 --version   # confirmed: 3.45.3 2024-04-15
```

Verification pattern used throughout this guide — run a script against an in-memory database, see real output, no persistent file left behind:

```bash
sqlite3 :memory: < script.sql
```

For anything needing a persistent file across multiple invocations (Capstone 4's transaction demo needs this):

```bash
sqlite3 mydb.db < script.sql
sqlite3 mydb.db "SELECT ...;"
```
