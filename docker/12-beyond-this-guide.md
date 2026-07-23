# Module 12 — Beyond This Guide

Every topic here failed the capstone-impact test (`00-overview.md`'s ecosystem-breadth triage table) — none of them change how Capstones 1–5 turn out, and none are required by an exercise you've been assigned. That's a scoping decision, not an oversight: each entry says what it is, why it matters, and where to go deeper when you actually need it.

### Kubernetes and orchestration at scale

**What it is:** a system for running containers across a *cluster* of many machines — scheduling, scaling, self-healing (restarting failed containers automatically), and load-balancing across however many replicas of a service are needed. Docker Compose (Module 10/Capstone 5) orchestrates multiple containers on **one** machine; Kubernetes solves the same class of problem across many.

**Why it matters:** doesn't touch any capstone — every one of this guide's five capstones runs correctly on a single machine, which is genuinely sufficient for the scale this guide's promise covers. Kubernetes is the natural next step the moment "one machine" itself becomes the constraint.

**Where to go next:** the [official Kubernetes documentation](https://kubernetes.io/docs/home/)'s own tutorials; `kompose`, a tool that converts a `docker-compose.yaml` (like Capstone 5's) into a starting-point Kubernetes configuration.

### Security: non-root users, minimal/distroless base images, scanning

**What it is:** running a container's process as a non-root user (`USER` in a Dockerfile) rather than root by default; using minimal or "distroless" base images (containing only an application and its runtime dependencies, no shell, no package manager) to shrink the attack surface; scanning images for known vulnerabilities in their installed packages (`docker scout`, Trivy, and similar tools).

**Why it matters:** every image this guide built ran as root by default (Alpine's and Debian's own default), which is genuinely fine for this guide's local, single-user, non-production capstones — real production deployments generally shouldn't run as root, for the same reason a real server shouldn't run every process with unrestricted privileges.

**Where to go next:** the [Docker documentation's own security section](https://docs.docker.com/engine/security/); the `USER` instruction's own reference page for adding a non-root user to a Dockerfile.

### Publishing images to a registry

**What it is:** `docker push` to Docker Hub, GitHub Container Registry (GHCR), or a private registry — making an image fetchable by name from anywhere, the way `python:3.12-slim` and `alpine:latest` were pulled throughout this guide.

**Why it matters:** every image this guide built lived only in this local Colima-backed Docker daemon — genuinely sufficient for learning and local development, but not for actually deploying something for others (or a different machine) to run.

**Where to go next:** [Docker Hub](https://hub.docker.com/)'s own "push an image" quickstart; GitHub's documentation on GHCR for a registry tied directly to a GitHub repository.

### `buildx` and advanced BuildKit features

**What it is:** `docker-buildx` (installed and confirmed working in this guide's setup) unlocks build features beyond what plain `docker build` uses by default — cross-platform builds (building an `arm64` image on an `amd64` machine or vice versa, relevant the moment an image needs to run on different hardware than it's built on), build cache export/import across machines, and more.

**Why it matters:** every build in this guide ran on and for this one Apple Silicon machine's own architecture — genuinely sufficient for this guide's scope, but a real limitation the moment an image needs to run somewhere with a different CPU architecture.

**Where to go next:** the [Docker Buildx documentation](https://docs.docker.com/build/buildx/), specifically its multi-platform build guide.

### Docker in CI pipelines

**What it is:** running `docker build`/`docker run`/`docker compose` as part of an automated CI pipeline (GitHub Actions, GitLab CI, and similar) — building an image on every commit, running tests inside a container, or deploying automatically once a build passes.

**Why it matters:** doesn't touch any capstone — every build and run in this guide happened interactively, on demand, which is exactly the right scope for learning the mechanics before automating them.

**Where to go next:** GitHub Actions' own `docker` action documentation; the general pattern of "build once, test inside the built image, push if tests pass" that most real CI/CD pipelines follow.

### The wider ecosystem

- **[Docker documentation](https://docs.docker.com/)** — the complete reference for this guide's entire anchored toolchain.
- **[Colima documentation](https://github.com/abiosoft/colima)** — this guide's specific local runtime, including its mount configuration (Module 8's real, verified home-directory-only default) and its own comparison to Docker Desktop.
- **This series' [Python guide](../python/00-overview.md)** — the source of this guide's own running capstone thread (`report`, `pipeline.py`, `code_rookie_python`), for anyone who wants the full, un-containerized story of how that code was built and tested in the first place.
