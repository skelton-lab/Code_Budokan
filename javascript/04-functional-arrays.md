# Module 4 — Arrays and Functional Methods

`map`/`filter`/`reduce` — JavaScript's idiomatic answer to the same problem C++'s `<algorithm>` header and lambdas solved in Module 7 of that guide. Feeds Capstone 5.

## `map`, `filter`, `reduce`

**You'll be able to:** transform, select from, and combine array elements without writing an explicit loop.

**Concept**

`.map(fn)` returns a **new** array with `fn` applied to every element. `.filter(fn)` returns a **new** array containing only elements where `fn` returns truthy. `.reduce(fn, initial)` combines every element into a single accumulated value, calling `fn(accumulator, element)` for each one. None of these three mutate the original array — this is deliberate and load-bearing, not incidental.

**Example**

```js
const nums = [5, 3, 8, 1, 9, 2, 7];

const doubled = nums.map(n => n * 2);
const evens = nums.filter(n => n % 2 === 0);
const sum = nums.reduce((acc, n) => acc + n, 0);

console.log(doubled);   // [10, 6, 16, 2, 18, 4, 14]
console.log(evens);     // [8, 2]
console.log(sum);       // 35
console.log(nums);      // [5, 3, 8, 1, 9, 2, 7] -- unchanged
```

Verified: exactly the output above — `sum` correctly totals `35`, `evens` correctly picks out `8` and `2`, and printing `nums` again at the end confirms none of the three methods touched the original array.

> **Direct C++ comparison:** `std::sort(nums.begin(), nums.end(), [](int a, int b){...})` needed an iterator pair and a lambda as a separate argument. `.map(n => n * 2)` reads as a method call directly on the array, with the arrow function as its argument — same underlying idea (a function applied across a collection), noticeably terser syntax, at the cost of always allocating a new array rather than `std::sort`'s in-place mutation.

**Practice**

- Rewrite `.filter(n => n % 2 === 0)` as an explicit `for` loop pushing into a new array, and compare the two side by side.
- Use `.reduce` to find the maximum value in an array without using `Math.max(...arr)` — this is a genuine, if slightly artificial, exercise in what `reduce` can express beyond simple sums.

## Chaining

**You'll be able to:** compose `map`/`filter`/`reduce` into a single pipeline.

**Concept**

Because each of `.map`/`.filter` returns a new array, they chain directly — `.filter(...).map(...).reduce(...)` reads as a left-to-right pipeline: first narrow down, then transform, then combine. This is the same "compose small operations" idiom C++'s STL algorithms encourage, expressed as method chaining instead of separate statements.

**Example**

```js
const result = nums
    .filter(n => n > 2)
    .map(n => n * n)
    .reduce((acc, n) => acc + n, 0);
console.log(result);   // 228
```

Verified: `[5,3,8,1,9,2,7]` filtered to `n > 2` gives `[5,3,8,9,7]`, squared gives `[25,9,64,81,49]`, summed gives `228` — matching the output exactly, confirming each stage feeds correctly into the next.

> **Pitfall:** a long chain of `.filter().map().reduce()` each allocates a full intermediate array — perfectly fine for the small collections these capstones use, but worth knowing it's not "free" the way a single hand-written loop doing the same work in one pass would be. Real performance-sensitive code sometimes drops back to an explicit loop specifically to avoid the intermediate allocations; that's a deliberate tradeoff, not evidence that chaining is wrong to use by default.

**Practice**

- Write the equivalent of the chained example above as a single explicit `for` loop, and compare readability against performance.
- Chain `.filter` and `.map` (no `.reduce`) to produce, from an array of objects `{name, age}`, an array of just the names of everyone over 18.

## Progress check

1. Do `.map`, `.filter`, and `.reduce` mutate the original array?
2. What does `.reduce`'s second argument (the `initial` value) do?
3. Why does `.filter(...).map(...).reduce(...)` read left-to-right as a pipeline?
4. What's the tradeoff a long method chain makes compared to a single hand-written loop doing equivalent work?
5. What C++ mechanism does this module's chaining most directly parallel, and what's the one concrete syntax difference?

### Answers

1. No — all three return new values (arrays or, for `reduce`, a single accumulated value); the original array is left unchanged.
2. It's the accumulator's starting value before the first element is processed — for a sum, `0`; for building a new array, often `[]`; for finding a max, often the first element or `-Infinity`.
3. Because each stage (`.filter`, then `.map`) returns a new array that the next method call in the chain operates on directly — the output of one stage is exactly the input to the next, read in the order they're written.
4. Each stage allocates a full intermediate array; a single hand-written loop doing the equivalent work in one pass avoids those allocations, at the cost of being less immediately readable as a sequence of named operations.
5. C++'s `<algorithm>` functions (`std::sort`, `std::find`, etc.) combined with lambdas — same underlying idea of applying a function across a collection. The concrete difference: JavaScript's array methods are called directly on the array (`arr.map(...)`), while C++'s algorithms are free functions taking an iterator range plus the array as separate arguments (`std::sort(arr.begin(), arr.end(), ...)`).
