# Module 3 — Control Flow

By the end of this module you'll be able to branch with `IF` and `EVALUATE`, loop with every practical form of `PERFORM`, and use 88-level condition names to make boolean checks read like English. Feeds Capstone 1.

## `IF` and `EVALUATE`

**You'll be able to:** branch with `IF`/`ELSE`, and use `EVALUATE` for both literal-match and multi-condition dispatch.

**Concept**

`IF condition ... ELSE ... END-IF` works as you'd expect from any of this series' earlier languages. `EVALUATE` is COBOL's `switch`/`case` — but with a genuinely distinctive second form: `EVALUATE TRUE` followed by `WHEN <condition>` clauses turns it into an ordered if/elif chain, useful when the branches aren't testing the same variable against literal values.

**Example**

```cobol
       EVALUATE WS-GRADE
           WHEN "A" DISPLAY "Excellent"
           WHEN "B" DISPLAY "Good"
           WHEN "C" DISPLAY "Average"
           WHEN OTHER DISPLAY "Unknown"
       END-EVALUATE.

       EVALUATE TRUE
           WHEN WS-SCORE >= 90 DISPLAY "Grade A"
           WHEN WS-SCORE >= 80 DISPLAY "Grade B"
           WHEN OTHER DISPLAY "Grade C or below"
       END-EVALUATE.
```

```
$ cobc -x -o control control.cbl && ./control
Good
Grade B
```

Verified directly: with `WS-GRADE` = `"B"` and `WS-SCORE` = `82`, both forms picked the correct branch — the second `EVALUATE TRUE` form evaluated each `WHEN`'s full condition in order, stopping at the first true one, exactly like a chain of `ELSE IF`.

> **Pitfall:** `WHEN OTHER` is not automatically required the way a `default` case isn't required in some languages' `switch` — but without it, a value matching no `WHEN` simply falls through with no branch executed at all, silently, not an error.

**Practice**

- Change `WS-GRADE` to a value with no matching `WHEN` and confirm `WHEN OTHER` catches it.
- Rewrite the `EVALUATE TRUE` example as an equivalent `IF`/`ELSE IF`/`ELSE` chain and confirm it produces the same output.

## `PERFORM`: every practical loop shape

**You'll be able to:** write a counted loop with `PERFORM VARYING`, and state what plain `PERFORM` and `PERFORM UNTIL` do differently.

**Concept**

`PERFORM` is COBOL's looping (and, in its non-inline form covered in Module 10, subroutine-calling) construct. Three shapes matter here:

- `PERFORM paragraph-name` — runs a named paragraph once (covered fully alongside `PERFORM THRU` in Module 10).
- `PERFORM ... UNTIL condition ... END-PERFORM` — an inline loop that runs until the condition becomes true, checked *before* each iteration (so it can run zero times).
- `PERFORM VARYING identifier FROM start BY step UNTIL condition ... END-PERFORM` — a counted loop, incrementing `identifier` by `step` each pass, stopping once `condition` is true.

**Example**

```cobol
       PERFORM VARYING WS-I FROM 1 BY 1 UNTIL WS-I > 3
           DISPLAY "Loop iteration: " WS-I
       END-PERFORM.
```

```
$ ./control
Loop iteration: 01
Loop iteration: 02
Loop iteration: 03
```

Verified directly: three iterations, `WS-I` at `1`, `2`, `3` — the loop stops the moment `WS-I > 3` becomes true, so `WS-I` never reaches 4 inside the loop body.

> **Pitfall:** the condition in `PERFORM ... UNTIL` and `PERFORM VARYING ... UNTIL` is checked *before* the iteration, not after — a loop whose condition starts out true runs zero times, unlike a `do...while`-style construct in some other languages. If you need "run at least once," you need `PERFORM ... WITH TEST AFTER UNTIL`.

**Practice**

- Rewrite the counted loop above using `PERFORM ... UNTIL` and a manually incremented counter instead of `PERFORM VARYING`, and confirm identical output.
- Predict, then verify, how many times `PERFORM VARYING WS-I FROM 5 BY 1 UNTIL WS-I > 3` runs.

## 88-level condition names

**You'll be able to:** declare an 88-level condition name under a data field and test it directly in an `IF`, instead of writing out the comparison by hand.

**Concept**

An 88-level entry doesn't declare storage of its own — it names a specific value (or range) of the field it's declared under, so that `IF condition-name` reads as a direct boolean test rather than `IF WS-FIELD = literal-value`.

**Example**

```cobol
       01  WS-STATUS-CODE      PIC 9 VALUE 1.
           88  WS-ACTIVE                VALUE 1.
           88  WS-INACTIVE              VALUE 0.
       ...
       IF WS-ACTIVE
           DISPLAY "Status is active (via 88-level)"
       ELSE
           DISPLAY "Status is inactive"
       END-IF.
```

```
$ ./control
Status is active (via 88-level)
```

Verified directly: `WS-STATUS-CODE` holds `1`, and `IF WS-ACTIVE` — reading its condition name, not comparing a literal — correctly resolves to true. The real benefit shows up at scale: if the status field's underlying representation ever changes (say, from a single digit to a longer code), every `IF WS-ACTIVE` in the program keeps working unchanged, because the comparison logic lives in one place — the 88-level declaration — not scattered across every place that checks it.

> **Pitfall:** an 88-level name only tests equality (or a `VALUES ... THRU ...` range) against its parent field's *current* value — it isn't a variable you can assign to directly; `SET WS-ACTIVE TO TRUE` is the correct way to make the condition become true, which under the hood moves `88`'s declared value into the parent field.

**Practice**

- Add a third 88-level name, `WS-PENDING VALUE 2`, and write an `EVALUATE TRUE` that reports all three statuses by name.
- Use `SET WS-INACTIVE TO TRUE` to change `WS-STATUS-CODE`'s value indirectly, then `DISPLAY WS-STATUS-CODE` to confirm what actually happened to the underlying field.

## Progress check

1. What's the difference between `EVALUATE WS-FIELD WHEN literal` and `EVALUATE TRUE WHEN condition`?
2. What happens if a value matches no `WHEN` and there's no `WHEN OTHER`?
3. Is `PERFORM ... UNTIL condition`'s condition checked before or after each iteration, by default?
4. What does an 88-level entry actually declare — storage of its own, or something else?
5. How do you make an 88-level condition become true?

### Answers

1. The first form compares one field against a series of literal values; the second (`EVALUATE TRUE`) evaluates each `WHEN`'s own full boolean condition in order, functioning as an if/elif chain, useful when branches test different conditions rather than one field against literals.
2. Nothing executes — the `EVALUATE` falls through silently with no branch run, not an error.
3. Before — a `PERFORM ... UNTIL` loop whose condition is already true runs zero times, unless `WITH TEST AFTER` is specified.
4. No storage of its own — it names a specific value (or range) of the data field it's declared directly under, letting code test that condition by name instead of writing the comparison out each time.
5. With `SET condition-name TO TRUE`, which moves that 88-level's declared value into its parent field.
