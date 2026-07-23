# Module 11 — Beyond This Guide

Every topic here failed the capstone-impact test (00-overview.md's ecosystem-breadth triage table) — none of them change how Capstones 1–4 turn out, and none are required by an exercise you've been assigned. That's a scoping decision, not an oversight: each entry says what it is, why it matters, and where to go deeper when you actually need it.

### PostgreSQL and MySQL: where SQLite genuinely diverges

**What it is:** this guide's anchored toolchain, named honestly rather than presented as representative "SQL" in general. PostgreSQL enforces column types strictly by default (no equivalent of Module 1's silent `TEXT`-into-`INTEGER` storage without `STRICT`), has a full role/permission system for multi-user access control, and ships a genuine procedural language (PL/pgSQL) for stored procedures and functions. MySQL, depending on its configured SQL mode, similarly enforces stricter typing than SQLite's default and has its own stored-procedure syntax. Both run as real client-server processes, not an embedded, single-file library the way SQLite does.

**Why it matters:** every one of this guide's capstones runs correctly against SQLite specifically — a reader taking this guide's schemas directly to a Postgres or MySQL job should expect `STRICT`-table behavior to be closer to that database's *default*, not its exception, and should expect a real permission system and stored procedures to be available where SQLite has neither.

**Where to go next:** the [PostgreSQL documentation](https://www.postgresql.org/docs/) and its own tutorial, for the industry-standard, full-featured comparison point.

### Stored procedures and triggers

**What it is:** SQLite has no stored-procedure language (no PL/pgSQL equivalent), but it does support **triggers** — a block of SQL that runs automatically in response to an `INSERT`/`UPDATE`/`DELETE` on a table, referencing the old and new row values via `OLD`/`NEW`.

**Why it matters:** none of this guide's four capstones needed automatic, database-side reaction to a data change — Capstone 4's bank transfer deliberately used explicit, application-level `BEGIN`/`COMMIT`/`ROLLBACK` instead, exactly the discipline Module 9 built toward. Triggers are a real, different way to enforce invariants (audit logging, denormalized-column maintenance) directly in the schema rather than in application code.

**Minimal taste**, verified directly:

```sql
CREATE TRIGGER log_balance_change AFTER UPDATE OF balance ON accounts
BEGIN
    INSERT INTO audit_log(account_id, old_balance, new_balance)
    VALUES (OLD.id, OLD.balance, NEW.balance);
END;
```

Confirmed: updating `accounts.balance` correctly and automatically inserts a matching row into `audit_log`, with no application code triggering it explicitly.

**Where to go next:** the [SQLite `CREATE TRIGGER` documentation](https://www.sqlite.org/lang_createtrigger.html); PostgreSQL's PL/pgSQL documentation for the fuller stored-procedure comparison.

### Query planner internals beyond `EXPLAIN QUERY PLAN`'s surface reading

**What it is:** Module 5's `EXPLAIN QUERY PLAN` reads `SCAN` vs. `SEARCH USING INDEX` at face value — genuinely useful, and enough to explain this guide's measured 130× speedup. The full picture underneath (cost-based optimization, how SQLite's planner estimates row counts and chooses join order, `ANALYZE` and the statistics tables it produces) is a considerably deeper, database-internals-level topic.

**Why it matters:** doesn't change any capstone's correctness — Capstone 2's honest finding (the indexing extension's plan *didn't* change on a five-row table, and Module 5's own indexing session already explained precisely why) is exactly the depth this guide's capstones needed. Understanding *how* the planner decides, rather than just reading what it decided, is the next layer down.

**Where to go next:** the [SQLite query planner documentation](https://www.sqlite.org/queryplanner.html), the most detailed public account of any single database's planner internals, freely available.

### Normalization theory

**What it is:** a formal framework (1NF, 2NF, 3NF, BCNF, and further normal forms beyond that) for reasoning precisely about whether a schema has redundancy or update anomalies — data that has to be kept in sync by hand across multiple rows, or facts that can't be represented without also representing unrelated facts.

**Why it matters:** every schema in this guide (customers/orders, employees, accounts) was small and simple enough to design correctly by intuition, without needing to formally verify it against the normal forms. A real, large schema — dozens of tables, evolved over years — is exactly where the formal theory earns its keep, catching a design flaw intuition alone would miss.

**Where to go next:** any standard database textbook's normalization chapter (C.J. Date's *An Introduction to Database Systems* is the classic reference); the Wikipedia article on database normalization is a solid, practical starting summary.

### NoSQL and document stores

**What it is:** databases (MongoDB, DynamoDB, and others) that store data as flexible, often-nested documents rather than fixed-schema rows in tables, generally trading some of SQL's strong consistency and join guarantees for schema flexibility and different scaling characteristics.

**Why it matters:** doesn't touch any capstone — every one of this guide's four capstones is precisely the kind of structured, relationship-heavy data (customers and their orders, an org chart, account balances) the relational model was built for. Worth knowing the alternative exists for the genuinely different case: data that doesn't have a stable, predictable shape, or that needs to scale in ways a single relational database doesn't.

**Where to go next:** the MongoDB documentation's own comparison of document stores to relational databases, written from the other side of the same trade-off.

### Datalog: closing the loop back to Prolog

**What it is:** named directly in `prolog/10-beyond-this-guide.md` as a signpost from that guide's side — a deliberately restricted subset of Prolog (no compound terms as arguments, guaranteed termination) that's also, simultaneously, relational-algebra-complete. It's used as a real, production query language in some modern databases and program-analysis tools.

**Why it matters:** this guide's own overview opened by naming SQL and Prolog's shared ancestry in predicate logic (Codd's relational model, Kowalski's logic programming) rather than treating it as coincidence. Datalog is the concrete, single language sitting at the actual intersection of both — syntactically closer to Prolog's `Head :- Body` rules, but restricted specifically to guarantee the same relational completeness and termination properties this entire SQL guide's queries have relied on implicitly.

**Where to go next:** Datalog's Wikipedia article for the formal definition and its relationship to both Prolog and relational algebra; Google's Logica project (compiles a Python-embedded syntax to SQL) as a concrete, modern example of Datalog-adjacent ideas compiling directly to the SQL this guide taught.

### The wider ecosystem

- **[SQLite documentation](https://www.sqlite.org/docs.html)** — the complete reference for this guide's entire anchored toolchain, including every feature used here (`STRICT` tables, window functions, `WITH RECURSIVE`, `EXPLAIN QUERY PLAN`) in full depth beyond this guide's capstone-driven scope.
- **[Use The Index, Luke!](https://use-the-index-luke.com/)** — a free, thorough, database-agnostic deep dive on indexing specifically, the natural next step after Module 5's measured introduction.
- **[SQL style guide (Simon Holywell)](https://www.sqlstyle.guide/)** — a widely-referenced formatting and naming-convention reference, useful the moment a schema grows past what this guide's small capstones needed to worry about.
