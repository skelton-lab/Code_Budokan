# Final Assessment

Across all ten modules. Try each on paper first — no `fpc`.

1. What historical decision led directly to Wirth designing Pascal rather than adopting ALGOL 68 as-is?
2. What punctuation closes an entire Pascal program specifically, and how is it different from an ordinary nested `end`?
3. What statement did Wirth add to Pascal that ALGOL 60 never had at all?
4. What's the difference between a plain (value) parameter and a `var` parameter, verified directly with `ByValue`/`ByRef`?
5. Across this series, name the three different ways the dangling-else ambiguity has now been handled, and which one Pascal actually uses.
6. What did this guide verify about Pascal's subrange types that contradicts "compile-time type checking always enforces this," and what specific compiler flag closes that gap?
7. What do `+`, `*`, and `-` mean for two `set`-typed operands, and how is that decided at compile time?
8. What's the real, verified difference between Pascal's typed pointers and C's pointers regarding cross-type assignment?
9. What genuinely surprising finding did this guide make about pointer arithmetic, and which compiler flag revealed the ISO-standard-conforming answer?
10. In Capstone 4's `InsertSorted`, why does `(head = nil) or (head^.value >= v)` need to be in that exact order, not reversed?
11. What real Pascal language gap, named directly in this guide's own Beyond This Guide module, is the specific reason Wirth designed Modula-2 next?

## Answers

1. Wirth sat on the ALGOL 68 design committee and, with C.A.R. Hoare, had already proposed a smaller alternative (ALGOL W) before ALGOL 68 was finalized; when the committee chose ALGOL 68's greater complexity instead, Wirth went on to design Pascal independently, building on ALGOL W's ideas.
2. A period (`.`) — verified directly, omitting it produces a syntax error expecting `.` specifically, because it marks the end of the entire program, distinct from the semicolons (or nothing, before `else`) that close every other nested `end` in the same file.
3. `case` — ALGOL 60 only has `if`/`else` for branching; Pascal added a genuine multi-way branch statement, including range-based labels (verified directly in Capstone 1's `90..100` style case labels).
4. A plain parameter is passed by value — the procedure gets its own private copy, and changes never propagate back to the caller's variable (verified: `n` stayed `5` after `ByValue` modified its own copy to `105`). A `var` parameter modifies the caller's actual variable directly (verified: `n` became `105` after `ByRef`).
5. ALGOL 60 has the ambiguity and never fixed it (documented only, in `algol/`); ALGOL 68 fixed it structurally with mandatory `FI` closing every `if` (verified in `algol/`); Pascal kept the identical ambiguity, resolved purely by the "nearest unmatched `if`" convention (verified directly here) — Pascal uses the third approach, the same convention C would later adopt as well.
6. That a subrange violation is only caught automatically at compile time when the out-of-range value is a literal constant — verified directly, the identical violation delivered through a variable instead compiled and ran with no error at all by default. `-Cr` (runtime range checking) closes the gap, verified directly to turn the same violation into a `Runtime error 201`.
7. `+` is union, `*` is intersection, `-` is difference — decided entirely by the operand types at compile time, the same symbols as arithmetic operators repurposed for set types specifically.
8. Pascal's typed pointers reject cross-type assignment at compile time with no implicit conversion (verified: `IntPtr` to `RealPtr` produced `Error: Incompatible types`); C permits `void*` and casts the compiler will often allow with only a warning, making exactly this class of mistake considerably easier to introduce silently.
9. That FPC's default compilation mode actually allows pointer arithmetic on typed pointers (`p := p + 1` compiled successfully) — contradicting the reasonable expectation that "Pascal doesn't have pointer arithmetic." `-Miso` (strict ISO mode) revealed the standard-conforming answer, correctly rejecting the identical code with a type error.
10. Because Pascal's `or` short-circuits — if `head` is `nil`, the second condition (`head^.value >= v`) would dereference a `nil` pointer and crash; putting `head = nil` first ensures that check happens, and short-circuits before the unsafe dereference is ever attempted. Verified directly: reversing the order caused a genuine runtime crash on an empty list.
11. The lack of a standard mechanism for splitting a program across multiple files with explicit, controlled interfaces between them (units/separate compilation) — Wirth designed Modula-2's built-in module system, with explicit imports and exports, specifically to solve this gap in Pascal.
