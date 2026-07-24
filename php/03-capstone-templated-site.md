# Capstone 1 — A Templated Recipe Site

Proves Modules 1–2 together: a real, multi-page, server-rendered site using nothing but `<?php ?>`/`<?=`, the alternate control-structure syntax, and `$_GET` — no framework, no build step, no JavaScript.

## The build

Three files, run directly with `php -S`:

**`data.php`** — a plain function returning an in-memory array (Module 1's array-as-map-of-maps):

```php
<?php
function recipes(): array {
    return [
        1 => ['name' => 'Pancakes', 'minutes' => 20, 'tags' => ['breakfast', 'easy']],
        2 => ['name' => 'Beef Stew', 'minutes' => 120, 'tags' => ['dinner', 'slow-cook']],
        3 => ['name' => 'Caesar Salad', 'minutes' => 15, 'tags' => ['lunch', 'easy']],
    ];
}
```

**`index.php`** — the list page, with a `$_GET`-driven tag filter and a form that resubmits to itself:

```php
<?php
require 'data.php';
$recipes = recipes();
$tagFilter = $_GET['tag'] ?? null;
if ($tagFilter !== null) {
    $recipes = array_filter($recipes, fn($r) => in_array($tagFilter, $r['tags'], true));
}
?>
<!DOCTYPE html>
<html><body>
<h1>Recipes<?php if ($tagFilter): ?> tagged "<?= htmlspecialchars($tagFilter) ?>"<?php endif; ?></h1>
<form method="get">
  <input type="text" name="tag" value="<?= htmlspecialchars($tagFilter ?? '') ?>" placeholder="filter by tag">
  <button type="submit">Filter</button>
</form>
<ul>
<?php foreach ($recipes as $id => $r): ?>
  <li><a href="recipe.php?id=<?= $id ?>"><?= htmlspecialchars($r['name']) ?></a> (<?= $r['minutes'] ?> min)</li>
<?php endforeach; ?>
</ul>
</body></html>
```

**`recipe.php`** — the detail page, taking `id` from the query string and handling the not-found case explicitly:

```php
<?php
require 'data.php';
$recipes = recipes();
$id = (int) ($_GET['id'] ?? 0);
$recipe = $recipes[$id] ?? null;
?>
<!DOCTYPE html>
<html><body>
<?php if ($recipe === null): ?>
  <p>Recipe not found.</p>
<?php else: ?>
  <h1><?= htmlspecialchars($recipe['name']) ?></h1>
  <p><?= $recipe['minutes'] ?> minutes. Tags: <?= htmlspecialchars(implode(', ', $recipe['tags'])) ?></p>
<?php endif; ?>
<a href="index.php">Back to list</a>
</body></html>
```

## Verified

```
$ php -S localhost:8937

$ curl "localhost:8937/index.php" | grep -o '<li>.*</li>'
<li><a href="recipe.php?id=1">Pancakes</a> (20 min)</li>
<li><a href="recipe.php?id=2">Beef Stew</a> (120 min)</li>
<li><a href="recipe.php?id=3">Caesar Salad</a> (15 min)</li>

$ curl "localhost:8937/index.php?tag=easy" | grep -o '<li>.*</li>'
<li><a href="recipe.php?id=1">Pancakes</a> (20 min)</li>
<li><a href="recipe.php?id=3">Caesar Salad</a> (15 min)</li>

$ curl "localhost:8937/recipe.php?id=2" | grep -E 'h1|<p>'
  <h1>Beef Stew</h1>
  <p>120 minutes. Tags: dinner, slow-cook</p>

$ curl "localhost:8937/recipe.php?id=99" | grep -o '<p>.*</p>'
<p>Recipe not found.</p>
```

The tag filter correctly narrows the list (2 of 3 recipes for `tag=easy`), the detail page correctly resolves an id to a recipe, and a nonexistent id correctly falls through to the `$recipe === null` branch rather than a PHP warning or a blank page — the `?? null` on the array lookup is doing exactly the job Module 2's `??` section named.

## Extend it yourself

- Add a `POST`-based "mark as favorite" action that stores favorited ids in... nowhere yet — Module 4 is about to explain precisely why an in-memory array won't survive that, before Module 9 gives you the real fix.
- Add a second filter (by `minutes <=` some maximum) combinable with the tag filter.
