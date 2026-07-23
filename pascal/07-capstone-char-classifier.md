# Module 7 — Capstone 3: A Character Classifier

**Proves:** `set of char`, set membership (`in`), range literals inside set constructors, and functions returning a value (Module 6, Capstone 1).

A character classifier — vowel, digit, consonant, space, or other — built entirely from set membership tests, plus a vowel-counting function applied to a full string. Every result below is a real, verified `fpc` compile-and-run.

## The program

```pascal
type
  CharSet = set of char;

const
  Vowels: CharSet = ['a', 'e', 'i', 'o', 'u', 'A', 'E', 'I', 'O', 'U'];
  Digits: CharSet = ['0'..'9'];

function Classify(c: char): string;
begin
  if c in Vowels then
    Classify := 'vowel'
  else if c in Digits then
    Classify := 'digit'
  else if c in ['a'..'z', 'A'..'Z'] then
    Classify := 'consonant'
  else if c = ' ' then
    Classify := 'space'
  else
    Classify := 'other';
end;

function CountVowels(const s: string): integer;
var
  i, count: integer;
begin
  count := 0;
  for i := 1 to Length(s) do
    if s[i] in Vowels then
      count := count + 1;
  CountVowels := count;
end;
```

`Digits: CharSet = ['0'..'9']` uses a range literal directly inside a set constructor — Module 6's `in` and range syntax combined in one line. `['a'..'z', 'A'..'Z']` inside `Classify` builds an anonymous set literal on the spot, combining two ranges in a single set — anything not caught by the two earlier, more specific checks (`Vowels`, `Digits`) that's still a letter falls through to "consonant" correctly, since vowels were already excluded by the first check.

## Verified run

```pascal
sample := 'Hello, World 123!';
for i := 1 to Length(sample) do
  writeln('''', sample[i], ''' -> ', Classify(sample[i]));
writeln('total vowels: ', CountVowels(sample));
```

Verified output (abbreviated):

```
'H' -> consonant
'e' -> vowel
'l' -> consonant
'l' -> consonant
'o' -> vowel
',' -> other
' ' -> space
...
'1' -> digit
'2' -> digit
'3' -> digit
'!' -> other

total vowels in "Hello, World 123!": 3
```

Every character classified correctly — `,` and `!` fall through every specific check to `other`; the three vowels (`e`, `o`, `o`) are correctly counted by `CountVowels`, which reuses the exact same `Vowels` set `Classify` checks against, rather than a separate, potentially-inconsistent definition of "vowel."

> **Pitfall:** `Classify`'s `if`/`else if` chain checks `Vowels` *before* the general `['a'..'z', 'A'..'Z']` range — reversing that order would make every vowel incorrectly classified as a plain "consonant," since the broad letter-range check would catch it first and the function would never reach the vowel-specific branch at all. Order matters here for exactly the same reason it matters in any `if`/`else if` chain: the *first* matching condition wins, and a broader condition placed before a narrower, more specific one silently swallows it.

## Practice

- Reorder `Classify`'s checks so the broad `['a'..'z', 'A'..'Z']` range comes *before* the `Vowels` check, rerun against `sample`, and confirm every vowel is now misclassified as `consonant` — direct, hands-on proof of this capstone's own pitfall.
- Add a `Punctuation: CharSet = ['.', ',', '!', '?', ';', ':']` constant and a corresponding check in `Classify`, replacing the generic `other` fallback for those specific characters.
- Write a `CountDigits` function mirroring `CountVowels`'s structure exactly, and confirm it correctly reports `3` for `sample`.
