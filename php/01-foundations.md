# Module 1 — Foundations

The syntax and type behavior every later module assumes. Feeds all four capstones.

## Variables, interpolation, and the `$` sigil

**You'll be able to:** declare variables and interpolate them directly into strings, in both the plain and curly-brace forms.

**Concept**

Every PHP variable is prefixed with `$` — there's no `let`/`var`/`const` keyword for a plain variable, the sigil itself is the declaration. Double-quoted strings interpolate variables directly; single-quoted strings never do, a real and frequently-relevant distinction (not a style preference). `{$expr}` curly-brace interpolation handles anything more complex than a bare variable name — property access, array indexing — inside a string.

**Example**

```php
<?php
$name = "Ada";
$age = 36;
echo "Hello, $name! You are $age.\n";
echo "Curly: {$name}'s age is {$age}\n";
```
```
Hello, Ada! You are 36.
Curly: Ada's age is 36
```

> **Pitfall:** `'Hello, $name'` (single-quoted) prints the literal text `Hello, $name` — no interpolation happens at all. This is a real, easy mistake coming from a language where all strings interpolate the same way.

**Practice**

- Write a function that takes a name and an array of three test scores, and returns a single interpolated string reporting all three.
- Demonstrate the single-quote-vs-double-quote difference with a one-line comment explaining why the output differs.

## Loose typing, and turning it off with `strict_types`

**You'll be able to:** explain what PHP coerces by default, and enforce real type-checking with `declare(strict_types=1)`.

**Concept**

PHP is loosely typed by default: a function typed `function add(int $a, int $b): int` will happily accept `"5"` and coerce it to `5`. `declare(strict_types=1)` — which must be the very first statement in a file — turns this off for that file: a `string` passed where an `int` is declared throws a real `TypeError` instead of being silently coerced. This guide uses `strict_types=1` in every capstone from here forward; PHP itself defaults to loose.

**Example**

```php
<?php
declare(strict_types=1);

function addStrict(int $a, int $b): int { return $a + $b; }

try {
    addStrict("5", 10);
} catch (TypeError $e) {
    echo "TypeError: " . $e->getMessage() . "\n";
}
echo addStrict(5, 10) . "\n";
```
```
TypeError: addStrict(): Argument #1 ($a) must be of type int, string given, called in strict.php on line 5
15
```

> **Pitfall:** `declare(strict_types=1)` only affects **that file's own function calls into typed parameters** — it doesn't retroactively make PHP itself strict, and it doesn't affect built-in function behavior. It's a per-file opt-in, not a global mode.

**Practice**

- Write the same `addStrict` function without `declare(strict_types=1)` at the top, and confirm `addStrict("5", 10)` now silently returns `15` instead of throwing.

## The array: one type, both list and map

**You'll be able to:** build and read PHP's array as both an ordered list and a string-keyed map, and explain why it's one type doing both jobs.

**Concept**

PHP has exactly one compound data structure — the array — and it's simultaneously an ordered list (integer keys, `0, 1, 2…` by default) and a hash map (any string or integer key). There's no separate "dict" or "list" type the way Python or Ruby have; `["a", "b", "c"]` and `["x" => 1, "y" => 2]` are the same underlying type, and you can freely mix both key styles in one array.

**Example**

```php
<?php
$list = ["a", "b", "c"];
$map = ["x" => 1, "y" => 2];
var_dump(gettype($list) === gettype($map));  // bool(true) — same type

$mixed = ["a", "b", "key" => "val"];
print_r($mixed);
```
```
bool(true)
Array
(
    [0] => a
    [1] => b
    [key] => val
)
```

> **Pitfall:** because list and map are the same type, a function that expects a list-shaped array (sequential integer keys from 0) will behave unexpectedly if handed a map-shaped one instead — `foreach` still works either way, but anything relying on integer-index access (`$arr[0]`) assumes the sequential case specifically.

**Practice**

- Build a map from three fruit names to their prices, then a plain list of the same three fruit names, and print both with `foreach`.
- Write a function that takes an array and returns `true` only if every key is a sequential integer starting at 0 (a "real list" check) — this is genuinely useful groundwork for Module 2's form-data handling.

## Progress check

1. What's the actual difference in output between `'$name'` and `"$name"`?
2. What does `declare(strict_types=1)` change, specifically — and what does it *not* change?
3. Why is `["a", "b", "c"]` and `["x" => 1, "y" => 2]` the same type in PHP, unlike in most other languages this series covers?

### Answers

1. Single-quoted strings never interpolate — `'$name'` prints the four literal characters `$name`. Double-quoted strings interpolate variables directly.
2. It makes *that file's* typed function calls throw a real `TypeError` on a type mismatch instead of silently coercing the argument. It doesn't change untyped code, doesn't affect built-in functions, and doesn't apply to any other file unless that file also declares it.
3. PHP has one compound type — the array — that serves as both an ordered list and a string-keyed map, distinguished only by what keys happen to be present, not by a separate type declaration.
