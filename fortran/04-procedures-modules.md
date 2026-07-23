# Module 4 — Procedures, Modules, and Project Structure

Procedures are how Fortran code scales; modules are how it stays organized; `fpm` is how a real project stops being a pile of loose `.f90` files. Feeds every remaining capstone.

## Subroutines & functions

**You'll be able to:** define `subroutine`/`function` procedures; pass arguments and return values; use a `contains` section.

**Concept**

A `subroutine` is called for its side effects and returns nothing; a `function` returns a value through its name (or a `result` clause). Internal procedures inside `contains` see the host's variables and are the simplest way to start.

**Example**

```fortran
program proc_demo
  implicit none
  print *, 'square(7) =', square(7)
  call greet('Alex')
contains
  pure integer function square(n)
    integer, intent(in) :: n
    square = n*n
  end function square

  subroutine greet(name)
    character(len=*), intent(in) :: name
    print '(a, a)', 'hello, ', trim(name)
  end subroutine greet
end program proc_demo
```

> **Pitfall:** `character(len=*)` as a dummy argument ("take whatever length is passed in") only works for dummy arguments — never for a local declaration, as noted back in Module 1.

**Practice**

- Write `cube(x)` returning `x**3`.
- Add `swap(a, b)` that swaps two reals.
- Add a `result` clause: `function f(x) result(y)`.

## Intent, optional & keyword arguments

**You'll be able to:** annotate dummy arguments with `intent`; make trailing arguments `optional`; call with keywords for clarity.

**Concept**

`intent(in)` — read-only. `intent(out)` — must be assigned before use; reading it first is a compile error. `intent(inout)` — both. `optional` arguments may be omitted; check with `present(name)`.

**Example**

```fortran
module rectangles
  implicit none
contains
  subroutine area(w, h, a, label)
    real, intent(in) :: w, h
    real, intent(out) :: a
    character(len=*), intent(in), optional :: label
    a = w*h
    if (present(label)) print '(a, a, f10.4)', trim(label), ' = ', a
  end subroutine area
end module rectangles

program use_rect
  use rectangles
  implicit none
  real :: a
  call area(3.0, 4.0, a)
  call area(w=2.0, h=5.0, a=a, label='room')
  print *, 'last area =', a
end program use_rect
```

> **Pitfall:** always declare `intent`. It costs seconds and pays back the first time you (or a reviewer) try to read from an `intent(out)` argument before it's assigned — the compiler catches it immediately.
>
> **Pitfall:** `area` above is *not* marked `pure`, on purpose — it does I/O (the optional `print`), and `pure` procedures are forbidden from performing I/O. It's an easy mistake to mark something `pure` reflexively because it "feels" side-effect-free while forgetting a conditional debug/label print buried inside it; the compiler will refuse the combination outright, which is exactly the kind of thing worth hitting once here rather than discovering it mid-capstone.

**Practice**

- Add an `optional` `scale` argument to a function.
- Call a procedure using only keyword arguments.
- Demonstrate that `intent(in)` blocks accidental modification (try assigning to it and read the compiler error).

## Modules & explicit interfaces

**You'll be able to:** group procedures/constants in a module; control visibility with `private`/`public`; get automatic interface checking via `use`.

**Concept**

A module is Fortran's unit of reuse. Procedures inside a module get an explicit interface for free wherever they're `use`d, so mismatched arguments become compile errors instead of runtime corruption. Mark a module `private` by default and `public` the names you actually want to export.

**Example**

```fortran
module geometry
  use, intrinsic :: iso_fortran_env, only: real64
  implicit none
  private
  public :: pi, circle_area

  real(real64), parameter :: pi = acos(-1.0_real64)
contains
  pure real(real64) function circle_area(r) result(a)
    real(real64), intent(in) :: r
    a = pi*r*r
  end function circle_area
end module geometry

program use_geom
  use geometry, only: circle_area
  use, intrinsic :: iso_fortran_env, only: real64
  implicit none
  print '(f12.6)', circle_area(2.0_real64)
end program use_geom
```

> **Pitfall:** always import with `only:`. A bare `use mymod` dumps every public name into your scope and creates hard-to-diagnose conflicts as the module grows.

**Practice**

- Add `sphere_volume` and export it.
- Move the program into a separate file and compile both with `gfortran a.f90 b.f90` — then see the `fpm` session below for how you'd actually structure this.
- Make `pi` private and read the resulting compile error in the calling program.

## Organizing a project with fpm

**You'll be able to:** lay out a multi-file Fortran project the way the ecosystem actually does it, and build/run/test it with one tool instead of hand-assembled `gfortran` command lines.

**Concept**

Raw `gfortran a.f90 b.f90 -o prog` stops scaling the moment you have more than a couple of files, or want a dependency, or want tests. [`fpm`](https://fpm.fortran-lang.org/) (Fortran Package Manager) is the community-standard build tool: a `fpm.toml` manifest plus a conventional directory layout.

```
myproject/
  fpm.toml
  app/
    main.f90        ! the program (uses the library modules below)
  src/
    geometry.f90     ! library modules — this is what other code (and tests) `use`
  test/
    test_geometry.f90
```

```toml
# fpm.toml
name = "myproject"
version = "0.1.0"
```

```bash
fpm new myproject     # scaffolds the layout above
fpm build              # compiles everything
fpm run                # builds and runs app/main.f90
fpm test                # builds and runs everything under test/
```

Anything you put in `src/` as a module is automatically visible to both `app/` and `test/` — no manual multi-file compile lines, no manually tracking which `.f90` depends on which.

> **Pitfall:** the *reason* to split code into `src/` (library modules) vs. `app/` (the thin program that calls them) is exactly what Module 5's data-pipeline example already teaches informally — a loader module you can call from a test driver without running the whole program. `fpm`'s `test/` directory just formalizes that pattern instead of leaving it as a convention you remember by hand.

**Practice**

- Scaffold a new `fpm` project and move the `geometry` module from the previous session into `src/`.
- Write `app/main.f90` that `use`s it and calls `circle_area`.
- Add a `[dependencies]` section referencing a real package from the [fpm registry](https://fpm.fortran-lang.org/packages.html) (browse it — you don't need to actually use one yet) so you've seen the syntax before you need it.

## pure, elemental & recursive procedures

**You'll be able to:** mark side-effect-free procedures `pure`; write `elemental` procedures that work on scalars or arrays uniformly; write `recursive` procedures.

**Concept**

`pure` guarantees no I/O, no global-state mutation, no `stop` — the compiler can optimize more aggressively, and a `pure` procedure can safely be called from inside another `pure` procedure or a `do concurrent` block (Module 6). `elemental` implies `pure` and additionally lets the procedure accept a conformable array, applying itself elementwise. Recursive procedures need the `recursive` keyword and a `result` clause.

**Example**

```fortran
module calc
  implicit none
contains
  elemental real function celsius_to_f(c)
    real, intent(in) :: c
    celsius_to_f = c*9.0/5.0 + 32.0
  end function celsius_to_f

  recursive integer function fact(n) result(f)
    integer, intent(in) :: n
    if (n <= 1) then
      f = 1
    else
      f = n*fact(n-1)
    end if
  end function fact
end module calc

program demo
  use calc
  implicit none
  real :: temps(4) = [0.0, 20.0, 37.0, 100.0]
  print *, celsius_to_f(temps)   ! elemental over the whole array
  print *, 'fact(10) =', fact(10)
end program demo
```

> **Pitfall:** recursion is convenient but not free — deep recursion consumes stack. For deep recursion, convert to iteration or an explicit accumulator.

**Practice**

- Make `square` from the first session `elemental` and call it on a 5-vector.
- Write a recursive Fibonacci function and time it against an iterative version at `n=35`.
- Confirm (by trying to add a `print` statement) that an `elemental` procedure can't perform I/O.

## Procedures with array arguments

**You'll be able to:** pass assumed-shape arrays with `(:)`; query shape inside a procedure; return arrays from functions.

**Concept**

Assumed-shape dummies (`real :: a(:)`) carry their shape with them and require an explicit interface — one more reason procedures belong in modules. Functions can return arrays of any rank; combine with `allocatable` for size-dependent results.

**Example**

```fortran
module stats
  implicit none
contains
  pure real function mean(x)
    real, intent(in) :: x(:)
    mean = sum(x) / max(1, size(x))
  end function mean

  pure function centred(x) result(y)
    real, intent(in) :: x(:)
    real, allocatable :: y(:)
    y = x - mean(x)
  end function centred
end module stats

program demo
  use stats
  implicit none
  real :: v(5) = [1.0, 2.0, 3.0, 4.0, 5.0]
  print *, 'mean =', mean(v)
  print *, 'centred =', centred(v)
end program demo
```

> **Pitfall:** allocatable function results are auto-deallocated by the runtime once the expression consuming them finishes — usually safer than returning a pointer.

**Practice**

- Write `variance(x)` as a `pure` function.
- Write a function returning a 2-D array of size `n×n`.
- Pass a 2-D array slice `a(:, 2:5)` to a procedure expecting `(:,:)`.

## Progress check

1. Why prefer module procedures over external (non-module) procedures?
2. What does `intent(out)` guarantee, and what happens if you read it before assigning?
3. How do you call `area(w, h, a, label)` passing only `label` and everything else positionally out of order?
4. Difference between `pure` and `elemental`?
5. Why is `use mymod, only:` recommended over a bare `use mymod`?
6. What does `fpm test` actually do, and where does it look for tests?
7. What is an assumed-shape dummy argument, and why does it require an explicit interface?
8. Show how to return an allocatable 1-D array from a function.

### Answers

1. Modules give every caller an explicit interface automatically, so the compiler checks argument types, ranks, and `intent` at compile time. External procedures need a hand-written interface block to get the same checking, and it's easy to let it drift out of sync.
2. The argument is undefined on entry and must be assigned before being read; reading an `intent(out)` argument before assignment is a compile-time error, not a runtime surprise.
3. You can't mix "only label out of order" with positional arguments for the others — once you use a keyword for one argument that isn't the last positional one, every argument after it must also be keyworded (and typically it's simplest to keyword all of them): `call area(w=2.0, h=3.0, a=a, label='x')`.
4. `pure` forbids side effects (I/O, global mutation, `stop`). `elemental` is `pure` plus the ability to be called on a conformable array, applied elementwise.
5. It limits imports to the names actually needed, avoiding namespace clutter and accidental shadowing as a module grows.
6. It builds and runs every program under the project's `test/` directory, treating each as a self-contained check (typically using nonzero exit / `error stop` to signal failure).
7. A dummy declared as `x(:)` takes its shape from whatever actual argument is passed. Combined with an explicit interface (i.e., living in a module), this eliminates having to pass dimensions as separate arguments.
8. ```fortran
   function f(n) result(y)
     integer, intent(in) :: n
     real, allocatable :: y(:)
     allocate(y(n))
     y = 0.0
   end function f
   ```
