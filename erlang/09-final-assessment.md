# Final Assessment

Across all eight modules and three capstones. Work through these before running anything — precision in your own reasoning is the actual test.

1. What does Erlang's `=` actually do, and what direct, verified connection does this guide draw to `prolog/`?
2. What happens when you attempt to bind an already-bound variable to a different value, versus the same value?
3. How does Erlang decide which clause of a multi-clause function to run for a given call?
4. What real, verified mistake resulted from placing `describe_num(N) -> {other, N}` before `describe_num(0) -> zero`, and how did the compiler catch it?
5. What does `[H|T]` match, and where does that exact notation come from?
6. In Capstone 1, what real limit did this guide state honestly about the Prolog comparison — what transferred, and what genuinely didn't?
7. What does `spawn(Module, Function, Args)` create, and how does it compare in weight to an OS thread?
8. What's the real, structural difference between Erlang's counter/account processes and Clojure's `atom`, regarding what's actually shared?
9. In Capstone 2, why does every `withdraw` interaction require a genuine two-step conversation (send, then receive)?
10. What does `spawn_link` do that plain `spawn` doesn't, and what's Erlang's default behavior when a linked process crashes?
11. What does `process_flag(trap_exit, true)` change, specifically?
12. In Capstone 3, what confirmed that each restart genuinely produced a new worker process rather than the same one recovering?
13. What real, honest limitation did Capstone 3 state about its own `after 100` timeout mechanism?
14. What's the real allocation-of-responsibility difference "let it crash" represents, compared to every other error-handling approach in this series?
15. What real, deliberate exception to Erlang's "share-nothing" philosophy did Module 8 name directly, with a verified working example?

## Answers

1. It performs pattern matching, not assignment — succeeding by binding an unbound variable or confirming an already-bound one matches; this guide verified it as the identical underlying idea as Prolog's own unification, not merely a similar-looking syntax.
2. Binding to a different value fails with a real `{badmatch, _}` error; binding to the same value it already holds succeeds, since that's a genuine match.
3. It tries each clause's pattern (and guard, if present), in the order written, top to bottom, running the body of the first one that matches.
4. `describe_num(0)` returned `{other, 0}` instead of `zero`, because the unbound variable pattern `N` in the first clause matches anything, including `0`, permanently shadowing the second clause — caught directly by a real compiler warning naming the exact issue before the code was even run.
5. A non-empty list, binding `H` to its first element and `T` to the remaining elements — the exact same notation Prolog uses for the identical purpose, borrowed directly.
6. That pattern-matching syntax and semantics transferred directly (multi-clause functions, structural matching); Prolog's automatic backtracking search did not — `grandparent`/`sibling` needed explicit enumeration via `lists:any`, since Erlang has no engine automatically trying every possible binding.
7. A lightweight, BEAM-VM-managed process, genuinely capable of running in the hundreds of thousands concurrently — much lighter weight than an OS thread.
8. Clojure's `atom` protects one piece of genuinely shared memory, coordinated safely via compare-and-swap; Erlang's processes hold their state entirely privately, with zero shared memory at all — interaction only happens through message passing.
9. Because sending a message is asynchronous and doesn't itself return a result — a caller expecting a reply has to explicitly `receive` it as a separate step, unlike an ordinary function call's single call-and-return.
10. It creates a link between the new process and its spawner, so a crash in either can propagate to the other; by default, a linked process's crash *does* propagate and kill the other end, unless that end has opted out via `trap_exit`.
11. It makes the calling process receive a linked process's crash as an ordinary `{'EXIT', Pid, Reason}` message instead of being killed by the propagating crash.
12. Each restart's worker had a genuinely different process ID, visibly different across the whole run — confirming a brand-new process was spawned each time.
13. That it assumes a worker which hasn't crashed within 100 milliseconds must have succeeded, rather than an explicit acknowledgment message — a real, honest simplification that works for near-instantaneous jobs but wouldn't be robust for jobs of unpredictable duration in a genuine production system.
14. Every other language in this series makes error handling the failing code's own responsibility; Erlang's "let it crash" model lets the failing process skip defensive error-checking entirely, delegating recovery to a separate, dedicated supervisor process instead.
15. ETS (Erlang Term Storage) tables — genuine, shared, mutable, in-memory storage any process can read or write directly, verified with a real `ets:new`/`ets:insert`/`ets:lookup` example — a deliberate, real escape hatch from the share-nothing default, not a claim that Erlang has no shared-state mechanism at all.
