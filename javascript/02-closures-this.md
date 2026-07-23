# Module 2 — Functions, Closures, and `this`

Functions as first-class values, the closure mechanism that makes them genuinely powerful, and `this` — the single most consistently confusing part of JavaScript for people arriving from almost any other language, demonstrated here rather than just described. Feeds Capstones 1, 3, 5.

## Closures

**You'll be able to:** write a function that returns another function, and explain why the inner function keeps working after the outer one has returned.

**Concept**

A closure is a function bundled together with references to the variables from the scope it was created in — those variables stay alive, privately, for as long as the function itself does, even after the outer function that declared them has already returned. This is JavaScript's native answer to something C++ needed a whole class (with a private member and a constructor) to express — a closure *is* a tiny, anonymous, single-purpose object.

**Example**

```js
function makeCounter() {
    let count = 0;
    return function () {
        count++;
        return count;
    };
}

const counter1 = makeCounter();
const counter2 = makeCounter();
console.log(counter1(), counter1(), counter1());  // 1 2 3
console.log(counter2());                            // 1 -- independent closure
```

Verified: `counter1` and `counter2` each maintain their own private `count`, completely independently — calling `counter1` three times gives `1 2 3`, and `counter2`'s very first call still starts fresh at `1`, confirming each call to `makeCounter()` creates a genuinely separate closure over its own `count` variable.

> **Pitfall:** a closure captures the *variable*, not the value at the moment of capture — if the captured variable changes after the closure is created (a classic trap: closures created inside a loop, all capturing the same loop variable), every closure sees the *current* value, not a frozen snapshot from when each was made. `let` (block-scoped, a fresh binding per loop iteration) avoids this in a `for` loop; `var` (function-scoped, one shared binding) is the classic version of this bug from older JavaScript.

**Practice**

- Write `makeAdder(x)` returning a function that adds `x` to its argument, and create two independent adders with different `x` values.
- Deliberately reproduce the loop-closure bug with `var` in a `for` loop, then fix it by switching to `let`.

## Arrow functions and `this`

**You'll be able to:** predict what `this` refers to in a regular function versus an arrow function, in the situations that actually matter.

**Concept**

A regular function's `this` is determined by **how it's called** — `obj.method()` sets `this` to `obj`; calling the same function detached from `obj` (passed as a plain callback, for instance) loses that binding entirely. An arrow function has **no `this` of its own** — it captures `this` from the surrounding scope where it was *written*, permanently, regardless of how it's later called. This single distinction is responsible for a large fraction of real-world "why is `this` undefined in my callback" bugs.

**Example**

```js
const obj = {
    name: "widget",
    regularMethod: function () {
        console.log("regular:", this.name);
    },
    arrowMethod: () => {
        console.log("arrow:", this?.name);
    },
    delayedRegular: function () {
        setTimeout(function () {
            console.log("delayed regular:", this?.name);
        }, 0);
    },
    delayedArrow: function () {
        setTimeout(() => {
            console.log("delayed arrow:", this.name);
        }, 0);
    }
};

obj.regularMethod();
obj.arrowMethod();
obj.delayedRegular();
obj.delayedArrow();
```

Verified — the exact output:
```
regular: widget
arrow: undefined
delayed regular: undefined
delayed arrow: widget
```

Read this precisely: `regularMethod` works because it's called *as* `obj.regularMethod()`, so `this` is `obj`. `arrowMethod` prints `undefined` because an arrow function ignores how it's called — it captured `this` from the outer (module) scope, where there's no `obj`. `delayedRegular` is the classic real bug: the regular function passed to `setTimeout` gets called later, detached from `obj`, so `this` is lost. `delayedArrow` is the classic real fix: the arrow function captures `this` from `delayedArrow`'s own scope — which correctly *is* `obj`, because `delayedArrow` itself was called as `obj.delayedArrow()` — and that captured binding survives into the deferred callback.

> **Pitfall:** "just use arrow functions everywhere to avoid `this` problems" is a common oversimplification — it's correct for callbacks like the `setTimeout` case above, but an arrow function used *as* an object method (like `arrowMethod`) breaks the exact thing you'd normally want from a method. The rule that actually holds: use a regular function when you need `this` to be "whatever object this was called on," use an arrow function when you need `this` to stay pinned to where the function was *written*.

**Practice**

- Reproduce this exact example yourself and read the four lines of output before checking your prediction against them.
- Rewrite `delayedRegular` to work correctly without switching to an arrow function, using `.bind(this)` instead — a real, older alternative you'll still see in production code.

## Progress check

1. What does a closure actually capture — the variable, or the value at the moment of capture?
2. Why does calling `makeCounter()` twice produce two independently-counting functions?
3. What determines a regular function's `this`?
4. What determines an arrow function's `this`?
5. In the verified example, why does `delayedRegular` print `undefined` while `delayedArrow` correctly prints `widget`?
6. When should you use a regular function instead of an arrow function, given arrow functions avoid the `this`-loss bug?

### Answers

1. The variable itself — if it changes after the closure is created, the closure sees the current value, not a snapshot from creation time.
2. Each call to `makeCounter()` creates a fresh `count` variable and a fresh function closing over that specific variable — the two returned functions have no shared state.
3. How it's called — `obj.method()` binds `this` to `obj`; called detached from an object (a plain callback), `this` is lost.
4. The scope where the arrow function was *written*, captured permanently at creation time, regardless of how or where it's later called.
5. `delayedRegular` passes a regular function to `setTimeout`, which calls it later with no object context, so its `this` is lost. `delayedArrow` passes an arrow function, which captured `this` from `delayedArrow`'s own scope at the moment it was written — and that scope's `this` correctly is `obj`, because `delayedArrow` itself was invoked as `obj.delayedArrow()`.
6. When you need `this` to mean "whatever object this function was actually called on" — most commonly, an object method meant to be called as `obj.method()`, where an arrow function would incorrectly ignore that and use the outer scope's `this` instead.
