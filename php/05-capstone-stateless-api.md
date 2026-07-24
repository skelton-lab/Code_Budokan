# Capstone 2 — Rebuilding `javascript/07-server.md`'s API, and Watching It Diverge

The same `/api/users` shape, same routes, same in-memory `$users` array pattern — and a directly verified, opposite finding from JavaScript's own version.

## The build

`php -S` needs a router script (there's no `Bun.serve`-style single-callback API) — one file handling every request by inspecting `$_SERVER['REQUEST_METHOD']` and the URL path:

```php
<?php
declare(strict_types=1);
header('Content-Type: application/json');

$users = [
    ['id' => 1, 'name' => 'Ada'],
    ['id' => 2, 'name' => 'Alan'],
];

$method = $_SERVER['REQUEST_METHOD'];
$path = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);

if ($path === '/api/users' && $method === 'GET') {
    echo json_encode($users);
    exit;
}

if ($path === '/api/users' && $method === 'POST') {
    $body = json_decode(file_get_contents('php://input'), true);
    $newUser = ['id' => count($users) + 1, 'name' => $body['name']];
    $users[] = $newUser;
    http_response_code(201);
    echo json_encode($newUser);
    exit;
}

if (preg_match('#^/api/users/(\d+)$#', $path, $m) && $method === 'GET') {
    $id = (int) $m[1];
    $user = null;
    foreach ($users as $u) {
        if ($u['id'] === $id) { $user = $u; break; }
    }
    if ($user === null) {
        http_response_code(404);
        echo json_encode(['error' => 'not found']);
        exit;
    }
    echo json_encode($user);
    exit;
}

http_response_code(404);
echo json_encode(['error' => 'not found']);
```

Run with `php -S localhost:8939 router.php` — the script name after the address tells the built-in server to route every request through this one file, PHP's own equivalent of `Bun.serve`'s single `fetch` callback.

## Verified — and the point where it diverges from `javascript/07-server.md`

```
$ curl localhost:8939/api/users
[{"id":1,"name":"Ada"},{"id":2,"name":"Alan"}]

$ curl -i -X POST localhost:8939/api/users -d '{"name":"Grace"}'
HTTP/1.1 201 Created
{"id":3,"name":"Grace"}

$ curl localhost:8939/api/users
[{"id":1,"name":"Ada"},{"id":2,"name":"Alan"}]
```

Read that last response again: **Grace is gone.** Same server, same process (Module 4 already proved `php -S` doesn't restart between requests) — and the very next `GET` shows only the original two users. This is Module 4's finding, now demonstrated on the exact API shape `javascript/07-server.md` built: Bun's version keeps a `POST`-added user in every subsequent `GET` until the process restarts, because its `users` array lives in the one long-running process. PHP's version loses it on the *very next request*, restart or not, because PHP discards script-level state at the end of every request regardless of process lifetime.

The remaining routes behave identically to the JS version otherwise — a valid id resolves correctly, and an unmatched one returns a real `404`:

```
$ curl localhost:8939/api/users/2
{"id":2,"name":"Alan"}

$ curl -i localhost:8939/api/users/99
HTTP/1.1 404 Not Found
```

> **Pitfall:** it's tempting to read this as "PHP's built-in server is worse at this" — it isn't broken, it's a different, deliberate model. Nothing in a real PHP application keeps request-scoped arrays as its actual storage; Module 8's PDO-backed persistence is the real equivalent of what Bun's in-memory array was doing, and it survives restarts too, which Bun's own version explicitly didn't (`javascript/07-server.md`'s own stated pitfall).

## Progress check

1. What exact evidence from Module 4 already predicted that Grace would disappear from the next `GET`?
2. How does this router handle routing without `Bun.serve`'s `fetch(req)` callback shape?
3. What's the real, correct fix for state that needs to survive across PHP requests — not "avoid the problem," the actual mechanism?

### Answers

1. `getmypid()` returning the identical process id across requests, combined with the counter example resetting to `1` every time regardless — together proving script-level state doesn't survive to the next request even without a process restart.
2. By inspecting `$_SERVER['REQUEST_METHOD']` and the parsed request path directly inside one script, then branching on those values — PHP's built-in server routes every request through the named script (`router.php`), which plays the same structural role as `Bun.serve`'s `fetch` callback, just without a framework-provided `Request`/`Response` object pair.
3. Persisting it somewhere PHP's per-request teardown doesn't reach — a database via PDO (Module 8) or `$_SESSION` (Module 9), not a plain script-level variable, regardless of how long the server process itself stays up.
