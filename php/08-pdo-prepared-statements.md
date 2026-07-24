# Module 8 — PDO & Prepared Statements

The direct callback to `sql/`'s own material — and the real, load-bearing reason PHP has a standard, correct answer to SQL injection. Feeds Capstone 4.

## Connecting with PDO

**You'll be able to:** open a PDO connection to SQLite and run a query, the same relational model `sql/` and `rails/` both already used.

**Concept**

PDO (PHP Data Objects) is PHP's standard database-access layer — one consistent API across SQLite, MySQL, PostgreSQL, and others, differing only in the connection string (the DSN). `rails/`'s own guide made the point directly: ActiveRecord is a real ORM sitting on top of exactly this kind of relational access, not a different one. PDO is that underlying layer, by hand.

**Example**

```php
<?php
$pdo = new PDO('sqlite::memory:');
$pdo->exec('CREATE TABLE users (id INTEGER PRIMARY KEY, name TEXT, is_admin INTEGER DEFAULT 0)');
$pdo->exec("INSERT INTO users (name, is_admin) VALUES ('alice', 0), ('bob_admin', 1)");
```

> **Pitfall:** `sqlite::memory:` creates a database that exists only for the current script execution — combined with Module 4's finding, an in-memory SQLite connection opened fresh in every PHP request is exactly as stateless as a plain array was. Capstone 4 uses a real file-backed SQLite database specifically to avoid this.

**Practice**

- Open a file-backed connection instead (`new PDO('sqlite:tasks.db')`), create the same table, insert a row, and confirm — by running a second, separate PHP script against the same file — that the data is actually there.

## The vulnerability, demonstrated directly

**You'll be able to:** show, with a real attack string, exactly how raw SQL string interpolation is exploitable — not as a warned-against abstraction, but as a working exploit against your own code.

**Concept**

Building a SQL query by interpolating a variable directly into the string lets anything in that variable become part of the query's own syntax, not just its data. This isn't a theoretical risk — it's directly demonstrable with a single crafted string.

**Example**

```php
<?php
function vulnerableLookup(PDO $pdo, string $name): array {
    $sql = "SELECT * FROM users WHERE name = '$name'";
    return $pdo->query($sql)->fetchAll(PDO::FETCH_ASSOC);
}

$evil = "' OR '1'='1";
print_r(vulnerableLookup($pdo, $evil));
```
```
Array
(
    [0] => Array ( [id] => 1 [name] => alice [is_admin] => 0 )
    [1] => Array ( [id] => 2 [name] => bob_admin [is_admin] => 1 )
)
```

The attack string `' OR '1'='1` turns `WHERE name = '$name'` into `WHERE name = '' OR '1'='1'` — a condition that's true for every row — and the "lookup one user by name" function returns the *entire table*, `is_admin` flags included. This is exactly the class of bug that makes SQL injection a real, top-tier web vulnerability, not a scare story.

## The fix: prepared statements

**You'll be able to:** rewrite the vulnerable lookup using a prepared statement, and confirm the identical attack string now fails harmlessly.

**Concept**

A prepared statement (`$pdo->prepare(...)`) sends the query's *structure* to the database separately from its *data* — placeholders (`?`) mark where values go, and `execute([...])` binds real values to those placeholders afterward. The database never parses attacker input as SQL syntax at all, because the query's syntax was already fixed before any user data arrived.

**Example**

```php
<?php
function safeLookup(PDO $pdo, string $name): array {
    $stmt = $pdo->prepare("SELECT * FROM users WHERE name = ?");
    $stmt->execute([$name]);
    return $stmt->fetchAll(PDO::FETCH_ASSOC);
}

print_r(safeLookup($pdo, $evil));  // same $evil string as above
```
```
Array
(
)
```

The identical `' OR '1'='1` string, against the identical table, now returns **zero rows** — treated purely as a literal name nobody has, not as SQL syntax. Same attack, same data, one method call different, completely different outcome.

> **Pitfall:** `$pdo->query()` (used in the vulnerable version) executes a string directly with no separation between structure and data — it's not inherently unsafe for *every* use (a query with no variable data at all is fine), but the moment any part of the query string comes from outside the script, `query()` on an interpolated string is the exact shape of the bug just demonstrated. `prepare()`/`execute()` is the default for any query touching external input, not a special case reserved for "risky" ones.

**Practice**

- Add a second placeholder to `safeLookup` filtering by `is_admin` as well, and confirm named placeholders (`:name`, `:admin`) work identically to positional `?` ones.
- Try the same `$evil` string against a prepared statement matching on `id` (cast to `int` first) instead of `name` — confirm the type coercion alone would have also blocked this particular attack, and explain why relying on that instead of prepared statements generally would still be fragile.

## Progress check

1. What does `WHERE name = '$name'` actually become, character for character, when `$name` is `' OR '1'='1`?
2. What's the real mechanism that makes a prepared statement safe — not "it's the recommended way," the actual reason?
3. Why does `is_admin` leaking in the vulnerable example matter more than just "the function returned extra rows"?

### Answers

1. `WHERE name = '' OR '1'='1'` — the attacker's `'` closes the intended string literal early, and the rest of the input becomes real SQL syntax: an `OR` condition that's always true, matching every row in the table.
2. The query's structure (placeholders) is sent to the database and fixed *before* any user-supplied value is bound to it — the database parses the SQL syntax once, without user input present at all, so nothing a value contains can be interpreted as SQL syntax afterward.
3. Because it demonstrates the vulnerability isn't just "returns wrong data" — it's a real information-disclosure/privilege-escalation vector: an attacker looking up "their own" user row by name could, with this exact bug, retrieve every user's admin status in one request.
