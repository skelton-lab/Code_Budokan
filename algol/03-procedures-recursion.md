# Module 3 — Procedures and Recursion

ALGOL 60's other landmark contribution: procedures that can call themselves, made possible by the same block-structure/dynamic-storage model from Module 2. Verified.

## Recursive procedures

**You'll be able to:** write a procedure that calls itself, and explain why this requires the storage model Module 2 established.

**Concept**

`PROC name = (params) returntype: body` declares a procedure. A recursive procedure — one that calls itself, directly or indirectly — needs each call to get its **own** fresh storage for its parameters and local variables, so that a call in progress doesn't get its data overwritten by a nested call to itself. This is exactly what Module 2's block-structure model provides: each invocation is its own block, with its own storage, nested inside whichever call invoked it. Fortran's original static storage model — one fixed memory location per variable, shared by every call — makes this fundamentally impossible; ALGOL 60 supporting recursion natively was a direct, necessary consequence of the storage model it had already committed to for ordinary block structure.

**Example**

```algol68
PROC fact = (INT n) INT:
   IF n <= 1 THEN 1 ELSE n * fact(n - 1) FI;

BEGIN
   print((fact(5), newline));
   print((fact(10), newline))
END
```

Verified: prints `+120` and `+3628800` — `5! = 120` and `10! = 3628800`, both correct, computed via `fact` genuinely calling itself down to the base case (`n <= 1`) and multiplying the results back up.

**A second example, verified — the Euclidean algorithm for greatest common divisor:**

```algol68
PROC gcd = (INT a, INT b) INT:
   IF b = 0 THEN a ELSE gcd(b, a MOD b) FI;

BEGIN
   print((gcd(48, 18), newline));
   print((gcd(100, 75), newline))
END
```

Verified: `gcd(48, 18)` correctly returns `6`, and `gcd(100, 75)` correctly returns `25` — each call recurses with a smaller pair of arguments (`b`, `a MOD b`) until `b` reaches `0`, at which point `a` is the answer.

> **Pitfall:** recursion without a guaranteed-reachable base case (here, `n <= 1` for `fact`, `b = 0` for `gcd`) recurses forever, exactly as in every other language in this series — ALGOL 60 doesn't do anything special to protect against this; the discipline of ensuring every recursive call actually makes progress toward a base case is the programmer's responsibility here just as much as in Fortran, C, or Ruby.

**Practice**

- Write a recursive Fibonacci procedure and confirm `fib(10)` against the known value (`55`).
- Deliberately remove `fact`'s base case (or make it unreachable, e.g. checking `n = 0` when called with a positive `n` that only decreases toward it via a step that skips over it) and observe what happens — you'll need to interrupt it, exactly as an infinite loop in any other language would require.

## Progress check

1. What does a recursive procedure require of its storage model that Fortran's original design couldn't provide?
2. Why does `fact`'s recursion terminate, concretely — what specific condition guarantees it?
3. What does `gcd`'s recursive step (`gcd(b, a MOD b)`) rely on to guarantee eventual termination?
4. Does ALGOL 60 (or ALGOL 68) protect you from infinite recursion the way some modern language runtimes attempt to (e.g., a maximum call-stack-depth error)? What's the practical implication?

### Answers

1. Fresh, independent storage for each call's parameters and local variables — Fortran's original static (compile-time-fixed) storage model had exactly one memory location per variable, shared across every call, making a self-call's data collide with the in-progress call's data.
2. `n <= 1` is checked before the recursive multiply; every call reduces `n` by exactly 1, so `n` is guaranteed to reach `1` (or lower) in a finite number of steps from any positive starting value.
3. `a MOD b` is always strictly smaller than `b` (for positive integers), so each recursive call's second argument strictly decreases, guaranteeing it eventually reaches `0` and the recursion terminates.
4. No special protection beyond whatever the underlying runtime naturally provides (a call stack of finite depth, which will eventually overflow on unbounded recursion) — ensuring a base case is actually reachable is the programmer's responsibility, exactly as in every other language covered in this series.
