# Module 5 — Coroutines and Discrete-Event Simulation

The other half of what "SIMULA" actually means — not just the class concept everyone remembers, but the coroutine mechanism that made simulating many independent, quasi-parallel entities possible in the first place. Documented, not executed; less directly relevant to C++ than Modules 2–4, but this is why the language exists at all.

## Coroutines: `detach` and `resume`

**You'll be able to:** explain what a coroutine is, and how it differs from an ordinary procedure call.

**Concept, documented:**

An ordinary procedure call runs to completion (or until it calls something else) before returning control to its caller — it has no memory of "where it was" across separate invocations. A **coroutine** is different: it can **suspend itself mid-execution**, handing control back to whoever activated it, while retaining its own local state exactly as it was — and later, something can **resume** it, continuing from precisely the point it suspended, as if no time had passed from the coroutine's own perspective.

Simula's class objects could act as coroutines using **`Detach`** (an object suspends its own execution, returning control to its caller, without losing its local state) and **`Resume`**/**`Call`** (transferring control to a specific, previously-detached object, continuing it from exactly where it left off).

**Why this matters for simulation specifically:** a discrete-event simulation needs many independent entities — ships, customers, machines — that each have their own ongoing "story" (a sequence of things happening to them over simulated time), but that need to take turns actually executing, since a real computer only runs one thing at a time. Coroutines are exactly the mechanism that makes this practical: each simulated entity is an object that runs a bit, detaches (suspends) when it's done something for now, and gets resumed later — by a scheduler tracking simulated time — to continue its own story exactly where it left off, with all of its own local state intact.

> **This predates, and is conceptually related to, ideas you'll meet again.** Coroutines as a general control-flow mechanism resurface directly in modern languages — Ruby's `Fiber` (signposted in your Ruby guide's Module 9) is a direct conceptual descendant, and JavaScript's generator functions (signposted in your JavaScript guide) solve a closely related problem. Simula's `Detach`/`Resume` is an early, direct ancestor of that whole family of ideas, decades before it became common outside simulation-specific contexts.

**Practice**

- Write, in your own words, why an ordinary (non-coroutine) procedure call couldn't model "many independent entities taking turns" the way `Detach`/`Resume` does — what specifically would be lost about each entity's state if it had to fully return and be called again from scratch each time?
- Compare this directly against Ruby's `Fiber` (your Ruby guide's Beyond-This-Guide module) — read that signpost now with this module's context and note how closely the description matches.

## The SIMULATION class and simulated time

**You'll be able to:** describe, in outline, how Simula's simulation-specific class library used coroutines to model simulated time passing.

**Concept, documented:**

Built on top of the coroutine mechanism, Simula provided a `SIMULATION` class framework: simulated entities (each their own class, using `Detach`/`Resume`) are scheduled against a simulated clock, with a scheduler activating whichever entity's next event is due soonest, letting it run (and detach again, or schedule its own next event), and advancing simulated time accordingly. This is the literal mechanism behind "simulate a harbor with ships arriving and departing" or "simulate a queue with customers arriving and being served" — each ship or customer is an object, coroutine-scheduled against simulated time.

> **This is the part of Simula that's genuinely less directly relevant to C++** than Modules 2–4 — Stroustrup's synthesis (Module 6) took the class and virtual-procedure ideas, not the coroutine/simulation-scheduling framework. It's included here because it's the actual reason the language is shaped the way it is, and because understanding *why* Simula needed persistent, resumable objects in the first place makes the class concept itself feel like a necessary invention rather than an arbitrary design choice.

**Practice**

- In one paragraph, connect this module back to Module 1: how does "discrete-event simulation" as the original problem explain both the class concept (Module 2, independent stateful entities) *and* coroutines (this module, entities that take turns over simulated time) as two necessary pieces of the same original goal?

## Progress check

1. What can a coroutine do that an ordinary procedure call can't?
2. What do `Detach` and `Resume` each do, specifically?
3. Why does simulating many independent entities specifically need coroutines, rather than ordinary procedure calls?
4. Name a modern language feature, signposted elsewhere in this series, that's a direct conceptual descendant of Simula's coroutines.
5. Why is this module's content described as "less directly relevant to C++" than Modules 2–4?

### Answers

1. Suspend itself mid-execution, retaining its own local state exactly as it was, and later be resumed from precisely that point — an ordinary procedure call has no such memory across separate invocations; each call starts fresh.
2. `Detach` suspends the currently-executing object's execution, returning control to its caller, while preserving its local state. `Resume` (or `Call`) transfers control to a specific, previously-detached object, continuing it from exactly where it left off.
3. Because each entity needs its own persistent, in-progress state (partway through its own sequence of events) while only one entity can actually be executing on a real computer at any moment — coroutines let entities take turns without losing their individual progress between turns.
4. Ruby's `Fiber` (signposted in the Ruby guide's Module 9) — a direct conceptual descendant of the same suspend/resume mechanism.
5. Because Stroustrup's synthesis into "C with Classes" (Module 6) took the class concept and virtual procedures specifically — the coroutine/simulated-time scheduling framework wasn't part of what carried forward into C++'s design.
