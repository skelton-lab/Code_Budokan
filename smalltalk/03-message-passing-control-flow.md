# Module 3 — Message Passing as the Only Mechanism

The most radical idea in this whole series: Smalltalk has no built-in `if`, no built-in `while` loop, no special control-flow syntax at all. `ifTrue:ifFalse:` is an ordinary keyword message sent to an ordinary Boolean object. Verified, directly.

## Conditionals are message sends

**You'll be able to:** demonstrate, not just state, that `ifTrue:ifFalse:` is a message send to a real object.

**Concept**

`(x > 3) ifTrue: [...] ifFalse: [...]` is not special `if` syntax parsed differently from everything else — `x > 3` evaluates to a real object (an instance of class `True` or class `False`), and `ifTrue:ifFalse:` is an ordinary keyword message sent to *that object*, with two blocks (Module 4) as its arguments. `True`'s implementation of `ifTrue:ifFalse:` runs the first block; `False`'s implementation runs the second. There is no other mechanism involved.

**Example**

```smalltalk
| x |
x := 5.
(x > 3)
    ifTrue: [ Transcript showCr: 'big' ]
    ifFalse: [ Transcript showCr: 'small' ].

Transcript showCr: (true class) name.
Transcript showCr: ((x > 3) class) name.
```

Verified: prints `big`, then `True`, then `True` — confirming both that the conditional works as expected, and — the actual point — that `x > 3` really is an instance of a real class (`True`), the same class `true` itself belongs to, with no special-cased boolean type distinct from ordinary objects.

> **This is worth sitting with directly, since it's genuinely unlike everything else in this series:** every other language you've studied has `if`/`else` as dedicated syntax, parsed specially by the language's grammar. Smalltalk's grammar has no concept of "conditional statement" at all — it has messages, sent to objects, and `True`/`False` simply happen to be two classes whose method implementations create the *effect* of conditional branching. The "keyword" in `ifTrue:ifFalse:` isn't a language keyword in the way `if`/`then`/`else` are elsewhere — it's an ordinary message selector, exactly like `at:put:` from Module 1.

**Practice**

- Look up (or reason through) how you'd implement your own two-way branch using only message sends, without `ifTrue:ifFalse:` — sketch a minimal `MyBoolean`-style class hierarchy with `myTrue`/`myFalse` subclasses each implementing a `branch:or:` method differently.

## Loops are message sends too

**You'll be able to:** demonstrate that `whileTrue:` and `timesRepeat:` are message sends, exactly like conditionals.

**Concept**

`[condition] whileTrue: [body]` sends the `whileTrue:` message to a block (Module 4) — the receiver block is evaluated repeatedly, checked for truth, and the body block is evaluated each time it's true. `n timesRepeat: [body]` sends `timesRepeat:` to an integer. Same underlying mechanism as conditionals: no special loop syntax, just messages sent to objects that happen to implement looping behavior.

**Example**

```smalltalk
| i |
i := 1.
[ i <= 5 ] whileTrue: [
    Transcript show: i printString; show: ' '.
    i := i + 1
].
Transcript nl.

3 timesRepeat: [ Transcript show: 'x' ].
```

Verified: prints `1 2 3 4 5 ` then `xxx` — both loops run correctly, purely through message sends (`whileTrue:` to a block, `timesRepeat:` to an integer), with no dedicated loop syntax involved at any point.

**Practice**

- Write a loop counting down from 10 to 1 using `whileTrue:`.
- Confirm `timesRepeat:` really is sent to the integer `3` and not some other implicit receiver, by trying `(1 + 2) timesRepeat: [...]` and confirming it still runs three times.

## Progress check

1. Is `ifTrue:ifFalse:` special syntax, or an ordinary message send? What's the direct evidence?
2. What are `x > 3`'s actual class, when `x` is `5`?
3. What receives the `whileTrue:` message, and what receives `timesRepeat:`?
4. Why is this module's central claim described as more radical than anything else in this series?

### Answers

1. An ordinary keyword message send — the direct evidence is that `x > 3` genuinely is an instance of class `True` (confirmed by sending it `class name`), and `ifTrue:ifFalse:` is a message sent to that real object, dispatched to whichever of `True`'s or `False`'s own method implementation applies.
2. `True` — the same class the literal `true` itself belongs to.
3. A block (`[condition]`) receives `whileTrue:`; an integer (`3`) receives `timesRepeat:`.
4. Because every other language in this series has dedicated conditional/loop syntax, parsed specially by the grammar — Smalltalk has no such special-casing at all; control flow is entirely an emergent effect of ordinary message dispatch to ordinary objects, with no separate mechanism underneath it.
