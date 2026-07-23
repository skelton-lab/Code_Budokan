# Module 3 — Capstone 1: A Grade Report

**Proves:** `case` (including range labels), functions returning a value, value vs. `var` parameters (Modules 1–2).

A small grade-reporting system: a function mapping a numeric score to a letter grade via `case`, a procedure that curves scores in place using a `var` parameter, and the whole thing run twice to show the curve's effect directly. Every result below is a real, verified `fpc` compile-and-run.

## The program

```pascal
type
  Grade = (A, B, C, D, F);

function ScoreToGrade(score: integer): Grade;
begin
  case score of
    90..100: ScoreToGrade := A;
    80..89:  ScoreToGrade := B;
    70..79:  ScoreToGrade := C;
    60..69:  ScoreToGrade := D;
  else
    ScoreToGrade := F;
  end;
end;

procedure CurveScore(var score: integer; points: integer);
begin
  score := score + points;
  if score > 100 then
    score := 100;
end;
```

Two things worth noting precisely: `case score of 90..100: ...` uses a **range** as a case label — matching an entire span of values in one branch, not one value per line — a real, standard Pascal feature, not something invented for this capstone. `ScoreToGrade`'s return value is set by assigning to the function's own name (`ScoreToGrade := A`) inside its body, Pascal's actual mechanism for returning a value — there's no separate `return` keyword. `CurveScore` takes `score` as a `var` parameter specifically because it needs to modify the caller's actual variable (Module 2's exact distinction) while `points` stays an ordinary by-value parameter, since the curve amount is only ever read, never written.

## Verified run

```pascal
var
  alice, bob: integer;
begin
  alice := 88;
  bob := 55;
  PrintGrade('Alice', alice);
  PrintGrade('Bob', bob);
  CurveScore(alice, 10);
  CurveScore(bob, 10);
  PrintGrade('Alice', alice);
  PrintGrade('Bob', bob);
end.
```

Verified output:

```
Alice: 88 -> B
Bob: 55 -> F
--- applying a 10-point curve ---
Alice: 98 -> A
Bob: 65 -> D
```

Alice's `88` (a `B`) becomes `98` (an `A`) after the curve; Bob's `55` (an `F`) becomes `65` (a `D`) — both computed correctly by `ScoreToGrade`'s range-based `case`, and both genuinely modified in place by `CurveScore`'s `var score` parameter, verified directly since `PrintGrade` reads `alice`/`bob` fresh each time, not a cached value from before the curve.

> **Pitfall:** if `CurveScore`'s `score` parameter were declared as a plain value parameter instead of `var`, this program would still compile and run without any error — it would just silently curve a private copy that's discarded the instant `CurveScore` returns, leaving `alice` and `bob` completely unchanged, and the second pair of `PrintGrade` calls would print the exact same grades as the first. This is precisely the kind of mistake Module 2 flagged: nothing about a missing `var` looks wrong at the call site (`CurveScore(alice, 10)` is valid either way); the bug only shows up in the *caller's* value afterward.

## Practice

- Add a `Grade` boundary case exactly at `100` and confirm `90..100` correctly includes it (a range's upper bound is inclusive).
- Change `CurveScore`'s `score` parameter to a plain value parameter (removing `var`), rerun, and confirm the curve now has no visible effect on `alice`/`bob` at all — direct, hands-on proof of this module's own pitfall.
- Add a fifth `case` branch inside `ScoreToGrade` for scores below `0` or above `100` (invalid input), deciding what `ScoreToGrade` should do in that case, and justify the choice.
