# code-rookie companion

A gamified, self-actualization-oriented **companion interface** layered over the
[`code-rookie`](../INDEX.md) polyglot study series. It's a *guide and a game*, not an
editor or a code runner: you read here, run the code in **your own** IDE, get coached by
**your own** LLM (Socratically — it asks questions, it doesn't write your code), reflect,
and export a **portfolio** you push to your own GitHub.

Initial pathway: **Fortran · COBOL · 6502 Assembly · ALGOL**.

## Design invariants

- **The guides' markdown is never modified.** This is a layer *over* the content.
- **Fully static. No backend, no server-side execution, no API keys.** One build output
  serves both a local folder and an LMS embed (Canvas / Skool).
- **All student state is local** (`localStorage`), exported on demand. Nothing phones home.
- **Generic framework, authored once**, applied to every module by parsing the markdown.

## Build

```bash
cd companion
npm install        # one build-time dependency: markdown-it
npm run build      # parses ../<guide>/*.md  ->  app/content.js (+ data/content.json)
```

`build/parse.mjs` renders each module's markdown to HTML **at build time** and extracts the
framework data (objectives, practice items, pitfalls, progress-check Q&A, final assessment,
overview capstones, and the cross-guide threads from `INDEX.md`). It also inlines the two
templates. Output is written as a `window.CODE_ROOKIE_DATA` global in `app/content.js` so the
app loads with a plain `<script>` tag — **no runtime `fetch`**, which is what lets it run from
`file://` and inside an LMS.

## Run

- **Local server:** `npm run serve` → http://localhost:8080 (set `PORT` to change).
- **No server at all:** open `app/index.html` directly in a browser (double-click). Works
  because the data is injected via a script tag, routing is hash-based, and there is no
  `fetch`/XHR.
- **LMS (Canvas / Skool):** upload the contents of `app/` (`index.html`, `styles.css`,
  `app.js`, `content.js`) as static files / an embed. All asset paths are relative.

## What the framework gives every module

| Piece | Where | Notes |
|---|---|---|
| **Coach me** (Socratic prompt) | `templates/socratic-prompt.md` | Fills `{{language}} {{module}} {{section}} {{objective}} {{task}}` and copies to clipboard for *your* LLM. Guardrails: no answers, questions only. |
| **Reflection card** | `templates/reflection.json` | Same prompts + 1–5 ratings on every module. Feeds the portfolio. |
| **Flip-card quizzes** | parsed from `## Progress check` / final assessment | Self-graded (got it / review). |
| **Journal → portfolio** | in-app | Exports `PORTFOLIO.md`: overview report, per-module reflections, capstone notes, self-check scores, a **preference/aptitude summary**, and a commit-ready repo layout. |
| **Gamification** | in-app | XP, level, streak, per-guide progress, badges. Thread data is captured now so a visual skill tree can be added later. |
| **Environment setup link** | `guide.setupDocUrl` (currently `null`) | Point this at your own per-language setup doc; the UI already shows the slot. |

## Extending

- **Add a language pack:** drop its folder into the corpus, add its slug to `PATHWAY` in
  `build/parse.mjs`, re-run `npm run build`. (The parser is generic; the other 20 guides in
  the corpus come online the same way.)
- **Wire a setup doc:** set `setupDocUrl` for the guide (in `parse.mjs` guide assembly).
- **Swap an assessment:** it's parsed from the markdown, so edit the source guide's quiz — the
  renderer is schema-driven.

## Layout

```
companion/
  build/parse.mjs     # markdown -> content.js / content.json (build-time HTML render)
  build/serve.mjs     # zero-dep static server for local dev
  templates/          # socratic-prompt.md, reflection.json (inlined at build)
  app/                # the shippable static site (index.html, styles.css, app.js, content.js)
  data/content.json   # generated, for inspection
```
