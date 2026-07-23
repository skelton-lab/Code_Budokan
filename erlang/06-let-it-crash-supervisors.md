# Module 6 — Let It Crash: Links, Trapping Exits, and Supervisors

By the end of this module you'll be able to link two processes, trap the notification when a linked process crashes, and use that notification to restart it — Erlang's most famous design principle, made concrete rather than left as a slogan. Feeds Capstone 3.

## `spawn_link` and `trap_exit`

**You'll be able to:** link a process to its spawner, and receive a real, structured notification when it crashes.

**Concept**

`spawn_link(Module, Function, Args)` — like `spawn`, but also creates a **link** between the new process and the one that spawned it. By default, if a linked process crashes, the link propagates that crash to the other end, killing it too (a deliberate, real behavior — "if this dependency dies, so should I," useful in its own right). `process_flag(trap_exit, true)` changes this for the *calling* process specifically: instead of dying when a linked process crashes, it receives an ordinary `{'EXIT', Pid, Reason}` message it can pattern-match against like any other.

**Example**

```erlang
worker() ->
    io:format("Worker ~p starting, will crash immediately~n", [self()]),
    Zero = 0,
    1 / Zero.

main() ->
    process_flag(trap_exit, true),
    Pid = spawn_link(m4e, worker, []),
    receive
        {'EXIT', Pid, Reason} ->
            io:format("Caught worker exit: ~p~n", [Reason])
    end.
```

```
Worker <0.82.0> starting, will crash immediately
Caught worker exit: {badarith,[{m4e,worker,0,...}]}
```

Verified directly: `worker` genuinely crashes (division by zero, a real `badarith` error) — and because `main` called `trap_exit` first, that crash arrives as an ordinary message, `{'EXIT', Pid, Reason}`, rather than taking `main` down with it.

> **Pitfall:** without `trap_exit`, a linked process's crash *would* propagate and kill the caller too — this is Erlang's actual default, and it's a deliberate design choice, not an oversight: crashes are meant to propagate by default, and *not* propagating (via `trap_exit`) is the explicit exception a supervisor process opts into specifically so it can react instead of dying alongside its worker.

**Practice**

- Remove `process_flag(trap_exit, true)` from the example above, run it again, and observe that `main` itself now terminates when `worker` crashes, rather than catching the `'EXIT'` message.

## The supervisor pattern: detect, log, restart

**You'll be able to:** write a process that spawns a worker, waits for it to crash, and automatically respawns it — a bounded number of times before giving up.

**Concept**

Combining `spawn_link` and `trap_exit` with recursion (Module 4's own "recursion as a process's loop" idiom) produces a real supervisor: spawn a worker, wait for its `'EXIT'`, spawn a *new* one, repeat — with a counter tracking how many restarts remain before giving up entirely.

**Example**

```erlang
supervisor_loop(0) ->
    io:format("Supervisor giving up: too many restarts~n");
supervisor_loop(RestartsLeft) ->
    Pid = spawn_link(m4e, worker, []),
    io:format("Supervisor started worker ~p (restarts left: ~p)~n", [Pid, RestartsLeft]),
    receive
        {'EXIT', Pid, Reason} ->
            io:format("Supervisor saw crash: ~p~n", [Reason]),
            supervisor_loop(RestartsLeft - 1)
    end.

main() ->
    process_flag(trap_exit, true),
    supervisor_loop(3).
```

```
Supervisor started worker <0.82.0> (restarts left: 3)
Worker <0.82.0> starting, will crash immediately
Supervisor saw crash: {badarith,...}
Supervisor started worker <0.83.0> (restarts left: 2)
Worker <0.83.0> starting, will crash immediately
Supervisor saw crash: {badarith,...}
Supervisor started worker <0.84.0> (restarts left: 1)
Worker <0.84.0> starting, will crash immediately
Supervisor saw crash: {badarith,...}
Supervisor giving up: too many restarts
```

Verified directly, the complete cycle: three full crash-detect-restart cycles, each producing a genuinely new worker process (a new PID each time — `<0.82.0>`, `<0.83.0>`, `<0.84.0>`), followed by the supervisor correctly giving up once `RestartsLeft` reaches `0`.

> **The actual point of this module, and Erlang's real reputation:** "let it crash" doesn't mean "don't handle errors" — it means the *worker* doesn't need defensive error-checking scattered through its own logic at all (`worker`'s body here is completely unguarded, dividing by zero without a second thought), because a *separate* process, the supervisor, is responsible for noticing failure and recovering from it. This is a genuinely different allocation of responsibility from every other language in this series, where error handling is normally the failing code's own job (OCaml's `Either`, Haskell's `Maybe`, COBOL's `ON SIZE ERROR`) rather than an entirely separate process's.

> **Pitfall:** this module's supervisor is a real, working, hand-built demonstration of the *concept* — production Erlang code uses OTP's own battle-tested `supervisor` behavior (Module 8 signposts it) rather than hand-rolling this exact pattern, which has real edge cases (what if the supervisor itself crashes? what if two different worker types need different restart strategies?) OTP's own implementation already handles correctly.

**Practice**

- Change `supervisor_loop`'s starting restart count and confirm the number of restart cycles before giving up matches exactly.
- Modify `worker` so it *doesn't* always crash (say, a random chance), and observe the supervisor's restart count only decrementing on genuine crashes, not successful runs.

## Progress check

1. What does `spawn_link` do that plain `spawn` doesn't?
2. What's Erlang's *default* behavior when a linked process crashes, before `trap_exit` is considered?
3. What does `process_flag(trap_exit, true)` change, specifically?
4. In the supervisor example, what confirmed that each restart genuinely produced a *new* worker process, not the same one somehow recovering?
5. What's the real allocation-of-responsibility difference "let it crash" represents, compared to every other language's error-handling approach in this series?

### Answers

1. It creates a link between the new process and the one that spawned it, so a crash in either one can propagate to the other by default.
2. The crash propagates through the link, killing the linked process too — a deliberate default, not an oversight.
3. It makes the calling process receive a linked process's crash as an ordinary `{'EXIT', Pid, Reason}` message it can pattern-match against, instead of being killed by the propagating crash.
4. Each restart's worker had a genuinely different process ID (`<0.82.0>`, `<0.83.0>`, `<0.84.0>`), confirming a brand-new process was spawned each time, not the same one somehow continuing.
5. In every other language in this series, error handling is normally the failing code's own responsibility (a typed return value, an exception the same code raises, an explicit range check); in Erlang's "let it crash" model, the failing process doesn't need to defend itself at all — a separate, dedicated supervisor process is responsible for noticing failure and deciding how to recover.
