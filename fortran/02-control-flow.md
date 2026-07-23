# Module 2 — Control Flow

Conditionals, loops, `select case`, and the two behaviors of Fortran boolean operators that surprise people coming from C-family languages. Feeds Capstones 1–5 (every capstone branches and loops).

## if / else if / else

**You'll be able to:** write block-form `if` constructs; combine relational/logical operators in conditions; use single-line `if` for one-statement conditionals.

**Concept**

Block form: `if (cond) then ... else if (cond) then ... else ... end if`. The single-statement form omits `then`/`end if` and allows exactly one statement.

**Example**

```fortran
program grade
  implicit none
  real :: score
  read *, score
  if (score >= 85.0) then
    print *, 'High distinction'
  else if (score >= 75.0) then
    print *, 'Distinction'
  else if (score >= 50.0) then
    print *, 'Pass'
  else
    print *, 'Fail'
  end if
end program grade
```

> **Pitfall:** floating-point equality is fragile. Prefer `abs(a - b) < tol` over `a == b`.

**Practice**

- Add a tier above 95 ("Exceptional").
- Rewrite the fail case as a single-line `if`.
- Validate the score lies in `[0, 100]` before classifying it.

## The non-short-circuit trap

**You'll be able to:** write conditions that stay safe even though Fortran doesn't guarantee short-circuit evaluation.

**Concept**

Unlike C's `&&`/`||` or Python's `and`/`or`, Fortran's `.and.` and `.or.` are **not guaranteed to short-circuit** — a compiler is permitted to evaluate both operands regardless of whether the first already determines the result. Code that relies on the first condition "protecting" the second (`if (j >= 1 .and. a(j) > k)` intending "only check `a(j)` when `j` is in bounds") is not guaranteed safe, even though it often *happens* to work with a given compiler and optimization level.

**Example**

```fortran
program guard_demo
  implicit none
  integer :: j
  real :: a(5) = [1.0, 2.0, 3.0, 4.0, 5.0]
  j = 0
  ! UNSAFE in the general case: a compiler is allowed to evaluate a(j) even
  ! when j >= 1 is false, and a(0) is out of bounds.
  ! if (j >= 1 .and. a(j) > 3.0) print *, 'match'

  ! SAFE: guard the index itself so the out-of-range access can never occur,
  ! regardless of evaluation order.
  if (j >= 1) then
    if (a(j) > 3.0) print *, 'match'
  end if
end program guard_demo
```

> **Pitfall:** this is exactly the defensive pattern the Statistics CLI capstone (Module 6) relies on in its sort routine — it guards an array index with `max(j,1)` rather than trusting `.and.` to short-circuit. Recognising this pattern here means it won't look like unexplained cleverness when you meet it again.

**Practice**

- Rewrite a chained `.and.` condition that indexes an array as nested `if` blocks instead.
- Look up whether your compiler happens to short-circuit at `-O0` vs `-O2` — the point isn't the answer, it's that the standard doesn't promise one.

## do loops & loop control

**You'll be able to:** write counted `do i = 1, n, step` loops; skip/break with `cycle`/`exit`; name loops to disambiguate nesting.

**Concept**

A counted loop runs while the index satisfies its bound. `cycle` jumps to the next iteration; `exit` leaves the loop. Naming a loop (`outer: do ...`) lets inner code target it precisely: `exit outer`.

**Example**

```fortran
program loops
  implicit none
  integer :: i, j, total
  total = 0
  outer: do i = 1, 10
    inner: do j = 1, 10
      if (j == 5) cycle inner
      if (i*j > 30) exit outer
      total = total + i*j
    end do inner
  end do outer
  print *, 'total =', total
end program loops
```

> **Pitfall:** modifying a counted loop's index inside the loop body is non-conforming — compiler behavior is undefined. Use an unbounded `do` with explicit `exit` if you need to control the index yourself.

**Practice**

- Sum 1 to 100 and verify against 5050.
- Print the first prime greater than 1000 using a labelled `exit`.
- Step backwards from 20 to 1 in steps of 2.

## do while & unbounded loops

**You'll be able to:** loop until a condition becomes false; use an unbounded `do` with an internal `exit` for convergence loops; always cap iteration counts.

**Concept**

`do while (cond)` tests before each iteration. For a bottom-tested loop, use an unbounded `do` with `exit`.

**Example**

```fortran
program newton
  use, intrinsic :: iso_fortran_env, only: real64
  implicit none
  real(real64) :: x, target_, dx
  integer :: it
  target_ = 2.0_real64
  x = 1.0_real64
  it = 0
  do
    it = it + 1
    dx = 0.5_real64*(target_/x - x)
    x = x + dx
    if (abs(dx) < 1.0e-15_real64) exit
    if (it > 100) exit   ! safety cap
  end do
  print '(a, f20.16, a, i0, a)', 'sqrt(2) ~ ', x, ' in ', it, ' iters'
end program newton
```

> **Pitfall:** always cap convergence loops with an iteration limit. Floating-point edge cases can stall an iteration that should mathematically terminate.

**Practice**

- Compute `sqrt(10)` with the same loop pattern; how many iterations does it take?
- Add a running count of floating-point operations (a rough estimate).
- Rewrite the loop in `do while` form.

## select case

**You'll be able to:** branch on integer/character/logical values; use ranges and lists in selectors; provide a `case default`.

**Concept**

`select case (expr)` dispatches on `expr`'s value. Selectors can be single values, lists, or ranges (`1:5`, `:0`, `10:`). Selectors must be **constant** integer, character, or logical — `select case` cannot dispatch on `real` values; use chained `else if` for that.

**Example**

```fortran
program weekday
  implicit none
  integer :: d
  read *, d
  select case (d)
  case (1, 7)
    print *, 'Weekend'
  case (2:6)
    print *, 'Weekday'
  case default
    print *, 'Invalid day'
  end select
end program weekday
```

**Practice**

- Map a 1–12 month index to its name.
- Categorise an integer as negative/zero/positive using ranges.
- Dispatch on a one-letter command using a `character` selector.

## Putting it together: a small calculator

**You'll be able to:** combine loops, conditionals, and `select case`; validate input and report errors gracefully.

**Concept**

A small interactive calculator: read a command character and two operands, perform the operation, loop until the user enters `q`.

**Example**

```fortran
program calc
  use, intrinsic :: iso_fortran_env, only: real64
  implicit none
  character :: op
  real(real64) :: a, b
  do
    write(*,'(a)', advance='no') 'op a b (q to quit) > '
    read(*,*) op
    if (op == 'q') exit
    read(*,*) a, b
    select case (op)
    case ('+'); print *, a + b
    case ('-'); print *, a - b
    case ('*'); print *, a * b
    case ('/')
      if (abs(b) < tiny(b)) then
        print *, 'error: divide by zero'
      else
        print *, a / b
      end if
    case default
      print *, 'unknown op: ', op
    end select
  end do
end program calc
```

> **Pitfall:** `tiny(x)` returns the smallest positive normalised real of `x`'s kind — a more principled divide-by-zero guard than an arbitrary literal threshold.

**Practice**

- Add a `'^'` case for exponentiation.
- Track and print a running history of operations.
- Refactor each operation into its own internal subroutine (you'll have the tools for this after Module 4).

## Progress check

1. What does `cycle` do, and how does it differ from `exit`?
2. Write a `select case` printing "low" for 1–3, "mid" for 4–6, "high" otherwise.
3. Why is `if (a == b) then` risky when `a` and `b` are reals?
4. Why can't you trust `if (j >= 1 .and. a(j) > 0)` to protect against an out-of-bounds `a(j)` when `j` is `0`?
5. Show an unbounded `do` loop with two exits: convergence and a safety cap.
6. Can `select case` branch on `real` numbers?
7. What does `do i = 5, 1` (no explicit step) do?
8. Why should you avoid modifying a counted loop's index inside its body?

### Answers

1. `cycle` jumps to the next iteration of the enclosing (or named) loop; `exit` leaves it entirely.
2. `select case (n); case (1:3); print *, 'low'; case (4:6); print *, 'mid'; case default; print *, 'high'; end select`
3. Floating-point arithmetic introduces rounding; values that are mathematically equal often differ in their last bits. Use a tolerance: `abs(a-b) < tol`.
4. Fortran's `.and.` doesn't guarantee short-circuit evaluation — a conforming compiler may evaluate `a(j)` even when `j >= 1` is false. Guard with a nested `if` instead.
5. `do; it = it + 1; if (converged) exit; if (it > 100) exit; end do`
6. No — the selector must be integer, character, or logical, with constant `case` values.
7. Zero iterations. The default step is `+1`; with `start > stop` the loop body never executes.
8. It's non-conforming and compiler behavior is undefined — use an unbounded `do` with explicit `exit` if the index needs manual control.
