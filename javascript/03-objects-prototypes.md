# Module 3 — Objects and Prototypes

C had a manual vtable. C++ had `virtual`, generating that same vtable automatically. JavaScript has neither — objects share behavior through a **prototype chain**, a fundamentally different mechanism that `class` syntax dresses up to *look* similar to C++, while doing something genuinely different underneath — and, if you've read this series' `simula/` and `smalltalk/` guides, a mechanism that traces to the *other* branch of the object-oriented family tree those guides mapped, not C++'s branch. Feeds Capstone 1.

## The prototype chain, without `class`

**You'll be able to:** build inheritance using raw prototypes, and explain what `Object.getPrototypeOf` reveals about how it actually works.

**Concept**

Every JavaScript object has an internal link to another object — its **prototype** — and when you access a property that doesn't exist on the object itself, JavaScript automatically looks it up the prototype chain instead of failing immediately. `Object.create(proto)` creates a new object whose prototype is `proto`. This is **not** C++'s vtable mechanism (a per-*type* table of function pointers, generated once at compile time) — it's a genuinely different idea: a live chain of *objects*, walked at each property lookup, at runtime.

**Example**

```js
function Shape(name) {
    this.name = name;
}
Shape.prototype.describe = function () {
    return `${this.name}: area = ${this.area()}`;
};

function Circle(radius) {
    Shape.call(this, "circle");     // manually run Shape's constructor logic on `this`
    this.radius = radius;
}
Circle.prototype = Object.create(Shape.prototype);   // link Circle's prototype to Shape's
Circle.prototype.constructor = Circle;
Circle.prototype.area = function () {
    return Math.PI * this.radius * this.radius;
};

const c = new Circle(2);
console.log(c.describe());
console.log(Object.getPrototypeOf(c) === Circle.prototype);              // true
console.log(Object.getPrototypeOf(Circle.prototype) === Shape.prototype); // true
```

Verified: `c.describe()` correctly prints `circle: area = 12.566370614359172`, and both `Object.getPrototypeOf` checks confirm the chain exactly as built — `c → Circle.prototype → Shape.prototype`. When `c.describe()` runs and calls `this.area()`, JavaScript doesn't find `area` directly on `c`; it walks up to `Circle.prototype`, finds it there, and calls it with `this` still bound to `c`.

> **Pitfall:** `Shape.call(this, "circle")` — manually invoking the "parent constructor" with `this` explicitly passed — is what `class`'s `super(...)` does for you (next session). Without it, `Circle` instances would never actually get a `name` property set, despite `Shape.prototype.describe` expecting one to exist.

**Practice**

- Add a `Rectangle` constructor function the same way, and confirm `Object.getPrototypeOf(rectInstance) === Rectangle.prototype`.
- Print `c.hasOwnProperty("describe")` (false — it's on the prototype, not the instance) versus `c.hasOwnProperty("radius")` (true — set directly in the constructor) to see the chain-vs-own-property distinction directly.

## `class`: the same mechanism, better syntax

**You'll be able to:** write the identical inheritance using `class`/`extends`, and prove to yourself it's not a different underlying mechanism.

**Concept**

`class` and `extends` are **syntactic sugar** — the JavaScript engine translates them into essentially the same prototype-chain setup you just built by hand, with `super(...)` replacing the manual `Shape.call(this, ...)` step. This is worth taking on faith less than proving directly.

**Example**

```js
class ShapeC {
    constructor(name) { this.name = name; }
    describe() { return `${this.name}: area = ${this.area()}`; }
}
class RectangleC extends ShapeC {
    constructor(w, h) { super("rectangle"); this.w = w; this.h = h; }
    area() { return this.w * this.h; }
}

const r = new RectangleC(3, 4);
console.log(r.describe());                                    // "rectangle: area = 12"
console.log(Object.getPrototypeOf(r) === RectangleC.prototype); // true -- same mechanism
console.log(typeof RectangleC);                                  // "function" -- classes ARE functions
```

Verified: `r.describe()` correctly prints `rectangle: area = 12`, `Object.getPrototypeOf(r) === RectangleC.prototype` is `true` (the identical relationship as the hand-built version), and — the proof this is genuinely the same mechanism — `typeof RectangleC` is `"function"`, not some special "class" type. `class` is real, useful, clearer syntax; it is not a different inheritance model from what you built by hand above.

**This is one stop on a longer thread running through this whole series.** C Capstone 5: a struct with a hand-assigned function pointer, dispatched manually. Simula (1967), if you've read that guide: `Virtual` procedures, the actual historical origin of C++'s keyword. C++ Module 3: `virtual`, a compiler-generated function-pointer table, dispatched automatically by type, fixed at compile time. JavaScript here: no table at all — a live chain of objects, walked at each lookup, at runtime, that `class` makes read almost identically to C++ while working on a completely different principle underneath. Ruby's duck typing (that guide's Module 4) goes further still, requiring no shared type at all.

> **Where JavaScript's prototype model actually comes from, if you've read the Simula and Smalltalk guides:** this is genuinely the *other* branch of the family tree those two guides mapped, not an unrelated third idea. Prototype-based objects trace to **Self** (1987, Xerox PARC and Stanford) — a language built by removing the class/instance distinction from Smalltalk entirely: instead of an object being an instance of a class, a Self object clones directly from another object (its own prototype) and can gain methods individually, with everything resolved dynamically at runtime. Self came directly out of the Smalltalk lineage the `smalltalk/` guide traced, built at the same institution (Xerox PARC) Smalltalk itself was created at. Brendan Eich has stated, repeatedly, across interviews and talks over the years, that Self's prototype model directly shaped JavaScript's object system when he designed it in 1995 — while also being asked to make the surface syntax look like Java, which is exactly why `class` here reads as C++-ish even though nothing underneath actually is. The practical payoff: JavaScript's fully dynamic, runtime-resolved dispatch — no compile-time class checking anywhere, precisely what Module 1 of this guide already flagged as the biggest daily difference from C++ — is philosophically much closer to Smalltalk's uniform message-passing model (that guide's Module 7) than to Simula/C++'s statically-checked one, even though `class`/`extends` syntax makes the surface look the other way.

> **Pitfall:** because prototype lookup happens at runtime, adding a method to `Shape.prototype` *after* `c` was already created still makes it available on `c` — every existing instance sees it immediately, since they all share a live link to the same prototype object, not a copy taken at construction time. This has no equivalent in C++, where a vtable is fixed at compile time — but it has a close cousin in Smalltalk, where adding a method to a class is likewise visible to every existing instance immediately, for the same underlying reason (nothing is fixed until the moment of lookup).

**Practice**

- Add a new method to `ShapeC.prototype` (or `Shape.prototype`, hand-built version) *after* creating an instance, and confirm the existing instance can immediately call it.
- Convert your `Rectangle` from the previous session's practice problem to `class` syntax and confirm identical behavior.
- If you've read the Smalltalk guide: reread its Module 5 (naming pitfall aside) and this module's own "add a method after instances exist" pitfall side by side — same underlying property (nothing about an object's available behavior is fixed until the moment it's actually looked up), two different languages, decades apart.

## Progress check

1. What does a JavaScript object's prototype actually point to, and when does JavaScript consult it?
2. What does `Shape.call(this, "circle")` accomplish inside `Circle`'s constructor function?
3. What does `super(...)` inside a `class` constructor correspond to, in the hand-built version?
4. What concrete evidence proves `class` is sugar over prototypes, not a separate mechanism?
5. What can you do to a prototype after instances already exist that has no equivalent in C++'s vtable model?
6. Summarize, in one sentence each, how C, C++, and JavaScript each achieve polymorphic dispatch.
7. What language is JavaScript's prototype model historically traced to, and how does that language connect back to Smalltalk?

### Answers

1. Another object — when a property lookup fails on the object itself, JavaScript automatically continues the search up the prototype chain instead of immediately failing.
2. It runs `Shape`'s constructor logic with `this` explicitly set to the new `Circle` instance being constructed — without it, properties `Shape`'s constructor would have set (like `name`) never get set on `Circle` instances.
3. It's the equivalent of the manual `Shape.call(this, ...)` step — running the parent class's constructor logic against the new instance.
4. `Object.getPrototypeOf(r) === RectangleC.prototype` behaves identically to the hand-built version, and `typeof RectangleC` is `"function"` — a `class` declaration produces an ordinary function with a prototype, exactly like the hand-written constructor function version.
5. Add a new method to the prototype — every existing instance immediately gains access to it, since they all share a live link to the same prototype object rather than a fixed table copied at construction/compile time.
6. C: a struct holding a function pointer, assigned by hand. C++: `virtual`, a compiler-generated function-pointer table (vtable) fixed at compile time, dispatched by the object's real type. JavaScript: a live, runtime-walked chain of prototype objects, with no fixed table at all.
7. Self (1987) — a prototype-based language built by removing the class/instance distinction from Smalltalk entirely, created at Xerox PARC, the same institution Smalltalk itself came from. Brendan Eich has stated repeatedly that Self directly shaped JavaScript's object model when he designed it in 1995.
