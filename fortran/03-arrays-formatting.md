# Module 3 — Arrays and Formatted Output

Fortran was designed for arrays. This module covers whole-array expressions, slicing, allocation, masked operations, the `FORMAT` toolkit, and reading/writing to strings instead of files. Feeds Capstones 1, 3, 4, 5.

## 1-D arrays: declaration & access

**You'll be able to:** declare arrays two equivalent ways; build them with `[ ... ]`; slice with colon notation.

**Concept**

`real, dimension(5) :: v` and `real :: v(5)` are equivalent. Default lower bound is 1; override with `v(0:4)`. Whole-array operations apply elementwise with no explicit loop: `w = 2.0*v + 1.0`.

**Example**

```fortran
program arr1d
  implicit none
  integer :: i
  real :: v(5), w(5)
  v = [ (real(i), i = 1, 5) ]   ! implied-do constructor
  w = 2.0*v + 1.0
  print *, 'v =', v
  print *, 'w =', w
  print *, 'sum =', sum(v), ' max =', maxval(v)
  print *, 'middle three =', v(2:4)
end program arr1d
```

> **Pitfall:** array intrinsics (`sum`, `product`, `minval`, `maxval`, `any`, `all`, `count`) replace many loops outright — they're faster and clearer than writing the loop yourself.

**Practice**

- Build a vector of 100 evenly spaced reals from 0 to 1.
- Compute the dot product of two 5-vectors with `dot_product`.
- Reverse a vector with `v(size(v):1:-1)` — spelled out below.

### Reversing a vector — and the mistake that motivated this correction

To reverse an array, write the bounds explicitly: `v(size(v):1:-1)`, or equivalently `v(ubound(v,1):lbound(v,1):-1)` if the array doesn't start at index 1.

It's tempting to write `v(::-1)`, expecting Python-style "omit the bounds, reverse the whole thing" behavior. **This does not work in Fortran.** When a subscript-triplet's lower or upper bound is omitted, it defaults to the array's *declared* lower and upper bound — regardless of the stride's sign. So `v(::-1)` expands to `v(lbound:ubound:-1)`, and stepping with `-1` from the lower bound toward the (larger) upper bound never satisfies the loop condition: **the result is an empty, zero-sized array**, not a reversal, and not an error either — it will silently compile and run, just returning nothing.

```fortran
program reverse_demo
  implicit none
  integer :: v(5) = [1, 2, 3, 4, 5]
  print *, 'correct reversal:', v(size(v):1:-1)
  print *, 'size of v(::-1):', size(v(::-1))   ! 0 — not a reversal
end program reverse_demo
```

**Practice**

- Run the snippet above and confirm `size(v(::-1))` really is `0` on your compiler.
- Write a function `reversed(x)` returning an allocatable array, using the correct explicit-bounds form.

## Multi-dimensional arrays

**You'll be able to:** declare 2-D+ arrays; exploit column-major storage for speed; use `dim=` in reduction intrinsics.

**Concept**

Fortran stores arrays column-major: the leftmost index varies fastest in memory. Loop nesting that respects this — inner loop over the leftmost index — is much faster. Many intrinsics take a `dim=` argument to reduce along one axis: `sum(a, dim=1)` sums each column.

**Example**

```fortran
program arr2d
  implicit none
  integer :: i, j
  real :: a(3, 4)
  do j = 1, 4        ! outer loop over the slower-varying index
    do i = 1, 3       ! inner loop over the contiguous index
      a(i, j) = i + 10*j
    end do
  end do
  print *, 'shape =', shape(a)
  print *, 'col sums =', sum(a, dim=1)
  print *, 'row sums =', sum(a, dim=2)
  print '(4f8.1)', transpose(a)
end program arr2d
```

> **Pitfall:** if you're used to C's row-major arrays, reverse your loop nesting instinct — in Fortran the outer loop should walk the rightmost (slowest-varying) index for cache-friendly access.

**Practice**

- Build the 5×5 identity matrix.
- Compute a row-wise mean with `sum(a, dim=2)/size(a,2)`.
- Reshape a 12-element 1-D array into 3×4 with `reshape`.

## Allocatable arrays

**You'll be able to:** allocate at run time; resize/deallocate cleanly; use automatic reallocation on assignment.

**Concept**

`real, allocatable :: x(:)` declares a deferred-shape array; `allocate(x(n))` sizes it; `deallocate(x)` frees it. Since Fortran 2003, `x = some_array` automatically (re)allocates `x` to the right shape.

**Example**

```fortran
program alloc_demo
  implicit none
  real, allocatable :: x(:)
  integer :: n, ios, i
  read(*,*, iostat=ios) n
  if (ios /= 0 .or. n <= 0) stop 'need positive integer'
  allocate(x(n))
  x = [(real(i)**2, i=1,n)]
  print *, 'sum =', sum(x)
  deallocate(x)
end program alloc_demo
```

> **Pitfall:** local `allocatable` variables auto-deallocate on scope exit, so leaks are less of a risk than with pointers — but explicit `deallocate` is still good discipline in long-running loops that repeatedly reuse the same variable.

**Practice**

- Read `n` and `n` values, then sort them (you'll formalize a real sort in Module 6).
- Demonstrate automatic reallocation: assign a longer array to an already-allocated variable.
- Catch allocation failure with `stat=` and report it.

## where, and masked operations

**You'll be able to:** apply elementwise conditions with `where`/`elsewhere`; combine masks with logical intrinsics.

**Concept**

`where (mask) assignment` performs the assignment only where `mask` is true; `elsewhere` handles the rest. (`forall` does index-based masked assignment too, but it's obsolescent as of Fortran 2018 — prefer `do concurrent`, covered in Module 6's parallel session, for that use case.)

**Example**

```fortran
program masks
  implicit none
  integer :: i
  real :: x(10)
  x = [(real(i)-5.5, i=1,10)]
  where (x < 0.0)
    x = 0.0            ! ReLU
  elsewhere
    x = sqrt(x)
  end where
  print *, 'after :', x
  print *, 'count positive =', count(x > 0.0)
end program masks
```

> **Pitfall:** `where` is for whole-array assignment only. For conditional logic touching scalars or calling procedures, fall back to a regular loop with `if`.

**Practice**

- Cap a vector at 1.0: `where (v > 1.0) v = 1.0`.
- Replace negatives with their absolute values in a single `where`.
- Count NaN entries with `count(.not. (v == v))` — NaN is the one value that never equals itself.

## Formatted output: the FORMAT toolkit

**You'll be able to:** use `i`, `f`, `es`, `a` edit descriptors; repeat groups; choose inline vs. labelled formats.

**Concept**

Common descriptors: `i<w>` integer in width `w`; `f<w>.<d>` fixed-point; `es<w>.<d>` scientific notation with a normalized leading digit; `a`/`a<w>` character; `x` one space; `/` a newline; `t<n>` tab to column `n`. A leading repeat count applies to a group: `(3f8.2)`.

**Example**

```fortran
program fmt
  implicit none
  integer :: i
  real :: v(4) = [3.14159, 2.71828, 1.41421, 1.61803]
  print '(a)', '   i     f8.3     es12.4'
  do i = 1, size(v)
    print '(i8, 2x, f8.3, 2x, es12.4)', i, v(i), v(i)
  end do
  print '(a, t30, a)', 'left', 'right (tab to col 30)'
end program fmt
```

> **Pitfall:** `i0` prints an integer at the minimum width needed — the standard choice when you don't want to guess a fixed width and pad manually.

**Practice**

- Print a 5×5 multiplication table with a single format string.
- Format a real in both `f` and `es` styles on one line.
- Use `t` to lay out a two-column report.

## Internal I/O: reading and writing to strings

**You'll be able to:** convert between numbers and text without touching a file, using the same `read`/`write` syntax.

**Concept**

`read`/`write` can target a `character` variable instead of a file unit — this is "internal I/O," and it's the idiomatic Fortran way to do what other languages call string formatting or parsing, without hand-rolling ASCII arithmetic.

**Example**

```fortran
program internal_io
  implicit none
  character(len=20) :: buf
  integer :: n
  real :: x

  write(buf, '(i0)') 12345
  print *, 'formatted: [', trim(buf), ']'

  buf = '   3.14159'
  read(buf, *) x
  print *, 'parsed real:', x

  write(buf, '(a, i0, a)') 'val=', 42, ';'
  read(buf(5:6), *) n
  print *, 'extracted n:', n
end program internal_io
```

> **Pitfall:** the target character variable's declared length is a hard limit — writing a value wider than the buffer truncates or errors depending on the compiler, silently in some cases. Size buffers generously for the values you expect.

**Practice**

- Convert an integer to a zero-padded 5-digit string (`write` with an `i5.5` descriptor, then check what padding character it uses).
- Build a one-line CSV row in a string buffer before writing it to a file.
- Parse a `key=value` line using `index` (Module 1) to split, then internal `read` to convert the value.

## Progress check

1. Declare a 100-element `real(real64)` array indexed from 0 to 99.
2. Why is `do j; do i; a(i,j) = ...` faster than the reverse in Fortran?
3. Convert `do i=1,n; s = s + v(i); end do` to a one-liner.
4. What does `v(::-1)` actually return, and why does it surprise people?
5. How do you allocate an array of `n` reals safely and check for failure?
6. Write a `where` that square-roots non-negative entries, leaving negatives unchanged.
7. What does the format `(i0, 1x, f10.4)` produce?
8. Sum each column of a 2-D array `a`.
9. Convert the integer `7` to the string `"007"` using internal I/O.

### Answers

1. `real(real64) :: x(0:99)`
2. Fortran arrays are column-major — consecutive `i` values sit next to each other in memory. Iterating `i` in the inner loop walks memory contiguously, maximising cache hits.
3. `s = sum(v)`
4. It returns an **empty array** (size 0), because omitted bounds default to the array's declared lower/upper bound regardless of stride sign, and stepping `-1` from the lower toward the (larger) upper bound never executes. It surprises people because it looks like Python's slice-reversal idiom, which works completely differently. Use `v(size(v):1:-1)` to actually reverse.
5. `allocate(x(n), stat=ios); if (ios /= 0) stop 'allocation failed'`
6. `where (v >= 0.0) v = sqrt(v)`
7. An integer at minimum width, one space, then a fixed-point real in width 10 with 4 decimals.
8. `sum(a, dim=1)`
9. `write(buf, '(i3.3)') 7` — the `.3` on an `i` descriptor means "pad with leading zeros to 3 digits," giving `'007'`.
