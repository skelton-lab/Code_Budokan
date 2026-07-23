# Module 6 — Sets

A built-in `set` type, with real set-algebra operators baked directly into the language's syntax — genuinely distinctive among mainstream languages, and something none of this series' guides so far (including ALGOL) have had a direct equivalent for. Every example below is a real, verified `fpc` compile-and-run. Feeds Capstone 3.

## Declaring and constructing sets

**You'll be able to:** declare a `set of` some ordinal type, and construct a set literal.

**Concept**

`set of T` (for an ordinal type `T` — an enumerated type, a subrange, `char`, or small integer ranges) declares a type whose values are *subsets* of `T`'s possible values. `[a, b, c]` constructs a set literal directly.

**Example**

```pascal
type
  DaySet = set of (Mon, Tue, Wed, Thu, Fri, Sat, Sun);
var
  weekdays: DaySet;
begin
  weekdays := [Mon, Tue, Wed, Thu, Fri];
end.
```

This declares `weekdays` as a set that can hold any combination of the seven day values — including all of them, none of them, or any subset in between, all as a single value of type `DaySet`.

**Practice**

- Declare `empty: DaySet := [];` and confirm an empty set literal compiles and assigns correctly — `[]` is the empty set for any set type.

## Set operators: union, intersection, difference, membership

**You'll be able to:** use `+`, `*`, `-`, and `in` for real set-algebra operations.

**Concept**

Pascal overloads `+` (union), `*` (intersection), and `-` (difference) specifically for set types — the same operator symbols as arithmetic, doing genuinely different operations depending on the operand types. `in` tests membership.

**Example**

```pascal
weekdays := [Mon, Tue, Wed, Thu, Fri];
weekend := [Sat, Sun];

all := weekdays + weekend;
writeln('Mon in all: ', Mon in all);
writeln('Sat in all: ', Sat in all);

if (weekdays * weekend) = [] then
  writeln('weekdays and weekend share nothing');

if (all - weekend) = weekdays then
  writeln('yes, matches');
```

Verified output:

```
Mon in all: TRUE
Sat in all: TRUE
weekdays and weekend share nothing
yes, matches
```

`weekdays + weekend` (union) correctly contains every day from both sets — both `Mon` and `Sat` test `TRUE` for membership in `all`. `weekdays * weekend` (intersection) is genuinely empty, verified by comparing it directly against the empty-set literal `[]` — `weekdays` and `weekend` share no days by construction. `all - weekend` (difference — every element of `all` except those also in `weekend`) is verified equal to `weekdays` exactly, confirming set equality (`=`) compares contents, not identity.

> **Pitfall:** `+`, `*`, and `-` mean completely different things depending on the surrounding types — the identical `+` symbol is arithmetic addition between two integers and set union between two `DaySet` values, decided entirely by Pascal's type system at compile time, not by any runtime check. Code that mixes up a set variable with a similarly-named ordinary variable of the element type would get a compile-time type error, not a silently wrong arithmetic result — but reading `all - weekend` cold, without knowing both are set-typed, could easily be misread as arithmetic subtraction rather than set difference.

**Practice**

- Predict, then verify, what `weekdays + weekdays` (union of a set with itself) equals — does a set have any notion of "counting" a value twice?
- Write a `WeekdayCount` calculation using `set of 1..31` (days of a month) representing which days a particular event occurred, and use set union to combine two months' worth of "event happened" sets — does this pattern generalize past the `Weekday` example directly?

## Progress check

1. What kind of types can `set of` be built from, in general terms?
2. What does the identical `+` operator mean for two `integer` operands versus two `set`-typed operands?
3. How was `weekdays * weekend` verified to be empty, specifically?
4. What does `in` test, and what type is on its left-hand side versus its right-hand side?
5. Why is a set's `=` comparing something different from an array's or a record's default comparison behavior might suggest?

### Answers

1. Ordinal types — enumerated types, subranges, `char`, and small integer ranges — anything with a well-defined, countable sequence of distinct values.
2. Arithmetic addition for `integer` operands; set union for `set`-typed operands — the same symbol, decided by the operand types at compile time, not a runtime distinction.
3. By comparing it directly against the empty-set literal (`(weekdays * weekend) = []`), which correctly evaluated to true, confirming no day appears in both `weekdays` and `weekend`.
4. `in` tests whether a single element (on the left) is a member of a set (on the right) — verified directly with `Mon in all` and `Sat in all`, both correctly reporting `TRUE`.
5. Set equality compares *contents* — two sets are equal if they contain exactly the same elements, regardless of any notion of order or how they were constructed — verified directly with `(all - weekend) = weekdays`, two sets built through entirely different operations still comparing equal because their actual contents matched.
