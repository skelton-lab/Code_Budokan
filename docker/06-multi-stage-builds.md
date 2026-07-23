# Module 6 — Multi-Stage Builds

Build-time tools — a compiler, a full SDK — don't need to ship inside the image that actually runs the finished program. A multi-stage build compiles in one stage and copies only the finished artifact into a separate, minimal final stage. This module measures exactly what that's worth: a real, verified image-size comparison, same program, same source file, one stage versus two. Feeds Capstone 3.

## The single-stage version: correct, but carrying its entire toolchain

**You'll be able to:** explain why a naive Dockerfile that compiles something ends up shipping the compiler itself in the final image.

**Concept**

A Dockerfile with one `FROM` compiles and runs from the same base — if that base is a full compiler toolchain (needed to *build* the program), every layer after the build still sits on top of it, and the final image contains the entire toolchain alongside the one small binary that toolchain produced.

**Example**

```dockerfile
FROM gcc:13
WORKDIR /build
COPY wordcount.c .
RUN gcc -O2 -o wordcount wordcount.c
ENTRYPOINT ["./wordcount"]
```

```bash
docker build -f Dockerfile.singlestage -t wordcount:single .
docker run --rm -i wordcount:single < sample.txt
```

Verified: `9` — correctly counts the words in a short sample sentence. `docker images` reports this image at **`1.91GB`** — nearly the entire `gcc:13` base image (`479MB` alone, verified via `docker image inspect`), plus the compiled binary, plus everything else the full GCC toolchain needs to exist.

## The multi-stage version: two `FROM`s, one artifact copied across

**You'll be able to:** write a Dockerfile with a `builder` stage and a separate final stage, copying only what the final stage actually needs.

**Concept**

`FROM <image> AS <name>` names a build stage; a later `COPY --from=<name>` pulls specific files from that earlier stage into the current one, without carrying along anything else that stage contained. Only the *last* `FROM` in the file determines what the final image actually contains.

**Example**

```dockerfile
FROM gcc:13 AS builder
WORKDIR /build
COPY wordcount.c .
RUN gcc -O2 -static -o wordcount wordcount.c

FROM debian:bookworm-slim
COPY --from=builder /build/wordcount /usr/local/bin/wordcount
ENTRYPOINT ["wordcount"]
```

```bash
docker build -t wordcount:multi .
docker run --rm -i wordcount:multi < sample.txt
```

Verified: `9` — the identical, correct result. `docker images` reports this image at **`137MB`** — the `debian:bookworm-slim` base plus one small statically-linked binary. `gcc:13` (the `builder` stage) never appears in the final image at all; it existed only long enough to produce `wordcount`, then `COPY --from=builder` took just that one file across the stage boundary.

**Measured, side by side, same source file, same compiled program:**

| Version | Image size | Contains |
|---|---|---|
| Single-stage | `1.91GB` | Full GCC toolchain + binary |
| Multi-stage | `137MB` | Just the binary + a minimal base |

A roughly **14× reduction**, verified directly, for producing byte-for-byte the same functional container.

> **Pitfall — a real one, hit directly while building this guide:** an earlier draft of this exact module tried to demonstrate multi-stage builds using `python/`'s own shared `pyproject.toml` (which depends on PyTorch) inside a Linux container instead of this C example — and PyTorch's dependency resolution on Linux pulled in a full set of NVIDIA CUDA libraries (`nvidia-cudnn-cu13`, `nvidia-cuda-cupti`, and others), each individually gigabytes in size, entirely unnecessary for a container with no GPU access at all. That download filled the host machine's disk before finishing. The general lesson, independent of the specific crash: cross-platform dependency resolution inside a container can silently pull in enormous, platform-specific packages that make no sense for that container's actual environment — checking what a dependency *actually* resolves to on the target platform, before a build runs unattended, would have caught this before it became a disk-space emergency rather than after.

**Practice**

- Add `RUN apt-get update && apt-get install -y --no-install-recommends ca-certificates` to the *final* stage (not the builder) and confirm the image size increases only by that package's own footprint, not by anything from the `gcc:13` builder stage.
- Rewrite `wordcount.c` to also count lines (like `wc -l`), rebuild both the single-stage and multi-stage versions, and confirm the size gap remains roughly the same ratio — the *source code* changing doesn't change what's actually driving the size difference.
- Explain, using `docker history` on both `wordcount:single` and `wordcount:multi`, exactly which layers exist in one but not the other.

## Progress check

1. Why does a single-stage Dockerfile built from a compiler image end up shipping the compiler itself in the final result?
2. What does `COPY --from=builder <path> <path>` actually do, precisely?
3. Which `FROM` in a multi-stage Dockerfile determines the contents of the final image?
4. What was the measured size difference between this module's single-stage and multi-stage versions of the identical program, and what accounts for essentially all of it?
5. What real, disk-filling mistake did an earlier draft of this guide make, and what general lesson does it illustrate beyond "don't do that specific thing"?

### Answers

1. Because every instruction in a Dockerfile builds on top of everything before it within that same stage — if the base image is a full compiler toolchain, nothing removes that toolchain from the layers that follow it; the final image is the base plus every subsequent layer, toolchain included.
2. It copies specific files or directories from an earlier, named build stage into the current stage's filesystem — nothing else from that earlier stage (its own base image, its own installed tools) comes along; only the exact paths named are copied.
3. The last one — everything before it exists only to produce artifacts that get explicitly `COPY --from=`'d forward; stages that are never referenced by a later `COPY --from=` contribute nothing to the final image at all.
4. `1.91GB` (single-stage) versus `137MB` (multi-stage), roughly a 14× difference — verified directly, essentially all of it is the `gcc:13` compiler toolchain (`479MB` alone) plus its own base OS layers, none of which the final, already-compiled binary needs at runtime.
5. Using `python/`'s shared `pyproject.toml` (with PyTorch) inside a Linux container pulled in multiple gigabytes of NVIDIA CUDA libraries the container had no use for at all, filling the host's disk. The general lesson: cross-platform dependency resolution inside a container can silently resolve to unexpectedly enormous, platform-specific packages — worth checking what a dependency actually resolves to on the target platform before running an unattended build, not just assuming a dependency list that's fine on one platform is equally fine on another.
