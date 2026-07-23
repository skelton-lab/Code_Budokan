# Module 5 — Asynchronous JavaScript

You understand the call stack literally, from building one by hand in the 6502 guide (`JSR`/`RTS`, `PHA`/`PLA`). JavaScript's event loop is what happens *around* that stack when something takes time — and it produces ordering that surprises almost everyone the first time, verified precisely below. Feeds Capstone 3.

## The event loop: microtasks before macrotasks

**You'll be able to:** predict the actual execution order of synchronous code, `Promise` callbacks, and `setTimeout` callbacks.

**Concept**

JavaScript is single-threaded — one call stack, exactly like the 6502's, just managed by an engine instead of `PHA`/`PLA` by hand. When something async happens (`setTimeout`, a `Promise` resolving, a network request completing), its callback doesn't run immediately — it gets queued, and only runs once the current synchronous code finishes *and* the call stack is empty. There are two queues, checked in a specific order: the **microtask queue** (`Promise` callbacks) is fully drained before the engine even looks at the **macrotask queue** (`setTimeout`, I/O) — even a `setTimeout(fn, 0)`, scheduled for zero delay, waits behind every pending microtask.

**Example**

```js
console.log("1: sync start");
setTimeout(() => console.log("4: setTimeout (macrotask)"), 0);
Promise.resolve().then(() => console.log("3: promise.then (microtask)"));
console.log("2: sync end");
```

Verified — the exact printed order:
```
1: sync start
2: sync end
3: promise.then (microtask)
4: setTimeout (macrotask)
```

Read this carefully: `setTimeout` was scheduled *before* the `Promise.then`, with a delay of `0`ms — and it still runs **last**. All synchronous code runs first, uninterrupted (`1`, then `2`), then every pending microtask drains completely (`3`), and only then does the engine move to the macrotask queue (`4`).

> **Pitfall:** "zero-delay `setTimeout`" does not mean "run immediately" or even "run next" — it means "run once the stack is clear and every pending microtask has drained," which can be a meaningfully long time later if microtasks keep scheduling more microtasks. This single misunderstanding is behind a large share of real "why did this run in the wrong order" bugs.

**Practice**

- Add a second `Promise.then` before the `setTimeout` line and predict where its output lands in the sequence before running it.
- Chain a `.then` off the first `.then` (`Promise.resolve().then(() => {...}).then(() => {...})`) and observe that it still runs before the macrotask, since it's still a microtask.

## `async`/`await`: the part that surprises people the second time

**You'll be able to:** predict exactly when an `async` function's code runs synchronously versus when it defers.

**Concept**

`async function` and `await` are syntax built on top of `Promise`s — they don't change the underlying event-loop rules above, they just make asynchronous code *read* like synchronous code. The specific detail that catches people out: everything in an `async` function **before its first `await`** runs synchronously, immediately, the instant the function is called — exactly like a normal function call. Only from the first `await` onward does the function actually pause and hand control back to whoever called it, resuming later (as a microtask) once the awaited value is ready.

**Example**

```js
function delay(ms, value) {
    return new Promise(resolve => setTimeout(() => resolve(value), ms));
}

async function run() {
    console.log("2: inside run(), before first await -- runs synchronously");
    const a = await delay(10, "first");
    console.log("4: got:", a, "-- this line runs later, after the await");
    return "done";
}

console.log("1: before calling run()");
run().then(result => console.log("5: run() resolved with:", result));
console.log("3: right after calling run() -- proves run() returned immediately at the await");
```

Verified — the exact printed order (numbered in the code to match):
```
1: before calling run()
2: inside run(), before first await -- runs synchronously
3: right after calling run() -- proves run() returned immediately at the await
4: got: first -- this line runs later, after the await
5: run() resolved with: done
```

Line `2` printing *before* line `3` is the important, easy-to-get-backwards fact: calling `run()` doesn't defer everything inside it — it runs synchronously up to the first `await`, and only *there* does it return control (as a pending `Promise`) to the code that called it, which is why line `3` (right after the call) runs next, before `run()`'s own continuation (line `4`) resumes later.

> **Pitfall:** a common wrong mental model is "an `async` function's body is entirely deferred, like a `.then()` callback." It isn't — treat `async function foo() { ... }` as an ordinary function that happens to be able to pause (at `await`) and resume later, not as something wrapped in a deferred callback from the very first line.

**Practice**

- Reproduce this example yourself, predict the order before running, and check line-by-line against the actual output.
- Add a `console.log` immediately after a *second* `await` in `run()` and confirm it lands even later in the sequence, after the first `await`'s continuation.

## Progress check

1. Between a `Promise.then` callback and a `setTimeout(fn, 0)` callback scheduled first, which one actually runs first, and why?
2. What does "the microtask queue drains completely before the macrotask queue is checked" actually mean in practice?
3. What part of an `async` function's body runs synchronously, immediately, when it's called?
4. Why does code written immediately after calling an `async function` sometimes run before that function's own internal continuation?
5. What's the common, wrong mental model this module explicitly warns against for `async` functions?

### Answers

1. The `Promise.then` callback — regardless of scheduling order, every pending microtask drains completely before the engine even looks at the macrotask queue that `setTimeout` callbacks live in.
2. Once the current synchronous code finishes and the call stack is empty, the engine processes every microtask currently queued (including new ones scheduled by earlier microtasks) before it moves on to a single macrotask — macrotasks effectively wait behind an entire, possibly-growing, microtask queue.
3. Everything before the function's first `await` — it executes immediately and synchronously, exactly like a normal function call, up to that point.
4. Because the `async` function returns control (as a pending `Promise`) back to its caller the moment it hits its first `await` — the caller's subsequent code runs next, while the `async` function's remaining body waits to resume later, once the awaited value is ready.
5. That the entire body of an `async` function is deferred from the start, like a `.then()` callback — in reality, only the portion from the first `await` onward is deferred; everything before it runs synchronously right when the function is called.
