# Companion — JavaScript (Budokan Module 10)

**Founding papers:** Eich, B. — retrospective accounts of JavaScript's creation, plus Flanagan, D. — the ECMAScript specification's own reference documentation. — sourced directly from the Code Budokan Reading Workbook, Strand C, which names these collectively rather than a single paper (JavaScript, like Ruby, has no single peer-reviewed founding paper).

## Historical note

JavaScript's own origin story is genuinely extreme, and the Code Budokan history's [Era VI milestone table](history/era-6-internet-and-web.md) states the number plainly: Brendan Eich designed and implemented the first version in **ten days**, in May 1995, at Netscape, under commercial pressure to ship a scripting language before the browser war with Microsoft made the decision for them. What makes this genuinely consequential rather than a curiosity is what `javascript/00-overview.md` names directly: JavaScript's prototype-based inheritance traces to Self, a language built directly out of the Smalltalk lineage — meaning C++'s static, compiler-checked dispatch and JavaScript's runtime, prototype-chained dispatch aren't two arbitrary, unrelated design choices; they're the two actual branches of the object-oriented family tree `simula/00-overview.md` and `smalltalk/00-overview.md` already mapped, arriving at the browser from two genuinely different directions three decades apart.

`javascript/03-objects-prototypes.md` covers the prototype chain directly; the Budokan history's own emphasis on "ten days" is worth holding alongside that module specifically — a design built under that kind of time pressure inheriting a serious, well-considered lineage (Self, ultimately Smalltalk) rather than being invented from nothing is itself a small, real lesson about how much design work speed doesn't have to throw away.

## Reflection prompts

- `javascript/00-overview.md` frames the C++-vs-JavaScript contrast as "the two actual branches of the object-oriented family tree." Trace the full chain from Simula (1967) through Smalltalk (companion: `smalltalk.md`) to Self to JavaScript's own prototypes — at which link does the "message-passing vs. method-calling" distinction (companion: `smalltalk.md`'s own reflection prompt) actually show up, or does it get lost somewhere along the way?
- Eich built the first version of JavaScript in ten days. Compare this to Wirth's multi-year design process for Pascal (companion: `pascal.md`), explicitly built as a considered teaching language. What does each timeline predict, correctly or incorrectly, about the resulting language's own consistency?

## Short-answer questions

1. **How long did it take Brendan Eich to design and implement the first version of JavaScript, and under what commercial pressure?** Ten days, in May 1995, at Netscape, under pressure to ship a scripting language before the ongoing browser war with Microsoft forced the decision.
2. **What real historical claim does `javascript/00-overview.md` make about the origin of JavaScript's prototype-based inheritance?** That it traces to Self, a language built directly out of the Smalltalk lineage — meaning JavaScript's dynamic, prototype-chained model and C++'s static, vtable-based model are two genuine branches of the same object-oriented family tree, not two unrelated inventions.
3. **What does `code-rookie` treat as JavaScript's own genuinely comprehensive scope, beyond just the language core, per `javascript/00-overview.md`?** Both frontend (the DOM) and backend (a real server) — plus TypeScript folded in as Module 9 rather than treated as a separate guide.

## Links into the guide

- [`javascript/03-objects-prototypes.md`](../javascript/03-objects-prototypes.md) — the prototype chain, traced directly to Self and the Smalltalk lineage.

## Cross-thread connection

The Budokan workbook's own master table pairs JavaScript with Yao et al.'s 2023 ReAct paper — "event-driven agent loops" — and separately notes Hunter's 2002 "cyberspace as place" paper as a Hunter-thread connection. The ReAct connection is genuine: JavaScript's own event-loop model (a single-threaded runtime processing a queue of callbacks/events, never blocking on I/O) is structurally similar to ReAct's own think-act-observe loop — both are a repeating cycle reacting to the next available signal, rather than a program executing a fixed, linear sequence start to finish.
