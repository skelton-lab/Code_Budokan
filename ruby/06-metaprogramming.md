# Module 6 — Metaprogramming Basics

Code that writes code — Ruby's most distinctive capability, and the exact mechanism Rails' ActiveRecord runs on (a model class gains a real `.title`/`.title=` pair for every database column, without you ever writing them by hand). This module deliberately stops short of Rails itself, but everything here is what Rails is built from. Feeds Capstone 4.

## `method_missing`

**You'll be able to:** intercept calls to methods that don't exist and handle them dynamically.

**Concept**

When you call a method Ruby can't find anywhere in the object's ancestor chain, it doesn't immediately fail — it calls `method_missing(name, *args)` first, and only raises `NoMethodError` if *that* isn't overridden (the default `method_missing`, inherited from `BasicObject`, is what actually raises it). Overriding `method_missing` lets an object respond to method calls that were never explicitly defined, deciding what to do based on the method name itself.

**Example**

```ruby
class DynamicConfig
  def initialize
    @data = {}
  end

  def method_missing(name, *args)
    name_str = name.to_s
    if name_str.end_with?("=")
      @data[name_str.chomp("=").to_sym] = args.first
    elsif @data.key?(name)
      @data[name]
    else
      super   # not something we handle -- fall back to real "method missing" behavior
    end
  end

  def respond_to_missing?(name, include_private = false)
    true
  end
end

config = DynamicConfig.new
config.hostname = "example.com"   # method_missing intercepts "hostname=", stores it
config.port = 8080
puts config.hostname                # method_missing intercepts "hostname", returns it
puts config.port
```

Verified: `config.hostname` and `config.port` — properties never explicitly defined anywhere on `DynamicConfig` — correctly print `example.com` and `8080`, entirely through `method_missing` inspecting the called method's name at runtime and deciding whether it looks like a setter (`ends_with?("=")`) or a getter.

> **Pitfall:** always override `respond_to_missing?` alongside `method_missing` — without it, `config.respond_to?(:hostname)` incorrectly reports `false` even though `config.hostname` genuinely works, which breaks any code (including a fair amount of Ruby's own standard library) that checks `respond_to?` before calling a method. And always call `super` in `method_missing`'s fallback case (as shown above) rather than silently swallowing every unrecognized call — otherwise genuine typos stop raising errors and start failing silently.

**Practice**

- Add a case to `method_missing` that raises a clear, custom error message for an unrecognized getter (instead of silently falling through), and compare the resulting error against the default `NoMethodError`.
- Trace through, by hand, what `config.hostname = "example.com"` actually looks like as a method call — `hostname=` is itself a completely ordinary Ruby method name (any method ending in `=` is Ruby's assignment-method convention), which is why `method_missing` can intercept it just like any other call.

## `define_method`: writing methods programmatically

**You'll be able to:** generate multiple real methods from a loop, rather than intercepting calls after the fact.

**Concept**

`method_missing` intercepts calls dynamically, every time, with the interception logic running on every call. `define_method(name) { ... }` instead genuinely **creates** a real method on the class, once, at class-definition time — faster at call time (it's an ordinary method after that point, not a runtime dispatch trick) and directly visible to `respond_to?` and `.methods` without any extra work.

**Example**

```ruby
class AutoAccessor
  def self.make_accessor(*names)
    names.each do |name|
      define_method(name) { instance_variable_get("@#{name}") }
      define_method("#{name}=") { |val| instance_variable_set("@#{name}", val) }
    end
  end
  make_accessor :title, :year
end

book = AutoAccessor.new
book.title = "Metaprogramming Ruby"
book.year = 2010
puts "#{book.title} (#{book.year})"
```

Verified: prints `Metaprogramming Ruby (2010)` — `make_accessor :title, :year` genuinely generated four real methods (`title`, `title=`, `year`, `year=`) from a two-element list, with zero hand-written accessor code. This is, structurally, exactly what `attr_accessor :title, :year` does internally — you've just built the mechanism by hand instead of using the shorthand.

**This is the mechanism Rails runs on.** An ActiveRecord model class inspects its database table's columns and calls something structurally similar to `make_accessor` above, once, when the class loads — which is why a Rails model gets working `.title`/`.title=` methods for every column, without a single line of accessor code ever being written for them. Module 9 names Rails explicitly as where this thread continues, if and when that's the next guide.

> **Pitfall:** `define_method` used inside a loop (as above) is genuinely different from `method_missing` in one important, sometimes-surprising way — the generated methods exist permanently on the class the moment `make_accessor` runs, even if the specific instance never uses them. `method_missing`-based dynamic dispatch, by contrast, only "exists" at the moment a call is actually intercepted. Neither is strictly better; they suit different situations (a known, fixed set of names vs. genuinely open-ended, unpredictable method names).

**Practice**

- Rewrite Capstone 1's `Circle`/`Rectangle` accessor methods (if you added any beyond the constructor) using `define_method` in a loop instead of hand-written `def`s.
- Compare `AutoAccessor.instance_methods(false)` (methods defined directly on this class, not inherited) against what you'd expect — confirm all four generated methods actually appear.

## Progress check

1. When does Ruby call `method_missing`, and what happens by default if it isn't overridden?
2. Why must `respond_to_missing?` be overridden alongside `method_missing`?
3. Why should `method_missing`'s fallback case call `super` rather than silently handling everything?
4. What's the key structural difference between `method_missing` and `define_method` — dynamic interception versus what?
5. What Rails mechanism does this module's `define_method` example directly foreshadow?

### Answers

1. When it can't find the called method anywhere in the object's ancestor chain. By default (the inherited `BasicObject#method_missing`), it raises `NoMethodError` — overriding it lets you handle the call yourself instead.
2. Without it, `respond_to?` reports `false` for methods that `method_missing` actually handles correctly, which breaks any code (including parts of Ruby's own standard library) that checks `respond_to?` before attempting a call.
3. So that genuinely unrecognized method calls (typos, real mistakes) still raise a clear error, rather than being silently absorbed and ignored by an overly broad `method_missing` that assumes every unknown call is intentional.
4. `method_missing` intercepts a call *after* Ruby has already failed to find a real method — the interception logic runs every single time that method name is called. `define_method` genuinely creates a real method once, at the time it's called (typically at class-definition time), after which it behaves exactly like any hand-written method.
5. ActiveRecord generating real accessor methods (`.title`, `.title=`, and so on) for every database column a model has, without those methods ever being hand-written — the same "generate real methods from a list of names, once" pattern this module's `make_accessor` demonstrates directly.
