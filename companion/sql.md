# Companion — SQL (Budokan Module 8)

**Founding papers:** Codd, E.F. (1970). "A Relational Model of Data for Large Shared Data Banks." *Communications of the ACM*, 13(6), 377–387. ANSI SQL standard (1986). — sourced directly from the Code Budokan Reading Workbook, Strand C, and confirmed independently in the History-of-Computing document's own [Era IV profile of Codd](history/era-4-software-revolution.md).

## Historical note

Codd's own paper, written while he was a mathematician at IBM San Jose, replaced two dominant, considerably more complicated data models (hierarchical and network databases) with something genuinely simpler: data as tables (relations), rows (tuples), and columns (attributes), connected by keys and queried using relational algebra — a small, closed set of operations (selection, projection, join, and a few others) that could express any query the earlier models needed far more machinery to support. The Code Budokan history's own verdict is precise: "the model was so clean and so powerful that it replaced the then-dominant hierarchical and network database models entirely." SQL (1974, standardized 1986) is the query-language interface built on top of Codd's own relational algebra, not a separate invention — every `SELECT` `sql/02-crud-queries.md` teaches is, underneath, a relational-algebra expression in more approachable syntax.

`sql/00-overview.md` names a connection this companion's own Prolog entry (`prolog.md`) makes from the other direction: Codd's 1970 relational model and Robert Kowalski's 1979 logic-programming formula both trace to predicate logic — not a coincidence, a shared ancestry the guide states directly rather than treats as background trivia. `sql/07-window-functions-cte.md`'s own recursive CTEs are named as the direct structural echo of Prolog's own recursive predicates (`prolog/02-recursion-backtracking-lists.md`'s `ancestor/2`) — anchor case and recursive case, in two different syntaxes for the same underlying idea.

## Reflection prompts

- Codd's relational model replaced two "then-dominant" alternatives entirely, within roughly a decade. What made the relational model's own simplicity (tables, keys, a small closed operation set) a decisive advantage over models that had already achieved real commercial deployment?
- `sql/09-transactions-constraints.md` covers what a database actually guarantees, not just what syntax runs without erroring. Read this alongside `rails/04-associations-has-many-belongs-to.md`'s own verified finding that a real database-level foreign key constraint holds even when an ORM's own validation layer is bypassed — what does this tell you about where "the database is the actual source of truth" shows up across completely different eras of `code-rookie`'s own construction?

## Short-answer questions

1. **What two data models did Codd's relational model replace, and roughly how completely, per the Code Budokan history's own verdict?** Hierarchical and network database models — replaced "entirely," within about a decade of Codd's 1970 paper, according to the history document's own assessment.
2. **What shared ancestry does `sql/00-overview.md` name directly between SQL and Prolog, rather than treating as coincidental?** Both trace to predicate logic — Codd's relational model and Kowalski's logic-programming formulation are, in this specific sense, siblings, not independent inventions that happen to resemble each other.
3. **What real, verified structural echo does `sql/07-window-functions-cte.md` draw between recursive CTEs and Prolog?** That SQL's own recursive CTE (anchor query, `UNION ALL`, recursive member) is the direct structural equivalent of Prolog's own recursive predicate (base case, recursive case) — `sql/07-window-functions-cte.md` names `prolog/02-recursion-backtracking-lists.md`'s `ancestor/2` directly as the comparison.

## Links into the guide

- [`sql/07-window-functions-cte.md`](../sql/07-window-functions-cte.md) — recursive CTEs, the direct structural echo of Prolog's own recursion.
- [`sql/09-transactions-constraints.md`](../sql/09-transactions-constraints.md) — what a database actually guarantees, the same foreign-key/constraint discipline `rails/04-associations-has-many-belongs-to.md` later confirms holds even underneath an ORM.

## Cross-thread connection

The Budokan workbook's own master table pairs SQL with Lewis et al.'s 2020 RAG (Retrieval-Augmented Generation) paper — "retrieval is relational thinking" — and separately names the user's own co-authored Calderbank.AI paper (Snoswell, Skelton & Hunter, 2023) as a Hunter-thread connection, since it applied ML classifiers to a legal database problem. The RAG connection is genuine: a RAG system's core operation — retrieve the relevant rows/documents first, then condition generation on exactly those — is, structurally, a `SELECT` with a similarity-based `WHERE` clause instead of an exact-match one; the underlying instinct (don't reason over everything, retrieve only what's actually relevant first) is the same relational-thinking discipline `sql/04-joins.md`/`sql/05-aggregation-indexing.md` already teach, applied to unstructured text instead of structured rows.
