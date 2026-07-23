# Resources & Cheat Sheet

## References

| Resource | Why it matters |
|---|---|
| [LangChain documentation](https://python.langchain.com/) | LCEL, `@tool`, and the current (post-1.0) API surface |
| [LangGraph documentation](https://langchain-ai.github.io/langgraph/) | `StateGraph`, conditional edges, cyclic agent design |
| [n8n documentation](https://docs.n8n.io/) | Self-hosted workflow automation, CLI reference |

## Sources for Module A4's verified 2026 claims

Every specific figure in `04-the-shift-harness-context-skills.md` was checked against a live web search run the day this appendix was written, not carried over from training data. The searches and their results:

- [What is OpenClaw? Your Open-Source AI Assistant for 2026 | DigitalOcean](https://www.digitalocean.com/resources/articles/what-is-openclaw) — OpenClaw's own nature, features, and 68,000+ GitHub star figure.
- [A Security Analysis of the OpenClaw AI Agent Framework (arXiv)](https://arxiv.org/pdf/2603.27517) — the academic security-analysis source for OpenClaw's own early exposure risks.
- [Google Antigravity — Wikipedia](https://en.wikipedia.org/wiki/Google_Antigravity) — Antigravity's launch timeline and positioning.
- [Google Antigravity Blog: Google Antigravity @ I/O 2026](https://antigravity.google/blog/google-io-2026) — the 2.0 shift toward managing teams of agents.
- [OpenClaw Put Apple Back in the AI Game—And Now They Can't Build Macs Fast Enough (Decrypt)](https://decrypt.co/366389/openclaw-apple-mac-mini-shortage-ai-2026) — OpenClaw named directly as a contributing cause of the Mac mini shortage.
- [Mac Studio, Mac mini Buyers Are Losing Options Amid AI Demand (TechRepublic)](https://www.techrepublic.com/article/news-apple-cuts-high-memory-mac-options-ai-demand/) and [Apple Kills $599 Mac Mini: AI Memory Crisis (SudoFlare)](https://sudoflare.com/technews/apple-mac-mini-price-hike-ai-memory-shortage-2026/) — wait-time figures, DRAM/NAND price increases, and the 30%-vs-8% AI server memory share of global DRAM production.
- [Hermes Agent vs OpenClaw: Full Comparison (2026) (Turing Post)](https://www.turingpost.com/p/hermes) and [OpenClaw vs Hermes Agent: Which Is Safer for Business? (Layer3Labs)](https://www.layer3labs.io/comparisons/openclaw-vs-hermes-agent) — Hermes' safer-by-default positioning and the honest CVE-exposure caveat.
- [The OpenClaw Ecosystem 2026: NVIDIA NemoClaw, NanoClaw, ClawHub & The IT Leader's Guide (innFactory)](https://innfactory.ai/en/blog/openclaw-ecosystem-clawhub-nemoclaw-nanoclaw-ai-agent-guide/) and [10 Best OpenClaw Alternatives in 2026 (Vellum)](https://www.vellum.ai/blog/best-openclaw-alternatives) — the fork ecosystem (NemoClaw, NanoClaw, zeroclaw, ironclaw, picoclaw, Nanobot).
- [AI Coding Tool Adoption 2026: Developer Survey Results (Digital Applied)](https://www.digitalapplied.com/blog/ai-coding-tool-adoption-2026-developer-survey) and [Claude Code vs Codex vs Cursor: The Best AI Coding Tool in 2026 (Cosmic)](https://www.cosmicjs.com/blog/claude-code-vs-codex-vs-cursor) — Claude Code/Cursor/Codex adoption, growth, and developer-satisfaction figures.

## One-page cheat sheet

| Idea | Where |
|---|---|
| `prompt \| model \| parser` — LCEL, a composable chain, verified with a deterministic fake model | A1 |
| A chain's string output is a real `str` subclass (`TextAccessor`), not a bare `str` | A1 |
| `@tool` — name, description, and args schema all introspected automatically | A1 |
| `StateGraph` — real cycles, conditional edges, genuine agent-shaped control flow | A2 |
| LCEL is a DAG; LangGraph is a cyclic state machine — a real, not cosmetic, difference | A2 |
| n8n — self-hostable, verified via a real headless Docker execution | A3 |
| Make/Zapier — described, explicitly not executed, same honest treatment as `6502-asm/`'s hardware signposts | A3 |
| Claude Code + Cursor is the most common real developer stack, not either/or | A4 |
| OpenClaw's own viral growth is a named, real contributing cause of the 2026 Mac mini/DRAM shortage | A4 |
| Hermes Agent — safer-by-default, verified precisely: newer, less-exposed, not proven-hardened | A4 |
| This entire 28-guide series is itself a live example of the harness/context/skills shift | A4 |

## A note on this appendix's verification tier

LangChain and LangGraph were verified by running real code against real installed packages, using a deterministic fake model specifically to keep the claim honest — the chain's wiring is verified, not any model's actual output. n8n was verified by actually executing a real workflow headlessly via Docker, including two genuine pieces of CLI friction (a deprecated flag, a schema requirement) discovered from real error output, and a separate macOS/colima bind-mount issue worked around with `docker cp`. Make and Zapier were explicitly not executed — named and discussed, flagged honestly as unverified, the same treatment `6502-asm/` gave hardware it had no headless emulator for. Every specific 2026 figure in Module A4 — adoption percentages, dollar figures, wait times, DRAM percentages, GitHub star counts, rename timelines — was checked against a live web search run the day this appendix was written, with every source listed above, rather than asserted from training data or repeated uncritically from the request that prompted this appendix.

## A note on this appendix's own expiration date

This is the one unit in `code-rookie` that is expected to go stale, on a timeline measured in months, not years — and that's stated here directly rather than left for a reader to discover the hard way. If you're reading this more than a few months after it was written: check the sources above for their own publication dates before trusting a specific number, and treat Module A4's own list of named tools as a snapshot of one moment in a fast-moving landscape, not a durable ranking.
