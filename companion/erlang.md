# Companion — Erlang (Budokan Concurrent/Systems Lineage)

**Founding document:** Armstrong, J. (2003). "Making Reliable Distributed Systems in the Presence of Software Errors." PhD Thesis, Royal Institute of Technology, Stockholm. — sourced directly from the Code Budokan Reading Workbook, Strand C (named there as "Budokan Module 18 founding document" in the body text, though the workbook's own later master appendix table assigns module 18 to Rust instead — a real inconsistency in the source document itself, noted here transparently rather than silently resolved one way or the other).

## Historical note

Armstrong's own thesis states Erlang's entire design philosophy in three words the Code Budokan workbook quotes directly: "let it crash." The argument, genuinely counterintuitive on first encounter: a system explicitly designed to fail gracefully, with failures isolated and supervised, is *more* reliable than one designed with the goal of never failing at all — because the second goal is unachievable at scale, and pretending otherwise just means failures happen in uncontrolled, unsupervised ways instead. `erlang/06-let-it-crash-supervisors.md`/`erlang/07-capstone-self-healing-supervisor.md` build this directly rather than quoting it as a slogan: a real supervisor that restarts a genuinely crashed process, verified working.

`erlang/00-overview.md` names a connection this companion's own Prolog entry (`prolog.md`) sets up from the other side: Erlang's first implementation was **literally written in Prolog** (Ericsson, 1986), and Erlang's own syntax still shows it directly — single-assignment pattern matching (Erlang's `=` is Prolog's own unification, not assignment, verified in `erlang/01-foundations-pattern-matching.md` to fail with a real error when a bound variable is rebound to a conflicting value) and `[H|T]` list notation, borrowed directly, not independently reinvented.

## Reflection prompts

- Armstrong's central argument is that designing for graceful failure beats designing to prevent failure entirely. `rust/09-capstone-concurrent-counter-data-race.md` takes the opposite philosophical stance — prevent an entire bug class from compiling at all, rather than recovering from it gracefully at runtime. Which philosophy would you choose for a system where a crash is expensive (a payment processor) versus one where a crash is cheap (a chat bot)?
- Erlang's own actor model (share-nothing, message-passing concurrency) is a real, structural contrast to Clojure's shared-memory `atom` (companion note: `erlang/00-overview.md` names this directly). Which model would you reach for first if you needed ten independent workers that never touch each other's state, versus one shared counter ten workers all need to update?

## Short-answer questions

1. **What is Erlang's own three-word design philosophy, and what real capstone in `code-rookie`'s Erlang guide builds it rather than just stating it?** "Let it crash" — `erlang/07-capstone-self-healing-supervisor.md` builds a real, working supervisor that restarts a genuinely crashed process.
2. **What direct, literal (not merely similar) connection does `erlang/01-foundations-pattern-matching.md` verify between Erlang's `=` and Prolog?** That Erlang's `=` is Prolog's own unification, not assignment — verified directly, binding an already-bound Erlang variable to a conflicting value fails with a real error, exactly like a Prolog variable refusing to unify with a conflicting value.
3. **What real inconsistency exists in the Budokan workbook's own source material regarding Erlang's module number, noted transparently in this companion rather than silently resolved?** The workbook's own body text names Armstrong's 2003 thesis as the "Budokan Module 18 founding document," but the workbook's later master appendix table assigns module 18 to Rust instead — a real drift within the source document itself, not something this companion invented or needs to force a resolution to.

## Links into the guide

- [`erlang/01-foundations-pattern-matching.md`](../erlang/01-foundations-pattern-matching.md) — the direct, verified Prolog-unification connection.
- [`erlang/06-let-it-crash-supervisors.md`](../erlang/06-let-it-crash-supervisors.md)/[`erlang/07-capstone-self-healing-supervisor.md`](../erlang/07-capstone-self-healing-supervisor.md) — "let it crash," built and verified.

## Cross-thread connection

The Budokan workbook's own master table pairs the actor model generally with Park et al.'s 2023 Generative Agents paper — the connection is genuine and specific: Hewitt's own 1973 actor-model paper (companion: `simula.md`'s cross-thread note) was itself an AI paper, trying to model intelligence as concurrent message-passing agents, decades before Park et al.'s own multi-agent generative-agent architecture applied a structurally similar idea (independent units, communicating only through observable interaction) to LLM-powered characters specifically. Erlang is the actor model's own most direct, most successful real-world implementation — a straight line from a 1973 AI paper to a 1986 telecommunications system to 2023's own multi-agent AI architectures.
