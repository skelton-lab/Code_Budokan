# Companion — Docker (not a language; not in the original Budokan module list)

**Founding document: independently supplied.** Merkel, D. (2014). "Docker: Lightweight Linux Containers for Consistent Development and Deployment." *Linux Journal*, 2014(239), Article 2. Docker itself doesn't have an academic founding paper the way most languages in this companion do — it's a real, deployed engineering tool, first publicly introduced by Solomon Hykes at a PyCon 2013 lightning talk, with Merkel's own 2014 Linux Journal article serving as the closest thing to a citable, contemporaneous technical account.

## Historical note

Docker's own real technical contribution wasn't inventing container isolation — Linux namespaces and cgroups (the actual kernel mechanisms containers rely on) predate Docker by years. Docker's genuine innovation was packaging those existing kernel primitives into a single, usable developer workflow: a `Dockerfile` describing an image declaratively, a build process producing a portable artifact, and a runtime (`docker run`) that behaves identically regardless of the host's own installed software — solving a real, extremely common problem this series' own `docker/00-overview.md` names directly: "works inside this project's `.venv`" (Python's own `uv`-managed isolation, companion: `python.md`) becoming "works anywhere `docker run` does."

`docker/00-overview.md` states this series' own real reason for building the guide precisely: every guide since Ruby's own toolchain-version concerns (`ruby/00-overview.md`'s explicit Homebrew-vs-system-Ruby distinction) has flagged some version of "which exact toolchain version" as a genuine, recurring problem — Docker is the general, industry-standard answer to that entire class of problem, made concrete by literally containerizing the exact CLI tool `python/07-capstone-cli-tool.md` built. `docker/00-overview.md`'s own real, verified toolchain finding — Colima as a genuine, open-source alternative to Docker Desktop's licensed GUI, with `docker compose`/`docker buildx` requiring an explicit config step this guide verified was necessary by testing its absence directly — is itself a small, concrete instance of the exact "which toolchain, exactly, and how do you know" discipline this entire series holds to.

## Reflection prompts

- Docker's own genuine contribution was packaging existing Linux kernel primitives (namespaces, cgroups) into a usable workflow, not inventing isolation itself. Where else in this companion does a language or tool succeed by making an existing capability's *cost* acceptable, rather than inventing something genuinely new? (Companion hint: `cpp.md`'s own framing of C++'s relationship to Simula.)
- `docker/00-overview.md` names the exact toolchain-version anxiety running through this entire series, from Ruby onward, as Docker's own real motivating problem. Pick one earlier `code-rookie` guide's own toolchain note and describe, concretely, what containerizing that guide's own examples would have changed about its own verification process.

## Short-answer questions

1. **What existing Linux kernel mechanisms did Docker's own containers actually rely on, predating Docker itself?** Linux namespaces and cgroups — Docker's genuine innovation was packaging these existing kernel primitives into a usable, declarative developer workflow (`Dockerfile`, image builds, `docker run`), not inventing container isolation itself.
2. **What specific, real capstone does `docker/05-capstone-containerized-cli.md` build, tying it directly to an earlier guide in this series?** It containerizes the exact CLI tool `python/07-capstone-cli-tool.md` built — the identical computation verified independently as a bare `uv run` invocation, then again as a containerized image, the same result checked fresh each time.
3. **What real, verified toolchain step did `docker/00-overview.md` confirm was necessary, not cosmetic, by testing its absence directly?** Registering `docker compose` and `docker buildx` as separate CLI plugins via `~/.docker/config.json`'s `cliPluginsExtraDirs` — both commands failed with `unknown command` before this configuration change and succeeded after, confirmed directly rather than assumed from documentation.

## Links into the guide

- [`docker/00-overview.md`](../docker/00-overview.md) — the toolchain-version anxiety running through this entire series, and Docker's own real answer to it.
- [`docker/05-capstone-containerized-cli.md`](../docker/05-capstone-containerized-cli.md) — the direct, re-verified continuation of `python/07-capstone-cli-tool.md`'s own computation.

## Cross-thread connection

No Budokan-workbook pairing exists for Docker, since it's not a programming language and doesn't appear in the workbook's own module list. The genuinely relevant connection is internal to `code-rookie`'s own "one computation, three guises" thread: the identical `totals_by_category(parse_lines(...))` computation, verified as a bare CLI invocation, then a containerized image, then an HTTP endpoint inside a two-container Compose project — the same result, checked fresh at every layer, rather than assumed to "still work" once wrapped.
