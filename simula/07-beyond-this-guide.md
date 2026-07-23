# Module 7 — Beyond This Guide

None of this changes the core lineage already traced — signposts, and the explicit bridge to what you're building next.

### Where Smalltalk fits, and why it's not "more of the same"

**What it is:** Smalltalk (1972, Alan Kay and others at Xerox PARC) came after Simula and was directly influenced by it — but took the object concept in a genuinely different direction than Simula did. Simula's classes are checked and organized at compile time, with `Virtual` procedures as one specific, bounded escape hatch for dynamic dispatch. Smalltalk made **everything** an object, communicating **exclusively** through message passing, resolved entirely at runtime — no compile-time class-checking at all, by design.

**Why this matters for what comes next:** you're about to see two languages that both descend from "objects with their own state," landing in genuinely different places. Simula kept ALGOL's static, compiled discipline and added objects on top. Smalltalk discarded static structure almost entirely in favor of a uniform, dynamic, message-passing model. C++ — as Module 6 just traced — is structurally much closer to Simula's choice than Smalltalk's, which is worth having explicit going into the Smalltalk guide: you're not about to see "the same idea again," you're about to see the road not taken.

### Other Simula-influenced languages

**What it is:** Simula's influence extends well beyond C++ — Java and C# both cite Simula-family class/inheritance design (largely via C++) as ancestral; Beta (a later language, also from the Scandinavian object-oriented tradition Dahl and Nygaard belonged to) explored some of Simula's ideas further in different directions.

**Why it's a signpost:** genuinely real lineage, but not needed for this guide's specific, narrow goal — tracing Simula directly into C++.

### The Simula 67 Common Base Language report itself

**What it is:** the actual primary source this entire guide has been reconstructed from secondary treatments of — the formal specification Dahl, Nygaard, and colleagues published.

**Where to go next:** if you want to go past this guide's necessarily-secondhand reconstruction and read the real thing, the report itself (and Dahl's own later retrospective writing on Simula's design) is the primary source every serious history of object-oriented programming ultimately cites.
