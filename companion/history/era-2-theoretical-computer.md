# Era II — The Theoretical Computer (1930–1945)

Three figures dominate this era: Turing, who defined what a computer could compute; Church, who provided an equivalent formalism from a different direction; and Shannon, who showed how Boolean logic could be implemented in electronic switches. Between them, they provided the complete theoretical foundation for the computer before a single electronic computer had been built.

## Profiles

### Alan Turing (1912–1954) · English mathematician, logician, cryptanalyst

Alan Turing is the central figure of theoretical computer science. His 1936 paper "On Computable Numbers, with an Application to the Entscheidungsproblem" defined the Turing Machine — an abstract model of computation consisting of an infinite tape, a read/write head, and a finite set of transition rules. Turing proved that this simple device could simulate any computation that could be precisely specified. He also proved the halting problem: there is no general algorithm that can determine whether an arbitrary Turing Machine will eventually halt. This negative result was the first demonstration that there are well-defined problems that no computer can solve. During World War II, Turing led the team at Bletchley Park that broke the German Enigma cipher, an achievement credited with shortening the war by two years. After the war, he developed the Turing Test for machine intelligence (1950) and worked on early computer designs at Manchester.

**Key contributions**
- Defined the Turing Machine — the universal model of computation (1936)
- Proved the halting problem — the first computational undecidability result
- Led the Enigma code-breaking team at Bletchley Park (1939–1945)
- Proposed the Turing Test for machine intelligence (1950)
- Designed the ACE (Automatic Computing Engine) for NPL
- Pioneered morphogenesis research — reaction-diffusion systems (1952)

**Legacy.** The Turing Award — the highest honour in computer science, often called the "Nobel Prize of Computing" — is named for him. His 1936 paper defines what is and is not computable to this day. Convicted of "gross indecency" in 1952 for a consensual homosexual relationship, he died in 1954 of cyanide poisoning — widely but not definitively attributed to suicide. He received a posthumous royal pardon in 2013.

**Key work:** *Turing, A. M. (1936). On Computable Numbers, with an Application to the Entscheidungsproblem. Proceedings of the London Mathematical Society, 42(1), 230–265.*

### Alonzo Church (1903–1995) · American mathematician and logician

Alonzo Church developed the Lambda Calculus (1936) — a formal system for expressing functions and their application — independently of and simultaneously with Turing's work. Church proved the same undecidability results as Turing from a different direction. The Church-Turing Thesis, derived from both bodies of work, states that any effectively computable function can be computed by a Turing Machine (and equivalently, expressed in the lambda calculus). This thesis — not provable, but widely accepted — defines the limits of computation.

**Key contributions**
- Developed the Lambda Calculus (1936) — a formal system for function computation
- Proved the undecidability of the Entscheidungsproblem via lambda calculus
- Co-established the Church-Turing Thesis
- Lambda calculus is the theoretical foundation of functional programming languages

**Legacy.** Every functional programming language — Lisp, Haskell, ML, Erlang — is a practical implementation of ideas from Church's lambda calculus. The `lambda` keyword in Python is a direct descendant.

**Key work:** *Church, A. (1936). An unsolvable problem of elementary number theory. American Journal of Mathematics, 58(2), 345–363.*

### Claude Shannon (1916–2001) · American mathematician and electrical engineer

Claude Shannon's 1937 master's thesis at MIT — "A Symbolic Analysis of Relay and Switching Circuits" — is one of the most important technical documents of the twentieth century. Shannon demonstrated that the Boolean algebra developed by Boole in 1854 could describe the operation of electrical switching circuits: an open switch represents 0 (False), a closed switch represents 1 (True), and the series/parallel arrangement of switches implements AND/OR/NOT operations. This insight unified abstract mathematical logic with practical electrical engineering and provided the theoretical foundation for digital circuit design. Shannon went on to found information theory with "A Mathematical Theory of Communication" (1948), which defined information entropy, the bit as the unit of information, and the fundamental limits of data compression and transmission.

**Key contributions**
- Proved Boolean algebra describes switching circuits (1937 thesis)
- Founded information theory — entropy, bits, channel capacity (1948)
- Defined the maximum rate of error-free communication (Shannon's theorem)
- Pioneered cryptography theory and secure communication
- Built the first chess-playing computer and early AI systems

**Legacy.** Shannon's 1937 thesis is the direct theoretical ancestor of every transistor, logic gate, and integrated circuit. His 1948 information theory paper is the foundation of all digital communications, data compression, and coding theory. The "bit" as a unit of information is Shannon's contribution.

**Key work:** *Shannon, C. E. (1937). A Symbolic Analysis of Relay and Switching Circuits. Master's Thesis, MIT. Also: Shannon, C. E. (1948). A Mathematical Theory of Communication. Bell System Technical Journal, 27, 379–423.*

## Milestones

| Year | Event / invention | Significance |
|---|---|---|
| 1931 | Gödel — Incompleteness Theorems | Proves limits of formal systems. Directly motivates Turing's halting problem. |
| 1936 | Turing — Turing Machine paper | Defines computation. Proves halting problem undecidable. Foundation of CS theory. |
| 1936 | Church — Lambda Calculus | Independent equivalent model of computation. Foundation of functional programming. |
| 1937 | Shannon — Boolean switching circuits thesis | Unifies Boolean logic and electrical engineering. Foundation of digital circuit design. |
| 1941 | Zuse Z3 — first programmable computer | First Turing-complete electromechanical computer. Binary floating-point arithmetic. |
| 1943 | Colossus at Bletchley Park | First electronic computer. Built to break the Lorenz cipher. Led by Tommy Flowers. |
| 1945 | Von Neumann — EDVAC report | Defines stored-program architecture. Memory holds both data and instructions. Basis of all modern computers. |

## In this companion

Church's lambda calculus is the direct theoretical ancestor of every guide in this series with a functional core — [`scheme.md`](../scheme.md), [`racket.md`](../racket.md), [`haskell.md`](../haskell.md), [`ocaml.md`](../ocaml.md), and [`clojure.md`](../clojure.md) all trace back to this profile, even though none of their own founding papers were written until Era III or later. Turing's halting problem is the theoretical ceiling every guide's own recursion and control-flow material quietly operates under.

**Previous:** [Era I — Mathematical Foundations](era-1-mathematical-foundations.md) · **Next:** [Era III — The Electronic Computer](era-3-electronic-computer.md)
