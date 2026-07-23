# Companion — Smalltalk (Budokan Module 9, shared with Ruby)

**Founding papers:** Kay, A. & Goldberg, A. (1977). "Personal Dynamic Media." *IEEE Computer*, 10(3), 31–41. Kay, A. (1993). "The Early History of Smalltalk." *ACM SIGPLAN Notices*, 28(3), 69–95 (HOPL-II — the same conference as Ritchie's C paper and Colmerauer & Roussel's Prolog paper). — both sourced directly from the Code Budokan Reading Workbook, Strand C.

## Historical note

Kay's own 1993 retrospective, which the Budokan workbook singles out for its wit and clarity, reveals something `smalltalk/00-overview.md` builds its entire guide around: message-passing OOP (Smalltalk's model — objects communicate by sending messages, with no guarantee the receiver even has a method for it until runtime) is genuinely, structurally different from method-calling OOP (the Simula-derived, statically-checked model C++ and Java use). Kay's own biological metaphor — cells communicating via chemical signals, not a hierarchy of types calling each other's functions — is the actual origin of the term "object-oriented programming," and Kay says directly, quoted in the workbook, that mainstream OOP (as it came to mean inheritance hierarchies and static dispatch) was "not what I had in mind."

`smalltalk/00-overview.md` frames this precisely as "the actual origin of that whole lineage" Ruby's own guide (companion: `ruby.md`) already showed as an approximation — Ruby's duck typing is a real, direct descendant of Smalltalk's model (Matz has said so explicitly), but Smalltalk itself goes further: in Smalltalk, genuinely everything — including integers, `true`, and classes themselves — is an object receiving messages, with no primitive types exempted the way even Ruby retains at its edges.

## Reflection prompts

- Kay's own 1993 retrospective states plainly that mainstream OOP wasn't what he had in mind. Read `smalltalk/03-message-passing-control-flow.md` and identify one specific place where Smalltalk's own control flow (built from message sends, not special syntax) reveals what Kay actually meant, that a Java or C++ programmer might not expect.
- Kay's biological metaphor (cells, chemical signals) versus the inheritance-hierarchy metaphor mainstream OOP settled into: which metaphor does `smalltalk/05-inheritance-polymorphism.md` demonstrate is actually closer to how Smalltalk itself works?

## Short-answer questions

1. **What structural difference between Smalltalk's own OOP model and Simula/C++'s model does `smalltalk/00-overview.md` build the entire guide around?** Message-passing (Smalltalk — objects send messages, with no compile-time guarantee the receiver responds to it) versus method-calling (Simula/C++ — statically-checked, resolved at compile time or via a known vtable structure).
2. **What did Alan Kay say, quoted directly from his own 1993 retrospective, about mainstream OOP relative to what he originally intended?** That he invented the term "object-oriented programming," and that C++ (representing mainstream OOP as it came to be understood) "was not what I had in mind."
3. **What real claim does `smalltalk/00-overview.md` make about Smalltalk's "everything is an object" relative to Ruby's own version of the same idea?** That Smalltalk is the actual origin of the lineage Ruby's guide already demonstrated as an approximation — in Smalltalk, genuinely everything (integers, `true`, classes themselves) is an object receiving messages, with no primitives exempted, more thoroughgoing than even Ruby's own version.

## Links into the guide

- [`smalltalk/03-message-passing-control-flow.md`](../smalltalk/03-message-passing-control-flow.md) — message-passing control flow, Kay's own central mechanism made concrete.
- [`smalltalk/05-inheritance-polymorphism.md`](../smalltalk/05-inheritance-polymorphism.md) — direct contrast material with `simula/04-virtual-procedures.md`.

## Cross-thread connection

The Budokan workbook's own master table pairs Smalltalk/Ruby with Park et al.'s 2023 Generative Agents paper — "objects as actors." The connection: Kay's own message-passing model treats every object as an independent, encapsulated unit responding to messages with no shared internal state visible to other objects — Park et al.'s own generative agents (25 LLM-powered characters, each with private memory, reflection, and planning) are, structurally, the same idea one abstraction level up: independent units, communicating only through observable interaction, each maintaining its own private, encapsulated state.
