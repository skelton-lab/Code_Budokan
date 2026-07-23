# Module 6 — The DOM and Browser Events

The half of "the powerhouse of the web" that runs in a browser, not a server. Everything in this module was verified by actually loading a page in a real browser and clicking/typing through it — not screenshotted, not simulated, driven and read back. Feeds Capstone 2.

## Selecting and updating elements

**You'll be able to:** find an element in the page and change what it displays.

**Concept**

The **DOM** (Document Object Model) is a live tree of objects representing the page — every HTML tag becomes a JavaScript object you can read and modify. `document.querySelector(selector)` finds the first element matching a CSS-style selector (`#id`, `.class`, `tag`); setting `.textContent` on the result changes what it displays, immediately, on screen.

**Example**

```html
<h1 id="heading">Count: 0</h1>
<button id="incrementBtn">Increment</button>

<script>
  let count = 0;
  const heading = document.querySelector('#heading');
  const incrementBtn = document.querySelector('#incrementBtn');
  incrementBtn.addEventListener('click', () => {
    count++;
    heading.textContent = `Count: ${count}`;
  });
</script>
```

**Verified in an actual browser, not simulated:** loaded this page, read the interactive elements (`querySelector`-equivalent from the tooling side), clicked the increment button three times, then read the page's text back — `Count: 3`, exactly matching three click events each incrementing the closure-captured `count` variable and updating `heading.textContent`.

> **Pitfall:** `.textContent` versus `.innerHTML` matters for more than convenience — `.innerHTML` parses its argument as HTML, so setting it from untrusted input (a value typed by a user) can inject and execute attacker-controlled markup/scripts, a real vulnerability class (XSS). `.textContent` always treats its argument as plain text, never as markup — prefer it whenever you're not deliberately inserting HTML.

**Practice**

- Add a "reset" button that sets `count` back to `0` and updates the heading.
- Change `.textContent` to `.innerHTML` with the same code and explain, in a comment, why that would become a real security concern the moment the displayed value ever came from user input instead of an internal counter.

## Creating elements and handling input

**You'll be able to:** build new DOM elements from JavaScript and insert them into the page.

**Concept**

`document.createElement(tag)` creates a new element, not yet attached to the page. `.appendChild(element)` inserts it into the tree, making it visible. Reading `.value` off an `<input>` element gets whatever the user typed; setting `.value = ''` clears it.

**Example**

```html
<ul id="list"></ul>
<input id="itemInput" type="text" />
<button id="addBtn">Add item</button>

<script>
  const list = document.querySelector('#list');
  const input = document.querySelector('#itemInput');
  document.querySelector('#addBtn').addEventListener('click', () => {
    const li = document.createElement('li');
    li.textContent = input.value;
    list.appendChild(li);
    input.value = '';
  });
</script>
```

**Verified in an actual browser:** clicked into the text input, typed `"Learn closures"`, clicked "Add item," then read the page's text back — a new list item reading `Learn closures` had genuinely appeared in the page, and the input field was confirmed cleared, exactly matching the code's logic.

> **Pitfall:** every `addEventListener` call registers a *new* listener — calling it again with the same handler function reference is a no-op (the browser recognizes the duplicate and doesn't double-register), but calling it with a *new* arrow function each time (e.g., inside a loop) genuinely does register a separate listener each time, which is a real, easy-to-hit source of a handler firing multiple times per click.

**Practice**

- Add a delete button to each created `<li>`, using `element.remove()` inside its own click handler.
- Handle the `Enter` key in the input (listen for a `keydown` event, check `event.key === 'Enter'`) as an alternative to clicking "Add item."

## Progress check

1. What does `document.querySelector` return, and what selector syntax does it accept?
2. Why is `.textContent` generally safer to use than `.innerHTML` for displaying dynamic values?
3. What two steps does creating a new, visible DOM element require?
4. What did this module's verification actually consist of, beyond reading the source code?
5. What's the risk of registering an event listener with a freshly-created arrow function inside a loop?

### Answers

1. The first element in the page matching the given selector, using the same syntax as CSS selectors (`#id`, `.class`, a bare tag name, and combinations of these).
2. `.innerHTML` parses its argument as HTML markup, meaning untrusted input assigned to it can inject and execute attacker-controlled scripts (a cross-site-scripting vulnerability). `.textContent` always treats its argument as plain text, never parsed as markup.
3. `document.createElement(tag)` to create the element (not yet part of the page), then `.appendChild(element)` (or a similar insertion method) on an existing page element to actually attach it, making it visible.
4. Actually loading the page in a real browser, reading its interactive elements, clicking the buttons and typing into the input field, then reading the resulting page text back to confirm the DOM genuinely updated as the code claimed it would — not just reasoning about what the code should do.
5. Each loop iteration creates a distinct function, so each call to `addEventListener` registers a genuinely separate listener — the same click can end up firing the handler logic multiple times, once per registered listener, rather than the single time a reader would expect.
