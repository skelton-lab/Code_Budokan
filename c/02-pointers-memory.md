# Module 2 — Pointers and the Memory Model

The single most important C concept, and — if you've done the 6502 track — one you already understand mechanically. Feeds every remaining module.

## Pointers are addresses

**You'll be able to:** declare a pointer, get an address with `&`, dereference with `*`, and explain why that's not new to you.

**Concept**

A pointer variable holds a memory address, plus a type telling the compiler what's stored *at* that address. `&x` gives you the address of `x`. `*p` dereferences `p` — "the value at the address `p` holds." This is precisely `LDA $10` (Module 1 of the 6502 guide) — `$10` was a literal address; a C pointer is a *named, typed variable holding an address*, so the compiler tracks what's there and lets you use a name instead of memorizing the number.

**Example**

```c
#include <stdio.h>
int main(void) {
    int x = 42;
    int *p = &x;
    printf("x=%d, *p=%d, address stored in p=%p\n", x, *p, (void*)p);
    *p = 100;
    printf("after *p=100, x=%d\n", x);
    return 0;
}
```

Verified: `*p = 100` changes `x` itself, printing `after *p=100, x=100` — confirming `p` and `x` refer to the same memory, exactly like storing through a pointer in Module 5's assembly example.

> **Pitfall:** `int *p` declares `p` as "a pointer to `int`," not "an `int` called `*p`" — but `int *p, q;` declares `p` as a pointer and `q` as a plain `int`, which surprises almost everyone the first time. Declare one pointer per line, or put the `*` next to the variable name consistently, to avoid this trap entirely.

**Practice**

- Write a `swap(int *a, int *b)` function that actually swaps two callers' variables — this is the direct C equivalent of "pass by reference," and it's *why* pointers as function parameters exist.
- Predict what `printf("%p", p)` prints without running it, then check — it's just a number (an address), formatted in hex.

## Pointer arithmetic and arrays-as-pointers

**You'll be able to:** index an array two equivalent ways; explain what "array decay" means.

**Concept**

`arr[i]` and `*(arr + i)` are *exactly* the same operation in C — array indexing is defined in terms of pointer arithmetic, not the other way around. When you pass an array to a function (or assign it to a pointer variable), it **decays** to a pointer to its first element — the function receives no idea how big the original array was, which is exactly why so many C APIs also take an explicit length parameter.

**Example**

```c
int arr[5] = {10,20,30,40,50};
printf("arr[2]=%d, *(arr+2)=%d\n", arr[2], *(arr+2));   /* identical: both 30 */

int *q = arr;                 /* array decays to a pointer to arr[0] */
printf("q[3]=%d, *(q+3)=%d\n", q[3], *(q+3));            /* both 40 */

for (int *it = arr; it < arr + 5; it++) {
    printf("%d ", *it);
}
```

Verified: both indexing styles produce identical results, and the pointer-walking loop correctly prints all five elements — confirming `arr[i]`, `*(arr+i)`, and manual pointer increment are three views of the same underlying mechanism.

> **Pitfall:** `sizeof(arr)` inside the function where `arr` was *declared* gives the full array's byte size — but the moment that same array is passed to another function, the parameter is just a pointer, and `sizeof` on it gives you the pointer's size (`8` on this platform), not the array's. This single fact is responsible for a large fraction of real-world C buffer-size bugs.

**Practice**

- Confirm the `sizeof` pitfall directly: print `sizeof` on an array inside `main`, then pass it to a function and print `sizeof` on the parameter there.
- Write a function that correctly sums an array, taking both a pointer and an explicit length parameter — this is the standard C pattern precisely because of array decay.

## Stack vs. heap

**You'll be able to:** explain where a local variable lives versus a `malloc`'d one, and why returning the address of a local is a bug.

**Concept**

Local variables live on the call stack — the same stack concept from the 6502 guide, just managed automatically by the compiler instead of by hand with `PHA`/`PLA`. That memory is only valid while the function that declared it is still running; the moment it returns, that stack space is free to be reused by the *next* function call. Heap memory (via `malloc`, Module 4) is different: it stays valid until you explicitly `free` it, regardless of which function is currently running — which is exactly what makes it the right tool when something needs to outlive the function that created it.

**Example — correct (heap outlives the function):**

```c
#include <stdlib.h>
int *make_on_heap(int val) {
    int *p = malloc(sizeof(int));
    *p = val;
    return p;           /* fine: heap memory outlives the function */
}
```

**Example — a real, verified bug (stack does not outlive the function):**

```c
int *make_on_stack(int val) {
    int local = val;
    return &local;       /* BUG: local's stack memory is gone once the function returns */
}
```

Verified: `clang -Wall -Wextra` catches this at **compile time** with `warning: address of stack memory associated with local variable 'local' returned [-Wreturn-stack-address]`. Verified further: running it anyway still printed the expected value (`77`) — the stack memory hadn't been overwritten *yet*. This is precisely why this class of bug is dangerous: the compiler told you, in plain language, and the program *appeared to work anyway*, which is exactly the situation where a warning gets ignored and the bug ships.

> **Pitfall:** "it ran fine" is never evidence that stack-address-escape code is correct — it only means nothing has reused that stack memory *yet*. The moment something else calls a function that reuses those stack bytes, the value silently changes underneath you, and the bug becomes intermittent and load-bearing on unrelated code elsewhere in the program.

**Practice**

- Run the buggy example yourself and read the compiler warning in full before doing anything else.
- Call another function between `make_on_stack` and reading its returned pointer, and observe the value actually change — making the danger concrete instead of theoretical.

## Progress check

1. What does a pointer variable actually hold?
2. Why are `arr[i]` and `*(arr+i)` the same operation in C?
3. What does "array decay" mean, and what real bug class does it directly cause?
4. Why is returning the address of a local variable a bug, even if the program appears to work when you test it?
5. What's the key difference between stack and heap memory in terms of *when* it stops being valid?

### Answers

1. A memory address, along with a type telling the compiler what's stored there and how to interpret/step through it.
2. Because array indexing in C is *defined* in terms of pointer arithmetic — `arr[i]` is literally shorthand for `*(arr + i)`, not a separate, independent language feature.
3. When an array is passed to a function (or assigned to a pointer), it decays to a pointer to its first element, losing the original size information — this is why `sizeof` on a parameter gives the pointer's size, not the array's, and why C functions taking arrays conventionally also take an explicit length.
4. The local variable's stack memory is only guaranteed valid while its function is running; once it returns, that memory is free to be reused by the next function call. "It worked" just means nothing had overwritten it yet at the moment you happened to test it — not that the memory is actually still yours.
5. Stack memory is valid only while the function that declared it is on the call stack — it's reclaimed automatically the instant that function returns. Heap memory stays valid until you explicitly `free` it, independent of which function is currently executing.
