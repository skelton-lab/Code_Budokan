# Module 1 — Foundations

Everything really, truly is an object — more radically than Ruby's own version of that claim — and Smalltalk's three message forms, which are the entire syntax of the language. Feeds everything downstream.

## Everything is an object, more radically than Ruby

**You'll be able to:** confirm, directly, that Smalltalk's core values (`true`, `nil`) are real object instances, and connect this back to Ruby's own version of the same claim.

**Concept**

Ruby's guide opened with "everything is an object" — `5.class` reporting `Integer`, `nil.class` reporting `NilClass`. Smalltalk is where that idea actually originates, and it goes further: there is no syntax in Smalltalk that *isn't* ultimately a message sent to an object — not just values, but control flow itself (Module 3).

**Example**

```smalltalk
Transcript showCr: 5 class name.
Transcript showCr: true class name.
Transcript showCr: nil class name.
Transcript showCr: 'hello' class name.
```

Verified: `SmallInteger`, `True`, `UndefinedObject`, `String` — every one of these is a real class name, obtained by sending the `class` message to the value and then the `name` message to the resulting class object. `true` is a singleton instance of class `True`; `nil` is the singleton instance of class `UndefinedObject`. Even `class` itself is a message send, not special syntax.

**Practice**

- Send `class` to a few more values (an array literal, a block) and confirm each reports a real class name.

## The three message forms

**You'll be able to:** identify unary, binary, and keyword messages on sight, and know their precedence order.

**Concept**

Every operation in Smalltalk is a **message send**: `receiver message`. There are exactly three forms:

- **Unary** — no arguments, just a word: `5 factorial`. Highest precedence.
- **Binary** — a symbolic operator with one argument: `3 + 4`. Middle precedence.
- **Keyword** — one or more `keyword: argument` pairs, forming the message's full name: `array at: 1 put: 10` (the message name is literally `at:put:`, taking two arguments). Lowest precedence.

**Example**

```smalltalk
Transcript showCr: 5 factorial printString.
Transcript showCr: (3 + 4) printString.

| arr |
arr := Array new: 3.
arr at: 1 put: 10.
arr at: 2 put: 20.
arr at: 3 put: 30.
Transcript showCr: arr printString.
```

Verified: `5 factorial` correctly computes `120` (a unary message sent to `5`); `3 + 4` correctly computes `7` (a binary message); `arr at: 1 put: 10` correctly stores `10` at index `1` (a keyword message, `at:put:`, taking two arguments); the finished array prints as `(10 20 30 )`.

> **Pitfall:** precedence goes unary → binary → keyword, left to right within each level — `5 factorial printString` parses as `(5 factorial) printString` (unary messages chain left to right), and `Transcript showCr: 5 factorial printString` parses as one keyword message, `showCr:`, whose argument is the entire `5 factorial printString` unary chain. Getting this precedence backward is one of the most common first mistakes — parenthesize explicitly whenever you're not sure, exactly as `(3 + 4) printString` does above (without the parens, `3 + 4 printString` would send `printString` to `4` first, then try to add `3` to the resulting string).

**Practice**

- Predict, then verify, what `2 + 3 factorial` evaluates to — factorial (unary) binds tighter than `+` (binary), so this is `2 + (3 factorial)`, not `(2 + 3) factorial`.
- Chain a cascade — `Transcript show: 'a'; show: 'b'; showCr: 'c'.` — and confirm all three messages are sent to the same `Transcript` receiver, printing `abc`.

## A real bug, found while verifying this guide

**You'll be able to:** avoid a genuine crash in this specific toolchain, and know the workaround.

**Concept, verified directly:**

```smalltalk
3.14159 printNl.
```

This raises `ZeroDivide`, from inside the Float-printing algorithm itself (`FloatD(Float)>>printOn:special:`) — not a mistake in the code above, a real bug in this specific `gst` 3.2.5 build. Confirmed with the simplest possible case (a bare float literal) through `printNl`, `printString`, and `displayString` alike — all three fail identically.

**The workaround, verified:**

```smalltalk
Transcript showCr: (3.14159 * 4) rounded printString.
```

`rounded` (or `truncated`) converts the `Float` to an `Integer` first, which prints without issue. This guide uses this workaround consistently everywhere a computed value might be a `Float`.

> **This is exactly the kind of finding this whole series' verification discipline exists to catch** — a plausible-looking, textbook-standard line of code (`aFloat printString`) that simply doesn't work on this specific, real toolchain. Worth testing directly on whatever Smalltalk implementation you actually use, since this may be specific to this exact `gst` version rather than a general Smalltalk-the-language issue.

**Practice**

- Reproduce the bug yourself with the simplest possible case, then confirm the `rounded`/`truncated` workaround fixes it.

## Progress check

1. What are the three message forms in Smalltalk, and what's their precedence order?
2. What does `array at: 1 put: 10` mean as a single message send — what's the message's actual name?
3. Why does `2 + 3 factorial` evaluate to a large number, not `120` (which `(2+3) factorial` would be)?
4. What's the workaround this guide uses for the discovered Float-printing bug?
5. How does this module's "everything is an object" claim go further than Ruby's own version of the same claim?

### Answers

1. Unary (no arguments, e.g. `factorial`), binary (a symbolic operator with one argument, e.g. `+`), keyword (one or more `keyword:` parts forming the full message name, e.g. `at:put:`) — in that precedence order, unary highest, keyword lowest.
2. `at:put:` — a single keyword message with two arguments (`1` and `10`), not two separate operations.
3. Unary messages (`factorial`) bind tighter than binary messages (`+`), so it parses as `2 + (3 factorial)` = `2 + 6` = `8`, not `(2 + 3) factorial`.
4. Call `rounded` or `truncated` on the float first, converting it to an `Integer`, which prints without triggering the bug.
5. Ruby's claim covers values (numbers, `nil`, booleans all being real objects). Smalltalk's version extends to control flow itself — even `ifTrue:ifFalse:` and loops are ordinary message sends, not special built-in syntax, which Module 3 demonstrates directly.
