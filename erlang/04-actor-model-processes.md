# Module 4 — The Actor Model: Processes & Message Passing

By the end of this module you'll be able to spawn a lightweight process, send it messages, and have it maintain private state across messages — genuine share-nothing concurrency, a real structural contrast to every shared-memory concurrency mechanism this series has covered. Feeds Capstone 2.

## `spawn`, `!`, and `receive`

**You'll be able to:** create a new process, send it a message, and have it respond.

**Concept**

`spawn(Module, Function, Args)` starts a new, genuinely independent Erlang process — not an OS thread, a much lighter-weight construct the BEAM virtual machine manages directly, capable of running hundreds of thousands of them concurrently. `Pid ! Message` sends a message to a process (asynchronous — the sender never blocks waiting for it to be handled). `receive ... end` inside a process's own code pattern-matches against its incoming message queue, handling whichever message shape matches.

**Example**

```erlang
counter_loop(Count) ->
    receive
        increment ->
            counter_loop(Count + 1);
        {get, From} ->
            From ! {count, Count},
            counter_loop(Count);
        stop ->
            io:format("Counter stopping at ~p~n", [Count])
    end.

main() ->
    Pid = spawn(m3, counter_loop, [0]),
    Pid ! increment,
    Pid ! increment,
    Pid ! increment,
    Pid ! {get, self()},
    receive
        {count, N} -> io:format("Count is ~p~n", [N])
    end,
    Pid ! stop.
```

```
Count is 3
Counter stopping at 3
```

Verified directly: three `increment` messages, then a `{get, From}` message asking the counter process to report its current value back to `self()` (the caller's own process ID) — correctly reports `3`. `stop` cleanly terminates it, printing the final count.

> **The direct, precise contrast to `clojure/06-value-vs-identity-atoms.md`:** Clojure's `atom` protects **one** piece of shared mutable state, accessible from multiple threads, using compare-and-swap to prevent lost updates under concurrent access — the state itself is genuinely shared memory, just safely coordinated. Erlang's counter process holds its `Count` entirely privately — no other process, ever, has direct access to it. The *only* way to interact with it is by sending it a message and waiting for a reply; there is no shared memory to protect in the first place, because there is no shared memory at all. This is "share-nothing" concurrency, a genuinely different design point from "shared-memory, carefully synchronized" — not a better or worse choice universally, a different one.

> **Pitfall:** `counter_loop` recurses into itself (`counter_loop(Count + 1)`) as its *entire* looping mechanism — there's no separate "loop" construct for a process's main body; a process that stops recursing simply ends. This is the same tail-recursion-as-iteration idiom `scheme/05-tail-calls-iteration.md` verified directly, now serving double duty as both a process's loop *and* its private state, carried forward as the recursive call's own argument.

**Practice**

- Add a `{reset}` message to `counter_loop` that sets `Count` back to `0`, and confirm it works correctly interleaved with `increment` messages.
- Spawn *two* independent counters and confirm incrementing one has no effect whatsoever on the other's count — genuinely separate, private state.

## Progress check

1. What does `spawn(Module, Function, Args)` create, and how does it compare in weight to an OS thread?
2. Does `Pid ! Message` block the sender until the message is handled?
3. What does `receive` do inside a process's own code?
4. What's the real, structural difference between Erlang's counter process and Clojure's `atom`, in terms of what's actually shared between concurrent parts of the program?
5. Why does `counter_loop` need to call itself recursively rather than using a separate loop construct?

### Answers

1. A lightweight, BEAM-VM-managed process — genuinely capable of running hundreds of thousands concurrently, much lighter weight than an OS thread.
2. No — sending a message is asynchronous; the sender continues immediately without waiting for the message to be received or handled.
3. It pattern-matches against the process's own incoming message queue, running the body of whichever clause matches the next message actually received.
4. Clojure's `atom` protects one piece of genuinely shared memory, coordinated safely via compare-and-swap; Erlang's counter process holds its state entirely privately, with no shared memory at all — the only interaction is via message passing.
5. Because a process's entire looping mechanism *is* recursion — there's no separate loop construct for a process's main body; the recursive call both continues the loop and carries the process's current state forward as its own argument.
