# Module 7 — Capstone 3: A DCG Arithmetic Expression Parser and Evaluator

**Proves:** difference lists, `-->` grammar rules, `phrase/2` (Module 6).

An arithmetic expression parser — the kind of thing every other guide in this series that needed one wrote as a hand-built recursive-descent function — built instead as a direct DCG transcription of the standard expression grammar, complete with correct operator precedence, left-associativity, and parentheses. This is the one guide in the series where the grammar *is* executable, not just a design document translated into code by hand. Every result below is a real `swipl` run.

## The grammar

```prolog
expr(V) --> term(T), expr_rest(T, V).
expr_rest(Acc, V) --> [+], term(T), { Acc1 is Acc + T }, expr_rest(Acc1, V).
expr_rest(Acc, V) --> [-], term(T), { Acc1 is Acc - T }, expr_rest(Acc1, V).
expr_rest(V, V) --> [].

term(V) --> factor(F), term_rest(F, V).
term_rest(Acc, V) --> [*], factor(F), { Acc1 is Acc * F }, term_rest(Acc1, V).
term_rest(Acc, V) --> [/], factor(F), { Acc1 is Acc / F }, term_rest(Acc1, V).
term_rest(V, V) --> [].

factor(N) --> [N], { number(N) }.
factor(V) --> ['('], expr(V), [')'].
```

This is the textbook expression grammar — `expr` is a sum of `term`s, `term` is a product of `factor`s, `factor` is either a number or a fully-parenthesized sub-expression — with one addition beyond bare recognition: each `{ Acc1 is ... }` computes the running value as parsing proceeds, so parsing and evaluation happen in the same pass, in one grammar, with no separate AST-building step. The precedence between `+`/`-` and `*`/`/` isn't a special case handled separately (the way an operator-precedence table would be in a hand-rolled parser) — it falls directly out of which nonterminal calls which: `expr` only ever calls `term` for its operands, so a `*` inside a `term` is always fully resolved before an enclosing `+` in `expr` ever sees the result.

Input is a pre-tokenized list — `[2, +, 3, *, 4]`, not the string `"2+3*4"` — a deliberate scope line matching Module 6's methodology note: turning raw text into a token list is a separate, smaller problem (splitting on whitespace/digits/operators) this capstone doesn't need to solve to demonstrate what's actually new about DCGs.

## Verified runs

```
?- phrase(expr(V), [2, +, 3, *, 4]).
V = 14.

?- phrase(expr(V), ['(', 2, +, 3, ')', *, 4]).
V = 20.

?- phrase(expr(V), [10, -, 2, -, 3]).
V = 5.

?- phrase(expr(V), [20, /, 4, /, 5]).
V = 1.

?- phrase(expr(V), [2, +]).
false.
```

Every result checks out against what the grammar should compute: `2 + 3 * 4 = 14` (multiplication binds tighter, exactly as `term`-before-`expr` structures it, not `20` a naively left-to-right evaluator would produce); `(2 + 3) * 4 = 20` (parentheses correctly override precedence via `factor`'s second clause); `10 - 2 - 3 = 5`, not `11` — confirming `expr_rest` is genuinely **left**-associative (each subtraction applies to the running accumulator, not to some right-nested pairing); `20 / 4 / 5 = 1`, same left-associativity for division; and an incomplete expression (`2, +` with nothing after the operator) correctly fails to parse rather than silently accepting a partial match.

> **Pitfall:** `expr_rest` and `term_rest` are the specific structural trick that makes this grammar left-associative instead of right-associative — a more "obvious" first attempt, `expr(V) --> term(T), [+], expr(V2), { V is T + V2 }.` (recursing directly on `expr` after the operator, rather than threading an accumulator through a separate `_rest` rule), parses `10 - 2 - 3` as `10 - (2 - 3)`, giving `11`, not `5`. This is a real, easy mistake to make transcribing a grammar naively — the *shape* of a naive left-recursive-looking rule doesn't automatically produce left-associative *evaluation* unless the accumulator is threaded explicitly the way `expr_rest`/`term_rest` do it.

## Practice

- Add a `^` (exponentiation) operator with *higher* precedence than `*`/`/`, by introducing a `power(V) --> factor(F), power_rest(F, V).` layer between `term` and `factor`, and confirm `phrase(expr(V), [2, +, 3, ^, 2])` correctly evaluates to `11`, not `25`.
- Confirm, by tracing through the grammar by hand first, why `phrase(expr(V), [2, *, '(', 3, +, 4, ')'])` correctly evaluates to `14` — which specific `factor` clause handles the parenthesized sub-expression, and what does it call recursively to evaluate the inside?
- Write a minimal tokenizer — a DCG or a plain predicate — that turns a flat list of character codes into this capstone's token list (numbers as multi-digit integers, `+`/`-`/`*`/`/`/`(`/`)` as atoms), closing the gap this module deliberately left open.
