# Module 8 — Modules, Packages, and Testing

Splitting code across files, the modern (ESM) way, and the same "capstone can check itself" habit every guide in this series has built in. Feeds every multi-file capstone.

## ESM: `import`/`export`

**You'll be able to:** split code across files using named and default exports, and import them correctly.

**Concept**

A **named export** (`export function add(...)`) is imported by the same name, in braces: `import { add } from "./file.js"`. A **default export** (`export default function greet(...)`) is imported without braces, under whatever name you choose: `import greet from "./file.js"`. A file can have any number of named exports but at most one default. This is JavaScript's modern, standard module system (**ESM** — ECMAScript Modules); you'll also see the older CommonJS style (`require(...)`/`module.exports`) in plenty of existing Node.js code, but ESM is what current code should default to.

**Example**

```js
// mathutils.js
export function add(a, b) { return a + b; }
export function square(x) { return x * x; }
export default function greet(name) { return `Hello, ${name}!`; }
```

```js
// main.js
import greet, { add, square } from "./mathutils.js";
console.log(greet("world"));
console.log("add(2,3) =", add(2, 3));
console.log("square(5) =", square(5));
```

Verified: prints `Hello, world!`, `add(2,3) = 5`, `square(5) = 25` — confirming the default and named exports both import and resolve correctly from a separate file.

> **Pitfall:** the file extension in `import ... from "./mathutils.js"` is required for ESM's native module resolution, unlike some bundler-based setups that let you omit it — leaving it off produces a "module not found" error under Bun/Node's native ESM handling, even though the file genuinely exists.

**Practice**

- Split a function you wrote in an earlier module into its own file and import it from a fresh `main.js`.
- Try importing a named export using default-import syntax (or vice versa) and read the resulting error carefully.

## `package.json` and running a real project

**You'll be able to:** set up a minimal `package.json` and understand what it actually configures.

**Concept**

`package.json` is a project's manifest — its name, version, dependencies, and (relevantly here) `"type": "module"`, which tells the runtime to treat `.js` files as ESM (`import`/`export`) rather than the older CommonJS default. `bun install` reads the `dependencies` section and fetches everything listed, the same role `npm install` plays for a Node project.

**Example**

```json
{
  "name": "my-project",
  "version": "1.0.0",
  "type": "module"
}
```

**Practice**

- Create a `package.json` for one of your earlier capstones and confirm `bun run` still works with it in place.
- Add a real dependency (anything small — even just to see the mechanics) with `bun add <package>` and note what changes in `package.json` and the newly-created `bun.lock`.

## Testing with `bun test`

**You'll be able to:** write and run a test that checks your own code, the same discipline every guide in this series has built in.

**Concept**

`bun test` is a built-in test runner — no separate framework install needed. `test(name, fn)` declares a test; `expect(value).toBe(expected)` asserts. Files named `*.test.js` (or `*.test.ts`) are discovered automatically.

**Example**

```js
// mathutils.test.js
import { test, expect } from "bun:test";
import { add, square } from "./mathutils.js";

test("add works", () => {
  expect(add(2, 3)).toBe(5);
});
test("square works", () => {
  expect(square(5)).toBe(25);
});
```

Verified: `bun test` correctly discovers and runs both tests, reporting `2 pass, 0 fail`.

> **This is the same habit as every earlier guide in this series** — Fortran's `check()`/`error stop`, the 6502 guide's memory-plus-C-harness technique, C's `check()`/`error_stop` capstone pattern, C++'s sanitizer-verified examples. Different mechanism per language, same underlying discipline: the code should be able to tell you, itself, whether it still works.

**Practice**

- Write a test that deliberately fails (`expect(add(2,3)).toBe(6)`) and read `bun test`'s failure output.
- Add a test file for one of Module 4's array functions, and for Module 2's `makeCounter` closure (hint: create two independent counters in the test and assert they don't interfere with each other, exactly as verified earlier in this guide).

## Progress check

1. What's the syntactic difference between importing a named export and a default export?
2. How many default exports can a single file have? Named exports?
3. What does `"type": "module"` in `package.json` actually configure?
4. Why does `import ... from "./mathutils.js"` need the `.js` extension under native ESM, unlike some bundler setups?
5. What underlying discipline does `bun test` share with every other language guide in this series, despite the different syntax?

### Answers

1. A named export is imported in braces, by its exact name (`import { add } from ...`); a default export is imported without braces, under any name you choose (`import greet from ...`).
2. At most one default export per file; any number of named exports.
3. It tells the runtime to treat `.js` files in the project as ES Modules (`import`/`export` syntax) rather than the older CommonJS default (`require`/`module.exports`).
4. Native ESM module resolution requires the full, explicit file path including its extension — it doesn't guess or try multiple extensions the way some bundler-based dev setups are configured to.
5. The code checking itself and reporting pass/fail, rather than relying on a human to manually verify behavior every time — the same underlying idea as Fortran's `check()`, the 6502 guide's memory-harness technique, and C/C++'s sanitizer-verified examples, just expressed through `bun test`'s specific `test`/`expect` API.
