# Module 6 — Defer, Panic, and Recover

By the end of this module you'll be able to schedule cleanup code with `defer`, understand its verified LIFO ordering, and use `panic`/`recover` for the genuinely exceptional cases Module 5's ordinary `error` values aren't meant for. Feeds Capstone 3.

## `defer`: scheduled to run when the function returns, in reverse order

**You'll be able to:** schedule a function call to run when the enclosing function returns, and predict the order multiple `defer`s run in.

**Concept**

`defer functionCall()` schedules `functionCall` to run when the *enclosing* function returns — regardless of how it returns (normally, or via `panic`, covered next). Multiple `defer` statements run in **LIFO** order — last deferred, first executed.

**Example**

```go
func main() {
    fmt.Println("start")
    defer fmt.Println("deferred 1")
    defer fmt.Println("deferred 2")
    defer fmt.Println("deferred 3")
    fmt.Println("end of main body")
}
```

```
start
end of main body
deferred 3
deferred 2
deferred 1
```

Verified directly: the three deferred calls run in exactly reverse order of how they were written — `"deferred 3"` (the last one scheduled) runs first among the deferred calls, `"deferred 1"` (the first one scheduled) runs last. This mirrors a stack — each `defer` pushes onto it; the function's actual return pops them off, most-recently-pushed first.

> **Pitfall:** `defer`'s arguments are evaluated **immediately**, at the point the `defer` statement runs — only the *call itself* is delayed. `defer fmt.Println(x)` captures `x`'s value at the moment of the `defer` statement, not whatever `x` might be later when the function actually returns; a reader assuming both the evaluation and the call are deferred together would be wrong.

**Practice**

- Write a function with a `defer` inside a loop, and predict — then verify — the order all the deferred calls run in once the function itself returns (not each loop iteration).

## `panic` and `recover`: for genuinely exceptional failures

**You'll be able to:** trigger a panic, catch it with `recover` inside a deferred function, and let the program continue running afterward.

**Concept**

`panic` is Go's closest thing to an exception — it immediately stops normal execution, running deferred calls as it unwinds, and (unless caught) crashes the program. `recover`, called *inside a deferred function*, stops a panic in progress and returns the value passed to `panic` — the only place `recover` has any effect at all is inside a function that's running because of `defer`, during an active panic.

**Example**

```go
func safeCall(f func()) {
    defer func() {
        if r := recover(); r != nil {
            fmt.Println("Recovered from panic:", r)
        }
    }()
    f()
}

func main() {
    safeCall(func() {
        var arr []int
        fmt.Println(arr[5]) // index out of range, panics
    })
    fmt.Println("Program continues after recovery")
}
```

```
Recovered from panic: runtime error: index out of range [5] with length 0
Program continues after recovery
```

Verified directly: accessing index `5` of an empty slice genuinely panics (a real Go runtime error) — but `safeCall`'s deferred function catches it with `recover()`, and the program continues running normally afterward, rather than crashing outright.

> **The real, honest boundary between `error` and `panic`:** Module 5's `error` return values are for **expected**, ordinary failure conditions a caller should routinely check for (division by zero, a file that might not exist) — `panic` is reserved for genuinely unexpected situations a normal caller isn't expected to check for defensively every time (an out-of-bounds index, a nil pointer dereference). Using `panic`/`recover` as a general substitute for Module 5's `if err != nil` pattern is considered poor Go style precisely because it blurs this distinction — idiomatic Go code panics rarely, and recovers even more rarely, reserving both for true "this should never happen" cases.

> **Pitfall:** `recover()` only has an effect when called directly inside a deferred function during an active panic — calling it in ordinary code (not deferred, or not currently unwinding from a panic) simply returns `nil` and does nothing, a real, easy-to-get-wrong detail for a first attempt at this pattern.

**Practice**

- Write a function that panics with a custom message (`panic("something went wrong")` instead of triggering a runtime error), and confirm `recover()` correctly catches your own custom message.
- Remove the `recover()` call from `safeCall` entirely, run the program again, and observe the actual crash and stack trace Go produces for an unrecovered panic.

## Progress check

1. When does a `defer`red function call actually run?
2. In what order do multiple `defer` statements in the same function run, relative to each other?
3. Are a `defer`'s arguments evaluated immediately, or when the deferred call actually runs?
4. What's the real, idiomatic distinction between when to use an `error` return value versus `panic`?
5. Where does `recover()` need to be called for it to have any effect at all?

### Answers

1. When the enclosing function returns, regardless of whether it returns normally or via a panic unwinding through it.
2. LIFO order — the most recently deferred call runs first, the earliest deferred call runs last.
3. Immediately, at the point the `defer` statement itself runs — only the actual function call is delayed until the enclosing function returns.
4. `error` is for expected, ordinary failure conditions a caller should routinely check for; `panic` is reserved for genuinely unexpected situations (an out-of-bounds index, a nil pointer) that a normal caller isn't expected to defensively check for every time.
5. Directly inside a deferred function, during an active panic — calling it anywhere else (ordinary code, or a deferred function when no panic is in progress) simply returns `nil` and does nothing.
