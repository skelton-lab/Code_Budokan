# Final Assessment

Across all nine modules and three capstones. Work through these before running anything — precision in your own reasoning is the actual test.

1. Why does `10 3 -` compute `7`, and why can reading RPN strictly left-to-right as if it were infix give the wrong intuition?
2. What did this guide's own verified test prove about calling a word with too few stack arguments?
3. In Capstone 1, why did `SQUARE SQUARE +` produce `259` instead of the intended `25`, tracing the actual stack?
4. What's the correct, verified fix for that bug, and why does it work?
5. What does `THEN` actually mean in Forth's `IF`/`ELSE`/`THEN`, and why is it easy to misread?
6. Why does `6 COUNTUP` (using `1 DO I . LOOP`) print exactly five numbers, not six?
7. Why did `COUNTDOWN`'s `BEGIN`/`UNTIL` loop need an explicit `DROP` after it?
8. What's the real difference between calling `COUNTER` alone and calling `COUNTER @`?
9. In Capstone 2's FizzBuzz, why did the "both Fizz and Buzz" check need to run before the individual `FIZZ?`/`BUZZ?` checks?
10. What did `KEEP-THIRD`'s `>R`/`+`/`R>` sequence demonstrate that no ordinary parameter-stack operation alone could achieve?
11. Why is an imbalanced `>R`/`R>` pair described as more dangerous than a forgotten `DROP`?
12. What does everything written after `DOES>` in a defining word's own definition become?
13. What direct, precise parallel does this guide draw between `CREATE`/`DOES>` and `racket/`'s custom `#lang` capstone?
14. In Capstone 3, what was the actual bug in the first `WEIGHTED-SUM` attempt, and how does it differ in kind from Capstone 1's bug?
15. What real, honest limitation do both `CONSTANT2` and `ARRAY` share, verified directly rather than just assumed?

## Answers

1. Because the first-pushed value acts as the left-hand operand once the operator actually runs — `10 3 -` pushes `10`, then `3`, then subtracts, computing `10 - 3`; reading the tokens as if `-` were positioned the way infix subtraction would place it gives the wrong intuition about which operand is which.
2. That it produces a real, raw runtime error (`Stack underflow`) exactly when the under-supplied word runs — there is no compile-time check that catches this in advance; a word's own stack-effect comment is never enforced by the compiler.
3. Because the first `SQUARE` operated on the top of the stack (the second operand, `4`), leaving `[3, 16]`; the second `SQUARE` then squared *that result* (`16`), not the original first operand (`3`), leaving `[3, 256]`, and the final `+` computed `3 + 256 = 259`.
4. `SWAP SQUARE SWAP SQUARE +` — verified by tracing the stack through each step, correctly squaring each original operand independently before combining them, because `SWAP` repositions the *other* operand to the top before each `SQUARE` call.
5. It means "end of this if-construct," not "then do the following" — a reader's natural instinct from English or any C-family language almost always misreads it as introducing the true-branch.
6. Because `DO`'s limit argument is exclusive — with limit `6` and start `1`, the loop runs for index values `1` through `5`, stopping before ever reaching `6` itself.
7. Because the loop's own exit condition necessarily left the terminating value (`0`) on the stack after `UNTIL` consumed its own flag copy — nothing removes that leftover value automatically.
8. `COUNTER` alone pushes the variable's memory address; `COUNTER @` fetches and pushes the value actually stored at that address — a common, easy mistake is forgetting the `@` and expecting to see the stored value directly.
9. Because if the individual checks ran first, a number divisible by both 3 and 5 (like `15`) would match `FIZZ?` alone and print `"Fizz"`, never reaching the "both" branch that should produce `"FizzBuzz"` and increment both counters.
10. That a value could be genuinely removed from the parameter stack's reach entirely (not just repositioned within it), letting an operation like `+` combine the *other* two values underneath, with the stashed value restored afterward — something no ordinary single-stack rearrangement (`SWAP`, `OVER`, etc.) could achieve on its own.
11. Because the return stack also holds the actual return addresses the language's own control flow depends on — an imbalanced pair corrupts where a word call will try to resume execution, not merely leaving stray data lying around the way an unbalanced parameter stack does.
12. The runtime behavior shared by every word the defining word itself creates — defined once, in the defining word's own body, applied identically to each differently-named, differently-valued word it's used to create.
13. That both express the identical underlying instinct — extending the language's own vocabulary rather than merely using it — at different levels: Racket's custom `#lang` builds an entirely new language for a whole file; `CREATE`/`DOES>` builds an entirely new class of words sharing custom behavior, within ordinary Forth.
14. The first term of the sum had a trailing `+` with nothing yet computed to add it to, since it was the very first value, not an accumulation into an existing running total — a different kind of mistake from Capstone 1's bug, which was about *which stack position* an operator consumed, not about *accumulation pattern* across multiple terms.
15. That neither performs any bounds or type checking at all — an out-of-range array index, or a mismatched constant type, would silently read or write incorrect memory with no error raised, the same "no safety net" philosophy verified directly via Module 1's stack-underflow finding.
