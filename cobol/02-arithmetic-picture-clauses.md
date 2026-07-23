# Module 2 — Arithmetic & Fixed-Decimal Money

By the end of this module you'll be able to perform correctly-rounded fixed-decimal arithmetic, detect and handle overflow explicitly, and explain — with a verified, direct comparison — why COBOL's approach to money is a genuine design choice, not a historical accident. Feeds Capstone 1.

## `COMPUTE`, `ADD`, and `ROUNDED`

**You'll be able to:** perform arithmetic with `COMPUTE` and the individual arithmetic verbs, and produce correctly-rounded (not truncated) results.

**Concept**

`COMPUTE field = expression` evaluates a full arithmetic expression and stores the result, following ordinary operator precedence (`*`/`/` before `+`/`-`, parentheses to override). The individual verbs (`ADD`, `SUBTRACT`, `MULTIPLY`, `DIVIDE`) exist for single operations and read closer to English (`ADD WS-TAX TO WS-TOTAL`), but `COMPUTE` is what this guide uses throughout — it's the one that scales to real expressions.

By default, a result that doesn't fit the receiving field's decimal places is *truncated*, not rounded — `ROUNDED` is a separate, explicit keyword that changes this to standard rounding.

**Example**

```cobol
       IDENTIFICATION DIVISION.
       PROGRAM-ID. COMPUTEDEMO.
       DATA DIVISION.
       WORKING-STORAGE SECTION.
       01  WS-PRICE            PIC S9(5)V99 VALUE 19.99.
       01  WS-QTY              PIC 9(3)     VALUE 3.
       01  WS-TOTAL            PIC S9(7)V99.
       01  WS-SHARE            PIC S9(5)V99.
       PROCEDURE DIVISION.
           COMPUTE WS-TOTAL = WS-PRICE * WS-QTY.
           DISPLAY "Total: " WS-TOTAL.
           COMPUTE WS-SHARE ROUNDED = 10 / 3.
           DISPLAY "10/3 rounded to 2dp: " WS-SHARE.
           STOP RUN.
```

```
$ cobc -x -o compute compute.cbl && ./compute
Total: +0000059.97
10/3 rounded to 2dp: +00003.33
```

Verified directly: `19.99 * 3` lands exactly on `59.97` — no float representation error anywhere, because there's no float involved at all. `10 / 3 ROUNDED` gives `3.33`, the correctly-rounded two-decimal result, not `3.33333...` truncated.

> **Pitfall:** without `ROUNDED`, `COMPUTE WS-SHARE = 10 / 3` simply chops the extra digits — for a running balance, silent truncation on every transaction compounds into a real, measurable discrepancy over thousands of operations. `ROUNDED` isn't a cosmetic nicety here.

**Practice**

- Compute `7 / 2` into a `PIC 9V9` field twice — once with `ROUNDED`, once without — and confirm the actual difference in output.
- Add a 7.5% tax calculation to the total in `COMPUTEDEMO` (`COMPUTE WS-TAX ROUNDED = WS-TOTAL * 0.075`) and display it.

## `ON SIZE ERROR`: catching overflow deliberately

**You'll be able to:** detect and handle a result too large for its receiving field, and state precisely what happens if you don't.

**Concept**

A numeric field has a fixed, declared size — `COMPUTE`/`ADD`/etc. can produce a result too large to fit. `ON SIZE ERROR` is a clause you attach to the statement to catch this explicitly; `NOT ON SIZE ERROR` is its counterpart for the success path. Neither is automatic — omitting `ON SIZE ERROR` doesn't make overflow impossible, it just means nothing catches it.

**Example**

```cobol
       IDENTIFICATION DIVISION.
       PROGRAM-ID. SIZEERR.
       DATA DIVISION.
       WORKING-STORAGE SECTION.
       01  WS-SMALL            PIC 9(3) VALUE 0.
       PROCEDURE DIVISION.
           COMPUTE WS-SMALL = 999 + 1
               ON SIZE ERROR
                   DISPLAY "Overflow caught: value would not fit"
               NOT ON SIZE ERROR
                   DISPLAY "No overflow"
           END-COMPUTE.
           DISPLAY "WS-SMALL is now: " WS-SMALL.
           STOP RUN.
```

```
$ cobc -x -o sizeerror sizeerror.cbl && ./sizeerror
Overflow caught: value would not fit
WS-SMALL is now: 000
```

> **Pitfall, verified directly — the dangerous one:** without `ON SIZE ERROR`, an overflowing `COMPUTE` doesn't leave the field unchanged and it doesn't crash — it silently keeps only the low-order digits that fit, exactly like modular arithmetic. Tested directly: a `PIC 9(3)` field holding `500`, computed as `999 + 500` (`1499`) with no `ON SIZE ERROR` clause, ends up holding `499` — the leading `1` is simply gone, and the program keeps running with a completely wrong number that still *looks* plausible. For a money field, that's not a crash you'd notice; it's a silently corrupted balance. This is the single strongest argument for attaching `ON SIZE ERROR` to every arithmetic statement touching a bounded financial field, not an occasional defensive habit.

**Practice**

- Reproduce the `999 + 500` overflow above without `ON SIZE ERROR`, confirm you get `499`, then add the clause and confirm it's caught instead.
- Design a `PIC 9(2)` field and a computation that overflows it by exactly one digit — predict the truncated result before running it.

## `COMP` and `COMP-3`: storage, not just display

**You'll be able to:** declare a field with `COMP-3` (packed decimal) usage and explain why it exists alongside plain `DISPLAY` usage.

**Concept**

Every `WORKING-STORAGE` field so far has used the default `DISPLAY` usage — one byte of storage per digit, human-readable in memory. `COMP-3` (packed decimal) instead stores two digits per byte plus a half-byte sign nibble, roughly halving storage for the same digit count — a real consideration when a program holds large arrays of numeric records, or when a file format shared with another COBOL system expects packed fields. `COMP` (binary usage) exists too, storing the value as a native binary integer scaled by the picture's implied decimal point, used for fields needing fast arithmetic rather than compact storage.

**Example**

```cobol
       01  WS-DISPLAY-FIELD    PIC S9(7)V99 VALUE 12345.67.
       01  WS-COMP3-FIELD      PIC S9(7)V99 COMP-3 VALUE 12345.67.
```

```
$ cobc -x -o comp3 comp3.cbl && ./comp3
Display usage:  +0012345.67
Comp-3 usage:   +0012345.67
```

Both fields hold and display the identical logical value — `COMP-3` changes *how* the value is stored, not what arithmetic you can do with it or what it prints as. The choice between `DISPLAY` and `COMP-3` is a storage/interop decision, invisible at the `DISPLAY`/`COMPUTE` level.

> **Pitfall:** `COMP-3` fields can't be read or edited by eye in a raw file dump the way `DISPLAY` fields can — a genuinely relevant fact when debugging a file-based interchange with another system that expects one usage and gets the other.

**Practice**

- Declare a `COMP-3` field and a `DISPLAY` field with the same `PIC` clause, `COMPUTE` the same expression into each, and confirm the displayed results match.

## Why COBOL never uses a float for money

**You'll be able to:** state, with a direct, verified example, why fixed-decimal `PIC` arithmetic avoids a real class of bug that binary floating point has.

**Concept**

Binary floating point (`float`/`double` in most languages) represents most decimal fractions only approximately — `0.1` and `0.2` don't have exact binary representations, so their sum isn't exactly `0.3`. COBOL's `PIC` fields with `V` never touch binary floating point at all: the digits are stored and computed as decimal digits directly, so a value like `0.10` is stored as exactly the integer `10` scaled by an implied decimal point, with no approximation step anywhere.

**Example — the same computation, two languages, verified side by side:**

```bash
$ python3 -c "print(0.1 + 0.2)"
0.30000000000000004
```

```cobol
       01  WS-A   PIC S9V99 VALUE 0.10.
       01  WS-B   PIC S9V99 VALUE 0.20.
       01  WS-SUM PIC S9V99.
       ...
       COMPUTE WS-SUM = WS-A + WS-B.
       DISPLAY "0.10 + 0.20 = " WS-SUM.
```

```
$ cobc -x -o moneycompare moneycompare.cbl && ./moneycompare
0.10 + 0.20 = +0.30
```

This is a direct callback to `python/08-numpy-vectorization.md`'s own verified finding: NumPy's `int64` overflowing silently with zero warning is one class of "the numeric type quietly did something the value on paper didn't expect"; Python's binary-float `0.1 + 0.2` is a related but distinct class — an approximation error inherent to the representation, present in nearly every mainstream language's default numeric type (JavaScript, Ruby, and C's `double` all show the identical `0.30000000000000004`, since they all use the same IEEE 754 binary64 format). COBOL's `PIC`-with-`V` decimal fields were designed, from 1959, specifically for an audience (banking, insurance, payroll) where this exact error is unacceptable — not as a workaround discovered later, but as the language's original design center. This is *why* COBOL still runs so much of the world's core financial infrastructure: it was built by and for the domain where float's approximation is a real, not theoretical, defect.

> **Pitfall:** this doesn't mean COBOL arithmetic has no rounding at all — Module 2's own `ROUNDED` and `ON SIZE ERROR` sections showed two real, distinct ways a COBOL computation can still lose precision or overflow. The guarantee is narrower and more specific: decimal fractions that are exact in base 10 (like `0.10`) stay exact through storage and arithmetic, which binary float cannot promise.

**Practice**

- Verify the `0.1 + 0.2` discrepancy yourself in a language of your choice other than Python (`node -e "console.log(0.1+0.2)"` if you have Node, or `irb` for Ruby) and confirm it matches.
- Find a decimal value that *isn't* exact even in COBOL's fixed-decimal representation — hint: think about what `V` actually stores versus a truly irrational or repeating value like `1/3`.

## Progress check

1. What's the default behavior of `COMPUTE` when a result has more decimal places than the receiving field — truncation or rounding?
2. What does `ROUNDED` change, exactly?
3. What happens, verified directly, to a `PIC 9(3)` field holding `500` after `COMPUTE ... = 999 + 500` with no `ON SIZE ERROR` clause?
4. What does `COMP-3` change about a field, and what does it *not* change?
5. Why does `0.1 + 0.2` not equal exactly `0.3` in Python, JavaScript, Ruby, or C's `double`, but does equal exactly `0.30` in a COBOL `PIC S9V99` field?

### Answers

1. Truncation — the extra digits are simply dropped, not rounded, unless `ROUNDED` is explicitly given.
2. It changes truncation to standard rounding for the statement it's attached to — without it, results are always truncated toward zero.
3. Verified directly: it becomes `499` — `999 + 500 = 1499`, and with no `ON SIZE ERROR` clause the field silently keeps only the low-order 3 digits that fit, losing the leading `1` with no error or crash.
4. `COMP-3` changes how the field is physically stored (packed decimal, two digits per byte plus a sign nibble, roughly half the storage of `DISPLAY` usage) — it does not change the value's precision, the arithmetic available on it, or how it displays.
5. Because those languages' default numeric types (`float`/`double`) use IEEE 754 binary floating point, which cannot represent most decimal fractions — including `0.1` and `0.2` — exactly in binary; COBOL's `PIC`-with-`V` fields store and compute decimal digits directly with no binary approximation step, so an exact decimal value like `0.10` stays exact through arithmetic.
