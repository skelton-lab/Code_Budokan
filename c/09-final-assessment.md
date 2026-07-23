# Final Assessment

Across all eight modules. Try each on paper first.

1. Why is `%zu`, not `%d`, the correct format specifier for a `sizeof` result?
2. Do `&&`/`||` short-circuit in C? What real code pattern depends on the answer?
3. What does `arr[i]` actually mean, in terms of pointer arithmetic?
4. Why does `sizeof` on an array parameter give the wrong answer, and what's the standard fix?
5. Why is returning the address of a local variable a bug, even when the program appears to work?
6. Why can two structs with identical fields, in different orders, have different `sizeof` results?
7. Why must you always reassign the result of `realloc`?
8. Name the four classic dynamic-memory bugs this guide triggered and verified with sanitizers.
9. Why doesn't a clean ASan run on macOS prove a program has no memory leaks?
10. Write the type of a function pointer for a function taking two `double`s and returning a `double`.
11. What's the practical difference between undefined behavior and merely surprising, well-defined behavior?
12. Is signed integer overflow undefined behavior? Unsigned?
13. What problem do header guards solve?
14. What's the single most common cause of a Makefile's `missing separator` error?
15. What does Capstone 5's `Shape base` pattern directly foreshadow in C++?

## Answers

1. `sizeof` returns a `size_t`, not necessarily the same size as `int` on every platform — `%zu` matches its actual type; `%d` is technically undefined behavior if the sizes differ.
2. Yes, guaranteed by the standard. Real code relies on it directly — `ptr != NULL && ptr->value > 0` is safe specifically because `ptr->value` is never evaluated when `ptr` is `NULL`.
3. `arr[i]` is defined as `*(arr + i)` — array indexing in C is pointer arithmetic by definition, not a separate mechanism.
4. Once an array is passed to a function, it decays to a pointer to its first element, losing the size information — `sizeof` on the parameter gives the pointer's size, not the array's. The fix is passing an explicit length alongside the pointer.
5. The local variable's stack memory is only valid while its function is on the call stack; once it returns, that memory can be reused by the next function call. "It worked" only means nothing had overwritten it yet at the moment you tested it.
6. The compiler inserts alignment padding based on field order — a smaller field placed right before a larger one that needs stricter alignment forces padding; reordering can eliminate that padding entirely.
7. `realloc` may move the allocation to a different address if it can't grow in place; only the returned pointer is guaranteed to point at valid memory afterward.
8. Memory leak, double-free, use-after-free, heap buffer overflow.
9. LeakSanitizer (ASan's leak detector) isn't supported on macOS — a clean run there means the leak detector didn't run, not that it found nothing. `leaks` or Instruments are the platform-appropriate check.
10. `double (*fp)(double, double);`
11. Well-defined-but-surprising behavior always does the same, specifiable thing, even if it's not what you expected. Undefined behavior has no specified outcome — the compiler may assume it never happens and optimize around that assumption, producing results beyond just "a wrong number."
12. Signed overflow is undefined behavior. Unsigned overflow is explicitly defined to wrap around — despite looking like the same category of mistake.
13. They prevent a header's contents from being pasted into the same compilation twice, which would cause "redefinition" errors for any header containing an actual definition, not just a declaration.
14. Indenting a recipe line with spaces instead of an actual tab character.
15. A C++ "vtable pointer" — every object with a `virtual` function secretly carries a compiler-generated equivalent of `Shape base`'s function-pointer member, so that a call like `shape->area()` dispatches to the correct type-specific implementation automatically, the same way Capstone 5's manual dispatch does by hand.
