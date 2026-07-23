# Module 7 — Beyond This Guide

None of this changes anything verified — this is the actual synthesis this guide, and the Simula guide before it, have been building toward.

### Why C++ took Simula's road, not this one

**The question worth answering directly, now that you've seen both:** Simula and Smalltalk both descend from "objects with their own state and behavior." Why does C++ read so much closer to Simula's `class`/`Virtual` model than to Smalltalk's fully dynamic, everything-is-a-message-send model?

**The answer, reasoned from what both guides established:** in Smalltalk, *every* operation — including `3 + 4`, which Module 1 confirmed is a real message send, not built-in arithmetic — is resolved by dynamic method lookup at runtime, with no compile-time type checking to skip that lookup or catch a mismatched message ahead of time. That's precisely the cost Stroustrup's stated requirement (the Simula guide's Module 6: Simula's organizational clarity, *plus* C's raw performance) couldn't absorb — a language where every arithmetic operation is a dynamically-dispatched message send is fundamentally not "close to the machine" in the way systems programming needed. Simula's model — classes and inheritance checked largely at compile time, with `Virtual` as one specific, bounded, deliberate escape hatch for dynamic dispatch exactly where it's needed and nowhere else — is structurally compatible with C's performance model in a way Smalltalk's uniform dynamism isn't. C++ inherited that structural compatibility directly, which is the real, mechanical reason it looks and performs the way it does, not just a stylistic preference.

**Where this leaves you, having now read all three guides (ALGOL, Simula, Smalltalk) before finishing C++:** the design tension Module 6 of the Simula guide named — organizational clarity vs. raw performance — has a concrete, structural answer now, not just a historical anecdote. You've seen the fully-dynamic alternative (this guide) closely enough to know precisely what C++ chose not to be, and why that choice was necessary given what Stroustrup was actually trying to build.

### Modern Smalltalk environments

**What it is:** this guide used `gst`, a script-mode command-line Smalltalk. The "real" historical Smalltalk experience is closer to **Pharo** or **Squeak** — a live, persistent, browsable image where you edit running objects directly rather than writing and re-running text files, closer in spirit to how Smalltalk was actually used and experienced at Xerox PARC.

**Why it's a signpost:** genuinely worth experiencing once if you want the full historical picture, but not needed for this guide's specific goal (understanding the message-passing model precisely enough to see what C++ did and didn't take from this branch of the OOP lineage).

### Alan Kay's own definition of "object-oriented"

**What it is:** Alan Kay, one of Smalltalk's principal designers, has stated in retrospect that when he coined the term "object-oriented programming," he meant message-passing as the central idea — and has been on record expressing that much of what later came to be called "OOP" in mainstream languages (inheritance-and-encapsulation-focused, closer to Simula's model) wasn't really what he'd originally meant by the term.

**Why it's a signpost, not deeper content here:** genuinely interesting, worth reading about directly from Kay's own retrospective writing and talks, but a matter of interpretation and language-design philosophy rather than something this guide's verification discipline can confirm or execute.
