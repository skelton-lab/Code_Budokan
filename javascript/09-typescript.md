# Module 9 — Porting to TypeScript

Everything Module 1 called out as "nothing checks this until the program runs" — TypeScript adds that checking back, opt-in, on top of the exact same language. Bun runs `.ts` files natively, so this module needs no new tooling beyond what's already installed.

## Adding types to what you've already built

**You'll be able to:** add type annotations to a function and a class, and port Capstone 1's shapes to TypeScript.

**Concept**

TypeScript is JavaScript plus optional type annotations, checked at compile time and then erased entirely — the code that actually runs is ordinary JavaScript, with no runtime type-checking overhead. `interface` declares a shape a value must conform to; `implements` declares that a class conforms to one. This is a genuine, direct answer to Module 3's prototype-based `Shape`/`Circle`/`Rectangle` — same runtime behavior, now with the compiler verifying every class actually provides what `Shape` requires.

**Example**

```ts
interface Shape {
  area(): number;
  name(): string;
}

class Circle implements Shape {
  constructor(private radius: number) {}
  area(): number { return Math.PI * this.radius * this.radius; }
  name(): string { return "circle"; }
}

class Rectangle implements Shape {
  constructor(private width: number, private height: number) {}
  area(): number { return this.width * this.height; }
  name(): string { return "rectangle"; }
}

function printArea(shape: Shape): void {
  console.log(`${shape.name()}: area = ${shape.area()}`);
}

const shapes: Shape[] = [new Circle(2), new Rectangle(3, 4)];
shapes.forEach(printArea);
```

Verified: `bun run shapes.ts` prints `circle: area = 12.566370614359172` and `rectangle: area = 12` — identical output to the plain-JavaScript version, run directly, no build step. `implements Shape` now means the compiler rejects, at compile time, any class claiming to be a `Shape` that's missing `area()` or `name()` — Module 3's prototype chain still does the runtime dispatch; TypeScript adds the check that nothing did before.

**Practice**

- Port your Module 4 array functions to TypeScript, annotating parameter and return types.
- Try `implements Shape` on a class deliberately missing `area()` and read the compiler error.

## What TypeScript actually catches

**You'll be able to:** demonstrate, concretely, the specific class of bug type annotations catch that plain JavaScript doesn't.

**Concept**

This is worth seeing side by side rather than taking on faith.

**Example — plain JavaScript, verified:**

```js
function add(a, b) { return a + b; }
console.log(add(2, "three"));
```

Verified: prints `2three` — `+` between a number and a string coerces the number to a string and concatenates. No error, no warning. Silently wrong, if `add` was meant to do arithmetic.

**Example — the same bug in TypeScript, verified:**

```ts
function add(a: number, b: number): number {
  return a + b;
}
console.log(add(2, "three"));
```

Verified: `bunx tsc --noEmit --strict bug.ts` reports, at compile time, before the program ever runs:
```
bug.ts(4,20): error TS2345: Argument of type 'string' is not assignable to parameter of type 'number'.
```

This is the entire value proposition in one paired example: the exact same mistake produces a silently-wrong runtime result in plain JavaScript, and a compile-time error — caught before the program ever executes — the moment `a`/`b` are annotated `number`.

> **Pitfall:** type annotations only protect what's actually typed — a function parameter typed `any` (or simply left unannotated in a file without `strict` mode) opts back out of this checking entirely, silently. `--strict` mode (used above) is what makes TypeScript actually strict about this; without it, plenty of real bugs slip through unchecked, giving a false sense of safety.

**Practice**

- Reproduce both versions of the `add` bug yourself and confirm the exact behavior difference.
- Run `bunx tsc --noEmit --strict` (no `bug.ts` argument, with a `tsconfig.json` present) against one of your own ported capstones and fix whatever it flags.

## Progress check

1. What happens to TypeScript's type annotations when the code actually runs?
2. What does `implements Shape` add on top of Module 3's plain prototype-based `Shape`?
3. In the verified paired example, what did plain JavaScript do with `add(2, "three")`, and why?
4. What did TypeScript do with the identical mistake, and at what point in the workflow?
5. Why does `--strict` mode matter — what happens without it?

### Answers

1. They're checked at compile time and then erased entirely — the JavaScript that actually runs has no type annotations and no runtime type-checking overhead.
2. A compile-time guarantee that the class actually provides everything the `Shape` interface requires (`area()`, `name()`) — Module 3's version relies entirely on the programmer remembering to implement both; `implements` makes a missing method a compile error instead of a runtime surprise the first time it's called.
3. It printed `2three` — the `+` operator coerced the number `2` to the string `"2"` and concatenated, silently, with no error or warning, even though the function was presumably meant to add numbers.
4. It reported a compile-time error (`Argument of type 'string' is not assignable to parameter of type 'number'`) before the program ever ran, via `tsc --noEmit --strict`.
5. Without `--strict`, TypeScript is considerably more permissive — parameters can default to implicitly allowing `any` type in various contexts, meaning real type mismatches can still slip through unflagged, undermining the exact safety this module demonstrates.
