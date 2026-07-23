# Module 5 — Capstone 2: The `report` Tool, Fully Containerized

**Proves:** base image selection, `COPY`ing only what runs, `ENTRYPOINT`/`CMD`, and `.dockerignore` (Module 4).

The complete, assembled containerization of `python/07-capstone-cli-tool.md`'s `report` tool — this guide's central running thread, brought together into one real, working image, plus one genuinely new addition Module 4 didn't need: `.dockerignore`, with a real, verified gotcha about how its patterns actually match. Every command below is a real, verified `docker` run.

## The complete image

```dockerfile
FROM python:3.12-slim

WORKDIR /app
COPY code_rookie_python/ ./code_rookie_python/
COPY sample_transactions.csv .

ENTRYPOINT ["python3", "-m", "code_rookie_python.cli"]
CMD ["sample_transactions.csv"]
```

```bash
docker build -t report-tool:v1 .
docker run --rm report-tool:v1
```

Verified: `electronics: 45.00`, `hardware: 80.00` — the identical output `python/07-capstone-cli-tool.md` produced running `uv run report /tmp/transactions.csv`, now produced by a container that needs nothing installed on whatever machine runs it beyond a working `docker` — not `uv`, not a matching Python version, not this project's `.venv` at all. This is Docker's actual value proposition, proven concretely rather than asserted: the same real tool, from this same series, genuinely portable.

## `.dockerignore`, and a real gotcha in how its patterns match

**You'll be able to:** exclude unwanted files from a build context, and avoid a real, easy-to-get-wrong pattern mistake.

**Concept**

`.dockerignore` (same syntax family as `.gitignore`) excludes files from what `COPY`/`ADD` can see, keeping build contexts smaller and avoiding accidentally baking in things like `__pycache__/` directories or local virtual environments.

**Example — the naive pattern, verified to fail:**

```
__pycache__/
*.pyc
```

With a stray `code_rookie_python/__pycache__/cli.cpython-312.pyc` present in the build context, building and then checking the container directly:

```bash
docker run --rm --entrypoint find report-tool:v3 /app -name "*.pyc"
```

Verified: `/app/code_rookie_python/__pycache__/cli.cpython-312.pyc` — the file was copied in anyway. The naive pattern `__pycache__/` only matches at the **root** of the build context by default; it does not match a `__pycache__` directory nested inside `code_rookie_python/`.

**The fix, verified directly:**

```
**/__pycache__/
**/*.pyc
```

Verified: rebuilding with `**/` prefixed patterns, the identical `find /app -name "*.pyc"` check now returns nothing — the file is correctly excluded from the image, at any depth in the build context, not just the root.

> **Pitfall, genuinely easy to miss:** a `.dockerignore` pattern that looks like it should obviously match a directory anywhere in the project (the same instinct a `.gitignore` entry like `__pycache__/` satisfies, since `git` does match it at any depth) silently doesn't do the same thing for Docker's default pattern-matching rules. The result isn't an error — the file just quietly ends up in the image anyway, discoverable only by actually checking, exactly as this capstone did with `docker run --entrypoint find`.

## Verifying the full capstone end to end

```bash
docker run --rm report-tool:v1 sample_transactions.csv --min-amount 40
```

Verified: `electronics: 45.00`, `hardware: 50.00` — matching `python/07-capstone-cli-tool.md`'s own `--min-amount 40` result exactly. Three completely different ways of running this exact code across this series now agree: `uv run report` (the Python guide's own verification), and now a container that needs none of that project's toolchain installed at all.

> **Pitfall:** this capstone's image still starts from `python:3.12-slim` — genuinely small for a Python base image, but not the smallest this tool could possibly need, since the tool itself uses only the standard library. Module 6's multi-stage build session pushes this further, and measures exactly how much further, with real before/after image sizes.

## Practice

- Add `.venv/`, `__pycache__/`, and `*.pyc` (each with a `**/` prefix, per this capstone's verified fix) to a `.dockerignore` for the *actual* `python/` project directory (not this capstone's minimal copy), and confirm a build using that full directory as context doesn't accidentally include the host's own `.venv`.
- Run `docker run --rm --entrypoint ls report-tool:v1 /app` and confirm exactly which files made it into the final image — does anything appear that you wouldn't have expected from the Dockerfile's two `COPY` instructions alone?
- Explain, in your own words, why this capstone's verification (comparing container output against `python/`'s own `uv run` output) is a stronger claim than just "the container built and ran without error" — what would a build-succeeded-but-wrong-output failure have looked like, and how would this capstone's specific verification method have caught it?
