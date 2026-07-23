# Module 6 — Difference Lists and DCGs

Every prior guide in this series that needed a parser wrote one by hand — a recursive-descent function reading tokens off a string or a stream. Prolog has a built-in notation, Definite Clause Grammars, that translates a grammar written in something close to plain BNF directly into a working parser, automatically. This module builds the mechanism first (difference lists, then the `-->` translation itself); Module 7's capstone puts it to work on a real arithmetic-expression grammar. Every example verified via `swipl`. Feeds Capstone 3.

## Difference lists: O(1) concatenation via unification

**You'll be able to:** explain why threading a "remainder" list through a chain of predicates avoids the cost of repeated `append/3` calls, and demonstrate it directly.

**Concept**

Module 2's `append/3` walks the entire first list to concatenate two lists — fine occasionally, expensive if a parser needs to glue list fragments together at every single grammar rule it matches, which is exactly what parsing does. A **difference list** represents a list as a pair `Full-Remainder`, where `Full` is an *open* list (its own tail is an unbound variable) and `Remainder` is that same unbound tail. Concatenating two difference lists is then just unifying the first list's open tail with the second list's front — no walking, no copying:

```prolog
append_dl(A-B, B-C, A-C).
```

**Example**

```prolog
?- A = [1,2,3|X]-X, B = [4,5|Y]-Y, append_dl(A, B, Full-End).
Full = [1, 2, 3, 4, 5|_G1], End = _G1.

?- A = [1,2,3|X]-X, B = [4,5|Y]-Y, append_dl(A, B, Full-End), End = [].
Full = [1, 2, 3, 4, 5].
```

Verified: `append_dl/3` unifies `A`'s open tail (`B`, the *front* of the second difference list) directly against the second pair's own front — the two argument positions in `append_dl(A-B, B-C, A-C)` share the variable `B` on purpose, which is what makes the "gluing" happen via unification rather than any traversal at all. `Full` only becomes a genuinely closed, ordinary list once its open tail is unified with `[]` (shown in the second query) — until then, it's a list with a hole in it, ready to have more appended for free.

> **Pitfall:** a difference list's "front" and "back" variables only mean anything together, as a pair — passing just the front half of a difference list to code expecting an ordinary closed list produces a list that looks fine when printed (SWI shows the unbound tail as `_G1` or similar) but isn't actually `[]`-terminated, and predicates that check for the empty list explicitly (`Xs == []`) will not treat it as empty even once every real element is accounted for.

**Practice**

- Predict, then verify, what `Full-End` looks like immediately after the first query above (before `End = []`) — specifically, what is `End` bound to, and how does that relate to `Full`'s printed tail?
- Explain why `append_dl/3`, unlike Module 2's `append/3`, does no work proportional to the length of either input list.

## DCGs: grammar rules that compile into difference-list code

**You'll be able to:** write a `-->` grammar rule, understand exactly what it compiles into, and run it with `phrase/2`.

**Concept**

A DCG rule, written `Head --> Body`, is translated automatically — at load time — into an ordinary Prolog clause with two extra arguments threaded through every nonterminal: an input list and a remainder list, exactly the difference-list pattern above. You never write the extra arguments yourself; you write the grammar, and Prolog generates the difference-list-passing code.

```prolog
sentence --> noun_phrase, verb_phrase.
noun_phrase --> [the], noun.
noun --> [cat].
noun --> [dog].
verb_phrase --> verb, noun_phrase.
verb --> [chased].
```

`[the]` is a **terminal** — literally matches that element in the input list. `noun_phrase`, `verb`, and so on are **nonterminals** — other grammar rules, chained together automatically.

**Example — what this actually compiles to**, verified directly via `listing/1`:

```
?- listing(noun_phrase/2).
noun_phrase([the|A], B) :-
    noun(A, B).

?- listing(sentence/2).
sentence(A, B) :-
    noun_phrase(A, C),
    verb_phrase(C, B).
```

This is the difference-list pattern from the previous session, generated for you: `sentence(A, B)` takes an input list `A` and a remainder `B`; it calls `noun_phrase(A, C)` (consume some of `A`, leave `C` as what's left), then `verb_phrase(C, B)` (consume some of `C`, leave `B` as what's left over after the whole sentence). Chaining nonterminals is chaining difference lists, exactly as `append_dl/3` did, generated automatically by the `-->` translation instead of written by hand.

`phrase/2` runs a DCG rule against a concrete list, handling the "what's the remainder" bookkeeping for you (it's really `phrase(Rule, List, [])` — call the rule with `List` as input and `[]` as the required, fully-consumed remainder):

```prolog
?- phrase(sentence, [the,cat,chased,the,dog]).
true.

?- phrase(sentence, [the,cat,the,dog]).
false.
```

Verified: the five-token sentence parses; a four-token one (missing a verb) correctly fails. And because a DCG rule is still an ordinary Prolog relation underneath, it runs generatively too, not just as a checker — with the input list left unbound and its length constrained (Module 4's between-first lesson, again):

```prolog
?- findall(S, (length(S,5), phrase(sentence, S)), L).
L = [[the,cat,chased,the,cat], [the,cat,chased,the,dog],
     [the,dog,chased,the,cat], [the,dog,chased,the,dog]].
```

Verified: all four grammatically valid five-token sentences this tiny grammar can produce — two choices for the first noun, two for the second, one fixed verb. This grammar only ever accepts exactly five-token sentences (two-word noun phrase, one-word verb, two-word noun phrase); querying `length(S,4)` against it, verified separately, correctly returns no solutions at all — there's no missing feature to debug, the grammar as written simply has no four-token sentence in its language.

**DCGs recurse exactly like ordinary rules**, since under the hood, that's precisely what they are:

```prolog
as --> [a], as.
as --> [a].
```

Verified: `phrase(as, [a,a,a])` succeeds, `phrase(as, [a,b,a])` fails (the `b` doesn't match the terminal `[a]` at that position), and generating every match up to length 3 (`between(1,3,N), length(S,N), phrase(as,S)`) correctly returns `[[a],[a,a],[a,a,a]]`.

> **Pitfall:** a DCG rule with `{ Goal }` (curly braces) around ordinary Prolog code — not shown above, needed the moment a rule needs to do something beyond matching terminals and calling other rules, such as checking a character's type — is *not* threaded through the difference-list arguments; it runs as plain Prolog against whatever's already bound. Forgetting the braces around a plain Prolog goal inside a DCG body makes Prolog try to interpret it *as if it were itself a grammar rule*, which for most ordinary predicates fails immediately with a confusing error rather than doing what was intended.

**Practice**

- Add a third noun (`noun --> [bird].`) and re-run the five-token generative query — predict the new count before checking (hint: it's not simply "one more than before").
- Write a DCG rule `noun_phrase --> [the], adjective, noun.` with `adjective --> [big]. adjective --> [small].`, extend `sentence` to allow it, and verify `phrase(sentence, [the,big,cat,chased,the,small,dog])` succeeds.

## Progress check

1. What makes a difference list's concatenation O(1) instead of proportional to list length, the way `append/3` is?
2. What are the two extra arguments every DCG nonterminal actually compiles down to, and what do they represent?
3. Why does `phrase(sentence, [the,cat,the,dog])` fail against this module's sentence grammar?
4. Why did querying for 4-token sentences against the sentence grammar correctly return zero results rather than indicating a bug?
5. What does `{ Goal }` mean inside a DCG rule body, and why does forgetting the braces around ordinary Prolog code cause a problem?
6. In what sense is a DCG rule "still an ordinary Prolog relation underneath" — what concrete behavior from earlier in this guide does that let it inherit for free?

### Answers

1. Because concatenation is just unifying the first difference list's open tail with the second difference list's front — a single unification, not a traversal that copies or walks every element of either list.
2. An input list and a remainder (or "what's left") list — the same difference-list pair from the previous session, generated automatically by the `-->` translation and threaded through every nonterminal call in the rule's body.
3. The grammar requires a verb between the two noun phrases (`sentence --> noun_phrase, verb_phrase.`, and `verb_phrase` starts with a verb); `[the,cat,the,dog]` has no verb token at all, so no sequence of grammar rules can consume it completely.
4. Because the grammar as written only ever accepts sentences of exactly five tokens (a two-word noun phrase, a one-word verb, a two-word noun phrase) — there is no valid four-token sentence in the language this grammar defines, so an empty result is the grammar working correctly, not evidence of an error.
5. `{ Goal }` marks ordinary Prolog code that should run as-is, without being translated into the difference-list-threading DCG mechanism. Omitting the braces makes Prolog try to interpret that code as if it were itself a grammar rule (matching terminals/nonterminals), which for ordinary Prolog goals usually fails or errors rather than executing normally.
6. Because a DCG rule compiles into an ordinary Prolog clause, it inherits backtracking and relational (any-argument-can-be-the-unknown) behavior for free — the same property that let `phrase(sentence, S)` with `S` unbound *generate* valid sentences instead of only checking a given one, exactly like `append(X, Y, [1,2,3])` generating splits in Module 2.
