# Companion — Ruby (Budokan Module 9, shared with Smalltalk)

**Founding papers:** Kay, A. & Goldberg, A. (1977) and Kay, A. (1993) — the same two papers as `smalltalk.md`, since the Budokan workbook's own master table groups Ruby and Smalltalk under a shared module. Ruby has no equivalent academic founding paper of its own; Matsumoto (Matz) built and documented it primarily through mailing lists, talks, and the Ruby source itself, starting in 1993.

## Historical note

`ruby/00-overview.md` states the connection precisely, not as a loose family resemblance: "Yukihiro Matsumoto (Matz, Ruby's creator) has stated repeatedly that Smalltalk's object model directly shaped Ruby's own design." Where this shows up concretely, verified directly in `ruby/01-foundations.md`: Ruby's `nil` and `true` are real singleton instances of real classes (`NilClass`, `TrueClass`) — objects, receiving messages, exactly like every other value in the language — the identical design as Smalltalk's own `UndefinedObject`/`True`, not an independent rediscovery of the same idea.

The genuine divergence, and it's a real one worth being precise about: Ruby didn't inherit Smalltalk's message-passing purity wholesale. `ruby/04-duck-typing.md` frames Ruby's own polymorphism mechanism as duck typing — closer to Smalltalk's own dynamic dispatch in spirit than to C++/Java's static model, but Ruby retains method-call syntax (`object.method(args)`) rather than Smalltalk's own literal message-send syntax. Ruby is Smalltalk's object model, wearing C-family syntax — a deliberate, practical compromise Matz made to help the language read familiarly to programmers coming from Perl, C, and Lisp, the languages he named directly as Ruby's own other influences.

## Reflection prompts

- `ruby/01-foundations.md` verifies that `nil`/`true` are real singleton objects, the same design as Smalltalk's `UndefinedObject`/`True`. Compare this to a language in this series that treats `null`/`nil` very differently — Rust's `Option` (companion: `rust.md`), which has no null value at all. What does each design choice cost, and what does each buy?
- Ruby kept Smalltalk's object model but replaced its message-send syntax with C-family method-call syntax. What was gained for adoption, and what — if anything — was lost from Kay's own original conception of what a "message" actually is?

## Short-answer questions

1. **What real, verified design detail in `ruby/01-foundations.md` directly confirms the Smalltalk lineage, rather than merely asserting it?** `nil` and `true` are real singleton instances of real classes (`NilClass`, `TrueClass`) — objects receiving messages like any other Ruby value — the identical design as Smalltalk's `UndefinedObject`/`True`.
2. **What specific compromise did Matz make between Smalltalk's object model and more familiar syntax, and what other languages did he name as influences alongside Smalltalk?** Ruby kept Smalltalk's object model (duck typing, everything-is-an-object) but adopted C-family method-call syntax rather than Smalltalk's literal message-send syntax — Matz named Perl, C, and Lisp as Ruby's other direct influences.
3. **Does Ruby have an academic founding paper the way FORTRAN, C, or ALGOL do?** No — Ruby was documented primarily through Matsumoto's own mailing-list posts, talks, and the language's own source and manual, not a single peer-reviewed founding paper, distinguishing it from most of this companion's other entries.

## Links into the guide

- [`ruby/01-foundations.md`](../ruby/01-foundations.md) — the verified `nil`/`true` singleton-object finding.
- [`ruby/04-duck-typing.md`](../ruby/04-duck-typing.md) — Ruby's own polymorphism mechanism, directly descended from Smalltalk's dynamic dispatch.

## Cross-thread connection

See `smalltalk.md`'s own cross-thread connection (Park et al., 2023, Generative Agents) — the same pairing applies here, since the Budokan workbook's own master table groups Ruby and Smalltalk under one shared module entry.
