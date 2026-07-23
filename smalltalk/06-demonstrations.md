# Module 6 — Small Demonstrations

One combined demonstration, tying together classes (Module 2), message-based iteration (Module 3), blocks (Module 4), and collection protocols (`select:`/`collect:`/`inject:into:` from Module 4) into something closer to a real small program. Verified.

## An inventory tracker

**Proves:** a class managing its own internal collection, with block-based querying — the shape a great deal of real Smalltalk code actually takes.

```smalltalk
Object subclass: Inventory [
    | items |
    init [ items := OrderedCollection new ]
    addItem: name price: p [
        items add: (Array with: name with: p)
    ]
    totalValue [
        ^items inject: 0 into: [ :acc :pair | acc + (pair at: 2) ]
    ]
    expensiveItems: threshold [
        ^(items select: [ :pair | (pair at: 2) > threshold ])
            collect: [ :pair | pair at: 1 ]
    ]
    report [
        items do: [ :pair |
            Transcript showCr: (pair at: 1), ': ', (pair at: 2) printString
        ]
    ]
]

| inv |
inv := Inventory new.
inv init.
inv addItem: 'Widget' price: 25.
inv addItem: 'Gadget' price: 75.
inv addItem: 'Gizmo' price: 40.

inv report.
Transcript showCr: 'total: ', inv totalValue printString.
Transcript showCr: 'expensive: ', (inv expensiveItems: 30) printString.
```

Verified — the exact output:
```
Widget: 25
Gadget: 75
Gizmo: 40
total: 140
expensive: OrderedCollection ('Gadget' 'Gizmo' )
```

`totalValue` correctly sums to `140` via `inject:into:`; `expensiveItems: 30` correctly chains `select:` (keep items over the threshold) into `collect:` (extract just their names), returning `'Gadget'` and `'Gizmo'` — both priced above `30`, `'Widget'` (at `25`) correctly excluded.

> **Notice what this demonstration doesn't need:** no `for` loop written by hand anywhere, no index variables, no explicit iteration counters. Every piece of traversal — `do:`, `select:`, `collect:`, `inject:into:` — is a message sent to the collection itself, with a block describing what to do at each element. This is Module 3's central claim, still holding at a larger, more realistic scale: control flow and iteration are message sends, all the way down, even in a program that looks and behaves like ordinary application code rather than a syntax demonstration.

**Practice**

- Add a `removeItem:` method and confirm `totalValue` updates correctly afterward.
- Add a `cheapestItem` method using `inject:into:` to find the minimum-priced item's name, without a dedicated `min` method.
- Rewrite this exact program's data model in your Ruby guide's own style (a `Struct`-like pair, or a small `Item` class) and compare directly — same underlying shape, two different points along the same historical lineage.

## Progress check

1. What three collection-protocol messages does `Inventory` use internally, and what does each one do?
2. Why does `expensiveItems:` chain `select:` into `collect:`, rather than doing both in one pass by hand?
3. What's notably absent from this entire program, that would be present in most of this series' other languages' equivalent code?
4. What does this demonstration confirm about Module 3's central claim, at a larger scale than that module's own simple examples?

### Answers

1. `inject:into:` (combines every item into a running total), `select:` (keeps only items matching a condition), `collect:` (transforms each remaining item, here extracting just the name) — map/filter/reduce, under their Smalltalk names, from Module 4.
2. It mirrors exactly the same `.select { }.map { }`-style chaining shown in Module 4 and in this series' other guides — narrowing down first, then transforming, read left to right as a pipeline, rather than writing one hand-rolled loop that does both jobs at once.
3. Any hand-written `for`/`while` loop, index variable, or iteration counter — every piece of traversal is expressed as a message sent to the collection, with a block describing the per-element behavior.
4. That "control flow and iteration are message sends" isn't just true for small, isolated syntax examples (Module 3's `ifTrue:ifFalse:`/`whileTrue:`) — it holds at the scale of a program that actually resembles real application code, with a class managing its own state and querying it in several different ways.
