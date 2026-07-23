# Capstone 1 — A Concurrent Worker Pool

Combines every concept from Module 1: a worker pool checking primality across a batch of numbers, measured both sequentially and concurrently — with a genuinely two-sided, honest result: concurrency made the *cheap* version slower, and the *expensive* version 3.3× faster, both real, both measured, neither the "right" universal answer.

## The program

```go
func isPrime(n int) bool {
    if n < 2 {
        return false
    }
    for i := 2; i*i <= n; i++ {
        if n%i == 0 {
            return false
        }
    }
    return true
}

func countPrimesSequential(nums []int) int {
    count := 0
    for _, n := range nums {
        if isPrime(n) {
            count++
        }
    }
    return count
}

func primeWorker(nums <-chan int, results chan<- bool) {
    for n := range nums {
        results <- isPrime(n)
    }
}

func countPrimesConcurrent(nums []int, numWorkers int) int {
    jobs := make(chan int, len(nums))
    results := make(chan bool, len(nums))
    for w := 0; w < numWorkers; w++ {
        go primeWorker(jobs, results)
    }
    for _, n := range nums {
        jobs <- n
    }
    close(jobs)
    count := 0
    for i := 0; i < len(nums); i++ {
        if <-results {
            count++
        }
    }
    return count
}
```

`countPrimesConcurrent` is Module 1's worker-pool pattern applied directly: `numWorkers` goroutines pull from a shared `jobs` channel, each computing `isPrime` independently and sending its own boolean result to `results` — genuine parallel work, not merely interleaved.

## Verification: small numbers, cheap work

```go
nums := make([]int, 0)
for i := 2; i < 200000; i++ {
    nums = append(nums, i)
}
// ... time both versions
```

```
Sequential count: 17984 time: 4.327583ms
Concurrent count: 17984 time: 21.112959ms
Counts match: true
```

Verified directly: both versions agree on the correct answer (`17984` primes below `200000`) — but the concurrent version took **roughly 5× longer**. This is a real, honest result, not a mistake to hide: checking primality of a number below `200000` is genuinely cheap (at most a few hundred divisions), and the overhead of spawning goroutines, buffering channels, and coordinating results *exceeds* the actual work being parallelized.

## Verification: large numbers, expensive work

```go
nums := make([]int, 0)
base := 100_000_000_000
for i := 0; i < 20000; i++ {
    nums = append(nums, base+i)
}
```

```
Sequential count: 779 time: 147.698959ms
Concurrent count: 779 time: 44.550833ms
Counts match: true
Speedup: 3.3152906254300567
```

Verified directly, same code, same machine, only the input changed: checking primality of numbers around 100 billion requires checking divisibility up to `≈316,000` — genuinely expensive per item — and here the concurrent version is a real, measured **~3.3× faster**. Both runs confirm identical, correct counts (`779`); only the relative timing flips.

> **The actual point of this capstone:** concurrency isn't free, and this series' own discipline — measure, don't assume — applies exactly as much to "concurrency makes things faster" as it does to any other performance claim (`julia/04-type-stability-jit.md`'s own measured, honestly-varying numbers made the identical point about type stability). Whether spawning goroutines pays for itself depends entirely on how much real work each one does — a fact this capstone demonstrated with the *same program*, run against two different inputs, rather than asserted from general knowledge about concurrency.

> **Pitfall:** `numWorkers` (`8`, in both runs here) is a real tuning parameter this capstone didn't explore — too few workers underutilizes available parallelism; too many can add scheduling overhead of its own. There's no universally correct value; it depends on the actual hardware and workload, exactly the kind of thing worth measuring directly rather than guessing.

## Extending it yourself

- Re-run both versions with `numWorkers` set to `1`, `2`, `4`, and `16`, and plot how the concurrent version's timing changes — find the point (for the large-number case) where adding more workers stops helping.
- Find the approximate input size (number of items, or magnitude of the numbers being checked) where this exact program's concurrent version breaks even with the sequential one on this machine.
