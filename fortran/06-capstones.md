# Module 6 — Capstones

Six projects, each small enough to finish in a sitting, together exercising everything from Modules 1–5 plus the two topics that earned full-session treatment under the capstone-impact test: parallelism (as a direct extension of the heat solver) and legacy-code literacy (as its own capstone, because "maintain" was part of this guide's stated promise from the start).

## Project conventions

Structure every capstone as an `fpm` project (Module 4): library code in `src/`, the runnable program in `app/`, tests in `test/`. Use one tiny shared testing helper across all of them:

```fortran
! src/check.f90 (or a project-local test_utils module)
module check_mod
  implicit none
contains
  subroutine check(condition, message)
    logical, intent(in) :: condition
    character(len=*), intent(in) :: message
    if (condition) then
      print *, 'ok:   ', message
    else
      print *, 'FAIL: ', message
      error stop 1
    end if
  end subroutine check
end module check_mod
```

`error stop` gives a nonzero process exit status on failure, which is what `fpm test` uses to tell pass from fail. This isn't a testing framework — it's the minimum viable habit of "the capstone can tell you itself whether it still works," which is worth more than it costs.

## Capstone 1 — Statistics CLI

**Proves:** array intrinsics, sorting, derived types, module/app/test project structure.

Expose a single `summary` subroutine taking a 1-D array and returning a record with count, mean, variance, min, max, median. The driver handles I/O.

```fortran
! src/stat_mod.f90
module stat_mod
  use, intrinsic :: iso_fortran_env, only: real64
  implicit none
  type :: stats
    integer :: n = 0
    real(real64) :: mean=0, var=0, mn=0, mx=0, med=0
  end type stats
contains
  subroutine summary(x, s)
    real(real64), intent(in) :: x(:)
    type(stats), intent(out) :: s
    real(real64), allocatable :: y(:)
    integer :: n
    n = size(x); s%n = n
    if (n == 0) return
    s%mean = sum(x)/n
    s%var  = sum((x - s%mean)**2)/max(1, n-1)
    s%mn = minval(x); s%mx = maxval(x)
    y = x; call sort(y)
    if (mod(n,2) == 1) then
      s%med = y((n+1)/2)
    else
      s%med = 0.5_real64*(y(n/2) + y(n/2+1))
    end if
  end subroutine summary

  subroutine sort(a)   ! insertion sort — O(n^2), fine below a few thousand elements
    real(real64), intent(inout) :: a(:)
    integer :: i, j
    real(real64) :: k
    do i = 2, size(a)
      k = a(i); j = i-1
      ! Note the max(j,1) guard: Fortran's .and. does not guarantee
      ! short-circuit evaluation (Module 2), so j >= 1 alone cannot be
      ! trusted to protect a(j) from an out-of-bounds access at j=0.
      do while (j >= 1 .and. a(max(j,1)) > k)
        a(j+1) = a(j); j = j-1
        if (j < 1) exit
      end do
      a(j+1) = k
    end do
  end subroutine sort
end module stat_mod
```

```fortran
! test/test_stat.f90
program test_stat
  use, intrinsic :: iso_fortran_env, only: real64
  use stat_mod
  use check_mod
  implicit none
  type(stats) :: s
  real(real64) :: x(5) = [5.0_real64, 3.0_real64, 1.0_real64, 4.0_real64, 2.0_real64]
  call summary(x, s)
  call check(s%n == 5, 'count is 5')
  call check(abs(s%mean - 3.0_real64) < 1.0e-10_real64, 'mean is 3.0')
  call check(abs(s%med - 3.0_real64) < 1.0e-10_real64, 'median is 3.0')
  call check(s%mn == 1.0_real64 .and. s%mx == 5.0_real64, 'min/max correct')
end program test_stat
```

**Practice**

- Wire up `app/main.f90` to read numbers from stdin and print the summary.
- Add a `--csv` mode printing one CSV row.
- Replace the insertion sort with quicksort once your data exceeds a few thousand entries — insertion sort is O(n²) and it'll start to show.

## Capstone 2 — Numerical quadrature

**Proves:** passing procedures as arguments via `abstract interface`, floating-point error analysis.

Implement composite trapezoidal integration, then compare its error against the true value of `∫sin(x) dx` over `[0, π]` (which is exactly 2).

```fortran
! src/quad.f90
module quad
  use, intrinsic :: iso_fortran_env, only: real64
  implicit none
  abstract interface
    function f1(x) result(y)
      import :: real64
      real(real64), intent(in) :: x
      real(real64) :: y
    end function f1
  end interface
contains
  real(real64) function trap(f, a, b, n) result(s)
    procedure(f1) :: f
    real(real64), intent(in) :: a, b
    integer, intent(in) :: n
    real(real64) :: h
    integer :: i
    h = (b - a)/n
    s = 0.5_real64*(f(a) + f(b))
    do i = 1, n-1
      s = s + f(a + i*h)
    end do
    s = s*h
  end function trap
end module quad
```

> **Pitfall:** `abstract interface` + `procedure(f1)` is the modern, fully type-checked way to pass a function to a function — no macros, no void pointers.
>
> **Compiler gotcha, verified against gfortran 15.1:** it's tempting to mark both `f1` and `trap` `pure` (nothing in this code has side effects). Do that and the module itself still compiles cleanly with `gfortran -c` — but the moment anything `use`s it, even a `program` in the very same file, compilation fails with a cryptic `Argument '_formal_0' of pure function 'f' ... must be INTENT(IN) or VALUE`, even though `f1`'s dummy argument already has `intent(in)`. This reproduces on gfortran 15.1 (Homebrew) and looks like a module-file (`.mod`) serialization bug specifically around `pure` abstract interfaces used as dummy-procedure arguments, not a real language-conformance error — the code is valid Fortran, and the failure is in `use`-processing, not in the definition. Either drop `pure` (as done here) or check your installed compiler version before assuming code following this pattern is broken rather than the compiler.

**Practice**

- Add Simpson's rule and confirm it converges faster than trapezoidal at the same `n`.
- Time both with `cpu_time` at `n=10**6`.
- Integrate `exp(-x*x)` over `[0, 5]` and compare against `erf`.

## Capstone 3 — Conway's Game of Life

**Proves:** whole-array operations, `cshift` for periodic boundaries, `where`/`elsewhere`.

The eight-neighbor sum is just eight shifted copies of the grid added together — `cshift` handles wraparound with no boundary-condition code at all.

```fortran
! src/life.f90
module life
  implicit none
contains
  subroutine step(grid)
    integer, intent(inout) :: grid(:,:)
    integer :: n(size(grid,1), size(grid,2))
    n =   cshift(grid,  1, 1) + cshift(grid, -1, 1) &
        + cshift(grid,  1, 2) + cshift(grid, -1, 2) &
        + cshift(cshift(grid,  1, 1),  1, 2) &
        + cshift(cshift(grid, -1, 1),  1, 2) &
        + cshift(cshift(grid,  1, 1), -1, 2) &
        + cshift(cshift(grid, -1, 1), -1, 2)
    where (grid == 1)
      grid = merge(1, 0, n == 2 .or. n == 3)
    elsewhere
      grid = merge(1, 0, n == 3)
    end where
  end subroutine step
end module life
```

> **Pitfall:** `cshift(array, shift, dim)` shifts circularly along `dim`; `eoshift` is the end-off version for non-periodic (absorbing) boundaries.

**Practice**

- Seed a glider on a 30×30 grid and watch it walk.
- Switch to `eoshift` for absorbing boundaries and compare behavior.
- Render frames to a PPM image file instead of ASCII.

## Capstone 4 — Word-frequency counter

**Proves:** dynamic arrays, `move_alloc`, treating a derived-type array as a poor-man's map.

Fortran has no built-in hash map, but a linear-scanned array of `{word, count}` performs fine under a few thousand unique tokens.

```fortran
! src/wf.f90
module wf
  implicit none
  type :: entry
    character(len=32) :: word = ''
    integer :: count = 0
  end type entry
contains
  subroutine bump(map, n, w)
    type(entry), allocatable, intent(inout) :: map(:)
    integer, intent(inout) :: n
    character(len=*), intent(in) :: w
    integer :: i
    do i = 1, n
      if (map(i)%word == w) then
        map(i)%count = map(i)%count + 1
        return
      end if
    end do
    if (n == size(map)) call grow(map)
    n = n + 1
    map(n)%word = w
    map(n)%count = 1
  end subroutine bump

  subroutine grow(map)
    type(entry), allocatable, intent(inout) :: map(:)
    type(entry), allocatable :: tmp(:)
    integer :: m
    m = size(map)
    allocate(tmp(2*m))
    tmp(1:m) = map
    call move_alloc(from=tmp, to=map)
  end subroutine grow
end module wf
```

> **Pitfall:** `move_alloc` transfers an allocation without copying, leaving the source unallocated — the idiomatic way to grow a dynamic array in modern Fortran.

**Practice**

- Lower-case input before counting (so "The" and "the" merge).
- Sort the final map by descending count and print the top 10.
- Replace the linear scan with binary search after sorting alphabetically.

## Capstone 5 — 1-D heat equation solver

**Proves:** PDE discretization, explicit time-stepping, file output for plotting — and (below) parallelism.

`u_t = α u_xx` with Dirichlet boundaries, forward-time-centered-space (FTCS) stepping:

```fortran
! app/main.f90 (or src/heat.f90 exposing a `run` subroutine)
program heat
  use, intrinsic :: iso_fortran_env, only: real64
  implicit none
  integer, parameter :: nx = 101
  real(real64), parameter :: L = 1.0_real64, alpha = 0.01_real64
  real(real64) :: dx, dt, t, T_end
  real(real64) :: u(nx), u_new(nx)
  integer :: i, step, u_unit

  dx = L/(nx-1)
  dt = 0.4_real64*dx*dx/alpha   ! CFL-safe: stability needs dt <= 0.5*dx^2/alpha
  T_end = 0.5_real64
  u = 0.0_real64
  u(nx/2-2:nx/2+2) = 1.0_real64  ! initial pulse

  open(newunit=u_unit, file='heat.dat', status='replace', action='write')
  t = 0; step = 0
  do while (t < T_end)
    u_new(2:nx-1) = u(2:nx-1) + alpha*dt/dx**2 * &
         (u(3:nx) - 2.0_real64*u(2:nx-1) + u(1:nx-2))
    u_new(1) = 0.0_real64; u_new(nx) = 0.0_real64
    u = u_new
    t = t + dt; step = step + 1
    if (mod(step, 100) == 0) then
      do i = 1, nx
        write(u_unit, '(f8.4, 1x, f8.4, 1x, es12.4)') t, (i-1)*dx, u(i)
      end do
      write(u_unit, *)
    end if
  end do
  close(u_unit)
end program heat
```

Plot with `gnuplot`: `splot 'heat.dat' using 1:2:3 with lines`.

**Practice**

- Replace explicit Euler with implicit Crank–Nicolson.
- Promote to a 2-D grid (heat on a plate).
- Wrap the solver in a module and write a driver that varies `alpha`.

### Extension: parallelizing the solver with `do concurrent`

You built the update step above as a whole-array expression, which a good compiler can already vectorize. `do concurrent` makes the "no dependency between iterations" promise explicit and checkable, which is the standard's actual mechanism for licensing parallel execution — not just a stylistic alternative to a normal `do` loop.

```fortran
integer :: i
do concurrent (i = 2:nx-1)
  u_new(i) = u(i) + alpha*dt/dx**2 * (u(i+1) - 2.0_real64*u(i) + u(i-1))
end do
```

Inside a `do concurrent` block, the standard forbids anything that would create a dependency between iterations (no I/O, no calls to non-`pure` procedures, no branching out of the loop) — the compiler enforces this, so a `do concurrent` block that compiles is one the compiler has verified is safe to run in any order, including in parallel.

Whether that translates into actual multi-threaded execution, and which flag turns it on, is compiler- and version-specific — check your compiler's current documentation (for gfortran, look for `-ftree-parallelize-loops` and `do concurrent`-specific flags; the exact flag has changed across GCC releases, so this is worth verifying against the version you actually have installed rather than trusting a flag name memorized from an older guide). The syntax and the correctness guarantee are stable; the flag that unlocks the performance isn't, yet.

**Practice**

- Convert the whole solver's inner update to `do concurrent` and confirm the output is bit-identical to the whole-array version.
- Time the solver at a much larger `nx` (e.g. 10,001) with and without parallelization enabled.
- Read about `reduce()` locality specifiers (Fortran 2018) — you'd need one if you added a `do concurrent` loop that also computed a running sum, since a plain reduction across parallel iterations needs to tell the compiler how partial results combine.

## Capstone 6 — Reading and modernizing legacy Fortran

**Proves:** fixed-form literacy, recognizing pre-2003 idioms, safe refactoring — directly serves the "maintain" half of this guide's promise. Everything before this capstone taught you to *write* Fortran; this one teaches you to *read* the Fortran that's actually still running in production, which is older than anything else in this guide by design.

**Concept: fixed-form source, briefly**

Pre-1990 Fortran (and any file with a `.f`/`.for` extension today) uses fixed-form columns: columns 1–5 hold an optional statement label, column 6 holds a continuation marker (anything non-blank continues the previous line), columns 7–72 hold the statement itself, and `C` or `*` in column 1 marks a comment line. There's no `implicit none` convention — most legacy code relies on the default typing rule (names starting `i`–`n` are `integer`, everything else `real`) either deliberately or by omission.

**A representative fragment**

```fortran
C     COMPUTE AVERAGE OF N VALUES STORED IN COMMON BLOCK /DATA/
      SUBROUTINE AVG(RESULT)
      COMMON /DATA/ N, X(100)
      REAL RESULT, SUM
      INTEGER I
      SUM = 0.0
      I = 1
   10 IF (I .GT. N) GOTO 20
      SUM = SUM + X(I)
      I = I + 1
      GOTO 10
   20 RESULT = SUM / N
      RETURN
      END
```

Three idioms worth recognizing on sight:

| Idiom | What it does | Modern equivalent |
|---|---|---|
| `COMMON /DATA/ N, X(100)` | Shares `N` and `X` across every procedure that declares the same `COMMON` block, by memory position — no names need to match, only order and type. | Module-level data (or, better, explicit arguments) |
| `10 IF (...) GOTO 20` ... `GOTO 10` | Hand-rolled loop via labels and `GOTO` | `do` / `do while` |
| Bare `SUBROUTINE AVG(RESULT)`, no `IMPLICIT NONE` | Relies on default typing; every variable used must be checked against the `i`–`n` rule by eye | `implicit none` + explicit declarations |

Two more you'll meet in the wild but won't need to write: a **computed GOTO** (`GOTO (10,20,30), I` — jump to the label at position `I`, a crude multi-way branch; modern equivalent is `select case`) and an **arithmetic IF** (`IF (X) 10, 20, 30` — branch to the first, second, or third label depending on whether `X` is negative, zero, or positive; removed from the standard in Fortran 2018, but still compiled by most compilers as a legacy extension).

**Modernizing it**

A faithful but modern translation, keeping the global-state design as module data:

```fortran
module data_mod
  implicit none
  integer :: n
  real :: x(100)
contains
  pure real function avg() result(res)
    res = sum(x(1:n)) / n
  end function avg
end module data_mod
```

The more idiomatic modern version drops the global state entirely and passes what the function needs:

```fortran
module stats_legacy
  implicit none
contains
  pure real function avg(x, n)
    real, intent(in) :: x(:)
    integer, intent(in) :: n
    avg = sum(x(1:n)) / n
  end function avg
end module stats_legacy
```

> **Pitfall:** when modernizing real legacy code, resist doing this second step (removing `COMMON`) in the same pass as everything else. `COMMON` blocks are often shared across dozens of routines you haven't looked at yet — changing the data model is a separate, riskier step from translating syntax. Get the fixed-form → free-form, `GOTO` → structured-loop, `implicit none` translation compiling and passing the same outputs *first*, on its own, before touching the data architecture.

**Practice**

- Take the fragment above, translate it to free-form with `implicit none`, and verify it produces the same `avg` for a test array as the original would.
- Find (or write) a small example using a computed `GOTO` and rewrite it as `select case`.
- If you have access to any real legacy Fortran (a lot of it is on GitHub, tagged `.f`/`.for`), open one file and identify, without changing anything, every `COMMON` block, every label-based loop, and every place `implicit none` is absent. That reading exercise — before any rewriting — is most of what "maintain" actually means day to day.
