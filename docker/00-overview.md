# Docker — A Session-Based Study Guide

**Promise:** package a real application — this series' own Python CLI tool — into a container that runs identically regardless of what's installed on the host, understand exactly what a Dockerfile's instructions do to image layers and build time, and use volumes and multi-container orchestration (Compose) for anything a single container can't do alone.

**Audience:** this series' existing reader, twelve guides in. Every guide since Ruby's `ruby/00-overview.md` (Homebrew Ruby, not the macOS-shipped 2.6.10) has flagged some version of "which exact toolchain version" as a real, recurring concern — Python's own guide built an entire isolated `uv`-managed project specifically to avoid depending on whatever happened to be on `$PATH`. Docker is the general, industry-standard answer to that entire class of problem, and this guide's central, running capstone thread makes that concrete: it containerizes the exact CLI tool `python/07-capstone-cli-tool.md` built, so "works inside this project's `.venv`" becomes "works anywhere `docker run` does."

**Toolchain (anchored):** **Docker CLI 29.6.2** (server: `29.5.2`) via Homebrew, backed by **Colima 0.10.3** — a real, open-source, Homebrew-installable container runtime for macOS, not Docker Desktop's licensed GUI application. Confirmed working directly: `docker run --rm hello-world` pulled a real image and ran a real container successfully. `docker-compose` (`5.3.1`) and `docker-buildx` (`0.35.0`) are installed as separate CLI plugins, registered via `~/.docker/config.json`'s `cliPluginsExtraDirs` — a real, documented step this guide's own setup needed, verified directly (`docker compose version` and `docker buildx version` both failed with `unknown command` before this config change, and succeeded after).

**A methodology note specific to this guide:** every capstone builds toward one running thread — containerizing `python/`'s actual `report` CLI tool, not a disconnected toy example. This is a deliberate, genuine cross-guide callback: Docker's entire value proposition ("this runs the same regardless of host setup") is best proven against a real program this series already built and tested, not a fresh "hello world" invented just for this guide. Every `docker build`/`docker run`/`docker compose` command below was actually executed against a real, running Colima-backed Docker daemon — image sizes, build times, and command output are all measured, not estimated.

## Capstone log

| # | Capstone | Proves |
|---|---|---|
| 1 | First image | `Dockerfile` fundamentals, `docker build`/`docker run`, image layers |
| 2 | Containerizing `python/`'s `report` CLI tool | Base images, `COPY`, dependency installation inside a container, `ENTRYPOINT`/`CMD` — the guide's central running thread |
| 3 | Multi-stage build of the same tool | A measured image-size reduction, separating build-time and run-time dependencies |
| 4 | A stateful container with a volume | Data surviving container removal — the difference between a container's own filesystem and a mounted volume |
| 5 | A two-container Compose setup | `docker-compose.yml`, inter-container networking, orchestrating more than one container together |

## Module list

1. **Foundations: images and containers** — what an image is, what a container is, `docker run`, `docker ps`/`docker images` → sets up Capstone 1
2. **The Dockerfile and layers** — instructions, the build cache, a measured cache-hit vs. cache-miss rebuild → feeds Capstone 1
3. **Capstone 1** — First image
4. **Containerizing a real Python app** — base images, `COPY`, `RUN pip/uv install`, `ENTRYPOINT` vs. `CMD` → feeds Capstone 2
5. **Capstone 2** — The `report` CLI tool, containerized
6. **Multi-stage builds** — separating build and runtime stages, a measured image-size comparison → feeds Capstone 3
7. **Capstone 3** — Multi-stage build of the same tool
8. **Volumes and persistent data** — container filesystem vs. mounted volumes, verified survival across container removal → feeds Capstone 4
9. **Capstone 4** — A stateful container with a volume
10. **Networking and Docker Compose** — `docker-compose.yml`, service-to-service networking → feeds Capstone 5
11. **Capstone 5** — A two-container Compose setup
12. **Beyond this guide** — signposts only
13. **Final assessment** + **Resources**

## Ecosystem-breadth triage

| Topic | Capstone-impact test | Treatment |
|---|---|---|
| Multi-stage builds | Directly, measurably changes Capstone 2's image size | **Full**, Module 6 + Capstone 3 |
| Volumes | Directly required for any capstone involving data that must outlive a container | **Full**, Module 8 + Capstone 4 |
| Docker Compose | Directly required for multi-container orchestration | **Full**, Module 10 + Capstone 5 |
| Kubernetes / container orchestration at scale | Doesn't touch any capstone here — this guide's scope stops at a single machine's `docker compose` | **Signpost** |
| Security scanning, non-root users, minimal/distroless base images | Real, but not load-bearing for any capstone's core lesson | **Signpost** |
| Publishing images to a registry (Docker Hub, GHCR) | Every capstone here builds and runs locally | **Signpost** |
| BuildKit/`buildx` advanced features (cross-platform builds, cache export) | `buildx` is installed and available, but this guide's builds don't need its advanced features beyond what plain `docker build` already provides | **Signpost** |
| Docker in CI pipelines | Doesn't touch a capstone | **Signpost** |

## Setup

```bash
brew install colima docker docker-compose docker-buildx
colima start
```

Register the Compose/Buildx plugins (verified necessary — both failed with `unknown command` before this step):

```bash
# add to ~/.docker/config.json:
{
  "cliPluginsExtraDirs": ["/opt/homebrew/lib/docker/cli-plugins"]
}
```

Verified working:

```bash
docker --version        # Docker version 29.6.2
docker info              # Server Version: 29.5.2, Context: colima
docker compose version   # Docker Compose version 5.3.1
docker buildx version    # v0.35.0
docker run --rm hello-world   # pulls and runs successfully
```
