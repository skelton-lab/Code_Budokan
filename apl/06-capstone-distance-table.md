# Capstone 2 — A Distance/Multiplication Table

Combines every concept from Module 5: a full pairwise distance table between three warehouses and four stores, built with outer product, then reduced along a specific axis to find each store's nearest warehouse — with no nested loop anywhere.

## The problem

Three warehouses and four stores, each at a position on a number line. Which warehouse is closest to each store, and what's the total distance if every store is served by its nearest warehouse?

```apl
warehouses←10 50 90
stores←5 25 60 95

dist←|warehouses∘.-stores
```

`dist` is a 3×4 matrix — one row per warehouse, one column per store — built entirely from Module 5's `|a∘.-b` pattern: every pairwise distance, computed at once.

## Verification

```apl
dist
```

```
 5 15 50 85
45 25 10 45
85 65 30  5
```

Checked by hand against every one of the twelve entries: row 1 (warehouse at `10`) gives distances `|10-5|=5`, `|10-25|=15`, `|10-60|=50`, `|10-95|=85`. Row 2 (warehouse at `50`) gives `45, 25, 10, 45`. Row 3 (warehouse at `90`) gives `85, 65, 30, 5`. Every entry matches.

**Finding each store's nearest warehouse — axis control matters here:**

```apl
nearest←⌊⌿dist
nearest
+/nearest
```

```
5 15 10 5
35
```

Verified directly: `⌊⌿dist` reduces along the **first** axis (Module 2's `⌊⌿` — minimum, down each column) — for each *store* (each column), it finds the minimum distance across all three warehouses. Store `5`'s nearest warehouse is `5` away (warehouse at `10`); store `25`'s nearest is `15` away (also warehouse at `10`); store `60`'s nearest is `10` away (warehouse at `50`); store `95`'s nearest is `5` away (warehouse at `90`). `+/nearest` sums these four minimum distances: `5+15+10+5 = 35` — the total distance if every store were served by its single closest warehouse.

> **Pitfall, caught during this capstone's own verification:** a first attempt named the result variable `nearest-per-store` — APL identifiers cannot contain a hyphen, since `-` always means subtraction; GNU APL correctly reported a `VALUE ERROR`, parsing it as an attempted subtraction between three undefined names (`nearest`, `per`, `store`) rather than accepting it as one identifier. Fixed by using a plain name (`nearest`) instead — a real, easy mistake for a reader coming from any language that permits hyphens or underscores freely in identifier names.

> **Pitfall:** getting the axis backward here — using `⌊/dist` (reduce along the *last* axis) instead of `⌊⌿dist` — computes something different and still plausible-looking: each *warehouse's* nearest store, not each store's nearest warehouse. Both are real, valid computations; conflating them silently answers the wrong business question with no error at all.

## Extending it yourself

- Compute each *warehouse's* nearest store instead (using `⌊/dist`, the other axis), and compare the two different, both-valid answers.
- Add a fourth warehouse and confirm the whole computation — outer product, reduction, sum — updates correctly with no other code changes, just a longer `warehouses` vector.
