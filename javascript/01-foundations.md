# Module 1 — Foundations: From C++ to JavaScript

Dynamic typing, and the coercion/truthiness rules that trip up almost everyone coming from a statically-typed language. Feeds everything downstream.

## Dynamic typing

**You'll be able to:** declare variables without type annotations; explain what "dynamically typed" actually means day to day.

**Concept**

A C++ variable's type is fixed at compile time and enforced by the compiler; a JavaScript variable (`let x = 5;`) has no declared type at all — `x` can hold a number, then be reassigned to hold a string, an object, anything, and nothing checks this until the program actually runs (and even then, JavaScript mostly won't complain — it'll try to make the operation work, which is where coercion comes in).

**Example**

```js
let x = 5;
x = "now a string";
console.log(typeof x, x);   // "string" "now a string" -- perfectly legal
```

> **Pitfall:** this isn't a bug you'll hit once and remember — the absence of compile-time type checking is the single biggest daily-experience difference coming from C++, and it's exactly what Module 9's TypeScript port adds back, opt-in, once you've felt what's missing without it.

**Practice**

- Reassign a variable through three different types in a row and print `typeof` after each.
- Predict, then check, `typeof null` (a genuinely famous, long-standing JavaScript quirk — it returns `"object"`, not `"null"`, for historical reasons baked into the language since 1995).

## `==` vs. `===`

**You'll be able to:** explain what coercion does to `==`, and why real code almost always uses `===`.

**Concept**

`==` (loose equality) converts its operands to a common type before comparing, if they're different types. `===` (strict equality) never converts — if the types differ, it's simply `false`, no exceptions.

**Example**

```js
console.log(0 == "0");     // true  -- "0" gets coerced to the number 0
console.log(0 === "0");    // false -- different types, no coercion, straightforwardly not equal
console.log(null == undefined);   // true  -- a specific special-cased coercion
console.log(null === undefined);  // false -- different types
```

Verified: all four exactly as shown.

> **Pitfall:** `==`'s coercion rules are genuinely complex and have produced entire meme-worthy tables of "surprising" results (`[] == false` is `true`, for instance). The practical rule real style guides converge on: use `===` by default, always, and reach for `==` only in the rare, deliberate case where you specifically want `null`/`undefined` treated as equal to each other and nothing else.

**Practice**

- Look up (or predict, then check) `[] == false` and `"" == 0` — both `true` under loose equality — and be able to explain, roughly, why.
- Rewrite a mental C++ `if (a == b)` habit as `if (a === b)` and make it muscle memory before Module 3.

## Truthy and falsy

**You'll be able to:** name every falsy value in JavaScript, and explain the single most common mistake this causes.

**Concept**

Any value used where a boolean is expected (an `if` condition, `!value`) gets converted to `true` or `false`. Exactly **six** values are falsy: `0`, `""` (empty string), `null`, `undefined`, `NaN`, and `false` itself. Every other value — including an empty array `[]` and an empty object `{}` — is truthy.

**Example**

```js
const falsy = [0, "", null, undefined, NaN, false];
for (const v of falsy) console.log(v, "is falsy:", !v);

console.log([].length === 0, "empty array is falsy?", !!([]));
```

Verified — the exact output that catches nearly everyone the first time:
```
0 is falsy: true
 is falsy: true
null is falsy: true
undefined is falsy: true
NaN is falsy: true
false is falsy: true
true empty array is falsy? true
```

Read that last line carefully: `[].length === 0` is `true` (the array genuinely is empty) — but `!!([])` is *also* `true`, meaning the empty array itself is **truthy**. `if ([])` runs its body. This is the single most common truthy/falsy mistake: assuming an empty collection is falsy the way `0` or `""` is. It isn't — check `.length` explicitly.

> **Pitfall:** `NaN` being falsy, combined with `NaN !== NaN` (yes, really — `NaN` is the one value in JavaScript that doesn't equal itself, mirroring the IEEE-754 floating-point rule this series' Fortran guide used for its own NaN-detection trick), means checking for `NaN` needs `Number.isNaN(x)`, not `x === NaN` (which is always `false`) and not just `!x` (which is also true for `0`, `""`, and several other unrelated values).

**Practice**

- Write a function that correctly checks "is this array empty," using `.length`, not truthiness.
- Verify `NaN !== NaN` yourself, then confirm `Number.isNaN(NaN)` correctly returns `true`.

## Progress check

1. What does "dynamically typed" mean for a JavaScript variable, in contrast to a C++ one?
2. What does `==` do that `===` doesn't?
3. Why does real JavaScript code almost always prefer `===`?
4. Name all six falsy values.
5. Why is `if (someArray)` almost never the check you actually want, even when `someArray` might be empty?
6. How do you correctly check whether a value is `NaN`?

### Answers

1. A JavaScript variable has no fixed type — it can be reassigned to hold any type of value at any point, with nothing checked until the program runs. A C++ variable's type is fixed at compile time and enforced by the compiler.
2. `==` converts operands to a common type before comparing when their types differ (coercion); `===` never converts — differing types are simply unequal.
3. Coercion's rules are complex enough to produce widely-cited "surprising" results; using `===` by default eliminates that entire category of bug.
4. `0`, `""`, `null`, `undefined`, `NaN`, `false`.
5. Because arrays (and objects) are always truthy regardless of their contents — an empty array is still truthy. The actual "is this empty" check needs `.length === 0`, not the array's truthiness.
6. `Number.isNaN(x)` — `x === NaN` is always `false` (NaN doesn't equal itself), and `!x` is also true for several unrelated falsy values.
