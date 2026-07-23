# Module 5 — Coroutines

`SYSTEM` exports one more genuinely distinctive facility: primitives for **coroutines** — independent execution contexts that explicitly hand control back and forth to each other, rather than running truly in parallel or being scheduled preemptively by an operating system. This series' very next guide, Simula, has its own, independently-designed coroutine mechanism (`detach`/`resume`) — a real, worth-naming connection between two languages that arrived at a similar concept from different directions. Documented throughout — see `00-overview.md`'s toolchain note.

## `NEWPROCESS` and `TRANSFER`: coroutines as explicit hand-offs

**You'll be able to:** explain what a coroutine is, and how Modula-2's two low-level primitives create and switch between them.

**Concept, documented:**

A coroutine is like a procedure that can be *paused* mid-execution and resumed later, exactly where it left off, rather than running start-to-finish in one uninterrupted call. `SYSTEM.NEWPROCESS(procedure, workspace, workspaceSize, resultProcess)` creates a new coroutine from an ordinary procedure, giving it its own private stack (the `workspace`). `SYSTEM.TRANSFER(fromProcess, toProcess)` explicitly hands control from the currently-running coroutine to another one — the *only* way control ever moves between coroutines; there's no automatic scheduler deciding when to switch, the way an operating system's threads would be scheduled.

**Example, documented (not executed — see the overview's toolchain note):**

```modula2
MODULE CoroutineDemo;

FROM SYSTEM IMPORT ADDRESS, NEWPROCESS, TRANSFER;
FROM InOut IMPORT WriteString, WriteLn;

VAR
  main, worker: ADDRESS;
  workspace: ARRAY [0..1023] OF WORD;

PROCEDURE WorkerTask;
BEGIN
  WriteString("worker: step 1");
  WriteLn;
  TRANSFER(worker, main);
  WriteString("worker: step 2");
  WriteLn;
  TRANSFER(worker, main);
END WorkerTask;

BEGIN
  NEWPROCESS(WorkerTask, ADR(workspace), SIZE(workspace), worker);
  WriteString("main: before handing off");
  WriteLn;
  TRANSFER(main, worker);
  WriteString("main: worker paused itself, back here");
  WriteLn;
  TRANSFER(main, worker);
  WriteString("main: worker finished its second step");
  WriteLn;
END CoroutineDemo.
```

Every `TRANSFER` is an explicit statement, naming exactly which coroutine gains control and which one is giving it up — there's no implicit switching at all. `WorkerTask` runs its first `WriteString`, then genuinely *pauses itself* at `TRANSFER(worker, main)`, handing control back to `main` at exactly that point; when `main` later calls `TRANSFER(main, worker)` again, `WorkerTask` resumes executing immediately after its own `TRANSFER` call, not from the beginning.

> **The real, direct connection to this series' next guide:** Simula (1967), designed over a decade before Modula-2, independently arrived at essentially the same underlying idea — an execution context that can be explicitly paused and resumed, rather than run to completion in one call — via its own `detach`/`resume` mechanism, covered in that guide's own coroutines module. Modula-2's `TRANSFER` and Simula's `detach`/`resume` are not the same syntax, and were not designed by people collaborating with each other — but both are real, independently-arrived-at solutions to the identical underlying problem (cooperative, explicitly-controlled multitasking without an OS-level scheduler), which is exactly the kind of genuine convergent-design connection worth naming precisely rather than overstating as direct influence.

> **Pitfall:** because `SYSTEM.TRANSFER` is a low-level primitive, not a structured control-flow construct, it's the programmer's own responsibility to ensure a coroutine that's handed control never simply "falls off the end" without transferring control back to something — an ordinary procedure returning to its caller when it finishes is automatic; a coroutine's execution context has no equivalent automatic hand-back unless the coroutine's own code calls `TRANSFER` explicitly before it ends.

**Practice**

- Trace, step by step, exactly which `WriteString` calls execute and in what order, for the `CoroutineDemo` example above — write out the interleaved output by hand before checking it against the code's own comment-implied sequence.
- Compare this module's `TRANSFER`-based coroutine directly against `pascal/`'s ordinary procedure calls — what's the one fundamental capability a coroutine has that an ordinary Pascal procedure call, however deeply nested, does not?

## Progress check

1. What does a coroutine let a program do that an ordinary procedure call does not?
2. What does `SYSTEM.NEWPROCESS` create, and what does it need to be given (beyond the procedure itself) to do so?
3. What does `SYSTEM.TRANSFER` do, and what's genuinely absent compared to how an operating system schedules threads?
4. What's the precise, honest relationship between Modula-2's coroutines and Simula's — direct influence, or independent convergence on a similar idea?
5. What real responsibility falls on the programmer specifically because `TRANSFER` is a low-level primitive rather than a structured control-flow construct?

### Answers

1. It lets execution genuinely pause partway through, at an arbitrary point, and later resume exactly where it left off — an ordinary procedure call always runs start to finish (or until it explicitly returns) in one uninterrupted execution, with no way to pause it mid-body and resume it later from that exact point.
2. It creates a new coroutine from an ordinary procedure; beyond the procedure itself, it needs a private workspace (a block of memory to serve as that coroutine's own stack) and the workspace's size, so the coroutine has somewhere to keep its own execution state independent of whatever else is running.
3. It explicitly hands control from one named coroutine to another, with no automatic scheduling involved at all — genuinely absent, compared to an OS thread scheduler, is any notion of automatic, time-sliced, or preemptive switching; control only ever moves when a `TRANSFER` call explicitly says so.
4. Independent convergence, not direct influence — Simula (1967) predates Modula-2 by over a decade and was designed with no connection to it; both languages arrived at a similar underlying idea (an explicitly pausable and resumable execution context) through separate design processes, which is worth stating precisely rather than implying either one influenced the other.
5. Ensuring a coroutine never simply finishes executing without an explicit `TRANSFER` handing control somewhere else first — unlike an ordinary procedure, which automatically returns control to its caller when it ends, a coroutine has no automatic equivalent unless its own code calls `TRANSFER` before it's done.
