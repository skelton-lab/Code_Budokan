# Module 2 — Control Flow, Procedures, and Parameters

ALGOL 60 never had a `case` statement — Pascal added one. ALGOL's parameter passing centered on call-by-name (`algol/05-call-by-name.md`, documented there, never executable) — Pascal replaced it with a much simpler, fully verifiable value/`var` split. And Pascal's `if`/`else` turns out to resolve the exact same ambiguity ALGOL 60 had, the exact same way — not via ALGOL 68's fix. Every example below is a real, verified `fpc` compile-and-run. Feeds Capstone 1.

## Three loop constructs, one genuine behavioral difference

**You'll be able to:** choose between `for`, `while`, and `repeat`, and explain the one case where the choice actually changes behavior.

**Concept**

`for` counts a fixed range; `while` checks its condition *before* each iteration (so it can run zero times); `repeat...until` checks *after* each iteration (so it always runs at least once) — the one genuine behavioral difference, not just a style choice.

**Example**

```pascal
i := 10;
while i < 0 do
  writeln('this should never print, i = ', i);
writeln('done');
```

Verified: only `done` prints — the condition (`10 < 0`) is false before the loop ever starts, so the body never runs.

```pascal
i := 10;
repeat
  writeln('runs at least once, i = ', i);
until i >= 0;
```

Verified: `runs at least once, i = 10` prints — `until i >= 0` is checked *after* the body runs, and since `10 >= 0` is already true, the loop body executes exactly once before stopping.

**Practice**

- Predict, then verify, what happens if `repeat`'s body decrements `i` and the `until` condition is `i >= 20` (a condition that's never actually reachable from a starting value of `10`) — does the loop run forever, the same way an equivalent `while true do` would?

## `case`: the statement ALGOL 60 never had

**You'll be able to:** write a `case` statement, and know it's a genuine Pascal addition, not something carried over from ALGOL.

**Concept**

`algol/04-control-dangling-else.md` covers ALGOL 60's control structures in full, and a multi-way `case`/`switch`-style statement isn't among them — ALGOL 60 only has `if`/`else` for branching. Pascal added `case` directly.

**Example**

```pascal
case x of
  1: writeln('one');
  2: writeln('two');
  3: writeln('three');
else
  writeln('other');
end;
```

Verified: with `x := 2`, this prints `two` — a clean multi-way branch with no chain of `if`/`else if` needed.

**Practice**

- Rewrite this `case` statement as an equivalent chain of `if`/`else if`/`else`, and compare readability directly — this is exactly the gap Wirth added `case` to close.

## Value and `var` parameters: ALGOL's call-by-name, replaced

**You'll be able to:** choose between value and `var` parameters, and explain precisely which one Pascal defaults to.

**Concept**

`algol/05-call-by-name.md` documents ALGOL 60's call-by-name parameter passing — a genuinely subtle, hard-to-reason-about mechanism (textually substituting the argument expression at every use, which is what makes Jensen's Device possible, and what makes call-by-name notoriously tricky to predict). Pascal replaced this entirely with a much simpler split: parameters are **by value** by default (the procedure gets its own copy, changes don't propagate back), or **by reference** if explicitly marked `var` (changes *do* propagate back to the caller's actual variable).

**Example**

```pascal
procedure ByValue(x: integer);
begin
  x := x + 100;
  writeln('inside ByValue: ', x);
end;

procedure ByRef(var x: integer);
begin
  x := x + 100;
  writeln('inside ByRef: ', x);
end;

var
  n: integer;
begin
  n := 5;
  ByValue(n);
  writeln('after ByValue, n = ', n);
  ByRef(n);
  writeln('after ByRef, n = ', n);
end.
```

Verified output:

```
inside ByValue: 105
after ByValue, n = 5
inside ByRef: 105
after ByRef, n = 105
```

`ByValue` genuinely modifies its own local copy (`105` printed inside it), but `n` in the caller is completely untouched (`5`, unchanged) — exactly the opposite of ALGOL's call-by-name, where a parameter is effectively a live alias for whatever expression was passed. `ByRef`'s `var` parameter, by contrast, modifies the caller's actual `n` directly (`105` afterward), with no textual-substitution subtlety involved at all — just a direct reference to the same storage.

> **Pitfall:** this is a real, easy trap for anyone who's just internalized ALGOL's call-by-name model — assuming a plain (non-`var`) Pascal parameter behaves like a live alias to the caller's variable, the way call-by-name effectively does for a simple variable argument, is exactly backwards. Pascal's default is the opposite: a private copy, changes never propagate back, unless `var` says otherwise.

**Practice**

- Write a `Swap(var a, b: integer)` procedure using two `var` parameters, and verify it genuinely swaps the caller's two variables.
- Predict, then verify, what happens if `Swap` is written with plain (non-`var`) parameters instead — does it still swap the caller's variables, or does nothing observable happen to them at all?

## The dangling-else problem, a third time

**You'll be able to:** state precisely how Pascal resolves the dangling-else ambiguity, and that it's not ALGOL 68's fix.

**Concept**

`algol/04-control-dangling-else.md` covers this exact ambiguity in ALGOL 60 (documented, since no compiler exists to verify it directly) and ALGOL 68's fix (verified: mandatory `FI` closing every `if`, removing the ambiguity structurally). Pascal has no equivalent mandatory closing keyword for `if` — verified directly, it resolves the identical ambiguity the same way C eventually would: `else` binds to the **nearest** unmatched `if`.

**Example**

```pascal
if a then
  if b then
    writeln('inner true branch')
  else
    writeln('else binds to inner if');
```

Verified, with `a := true` and `b := false`: `else binds to inner if` prints — the `else` attached to the *inner* `if b`, not the outer `if a`, exactly the "nearest unmatched `if`" convention, and exactly the ambiguity ALGOL 60 had and ALGOL 68 specifically re-engineered its syntax to avoid. Pascal, designed *after* ALGOL 68, deliberately did not adopt that fix — a real, verifiable design choice, not an oversight.

> **Pitfall:** three guides in this series now touch this exact ambiguity, and each resolves it differently enough to be worth keeping straight: ALGOL 60 has it and never fixed it (documented only, in `algol/`); ALGOL 68 restructured its syntax with mandatory `FI` specifically to remove it (verified in `algol/`); Pascal kept the ambiguity and resolved it purely by convention (verified here) — the same convention C would later adopt as well. Reading Pascal code translated loosely from an ALGOL 68 source (where nesting was unambiguous by construction) is exactly where this convention can silently change what a nested `if`/`else` actually means.

**Practice**

- Add explicit `begin`/`end` around the inner `if`'s branches (`if a then begin if b then ... end`) and confirm the ambiguity disappears entirely — the same general fix ALGOL 68's mandatory closing keywords provided, achieved here with ordinary block delimiters instead of dedicated syntax.

## Progress check

1. What's the one genuine behavioral difference between `while` and `repeat...until`, not just a stylistic one?
2. Why is `case` worth calling out specifically as a Pascal addition rather than an ALGOL-inherited feature?
3. What does a plain (non-`var`) Pascal parameter do to changes made inside a procedure, and how does that contrast directly with ALGOL's call-by-name?
4. What does Pascal's `else` bind to when a nested `if` has no explicit block delimiters, verified directly?
5. Name the three different ways this series has now seen the dangling-else ambiguity handled, across three guides.

### Answers

1. `while` checks its condition before each iteration, so it can run zero times; `repeat...until` checks after each iteration, so it always runs at least once — verified directly with an initial condition that made `while`'s body never run while the equivalent `repeat`'s body still ran exactly once.
2. Because ALGOL 60 has no multi-way branching statement at all — only `if`/`else` — so `case` is something Wirth genuinely added to Pascal, not a feature carried forward unchanged from the language Pascal is descended from.
3. A plain parameter is passed by value — the procedure receives its own private copy, and changes to it never propagate back to the caller's variable, verified directly (`n` stayed `5` after `ByValue` modified its own copy to `105`). This is close to the opposite of ALGOL's call-by-name, which effectively re-evaluates and re-binds the passed expression at every use inside the procedure, making changes to a simple variable argument visible to the caller.
4. The nearest unmatched `if` — verified directly, `else` attached to the inner `if b`, not the outer `if a`, in a nested if-without-braces example.
5. ALGOL 60: has the ambiguity, never fixed (documented only). ALGOL 68: fixed it structurally with mandatory `FI` closing every `if` (verified). Pascal: kept the identical ambiguity and resolves it purely by the "nearest unmatched `if`" convention (verified here) — the same convention C later adopted as well.
