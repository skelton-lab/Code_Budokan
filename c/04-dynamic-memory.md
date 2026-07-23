# Module 4 — Dynamic Memory

The thing 6502 code never had: memory you request and release at runtime, sized however you need, outliving whichever function allocated it. It's also the single biggest source of real C bugs — this module verifies each classic bug by actually triggering it and reading the sanitizer's diagnostic, not just describing it. Feeds Capstones 1, 4.

## malloc, realloc, free

**You'll be able to:** allocate heap memory, resize it, and release it — the whole lifecycle.

**Concept**

`malloc(n)` requests `n` bytes from the heap and returns a pointer to them (or `NULL` if it fails — real code checks this; these examples skip the check for brevity, which Capstone 1 will not). `realloc(ptr, new_size)` resizes a previous allocation, possibly moving it — always reassign the result, since the original pointer may no longer be valid. `free(ptr)` releases the memory back to the system; after this, `ptr` is a **dangling pointer** and must not be used again.

**Example**

```c
#include <stdio.h>
#include <stdlib.h>
int main(void) {
    int *arr = malloc(3 * sizeof(int));
    arr[0] = 1; arr[1] = 2; arr[2] = 3;

    arr = realloc(arr, 5 * sizeof(int));    /* always reassign -- the address may change */
    arr[3] = 4; arr[4] = 5;
    printf("%d %d %d %d %d\n", arr[0], arr[1], arr[2], arr[3], arr[4]);

    free(arr);
    return 0;
}
```

Verified: prints `1 2 3 4 5` — confirming the original three values survive the `realloc`, and the two new slots are usable afterward.

> **Pitfall:** `sizeof` the *type*, not a guessed byte count — `malloc(3 * sizeof(int))`, not `malloc(12)`. It's not just style: if `int`'s size ever differs on some platform, the `sizeof` version is still correct and the hardcoded version silently isn't.

**Practice**

- Add a `NULL` check after the `malloc` call and handle allocation failure (print an error, exit non-zero).
- Grow the array in a loop, doubling its capacity each time it fills — this is the entire mechanism behind Capstone 1.

## The classic bugs, actually triggered

**You'll be able to:** recognize a leak, double-free, use-after-free, and buffer overflow — and read what `-fsanitize=address` tells you about each.

**Concept**

These four bugs account for a large share of C's reputation for danger. Each one below was actually compiled and run with this guide's sanitizer flags, and the diagnostic shown is real output, not a paraphrase.

**Use-after-free** — reading or writing memory after it's been `free`d:

```c
int *p = malloc(sizeof(int));
*p = 5;
free(p);
printf("%d\n", *p);    /* BUG */
```

Verified — ASan's actual output:
```
==ERROR: AddressSanitizer: heap-use-after-free on address ...
READ of size 4 at ... thread T0
    #0 ... in main m4_uaf.c:7
0x... is located 0 bytes inside of 4-byte region [...]
freed by thread T0 here:
    #0 ... in free ...
    #1 ... in main m4_uaf.c:6
```

Notice it tells you not just *that* it's a use-after-free, but exactly which line freed the memory and which line read it afterward.

**Double-free** — calling `free` twice on the same pointer:

```c
int *p = malloc(sizeof(int));
free(p);
free(p);    /* BUG */
```

Verified: `AddressSanitizer: attempting double-free on 0x...`, again with the line number of both frees.

**Heap buffer overflow** — reading or writing past the end of an allocation:

```c
int *arr = malloc(3 * sizeof(int));
arr[3] = 99;    /* BUG: valid indices are 0, 1, 2 */
```

Verified: `AddressSanitizer: heap-buffer-overflow ... WRITE of size 4 ... 0 bytes after 12-byte region` — it even tells you the write landed *zero bytes* past the end, which is exactly what an off-by-one bug looks like from the sanitizer's side.

**Memory leak** — allocating and never freeing:

```c
int *p = malloc(4 * sizeof(int));
p[0] = 42;
return 0;   /* never freed */
```

> **Platform gotcha, found while verifying this guide:** ASan's leak detector (`LeakSanitizer`) is **not supported on macOS** — running this example here prints nothing and exits cleanly, which is *not* the same as the code being correct. On macOS, use Apple's own `leaks` command-line tool, or Instruments' Leaks profiler, to actually catch this; on Linux, ASan's leak detection works directly. This is a genuine platform difference this guide's toolchain hit while being built, not a hypothetical caveat — don't take a clean ASan run on macOS as proof a program doesn't leak.

**Practice**

- Trigger each of the three ASan-catchable bugs above yourself and read the full diagnostic, not just the first line.
- On macOS, try `leaks --atExit -- ./your_program` against the leak example; on Linux, rerun with `ASAN_OPTIONS=detect_leaks=1`.
- Fix each bug (free once, don't read after freeing, allocate the right size) and confirm a clean run.

## Ownership: whose job is it to free this?

**You'll be able to:** state, for any pointer in a small program, who's responsible for freeing it.

**Concept**

C has no garbage collector and no automatic tracking of who "owns" a piece of heap memory — that's a discipline you maintain, not something the language enforces. The practical rule that keeps most real code sane: whoever allocates a piece of memory documents (in a comment, or by convention) whether the caller or the callee is responsible for freeing it, and every function that returns a heap pointer makes that contract obvious rather than implicit.

**Practice**

- For the `make_on_heap` function from Module 2, write a one-line comment stating who owns the returned pointer and who must free it.
- Sketch (in comments, no need to fully implement yet) how Capstone 1's growable array will track ownership when it's grown, copied, or handed to another function.

## Progress check

1. Why must you always reassign the result of `realloc`, rather than trusting the original pointer still works?
2. What does "dangling pointer" mean, and which of this module's four bugs is a dangling-pointer bug by definition?
3. What did ASan's use-after-free diagnostic tell you beyond just "this is wrong"?
4. Why doesn't a clean ASan run on macOS prove a program has no memory leaks?
5. What's the practical rule this guide uses for tracking pointer ownership, given C has no automatic enforcement?

### Answers

1. `realloc` may need to move the allocation to a larger contiguous block elsewhere in memory if it can't grow in place — the original pointer may no longer point to valid memory, so only the returned pointer is guaranteed correct.
2. A dangling pointer still holds an address, but the memory at that address is no longer valid to use (freed, or — from Module 2 — a returned stack address). Use-after-free is exactly a dangling-pointer bug: `p` still "points" somewhere, but that memory has been released.
3. The exact line that freed the memory *and* the exact line that read it afterward — turning "somewhere this program uses freed memory" into a directly actionable two-line diff.
4. LeakSanitizer isn't supported on macOS — a clean run there means the leak detector didn't run, not that it ran and found nothing. `leaks` or Instruments are the platform-appropriate tools to actually check.
5. Document, for every function returning heap memory, whether the caller or the callee is responsible for freeing it — since nothing in the language enforces or even tracks this automatically.
