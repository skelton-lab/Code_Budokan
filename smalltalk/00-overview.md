# Smalltalk — A Session-Based Study Guide

**Promise:** understand Smalltalk's genuinely radical version of "everything is an object" — not the approximation Ruby's guide already showed you, but the actual origin of that whole lineage — and see, directly, why C++ (per the Simula guide's Module 6) took a structurally different road than this one. Positioned, per your own sequencing, alongside Simula between the C and C++ guides.

**Audience:** comfortable with Ruby fundamentals (this series' `ruby/` companion) and the Simula guide immediately preceding this one — the contrast between the two is this guide's central framing device.

**Toolchain (anchored):** GNU Smalltalk (`gst`) 3.2.5 via Homebrew — real, installed, and verified. Unlike the Simula guide, everything executable in this guide actually runs.

**A real bug, found and worked around, not glossed over:** this specific `gst` build has a reproducible bug — calling `printString`, `displayString`, or `printNl` directly on **any** `Float` raises `ZeroDivide` from inside the float-printing algorithm itself, not from your code. Confirmed with the simplest possible case (`3.14159 printNl` fails identically to a computed float). The workaround used consistently throughout this guide: call `rounded` or `truncated` on a float before printing it, converting it to an `Integer` first, which prints fine. Flagged here, not silently avoided, per this whole series' verification discipline.

## Module list

1. **Foundations** — everything is truly an object, message syntax (unary/binary/keyword), toolchain setup (including the Float bug)
2. **Classes and instances**
3. **Message passing as the only mechanism** — even control flow is message sends
4. **Blocks** — Smalltalk's closures
5. **Inheritance and polymorphism** — the origin of the lineage Ruby's duck typing approximates
6. **Small demonstrations**
7. **Beyond this guide** — including the explicit Simula/Smalltalk/C++ synthesis
8. **Final assessment** + **Resources**

## Setup

```bash
brew install gnu-smalltalk
gst --version
```

```bash
gst program.st
```
