# A3 — No-Code Automation: n8n, Make, Zapier

LangChain and LangGraph (A1–A2) are code-first — a developer writes Python. A parallel, genuinely large ecosystem exists for people who don't write code at all: visual, node-and-wire workflow builders, where "connect an email trigger to an LLM call to a Slack message" is drawn, not written. n8n, Make, and Zapier are the three names that came up most in the request that shaped this appendix — and they get three different, honestly different levels of verification here.

## n8n: self-hostable, verified by actually running it

**Concept**

n8n is open-source and self-hostable (via Docker, among other options) — the one of these three platforms this appendix could actually run and verify directly, headlessly, with no account and no paid tier required.

**Example**

A minimal workflow — a manual trigger connected to a `Code` node computing a fixed result — imported and executed via n8n's own CLI, entirely inside a Docker container:

```json
{
  "id": "lang-history-wf-1",
  "name": "language-history-workflow",
  "nodes": [
    { "id": "1", "name": "Manual Trigger", "type": "n8n-nodes-base.manualTrigger", "typeVersion": 1, "position": [0, 0], "parameters": {} },
    { "id": "2", "name": "Compute", "type": "n8n-nodes-base.code", "typeVersion": 2, "position": [200, 0],
      "parameters": { "jsCode": "return [{ json: { language: 'Fortran', year: 1957, note: 'first widely-used high-level language' } }];" } }
  ],
  "connections": { "Manual Trigger": { "main": [[{ "node": "Compute", "type": "main", "index": 0 }]] } }
}
```

```bash
docker run --rm -v n8n_data:/home/node/.n8n n8nio/n8n:latest import:workflow --input=/home/node/workflow.json
docker run --rm -v n8n_data:/home/node/.n8n n8nio/n8n:latest execute --id=lang-history-wf-1 --rawOutput
```

```json
{ "language": "Fortran", "year": 1957, "note": "first widely-used high-level language" }
```

Verified directly, `"executionStatus": "success"`. Two genuine pieces of friction hit along the way, kept in rather than smoothed over — the same discipline this series has held to for every one of its 28 language guides: the `execute` command's `--file` flag is **deprecated** in this version, requiring a separate `import:workflow` step and executing by `--id` instead; and the workflow JSON needs its own top-level `"id"` field, not just per-node IDs — the first attempt without one failed with a real `SQLITE_CONSTRAINT: NOT NULL constraint failed: workflow_entity.id` error, read directly from n8n's own output, not guessed at from documentation.

> **Pitfall / gotcha:** running Docker on macOS through a VM layer (this appendix's own environment uses `colima`) introduced a real, separate friction: a bind-mounted host directory wasn't reliably visible inside a fresh container — a file created moments earlier on the host simply wasn't there when the container looked for it. The fix was `docker cp` into a container created (but not yet started) with `docker create`, sidestepping the mount-sync issue entirely. Worth knowing if n8n (or anything else) via Docker on macOS behaves as though a file "isn't there" that plainly exists on the host.

**Practice**

- Modify the `Code` node's `jsCode` to compute something different (say, a running list of several languages and their years) and verify the new output via the same `execute --id=... --rawOutput` command.
- Add a second `Code` node after the first, connected in sequence, and verify data flows from the first node's output into the second node's input correctly.

## Make and Zapier: described, not executed

**Concept**

Make (formerly Integromat) and Zapier are the two dominant commercial, account-gated no-code automation platforms — both genuinely widespread, both structurally similar to n8n (trigger → action nodes, connected visually), and both without any local, headless, or free-tier path this appendix could actually run and verify.

> **An explicit, honest gap, not a silent omission:** this appendix does not claim any specific, verified behavior for Make or Zapier — no workflow was built or executed in either. This is the same treatment `6502-asm/`'s NES/C64/Apple II hardware-register material got when no headless emulator existed to actually run it: named, discussed at the level of what's publicly documented, and explicitly flagged as *not* independently verified, rather than described with the same confidence as something this appendix genuinely ran.

**Practice**

- If you have access to a Make or Zapier account, build the equivalent of this module's n8n workflow (a manual trigger producing a fixed piece of data) and compare the actual authoring experience directly — what's easier, what's harder, verified by your own hands rather than by this appendix's description.

## Progress check

1. Of the three platforms this module names, which one was actually verified running, and why specifically that one and not the other two?
2. What two genuine pieces of friction did n8n's own CLI produce during this appendix's own verification, and how was each one resolved?
3. What real, separate friction came from running Docker via a VM layer on macOS specifically, and what was the fix?
4. What precedent, already established elsewhere in this series, does this module's honest treatment of Make and Zapier follow?

**Answers**

1. n8n — because it's open-source and self-hostable via Docker, with no account or paid tier required, unlike Make and Zapier, which are both purely account-gated SaaS platforms with no local execution path at all.
2. The `execute` command's `--file` flag is deprecated (requiring `import:workflow` first, then `execute --id=...`), and the workflow JSON needs a top-level `"id"` field, not just per-node IDs (a `SQLITE_CONSTRAINT: NOT NULL` error without one) — both discovered directly from real error output.
3. A bind-mounted host directory wasn't reliably visible inside a fresh container, even though the file plainly existed on the host — resolved with `docker cp` into a container created via `docker create` but not yet started, sidestepping the mount-sync issue.
4. `6502-asm/`'s treatment of hardware-register behavior for platforms with no headless emulator available — named and discussed precisely, explicitly flagged as not independently executed, rather than silently presented with the same confidence as verified material.
