# Module 7 — Files, Gems, and Testing

Reading and writing files (Ruby's classic scripting strength, and a callback to the C and Fortran guides' own file-processing capstones), plus the same "the code should check itself" habit every guide in this series has built in. Feeds Capstone 5.

## Reading and processing a file

**You'll be able to:** read a file into memory and process it into structured data.

**Concept**

`File.readlines(path, chomp: true)` reads every line into an array, with trailing newlines already stripped (`chomp: true`) — no manual `.strip`/`.chomp` needed per line, unlike the C guide's `strcspn(line, "\n")` dance. `File.write(path, content)` writes a string to a file in one call; `File.read(path)` reads one back.

**Example**

```ruby
lines = File.readlines("data.csv", chomp: true)
header = lines.shift.split(",")
records = lines.map { |line| header.zip(line.split(",")).to_h }

total = records.sum { |r| r["score"].to_i }
puts "average: #{total / records.size.to_f}"

File.write("out.txt", "processed #{records.size} records\n")
```

Verified, against a real 3-row CSV: `records` correctly builds an array of hashes (`{"name" => "Ada", "score" => "95"}`, and so on) by zipping the header row against each data row; the average computes to `91.666...` (matching `(95+88+92)/3` by hand); and the write/read round trip confirms `out.txt` correctly reports `processed 3 records`.

> **Pitfall:** `total / records.size.to_f` — the explicit `.to_f` on the divisor — matters precisely because Ruby's `/` between two integers is integer division (this series' Fortran and C guides' own default behavior), truncating instead of giving a fractional average. Forgetting it here would have silently produced `91`, not `91.666...`.

**Practice**

- Rewrite this to use Ruby's built-in `CSV` standard library (`require "csv"`) instead of manual `.split(",")`, and compare against hand-rolled parsing — note where the standard library handles an edge case (quoted commas within a field) your manual version doesn't.
- Add a rescue clause around `File.readlines` catching `Errno::ENOENT` (file not found) with a clear error message, rather than letting the raw exception propagate.

## Gems and Bundler

**You'll be able to:** describe what a `Gemfile` does and why real Ruby projects use one.

**Concept**

A **gem** is Ruby's package format — a library you can install and `require`. **Bundler** manages a project's gem dependencies via a `Gemfile`, pinning exact versions in a generated `Gemfile.lock` so the same versions install everywhere the project runs, the same role `package.json`/`bun.lock` played in the JavaScript guide.

**Example**

```ruby
# Gemfile
source "https://rubygems.org"
gem "minitest"
```

```bash
bundle install     # reads the Gemfile, installs everything listed, writes Gemfile.lock
bundle exec ruby my_script.rb   # runs a script using exactly the Gemfile's pinned versions
```

**Practice**

- Create a `Gemfile` for one of your capstones and run `bundle install`.
- Compare `Gemfile`/`Gemfile.lock` directly against `package.json`/`bun.lock` from the JavaScript guide — same underlying problem (reproducible dependency versions), different ecosystem's specific file format.

## Testing with `minitest`

**You'll be able to:** write and run a test using Ruby's built-in testing library.

**Concept**

`minitest` ships with Ruby itself — no separate install needed for the basics. `assert_equal expected, actual` is the core assertion; wrapping tests in a class inheriting from `Minitest::Test`, with methods named `test_*`, is how they're discovered and run.

**Example**

```ruby
# mathutils.rb
def add(a, b) = a + b
def square(x) = x * x
```

```ruby
# mathutils_test.rb
require "minitest/autorun"
require_relative "mathutils"

class MathUtilsTest < Minitest::Test
  def test_add
    assert_equal 5, add(2, 3)
  end
  def test_square
    assert_equal 25, square(5)
  end
end
```

Verified: `ruby mathutils_test.rb` correctly discovers and runs both tests, reporting `2 runs, 2 assertions, 0 failures, 0 errors, 0 skips`.

> **This is the same discipline as every earlier guide in this series** — Fortran's `check()`, the 6502 guide's memory-harness technique, C/C++'s sanitizer-verified examples, JavaScript's `bun test`. Different syntax every time (`assert_equal expected, actual` here, argument order matters — expected first), same underlying habit: the code should be able to check itself.

**Practice**

- Write a deliberately failing test (`assert_equal 6, add(2, 3)`) and read `minitest`'s failure output, noting how it reports expected versus actual.
- Add tests for Capstone 4's dynamic accessors (Module 6) — confirm `minitest` works identically well against metaprogrammed methods as against ordinary ones, since by the time a test runs, `define_method`-generated methods are indistinguishable from hand-written ones.

## Progress check

1. What does `chomp: true` on `File.readlines` save you from doing manually?
2. Why does `total / records.size.to_f`, not `total / records.size`, correctly compute a fractional average?
3. What role does a `Gemfile.lock` play, and what JavaScript-guide file plays the identical role?
4. What's `minitest`'s core assertion method, and in what argument order?
5. What underlying discipline does `minitest` share with every other language guide in this series, despite the syntax differing every time?

### Answers

1. Stripping the trailing newline from each line — without it, every line would need a manual `.chomp` or `.strip` call before further processing, similar to the C guide's `strcspn(line, "\n")` step.
2. Ruby's `/` between two integers is integer division, truncating any fractional part — `.to_f` on the divisor forces the division to produce a real (floating-point) result instead of silently truncating to a whole number.
3. It pins the exact installed versions of every gem a `Gemfile` lists, so the same versions install consistently everywhere the project runs — the identical role `bun.lock` (or `package-lock.json`) plays for a JavaScript project's npm/Bun dependencies.
4. `assert_equal expected, actual` — the expected value comes first, then the actual value being checked against it.
5. The code checking itself and reporting pass/fail automatically, rather than relying on a human to manually verify behavior every time — the same underlying idea as Fortran's `check()`, the 6502 guide's memory-harness technique, C/C++'s sanitizer-verified examples, and JavaScript's `bun test`, each expressed through that language's own specific testing API.
