# Final Assessment

Across all eight modules and three capstones. Work through these before running anything — precision in your own reasoning is the actual test.

1. What's the real difference between a goroutine and an OS thread?
2. What does an unbuffered channel's send/receive pair guarantee, and how does that differ from Erlang's `!`?
3. In Capstone 1, why was the concurrent version of the prime-counting program *slower* for small numbers but ~3.3× *faster* for large ones?
4. What real, general lesson does that two-sided result teach about concurrency claims?
5. What does a Go type need to do to satisfy an interface — declare it explicitly, or something else?
6. Verified directly: does a type missing a required interface method fail at compile time or runtime, and how does that compare to Ruby's duck typing?
7. In Capstone 2, how did `fmt.Printf`'s `%v` verb correctly use `Circle`'s and `Rectangle`'s `String()` methods without either type declaring `Stringer` anywhere?
8. What's the real, structural difference between Go's `(result, error)` pattern and Haskell's `Either String Int`, regarding how easy each is to accidentally ignore?
9. Verified directly: what happened when `safeDivide`'s error was discarded with `_`?
10. What order do multiple `defer` statements run in, relative to each other?
11. What's the real, idiomatic distinction between when to use an `error` return versus `panic`?
12. Where does `recover()` need to be called for it to have any effect?
13. In Capstone 3, what confirmed that a single record's unexpected panic didn't take down the rest of the batch?
14. What's the real, structural difference this guide draws between Go's `recover` and Erlang's supervisor-based recovery?
15. What real, honest limitation does blanket `recover` usage carry, verified directly in Capstone 3?

## Answers

1. A goroutine is a lightweight, Go-runtime-managed unit of concurrency, not an OS thread — much cheaper to create in large numbers.
2. It guarantees the send and receive happen at the same moment (a synchronous rendezvous), with the sender blocking until a receiver is ready; Erlang's `!` is asynchronous and never blocks the sender, regardless of whether anything is ready to receive.
3. Because checking primality of small numbers is genuinely cheap, so the overhead of spawning goroutines and coordinating channels exceeded the actual work being parallelized; checking primality of large numbers is genuinely expensive per item, so that same overhead became negligible relative to the real work saved by parallelizing it.
4. That "concurrency makes things faster" is not a universal truth — whether it pays off depends on how much real work is actually being parallelized relative to the coordination overhead, and this needs to be measured directly rather than assumed.
5. It simply needs to have methods matching the interface's required signatures — no explicit declaration connects a type to an interface at all.
6. At compile time, verified directly with a precise error naming the exact missing method; Ruby's duck typing has no such check, and a missing method only surfaces as a runtime error the first time it's actually called.
7. Because both types implement `Stringer` (Go's standard-library interface requiring only `String() string`) implicitly, purely by having that method — `fmt.Printf` detects and uses it automatically, with no registration or explicit connection between the types and the standard library needed.
8. Go's `(result, error)` keeps the result's own type identical (`int`) whether or not the call succeeded, letting a caller discard the separate error value with one extra character (`_`); Haskell's `Either String Int` makes the success/failure distinction part of the value's own type, requiring active pattern-matching to extract a plain value at all.
9. It compiled with zero warnings, ran with zero errors, and printed `0` (the zero-value default for `int`) with nothing distinguishing it from a genuine, intended result.
10. LIFO order — the most recently deferred call runs first, the earliest deferred call runs last.
11. `error` is for expected, ordinary failure conditions a caller should routinely check for; `panic` is reserved for genuinely unexpected situations a normal caller isn't expected to defensively check for every time.
12. Directly inside a deferred function, during an active panic — calling it anywhere else simply returns `nil` and does nothing.
13. The record immediately following the deliberately crash-triggering one (`"Ivy, 28"`) still processed correctly, and the batch's own completion message printed at the end, confirming every record was attempted despite the panic.
14. `recover` catches a panic within the same function call, at the point `defer` was registered, with no separate process involved; Erlang's supervisor recovers by spawning an entirely new, separate process, the right tool when the failing unit has ongoing state or identity worth genuinely restarting rather than just retrying inline.
15. That `recover` catches *any* panic indiscriminately, with no way to distinguish an anticipated, deliberately-triggered case from a genuinely new, unrelated bug — both get reported identically as "unexpected," a real limitation of treating blanket recovery as a universal safety net.
