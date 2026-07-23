# Final Assessment

Across all seven modules. Try each on paper before checking the answer.

1. Why must `implicit none` appear in every program unit?
2. Write the `gfortran` command line for a debug build with bounds checking.
3. Describe the difference between `real(8)` and `real(real64)`.
4. Compute the dot product of two vectors `a` and `b` in one line.
5. Why nest 2-D loops with the column (rightmost) index outermost in Fortran?
6. Allocate an array of `n` reals, check for failure, then deallocate.
7. Give a format string printing a label, then a real in scientific notation, width 12, 4 decimals.
8. How does `use`-ing a module give you automatic interface checking?
9. Mark a temperature-conversion function `elemental`.
10. Loop over every line of a file until end-of-file using `iostat`.
11. Define a derived type for an order with `id`, `qty`, `price`, and give it an `interface operator(+)` that adds two orders' `qty` and takes the higher `price`.
12. Why prefer `allocatable` arrays over `pointer` arrays for data your code owns?
13. What does `v(::-1)` actually return in Fortran, and what's the correct way to reverse an array?
14. Why can't `if (j >= 1 .and. a(j) > 0)` be trusted to guard against an out-of-bounds `a(j)` when `j` is `0`, and what pattern fixes it?
15. What does `fpm test` run, and what does `error stop` inside a test do for it?
16. A `COMMON` block and a module's module-level data both share state across procedures. What can the compiler verify for one that it can't for the other?
17. What does `do concurrent` promise the compiler about its loop body, and why does that promise make parallel execution legal?

## Answers

1. It disables implicit typing, so every undeclared name is a compile error instead of a silently-typed variable — catching typos and unintended kinds before runtime.
2. `gfortran -std=f2008 -Wall -Wextra -fcheck=all -g prog.f90 -o prog`
3. `real(8)` is a compiler-specific literal kind value. `real(real64)` names a portable constant from `iso_fortran_env`, guaranteed across standard-conforming compilers.
4. `dot_product(a, b)`
5. Fortran arrays are column-major — the leftmost index is contiguous in memory. Iterating the leftmost index in the inner loop walks memory contiguously, maximising cache hits.
6. `allocate(x(n), stat=ios); if (ios /= 0) stop 'fail'; ...; deallocate(x)`
7. `'(a, es12.4)'`
8. Importing with `use` exposes the module's interfaces, so the compiler checks every procedure's argument types, ranks, and `intent` at every call site.
9. `elemental real function c2f(c); real, intent(in) :: c; c2f = c*9.0/5.0 + 32.0; end function`
10. `do; read(u,'(a)',iostat=ios) line; if (ios < 0) exit; ...; end do`
11. ```fortran
    type :: order
      integer :: id, qty
      real :: price
    end type order

    interface operator(+)
      module procedure add_orders
    end interface
    ! ...
    pure function add_orders(a, b) result(c)
      type(order), intent(in) :: a, b
      type(order) :: c
      c%id = a%id
      c%qty = a%qty + b%qty
      c%price = max(a%price, b%price)
    end function add_orders
    ```
12. Allocatables auto-deallocate on scope exit, can never dangle, and don't alias each other — safer and easier to reason about than pointers, which should be reserved for cases needing actual indirection.
13. An **empty array** (size 0) — omitted subscript-triplet bounds default to the array's declared lower/upper bound regardless of stride sign, so stepping `-1` from the lower toward the (larger) upper bound never executes. Reverse with explicit bounds: `v(size(v):1:-1)`.
14. Fortran's `.and.` doesn't guarantee short-circuit evaluation — a conforming compiler may evaluate `a(j)` even when `j >= 1` is false. Guard the index with a nested `if`, or use `max(j,1)` inside the potentially-unsafe access as the sort routine in Capstone 1 does.
15. It builds and runs every program under `test/`. `error stop` (with a nonzero code, or bare) gives the process a nonzero exit status, which is what `fpm test` reads to report a failure.
16. A module's data has exactly one declaration, checked by the compiler for every `use`. A `COMMON` block is declared separately, by hand, in every procedure that uses it — nothing forces those declarations to agree in type, order, or size, so a mismatch is undefined behavior the compiler can't catch, discovered (if you're lucky) at runtime.
17. `do concurrent` promises the compiler that no iteration depends on any other — no iteration reads a value written by another iteration in a way that would change with execution order. The standard enforces this by forbidding I/O, calls to non-`pure` procedures, and branches out of the block inside it. That verified independence is exactly what makes reordering (including running iterations in parallel) safe.
