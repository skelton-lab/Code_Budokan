# Module 4 — Containerizing a Real Python App

`python/07-capstone-cli-tool.md`'s `report` CLI tool, packaged into a real Docker image — the guide's central running thread starts here. `cli.py` and `pipeline.py` turn out to use nothing but the Python standard library (`argparse`, `dataclasses`, `collections.abc`) — no PyTorch, no Keras, no NumPy, despite living in the same project as three ML capstones that need all three — which matters directly for what this module actually needs to install. Every command below is a real, verified `docker` run. Feeds Capstone 2.

## Choosing a base image

**You'll be able to:** explain the size/compatibility trade-off between common Python base image variants.

**Concept**

`python:3.12-slim` is a Debian-based image with Python installed and the heaviest unnecessary OS packages stripped out — the standard, reasonable default. `python:3.12` (no `-slim`) includes a fuller set of OS build tools, useful if something needs to compile a C extension during install; `python:3.12-alpine` is smaller still, but Alpine's different C library (`musl`, not `glibc`) occasionally breaks packages that ship precompiled binaries expecting `glibc`. This guide anchors to `python:3.12-slim` — verified to work directly for this module's needs, with no compiled-dependency complications.

```bash
docker pull python:3.12-slim
docker run --rm python:3.12-slim python3 --version
```

Verified: `Python 3.12.13`.

## `COPY`ing only what actually runs

**You'll be able to:** identify exactly which source files a real Python tool needs at runtime, and containerize only those.

**Concept**

This project's shared `pyproject.toml` declares `torch`, `keras`, and `numpy` as dependencies — genuinely required for the three ML capstones, but not for `report` at all. Checking `cli.py`'s and `pipeline.py`'s actual imports directly confirms this: `argparse`, `sys`, `dataclasses`, `collections.abc` — every one of them standard library. Containerizing this specific tool needs nothing installed at all beyond the base image's own Python.

**Example**

```dockerfile
FROM python:3.12-slim

WORKDIR /app
COPY code_rookie_python/ ./code_rookie_python/
COPY sample_transactions.csv .

ENTRYPOINT ["python3", "-m", "code_rookie_python.cli"]
CMD ["sample_transactions.csv"]
```

Two `COPY` instructions: the actual package (`cli.py`, `pipeline.py`, `__init__.py`) and a sample data file baked into the image, giving the container something to run against with zero arguments.

> **Pitfall, worth flagging directly:** it would be easy to instead `COPY pyproject.toml uv.lock .` and `RUN uv sync` here, treating "containerize the project" as "reproduce the whole dev environment inside the container" — which would pull in PyTorch (over 100MB) to run a tool that never imports it. Module 6's multi-stage build session measures exactly this mistake directly, with real numbers.

## `ENTRYPOINT` vs. `CMD`, finally distinguished

**You'll be able to:** explain the difference between the two, using this exact image.

**Concept**

`ENTRYPOINT` sets the command that **always** runs; `CMD` supplies **default arguments** to it, which `docker run <image> <anything>` replaces — the "anything" becomes new arguments to `ENTRYPOINT`, not a replacement for it. (Capstone 1 used only `CMD`, with no `ENTRYPOINT` — there, supplying any command at all replaced the whole thing, since nothing was fixed.)

**Example**

```bash
docker run --rm report-tool:v1
```

Verified output: `electronics: 45.00`, `hardware: 80.00` — `ENTRYPOINT` (`python3 -m code_rookie_python.cli`) ran with `CMD`'s default argument (`sample_transactions.csv`), against the sample data baked into the image.

```bash
docker run --rm report-tool:v1 sample_transactions.csv --min-amount 40
```

Verified output: `electronics: 45.00`, `hardware: 50.00` — everything after the image name replaced `CMD` entirely, but `ENTRYPOINT` still ran fixed underneath it; the result matches `python/07-capstone-cli-tool.md`'s own `--min-amount 40` result exactly (`hardware` drops from `80.00` to `50.00`, `electronics` unaffected), because it's genuinely the same code, running inside a container instead of `uv run`.

## A real error, and what it reveals about container filesystems

**You'll be able to:** explain why a host file path doesn't work inside `docker run` without something this guide hasn't covered yet.

**Concept**

Container filesystems are isolated from the host by default (Module 1's own lesson, restated with real stakes) — a path that exists on the host machine doesn't automatically exist inside a container.

**Example**

```bash
docker run --rm report-tool:v1 /nonexistent/path.csv
```

Verified: `FileNotFoundError: [Errno 2] No such file or directory: '/nonexistent/path.csv'` — a real Python traceback, from inside the container, because that path genuinely doesn't exist in the container's own filesystem (even if a file at that exact path exists on the host machine running `docker`).

> **Pitfall:** this is precisely why the sample data file was baked directly into the image above rather than assumed available at some host path — a container can only see what's actually inside its own image, plus anything explicitly mounted in. Getting a *host* file into a running container's reach is Module 8's volumes topic, not something `COPY` (a build-time-only operation) or a bare file path can do on its own at run time.

## Practice

- Add a second sample file (`sample_transactions_2.csv`) to the image, and confirm `docker run --rm report-tool:v1 sample_transactions_2.csv` correctly reads it — no rebuild logic changes needed beyond adding another `COPY`.
- Predict, then verify, what `docker run --rm report-tool:v1 --help` does — does `--help` reach `argparse`'s own help output, or does it get interpreted some other way? (Hint: think about what `ENTRYPOINT`/`CMD` actually assembles into a final command.)
- Check `docker images report-tool:v1` and note its size — keep this number in mind for Module 6's multi-stage comparison, which measures what happens if the full shared `pyproject.toml` (with PyTorch) gets installed into this image instead.

## Progress check

1. Why does this specific tool need nothing installed beyond the base image's own Python, verified directly against its actual imports?
2. What's the practical difference between `ENTRYPOINT` and `CMD`, demonstrated by this module's two verified `docker run` examples?
3. Why did `docker run --rm report-tool:v1 sample_transactions.csv --min-amount 40` still run the same underlying Python module, despite supplying an entire new command-looking argument list?
4. Why did pointing the containerized tool at `/nonexistent/path.csv` fail, even assuming a file existed at that exact path on the host machine?
5. What real mistake would `COPY pyproject.toml uv.lock .` + `RUN uv sync` introduce into this specific image, and why?

### Answers

1. Because checking `cli.py`'s and `pipeline.py`'s actual `import` statements shows only standard-library modules (`argparse`, `sys`, `dataclasses`, `collections.abc`) — none of the shared project's third-party dependencies (`torch`, `keras`, `numpy`) are ever imported by this specific tool's code.
2. `ENTRYPOINT` is the command that always runs; `CMD` supplies default arguments to it that get replaced by anything supplied after the image name in `docker run`. Verified: the bare `docker run --rm report-tool:v1` used `CMD`'s default (`sample_transactions.csv`), while supplying an explicit argument list replaced that default while `ENTRYPOINT` (`python3 -m code_rookie_python.cli`) still ran underneath either way.
3. Because `ENTRYPOINT` was set to `["python3", "-m", "code_rookie_python.cli"]` — anything supplied after the image name becomes additional arguments *to* that fixed command, not a replacement for the command itself, unlike Capstone 1's image, which had no `ENTRYPOINT` at all.
4. Because container filesystems are isolated from the host by default — a path existing on the host machine has no automatic visibility inside a running container; only what's actually built into the image (via `COPY`) or explicitly mounted in (Module 8) is reachable from inside.
5. It would install the shared project's full dependency set, including PyTorch (well over 100MB), into an image for a tool that never actually imports it — genuinely bloating the image with dependencies the running code never uses, measured directly in Module 6.
