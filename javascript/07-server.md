# Module 7 — Bun/Node and Building a Server

The other half of "the powerhouse of the web": JavaScript running outside a browser entirely, serving requests. Feeds Capstone 4.

## A minimal HTTP server

**You'll be able to:** stand up a real HTTP server that routes requests based on path and method.

**Concept**

`Bun.serve({ port, fetch })` starts an HTTP server — `fetch` is called once per incoming request, receiving a standard `Request` object and expected to return a `Response`. This is JavaScript running server-side: no DOM, no browser, no `document` — just a function that turns requests into responses, the same fundamental shape as any backend framework in any language.

**Example**

```js
const users = [
  { id: 1, name: "Ada" },
  { id: 2, name: "Alan" },
];

const server = Bun.serve({
  port: 8935,
  async fetch(req) {
    const url = new URL(req.url);

    if (url.pathname === "/api/users" && req.method === "GET") {
      return Response.json(users);
    }

    if (url.pathname === "/api/users" && req.method === "POST") {
      const body = await req.json();
      const newUser = { id: users.length + 1, name: body.name };
      users.push(newUser);
      return Response.json(newUser, { status: 201 });
    }

    const match = url.pathname.match(/^\/api\/users\/(\d+)$/);
    if (match && req.method === "GET") {
      const user = users.find(u => u.id === Number(match[1]));
      if (!user) return Response.json({ error: "not found" }, { status: 404 });
      return Response.json(user);
    }

    return Response.json({ error: "not found" }, { status: 404 });
  },
});
console.log(`listening on ${server.url}`);
```

Verified against a running instance with real HTTP requests:
```
$ curl localhost:8935/api/users
[{"id":1,"name":"Ada"},{"id":2,"name":"Alan"}]

$ curl -X POST localhost:8935/api/users -d '{"name":"Grace"}'
{"id":3,"name":"Grace"}

$ curl localhost:8935/api/users/2
{"id":2,"name":"Alan"}

$ curl -i localhost:8935/api/users/99
HTTP/1.1 404 Not Found
```

Every route behaves exactly as coded: list returns both seeded users, `POST` correctly assigns the next id and returns `201`, a valid id looks up and returns the right user, and an unmatched id correctly returns a `404` with a JSON error body.

> **Pitfall:** this server's `users` array lives entirely in memory — restarting the process loses every change, including anything added via `POST`. This is deliberate, minimal scope for a capstone; a real server would persist to a database, and knowing exactly where that line is (this example doesn't cross it) is worth being explicit about rather than assuming.

**Practice**

- Add a `DELETE /api/users/:id` route.
- Add basic input validation to the `POST` route (reject a request with no `name` field, returning a `400` status).

## Async all the way down

**You'll be able to:** explain why `fetch`'s handler is `async`, connecting directly to Module 5.

**Concept**

Reading a request body (`await req.json()`) is itself asynchronous — the body might not have fully arrived yet when the handler starts running. This is Module 5's event loop, doing real work: the server can handle other requests concurrently while waiting for one request's body to finish arriving, rather than blocking the whole process on a single slow client.

**Practice**

- Add an artificial `await delay(100)` (Module 5's `delay` helper) inside one route, and confirm — using two terminal windows, or a tool that fires concurrent requests — that a slow request doesn't block a fast one made in parallel.

## Progress check

1. What does `Bun.serve`'s `fetch` function receive, and what must it return?
2. Why does this server's `POST` handler need `await req.json()` rather than just `req.json()`?
3. What data does this example server lose on restart, and why is that an acceptable scope cut for a capstone?
4. What does making the `fetch` handler `async` actually buy the server, in terms of handling multiple requests?

### Answers

1. A `Request` object per incoming request; it must return a `Response` object (or a `Promise` resolving to one, since the handler is `async`).
2. Reading the request body is itself an asynchronous operation — the body may still be arriving over the network when the handler starts, so it must be awaited rather than assumed to be immediately available.
3. Everything stored in the in-memory `users` array — any `POST`-added users are gone the moment the process restarts, since nothing is written to persistent storage (a file or database). This is an explicit, acceptable scope cut for a small capstone; a production server would need real persistence.
4. It lets the server hand control back to the event loop while waiting on something slow (like a request body still arriving), so it can keep handling other, unrelated requests concurrently instead of blocking the entire process on one request at a time.
