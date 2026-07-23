# Final Assessment

Across all seven modules. Try each on paper first.

1. What are the three Smalltalk message forms, and their precedence order?
2. What does `array at: 1 put: 10` mean as a single message, and what's its actual message name?
3. What real bug did this guide discover in its own toolchain, and what's the workaround?
4. Is `ifTrue:ifFalse:` special syntax or a message send — what's the direct, verified evidence either way?
5. What class does `x > 3` belong to, when `x` is `5`?
6. What does a Smalltalk block close over, and how is that demonstrated by the `makeAdder`/`add5` example?
7. What are Smalltalk's names for `map`, `filter`, and `reduce`?
8. What real naming collision did Module 5's shapes example hit, and what does it reveal about Smalltalk's image-based environment?
9. Is Ruby's duck typing an approximation of Smalltalk's model, or a direct descendant of it?
10. Confirmed directly in this guide: is `3 + 4` built-in arithmetic or a real message send? What's the evidence?
11. Why does C++ end up structurally closer to Simula's model than to Smalltalk's, given what both guides established?

## Answers

1. Unary (no arguments, e.g. `factorial`), binary (a symbolic operator with one argument, e.g. `+`), keyword (one or more `keyword:` parts, e.g. `at:put:`) — unary highest precedence, then binary, then keyword lowest.
2. `at:put:` — a single keyword message taking two arguments, not two separate operations.
3. Calling `printString`, `displayString`, or `printNl` directly on any `Float` raises `ZeroDivide` from inside this specific `gst` build's float-printing algorithm. The workaround: call `rounded` or `truncated` first, converting to an `Integer` before printing.
4. A message send — verified directly by confirming `x > 3` is a real instance of class `True`, and `ifTrue:ifFalse:` is an ordinary keyword message dispatched to that object, resolved by `True`'s or `False`'s own method implementation.
5. `True` — the same class the literal `true` itself belongs to.
6. The variables from its creating scope — demonstrated by `add5` (created via `makeAdder value: 5`) correctly retaining its own captured `n = 5` independently, producing `15` and `25` for `add5 value: 10` and `add5 value: 20` respectively.
7. `collect:` (map), `select:` (filter), `inject:into:` (reduce).
8. Redefining a class named `Rectangle` collided with a class already built into the Smalltalk base image, producing a wall of confusing internal errors. It reveals that Smalltalk's environment is image-based — classes already exist in a loaded environment, unlike this series' other, file-based languages — so checking for pre-existing name collisions is a real, live concern here specifically.
9. A direct descendant — Smalltalk's object model (message dispatch resolved entirely at runtime, no compile-time type system) is the actual historical origin of "if it responds to the message, it works," not a coincidentally similar idea Ruby arrived at independently.
10. A real message send — confirmed directly via `3 respondsTo: #+` and `SmallInteger canUnderstand: #+`, both returning `true`, proving `+` is an ordinary method `SmallInteger` implements and could, in principle, be overridden, not hidden built-in syntax.
11. Because Smalltalk's uniform dynamism (every operation, including arithmetic, resolved by runtime message dispatch) is fundamentally incompatible with the raw, close-to-the-machine performance Stroustrup needed, while Simula's model (compile-time-checked classes and inheritance, with `Virtual` as one specific, bounded dynamic-dispatch mechanism used only where needed) is structurally compatible with C's performance characteristics — C++ inherited that structural compatibility directly from Simula's design choices.
