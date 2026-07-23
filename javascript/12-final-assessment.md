# Final Assessment

Across all eleven modules. Try each on paper first.

1. Why is `[].length === 0` true while `!![]` is also true — aren't those contradictory?
2. What's the practical difference between `==` and `===`?
3. What does a closure capture — the variable, or its value at capture time?
4. Why does `delayedRegular`'s callback lose `this` while `delayedArrow`'s doesn't, in this guide's verified example?
5. What concrete evidence proves `class` is sugar over prototypes rather than a separate mechanism?
6. Do `.map`/`.filter`/`.reduce` mutate the array they're called on?
7. Between a `Promise.then` callback and a `setTimeout(fn, 0)` scheduled first, which runs first, and why?
8. What part of an `async` function's body runs synchronously, immediately, when it's called?
9. Why is `.textContent` generally preferred over `.innerHTML` for displaying dynamic values?
10. What does `Bun.serve`'s `fetch` handler receive, and what must it return?
11. What's the difference between a named export and a default export?
12. What did TypeScript catch, at compile time, in this guide's paired `add(2, "three")` example that plain JavaScript let through silently?
13. Name the polymorphism thread Capstone 1 continues, across this entire series, and where JavaScript's own link in that chain (prototypes) is historically traced to.

## Answers

1. No contradiction — `.length === 0` checks the array's actual contents (correctly empty). `!!` checks *truthiness*, and in JavaScript every array is truthy regardless of contents — only six specific values (`0`, `""`, `null`, `undefined`, `NaN`, `false`) are falsy, and an empty array isn't one of them.
2. `==` coerces operands to a common type before comparing when they differ; `===` never coerces — differing types are simply unequal. Real code should default to `===`.
3. The variable itself — if it changes after the closure captures it, the closure sees the current value, not a frozen snapshot from creation time.
4. `delayedRegular` passes a *regular* function to `setTimeout`, and a regular function's `this` depends on how it's called — called later, detached from any object, `this` is lost. `delayedArrow` passes an *arrow* function, which captured `this` permanently from where it was written (inside `delayedArrow`, called as `obj.delayedArrow()`, so `this` there correctly was `obj`).
5. `Object.getPrototypeOf(instance) === ClassName.prototype` behaves identically whether built with `class`/`extends` or hand-written constructor functions with `Object.create`, and `typeof ClassName` is `"function"` — a class declaration produces an ordinary function with a prototype, not a distinct language construct.
6. No — all three return new values, leaving the original array unchanged.
7. The `Promise.then` callback — every pending microtask drains completely before the macrotask queue (where `setTimeout` callbacks live) is even checked, regardless of scheduling order.
8. Everything before its first `await` — that portion runs synchronously and immediately, exactly like an ordinary function call; only from the first `await` onward does execution defer.
9. `.innerHTML` parses its argument as HTML, so assigning untrusted (e.g., user-typed) input to it can inject and execute attacker-controlled markup — a real cross-site-scripting risk. `.textContent` always treats its argument as plain text.
10. A `Request` object; it must return a `Response` object (or a `Promise` resolving to one).
11. A named export is imported in braces by its exact name; a default export is imported without braces, under any name the importer chooses. A file can have many named exports but at most one default.
12. It caught, at compile time, that `"three"` (a string) was being passed where `add`'s second parameter was typed `number` — reported as an error before the program ever ran. Plain JavaScript let the same call through, silently coercing to produce `"2three"` via string concatenation, with no warning.
13. Polymorphic dispatch: C's manually-built vtable (a struct with a hand-assigned function pointer), Simula's `Virtual` procedures (the historical origin, if that guide's been read), C++'s compiler-generated vtable via `virtual`, and JavaScript's live, runtime-walked prototype chain — different mechanisms across the series producing the same observable behavior. JavaScript's own prototypes are historically traced to Self (1987), a language built directly out of the Smalltalk lineage — making JavaScript's dynamism the Smalltalk-descended branch of the family tree, structurally opposite to Simula/C++'s statically-checked one.
