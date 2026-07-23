# Module 10 — Capstones

Five projects built from Modules 1–9, plus the TypeScript port. Every one verified by actually running it — three of them (the DOM to-do list, the server, the async fetcher) were driven live, not just executed and read.

## Capstone 1 — Shapes, the third and final time

**Proves:** prototypal inheritance via `class` (Module 3) — one stop on the polymorphism thread running through this entire series.

See Module 3 for the fully-verified `ShapeC`/`RectangleC` example — and, if you've read the Simula and Smalltalk guides, that module's callout tracing JavaScript's prototype model back through Self to the Smalltalk lineage, the branch of the family tree structurally opposite to Simula's (and hence C++'s) static, compile-time-checked one. The capstone extension: build the complete `Shape`/`Circle`/`Rectangle`/`Triangle` set with `class`/`extends`, matching the exact shapes built in the C, C++, Simula, and Smalltalk guides alike.

**Practice**

- Build all three shapes and confirm `Object.getPrototypeOf` on each instance correctly traces back through its own class to the shared `Shape` base.
- Write one paragraph, in your own words, contrasting C's manual vtable, Simula's `Virtual` (if you've read that guide), C++'s compiler-generated vtable, and JavaScript's live prototype chain — this is the single best test of whether the thread actually landed.
- If you've read the Smalltalk guide: write a second paragraph on why JavaScript's dynamism (no compile-time class checking anywhere) sits philosophically closer to Smalltalk's model than to Simula's or C++'s, despite `class`/`extends` syntax visually resembling the latter two.

## Capstone 2 — An interactive to-do list

**Proves:** DOM manipulation and event handling (Module 6) — verified live in an actual browser.

See Module 6 for the fully-verified counter and list-building example. The capstone extension: combine both patterns into one page — an input, an "add" button, a rendered list, and a delete button on each item.

```html
<input id="itemInput" type="text" />
<button id="addBtn">Add item</button>
<ul id="list"></ul>

<script>
  const list = document.querySelector('#list');
  const input = document.querySelector('#itemInput');
  document.querySelector('#addBtn').addEventListener('click', () => {
    if (!input.value.trim()) return;
    const li = document.createElement('li');
    li.textContent = input.value;
    const del = document.createElement('button');
    del.textContent = 'x';
    del.addEventListener('click', () => li.remove());
    li.appendChild(del);
    list.appendChild(li);
    input.value = '';
  });
</script>
```

**Practice**

- Build and verify this yourself in a browser (or reuse this session's method: serve it, click through it, read the page text back).
- Add a "mark complete" toggle (a click on the item's text itself toggles a strikethrough style).

## Capstone 3 — Async data fetcher

**Proves:** the event loop, `fetch`, `async`/`await`, and error handling (Module 5) — against a real running server.

```js
async function fetchUsers() {
  const res = await fetch("http://localhost:8935/api/users");
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

async function fetchUser(id) {
  const res = await fetch(`http://localhost:8935/api/users/${id}`);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

async function main() {
  const users = await fetchUsers();
  console.log(users);

  const user = await fetchUser(2);
  console.log(user);

  try {
    await fetchUser(999);
  } catch (e) {
    console.log("caught expected error:", e.message);
  }
}
main();
```

Verified against Capstone 4's actual running server: fetches and correctly prints both users, fetches user `2` (`Alan`) individually, and correctly catches and reports the error thrown for a nonexistent user `999` (`HTTP 404`) — real network requests, real async control flow, real error path.

**Practice**

- Add `Promise.all` to fetch two different users concurrently instead of sequentially, and confirm (with a small artificial delay added server-side) that it's genuinely faster than two sequential `await`s.
- Add a retry: if a fetch fails, wait briefly (Module 5's `delay` helper) and try once more before giving up.

## Capstone 4 — A minimal HTTP server + JSON API

**Proves:** backend JavaScript (Module 7).

See Module 7 for the fully-verified `/api/users` server — this capstone *is* that server. Extension: this is what Capstone 3 fetches from.

**Practice**

- Add the `DELETE` route from Module 7's practice problem, then extend Capstone 3's fetcher to call it and confirm the user disappears from a subsequent `GET`.

## Capstone 5 — A functional data pipeline

**Proves:** `map`/`filter`/`reduce`, closures, and chaining (Module 4) — on a realistic, richer dataset than the teaching example.

```js
const products = [
  { name: "Widget", price: 25, inStock: true },
  { name: "Gadget", price: 75, inStock: false },
  { name: "Gizmo", price: 40, inStock: true },
  { name: "Doohickey", price: 15, inStock: true },
  { name: "Contraption", price: 120, inStock: false },
];

function makeTaxAdder(rate) {
  return (product) => ({ ...product, priceWithTax: +(product.price * (1 + rate)).toFixed(2) });
}
const addTax = makeTaxAdder(0.1);

const report = products
  .filter(p => p.inStock)
  .map(addTax)
  .sort((a, b) => a.priceWithTax - b.priceWithTax);
```

Verified: correctly filters to the 3 in-stock products, applies a 10% tax via a closure-returning factory function (`makeTaxAdder`, itself a direct callback to Module 2), and sorts ascending by the taxed price — `Doohickey (16.5) → Widget (27.5) → Gizmo (44)`, each computed correctly from the original prices.

> **`{ ...product, priceWithTax: ... }`** is the **spread operator**, copying every existing field into a new object while adding one more — this is deliberate: the pipeline never mutates the original `products` array, the same non-mutating discipline Module 4 established as load-bearing, not incidental.

**Practice**

- Add a second closure-returning function (`makeDiscounter(percent)`) and chain it into the pipeline alongside `addTax`.
- Rewrite the whole pipeline in TypeScript (Module 9), typing `Product` as an `interface` and confirming `tsc --strict` catches a deliberately introduced type mistake (e.g., passing a string where `price` expects a number).

## Progress check

1. What three-language thread does Capstone 1 close, and what's the one-sentence version of each language's mechanism?
2. What did "verified live" actually mean for Capstone 2, beyond running the code once?
3. What real error path does Capstone 3 verify, not just its happy path?
4. Why is Capstone 4 described as "what Capstone 3 fetches from" rather than as an independent example?
5. Why does Capstone 5's `addTax` use the spread operator instead of mutating `product` directly?

### Answers

1. Polymorphic dispatch: C's hand-built struct-with-function-pointer vtable, C++'s compiler-generated vtable via `virtual`, and JavaScript's live, runtime-walked prototype chain — three genuinely different mechanisms producing the same observable "the right method runs for the right type" behavior.
2. The page was actually loaded in a real browser, its elements read, buttons clicked and text typed through the automation tooling, and the resulting page content read back to confirm the DOM had genuinely changed — not just trusting the code's logic by inspection.
3. Requesting a nonexistent user (`id: 999`) and confirming the `throw`/`catch` correctly reports `HTTP 404` — the failure path, not just the successful fetches.
4. Because Capstone 3's fetcher makes real HTTP requests against Capstone 4's actual running server — they were verified together, as a genuine client/server pair, not as two independent, unconnected examples.
5. To avoid mutating the original `products` array, keeping the pipeline's non-mutating discipline consistent with `.filter`/`.map`/`.sort` themselves — `{ ...product, priceWithTax: ... }` creates a new object with all of `product`'s fields plus the new one, leaving the original untouched.
