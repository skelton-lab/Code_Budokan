# Module 6 — From Simula to "C with Classes"

Stroustrup's actual synthesis, sourced from his own published account. This module is the payoff the whole guide has been building toward.

## What Stroustrup took, and what he deliberately didn't

**You'll be able to:** state precisely which Simula ideas became "C with Classes," and why the coroutine/simulation framework (Module 5) wasn't part of that transfer.

**Concept, documented (from Stroustrup's own account — *The Design and Evolution of C++*, 1994; "A History of C++: 1979–1991," HOPL-II, 1993):**

Around 1979–1980, working at Bell Labs, Stroustrup began building **"C with Classes"** — C, with Simula's class concept (Module 2) and inheritance (Module 3) grafted directly onto it, keeping C's performance characteristics and closeness to the machine. What made the transfer specifically: the **class** as a unit combining data and the procedures that operate on it, and **inheritance** for building specialized classes from general ones. **Virtual procedures** (Module 4) — Simula's own term, carried across directly — followed as part of the same design lineage, giving "C with Classes" (and then C++) the ability to dispatch a call to the correct concrete type's implementation, exactly as Simula's `Virtual` did.

What *didn't* transfer: Simula's coroutine-based, `Detach`/`Resume` simulation framework (Module 5). Stroustrup's problem wasn't simulation specifically — it was general systems programming, where he wanted class-based organization without giving up C's speed. The class concept generalized cleanly to that goal; the simulation-scheduling machinery built on top of coroutines didn't need to come along for the ride.

> **This selectivity is itself the interesting design decision, not an afterthought:** Stroustrup didn't port Simula wholesale — he identified the specific ideas (class, inheritance, virtual dispatch) that solved his actual problem (organizing large systems programs without sacrificing performance) and left behind the parts (coroutine-based simulation scheduling) that were specific to Simula's original, narrower domain. This is a real, instructive example of how one language's ideas get selectively carried into another's design, rather than languages simply "copying" each other wholesale.

## The rename, and the first decade

**You'll be able to:** place "C with Classes" and "C++" in their actual historical sequence.

**Concept, documented:**

"C with Classes" was renamed **C++** in 1983 — the name suggested by Rick Mascitti, punning on C's own `++` increment operator: literally "one more than C." Stroustrup's book *The C++ Programming Language* (1985) became the language's first widely available comprehensive reference. Early C++ implementations (including the well-known **Cfront**) worked by translating C++ source into plain C, which was then compiled normally — a genuine, direct echo of how "C with Classes" itself began, layered on top of C rather than replacing it outright.

> **Confidence note, in the spirit of this whole series' verification discipline:** the big-picture narrative above (Simula's classes and virtual procedures → "C with Classes" → renamed C++ in 1983 → Cfront-era C-translation implementations) is well-corroborated across Stroustrup's own primary-source writing and is not in serious historical dispute. Exact year-by-year chronology of precisely when each individual C++ feature beyond the core class/inheritance/virtual set was first added (function overloading, default arguments, and others) is not claimed here with the same precision — that level of detail is better sourced directly from Stroustrup's own HOPL papers than reconstructed secondhand in this guide.

**Practice**

- Read Module 3 of your C++ guide (inheritance and polymorphism) immediately after this module, while the Simula-to-C++ lineage is fresh, and note every place the C++ guide's own language ("virtual," "class," "override") now reads as direct historical inheritance rather than arbitrary keyword choice.
- Write the one-paragraph synthesis this whole guide has been building toward: what did Stroustrup want that neither C nor Simula alone provided, and which specific pieces of Simula did he take to build it?

## Progress check

1. What three Simula ideas did Stroustrup identify as the core of "C with Classes"?
2. Why didn't Simula's coroutine/simulation framework transfer into "C with Classes"?
3. What does the name "C++" literally pun on, and who suggested it?
4. What did early C++ implementations like Cfront do, mechanically, and how does that echo "C with Classes"'s own origin?
5. What's this guide's confidence level on the big-picture Simula-to-C++ narrative versus the precise chronology of every individual C++ feature's introduction?

### Answers

1. The class as a unit combining data and its operating procedures, inheritance for building specialized classes from general ones, and virtual procedures for dispatching a call to the correct concrete type's implementation.
2. Stroustrup's actual problem was general systems programming, not simulation specifically — the class concept generalized cleanly to that goal, while the coroutine-based scheduling machinery was specific to Simula's original, narrower simulation domain and wasn't needed for it.
3. C's own `++` increment operator, punning "one more than C" — suggested by Rick Mascitti.
4. They translated C++ source code into plain C, which was then compiled normally by an ordinary C compiler — directly echoing how "C with Classes" itself began as an addition layered on top of C rather than a wholesale replacement of it.
5. High confidence on the big-picture narrative (well-corroborated across Stroustrup's own primary-source writing, not seriously disputed); explicitly lower, unclaimed precision on exact year-by-year chronology of every individual feature beyond the core class/inheritance/virtual set — that detail is better sourced directly from Stroustrup's own papers than asserted here.
