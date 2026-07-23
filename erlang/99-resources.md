# Resources & Cheat Sheet

## References

| Resource | Why it matters |
|---|---|
| [Erlang/OTP documentation](https://www.erlang.org/doc/) | The anchored toolchain's own authoritative reference |
| *Learn You Some Erlang for Great Good!* (Fred Hébert) | Freely available online, a widely-recommended, approachable full introduction |
| This series' [Prolog guide](../prolog/03-capstone-kinship.md) | The exact kinship problem Capstone 1 reimplemented directly |
| This series' [Clojure guide](../clojure/06-value-vs-identity-atoms.md) | The shared-memory concurrency model Capstone 2 contrasted against throughout |

## One-page cheat sheet

| Idea | Where |
|---|---|
| `X = Value` — pattern matching, not assignment; fails on a genuine mismatch | Module 1 |
| Multi-clause functions, tried top to bottom, most specific pattern first | Module 2 |
| `[H\|T]` — borrowed directly from Prolog's own list notation | Module 2 |
| `parent(_, _) -> false.` — an explicit catch-all where Prolog would just fail | Capstone 1 |
| `spawn(Mod, Fun, Args)` — a lightweight, BEAM-managed process, not an OS thread | Module 4 |
| `Pid ! Message` — asynchronous send; `receive` — pattern-match the mailbox | Module 4 |
| Share-nothing state: a process's own recursion argument, never touched externally | Capstone 2 |
| `spawn_link` + crash propagation by default | Module 6 |
| `process_flag(trap_exit, true)` — turn a linked crash into an ordinary message | Module 6 |
| "Let it crash" — the worker doesn't defend itself; a supervisor recovers | Capstone 3 |
| ETS — the real, deliberate exception to share-nothing | Beyond This Guide |

## A note on this guide's verification tier

Every code example in this guide was compiled with `erlc` and run — no example was written from memory of the language's documentation and left unverified. This guide's own Capstone 3 went through a real redesign after an earlier attempt hit a genuine race condition (a globally registered process name being re-registered too soon after a crash) — rather than papering over it with a longer sleep, the capstone was rebuilt to avoid the race entirely, and that reasoning is documented directly in this guide's own overview rather than hidden.

## Where to go now

This guide closes the direct historical loop this series opened with `prolog/` — Erlang's own first implementation, written in Prolog in 1986, and the pattern-matching syntax that carried forward from it into the language Erlang eventually became. From here, `INDEX.md`'s remaining queued candidates — Go, Rust, and Rails — are all still open.
