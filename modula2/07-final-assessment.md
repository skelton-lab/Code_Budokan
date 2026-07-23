# Final Assessment

Across all six modules. Try each on paper first — there's no compiler to check against, so precision in your own reasoning is the actual test here.

1. What real, specific engineering project directly motivated Wirth to design Modula-2, and what two capabilities did that project require that Pascal genuinely lacked?
2. Was there an earlier language literally called "Modula," and how does it relate to Modula-2?
3. What's the actual relationship between Modula-2 and Oberon versus Modula-2 and Modula-3 — which one is Wirth's own direct next language?
4. What does a definition module declare, and what does an implementation module supply that the definition module withholds?
5. Why are `items` and `top`, in this guide's `Stack` example, invisible to any code that only imports from `Stack`'s definition module?
6. What's the difference between `FROM Stack IMPORT Push;` and `IMPORT Stack;`, and what does the qualified form protect against?
7. What does an opaque type (`TYPE StackPtr;` with nothing after it) let a module's author change freely, without breaking any caller's code?
8. What real constraint do opaque types impose on callers, beyond simply hiding fields?
9. What does `SYSTEM.ADR` return, and why does needing an explicit `FROM SYSTEM IMPORT` matter as more than just a technical requirement?
10. What does `CAST` do that an ordinary Modula-2 type conversion does not, and what real risk does that carry?
11. What does `SYSTEM.TRANSFER` do, and what's genuinely absent from it compared to how an operating system schedules threads?
12. What's the precise, honest relationship between Modula-2's coroutines and Simula's — and why does stating that relationship precisely (rather than overstating it) matter?

## Answers

1. The Lilith personal workstation project at ETH Zürich — Wirth's stated goal was writing the machine's entire system software (OS, editor, compiler) in one language. Pascal lacked direct memory access and other low-level, hardware-facing facilities, and a standard module system for splitting a large program across files with a real, compiler-enforced interface — both required at the scale of an entire workstation's system software.
2. Yes — "Modula" (1975–76), an earlier, singular language Wirth used as a research vehicle for exploring module and concurrency concepts, not intended as a production language. Modula-2 is the refined, second iteration, built specifically for the Lilith project.
3. Oberon (1988) is Wirth's own direct next language, a further simplification in the same spirit as Pascal's original design. Modula-3 (1988) is a separately-designed, larger language from a different team (DEC Systems Research Center and Olivetti) that borrowed Modula-2's name and module-system ideas but added object-oriented features, exceptions, and garbage collection — a related lineage, not an authorial sequel.
4. A definition module declares everything another module is allowed to use — procedure signatures, type names, constants — with no implementation code. An implementation module supplies the actual working code for everything declared, plus any purely internal state or logic never exposed at all.
5. Because they're declared inside the implementation module, not the definition module — only names appearing in the definition module are visible to code that imports from `Stack`, so internal working data has no path to leak out through a normal import.
6. `FROM Stack IMPORT Push;` imports the name directly, usable unqualified; `IMPORT Stack;` imports the whole module, requiring `Stack.Push` everywhere. The qualified form protects against name collisions when two imported modules might otherwise export a same-named identifier, and makes a procedure's origin visible at every call site.
7. The internal representation of the type entirely — a linked-list-backed stack could be replaced with an array-backed one (or any other structure) without breaking any caller's code, since no caller ever depended on the actual representation, only on the exported procedure signatures.
8. Callers can only perform operations the definition module explicitly exports — there's no way to inspect, construct, or manipulate the hidden internal structure directly, even for a genuinely reasonable need the module's author didn't anticipate and export.
9. It returns the actual memory address of a variable. The explicit import matters because it's a visible, textual signal — readable at a glance during review — that a specific file performs genuinely unsafe, machine-dependent operations, rather than relying on every reader independently knowing which operations happen to be dangerous.
10. `CAST` reinterprets a value's existing bit pattern as a different type, with no actual conversion of the underlying data — unlike an ordinary conversion, which changes the actual bits to represent an equivalent value in the new type. The real risk: there's no runtime check that the reinterpreted bits make sense as the target type at all, unlike ordinary Modula-2 assignments.
11. It explicitly hands control from one named coroutine to another, with no automatic scheduling involved. Genuinely absent, compared to an OS thread scheduler: any notion of automatic, time-sliced, or preemptive switching — control only moves when a `TRANSFER` call explicitly says so.
12. Independent convergence, not direct influence — Simula (1967) predates Modula-2 by over a decade with no design connection between them; both arrived separately at a similar underlying idea (an explicitly pausable and resumable execution context). Stating this precisely matters because overstating it as direct influence would misrepresent real, independently-documented history in service of a tidier-sounding narrative — exactly the kind of unverified, plausible-sounding claim this series' whole methodology exists to catch.
