# Module 11 — Beyond This Guide

None of these change how any of the five capstones turn out.

### Bundlers (Vite, webpack, esbuild)

**What it is:** tools that take a multi-file JavaScript/TypeScript project (plus CSS, assets, framework-specific syntax like JSX) and bundle it into optimized files a browser can load efficiently — code splitting, minification, hot module reloading during development.

**Why it's a signpost:** this guide's capstones are small enough to run directly, unbundled — Bun itself even bundles when needed (`bun build`). Real production frontend projects, especially anything built with React/Vue/Svelte, essentially always go through a bundler; it just wasn't load-bearing for anything built here.

**Where to go next:** Vite's own documentation is unusually good as a starting point, and it's the current default choice for new frontend projects.

### Generators and iterators

**What it is:** `function*` declares a generator — a function that can `yield` multiple values over time instead of returning once. The `for...of` loops used throughout this guide work on anything implementing the iterator protocol, which generators make trivial to implement for your own types.

**Minimal taste:**

```js
function* range(start, end) {
  for (let i = start; i < end; i++) yield i;
}
for (const n of range(1, 4)) console.log(n);   // 1, 2, 3
```

**Why it's a signpost:** none of the five capstones needed custom iteration — `.map`/`.filter`/`.reduce` (Module 4) and plain arrays covered everything.

### `Proxy` and `WeakMap`

**What it is:** `Proxy` lets you intercept fundamental operations (property access, assignment) on an object — the mechanism modern reactive frameworks (Vue 3, for instance) use to detect when state changes. `WeakMap` is a map whose keys can be garbage-collected when nothing else references them, useful for attaching metadata to objects without preventing their cleanup.

**Why it's a signpost:** genuinely powerful, genuinely niche — most real code never needs either directly, even though popular frameworks use both internally.

### Node.js-specific APIs beyond Bun

**What it is:** Bun implements most of Node's API surface for compatibility, but Node itself has a much larger standard library (`fs`, `child_process`, `cluster`, and more) built up over a decade, plus the overwhelming majority of production deployments still run on Node specifically.

**Why it's a signpost:** this guide's server capstone deliberately stayed within what Bun's own APIs (`Bun.serve`, `Bun.file`) cover directly. Real backend work will eventually need Node's broader `fs`/`path`/`child_process` APIs, all of which work identically (or near-identically) under Bun.

### Deeper TypeScript: generics, decorators, utility types

**What it is:** Module 9 covered `interface`/`implements` — TypeScript also has generics (`function identity<T>(x: T): T`, the direct TypeScript equivalent of C++'s templates from that guide), decorators (metadata-attaching annotations, heavily used by frameworks like Angular and NestJS), and a large library of utility types (`Partial<T>`, `Pick<T, K>`, and more) for transforming existing types.

**Why it's a signpost:** none of this guide's capstones needed generics or decorators — `interface`/`implements` and basic parameter/return typing covered everything. This is the strongest candidate in this guide for a genuinely separate, deeper future guide, the same way C++ eventually became its own full guide rather than a C module.

**Where to go next:** the TypeScript Handbook's "Generics" chapter, and — once you're ready — cppreference's templates material from this series' own C++ guide, read side by side; the parallels are close enough to be genuinely useful.
