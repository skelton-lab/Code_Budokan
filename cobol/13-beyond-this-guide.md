# Module 13 — Beyond This Guide

Every topic here failed the capstone-impact test — real, worth knowing exists, but not required by any of this guide's four capstones or its stated promise. Each entry states what it is, why it matters, and where to go deeper.

### CICS and mainframe JCL

**What it is:** CICS (Customer Information Control System) is IBM's transaction-processing monitor — in most real production COBOL shops, programs aren't run as standalone executables the way every example in this guide has been; they're invoked as transactions under CICS, or scheduled as batch jobs described in JCL (Job Control Language), on an actual IBM mainframe (z/OS).

**Why it matters:** this is, honestly, how most COBOL actually runs in the world — a reader taking a real COBOL-maintenance job will meet CICS and JCL far more often than a bare `cobc`-compiled binary. This guide doesn't teach it for the most direct possible reason: it's IBM-mainframe-specific, and there's no installable, runnable toolchain on this guide's own machine to verify a single example against — every other module here earned its content by actually running it, and this is the one area where that standard genuinely can't be met without mainframe access.

**Minimal taste:** a JCL job step invoking a compiled COBOL program looks roughly like:
```
//STEP1    EXEC PGM=BILLMAIN
//SALESIN  DD DSN=PROD.SALES.INPUT,DISP=SHR
//REPTOUT  DD SYSOUT=*
```
— `DD` statements map logical file names (matching `SELECT ... ASSIGN TO` names in the COBOL source) to actual mainframe datasets, the JCL-level equivalent of this guide's `ASSIGN TO "filename.dat"`.

**Where to go next:** IBM's own z/OS and CICS documentation; IBM Enterprise COBOL's language reference for how its dialect (which this guide's GnuCOBOL anchor deliberately doesn't chase) differs in file-handling specifics.

### The Report Writer facility

**What it is:** an older, declarative alternative to Module 6's hand-written control-break logic — you describe a report's layout (headers, detail lines, control breaks, totals) declaratively in a `REPORT SECTION`, and the runtime generates the control-break logic for you, rather than writing the `IF ... NOT = WS-PREV-REGION` check by hand.

**Why it matters:** genuinely still present in the COBOL standard and in real legacy code, but superseded in modern practice by exactly the hand-written pattern this guide taught in Module 6 — most current COBOL work reads and writes control-break logic directly rather than through `Report Writer`'s declarative layer.

**Where to go next:** the COBOL language reference's `REPORT SECTION` chapter; GnuCOBOL's own documentation for its specific (partial) `Report Writer` support.

### Screen Section (terminal I/O)

**What it is:** a `SCREEN SECTION`, declared in `DATA DIVISION`, describing a full-screen terminal form — field positions, prompts, input fields — for interactive (not batch) COBOL programs.

**Why it matters:** confirmed to compile correctly on this guide's own toolchain —

```cobol
       SCREEN SECTION.
       01  SCR-PROMPT.
           05  BLANK SCREEN.
           05  LINE 1 COLUMN 1 VALUE "Name: ".
           05  LINE 1 COLUMN 7 PIC X(20) TO WS-NAME.
```

— but not core to this guide's batch/file-processing promise; every capstone here reads its input from a file or `ACCEPT`, never a full-screen form.

**Where to go next:** GnuCOBOL's `SCREEN SECTION` documentation; `DISPLAY`/`ACCEPT ... LINE ... COLUMN` for simpler, non-full-screen positioned I/O.

### Object-oriented COBOL

**What it is:** the 2002 COBOL standard added `CLASS-ID`, `METHOD-ID`, and `INVOKE` — real, standardized object-oriented syntax layered on top of everything this guide taught.

**Why it matters, verified precisely rather than assumed:** tested directly against this guide's own anchored toolchain — GnuCOBOL 3.2 recognizes `CLASS-ID` as a reserved word but does not implement it, confirmed across every dialect this build offers (`cobol2002`, `cobol2014`, `mf`, `ibm`, `default`) — every one rejects it identically: `'CLASS-ID' is a reserved word, but isn't supported`. This is worth naming as more than "rarely used in practice" — on this guide's specific, real toolchain, it doesn't run at all. This series has a running polymorphism thread (`C`'s hand-assigned function pointer → Simula's `virtual` → C++ → JavaScript's prototypes → Smalltalk's late-bound message sends → Ruby's duck typing) that OOP COBOL would, in principle, be one more entry in — a language from the batch/file-processing world reaching for the same mechanism decades later. This guide can't verify a working example of it the way every other capstone here was verified, so it stays a named signpost rather than a claimed, demonstrated connection.

**Where to go next:** the ISO/IEC COBOL 2002 standard's object-oriented syntax chapter; Micro Focus Visual COBOL or IBM Enterprise COBOL, both of which do implement it, for a toolchain where it can actually be run and verified.

## The wider ecosystem

- **GnuCOBOL's own documentation** (`https://gnucobol.sourceforge.io/`) — the reference for everything this guide anchored to, including flags and dialects not covered here.
- **This series' [Fortran guide](../fortran/00-overview.md)** — COBOL's contemporary from the same founding era of computing, business data processing's counterpart to Fortran's scientific computing.
- **This series' [SQL guide](../sql/00-overview.md)** — the direct successor to what Module 8's indexed files solve by hand; `RECORD KEY` and `PRIMARY KEY` answering the same problem, decades apart.
- **This series' [C guide](../c/00-overview.md)** — Module 10's C-interop capstone extension is a direct, real instance of this series' "C as universal FFI target" thread, made unusually easy by GnuCOBOL's own C-based compilation pipeline.
