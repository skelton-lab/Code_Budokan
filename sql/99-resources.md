# Resources & Cheat Sheet

## References

| Resource | Why it matters |
|---|---|
| [SQLite documentation](https://www.sqlite.org/docs.html) | The complete reference for this guide's entire anchored toolchain |
| [SQLite query planner documentation](https://www.sqlite.org/queryplanner.html) | Module 5/6's `EXPLAIN QUERY PLAN` sessions, in full depth |
| [Use The Index, Luke!](https://use-the-index-luke.com/) | A free, database-agnostic deep dive on indexing — the natural next step after Module 5 |
| [PostgreSQL documentation](https://www.postgresql.org/docs/) | Module 11's dialect-difference signpost, in full — the industry-standard comparison point |
| C.J. Date, *An Introduction to Database Systems* | The classic reference for normalization theory (Module 11) beyond this guide's intuitively-designed schemas |
| This series' [Prolog guide](../prolog/00-overview.md) | The genuine, unforced shared ancestry (Codd's relational model and Kowalski's logic programming, both grounded in predicate logic) named directly in this guide's overview — and Module 7's recursive-CTE-as-Prolog-rule callback specifically |
| This series' [ALGOL guide](../algol/01-foundations-history.md) | Named in the Prolog guide as BNF's origin — relevant here only indirectly, through the shared Prolog connection, not a direct SQL callback |

## One-page cheat sheet

| Idea | Where |
|---|---|
| Type affinity (not strict typing by default), `STRICT` tables | Module 1 |
| `PRIMARY KEY` / rowid reuse rule: "one more than the current maximum," recomputed fresh | Module 1 |
| `NOT NULL`, `UNIQUE` (allows multiple `NULL`s), `CHECK` | Module 1 |
| `INSERT`/`UPDATE`/`DELETE`, `WHERE`/`ORDER BY`/`LIMIT`, `LIKE`/`IN`/`BETWEEN` | Module 2 |
| No-`WHERE` danger: preview with `SELECT` first | Module 2 |
| `INNER`/`LEFT`/`RIGHT`/`FULL OUTER JOIN` — verified row counts 3/4/4/5 on the same schema | Module 4 |
| `GROUP BY` + `count`/`sum`/`avg`/`min`/`max`; `count(*)` vs. `count(column)` and `NULL` | Module 5 |
| `HAVING` (filters groups, after aggregation) vs. `WHERE` (filters rows, before) | Module 5 |
| `EXPLAIN QUERY PLAN`: `SCAN` vs. `SEARCH USING INDEX`; measure, don't assume | Module 5 |
| `OVER`/`PARTITION BY`, `ROW_NUMBER`/`RANK`/`DENSE_RANK`, running `SUM() OVER (ORDER BY ...)` | Module 7 |
| `WITH RECURSIVE`: anchor `UNION ALL` recursive member — same shape as a Prolog recursive rule | Module 7 |
| `BEGIN`/`COMMIT`/`ROLLBACK` — failure does NOT auto-rollback the whole transaction | Module 9 |
| `PRAGMA foreign_keys = ON;` — off by default, per-connection, not persisted | Module 9 |
| `CREATE TRIGGER ... AFTER UPDATE ... BEGIN ... OLD/NEW ... END;` | Beyond This Guide |

## Verification technique used throughout this guide

```bash
sqlite3 :memory: < script.sql
```

Run a script against an in-memory database, see real output, nothing persisted afterward — this guide's answer to "run it and check," matching every other guide in this series' insistence on executed, not predicted, results. Every code example, every measured timing (the 1,000,000-row indexing comparison, Capstone 4's bank-transfer balances), and every quiz answer in this guide was checked this way — including a real error this guide's own first draft made about rowid reuse, caught specifically by re-running the claim rather than trusting the first plausible-looking result.

## Where to go now

SQL closes out as the series' second declarative language in a row, immediately after Prolog — and unlike most of this series' pairings, the connection isn't a forced thematic echo, it's real shared intellectual history (Codd and Kowalski, both grounded in predicate logic, with Datalog sitting at the literal intersection). The habit this guide leaned on hardest — measuring, not asserting, performance and correctness claims (the indexing timings, the rowid-reuse correction, the bank-transfer's mid-transaction "missing money" moment) — is the same discipline every guide in this series has insisted on since Fortran's `v(::-1)` error prompted the whole project's verification methodology in the first place. From here, per this series' stated sequencing (`INDEX.md`): the **Python/PyTorch/Keras group, plus Docker** as a fundamental (non-language) deployment technology.
