# Era III — The Electronic Computer (1945–1959)

The decade and a half after World War II saw the transition from theoretical possibility to operational reality. The electronic computer went from a classified military research project to a commercial product, from machine code to high-level languages, and from rooms full of vacuum tubes to the first transistorized computers. The key figures of this era built not just machines but the conceptual framework — the stored-program architecture — that all subsequent computers would use.

## Profiles

### John von Neumann (1903–1957) · Hungarian-American mathematician

John von Neumann is perhaps the most intellectually productive scientist of the twentieth century: he made foundational contributions to mathematics, physics, quantum mechanics, game theory, and computer science. His 1945 "First Draft of a Report on the EDVAC" codified the stored-program architecture — the design principle in which a computer stores both its program and its data in the same addressable memory and executes instructions sequentially — that became the basis of every general-purpose computer built since. Von Neumann also developed the merge sort algorithm and made critical contributions to the Manhattan Project's computational methods.

**Key contributions**
- Defined the stored-program architecture (von Neumann architecture, 1945)
- Articulated the fetch-decode-execute cycle as the computer's operation model
- Contributed to Monte Carlo methods and numerical analysis
- Developed the merge sort algorithm
- Pioneered cellular automata and self-reproducing systems theory
- Contributed to quantum mechanics, game theory, and set theory

**Legacy.** The "von Neumann architecture" — CPU + memory + input/output, with instructions and data in the same memory space — is the design of every conventional computer to this day. The von Neumann bottleneck (the limited bandwidth between CPU and memory) is a performance constraint that computer architects are still working around.

**Key work:** *von Neumann, J. (1945). First Draft of a Report on the EDVAC. University of Pennsylvania Moore School of Electrical Engineering Technical Report.*

### Grace Hopper (1906–1992) · American computer scientist, US Navy Rear Admiral

Grace Hopper was a mathematician who joined the US Navy during World War II and was assigned to work on the Harvard Mark I — one of the earliest electromechanical computers. She became one of the first programmers and went on to lead the development of FLOW-MATIC, the first programming language to use English-like words instead of machine code. This directly led to the development of COBOL (1959), which Hopper championed. COBOL became the dominant language for business data processing and is still running critical financial and government systems worldwide. Hopper is also credited with popularizing the term "debugging" after her team found an actual moth causing a fault in the Harvard Mark II.

**Key contributions**
- One of the first programmers (Harvard Mark I, 1944)
- Developed the first compiler — the A-0 System (1952)
- Created FLOW-MATIC, the first English-language programming language
- Led development of COBOL (1959), the most widely used business language
- Popularized the term "debugging"
- Advocated for machine-independent programming languages

**Legacy.** COBOL processes an estimated $3 trillion in daily financial transactions. Hopper's insight that programming languages should be human-readable was the founding principle of every high-level language. She received the Presidential Medal of Freedom posthumously in 2016.

**Key work:** *Hopper, G. (1952). The Education of a Computer. Proceedings of the 1952 ACM Annual Meeting.*

### John Backus (1924–2007) · American computer scientist — creator of FORTRAN

John Backus led the IBM team that created FORTRAN (Formula Translation) in 1957 — the first widely used high-level programming language. The project began from Backus's frustration that programmers spent more time on machine code than on actual problem-solving. FORTRAN allowed scientists and engineers to write programs in algebraic notation and have them automatically translated to machine code by the compiler. The language shaved an order of magnitude off the time required to write scientific programs. Backus later co-developed the Backus-Naur Form (BNF) notation for formally specifying programming language grammar, which is still the standard way grammars are described.

**Key contributions**
- Led development of FORTRAN (1957) — the first widely used high-level language
- Proved that programs could be automatically compiled to machine code
- Co-developed Backus-Naur Form (BNF) for grammar specification
- Developed the functional programming language FP (1977)
- Won the Turing Award in 1977

**Legacy.** FORTRAN is still used in high-performance scientific computing, weather modelling, and computational physics. BNF notation is used to formally specify the grammar of virtually every programming language created since 1960.

**Key work:** *Backus, J. W., et al. (1957). The FORTRAN Automatic Coding System. Proceedings of the Western Joint Computer Conference.*

## Milestones

| Year | Event / invention | Significance |
|---|---|---|
| 1945 | ENIAC completed | First general-purpose electronic digital computer. 18,000 vacuum tubes, 30 tons, 150kW. |
| 1945 | Von Neumann architecture defined | Stored-program design: data and instructions in same memory. All modern computers follow this. |
| 1947 | Transistor invented (Bell Labs) | Shockley, Bardeen, Brattain. Replaced vacuum tubes. Enabled smaller, faster, cheaper computers. |
| 1948 | Shannon — Information Theory | Defines the bit. Sets fundamental limits on communication and compression. |
| 1949 | EDSAC — first practical stored-program computer | Wilkes, Cambridge. First computer to run programs stored in memory. |
| 1950 | Turing — Computing Machinery and Intelligence | Proposes the Turing Test for machine intelligence. Founds AI as a research question. |
| 1951 | UNIVAC I — first commercial computer | First mass-produced computer. Predicted Eisenhower's 1952 election win on live TV. |
| 1952 | Hopper — first compiler (A-0 System) | Proves programs can compile to machine code. Foundation of all high-level languages. |
| 1954 | IBM 704 | First mass-produced computer with floating-point arithmetic hardware. |
| 1956 | McCarthy coins "Artificial Intelligence" | Dartmouth Conference. AI established as a discipline. Lisp follows in 1958. |
| 1957 | FORTRAN released | First widely used high-level language. Scientific computing transformed. |
| 1958 | Integrated circuit invented | Kilby (TI) and Noyce (Fairchild). Multiple transistors on one chip. Moore's Law begins. |
| 1958 | Lisp created by McCarthy | First functional language. S-expressions, garbage collection, recursion. Still used in AI. |
| 1959 | COBOL developed | Hopper's English-language business programming. Runs ~$3T in daily financial transactions. |

## In this companion

This era's three profiles map directly onto three of this series' earliest guides: [`fortran.md`](../fortran.md) (Backus), [`cobol.md`](../cobol.md) (Hopper), and — indirectly, through the stored-program architecture every subsequent guide assumes without stating — [`6502-asm.md`](../6502-asm.md) (von Neumann). The 1958 milestone row is also [`scheme.md`](../scheme.md)'s and [`racket.md`](../racket.md)'s own point of origin: McCarthy's Lisp.

**Previous:** [Era II — The Theoretical Computer](era-2-theoretical-computer.md) · **Next:** [Era IV — The Software Revolution](era-4-software-revolution.md)
