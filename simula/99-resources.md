# Resources

## Primary and near-primary sources

| Resource | Why it matters |
|---|---|
| Dahl, Myhrhaug, Nygaard, "Common Base Language" (Simula 67 report) | The actual primary source this guide's documented (not-executed) content is reconstructed from secondary treatments of |
| Bjarne Stroustrup, *The Design and Evolution of C++* (1994) | The direct primary source for Module 6 — Stroustrup's own account, in his own words |
| Bjarne Stroustrup, "A History of C++: 1979–1991" (HOPL-II, 1993) | The more concise, widely-available version of the same account |
| ACM Turing Award citation, Dahl & Nygaard (2001) | The independent, institutional confirmation of Simula's historical significance |
| This series' [ALGOL guide](../algol/00-overview.md) | Module 2's entire framing ("class as generalized block") depends on the block-structure material there |
| This series' [C guide](../c/00-overview.md) Capstone 5, [C++ guide](../cpp/00-overview.md) Module 3 | The two guides that show this guide's central idea (virtual dispatch) actually running |

## One-page cheat sheet (documented syntax — not compiler-checked)

| Idea | Snippet |
|---|---|
| Class as generalized block | `Class Point; Begin ... End Point;` |
| Object creation | `Ref (Point) p; p :- New Point;` |
| Reference vs. value assignment | `:-` (reference) vs. `:=` (value) |
| Member access | `p.x`, `p.move(5, 5)` |
| Subclassing (prefix notation) | `Point Class ColorPoint; Begin ... End ColorPoint;` |
| Virtual procedure | `Virtual: Procedure area;` — redefined per subclass, dispatched by actual type |
| Coroutine suspend/resume | `Detach` / `Resume` |

## Where to go now

Smalltalk next, per your own plan — read Module 7's forward pointer first, since the contrast (Simula's static discipline vs. Smalltalk's fully dynamic model) is the actual setup for that guide, not just a transition line.
