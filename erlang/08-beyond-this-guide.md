# Module 8 — Beyond This Guide

Every topic here failed the capstone-impact test — real, worth knowing exists, but not required by any of this guide's three capstones. Each entry states what it is, why it matters, and where to go deeper.

### Full OTP behaviors: `gen_server` and the real `supervisor`

**What it is:** Capstone 3 hand-built a supervisor from `spawn_link`/`trap_exit`/recursion — real, working, and genuinely illustrative of the underlying mechanism. Production Erlang code almost never does this by hand; it uses OTP's own `gen_server` (a standardized "process with state and a request/reply protocol" behavior) and `supervisor` (a standardized, configurable restart-strategy behavior) instead.

**Why it matters:** OTP's own implementations handle real edge cases this guide's hand-built version doesn't (a supervisor's own crash, mixed restart strategies for different worker types, restart-frequency limits) — the concept Capstone 3 demonstrated is exactly what these behaviors formalize and harden.

**Where to go next:** the official Erlang/OTP documentation's `gen_server` and `supervisor` behavior guides — the natural, direct next step from this guide's own Capstone 3.

### Distributed Erlang

**What it is:** Erlang nodes can connect to each other across a network, with `spawn`/`!`/`receive` working transparently across node boundaries — a process on one machine can message a process on another using the same syntax this guide used for same-machine processes.

**Why it matters:** this is a huge part of Erlang's real-world reputation (the telecom systems it was built for are inherently distributed), but none of this guide's capstones needed more than one node to demonstrate their core ideas.

**Where to go next:** the Erlang/OTP documentation's Distributed Erlang chapter.

### Hot code loading

**What it is:** a running Erlang system can load a new version of a module's code *while it's still running*, with existing processes optionally switching to the new code without restarting — a genuinely famous capability, part of why some Erlang-based telecom systems have run for years without a full restart.

**Why it matters:** a real, distinctive capability with no equivalent in most languages this series has covered, but not something any of this guide's capstones needed to demonstrate their core concepts.

**Where to go next:** the Erlang/OTP documentation's code-loading chapter.

### ETS tables: shared, in-memory storage

**What it is:** despite this guide's emphasis on share-nothing process state, Erlang also provides ETS (Erlang Term Storage) — genuine shared, mutable, in-memory tables any process can read or write directly, verified directly:
```erlang
Tab = ets:new(mytab, [set]),
ets:insert(Tab, {alice, 30}),
io:format("~p~n", [ets:lookup(Tab, alice)]),
io:format("~p~n", [ets:lookup(Tab, missing)]).
```
```
[{alice,30}]
[]
```
Confirmed working — a real key-value store, genuinely shared across processes, the closest thing in Erlang to the shared-memory model this entire guide contrasted against.

**Why it matters:** worth knowing directly, since it means "Erlang is share-nothing" isn't a universal, unbreakable rule — ETS is a real, deliberate escape hatch for the cases where genuinely shared state is the right tool, used carefully.

**Where to go next:** the Erlang/OTP documentation's ETS chapter.

## The wider ecosystem

- **[Erlang/OTP documentation](https://www.erlang.org/doc/)** — the anchored toolchain's own authoritative reference.
- **_Learn You Some Erlang for Great Good!_** (Fred Hébert) — freely available online, a widely-recommended, approachable full introduction.
- **This series' [Prolog guide](../prolog/03-capstone-kinship.md)** — the exact kinship problem this guide's Capstone 1 reimplemented directly.
- **This series' [Clojure guide](../clojure/06-value-vs-identity-atoms.md)** — the shared-memory concurrency model this guide's Capstone 2 contrasted against throughout.
