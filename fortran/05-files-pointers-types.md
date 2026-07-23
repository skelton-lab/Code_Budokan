# Module 5 — Files, Pointers, and Derived Types

Persistent data, structured records, and the small set of pointer features modern Fortran legitimately needs. This module also teaches operator overloading — flagged in the source material as an exercise that was assigned without ever being taught, which is exactly the kind of gap this guide's methodology exists to catch. Feeds Capstones 1, 4, 5, 6.

## File I/O: open, read, write, close

**You'll be able to:** open files for sequential read/write; handle errors with `iostat`; loop to end-of-file.

**Concept**

`open(newunit=u, ...)` (Fortran 2008+) lets the runtime pick a free unit number — safer than hard-coding one. `iostat` returns `0` on success, positive on error, negative at end-of-file.

**Example**

```fortran
program file_demo
  implicit none
  integer :: u, ios
  character(len=200) :: line
  open(newunit=u, file='input.txt', status='old', action='read', iostat=ios)
  if (ios /= 0) stop 'cannot open input.txt'
  do
    read(u, '(a)', iostat=ios) line
    if (ios < 0) exit          ! EOF
    if (ios > 0) stop 'read error'
    print '(a)', trim(line)
  end do
  close(u)
end program file_demo
```

> **Pitfall:** always pair `open` with `close`. Stale units leak resources and can block another process from opening the same file.

**Practice**

- Count the lines in a text file.
- Copy `a.txt` to `b.txt`.
- Add `iomsg=msg` and print the diagnostic on failure.

## Reading and writing numeric data

**You'll be able to:** parse free-format numeric tables; write CSV-style output.

**Concept**

List-directed input (`read(u, *) ...`) handles whitespace/comma/slash-separated values automatically — the easiest way to read a free-format numeric table.

**Example**

```fortran
program nums
  use, intrinsic :: iso_fortran_env, only: real64
  implicit none
  integer :: u, ios, i, n
  real(real64), allocatable :: x(:), y(:)
  open(newunit=u, file='data.dat', status='old', action='read')
  read(u, *) n
  allocate(x(n), y(n))
  do i = 1, n
    read(u, *, iostat=ios) x(i), y(i)
    if (ios /= 0) stop 'bad row'
  end do
  close(u)
  open(newunit=u, file='out.csv', status='replace', action='write')
  write(u, '(a)') 'x,y,xy'
  do i = 1, n
    write(u, '(es12.4, ",", es12.4, ",", es12.4)') x(i), y(i), x(i)*y(i)
  end do
  close(u)
end program nums
```

> **Pitfall:** `status='replace'` truncates an existing file. Use `status='new'` for "error if it already exists," or `position='append'` to add to the end.

**Practice**

- Read a 3-column table and compute the column-wise mean.
- Skip header rows starting with `#`.
- Stream a million rows without holding them all in memory at once.

## Derived types and operator overloading

**You'll be able to:** define records with `type ... end type`; build arrays of records; overload an operator so a derived type behaves like a built-in numeric type where that reads naturally.

**Concept**

A derived type groups heterogeneous components under one name; access them with `%`. Component access on an array of derived types works elementwise (`cloud(:)%mass` is a 1-D array of reals).

To make `+` (or any other operator) work on your own type, declare an `interface operator(+)` block naming a function that implements it, then reference that function as a `module procedure`:

**Example**

```fortran
module points
  implicit none
  type :: point
    real :: x = 0.0, y = 0.0
  end type point

  interface operator(+)
    module procedure add_points
  end interface

contains
  pure function add_points(a, b) result(c)
    type(point), intent(in) :: a, b
    type(point) :: c
    c%x = a%x + b%x
    c%y = a%y + b%y
  end function add_points
end module points

program demo
  use points
  implicit none
  type(point) :: p1, p2, p3
  p1 = point(1.0, 2.0)
  p2 = point(3.0, 4.0)
  p3 = p1 + p2                 ! calls add_points via the operator interface
  print '(a, f5.1, a, f5.1)', 'p3 = (', p3%x, ', ', p3%y
end program demo
```

> **Pitfall:** the function backing an overloaded operator must not mutate its arguments — declare them `intent(in)` and return a new value, exactly like the built-in operators behave. An operator that silently mutates one of its operands violates the reader's assumption that `a + b` doesn't change `a`.

**Practice**

- Add `interface operator(-)` for point subtraction.
- Add `interface operator(==)` comparing two points for equality (careful with floating-point tolerance — see Module 2's pitfall on `==`).
- Build an array of `particle` records (with `x, y, z, mass, label` components) and sum the `mass` component with `sum(cloud(:)%mass)`.

## Pointers & targets

**You'll be able to:** declare `pointer`/`target` variables; associate with `=>` and check with `associated`; use pointers for strided views and linked structures.

**Concept**

Fortran pointers are aliases, not bare addresses — they must point to something declared `target` or to allocated memory. Prefer `allocatable` arrays unless you specifically need indirection: linked lists, optional links, or arbitrary-stride views.

**Example**

```fortran
program ptr_demo
  implicit none
  integer :: i
  integer, target  :: a(10) = [(i, i=1,10)]
  integer, pointer :: p(:) => null()
  p => a(2:8:2)              ! view: every 2nd element from 2..8
  print *, 'view =', p
  if (associated(p)) p = -1   ! mutates a through the alias
  print *, 'a =', a
  nullify(p)
end program ptr_demo
```

> **Pitfall:** always initialise pointers to `null()` and check `associated` before dereferencing. A dangling pointer is silent corruption, not a crash you can rely on catching.

**Practice**

- Build a singly linked list of integers using a pointer-component derived type.
- Alias every odd element of an array with a strided pointer.
- Confirm that mutating through a pointer mutates its target.

## namelist: structured config, briefly

**You'll be able to:** read a block of labeled key–value input without hand-parsing it.

**Concept**

`namelist` groups a set of variables under a name; `read`/`write` with `nml=` reads/writes them all at once from a specially-formatted block. It's the traditional Fortran answer to "read a small config file" without pulling in a JSON/YAML library.

**Example**

```fortran
program nml_demo
  implicit none
  integer :: n_steps
  real :: dt, alpha
  namelist /settings/ n_steps, dt, alpha

  n_steps = 100; dt = 0.01; alpha = 0.5
  open(10, file='settings.nml', status='replace')
  write(10, nml=settings)
  close(10)

  n_steps = 0; dt = 0.0; alpha = 0.0    ! clobber to prove the read works
  open(10, file='settings.nml', status='old')
  read(10, nml=settings)
  close(10)
  print *, n_steps, dt, alpha
end program nml_demo
```

The file it writes starts with `&SETTINGS`, one `NAME=value,` line per variable (uppercased, exact spacing/precision is compiler-dependent), and ends with `/`. Open it in a text editor after running the example to see your compiler's exact output — this is a case where reading the real file beats memorizing a format.

This is a light touch, not a full session — you have enough here to read config-driven scientific code (a very common real-world pattern) without a deep dive.

## Putting it together: a small data pipeline

**You'll be able to:** combine modules, derived types, file I/O, and array intrinsics into one program.

**Concept**

Read a CSV-like file of measurements into an array of records, then report a summary. This exercises everything from the last two modules together, and is deliberately structured as loader-module + thin-driver-program — the same split `fpm`'s `test/` directory formalizes.

**Example**

```fortran
module measurements
  use, intrinsic :: iso_fortran_env, only: real64
  implicit none
  type :: sample
    character(len=16) :: id
    real(real64) :: value
  end type sample
contains
  subroutine load(path, data)
    character(len=*), intent(in) :: path
    type(sample), allocatable, intent(out) :: data(:)
    integer :: u, ios, n, i
    open(newunit=u, file=path, status='old', action='read')
    read(u, *) n
    allocate(data(n))
    do i = 1, n
      read(u, *, iostat=ios) data(i)%id, data(i)%value
      if (ios /= 0) stop 'bad row'
    end do
    close(u)
  end subroutine load
end module measurements

program pipeline
  use measurements
  implicit none
  type(sample), allocatable :: d(:)
  call load('m.csv', d)
  print '(a, i0)', 'rows : ', size(d)
  print '(a, f10.4)', 'mean : ', sum(d(:)%value)/size(d)
  print '(a, f10.4)', 'max  : ', maxval(d(:)%value)
end program pipeline
```

> **Pitfall:** splitting the loader into a module makes the program testable — a test driver in `fpm`'s `test/` can call `load` directly against a known fixture file, without running the whole program.

**Practice**

- Add a `save_report` subroutine writing a CSV summary.
- Reject rows where the value is outside an expected range.
- Compute and report the standard deviation.

## Progress check

1. What's the safest way to obtain a unit number for `open`?
2. What do positive, zero, and negative `iostat` values mean?
3. Define a derived type `vec3` with three real components.
4. Write the `interface operator` block needed to make `v1 + v2` work for two `vec3` values (function body only needs to add components).
5. Why prefer `allocatable` arrays over `pointer` arrays when you have the choice?
6. How do you check whether a pointer is currently associated?
7. Sum the `mass` component of an array of `type(particle)` records.
8. How do you make a pointer alias every other element of a target array?
9. What's `namelist` for, and when would you reach for it instead of a plain CSV file?

### Answers

1. `newunit=u` (Fortran 2008+) — the runtime returns a guaranteed-free unit.
2. Zero is success; positive is a runtime error; negative is end-of-file or end-of-record.
3. `type :: vec3; real :: x, y, z; end type vec3`
4. ```fortran
   interface operator(+)
     module procedure add_vec3
   end interface
   ! ...
   pure function add_vec3(a, b) result(c)
     type(vec3), intent(in) :: a, b
     type(vec3) :: c
     c%x = a%x + b%x; c%y = a%y + b%y; c%z = a%z + b%z
   end function add_vec3
   ```
5. Allocatables auto-deallocate on scope exit, can't dangle, and don't alias — pointers add complexity you should pay for only when you actually need indirection (linked structures, optional links, strided views).
6. `associated(p)`, or `associated(p, target)` to test against a specific target.
7. `sum(cloud(:)%mass)`
8. Declare the array `target` and the pointer with deferred shape, then `p => a(1:n:2)`.
9. `namelist` reads/writes a whole labeled block of variables at once, without hand-parsing key–value pairs. Reach for it over a plain CSV/free-format file when the data is a config-style set of named scalars/small arrays (simulation parameters, run settings) rather than a table of records — the labels make the file self-describing and order-independent, which a positional CSV isn't.
