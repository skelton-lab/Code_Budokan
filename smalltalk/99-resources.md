# Resources & Cheat Sheet

## References

| Resource | Why it matters |
|---|---|
| [GNU Smalltalk User's Guide](https://www.gnu.org/software/smalltalk/manual/) | The toolchain this guide anchors to |
| Adele Goldberg & David Robson, *Smalltalk-80: The Language and its Implementation* | The classic primary reference |
| Alan Kay, "The Early History of Smalltalk" (1993) | Kay's own retrospective — the source for Module 7's note on his original meaning of "object-oriented" |
| This series' [Simula guide](../simula/00-overview.md) | Module 7's entire synthesis depends on reading both guides together |
| This series' [Ruby guide](../ruby/00-overview.md) | Ruby's Module 1 ("everything is an object") and Module 4 (duck typing) are the direct descendants this guide traces back to their origin |
| This series' [JavaScript guide](../javascript/00-overview.md) | Module 3's prototype chain traces to Self, itself a direct descendant of this guide's own lineage — a step removed from Ruby's, but the same root |

## One-page cheat sheet

| Idea | Snippet |
|---|---|
| Unary / binary / keyword messages | `5 factorial` / `3 + 4` / `arr at: 1 put: 10` |
| Class definition | `Object subclass: Counter [ \| count \| increment [ count := count + 1 ] ]` |
| Instance creation | `Counter new` |
| Conditional (a message send) | `(x > 3) ifTrue: [ ... ] ifFalse: [ ... ]` |
| Loop (a message send) | `[ cond ] whileTrue: [ ... ]`, `n timesRepeat: [ ... ]` |
| Block / closure | `[ :x \| x * x ] value: 5` |
| Map / filter / reduce | `collect:` / `select:` / `inject:into:` |
| Float print workaround (this toolchain's bug) | `aFloat rounded printString`, not `aFloat printString` |
| subclass-must-override | `self subclassResponsibility` |

## Where to go now

Back to the C++ guide, per your own plan — Module 3 (`virtual`, abstract classes) will now read as the direct destination of everything traced across the ALGOL, Simula, and this Smalltalk guide: block structure → the class as a persistent block → `Virtual` procedures named exactly what C++ still calls them → a deliberate choice of Simula's static discipline over Smalltalk's full dynamism, for reasons you can now state precisely rather than take on faith.
