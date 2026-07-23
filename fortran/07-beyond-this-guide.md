# Module 7 — Beyond This Guide

Every topic here failed the capstone-impact test (Module 0 overview) — none of them change how a capstone in Module 6 turns out, and none are required by an exercise you've been assigned. That's a scoping decision, not an oversight: each entry tells you what it is, why it matters, and where to go deeper when you actually need it.

### C interoperability (`iso_c_binding`)

**What it is:** the standard, portable mechanism for calling C functions from Fortran (and vice versa), using `bind(c)` interfaces and C-compatible kinds (`c_int`, `c_double`, ...).

**Why it matters:** most Fortran today doesn't run in isolation — it gets called from Python (via `f2py`, `ctypes`, or a C shim), or it calls into C libraries (BLAS/LAPACK, image/IO libraries) that have no Fortran-native equivalent.

**Minimal taste:**

```fortran
module c_interop
  use, intrinsic :: iso_c_binding, only: c_double
  implicit none
  interface
    function c_sqrt(x) bind(c, name="sqrt") result(y)
      import :: c_double
      real(c_double), value :: x
      real(c_double) :: y
    end function c_sqrt
  end interface
end module c_interop
```

**Where to go next:** the [Fortran-lang interoperability guide](https://fortran-lang.org/learn/interop/), and the `bind(c)` chapter of *Modern Fortran Explained*.

### Object orientation: type-bound procedures & polymorphism

**What it is:** attaching procedures to a derived type (`procedure :: area => circle_area`) and dispatching on run-time type via `class` (rather than `type`) dummy arguments — Fortran's answer to methods and inheritance.

**Why it matters:** genuinely useful once you're modeling a family of related types (different element types in a finite-element mesh, different equation-of-state models) that share an interface but differ in implementation. None of this guide's capstones needed it — the ones with structured data (Capstones 1 and 4) were well served by plain derived types plus module procedures.

**Minimal taste:**

```fortran
type :: circle
  real :: r
contains
  procedure :: area => circle_area
end type circle
contains
  function circle_area(this) result(a)
    class(circle), intent(in) :: this
    real :: a
    a = acos(-1.0)*this%r**2
  end function circle_area
end
! usage: a = c%area()
```

**Where to go next:** the "Object-oriented programming" chapter of the Fortran-lang Mini-Book at fortran-lang.org/learn.

### Distributed parallelism: coarrays and MPI

**What it is:** `do concurrent` (Module 6) parallelizes work *within* one shared-memory process. Coarrays (`real :: x[*]`, native to the language since Fortran 2008) and MPI (a library, used from Fortran exactly as from C/C++) parallelize across separate processes/machines — the model most real HPC clusters actually run.

**Why it matters:** the heat solver in Module 6 stays small enough to run on one machine. A production-scale version — a bigger grid, a 3-D domain, a longer simulated time — is exactly the kind of problem that stops fitting on one machine, which is Fortran's original and still-dominant use case.

**Where to go next:** the [Fortran-lang parallel programming guide](https://fortran-lang.org/learn/best_practices/) for coarrays; the MPI Forum's Fortran bindings docs for MPI.

### IEEE floating-point control (`ieee_arithmetic`)

**What it is:** the intrinsic module giving fine control over floating-point behavior — testing for NaN/Inf explicitly (`ieee_is_nan`, `ieee_is_finite`), controlling rounding modes, trapping floating-point exceptions instead of silently propagating them.

**Why it matters:** Module 3's `count(.not. (v == v))` NaN-detection trick works, but `ieee_is_nan(v)` says what it means. Worth knowing exists once you're debugging numerical code that's producing NaNs from somewhere you can't immediately see.

### The wider ecosystem

- **[stdlib](https://stdlib.fortran-lang.org/)** — the community standard library: sorting, statistics, linear algebra, string handling, logging — much of what Capstones 1 and 4 built by hand, already written and tested.
- **[fpm registry](https://fpm.fortran-lang.org/packages.html)** — browsable list of `fpm` packages, referenced briefly in Module 4.
- **LAPACK/BLAS** — the numerical-linear-algebra libraries underneath most of scientific computing, callable directly from Fortran (they're written in Fortran).
- **[Fortran Discourse](https://fortran-lang.discourse.group/)** — active community, good place to check a "does this actually work the way I think" question against people who compile this for a living.
