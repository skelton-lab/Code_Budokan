# Capstone 4 — A Database-Backed Task App With Real Auth

The synthesis capstone: PDO (Module 8), sessions and password hashing (Module 9), and the templating/`$_GET`/`$_POST` foundations (Modules 1–2) — a real, persistent, multi-user app, not an in-memory toy.

## The build

**`db.php`** — one shared connection, schema created on first run:

```php
<?php
declare(strict_types=1);
function db(): PDO {
    $pdo = new PDO('sqlite:' . __DIR__ . '/app.db');
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    $pdo->exec('CREATE TABLE IF NOT EXISTS users (id INTEGER PRIMARY KEY, username TEXT UNIQUE, password_hash TEXT)');
    $pdo->exec('CREATE TABLE IF NOT EXISTS tasks (id INTEGER PRIMARY KEY, user_id INTEGER, title TEXT, FOREIGN KEY(user_id) REFERENCES users(id))');
    return $pdo;
}
```

**`register.php`** — hashes the password before it ever touches the database, and lets SQLite's own `UNIQUE` constraint (not application logic) reject a duplicate username:

```php
<?php
declare(strict_types=1);
require 'db.php';
header('Content-Type: application/json');
$body = json_decode(file_get_contents('php://input'), true);
$pdo = db();
$stmt = $pdo->prepare('INSERT INTO users (username, password_hash) VALUES (?, ?)');
try {
    $stmt->execute([$body['username'], password_hash($body['password'], PASSWORD_DEFAULT)]);
    http_response_code(201);
    echo json_encode(['ok' => true, 'id' => $pdo->lastInsertId()]);
} catch (PDOException $e) {
    http_response_code(409);
    echo json_encode(['ok' => false, 'error' => 'username taken']);
}
```

**`login.php`** — looks up the user, verifies the password, and stores the id in `$_SESSION`:

```php
<?php
declare(strict_types=1);
require 'db.php';
session_start();
header('Content-Type: application/json');
$body = json_decode(file_get_contents('php://input'), true);
$pdo = db();
$stmt = $pdo->prepare('SELECT * FROM users WHERE username = ?');
$stmt->execute([$body['username']]);
$user = $stmt->fetch(PDO::FETCH_ASSOC);
if ($user && password_verify($body['password'], $user['password_hash'])) {
    $_SESSION['user_id'] = (int) $user['id'];
    echo json_encode(['ok' => true]);
} else {
    http_response_code(401);
    echo json_encode(['ok' => false, 'error' => 'invalid credentials']);
}
```

**`tasks.php`** — every task scoped to `$_SESSION['user_id']`, rejecting anyone not logged in before touching the database at all:

```php
<?php
declare(strict_types=1);
require 'db.php';
session_start();
header('Content-Type: application/json');
if (!isset($_SESSION['user_id'])) {
    http_response_code(401);
    echo json_encode(['error' => 'not logged in']);
    exit;
}
$pdo = db();
$method = $_SERVER['REQUEST_METHOD'];
if ($method === 'GET') {
    $stmt = $pdo->prepare('SELECT id, title FROM tasks WHERE user_id = ?');
    $stmt->execute([$_SESSION['user_id']]);
    echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC));
    exit;
}
if ($method === 'POST') {
    $body = json_decode(file_get_contents('php://input'), true);
    $stmt = $pdo->prepare('INSERT INTO tasks (user_id, title) VALUES (?, ?)');
    $stmt->execute([$_SESSION['user_id'], $body['title']]);
    http_response_code(201);
    echo json_encode(['ok' => true, 'id' => $pdo->lastInsertId()]);
    exit;
}
```

## Verified — the whole flow, in order

```
$ curl -X POST localhost:8943/register.php -d '{"username":"alice","password":"secret123"}'
{"ok":true,"id":"1"}

$ curl -i -X POST localhost:8943/register.php -d '{"username":"alice","password":"secret123"}' | head -1
HTTP/1.1 409 Conflict

$ curl -i -X POST localhost:8943/login.php -d '{"username":"alice","password":"wrong"}' | head -1
HTTP/1.1 401 Unauthorized

$ curl -i localhost:8943/tasks.php | head -1
HTTP/1.1 401 Unauthorized

$ curl -c cookies.txt -X POST localhost:8943/login.php -d '{"username":"alice","password":"secret123"}'
{"ok":true}

$ curl -b cookies.txt -X POST localhost:8943/tasks.php -d '{"title":"Write guide"}'
{"ok":true,"id":"1"}
$ curl -b cookies.txt -X POST localhost:8943/tasks.php -d '{"title":"Verify code"}'
{"ok":true,"id":"2"}

$ curl -b cookies.txt localhost:8943/tasks.php
[{"id":1,"title":"Write guide"},{"id":2,"title":"Verify code"}]

$ curl -i localhost:8943/tasks.php | head -1   # no cookie — different session entirely
HTTP/1.1 401 Unauthorized
```

Every layer holds under real conditions, not just the happy path: a duplicate username is rejected by the database's own `UNIQUE` constraint (not application-level checking that could be bypassed the way Rails' own capstone found ActiveRecord's validations *could* be), a wrong password is rejected before any session is created, an unauthenticated request to `tasks.php` never reaches the database at all, and — restart the server between the last two `curl` calls and the first two still return the same data, because unlike Capstone 2's plain array, this state lives in a real file (`app.db`), not process memory.

> **Pitfall:** `password.php` and every other endpoint here reads raw request bodies with `json_decode(file_get_contents('php://input'), true)` rather than `$_POST` — that's deliberate, not an inconsistency. `$_POST` only populates for `Content-Type: application/x-www-form-urlencoded` or `multipart/form-data` bodies; a JSON API body needs the raw stream read directly. Module 2's `$_POST` example used an actual HTML form, which is the case where `$_POST` is the right tool.

## Extend it yourself

- Add a `DELETE /tasks.php?id=N` route, checking the task's own `user_id` matches `$_SESSION['user_id']` before deleting — the same authorization pattern `rails/`'s Capstone 3 verified directly (one user attacking another's data, blocked).
- Restart the `php -S` process between two `curl -b cookies.txt` calls and confirm the session itself survives (file-backed by default) even though Capstone 2's in-memory array never could.
