# Resources & Cheat Sheet

## References

| Resource | Why it matters |
|---|---|
| [MDN Web Docs](https://developer.mozilla.org/en-US/docs/Web/JavaScript) | The most reliable free reference for exact language and DOM API behavior |
| [Bun documentation](https://bun.sh/docs) | The toolchain this guide anchors to |
| [TypeScript Handbook](https://www.typescriptlang.org/docs/handbook/intro.html) | Module 9's next step — generics, decorators, utility types |
| *You Don't Know JS* (Simpson, free online) | The best deep treatment of exactly the gotchas this guide flagged (`this`, closures, coercion) |
| This series' [C++ guide](../cpp/00-overview.md), [C guide](../c/00-overview.md) | Every "this is what X built by hand" callback in this guide points back here |
| This series' [Simula](../simula/00-overview.md) and [Smalltalk](../smalltalk/00-overview.md) guides | Where prototypes actually come from — Module 3's Self/Smalltalk callout depends on both, especially Smalltalk's own Module 7 |
| David Ungar & Randall Smith, "Self: The Power of Simplicity" (1987) | The primary source on Self's prototype-based design, the direct link between Smalltalk and JavaScript's object model |

## One-page cheat sheet

| Idea | Snippet |
|---|---|
| Strict equality | Always prefer `===` over `==` |
| Falsy values (only these six) | `0`, `""`, `null`, `undefined`, `NaN`, `false` |
| Closure | `function makeCounter() { let n = 0; return () => ++n; }` |
| Arrow vs. regular `this` | Regular: bound by *how* it's called. Arrow: bound by *where* it's written. |
| Class / prototype | `class Circle extends Shape { area() { ... } }` |
| Functional array pipeline | `arr.filter(...).map(...).reduce(...)` |
| Event loop order | sync code → all microtasks (`Promise.then`) → one macrotask (`setTimeout`) |
| `async`/`await` | Code before the first `await` runs synchronously; `await` yields control |
| DOM selection | `document.querySelector('#id')`, `.addEventListener('click', fn)` |
| Safe dynamic text | `.textContent`, not `.innerHTML`, for untrusted values |
| Minimal server | `Bun.serve({ port, fetch(req) { return Response.json(...); } })` |
| ESM import/export | `export function f() {}` / `import { f } from "./file.js"` |
| Test | `import { test, expect } from "bun:test"; test("name", () => expect(x).toBe(y));` |
| TypeScript check | `bunx tsc --noEmit --strict` |

## Where to go now

This closes the "powerhouse of the web" track — frontend (DOM) and backend (a real server) both covered, plus TypeScript folded in rather than deferred. From here: Ruby is the natural next branch (clean OOP with the machinery invisible, a genuine contrast to C++'s vtables and JavaScript's prototypes both), or a framework layer (React on the JS side, Rails on a Ruby foundation) once a language itself feels solid enough to build on top of.
