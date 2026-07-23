# Era IV — The Software Revolution (1960–1979)

The 1960s and 1970s were the era in which software emerged as a discipline distinct from hardware — a recognition that the programs running on computers were as important as the machines themselves, and that writing them well required its own science. This era produced Unix, the C programming language, the discipline of structured programming, the theoretical foundations of algorithms and data structures, the relational database, and the precursor to the internet. It also produced the first personal computers and the realization that computing need not be confined to institutions.

## Profiles

### Edsger W. Dijkstra (1930–2002) · Dutch computer scientist

Edsger Dijkstra was one of the most influential and deliberately provocative thinkers in the history of computer science. His contributions span algorithms, programming methodology, and the philosophy of computing. His 1959 shortest-path algorithm (Dijkstra's algorithm) is still the standard algorithm for finding shortest paths in weighted graphs — used in GPS navigation, network routing, and countless other applications. His 1968 letter "Go To Statement Considered Harmful" (originally titled "A Case against the GO TO Statement") initiated the structured programming movement, arguing that programs written with unrestricted GOTO statements were incomprehensible and unmaintainable.

**Key contributions**
- Dijkstra's algorithm — shortest path in weighted graphs (1959)
- "Go To Statement Considered Harmful" — founded structured programming (1968)
- Semaphores — first formal mechanism for concurrent process synchronization
- THE operating system — pioneered layered system design
- Dining Philosophers Problem — a classic concurrent-programming challenge
- EWD manuscripts — thousands of handwritten essays on computing

**Legacy.** Dijkstra's algorithm appears in every GPS device, every network router, and virtually every graph-processing application. His structured-programming advocacy was directly responsible for the shift from assembly and FORTRAN-style programming to the structured, modular programming that underpins all modern languages. He received the Turing Award in 1972.

**Key work:** *Dijkstra, E. W. (1968). Go To Statement Considered Harmful. Communications of the ACM, 11(3), 147–148.*

### Ken Thompson & Dennis Ritchie (1943– ) / (1941–2011) · American computer scientists, Bell Labs

Ken Thompson and Dennis Ritchie created Unix (1969) and the C programming language (1972) at Bell Laboratories — two of the most consequential contributions in the history of software. Unix began as Thompson's unauthorized personal project on a discarded PDP-7 after Bell Labs withdrew from the Multics project. It introduced the philosophy of small, composable tools that do one thing well, connected by pipes — a design principle that remains the foundation of Unix-like systems (including macOS and Linux) sixty years later. Ritchie's C language, created to rewrite Unix in a portable high-level language, became the lingua franca of systems programming. Python, Java, JavaScript, Go, Swift, and virtually every language in widespread use today was influenced by or implemented in C.

**Key contributions**
- Created the Unix operating system (1969) — pipes, hierarchical filesystem, shell
- Developed the C programming language (1972) — portable systems programming
- Established the Unix philosophy: small tools, do one thing well, compose with pipes
- Authored *The C Programming Language* (K&R, 1978)
- Thompson later created UTF-8 encoding (with Rob Pike, 1992)
- Thompson created the Go programming language (with Pike and Griesemer, 2009)

**Legacy.** Unix derivatives (Linux, macOS, iOS, Android) run the vast majority of the world's computing infrastructure. C remains the language in which operating systems, compilers, and systems software are written. The K&R textbook is one of the most widely read programming books in history. Ritchie and Thompson received the Turing Award in 1983.

**Key work:** *Ritchie, D. M., & Thompson, K. (1974). The UNIX Time-Sharing System. Communications of the ACM, 17(7), 365–375. Also: Kernighan, B. W., & Ritchie, D. M. (1978). The C Programming Language. Prentice Hall.*

### Donald Knuth (1938– ) · American computer scientist, Stanford University

Donald Knuth is the pre-eminent authority on algorithms and the analysis of data structures. *The Art of Computer Programming* (TAOCP) — a multi-volume treatise begun in 1962 and still being written — is the most thorough analysis of algorithms ever produced. Volume 1 appeared in 1968. Knuth invented TeX (1978), the typesetting system still used by mathematicians and scientists worldwide, out of frustration with the typesetting of his own books. He also developed the Knuth-Morris-Pratt string-search algorithm and LR(k) parsing theory, and contributed to the analysis of algorithms as a mathematical discipline.

**Key contributions**
- *The Art of Computer Programming* — the definitive multi-volume algorithm treatise
- Invented TeX — the standard scientific typesetting system (1978)
- Invented METAFONT — a digital typeface design system
- Knuth-Morris-Pratt string-matching algorithm (with Morris and Pratt)
- LR(k) parsing theory
- Won the Turing Award in 1974

**Legacy.** Bill Gates has said: "If you think you're a really good programmer... read Art of Computer Programming. You should definitely send me a résumé if you can read the whole thing." TeX remains the standard document preparation system for mathematics and physics. Knuth's rigorous asymptotic analysis of algorithm complexity is the standard way algorithm efficiency is discussed.

**Key work:** *Knuth, D. E. (1968–). The Art of Computer Programming, Volumes 1–4B. Addison-Wesley. Also: Knuth, D. E. (1984). The TeXbook. Addison-Wesley.*

### Edgar F. Codd (1923–2003) · British-American computer scientist, IBM

Edgar Codd was a mathematician working at IBM San Jose when he published "A Relational Model of Data for Large Shared Data Banks" in 1970. This paper defined the relational model of data: tables (relations) with rows (tuples) and columns (attributes), connected by keys and queried using relational algebra. The model was so clean and so powerful that it replaced the then-dominant hierarchical and network database models entirely. IBM built System R — the first relational database system — based on Codd's model, and then Structured Query Language (SQL, 1974) as the interface. Every database management system in widespread use today — Oracle, PostgreSQL, MySQL, SQL Server — implements Codd's relational model.

**Key contributions**
- Defined the relational model of data (1970)
- Invented the concept of relational algebra for database queries
- Established the theoretical foundation for SQL
- Codd's 12 rules for relational database systems
- Won the Turing Award in 1981

**Legacy.** The relational database remains the dominant data storage paradigm in enterprise computing fifty years after Codd's paper. SQL, derived directly from his relational algebra, is the most widely used data query language in the world.

**Key work:** *Codd, E. F. (1970). A Relational Model of Data for Large Shared Data Banks. Communications of the ACM, 13(6), 377–387.*

## The internet's origins

The Internet's origins belong to this era. ARPANET — the Advanced Research Projects Agency Network — connected four nodes (UCLA, SRI, UCSB, Utah) in 1969, funded by the US Department of Defense. The TCP/IP protocols (Vint Cerf and Bob Kahn, 1974) defined how data could be routed across different networks — the "network of networks" that would become the internet. Email (1971, Ray Tomlinson), the @ symbol, and the first inter-network message were also products of this era.

## Milestones

| Year | Event / invention | Significance |
|---|---|---|
| 1959 | Dijkstra's algorithm | Shortest-path algorithm. Used in GPS, routing, pathfinding universally. |
| 1960 | COBOL standardized / Simula 60 | Business computing language standardized. Simula introduces objects and classes. |
| 1962 | First computer game — Spacewar! | MIT. Demonstrates interactive real-time computing. |
| 1965 | Moore's Law | Transistor density doubles every two years. Predicts and drives the semiconductor roadmap. |
| 1967 | Simula 67 — OOP invented | Dahl & Nygaard. Classes, inheritance, polymorphism. First object-oriented language. |
| 1968 | Dijkstra — Go To Considered Harmful | Structured programming movement begins. Functions and control structures replace GOTO. |
| 1969 | Unix created at Bell Labs | Thompson & Ritchie. Small composable tools, pipes, hierarchical filesystem. |
| 1969 | ARPANET — first 4-node network | Predecessor to the internet. First packet-switched network. |
| 1970 | Codd — Relational Model paper | Foundation of all relational databases. SQL follows in 1974. |
| 1972 | C programming language | Ritchie, Bell Labs. Portable systems language. Basis of the Unix rewrite. |
| 1972 | Smalltalk — OOP matures | Kay, Xerox PARC. Pure OOP with message passing. Influenced all subsequent OOP languages. |
| 1973 | Unix V5 — Unix spreads to universities | Source code distributed to universities. Enormous influence on systems education. |
| 1974 | TCP/IP defined | Cerf & Kahn. Internetworking protocol. Foundation of the internet. |
| 1975 | Altair 8800 — first personal computer kit | MITS. Gates and Allen write a BASIC interpreter. Microsoft founded. |
| 1977 | Apple II | Wozniak. First mass-market personal computer. VisiCalc spreadsheet follows. |
| 1979 | VisiCalc — first spreadsheet | Bricklin & Frankston. Killer app that drove Apple II sales. Transforms business computing. |

## In this companion

This is the densest era for `code-rookie`'s own lineage: [`algol.md`](../algol.md) and [`fortran.md`](../fortran.md)'s own `02-control-flow.md` module both sit directly against Dijkstra's 1968 letter; [`c.md`](../c.md) and [`go.md`](../go.md) both trace to the Thompson & Ritchie profile — Go, forty years later, from the same Ken Thompson; [`sql.md`](../sql.md) traces to Codd; and [`simula.md`](../simula.md) and [`smalltalk.md`](../smalltalk.md) both anchor to this era's own 1967/1972 OOP milestones, even though their own companion files cite different, more specific founding papers.

**Previous:** [Era III — The Electronic Computer](era-3-electronic-computer.md) · **Next:** [Era V — The Personal Computer](era-5-personal-computer.md)
