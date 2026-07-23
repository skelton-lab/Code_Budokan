# JavaScript — A Session-Based Study Guide

**Promise:** comprehensive JavaScript fundamentals — frontend (the DOM) and backend (a real server) both covered — built as the deliberate contrast point after C++. Where C++ gave you compiler-checked static types and vtable-based virtual dispatch, JavaScript gives you dynamic typing and prototype-based inheritance; seeing both makes each one clearer than either alone would. If you've read this series' `simula/` and `smalltalk/` guides, that contrast has real historical roots: JavaScript's prototypes trace to Self, a language built directly out of the Smalltalk lineage — so C++'s static discipline and JavaScript's runtime dynamism aren't two arbitrary design choices, they're the two actual branches of the object-oriented family tree those guides mapped.

**Audience:** comfortable with C++ fundamentals (this series' `cpp/` companion) — the contrasts are called out explicitly, but nothing here requires it to make sense on its own.

**Toolchain (anchored):** [Bun](https://bun.sh) 1.3+ — runs both `.js` and `.ts` natively with zero configuration, and ships a built-in test runner (`bun test`), confirmed working locally. Node.js is name-checked as the most widely-deployed alternative; Deno briefly. TypeScript is folded into this guide as a module (Module 9), not a separate guide — the same role the 6502 guide gave its platform-port modules.

## Capstone log

| # | Capstone | Proves | Callback |
|---|---|---|---|
| 1 | Shapes, a third time | Prototypal inheritance / `class` | Continues the thread: C's manual vtable → Simula's `Virtual` (the origin) → C++'s `virtual` → JS's prototype chain, traced to Self and the Smalltalk lineage |
| 2 | A tiny interactive to-do list | DOM manipulation, event handling | Verified in an actual browser, not simulated |
| 3 | Async data fetcher | Event loop, Promises, `async`/`await` | Contrasts with the literal call stack from the 6502 guide |
| 4 | Minimal HTTP server + JSON API | Backend JS | |
| 5 | Functional array pipeline | `map`/`filter`/`reduce`, closures | Contrasts with C++'s STL algorithms + lambdas |

## Module list

1. **Foundations: from C++ to JavaScript** — dynamic typing, `==` vs. `===`, truthy/falsy, first program
2. **Functions, closures, and `this`** — first-class functions, closures, arrow functions vs. `this` binding
3. **Objects and prototypes** — prototype chains, `class` as sugar over prototypes → Capstone 1
4. **Arrays and functional methods** — `map`/`filter`/`reduce` → Capstone 5
5. **Asynchronous JavaScript** — event loop, Promises, `async`/`await` → Capstone 3
6. **The DOM and browser events** → Capstone 2
7. **Bun/Node and building a server** → Capstone 4
8. **Modules, packages, and testing** — ESM `import`/`export`, `package.json`, `bun test`
9. **Porting to TypeScript** — adding types to earlier capstones
10. **Capstones** — all five, plus the TS port
11. **Beyond this guide** — signposts
12. **Final assessment** + **Resources**

## Ecosystem-breadth triage

| Topic | Test | Treatment |
|---|---|---|
| `this` binding | Necessary to correctly use Capstone 1/prototypes | **Full**, Module 2 |
| ESM modules, `package.json` | Any multi-file capstone needs a module system | **Full**, Module 8 |
| Testing (`bun test`) | Cheap, real, threaded through capstones | **Full but light**, Module 8 |
| TypeScript | Explicit prior commitment, and a real practical need | **Full module** (9) |
| Bundlers, generators/iterators, Proxies/WeakMap | Doesn't touch a capstone | **Signpost** |
| Deep TypeScript (generics, decorators) | Beyond what the port module needs | **Signpost** |

## Setup

```bash
curl -fsSL https://bun.sh/install | bash   # or: brew install oven-sh/bun/bun
bun --version
```

```bash
bun run program.js
bun test
```
