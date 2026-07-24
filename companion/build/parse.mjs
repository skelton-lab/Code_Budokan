// code-rookie companion — content build step.
//
// Parses the (unmodified) markdown corpus into structured JSON the static app
// renders from. Markdown is the single source of truth; nothing here writes back
// to the guides. Display HTML is rendered at build time so the shipped app needs
// no markdown library at runtime and works from file://.
//
// Usage: node build/parse.mjs   (run from companion/)

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import MarkdownIt from 'markdown-it';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const COMPANION = path.resolve(__dirname, '..');
const CORPUS = path.resolve(COMPANION, '..'); // code-rookie/
const HISTORY_DIR = path.join(COMPANION, 'history');
const APPENDIX_DIR = path.join(CORPUS, 'appendix-ai-orchestration');

// The full pathway, in the series' own stated teaching order (INDEX.md).
const PATHWAY = [
  'fortran', 'cobol', '6502-asm', 'c',
  'algol', 'pascal', 'modula2', 'simula', 'smalltalk', 'cpp',
  'javascript', 'ruby',
  'prolog', 'sql',
  'rails', 'php',
  'python', 'docker',
  'scheme', 'racket', 'clojure',
  'apl',
  'ocaml', 'haskell',
  'forth',
  'julia',
  'erlang',
  'go',
  'rust',
];

const md = new MarkdownIt({ html: false, linkify: true, typographer: false });

// ---------- small line-level helpers (fence-aware) ----------

const isFence = (line) => /^\s*(```|~~~)/.test(line);

// Split a markdown body into H2 sections. Returns { intro, sections:[{heading, level, content}] }.
// Fence-aware so a `## ` inside a code block is not treated as a heading.
function splitH2(body) {
  const lines = body.split('\n');
  const sections = [];
  let intro = [];
  let cur = null;
  let inFence = false;
  for (const line of lines) {
    if (isFence(line)) inFence = !inFence;
    const m = !inFence && /^##\s+(.*)$/.exec(line);
    if (m) {
      if (cur) sections.push(cur);
      cur = { heading: m[1].trim(), content: [] };
    } else if (cur) {
      cur.content.push(line);
    } else {
      intro.push(line);
    }
  }
  if (cur) sections.push(cur);
  return {
    intro: intro.join('\n').trim(),
    sections: sections.map((s) => ({ heading: s.heading, content: s.content.join('\n').trim() })),
  };
}

// Parse a markdown numbered list into [{ n, text }]. Multi-line and fence-aware:
// each item accumulates following lines (including blank lines and fenced code)
// until the next top-level `N.` marker.
function parseNumberedList(text) {
  const lines = text.split('\n');
  const items = [];
  let cur = null;
  let inFence = false;
  for (const line of lines) {
    // A new numbered item can only begin outside a fenced code block.
    const m = !inFence && /^(\d+)\.\s+(.*)$/.exec(line);
    if (m) {
      if (cur) items.push(cur);
      cur = { n: Number(m[1]), lines: [m[2]] };
      // The item's own content may itself open a fence (e.g. "11. ```fortran").
      if (/^(```|~~~)/.test(m[2].trim())) inFence = true;
      continue;
    }
    if (isFence(line)) inFence = !inFence; // fence opened/closed on its own line
    if (cur) cur.lines.push(line);
  }
  if (cur) items.push(cur);
  return items.map((it) => ({ n: it.n, text: it.lines.join('\n').trim() }));
}

// Everything after a bold marker line like `**Practice**`, collected as bullet items,
// stopping at the next bold-marker line, heading, or end.
function extractBulletsAfterMarker(content, markerRegex) {
  const lines = content.split('\n');
  const out = [];
  let capturing = false;
  let inFence = false;
  for (const line of lines) {
    if (isFence(line)) inFence = !inFence;
    if (!inFence && markerRegex.test(line.trim())) { capturing = true; continue; }
    if (!capturing) continue;
    if (!inFence && /^#{1,6}\s/.test(line)) break;                 // next heading
    if (!inFence && /^\*\*[^*].*\*\*\s*$/.test(line.trim())) break; // next bold marker
    const b = /^[-*]\s+(.*)$/.exec(line.trim());
    if (b) out.push(b[1].trim());
  }
  return out;
}

// Text following an inline bold marker, e.g. `**You'll be able to:** name all four ...`
function extractInlineAfterMarker(content, markerRegex) {
  const lines = content.split('\n');
  for (let i = 0; i < lines.length; i++) {
    const t = lines[i].trim();
    const m = markerRegex.exec(t);
    if (m) {
      let rest = t.slice(m.index + m[0].length).trim();
      // pull following non-blank continuation lines until blank
      let j = i + 1;
      while (!rest && j < lines.length && lines[j].trim()) { rest = lines[j].trim(); j++; }
      return rest.replace(/\*\*/g, '').trim();
    }
  }
  return null;
}

// Contiguous blockquote(s) containing "Pitfall". Returns array of plain-text pitfalls.
function extractPitfalls(content) {
  const lines = content.split('\n');
  const out = [];
  let buf = [];
  const flush = () => {
    if (buf.length) {
      const joined = buf.join(' ').replace(/\s+/g, ' ').trim();
      if (/pitfall/i.test(joined)) out.push(joined.replace(/\*\*/g, ''));
    }
    buf = [];
  };
  for (const line of lines) {
    const m = /^>\s?(.*)$/.exec(line);
    if (m) buf.push(m[1]);
    else flush();
  }
  flush();
  return out;
}

// Remove a whole H2 section (by heading predicate) from a body, returning the rest.
function stripSection(body, predicate) {
  const { intro, sections } = splitH2(body);
  const kept = sections.filter((s) => !predicate(s.heading));
  let out = intro ? intro + '\n\n' : '';
  for (const s of kept) out += `## ${s.heading}\n\n${s.content}\n\n`;
  return out.trim();
}

// ---------- module / file parsers ----------

function firstH1(text) {
  const m = /^#\s+(.*)$/m.exec(text);
  return m ? m[1].trim() : null;
}
function stripFirstH1(text) {
  return text.replace(/^#\s+.*$/m, '').replace(/^\s+/, '');
}
function titleFromH1(h1) {
  if (!h1) return null;
  // "Module 1 — Foundations & Divisions" -> "Foundations & Divisions"
  return h1.replace(/^Module\s+\d+\s*[—:-]\s*/i, '').trim();
}
function moduleNumberFromFile(file) {
  const m = /^(\d+)/.exec(file);
  return m ? Number(m[1]) : null;
}

// Attach build-time rendered HTML so the runtime app needs no markdown library.
function withQuizHtml(quiz) {
  return quiz.map((item) => ({
    ...item,
    qHtml: md.render(item.q).trim(),
    aHtml: item.a ? md.render(item.a).trim() : null,
  }));
}

function parseQuizFromProgressCheck(section) {
  // section.content = numbered questions ... "### Answers" ... numbered answers
  const parts = section.content.split(/^###\s+Answers\s*$/m);
  const qs = parseNumberedList(parts[0] || '');
  const as = parts[1] ? parseNumberedList(parts[1]) : [];
  const aByN = new Map(as.map((a) => [a.n, a.text]));
  return withQuizHtml(qs.map((q) => ({ n: q.n, q: q.text, a: aByN.get(q.n) || null })));
}

function parseModule(dir, file) {
  const raw = fs.readFileSync(path.join(dir, file), 'utf8');
  const h1 = firstH1(raw);
  const body = stripFirstH1(raw);
  const { intro, sections } = splitH2(body);

  const isProgress = (h) => /progress check/i.test(h);
  let quiz = [];
  const learningSections = [];
  const practice = [];
  const pitfalls = [];

  for (const s of sections) {
    if (isProgress(s.heading)) {
      quiz = parseQuizFromProgressCheck(s);
      continue;
    }
    const objective = extractInlineAfterMarker(s.content, /\*\*You'll be able to:\*\*/);
    const secPractice = extractBulletsAfterMarker(s.content, /^\*\*Practice\*\*/);
    const secPitfalls = extractPitfalls(s.content);
    learningSections.push({ heading: s.heading, objective });
    for (const p of secPractice) practice.push({ section: s.heading, text: p });
    for (const p of secPitfalls) pitfalls.push({ section: s.heading, text: p });
  }

  // Display HTML: everything except the progress-check section (quiz shown as flip cards).
  const displayBody = stripSection(body, isProgress);
  const html = md.render(displayBody);

  return {
    file,
    moduleNumber: moduleNumberFromFile(file),
    title: titleFromH1(h1) || h1 || file,
    kind: 'module',
    intro,
    html,
    sections: learningSections,
    objectives: learningSections.map((s) => s.objective).filter(Boolean),
    practice,
    pitfalls,
    quiz,
  };
}

function parseFinalAssessment(dir, file) {
  const raw = fs.readFileSync(path.join(dir, file), 'utf8');
  const h1 = firstH1(raw) || 'Final Assessment';
  const body = stripFirstH1(raw);
  // Split top (questions) from "## Answers".
  const parts = body.split(/^##\s+Answers\s*$/m);
  const head = parts[0] || '';
  // Intro = any prose before the first numbered question.
  const firstQ = /^\d+\.\s/m.exec(head);
  const intro = firstQ ? head.slice(0, firstQ.index).trim() : head.trim();
  const qs = parseNumberedList(firstQ ? head.slice(firstQ.index) : head);
  const as = parts[1] ? parseNumberedList(parts[1]) : [];
  const aByN = new Map(as.map((a) => [a.n, a.text]));
  const quiz = withQuizHtml(qs.map((q) => ({ n: q.n, q: q.text, a: aByN.get(q.n) || null })));
  return {
    file,
    moduleNumber: moduleNumberFromFile(file),
    title: h1,
    kind: 'assessment',
    intro,
    html: intro ? md.render(intro) : '',
    sections: [],
    objectives: [],
    practice: [],
    pitfalls: [],
    quiz,
  };
}

function parseTable(sectionContent) {
  const rows = sectionContent
    .split('\n')
    .map((l) => l.trim())
    .filter((l) => l.startsWith('|'));
  if (rows.length < 2) return null;
  const cells = (r) => r.replace(/^\|/, '').replace(/\|$/, '').split('|').map((c) => c.trim());
  const header = cells(rows[0]);
  const dataRows = rows.slice(2).map(cells); // skip header + separator
  return { header, rows: dataRows };
}

function parseOverview(dir, file) {
  const raw = fs.readFileSync(path.join(dir, file), 'utf8');
  const h1 = firstH1(raw);
  const body = stripFirstH1(raw);
  const { sections } = splitH2(body);
  const find = (re) => sections.find((s) => re.test(s.heading));

  const promiseM = /\*\*Promise:\*\*\s*([^\n]+)/.exec(raw);
  const toolchainM = /\*\*Toolchain[^:]*:\*\*\s*([^\n]+)/.exec(raw);
  const audienceM = /\*\*Audience:\*\*\s*([^\n]+)/.exec(raw);

  const capstoneSec = find(/capstone log/i);
  const moduleListSec = find(/module list/i);

  return {
    title: h1,
    promise: promiseM ? promiseM[1].replace(/\*\*/g, '').trim() : null,
    audience: audienceM ? audienceM[1].replace(/\*\*/g, '').trim() : null,
    toolchain: toolchainM ? toolchainM[1].replace(/\*\*/g, '').trim() : null,
    capstones: capstoneSec ? parseTable(capstoneSec.content) : null,
    moduleList: moduleListSec ? parseNumberedList(moduleListSec.content).map((i) => i.text.replace(/\*\*/g, '')) : [],
    html: md.render(body),
  };
}

// ---------- companion (historical context) ----------

// Plain `- ` bullets, one per physical line (the shape every companion file uses
// for its reflection prompts and guide-links lists — no multi-line bullets).
function extractPlainBullets(content) {
  return content
    .split('\n')
    .map((l) => l.trim())
    .filter((l) => /^[-*]\s+/.test(l))
    .map((l) => l.replace(/^[-*]\s+/, '').trim());
}

// A companion `## Short-answer questions` numbered item is `**question?** answer text`.
function splitQA(text) {
  const m = /^\*\*(.+?)\*\*\s*([\s\S]*)$/.exec(text);
  return m ? { q: m[1].trim(), a: m[2].trim() } : { q: text, a: '' };
}

// A companion `## Links into the guide` bullet is `[\`slug/file.md\`](../slug/file.md) — description`.
function parseGuideLink(line) {
  const m = /\[`([^`]+)`\]\(([^)]+)\)\s*(?:—|-)\s*(.*)$/.exec(line);
  if (!m) return null;
  const ref = m[1];
  const parts = ref.split('/');
  const refSlug = parts.length > 1 ? parts[0] : null;
  const refFile = parts[parts.length - 1];
  return { ref, slug: refSlug, file: refFile, description: m[3].trim() };
}

// Parses companion/<slug>.md — the historical-context layer built alongside (never
// written into) the guide corpus. Returns null if no companion file exists for slug.
function parseCompanion(slug) {
  const file = path.join(COMPANION, slug + '.md');
  if (!fs.existsSync(file)) return null;
  const raw = fs.readFileSync(file, 'utf8');
  const body = stripFirstH1(raw);
  const { intro, sections } = splitH2(body);
  const find = (re) => sections.find((s) => re.test(s.heading));

  const noteSec = find(/historical note/i);
  const reflSec = find(/reflection prompts/i);
  const qaSec = find(/short-answer questions/i);
  const linksSec = find(/links into the guide/i);
  const crossSec = find(/cross-thread connection/i);

  const reflectionPrompts = reflSec ? extractPlainBullets(reflSec.content) : [];

  const shortAnswer = qaSec
    ? parseNumberedList(qaSec.content).map((it) => {
        const { q, a } = splitQA(it.text);
        return { n: it.n, q, a, qHtml: md.renderInline(q), aHtml: md.render(a) };
      })
    : [];

  const links = linksSec
    ? extractPlainBullets(linksSec.content).map(parseGuideLink).filter(Boolean)
    : [];

  return {
    slug,
    foundingHtml: intro ? rewriteRootLinks(md.render(intro)) : '',
    historicalHtml: noteSec ? rewriteRootLinks(md.render(noteSec.content)) : '',
    reflectionPrompts,
    shortAnswer,
    links,
    crossThreadHtml: crossSec ? rewriteRootLinks(md.render(crossSec.content)) : '',
  };
}

// ---------- history/ (the converted History-of-Computing document) ----------
//
// companion/*.md files link into companion/history/*.md, and the history files
// link to each other and back into companion/*.md, all as real relative markdown
// paths (so the files stay correct as plain markdown, e.g. on GitHub). At build
// time those hrefs get rewritten to the app's own hash routes so they resolve
// inside the SPA too, instead of 404ing against the static file server.

// From a companion/<slug>.md file: `history/era-3-....md` or `history/....md#anchor`.
function rewriteRootLinks(html) {
  return html.replace(
    /href="history\/([a-zA-Z0-9_-]+)\.md(#[a-zA-Z0-9_-]*)?"/g,
    (_, slug, anchor) => `href="#/history/${slug}${anchor || ''}"`
  );
}

// From a companion/history/<file>.md file: a bare sibling `era-2-....md` (or
// `00-overview.md`, `reading-list.md`, `biographical-index.md`) routes within
// history/; a single `../fortran.md` routes to that guide's companion page;
// `../../appendix-ai-orchestration/NN-....md` routes into the appendix.
function rewriteHistoryLinks(html) {
  html = html.replace(
    /href="\.\.\/\.\.\/appendix-ai-orchestration\/([a-zA-Z0-9_-]+)\.md"/g,
    (_, slug) => `href="#/appendix/${slug}"`
  );
  return html.replace(
    /href="(\.\.\/)?([a-zA-Z0-9_-]+)\.md(#[a-zA-Z0-9_-]*)?"/g,
    (_, up, slug, anchor) => (up ? `href="#/guide/${slug}"` : `href="#/history/${slug}${anchor || ''}"`)
  );
}

function parseHistoryDoc(filename) {
  const raw = fs.readFileSync(path.join(HISTORY_DIR, filename), 'utf8');
  const h1 = firstH1(raw);
  const body = stripFirstH1(raw);
  const slug = filename.replace(/\.md$/, '');
  return { slug, title: h1 || slug, html: rewriteHistoryLinks(md.render(body)) };
}

function buildHistory() {
  if (!fs.existsSync(HISTORY_DIR)) return null;
  const files = fs.readdirSync(HISTORY_DIR).filter((f) => f.endsWith('.md')).sort();
  return { docs: files.map(parseHistoryDoc) };
}

// ---------- appendix-ai-orchestration/ (post-transformer orchestration appendix) ----------

function parseAppendixDoc(filename) {
  const raw = fs.readFileSync(path.join(APPENDIX_DIR, filename), 'utf8');
  const h1 = firstH1(raw);
  const body = stripFirstH1(raw);
  const slug = filename.replace(/\.md$/, '');
  return { slug, title: h1 || slug, html: md.render(body) };
}

function buildAppendix() {
  if (!fs.existsSync(APPENDIX_DIR)) return null;
  const files = fs.readdirSync(APPENDIX_DIR).filter((f) => f.endsWith('.md')).sort();
  return { docs: files.map(parseAppendixDoc) };
}

// ---------- cross-guide threads from INDEX.md ----------

function parseThreads() {
  const raw = fs.readFileSync(path.join(CORPUS, 'INDEX.md'), 'utf8');
  const { sections } = splitH2(raw);
  const threadSec = sections.find((s) => /cross-guide threads/i.test(s.heading));
  if (!threadSec) return [];
  // Split the section body on H3 subsection headings.
  const lines = threadSec.content.split('\n');
  const threads = [];
  let cur = null;
  let inFence = false;
  for (const line of lines) {
    if (isFence(line)) inFence = !inFence;
    const m = !inFence && /^###\s+(.*)$/.exec(line);
    if (m) {
      if (cur) threads.push(cur);
      cur = { name: m[1].replace(/\s*\(.*\)\s*$/, '').trim(), rawName: m[1].trim(), body: [] };
    } else if (cur) {
      cur.body.push(line);
    }
  }
  if (cur) threads.push(cur);
  return threads.map((t) => ({ name: t.name, rawName: t.rawName, html: md.render(t.body.join('\n').trim()) }));
}

// ---------- guide assembly ----------

function parseGuide(slug) {
  const dir = path.join(CORPUS, slug);
  const files = fs
    .readdirSync(dir)
    .filter((f) => f.endsWith('.md'))
    .sort((a, b) => (moduleNumberFromFile(a) ?? 999) - (moduleNumberFromFile(b) ?? 999));

  let overview = null;
  const modules = [];
  let resourcesHtml = null;

  for (const file of files) {
    if (file === '00-overview.md') {
      overview = parseOverview(dir, file);
    } else if (file === '99-resources.md') {
      const raw = fs.readFileSync(path.join(dir, file), 'utf8');
      resourcesHtml = md.render(stripFirstH1(raw));
    } else if (/final-assessment/i.test(file)) {
      modules.push(parseFinalAssessment(dir, file));
    } else {
      modules.push(parseModule(dir, file));
    }
  }

  const companion = parseCompanion(slug);
  if (companion) {
    // Attach same-guide companion links to their own module, so the module page
    // can point back to the guide's own Historical Context panel.
    const byFile = new Map(modules.map((m) => [m.file, m]));
    for (const link of companion.links) {
      if (link.slug === slug || link.slug === null) {
        const m = byFile.get(link.file);
        if (m) (m.companionLinks || (m.companionLinks = [])).push(link);
      }
    }
  }

  return {
    slug,
    title: overview?.title || slug,
    promise: overview?.promise || null,
    audience: overview?.audience || null,
    toolchain: overview?.toolchain || null,
    setupDocUrl: null, // author-supplied external setup doc; wired per-guide later
    overview,
    modules,
    resourcesHtml,
    companion,
  };
}

// ---------- main ----------

function build() {
  const guides = PATHWAY.map(parseGuide);
  const threads = parseThreads();
  const socraticPrompt = fs.readFileSync(path.join(COMPANION, 'templates', 'socratic-prompt.md'), 'utf8');
  const reflection = JSON.parse(fs.readFileSync(path.join(COMPANION, 'templates', 'reflection.json'), 'utf8'));
  const data = {
    generatedAt: new Date().toISOString(),
    pathway: PATHWAY,
    guides,
    threads,
    history: buildHistory(),
    appendix: buildAppendix(),
    socraticPrompt,
    reflection,
  };

  const dataDir = path.join(COMPANION, 'data');
  fs.mkdirSync(dataDir, { recursive: true });
  const json = JSON.stringify(data, null, 2);
  fs.writeFileSync(path.join(dataDir, 'content.json'), json);

  // window-global form so the app loads under file:// without fetch().
  const jsOut = `// AUTO-GENERATED by build/parse.mjs — do not edit.\nwindow.CODE_ROOKIE_DATA = ${JSON.stringify(data)};\n`;
  fs.writeFileSync(path.join(COMPANION, 'app', 'content.js'), jsOut);

  // Console summary (also the verification signal).
  console.log(`Built ${guides.length} guides @ ${data.generatedAt}`);
  for (const g of guides) {
    const mods = g.modules.filter((m) => m.kind === 'module').length;
    const assess = g.modules.filter((m) => m.kind === 'assessment').length;
    const quizItems = g.modules.reduce((n, m) => n + m.quiz.length, 0);
    const practice = g.modules.reduce((n, m) => n + m.practice.length, 0);
    const pitfalls = g.modules.reduce((n, m) => n + m.pitfalls.length, 0);
    const objectives = g.modules.reduce((n, m) => n + m.objectives.length, 0);
    const companionQA = g.companion?.shortAnswer.length ?? 0;
    console.log(
      `  ${g.slug.padEnd(9)} title="${g.title}" modules=${mods} assessments=${assess} ` +
      `objectives=${objectives} practice=${practice} pitfalls=${pitfalls} quizItems=${quizItems} ` +
      `capstones=${g.overview?.capstones?.rows.length ?? 0} companionQA=${companionQA}${g.companion ? '' : ' (no companion)'}`
    );
  }
  console.log(`  threads=${threads.length}`);
}

build();
