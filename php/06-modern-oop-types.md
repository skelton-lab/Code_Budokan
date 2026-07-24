# Module 6 — Modern OOP & Types

PHP 8.x's real, current type-system additions — verified against 8.5, not the pre-8.0 language people remember. Feeds Capstone 3.

## Constructor property promotion and `readonly`

**You'll be able to:** declare and populate class properties directly in the constructor signature, and make them immutable after construction with `readonly`.

**Concept**

Before PHP 8.0, declaring a typed property and then assigning it in the constructor was two separate, repetitive steps. Constructor property promotion collapses them: a typed constructor parameter with a visibility modifier (`public`, `private`, `protected`) *is* the property declaration. `readonly` (8.1+) marks a property as settable exactly once — during construction — and unsettable afterward; any later assignment throws a real `Error`, not a silent no-op.

**Example**

```php
<?php
declare(strict_types=1);

class Point {
    public function __construct(
        public readonly float $x,
        public readonly float $y,
    ) {}
}

$p = new Point(1.5, 2.5);
echo "Point: {$p->x}, {$p->y}\n";

try {
    $p->x = 9.0;
} catch (Error $e) {
    echo "readonly blocked: " . $e->getMessage() . "\n";
}
```
```
Point: 1.5, 2.5
readonly blocked: Cannot modify readonly property Point::$x
```

> **Pitfall:** `readonly` only blocks reassignment from *outside* the declaring scope after construction completes — it does not make the property deeply immutable. A `readonly array $items` still lets you mutate an object stored *inside* that array; `readonly` protects the property binding, not everything reachable through it.

**Practice**

- Add a third `readonly` property to `Point` (a `string $label`), and confirm the constructor still assigns all three correctly.
- Write a `Rectangle` class with `readonly` `width`/`height`, and an `area()` method — confirm `area()` can read the readonly properties freely (reading is never restricted, only writing).

## `enum`: pure and backed

**You'll be able to:** declare both a pure enum and a string-backed enum, and explain the real difference.

**Concept**

`enum Status { case Active; case Done; }` is a pure enum — a fixed set of named cases with no underlying scalar value. `enum Status: string { case Active = 'active'; case Done = 'done'; }` is a *backed* enum — each case also has a real, retrievable scalar value (`$status->value`), useful the moment you need to store or transmit the case (a database column, a JSON field) rather than only compare it in memory.

**Example**

```php
<?php
enum Status: string {
    case Active = 'active';
    case Done = 'done';
}

$s = Status::Active;
echo "Enum: {$s->value}\n";

$fromDb = Status::from('done');
echo "From value: " . $fromDb->name . "\n";
```
```
Enum: active
From value: Done
```

> **Pitfall:** `Status::from('bogus')` throws a `ValueError` for an unrecognized backing value — real, and worth catching explicitly at any point a backed enum is built from external input (a database row, a request parameter); `Status::tryFrom('bogus')` returns `null` instead of throwing, the safer default when the value's validity isn't already guaranteed.

**Practice**

- Add a `case Archived = 'archived';` case, and write a `match` (next section) that maps each case to a human-readable label.
- Demonstrate `tryFrom()` returning `null` for an invalid string, without a `try`/`catch`.

## `match`: a real expression, not a fallthrough-prone `switch`

**You'll be able to:** write a `match` expression, and explain the two ways it differs from `switch`.

**Concept**

`match` compares with strict (`===`) equality, never falls through between arms, and — critically — is an **expression**, evaluating directly to a value rather than requiring `break` inside each branch or a separate variable assigned across `case`s. An unmatched value with no `default` arm throws `UnhandledMatchError`, a real, deliberate failure rather than silently doing nothing.

**Example**

```php
<?php
$label = match($s) {
    Status::Active => 'still going',
    Status::Done => 'finished',
};
echo "Match: $label\n";
```
```
Match: still going
```

**Practice**

- Write a `match` over an `int` severity level (1, 2, 3) returning `'low'`/`'medium'`/`'high'`, with a `default` arm for anything else.
- Remove the `default` arm, pass an unmatched value, and confirm `UnhandledMatchError` is thrown rather than the expression silently returning `null`.

## Union types and the nullsafe operator

**You'll be able to:** declare a parameter accepting more than one type, and chain a property/method access that short-circuits safely on `null`.

**Concept**

`int|string $v` declares a parameter that accepts either type — genuinely useful where PHP would otherwise force an unnecessary type-coercion. `?->` (nullsafe) short-circuits an entire chained access to `null` the moment any link in the chain is `null`, rather than throwing on "call to a member function on null."

**Example**

```php
<?php
function fmt(int|string $v): string {
    return is_int($v) ? "int:$v" : "str:$v";
}
echo fmt(5) . " " . fmt("hi") . "\n";

class Box { public ?Point $point = null; }
$box = new Box();
echo ($box->point?->x ?? 'no point') . "\n";
```
```
int:5 str:hi
no point
```

> **Pitfall:** `?->` only guards the specific link it's placed on — `$a?->b->c` still throws if `$a->b` is non-null but `null`-ish in some other way `->c` can't handle; every link in a chain that might be `null` needs its own `?->`, not just the first one.

**Practice**

- Write a function accepting `int|float $n` that doubles the value and returns the same type it received (confirm both an `int` input and a `float` input round-trip correctly).
- Build a three-level nullsafe chain (`$order?->customer?->address?->city`) and confirm it returns `null` cleanly when any one link is missing, without a fatal error.

## Progress check

1. What does constructor property promotion actually eliminate, compared to pre-8.0 PHP?
2. What's the real difference between `readonly` and true deep immutability?
3. Name the two concrete differences between `match` and `switch`.
4. What does `Status::tryFrom('bogus')` return, versus `Status::from('bogus')`, for an unrecognized value?

### Answers

1. The separate, repetitive step of declaring a typed property and then assigning `$this->x = $x;` in the constructor body — promotion does both in the constructor's own parameter list.
2. `readonly` blocks reassigning the property binding itself from outside the declaring scope after construction; it does not make anything reachable *through* that property (an array's contents, an object's own mutable properties) immutable.
3. `match` compares with strict `===` (never loose `==`) and never falls through between arms; it's also an expression that evaluates directly to a value, unlike `switch`'s statement-based, `break`-requiring form.
4. `tryFrom('bogus')` returns `null`; `from('bogus')` throws a `ValueError`. `tryFrom` is the safer default when the input's validity isn't already guaranteed.
