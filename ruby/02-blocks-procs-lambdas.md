# Module 2 — Blocks, Procs, and Lambdas

Ruby's closures — the same underlying idea as JavaScript's arrow functions and C++'s lambdas, but with three distinct forms (blocks, procs, lambdas) that behave differently in ways that matter. Feeds Capstones 3, 4.

> **A lighter-touch callback than Module 1's, if you've read the Smalltalk guide:** Ruby's own `[ ... ]` isn't its block syntax — that's `{ ... }`/`do...end` — but Smalltalk's blocks (that guide's Module 4) are worth knowing about as a point of comparison, not a direct-lineage claim the way Module 1's `nil`/`UndefinedObject` parallel was. Ruby's block ancestry is genuinely mixed — Matz has cited Lisp, Perl, and Smalltalk all as influences on different parts of Ruby's design — so treat this module and Smalltalk's Module 4 as two implementations of the same underlying closure idea worth contrasting, rather than one being a direct copy of the other's syntax.

## Blocks and `yield`

**You'll be able to:** pass a block to a method and have the method invoke it with `yield`.

**Concept**

A **block** is code attached to a method call with `{ ... }` or `do ... end` — not a value you can store in a variable, just a chunk of code the method itself can invoke via `yield`. This is the mechanism behind nearly every iteration-style method in Ruby, including `.times`, `.each`, and the whole `Enumerable` module (Module 5).

**Example**

```ruby
def repeat(n)
  n.times { |i| yield i }
end
repeat(3) { |i| puts "iteration #{i}" }
```

Verified: prints `iteration 0`, `iteration 1`, `iteration 2` — `repeat` never sees the block as a value; `yield i` is a direct instruction to "run whatever block was attached to this call, with `i` as its argument."

**Practice**

- Write a method `retry_twice` that calls its block, and if the block raises, calls it again once before giving up — a real, if simplified, retry pattern built entirely from `yield` and `rescue`.

## Procs and lambdas

**You'll be able to:** create a lambda, call it three equivalent ways, and explain the two concrete ways a proc and a lambda actually differ.

**Concept**

Unlike a block, a **proc** (`proc { ... }` or `Proc.new { ... }`) and a **lambda** (`lambda { ... }` or `->(args) { ... }`) are real objects you can store, pass around, and call explicitly (`.call`, or the equivalent shorthand `.()`/`[]`). They look similar and are often used interchangeably for simple cases — but they differ in two concrete, verifiable ways: argument strictness, and what `return` does inside them.

**Example — argument strictness:**

```ruby
lenient = proc { |a, b| [a, b].inspect }
puts lenient.call(1)         # [1, nil] -- missing arg silently becomes nil, no error

strict = lambda { |a, b| [a, b].inspect }
strict.call(1)                # raises ArgumentError: wrong number of arguments (given 1, expected 2)
```

Verified: `lenient.call(1)` returns `[1, nil]` with no error; `strict.call(1)` raises `ArgumentError: wrong number of arguments (given 1, expected 2)` — a proc tolerates a wrong argument count, silently filling missing ones with `nil`; a lambda enforces it strictly, exactly like an ordinary method call.

**Example — `return` semantics:**

```ruby
def lambda_return_test
  l = lambda { return 10 }
  l.call
  puts "this prints -- lambda's return only exits the lambda"
  20
end
puts lambda_return_test   # prints the message, then 20

def proc_return_test
  p = proc { return 10 }
  p.call
  puts "this never prints -- proc's return exits the enclosing method"
  20
end
puts proc_return_test     # 10 -- the message and 20 are never reached
```

Verified: `lambda_return_test` prints the "this prints" message and returns `20` — the lambda's `return` only exits the lambda itself, execution continues normally afterward. `proc_return_test` returns `10` directly, with the "this never prints" message genuinely never printing — the proc's `return` exits the *entire enclosing method* immediately, not just the proc.

> **Pitfall:** a proc's `return` behavior means a stray `return` inside a proc, called from somewhere other than directly inside the method that created it (stored and called later, for instance), can raise `LocalJumpError` — there's no enclosing method left to return from. This is a real, sharp edge; the practical rule most style guides converge on: default to lambdas (`->`) for anything you're storing as a value, and reserve bare `proc`/`Proc.new` for cases where you specifically want the lenient-argument, return-from-enclosing-method behavior.

**Practice**

- Call the same lambda three equivalent ways: `.call(x)`, `.(x)`, and `[x]` — confirm identical results.
- Deliberately trigger `LocalJumpError` by storing a proc containing `return`, then calling it from a context where the enclosing method has already returned.

## Progress check

1. What's the fundamental difference between a block and a proc/lambda, in terms of what you can do with it?
2. What does `yield` actually do inside a method?
3. What happens when a proc is called with too few arguments? A lambda?
4. What does `return` do inside a lambda? Inside a proc?
5. What real, sharp-edged bug can a proc's `return` behavior cause?
6. What's the practical default this module recommends between procs and lambdas, and why?

### Answers

1. A block isn't a value at all — it's attached directly to a method call and can only be invoked via `yield` inside that method. A proc or lambda is a real object, storable in a variable and callable explicitly via `.call` (or equivalent shorthand) from anywhere.
2. It invokes whatever block was attached to the current method call, optionally passing arguments to it.
3. A proc tolerates it, silently filling missing arguments with `nil`. A lambda raises `ArgumentError`, enforcing argument count strictly like an ordinary method call.
4. `return` inside a lambda exits only the lambda, returning to normal execution right after the `.call`. `return` inside a proc exits the *entire enclosing method* immediately, skipping anything after the proc was called.
5. Calling a stored proc containing `return` from a context where its originally-enclosing method has already returned raises `LocalJumpError`, since there's no longer a method scope for the `return` to exit.
6. Default to lambdas (`->`) for anything stored as a value, reserving bare procs for the specific cases where their lenient-argument-count and return-from-enclosing-method behavior is actually wanted — because a lambda's stricter, more predictable behavior avoids the sharp edges of both proc quirks.
