# Final Assessment

Across all nine modules. Try each on paper first.

1. What does "everything is an object" mean concretely in Ruby, that's different from JavaScript, and what earlier language does this design directly trace to?
2. What are Ruby's only two falsy values, and why is this the exact opposite of what the JavaScript guide taught?
3. What's the practical difference between a proc and a lambda regarding argument count and `return`?
4. What real problem does Ruby's single-inheritance-plus-modules design sidestep entirely?
5. Why does `Greetable#greet`'s bare `name` call raise `NameError` while Module 4's `shape.area` raises `NoMethodError`?
6. What does duck typing require of an object, and what does it explicitly not require?
7. What polymorphism mechanisms has this entire series covered, one per language, and where does Ruby's own version historically come from?
8. What's the key structural difference between `method_missing` and `define_method`?
9. What Rails mechanism does `define_method` directly foreshadow?
10. What role does `Gemfile.lock` play, and what's its JavaScript-guide equivalent?
11. Why does `total / records.size.to_f`, not `total / records.size`, matter for computing an average?
12. What single method must a class define to gain `.sort`/`.max`/every comparison operator from `Comparable`?

## Answers

1. Values like integers, `nil`, and `true`/`false` are real instances of real classes (`Integer`, `NilClass`, `TrueClass`) with directly-callable methods — there's no separate "primitive" category, unlike JavaScript's primitive/object split. Matz has stated repeatedly that this design directly traces to Smalltalk's object model — the precise parallel: Smalltalk's `nil` is the one instance of `UndefinedObject`, Ruby's is the one instance of `NilClass`.
2. `nil` and `false` — nothing else. `0`, `""`, empty arrays, and empty hashes are all truthy in Ruby, while JavaScript treats `0` and `""` (among others) as falsy — code carrying over the JavaScript instinct (`if (count)` meaning "if nonzero") behaves differently, silently, in Ruby.
3. A proc tolerates a wrong argument count (missing arguments become `nil`); a lambda raises `ArgumentError`, exactly like an ordinary method call. `return` inside a lambda exits only the lambda; `return` inside a proc exits the entire enclosing method.
4. The diamond problem — ambiguity from two base classes sharing a common ancestor. Ruby's single direct parent plus `include`-able modules never creates that structure.
5. `name` is called bare, with no explicit receiver — Ruby reports it as an unresolved identifier (`NameError`) since it could theoretically be either a local variable or an implicit-`self` method call. `shape.area` has an explicit receiver, so Ruby unambiguously knows it's a failed method call on a specific object (`NoMethodError`).
6. It requires only that the object responds to whatever methods are actually called on it (`.area`, `.name`) — it explicitly does not require any shared class, module, or declared interface.
7. C: a hand-built struct with a function pointer. Simula: `Virtual` procedures, the historical origin of C++'s keyword. C++: `virtual`, a compiler-generated vtable, requiring a declared common base class. JavaScript: a live, runtime-walked prototype chain, traced to Self and the Smalltalk lineage. Smalltalk: message sends resolved entirely at runtime, no shared type ever required. Ruby: the same outcome as Smalltalk, arrived at as its direct descendant — not independently reinvented.
8. `method_missing` intercepts a call after Ruby fails to find a real method, running its interception logic every time that method is called. `define_method` genuinely creates a real method once (typically at class-definition time), after which it behaves exactly like any hand-written method.
9. ActiveRecord generating real accessor methods for every database column a model has, without those methods ever being hand-written — the same "generate real methods from a list of names, once" mechanism Capstone 4's `attribute` demonstrates directly.
10. It pins the exact installed versions of every gem a `Gemfile` lists, ensuring consistent installs everywhere — the same role `bun.lock`/`package-lock.json` plays for a JavaScript project.
11. Ruby's `/` between two integers is integer division, truncating any fractional part; `.to_f` on the divisor forces a real (floating-point) division result instead of silently truncating to a whole number.
12. `<=>` (the spaceship operator) — `Comparable` implements every comparison operator and array-comparison/sorting method purely in terms of whatever `<=>` returns.
