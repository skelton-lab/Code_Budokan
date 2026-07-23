# Module 8 — Fearless Concurrency: Threads, `Arc`/`Mutex`, Channels

Rust's pitch for concurrency isn't a new runtime model — `std::thread::spawn` maps directly to a real OS thread, no green-thread scheduler underneath, unlike `go/`'s goroutines or `erlang/`'s lightweight processes. What's genuinely distinctive is what the *type system* does to concurrent code: the exact same ownership and borrowing rules from Modules 1–2 apply across thread boundaries, and a real data race is rejected before the program compiles, not caught later by a runtime tool. Feeds Capstone 3.

## `thread::spawn`: real OS threads, ownership enforced across the boundary

**You'll be able to:** spawn a thread, `join` it, and explain why a spawned closure typically needs the `move` keyword.

**Concept**

`thread::spawn(closure)` runs `closure` on a new OS thread and returns a `JoinHandle`; calling `.join()` on that handle blocks the current thread until the spawned one finishes. A closure passed to `thread::spawn` almost always needs the `move` keyword — forcing it to take ownership of whatever it captures — because the compiler can't otherwise guarantee the captured data will still be valid for as long as the spawned thread might run.

**Example**

```rust
use std::thread;

fn main() {
    let data = vec![1, 2, 3];
    let handle = thread::spawn(move || {
        println!("from thread: {:?}", data);
    });
    handle.join().unwrap();
    println!("main resumed");
}
```

```
from thread: [1, 2, 3]
main resumed
```

> **Pitfall / gotcha:** `.join()` itself returns a `Result` (Module 4's mechanism again) — a spawned thread that panics doesn't crash the whole program the way an unhandled exception might in some languages; `.join()` returns `Err` instead, and it's the calling code's choice whether to `.unwrap()` it (propagating the crash) or handle it gracefully.

**Practice**

- Spawn three threads, each printing its own index (`0`, `1`, `2`), and `.join()` all three before `main` exits.
- Predict, then verify: what happens if `handle.join()` is never called at all — does `main` wait for the spawned thread anyway?

## `Arc<Mutex<T>>`: shared mutable state, made safe by the type system

**You'll be able to:** share mutable state safely across threads using `Arc<Mutex<T>>`, and explain what each of the two wrapper types is responsible for.

**Concept**

`Mutex<T>` wraps a value and requires calling `.lock()` (which blocks until the lock is available, then returns a guard granting exclusive access) before touching it — the mutual-exclusion half of the story. `Arc<T>` ("atomically reference-counted") is a thread-safe, shared-ownership pointer — the "more than one thread needs to own this" half. Together, `Arc<Mutex<T>>` is Rust's standard idiom for state genuinely shared and mutated across threads, directly comparable to `julia/`'s or `clojure/`'s own thread-safe mutable-state primitives.

**Example**

```rust
use std::sync::{Arc, Mutex};
use std::thread;

fn main() {
    let counter = Arc::new(Mutex::new(0));
    let mut handles = vec![];
    for _ in 0..10 {
        let counter = Arc::clone(&counter);
        let handle = thread::spawn(move || {
            let mut num = counter.lock().unwrap();
            *num += 1;
        });
        handles.push(handle);
    }
    for handle in handles {
        handle.join().unwrap();
    }
    println!("counter result: {}", *counter.lock().unwrap());
}
```

```
counter result: 10
```

Verified directly — ten threads, each incrementing a shared counter once, correctly totaling `10` every run, with no lost updates. Compare directly to `clojure/03-capstone-concurrent-counter.md`'s own verified finding: ten unprotected JVM threads incrementing a shared counter 10,000 times each lost 79,181 of the expected 100,000 updates — the exact failure `Mutex` exists to prevent, and which Rust's borrow checker, covered next, refuses to even compile an unprotected version of.

> **Pitfall / gotcha:** `counter.lock().unwrap()` — the `.unwrap()` is real and necessary here, not decorative: `.lock()` returns a `Result`, because a `Mutex` can become "poisoned" if a thread holding the lock panics mid-access, and `.unwrap()` is the common (if blunt) way of propagating that failure rather than silently continuing with possibly-corrupted state.

**Practice**

- Change the loop count to 1,000 threads and confirm the result is still exactly correct.
- Write a small program using `Arc<Mutex<Vec<i32>>>` where 5 threads each push their own index onto a shared vector, then print the final vector's length.

## `mpsc` channels: message passing, contrasted with Go's CSP model

**You'll be able to:** send and receive values over an `mpsc` channel, and state the one concrete difference from Go's channel semantics verified in `go/01-foundations-goroutines-channels.md`.

**Concept**

`std::sync::mpsc::channel()` returns a `(Sender, Receiver)` pair — multiple producers, single consumer (`mpsc`). `tx.send(value)` and `rx.recv()`/`rx.iter()` move ownership of `value` across the channel, the same "ownership moves, doesn't copy" rule from Module 1, now applied across a thread boundary instead of within one function.

**Example**

```rust
use std::sync::mpsc;
use std::thread;

fn main() {
    let (tx, rx) = mpsc::channel();
    thread::spawn(move || {
        for i in 1..=5 {
            tx.send(i).unwrap();
        }
    });
    let sum: i32 = rx.iter().sum();
    println!("channel sum: {}", sum);
}
```

```
channel sum: 15
```

Verified directly.

> **Pitfall / gotcha:** `go/01-foundations-goroutines-channels.md` verified that an *unbuffered* Go channel send genuinely blocks until a receiver is ready — a synchronous rendezvous. Rust's `mpsc::channel()` (an *unbounded* channel by default) does not block the sender the same way: `tx.send()` succeeds immediately regardless of whether `rx` is currently reading, buffering internally as needed. Rust does have a bounded, synchronous-rendezvous equivalent — `mpsc::sync_channel(0)` — but it isn't the default the way Go's unbuffered channel is; a reader porting Go-shaped concurrency idioms directly needs to reach for it explicitly rather than assume the plain `channel()` behaves the same way.

**Practice**

- Replace `mpsc::channel()` with `mpsc::sync_channel(0)` in the example above, and verify it still produces the correct sum.
- Write a program with two sender clones (`tx.clone()`) sending from two separate threads into the same channel, and one receiver collecting all values.

## Progress check

1. Does `thread::spawn` create a real OS thread or a lightweight green thread?
2. Why do closures passed to `thread::spawn` typically need the `move` keyword?
3. What are `Arc<T>` and `Mutex<T>` each individually responsible for in `Arc<Mutex<T>>`?
4. Verified directly: ten threads incrementing a shared `Arc<Mutex<i32>>` counter once each — what was the final result, and why is that notable compared to `clojure/`'s own unprotected-thread finding?
5. What's the one concrete difference, verified directly, between Rust's default `mpsc::channel()` and Go's unbuffered channel?

**Answers**

1. A real OS thread — no green-thread scheduler underneath, unlike Go's goroutines or Erlang's processes.
2. Because the compiler can't otherwise prove the captured data will remain valid for as long as the spawned thread might run; `move` forces the closure to take ownership instead of borrowing.
3. `Arc<T>` provides thread-safe shared ownership (multiple threads can hold a reference to the same data); `Mutex<T>` provides exclusive access via `.lock()`, preventing simultaneous mutation.
4. Exactly `10`, correct every run — verified directly. Notable because `clojure/03-capstone-concurrent-counter.md` verified the *unprotected* version of this exact scenario lost 79,181 of 100,000 expected updates; `Mutex` is precisely the mechanism that prevents that class of loss.
5. Rust's default `mpsc::channel()` is unbounded and doesn't block the sender; Go's unbuffered channel, verified in `go/01-foundations-goroutines-channels.md`, blocks the sender until a receiver is ready. Rust's `mpsc::sync_channel(0)` is the closer analogue, but isn't the default.
