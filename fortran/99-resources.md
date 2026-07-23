# Resources & Cheat Sheet

## Tutorials and references

| Resource | Why it matters |
|---|---|
| [Fortran-lang Quickstart](https://fortran-lang.org/learn/quickstart) | Fastest path from zero to a runnable modern program; pairs with `fpm`. |
| [Fortran-lang Mini-Book](https://fortran-lang.org/learn) | Topic-by-topic reference for arrays, modules, derived types, I/O, OOP — good for the Module 7 signposts once you're ready to go deeper. |
| *Modern Fortran Explained* (Metcalf, Reid, Cohen) | The standard textbook; read alongside the tutorials for depth. |
| [GFortran manual](https://gcc.gnu.org/onlinedocs/gfortran) | Authoritative compiler documentation, including every extension and intrinsic — the place to verify a compiler-flag claim rather than trust a memorized one (see Module 6's `do concurrent` parallelization note). |
| [Fortran Discourse](https://fortran-lang.discourse.group/) | Active Q&A community. |
| [fpm docs](https://fpm.fortran-lang.org/) | The build tool used throughout Modules 4 and 6. |
| [stdlib](https://stdlib.fortran-lang.org/) | Community standard library — sorting, stats, linear algebra, already written. |

## One-page cheat sheet

| Idea | Snippet |
|---|---|
| Program skeleton | `program p; implicit none; ...; end program p` |
| Portable kinds | `use, intrinsic :: iso_fortran_env, only: real64, int64` |
| Compile-time constant | `real(real64), parameter :: pi = acos(-1.0_real64)` |
| Allocatable array | `real, allocatable :: x(:); allocate(x(n))` |
| Whole-array op | `y = 2.0*x + 1.0; s = sum(x); m = maxval(x)` |
| Slicing | `x(2:8:2)` — every 2nd element from 2..8 |
| **Reversing** (not `x(::-1)` — see Module 3) | `x(size(x):1:-1)` |
| Module `use` | `use mymod, only: foo, bar` |
| Procedure intent | `real, intent(in) :: x; real, intent(out) :: y` |
| Operator overload | `interface operator(+); module procedure add_t; end interface` |
| Open file (F2008) | `open(newunit=u, file='f.txt', status='old', action='read')` |
| Loop until EOF | `do; read(u,'(a)',iostat=ios) ln; if (ios<0) exit; end do` |
| Derived type | `type :: pt; real :: x, y; end type pt` |
| Move allocation | `call move_alloc(from=tmp, to=arr)` |
| Command-line args | `n = command_argument_count(); call get_command_argument(i, val)` |
| Parallel loop | `do concurrent (i = 1:n); ...; end do` |
| Minimal test check | `call check(condition, 'message')` → `error stop 1` on failure |
| fpm project | `fpm new proj; fpm build; fpm run; fpm test` |

## Where to go next

Read other people's code. Browse `stdlib`, skim a few small `fortran`-tagged projects on GitHub, and try porting a small numerical script you already wrote in Python or MATLAB — the patterns here transfer directly. When you're ready for what Module 7 only signposted (C interop, OOP, distributed parallelism), that module tells you exactly where to start.
