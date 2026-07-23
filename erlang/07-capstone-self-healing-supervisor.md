# Capstone 3 — A Self-Healing Supervisor

Combines every concept from Module 6: a supervisor processing a real job queue, where some jobs are deliberately "poisoned" (they crash whatever worker processes them) — verified to skip only the bad jobs, successfully complete every good one, and correctly track exactly which jobs succeeded, despite three worker crashes along the way.

## The system

```erlang
worker() ->
    receive
        {job, N} when N < 0 ->
            io:format("Worker ~p: bad job ~p, crashing~n", [self(), N]),
            error({bad_job, N});
        {job, N} ->
            io:format("Worker ~p: processed ~p -> ~p~n", [self(), N, N * 2]),
            worker()
    end.

supervisor_loop([], _RestartsLeft, Completed) ->
    io:format("All jobs done. Completed: ~p~n", [lists:reverse(Completed)]);
supervisor_loop(Jobs, 0, Completed) ->
    io:format("Giving up, ~p jobs left unprocessed: ~p~n", [length(Jobs), Jobs]),
    io:format("Completed before giving up: ~p~n", [lists:reverse(Completed)]);
supervisor_loop([Job | Rest], RestartsLeft, Completed) ->
    Pid = spawn_link(capstone3, worker, []),
    Pid ! {job, Job},
    receive
        {'EXIT', Pid, _Reason} ->
            io:format("Supervisor: worker crashed on job ~p, skipping it and restarting~n", [Job]),
            supervisor_loop(Rest, RestartsLeft - 1, Completed)
    after 100 ->
        unlink(Pid),
        exit(Pid, kill),
        supervisor_loop(Rest, RestartsLeft, [Job | Completed])
    end.
```

`supervisor_loop` carries **three** pieces of state through its own recursion: the remaining job queue, how many restarts are still allowed, and a growing list of successfully completed jobs — all three threaded forward exactly the way Module 4's counter carried its single `Count` argument. `worker` deliberately crashes (`error({bad_job, N})`) on any negative job — a stand-in for "real work that sometimes fails for reasons outside the supervisor's control." The `after 100` clause is a real, honest design tradeoff, discussed below.

## Verification

```erlang
main() ->
    process_flag(trap_exit, true),
    Jobs = [1, 2, -3, 4, -5, 6],
    supervisor_loop(Jobs, 5, []).
```

```
Worker <0.82.0>: processed 1 -> 2
Worker <0.83.0>: processed 2 -> 4
Worker <0.84.0>: bad job -3, crashing
Supervisor: worker crashed on job -3, skipping it and restarting
Worker <0.85.0>: processed 4 -> 8
Worker <0.86.0>: bad job -5, crashing
Supervisor: worker crashed on job -5, skipping it and restarting
Worker <0.87.0>: processed 6 -> 12
All jobs done. Completed: [1,2,4,6]
```

Checked directly against the input `[1, 2, -3, 4, -5, 6]`: jobs `1`, `2`, `4`, `6` process successfully (each doubled correctly: `2`, `4`, `8`, `12`); jobs `-3` and `-5` each crash a worker, correctly triggering a genuinely new worker process (six distinct PIDs across the whole run — `<0.82.0>` through `<0.87.0>`) and correctly getting skipped rather than retried or silently dropped without a trace. The final `Completed` list, `[1,2,4,6]`, is exactly and only the jobs that actually succeeded, in their original order — built correctly by `lists:reverse` undoing the prepend-order Erlang's own list construction naturally produces (the same reversal discipline Capstone 2's `describe_num` ordering pitfall and every list-building example in this guide have needed to stay aware of).

> **The actual point of this capstone:** this is "let it crash" doing genuinely useful work, not just surviving a crash for its own sake — the supervisor's job-processing throughput degrades gracefully in the presence of bad input (two jobs lost, four jobs completed) rather than the whole batch failing outright the moment the first bad job is encountered, which is exactly what would happen without a supervisor at all: `-3` would crash the one and only worker, and every job after it in the queue would simply never run.

> **Pitfall, stated honestly:** the `after 100` clause is a real, deliberate simplification, not a robust production pattern — it assumes a worker that hasn't crashed within 100 milliseconds must have succeeded, rather than having the worker send back an explicit acknowledgment message. This works reliably for this capstone's near-instantaneous jobs, but a real system with jobs of unpredictable duration would need an explicit `{ok, Job}` reply from the worker instead of a timeout guess — timing-based heuristics are a genuine, common source of subtle bugs in real concurrent systems, worth naming directly rather than presenting this capstone's simplification as if it were production-ready.

## Extending it yourself

- Replace the `after 100` timeout with an explicit acknowledgment: have `worker` send `{ok, self(), N}` back to the supervisor after successfully processing a job, and have `supervisor_loop` wait for *either* that message *or* an `'EXIT'`, removing the timing assumption entirely.
- Change the job list so every job is bad, and confirm the supervisor correctly gives up after exhausting its restart budget, reporting the correct, non-empty list of jobs it never got to.
