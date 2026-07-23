# Module 7 — The Return Stack

By the end of this module you'll be able to use `>R`/`R>` to temporarily stash a value on Forth's second stack, protecting it from an operation that would otherwise consume it. Feeds Capstone 3.

## A second stack, for a different job

**You'll be able to:** move a value from the parameter stack to the return stack and back, and explain why this is genuinely useful rather than just an alternative way to write `SWAP`.

**Concept**

Forth maintains **two** stacks: the parameter stack (everything this guide has used so far) and a separate **return stack**, normally used internally by the language itself to track where to resume execution after a word call returns. `>R` pops a value off the parameter stack and pushes it onto the return stack; `R>` does the reverse. Used carefully, this gives a program a genuine second workspace — a place to stash a value that would otherwise be in the way of an operation needing to reach *underneath* it.

**Example**

```forth
: KEEP-THIRD ( a b c -- a+b c ) >R + R> ;
2 3 99 KEEP-THIRD . . CR
```

```
99 5
```

Verified directly, traced step by step: starting stack `[2, 3, 99]`. `>R` moves `99` (the top) to the return stack, leaving `[2, 3]` on the parameter stack. `+` computes `2 + 3 = 5`, leaving `[5]`. `R>` moves `99` back from the return stack onto the parameter stack, leaving `[5, 99]`. The two `.`s print top-first: `99`, then `5` — matching exactly. Without `>R`/`R>`, adding `2` and `3` while `99` sits on top would require `+` to somehow "reach past" `99`, which no ordinary stack operation does — `>R` genuinely gets it *out of the way* onto a separate stack entirely, not just rearranged.

> **Pitfall:** the return stack is genuinely shared with the language's own control-flow machinery — every ordinary word call pushes a return address onto it automatically, and `EXIT`s pop it back off. Using `>R` to stash a value and then *not* balancing it with a matching `R>` before the current word's definition ends is a serious, real bug: the leftover value on the return stack corrupts where the *word itself* will try to return to, typically crashing the program in a confusing way far from the actual mistake. This is a sharper, more dangerous version of Module 5's "forgot to `DROP`" pitfall — an imbalanced return stack doesn't just leave junk lying around, it breaks control flow itself.

**Practice**

- Write a word `ROTATE-LEFT ( a b c -- b c a )` using `>R`/`R>` combined with `SWAP`, and verify it against the stack-effect comment by tracing it by hand before running it.
- Deliberately write a word that calls `>R` without a matching `R>` before it ends, run it, and observe what actually happens (do this cautiously — it may require restarting GForth).

## Progress check

1. What are Forth's two stacks, and what is the return stack normally used for?
2. What does `>R` do, and what does `R>` do?
3. In `KEEP-THIRD`, why couldn't `+` simply operate on `2` and `3` directly while `99` was still on the parameter stack in its original position?
4. Why is an imbalanced `>R`/`R>` pair a more dangerous bug than forgetting a `DROP`?
5. What real risk does this module warn about regarding the return stack's shared use?

### Answers

1. The parameter stack (used for all ordinary data manipulation) and the return stack (normally used internally to track where execution should resume after a word call returns).
2. `>R` pops the top of the parameter stack and pushes it onto the return stack; `R>` pops the top of the return stack and pushes it back onto the parameter stack.
3. Because `+` (like every ordinary stack operation) only ever operates on the top items of the parameter stack — with `99` sitting on top, `+` would try to add `3` and `99` instead of `2` and `3`, unless `99` is moved somewhere else first.
4. Because the return stack also holds the actual return addresses the language's own control flow depends on — leftover data there corrupts where a word call will try to resume execution, not just leaving stray values lying around the way an unbalanced parameter stack does.
5. That using `>R` to stash a value and failing to balance it with a matching `R>` before the current word's definition ends corrupts the language's own control-flow state, typically causing a confusing crash far removed from the actual mistake.
