# Module 9 — Sessions, Forms, and Real Password Hashing

Closes the loop Module 4 opened: how PHP-native state actually survives across requests, and the correct way to store a password. Feeds Capstone 4.

## `$_SESSION`: state that survives, and why

**You'll be able to:** use `$_SESSION` to persist data across requests, and explain precisely why it succeeds where a plain script-level variable failed in Module 4.

**Concept**

`session_start()` either creates a new session or resumes an existing one, identified by a cookie (`PHPSESSID` by default) the browser sends back on every subsequent request. Critically, the session's data isn't kept in the script's own memory between requests — PHP writes it to disk (or another configured store) at the end of each request and reads it back at the start of the next one, keyed by that cookie. This is the real mechanism, not magic: it survives Module 4's per-request teardown because it never relied on in-process memory to begin with.

**Example**

```php
<?php
session_start();
$_SESSION['views'] = ($_SESSION['views'] ?? 0) + 1;
echo "Views: {$_SESSION['views']}\n";
```

Verified with a persistent cookie jar across three requests:
```
$ curl -c cookies.txt localhost:8941/session.php
Views: 1

$ curl -b cookies.txt -c cookies.txt localhost:8941/session.php
Views: 2

$ curl -b cookies.txt -c cookies.txt localhost:8941/session.php
Views: 3

$ curl localhost:8941/session.php   # no cookie — a genuinely new session
Views: 1
```

The count genuinely climbs to `3` with the cookie carried forward — real persistence, unlike Module 4's counter — and a request with no cookie at all starts a fresh session back at `1`, exactly as `$_SESSION`'s cookie-keyed design would predict.

> **Pitfall:** `session_start()` must run before any HTML output — it sets an HTTP header (the session cookie), and headers can't be sent after the response body has already started. A stray `echo` or even whitespace before `<?php` on the first line of a file will produce a real "headers already sent" error the moment `session_start()` runs after it.

**Practice**

- Add a `logout.php` that calls `session_destroy()`, and confirm — with the same cookie jar — that the next request to `session.php` starts back at `Views: 1`.
- Store a `$_SESSION['favorites'] = []` array and add to it across two separate requests, proving Capstone 1's leftover "mark as favorite" feature is now genuinely possible.

## Real password hashing: `password_hash()` / `password_verify()`

**You'll be able to:** hash a password correctly and verify a login attempt against it, using PHP's own built-in, correct-by-default functions.

**Concept**

`password_hash($password, PASSWORD_DEFAULT)` produces a salted hash using PHP's current recommended algorithm (bcrypt as of this guide's verification, subject to change — that's the entire point of `PASSWORD_DEFAULT` rather than naming an algorithm explicitly) — never store a plaintext password, and never hand-roll a hashing scheme. `password_verify($password, $hash)` checks a plaintext attempt against a stored hash, handling the salt comparison internally.

**Example**

```php
<?php
$hash = password_hash('correct horse battery staple', PASSWORD_DEFAULT);
echo "hash starts with: " . substr($hash, 0, 7) . "\n";
var_dump(password_verify('correct horse battery staple', $hash));
var_dump(password_verify('wrong password', $hash));
```
```
hash starts with: $2y$12$
bool(true)
bool(false)
```

> **Pitfall:** `password_hash()` produces a *different* hash string every time, even for the identical password — the salt is randomized per call. Comparing two `password_hash()` outputs directly with `===` to check "same password" is always wrong; `password_verify()` is the only correct comparison, because it re-derives the comparison using the salt already embedded in the stored hash.

**Practice**

- Hash the same password twice and confirm the two hash strings are different, then confirm `password_verify()` succeeds against both anyway.
- Build a tiny registration/login pair: store `['username' => ..., 'password_hash' => password_hash(...)]` rows in an array, and write a `login($username, $attempt)` function using `password_verify()` — this is directly what Capstone 4's real, PDO-backed version does next, just not persisted yet.

## Progress check

1. What's the actual mechanism that lets `$_SESSION` survive across requests, when Module 4 proved plain variables can't?
2. Why must `session_start()` run before any output?
3. Why is comparing two `password_hash()` outputs with `===` always the wrong check?

### Answers

1. Session data is written to disk (or another store) at the end of each request and read back at the start of the next, keyed by a cookie the browser resends — it never depended on the script's own in-memory state surviving between requests, so Module 4's per-request teardown doesn't touch it.
2. `session_start()` sets the session-id cookie via an HTTP header, and HTTP headers must be sent before any response body content — any output (even accidental whitespace) before it triggers a real "headers already sent" error.
3. Because `password_hash()` randomizes the salt on every call, so the same password produces a different hash string each time — `===` would (incorrectly) report even the correct password as a mismatch against a hash generated at a different time; `password_verify()` correctly re-derives the comparison using the salt already stored inside the hash itself.
