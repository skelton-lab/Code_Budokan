# Capstone 3 — A Concurrent Counter, and the Data Race Rust Won't Compile

Combines Module 8: a real, correct concurrent prime-counting workload — deliberately the same shape as `go/02-capstone-worker-pool.md`'s own capstone, measured the same honest way (twice, on genuinely different-sized inputs, real numbers reported either way) — and then the actual centerpiece: the identical class of bug that workload's Go original avoided using channels, attempted here with no synchronization at all, and rejected outright by `rustc` before a binary exists.

## The concurrent prime counter

```rust
use std::sync::{Arc, Mutex};
use std::thread;

fn is_prime(n: u64) -> bool {
    if n < 2 { return false; }
    let mut i = 2;
    while i * i <= n {
        if n % i == 0 { return false; }
        i += 1;
    }
    true
}

fn count_primes_sequential(start: u64, end: u64) -> usize {
    (start..end).filter(|&n| is_prime(n)).count()
}

fn count_primes_concurrent(start: u64, end: u64, num_workers: u64) -> usize {
    let count = Arc::new(Mutex::new(0usize));
    let chunk_size = (end - start) / num_workers;
    let mut handles = vec![];

    for w in 0..num_workers {
        let chunk_start = start + w * chunk_size;
        let chunk_end = if w == num_workers - 1 { end } else { chunk_start + chunk_size };
        let count = Arc::clone(&count);
        handles.push(thread::spawn(move || {
            let local_count = (chunk_start..chunk_end).filter(|&n| is_prime(n)).count();
            *count.lock().unwrap() += local_count;
        }));
    }
    for h in handles { h.join().unwrap(); }
    let result = *count.lock().unwrap();
    result
}
```

Each thread counts primes over its own disjoint chunk entirely independently — no shared state at all during the actual work — and only takes the `Mutex` lock once, to add its own local count into the shared total. This is deliberately the lowest-contention shape of shared-state concurrency: real parallel work, one brief synchronized step at the end.

## Verification

```rust
fn main() {
    let start = std::time::Instant::now();
    let seq_small = count_primes_sequential(2, 200_000);
    let seq_small_time = start.elapsed();

    let start = std::time::Instant::now();
    let conc_small = count_primes_concurrent(2, 200_000, 4);
    let conc_small_time = start.elapsed();

    println!("small range: sequential {} primes in {:?}", seq_small, seq_small_time);
    println!("small range: concurrent {} primes in {:?}", conc_small, conc_small_time);
    assert_eq!(seq_small, conc_small);

    let base = 100_000_000_000u64;
    let start = std::time::Instant::now();
    let seq_large = count_primes_sequential(base, base + 20_000);
    let seq_large_time = start.elapsed();

    let start = std::time::Instant::now();
    let conc_large = count_primes_concurrent(base, base + 20_000, 4);
    let conc_large_time = start.elapsed();

    println!("large range: sequential {} primes in {:?}", seq_large, seq_large_time);
    println!("large range: concurrent {} primes in {:?}", conc_large, conc_large_time);
    assert_eq!(seq_large, conc_large);
}
```

```
small range: sequential 17984 primes in 15.451333ms
small range: concurrent 17984 primes in 6.37475ms
large range: sequential 779 primes in 524.176625ms
large range: concurrent 779 primes in 180.001917ms
```

Verified directly, twice, on genuinely different-sized inputs, both `rustc`-compiled with no optimization flags (matching this guide's stated `rustc file.rs -o binary` convention throughout). Both runs report identical, correct prime counts to their sequential baseline (`assert_eq!` never fired). Unlike `go/02-capstone-worker-pool.md`'s own honestly two-sided result — concurrency ~5× *slower* there on the cheap, small-number workload, because goroutine-and-channel coordination overhead exceeded the actual work being parallelized — this workload's real, measured numbers show concurrency *faster* in both regimes on this machine: ~2.4× on the small range, ~2.9× on the large one. That's a genuinely different, equally honest finding, not a contradiction of Go's — real OS threads with a single lock acquisition per thread carry less coordination overhead than goroutines communicating results back over a channel per unit of work, and this capstone's chunked design (one lock per *thread*, not one per *item*) keeps contention minimal even on cheap work. The point both guides make is identical even though the numbers point different directions: measure the actual workload, don't assume either "concurrency is always faster" or "concurrency is always risky overhead" from reputation.

## The data race Rust won't compile

The same underlying shape — ten threads sharing one counter — attempted with a naive shared `counter` variable and no `Mutex` at all, the version a reader coming from a language with unchecked shared memory might reach for first:

```rust
use std::thread;

fn main() {
    let mut counter = 0;
    let mut handles = vec![];
    for _ in 0..10 {
        let handle = thread::spawn(|| {
            counter += 1; // captures counter by reference across threads, no sync
        });
        handles.push(handle);
    }
    for handle in handles {
        handle.join().unwrap();
    }
    println!("{}", counter);
}
```

Compiling this directly with `rustc`:

```
error[E0373]: closure may outlive the current function, but it borrows `counter`, which is owned by the current function
error[E0499]: cannot borrow `counter` as mutable more than once at a time
error[E0502]: cannot borrow `counter` as immutable because it is also borrowed as mutable
```

Verified directly — three separate, real compile errors, and **no binary is ever produced**. This is the guide's central, honest claim, made concrete: `go/`'s own Module 8 verified `go run -race` catching the identical class of bug — an unsynchronized counter incremented by concurrent goroutines — but only *after* compiling and running the program, and only if someone remembered to pass `-race` in the first place. Rust's version never compiles at all, with no special flag required to catch it; the borrow checker's ordinary rule from Module 2 (one mutable borrow at a time) is the *same* mechanism used here, simply applied to a closure that happens to cross a thread boundary.

> **The direct, honest comparison to `c/`, `cpp/`, and `go/`:** `c/` and `cpp/` catch memory errors with ASan/UBSan — real, valuable tools, but *runtime* instrumentation that only reports a bug if the exact buggy code path actually executes during a test run. `go/`'s race detector is the same shape: a runtime tool, opt-in, only as good as the test coverage exercising it. Rust's borrow checker catches this specific class of concurrency bug statically, for every possible execution, without running the program at all — a genuinely stronger guarantee for this one bug class, not a strictly better tool in every respect (Rust's checker can't catch every category of bug ASan can, like use of uninitialized memory read through `unsafe`, covered as a signpost in Module 14).

## Extending it yourself

- Change `count_primes_concurrent`'s worker count from `4` to `2` and to `8`, and measure whether more workers keeps helping or starts to hurt on this machine.
- Fix the data-race example by wrapping `counter` in `Arc<Mutex<i32>>`, following Module 8's pattern, and confirm it now compiles and produces the correct result (`10`, one increment per thread).
