# Module 4 — The Request Lifecycle

The single most consequential way PHP differs from `javascript/07-server.md`'s own server model — verified directly, not asserted. Feeds Capstone 2.

## `php -S`: one process, but not one continuous execution

**You'll be able to:** start PHP's built-in development server, and state precisely what does and doesn't persist between requests to it.

**Concept**

`php -S host:port` starts a real HTTP server — the same kind of tool `Bun.serve` is for JavaScript (`javascript/07-server.md`). The difference is what happens to your script's own variables between requests. Bun's `fetch` handler runs inside one long-lived process, and a variable declared outside the handler (`javascript/07-server.md`'s own `users` array) stays in memory across every request until the process restarts. PHP's model is different at a level below "does the process restart": **every request re-executes your script from the top, fresh, discarding all script-level state — even when the underlying server process never restarts at all.**

**Example — proving the process doesn't restart**

```php
<?php
echo "PID: " . getmypid() . "\n";
```

```
$ php -S localhost:8938 &

$ curl localhost:8938/pid-test.php
PID: 54352

$ curl localhost:8938/pid-test.php
PID: 54352
```

Same process, both requests — `getmypid()` proves it directly.

**Example — proving state doesn't survive anyway**

```php
<?php
$counter = 0;
$counter++;
echo "Counter is now: $counter\n";
```

```
$ curl localhost:8935/state-test.php
Counter is now: 1

$ curl localhost:8935/state-test.php
Counter is now: 1

$ curl localhost:8935/state-test.php
Counter is now: 1
```

Same process (confirmed above), yet `$counter` is `1` every single time — not `2`, not `3`. The script isn't remembering anything between requests; it's being re-run from `$counter = 0` on every one, in the same process, because PHP's own execution model treats a request as the unit of a script's lifetime, not the process's.

> **Pitfall:** this is easy to misdiagnose as "the server restarted" — it didn't (the PID proves that). The actual mechanism is that PHP tears down all script-level variables, object state, and everything else at the end of each request, regardless of what the OS-level process is doing. Anything that needs to survive a request has to be written somewhere external to the script's own memory — a file, a database, or (Module 9) a session.

**Practice**

- Run both example scripts yourself, confirm the same output shown above.
- Modify the counter script to also print `date('H:i:s')`, and confirm the timestamp advances across requests even though the counter doesn't — proving each request really is a fresh execution, not a cached response.

## What this means for Capstone 1's leftover question

Module 3 ended by asking how a "mark as favorite" feature could work with the recipe site's in-memory array — the honest answer, now verified directly: it can't, not as an in-memory array. Every `POST` to mark a favorite would run in its own fresh execution and vanish the moment the response is sent, exactly like the counter above. Module 9's `$_SESSION` and Module 8's PDO-backed storage are the two real fixes — persisting state somewhere PHP's own per-request teardown can't touch.

## Progress check

1. Does `php -S`'s server process actually restart between requests? What proves the answer either way?
2. What specifically does PHP discard at the end of every request, regardless of what the server process is doing?
3. Why couldn't Capstone 1's recipe site store a "favorited" list in a plain in-memory array, even if the server process ran for hours without restarting?

### Answers

1. No — `getmypid()` returns the identical process id across multiple requests, proving the same OS-level process is handling every request; it's not restarting.
2. All script-level state — variables, object instances, anything the script itself created — is discarded at the end of every request's execution, because PHP treats a request as the full lifetime of a script's execution, independent of the underlying process's own lifetime.
3. Because that teardown happens on every request regardless of process uptime — a `POST` favoriting a recipe would run, mutate the array, and then have that entire execution (and its mutated array) discarded the moment the response finished sending, with the next request starting from the original, unfavorited array again.
