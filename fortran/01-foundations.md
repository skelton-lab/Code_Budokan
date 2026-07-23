# Module 1 — Foundations

By the end of this module you can write, compile, and run small Fortran programs that read input, do arithmetic in the right kinds, handle strings, read command-line arguments, and print results. `implicit none` is non-negotiable from the first line you type. Feeds Capstones 1–5.

## Hello world & program structure

**You'll be able to:** compile and run a program with gfortran; name the required pieces of a program unit; explain why `implicit none` matters.

**Concept**

A Fortran program is a sequence of program units; the simplest is `program ... end program`. Modern (free-form) Fortran allows lines up to 132 characters, statements end at the line break, and `!` starts a comment.

Without `implicit none`, Fortran silently types undeclared names starting `i`–`n` as `integer` and everything else as `real`. This is a real, still-live footgun — always disable it.

**Example**

```fortran
program hello
  implicit none
  print *, 'Hello, Fortran!'
end program hello
```

> **Pitfall:** file extension matters. `.f90`/`.f08` mean free-form source. The legacy `.f` extension switches gfortran to fixed-form (column-sensitive) parsing and modern code written in that style will not compile. (You'll meet real fixed-form code in the legacy-modernization capstone, Module 6 — this is why the distinction matters beyond a compiler quirk.)

**Practice**

- Compile with `-std=f2008 -Wall` and confirm zero warnings.
- Add a second `print` line and rebuild.
- Remove `implicit none`, introduce a typo like `prnt`, and compare the error message with and without it.

## Variables, declarations & assignment

**You'll be able to:** declare `integer`/`real`/`logical` variables; distinguish initialisation from assignment; use `parameter` for compile-time constants.

**Concept**

Declare with `type :: name`. The double colon is optional for plain declarations but required once you add attributes (`parameter`, `dimension`, `intent`). `parameter` creates a named compile-time constant — always prefer it to a magic number.

**Example**

```fortran
program vars
  implicit none
  integer :: count = 0
  real :: radius, area
  real, parameter :: pi = 3.1415927

  radius = 2.5
  area = pi * radius**2
  count = count + 1
  print *, 'area =', area, ' iter=', count
end program vars
```

> **Pitfall:** initialising in a declaration (`integer :: count = 0`) implicitly gives the variable the `save` attribute *inside procedures* — its value persists between calls. Harmless in a plain `program` block; a real surprise once you write procedures in Module 4.
>
> **Pitfall:** `pi` here uses a plain literal, matching `real`'s default (single) precision — kinds haven't been introduced yet (next session). Writing `3.141592653589793_8` here compiles, but triggers a `-Wconversion` warning under the exact `-Wall -Wextra` flags this guide tells you to build with, because it narrows a double-precision literal into a single-precision variable. You'll get the fully-precise, kind-correct version of `pi` once `real(real64)` is introduced next.

**Practice**

- Compute the volume of a sphere with `r = 3.0`.
- Declare `logical :: done = .false.` and toggle it.
- Replace `pi` with a bare literal and be able to say, precisely, why `parameter` is better.

## Intrinsic data types & kind parameters

**You'll be able to:** choose between default and explicit numeric kinds; use `iso_fortran_env` for portable kinds; recognise `complex` and `character` types.

**Concept**

Every numeric type carries a kind integer selecting its precision. Hard-coded kinds like `real(8)` are compiler-specific, not portable. The standard `iso_fortran_env` module gives you `int32`, `int64`, `real32`, `real64`, `real128`. Literals carry their kind with a trailing underscore: `1.0_real64`, `42_int64`.

**Example**

```fortran
program kinds_demo
  use, intrinsic :: iso_fortran_env, only: real64, int64
  implicit none
  real(real64) :: x
  integer(int64) :: big
  complex :: z
  character(len=20) :: name

  x = 1.0_real64 / 7.0_real64
  big = 9000000000_int64
  z = (1.0, 2.0)
  name = 'Ada Lovelace'
  print '(a, f22.16)', '1/7 =', x
  print *, 'big =', big, ' |z|=', abs(z), ' name=', trim(name)
end program kinds_demo
```

> **Pitfall:** mixing kinds in arithmetic triggers implicit conversion. Promote the smaller kind explicitly (`real(x, real64)`) rather than letting the compiler decide.

**Practice**

- Print `huge(1_int32)` and `huge(1_int64)`.
- Declare a `real(real128)` variable, compute `1.0/3.0`, and compare against the `real64` result.
- Build a `complex` number from two reals and print its modulus (`abs`) and argument (`atan2` on the real/imaginary parts, or `atan2(aimag(z), real(z))`).

## Operators, expressions & intrinsic functions

**You'll be able to:** apply arithmetic/relational/logical operators correctly; use `sqrt`, `sin`, `mod`, `abs`; state operator precedence for unary minus vs. `**`.

**Concept**

Arithmetic: `+ - * / **`. `**` binds tighter than unary minus, so `-2**2` evaluates to `-4`, not `4`. Relational operators have two equivalent spellings: `== /= < <= > >=` or `.eq. .ne. .lt. .le. .gt. .ge.` — pick one style and stay consistent. Logical: `.and. .or. .not. .eqv. .neqv.`.

**Example**

```fortran
program math_demo
  implicit none
  real :: a = 9.0, b = 4.0
  print *, 'sqrt(a)          =', sqrt(a)
  print *, 'a mod b          =', mod(a, b)
  print *, 'sin(pi/2)        =', sin(2.0*atan(1.0))
  print *, 'a > b .and. b>0  =', (a > b) .and. (b > 0.0)
  print *, '-2**2            =', -2**2   ! evaluates to -4
end program math_demo
```

> **Pitfall:** integer division truncates — `7 / 2` is `3`, not `3.5`. Promote one operand: `real(7) / 2`.

**Practice**

- Compare `mod` and `modulo` on negative numbers and be able to state the difference.
- Compute the hypotenuse of a 3–4 right triangle with `hypot`.
- Evaluate `(.true. .neqv. .false.) .and. .true.` by hand, then verify.

## String handling essentials

**You'll be able to:** trim and justify fixed-length character variables; find and test substrings without a regex library.

**Concept**

Character variables in Fortran have a fixed declared length (`character(len=40) :: name`), padded with trailing blanks. `trim` strips trailing blanks for output; `len` reports the declared length (blanks included), `len_trim` the length without them. `adjustl`/`adjustr` shift content to the left/right edge of the fixed-width field, moving blanks to the other end. `index(string, substring)` finds a substring's position (`0` if absent); `scan(string, set)` finds the first character that *is* in `set`; `verify(string, set)` finds the first character that is *not* in `set` (a common idiom for validating input against an allowed-character set).

**Example**

```fortran
program strings_demo
  implicit none
  character(len=20) :: name
  character(len=30) :: line
  name = '  Ada  '
  line = 'temperature=98.6'

  print '(a, i0, a, i0)', 'len=', len(name), ' len_trim=', len_trim(name)
  print '(a, a, a)', '[', trim(adjustl(name)), ']'
  print '(a, i0)', 'position of "=" -> ', index(line, '=')
  print '(a, i0)', 'first digit at  -> ', scan(line, '0123456789')
  print '(a, i0)', 'first non-alpha -> ', verify(line, &
       'abcdefghijklmnopqrstuvwxyz')
end program strings_demo
```

> **Pitfall:** `character(len=*)` (unbounded length, "take whatever's passed in") only works as a *dummy argument* in a procedure — never in a local variable declaration. You'll use it properly once procedures arrive in Module 4.

**Practice**

- Split `'key=value'` into two trimmed strings using `index`.
- Write a function that reports whether a string is entirely digits, using `verify`.
- Right-justify a name into a fixed 10-character field for a report column.

## Command-line arguments

**You'll be able to:** read arguments passed to your compiled program on the command line.

**Concept**

`command_argument_count()` returns how many arguments were passed (not counting the program name). `call get_command_argument(n, value, length, status)` retrieves argument `n` (1-based); `n = 0` retrieves the program's own invocation name. `status` is `0` on success, positive if the value's buffer was too short.

**Example**

```fortran
program args_demo
  implicit none
  integer :: i, n, arg_len, stat
  character(len=256) :: arg

  n = command_argument_count()
  print '(a, i0)', 'argument count = ', n
  do i = 1, n
    call get_command_argument(i, arg, arg_len, stat)
    if (stat /= 0) then
      print '(a, i0)', 'could not read argument ', i
      cycle
    end if
    print '(a, i0, a, a)', 'arg(', i, ') = ', trim(arg)
  end do
end program args_demo
```

Run it as `./args_demo alpha beta` and you'll see both arguments echoed back.

> **Pitfall:** the `value` buffer has a fixed declared length. A silently truncated argument (rather than an error) is possible if you don't check `length`/`status` against your buffer size — this is the kind of thing that passes every test with short arguments and breaks in production with a long file path.

**Practice**

- Write a program that exits with an error message if no arguments were given.
- Read a filename from argument 1 and open it (you'll build on this in Module 5).
- Use `get_command()` (no argument-splitting) to print the whole invocation line as one string.

## I/O essentials: read, print, write

**You'll be able to:** read from standard input; use list-directed and formatted output; explain when to use `write` over `print`.

**Concept**

`print *, ...` writes to standard output with default list formatting. `read *, ...` reads from standard input. `write(unit, fmt) ...` is the general form, needed once you care about a specific unit or format. Use the predefined units `output_unit`, `input_unit`, `error_unit` from `iso_fortran_env` rather than the historic (compiler-convention, not standard-guaranteed) unit numbers `5` and `6`.

**Example**

```fortran
program io_demo
  use, intrinsic :: iso_fortran_env, only: output_unit, error_unit
  implicit none
  character(len=40) :: name
  integer :: age

  write(output_unit, '(a)', advance='no') 'Name? '
  read(*, '(a)') name
  write(output_unit, '(a)', advance='no') 'Age? '
  read(*, *) age

  write(output_unit, '(a, a, a, i0, a)') &
       'Hello ', trim(name), ', you are ', age, ' years old.'
  if (age < 0) write(error_unit, '(a)') 'Warning: negative age.'
end program io_demo
```

> **Pitfall:** `advance='no'` keeps the cursor on the same line, useful for prompts. `i0` prints an integer at minimum width — the standard choice for clean log lines instead of guessing a fixed width.

**Practice**

- Read three reals and print their mean.
- Pipe a small text file in with `./prog < data.txt`.
- Send a warning to `error_unit` and confirm it still appears when stdout is redirected.

## Progress check

1. What does `implicit none` do, and why include it in every program unit?
2. Show the difference between `real(8)` and `real(real64)`. Which is portable?
3. What is `7 / 2` in Fortran, and how do you get `3.5`?
4. Name the operators that mean "not equal" in Fortran, symbolic and keyword form.
5. How do you create a compile-time constant for π at full machine precision?
6. Why use `output_unit` instead of writing to unit `6`?
7. What's wrong with `integer :: i, j = 0`?
8. Given `character(len=10) :: s = '  hi  '`, what does `len_trim(s)` return, and how does that differ from `len(s)`?
9. Write the call that reads command-line argument 2 into a `character(len=100)` variable and reports whether it succeeded.

### Answers

1. Disables Fortran's default implicit-typing rule (names starting `i`–`n` become `integer`, others `real`). Forcing every variable to be declared catches typos and unintended kinds at compile time.
2. `real(8)` is a literal kind value — compiler-specific and not guaranteed portable. `real(real64)` names a portable constant from `iso_fortran_env`, guaranteed by the standard to be a real kind with (at least) IEEE double precision where available. `real(real64)` is the portable one.
3. `3` (integer division truncates). Use `real(7)/2` or `7.0/2.0` for `3.5`.
4. `/=` and `.ne.` — two spellings of one operator, not four.
5. `real(real64), parameter :: pi = acos(-1.0_real64)` — `parameter` marks it compile-time; `acos(-1)` gives full precision for the chosen kind.
6. Unit `6` is a historical convention, not a standard guarantee. `output_unit` is portable and self-documenting.
7. Only `j` is initialised; `i` is undefined. And inside a procedure, `j` would implicitly gain the `save` attribute — a common source of "why does this still have last call's value" bugs.
8. `len(s)` always returns the declared length: `10`. Assigning the 6-character literal `'  hi  '` into a length-10 variable right-pads it with blanks, giving content `'  hi'` followed by six trailing blanks (positions 5–10). `len_trim` strips only *trailing* blanks — leading blanks are content, not trimmed — so `len_trim(s)` returns `4`, the position of the last non-blank character (`'i'`).
9. ```fortran
   character(len=100) :: val
   integer :: ln, stat
   call get_command_argument(2, val, ln, stat)
   if (stat == 0) then
     print *, 'ok: ', trim(val)
   else
     print *, 'failed to read argument 2'
   end if
   ```
