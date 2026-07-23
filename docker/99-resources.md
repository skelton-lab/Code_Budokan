# Resources & Cheat Sheet

## References

| Resource | Why it matters |
|---|---|
| [Docker documentation](https://docs.docker.com/) | The complete reference for this guide's entire anchored toolchain |
| [Colima documentation](https://github.com/abiosoft/colima) | This guide's specific local runtime, including its real, verified home-directory-only default mount behavior (Module 8) |
| [Docker Compose file reference](https://docs.docker.com/reference/compose-file/) | Modules 10–11's `compose.yaml` syntax in full |
| [Dockerfile reference](https://docs.docker.com/reference/dockerfile/) | Every instruction used across this guide (`FROM`, `RUN`, `COPY`, `WORKDIR`, `ENTRYPOINT`, `CMD`, `VOLUME`, multi-stage `AS`/`--from=`), in full |
| This series' [Python guide](../python/00-overview.md) | The source of this guide's entire running capstone thread — `report`, `pipeline.py`, `code_rookie_python` — containerized, volumed, and networked across Capstones 2, 4, and 5 |

## One-page cheat sheet

| Idea | Where |
|---|---|
| Images are read-only templates; containers are independent running instances | Module 1 |
| `docker ps` (running) vs. `docker ps -a` (all); `stop` ≠ `rm` | Module 1 |
| Layers cache independently; order rarely-changing steps before frequently-changing ones | Module 2 |
| `ENTRYPOINT` (always runs) vs. `CMD` (default, overridable arguments) | Capstone 1, Module 4 |
| Containerize only what actually runs — check real imports, not the whole shared project | Module 4 |
| `.dockerignore` needs `**/` prefixes to match nested paths, not just the build-context root | Capstone 2 |
| Multi-stage builds: `FROM ... AS name`, `COPY --from=name` — only the last `FROM` ships | Module 6 |
| Named volumes survive container removal; `VOLUME` alone (no explicit `-v`) does not give cross-run persistence | Module 8 |
| Bind mounts (`-v host-path:container-path`) depend on Colima's shared-mount config — home directory only, by default | Module 8 |
| Default `bridge` network: no name resolution. User-defined networks (and Compose's automatic one): yes | Module 10 |
| `depends_on` controls start order, not readiness — pair with an explicit wait or a real health check | Module 10, Capstone 5 |
| `docker compose down` removes containers + networks; `down -v` also removes named volumes | Capstone 5 |

## Verification technique used throughout this guide

```bash
docker build -t name:tag .
docker run --rm name:tag
docker compose -f compose.yaml up --abort-on-container-exit
```

Every image, container, and Compose project in this guide was actually built and run against a real, Colima-backed Docker daemon — image sizes, build times, and command output are measured, not estimated, including two real mistakes caught directly during verification and kept in deliberately: an initial Module 6 draft that filled the host's disk trying to install PyTorch inside a Linux container (fixed by switching to a C-compilation multi-stage example instead), and a stale `ENTRYPOINT` baked into an early Capstone 1 image tag from a superseded draft, caught by re-inspecting the image's actual config rather than trusting what the Dockerfile *should* have produced.

## Where to go now

This guide closes the entire code-rookie series with the same discipline every guide before it insisted on: run it for real, measure what you claim, and when something looks wrong or too dramatic to be true, investigate before shipping it — the same instinct that caught Fortran's `v(::-1)` error at the very start of this project, SQL's rowid-reuse correction, Python's Keras-timing correction, and this guide's own disk-filling near-miss and stale-image-tag bug. Docker's own throughline across this guide was concrete, not abstract: the same `report` computation, verified correct as a bare CLI tool, a containerized image, and finally an HTTP service reachable by name from a second container — proof, not assertion, that "runs the same everywhere" actually held at every step.
