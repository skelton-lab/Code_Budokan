# Module 1 — Foundations: Goroutines & Channels

By the end of this module you'll be able to launch a goroutine, communicate through a channel, and explain precisely how Go's concurrency model differs from both Clojure's shared-memory `atom` and Erlang's asynchronous actor mailboxes. Feeds Capstone 1.

## `go`: launching a lightweight concurrent function

**You'll be able to:** launch a function to run concurrently with `go`, and use a channel to wait for it to finish.

**Concept**

`go functionCall()` starts `functionCall` running concurrently — a **goroutine**, a lightweight, Go-runtime-managed unit of concurrency, not an OS thread (genuinely similar in spirit to Erlang's own lightweight processes, `erlang/04-actor-model-processes.md`). A **channel** (`make(chan Type)`) is a typed conduit for sending and receiving values between goroutines — `channel <- value` sends, `<-channel` receives.

**Example**

```go
done := make(chan bool)
go func() {
    fmt.Println("goroutine running")
    done <- true
}()
<-done
fmt.Println("main resumed after goroutine finished")
```

```
goroutine running
main resumed after goroutine finished
```

Verified directly: the anonymous goroutine's `fmt.Println` always runs *before* `"main resumed"` prints, guaranteed by the channel — `<-done` genuinely **blocks** `main` until the goroutine sends on `done`, an **unbuffered channel**, meaning the send and receive must happen at the same moment (a synchronous rendezvous), not merely "eventually."

> **The direct, precise contrast to Erlang's `!`:** `erlang/04-actor-model-processes.md`'s `Pid ! Message` is **asynchronous** — the sender never blocks, regardless of whether anything is ready to receive it. An unbuffered Go channel send **blocks** until a receiver is actually ready — genuinely different synchronization semantics, even though both are "message passing" in the broad sense. Confusing the two is a real, easy mistake for a reader coming from Erlang's own model.

**Practice**

- Remove `<-done` from the example and run it again — observe that `"main resumed"` may print *before* (or without ever seeing) the goroutine's own output, since nothing is blocking `main` from exiting early anymore.

## Buffered channels and a worker pool

**You'll be able to:** use a buffered channel to let sends proceed without an immediately-ready receiver, and distribute work across multiple goroutines reading from a shared channel.

**Concept**

`make(chan Type, N)` creates a **buffered** channel holding up to `N` values — a send only blocks once the buffer is full, not on every single send the way an unbuffered channel does. Multiple goroutines can read from the *same* channel — each value sent is received by exactly one of them, a natural way to distribute work across a pool.

**Example**

```go
func worker(id int, jobs <-chan int, results chan<- int) {
    for j := range jobs {
        results <- j * 2
    }
}

func main() {
    jobs := make(chan int, 5)
    results := make(chan int, 5)

    for w := 1; w <= 3; w++ {
        go worker(w, jobs, results)
    }
    for j := 1; j <= 5; j++ {
        jobs <- j
    }
    close(jobs)

    total := 0
    for a := 1; a <= 5; a++ {
        total += <-results
    }
    fmt.Println("Total:", total)
}
```

```
Total: 30
```

Verified directly: three worker goroutines share the single `jobs` channel — each of the five jobs (`1` through `5`) is picked up by exactly one worker, doubled, and sent to `results`. `close(jobs)` signals workers' `for j := range jobs` loops to end once every job has been consumed. The total, `2+4+6+8+10 = 30`, matches exactly — confirming every job was processed exactly once, by *some* worker, with no job lost or duplicated across the pool.

> **Pitfall:** `<-chan int` and `chan<- int` in `worker`'s own signature are **directional channel types** — `jobs <-chan int` means "this function can only receive from `jobs`," `results chan<- int` means "this function can only send to `results`." This isn't enforced by convention; the compiler rejects a receive attempt on a send-only-typed parameter, a real, useful safety net for a function that should only ever move data in one specific direction through a given channel.

**Practice**

- Change the buffered `jobs`/`results` channels to unbuffered (`make(chan int)`, no capacity argument) and confirm the worker pool still produces the correct total — reasoning through why blocking sends/receives don't actually break this particular program's correctness, just its exact scheduling.

## Progress check

1. What's the real difference between a goroutine and an OS thread, in terms of how it's managed?
2. What does an unbuffered channel's send/receive pair guarantee, precisely?
3. How does that guarantee differ from Erlang's `!` (send)?
4. What does `close(jobs)` signal to goroutines reading from `jobs` via `for j := range jobs`?
5. What do the directional channel types `<-chan int` and `chan<- int` restrict, and is that restriction enforced by convention or by the compiler?

### Answers

1. A goroutine is a lightweight, Go-runtime-managed unit of concurrency, not an OS thread — genuinely similar in spirit to Erlang's own lightweight processes, much cheaper to create in large numbers than OS threads would be.
2. That the send and receive happen at the same moment — a synchronous rendezvous; the sender blocks until a receiver is actually ready to receive.
3. Erlang's `!` is asynchronous — the sender never blocks, regardless of whether anything is ready to receive the message; an unbuffered Go channel send genuinely blocks until a receiver is ready.
4. That no more values will ever be sent on `jobs` — once every already-sent value has been received, the `range` loop ends cleanly rather than blocking forever waiting for a value that will never come.
5. `<-chan int` restricts a parameter to receive-only; `chan<- int` restricts it to send-only — enforced by the compiler, which rejects an attempt to use a directionally-typed channel parameter in the disallowed direction.
