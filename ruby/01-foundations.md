# Module 1 — Foundations: From JavaScript to Ruby

Everything really is an object, symbols are a genuinely new concept, and Ruby's truthy rules directly *invert* the JavaScript assumption you just built. Feeds everything downstream.

## Everything is an object

**You'll be able to:** call methods directly on values JavaScript treats as primitives.

**Concept**

In JavaScript, `5` is a primitive number, not an object (even though `(5).toString()` works via automatic boxing). In Ruby, `5` genuinely **is** an instance of a real class (`Integer`), with real methods you can call on it directly — same for `nil`, `true`, and everything else. There's no primitive/object split at all.

**Example**

```ruby
puts 5.class        # Integer
puts "hi".class      # String
puts nil.class        # NilClass
puts true.class        # TrueClass
```

Verified: exactly those four class names print — confirming `nil` and `true` aren't special non-object cases, they're instances of their own real classes (`NilClass`, `TrueClass`), each with exactly one instance that ever exists.

> **Where this actually comes from, if you've read this series' `smalltalk/` guide:** this isn't Ruby independently arriving at a similar design. Yukihiro Matsumoto (Ruby's creator, "Matz") has stated repeatedly, in interviews and talks over the years, that Smalltalk's "everything is an object" philosophy was a direct, explicit influence on Ruby's own object model — and the parallel is precise, not just conceptual: Smalltalk's `nil` is the one instance of class `UndefinedObject`, `true` is the one instance of class `True`, verified directly in that guide's own Module 1. Ruby's `NilClass`/`TrueClass` are the same idea, different names. Ruby then took the idea further in one specific way Smalltalk didn't emphasize as strongly — Module 4's duck typing is where that shows up.

> **Pitfall:** `nil` having a real class (and real methods, like `nil.to_s == ""`) means a `nil` value often doesn't crash where you'd expect it to in a language with a stricter null concept — it just responds however `NilClass` defines that method. This can turn what should be a loud, early error into a quiet, wrong result further downstream. Ruby 2.3+'s safe navigation operator (`obj&.method`) exists specifically to short-circuit a chain the moment something is `nil`, rather than relying on `nil` happening to respond sensibly.

**Practice**

- Call `.class` on an array literal, a hash literal, and a block (once you reach Module 2) — confirm every single one reports a real class.
- Look up `Integer#times` and use it to run a block a fixed number of times — proof that even a literal number responds to method calls directly.

## Symbols vs. strings

**You'll be able to:** explain what a symbol is and why Ruby code uses them constantly for things a JavaScript program would just use strings for.

**Concept**

A **symbol** (`:status`) is an immutable, interned name — Ruby guarantees only one object ever exists for a given symbol, no matter how many times `:status` appears in your program, unlike a string literal (`"status"`), where each occurrence can be a distinct object. Symbols are conventionally used for things that function as *names* or *identifiers* rather than actual textual data — hash keys, method names — because comparing two symbols for equality is a cheap identity check, not a character-by-character comparison.

**Example**

```ruby
sym = :status
str = "status"
puts sym.class, str.class
puts sym == str.to_sym   # true -- same underlying symbol
```

Verified: `Symbol`, `String`, then `true` — `str.to_sym` converts the string to the identical `:status` symbol every other `:status` in the program refers to.

> **Pitfall:** `:status == "status"` (comparing a symbol directly to a string, no conversion) is `false` — they're different types, and Ruby doesn't coerce between them for `==` the way it does for some numeric comparisons. A hash keyed with symbols (`{status: "active"}`, itself shorthand for `{:status => "active"}`) won't match a lookup using the string `"status"`, which is a genuinely common early mistake.

**Practice**

- Build a hash with symbol keys and confirm looking it up with the equivalent string key fails to find anything.
- Look up why Ruby's hash-literal shorthand `{status: "active"}` and `{"status" => "active"}` produce hashes with genuinely different key types, even though they look similar.

## Truthy and falsy: the opposite of what you just learned

**You'll be able to:** state Ruby's truthy/falsy rule precisely, and recognize it as a direct inversion of JavaScript's.

**Concept**

The JavaScript guide in this series established six falsy values, including `0` and `""`. Ruby's rule is dramatically simpler, and genuinely different: **only `nil` and `false` are falsy. Everything else — including `0`, `""`, empty arrays, empty hashes — is truthy.**

**Example**

```ruby
[0, "", nil, false, [], {}].each do |v|
  puts "#{v.inspect} is falsy: #{!v}"
end
```

Verified — the exact output, and read it against what you already know from JavaScript:
```
0 is falsy: false
"" is falsy: false
nil is falsy: true
false is falsy: true
[] is falsy: false
{} is falsy: false
```

`0` and `""` are **truthy** in Ruby. `if 0` runs its body — the exact opposite of what the JavaScript guide's own verified example showed for the same value. This is precisely the kind of assumption that survives a language switch unless it's confronted directly: code carried over instinctively from JavaScript (`if (count)` meaning "if count is nonzero") does something different, silently, in Ruby (`if count` is true even when `count` is `0`).

> **Pitfall:** because `0` and `""` are truthy, the Ruby idiom for "is this collection empty" is never truthiness — it's always an explicit `.empty?` call (`[].empty?` is `true`, `[].empty?` is what you check, not `![]`, which is always `false`). Internalize `.empty?` now; it comes up constantly.

**Practice**

- Write `if count` in Ruby with `count = 0` and confirm the body runs — deliberately breaking the JavaScript-carried instinct once, on purpose, so it doesn't happen accidentally later.
- Use `.empty?` to correctly check whether an array or string is empty, and contrast it with the (wrong, in Ruby) instinct of checking truthiness directly.

## Progress check

1. What does "everything is an object" mean concretely, that's different from JavaScript's primitive/object split?
2. Why can `nil` responding to methods be a real danger, not just a curiosity?
3. What's the practical reason Ruby code uses symbols for hash keys and method names instead of strings?
4. Are `:status` and `"status"` equal under `==`?
5. Name Ruby's complete list of falsy values.
6. Why is `if count` with `count = 0` a genuine, easy-to-carry-over bug for someone coming from JavaScript?
7. What language does Ruby's "everything is an object" design directly trace to, per Matz's own stated influences, and what's the precise, verified parallel between the two languages' `nil`?

### Answers

1. Values like numbers, `nil`, and `true`/`false` are real instances of real classes (`Integer`, `NilClass`, `TrueClass`, `FalseClass`) with real, directly-callable methods — there's no separate "primitive" category that only gets boxed into an object under special circumstances.
2. Because `nil` has real methods and can respond to a call without crashing (depending on what's called), a `nil` value can silently propagate through code that expected a real value, producing a wrong result further downstream instead of an immediate, loud error at the point where `nil` first appeared.
3. Symbol equality is a cheap identity check (Ruby guarantees only one object exists per symbol), while string equality requires comparing contents character by character — symbols are conventionally used for things acting as names/identifiers rather than actual text data, for both performance and semantic clarity.
4. No — `false`. They're different types, and Ruby doesn't coerce between symbol and string for `==`.
5. `nil` and `false` — nothing else, including `0`, `""`, empty arrays, and empty hashes, all of which are truthy.
6. Because in JavaScript, `0` is falsy, so `if (count)` is idiomatic for "if count is nonzero." In Ruby, `0` is truthy, so the identical-looking `if count` runs its body even when `count` is `0` — silently different behavior for code that looks correct by JavaScript instincts.
7. Smalltalk — Matz has stated repeatedly that Smalltalk's object model directly influenced Ruby's design. The precise parallel: Smalltalk's `nil` is the single instance of class `UndefinedObject` (verified in that guide's Module 1); Ruby's `nil` is the single instance of class `NilClass` — the identical design, different class name.
