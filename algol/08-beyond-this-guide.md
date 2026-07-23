# Module 8 — Beyond This Guide

None of these change anything already verified — this is where the ALGOL lineage actually goes, including the two branches you've already said you're heading toward next.

### ALGOL W and Pascal

**What it is:** Niklaus Wirth (later Pascal's designer) worked directly on an early ALGOL 68 proposal, then split off to create **ALGOL W** (1966) as a smaller, more disciplined alternative — which became the direct conceptual precursor to **Pascal** (1970), Wirth's own next language. Pascal inherited ALGOL's block structure and recursion wholesale, added stronger static typing, and — directly relevant to Module 4 — kept ALGOL 60's *optional* `else` with no mandatory closing keyword, meaning Pascal inherited essentially the same dangling-else shape ALGOL 60 had, resolved the same way (nearest unmatched `if`), rather than following ALGOL 68's mandatory-`FI` structural fix. Worth confirming directly against a real Pascal reference if you want the precise wording of its resolution rule — flagged here as a plausible, not independently re-verified, historical claim.

**Why it's a signpost:** a genuinely direct line of descent worth knowing about, but a separate language with its own `DesignCurriculum` pass if it's ever wanted.

### ALGOL 68's own broader feature set

**What it is:** this guide deliberately stayed within the subset of ALGOL 68 that overlaps cleanly with ALGOL 60's concepts. ALGOL 68 itself is considerably larger — user-defined operators (you can define your own `+` for a new type, foreshadowing this series' operator-overloading thread from the Fortran, C++, and Ruby guides), built-in parallel processing constructs, and a more elaborate, fully orthogonal type system than this guide touched.

**Why it's a signpost:** none of it was needed to verify ALGOL 60's historically pivotal ideas, which was this guide's actual scope.

### Simula and Smalltalk — no longer a plan, now this series' next two guides

**What it is:** this signpost was written before either guide existed, as a forward pointer for a stated plan — both are now real, built, and verified guides in this series, so the connection can be stated as confirmed rather than anticipated. This series' [`simula/`](../simula/00-overview.md) guide's Module 2 picks up exactly the `BEGIN...END` block from this guide's own Module 2 and extends it with one change: a block whose local state persists after its creating call returns, holding its own state, callable later — the `class`. Its Module 4 traces `virtual` procedures directly to what became C++'s `virtual` keyword (Bjarne Stroustrup's own stated inspiration for "C with Classes"). This series' [`smalltalk/`](../smalltalk/00-overview.md) guide takes the *other* branch from the same root — Smalltalk (1972) makes everything, without exception, an object communicating via message-passing, resolved entirely at runtime with no static structure at all, a design philosophy this series' Ruby guide already showed you a direct descendant of (Smalltalk's own Module 5 traces Ruby's duck typing back to it precisely).

**Why this matters, now that you can read it in the actual guides rather than a summary here:** the Simula guide's Module 7 works through, explicitly, why C++ ended up structurally closer to Simula's static discipline than to Smalltalk's full dynamism — a reasoned answer, not an assertion, built from what both guides independently established about Stroustrup's actual performance requirements. Reading Simula immediately after this guide, before finishing C++, means the class concept arrives as a direct, traceable extension of the block structure you just verified in Module 2 here — not as an isolated new idea dropped in from nowhere. That's exactly the kind of scaffolding this whole series has been built around, and it's why this specific guide sits where it does in your sequencing rather than being skipped.

### BCPL and the road to C

**What it is:** ALGOL's block structure also fed into a different, more pragmatic lineage — BCPL (1966) and B (early 1970s) stripped ALGOL-family ideas down for systems programming, directly preceding C itself.

**Why it's a signpost:** this is the *other* direct line from ALGOL — not through Simula/Smalltalk's object-oriented branch, but straight into the C guide you already have, giving you two separate, traceable lineages both originating in this one guide.
