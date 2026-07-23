# Module 3 — Capstone 1: A First Image

**Proves:** `docker build`/`docker run`, image vs. container lifecycle, layer caching and instruction ordering (Modules 1–2).

A small greeting tool — a shell script baked into an Alpine-based image — built with dependency-installation deliberately ordered *before* the application code, so a real, later code change doesn't force an unrelated package install to rerun. Every command below is a real, verified `docker` run.

## The image

```dockerfile
FROM alpine:latest

# Dependencies first: this layer only reruns if the package list itself changes,
# not every time greet.sh changes below.
RUN apk add --no-cache coreutils

WORKDIR /app
COPY greet.sh .
RUN chmod +x greet.sh

CMD ["./greet.sh", "World"]
```

```bash
docker build -t greeter:v1 .
```

`apk add --no-cache coreutils` sits before `COPY greet.sh .` deliberately — Module 2's central lesson, applied here rather than just observed in a teaching example. `CMD ["./greet.sh", "World"]` sets the default command a container runs; with no `ENTRYPOINT` set, `docker run <image> <anything>` replaces that default command entirely (Module 4 covers `ENTRYPOINT` specifically, for the case where part of the command should stay fixed).

## Verified runs

```bash
docker run --rm greeter:v1
```

Verified: `Hello, World! This container knows today is 2026-07-18.` — the image's default `CMD`.

```bash
docker run --rm greeter:v1 ./greet.sh Docker
```

Verified: `Hello, Docker! This container knows today is 2026-07-18.` — supplying a command after the image name replaces `CMD` entirely; `./greet.sh Docker` is what actually ran, not `./greet.sh World` with `Docker` appended.

```bash
docker history greeter:v1
```

Verified output (abbreviated) confirms the exact layer sequence the Dockerfile produced:

```
CMD ["./greet.sh" "World"]
RUN /bin/sh -c chmod +x greet.sh
COPY greet.sh .
WORKDIR /app
RUN /bin/sh -c apk add --no-cache coreutils ...
```

## Applying Module 2's ordering lesson to this exact image

```bash
# edit greet.sh's actual message text, then:
docker build -t greeter:v2 .
```

Verified: `0.170s` — the `apk add` layer (and `WORKDIR`) both report `CACHED`; only `COPY greet.sh .` and everything after it reran, because the package-install step sits *before* the application code in this Dockerfile, exactly as Module 2's measured comparison demonstrated. A version of this same Dockerfile with `COPY`/`RUN chmod` moved *before* `RUN apk add` would force the (admittedly small, here) package installation to rerun on every single source edit — the same real, measured effect Module 2 demonstrated at a slightly larger scale.

> **Pitfall:** this capstone's dependency layer (`apk add coreutils`) is small enough that getting its order wrong wouldn't be very costly to notice in practice — but the principle scales directly to Capstone 2, where the equivalent step is installing a real Python interpreter and its packages, several seconds to tens of seconds of work depending on what's being installed. Getting the ordering right here, on a small example, is what makes it a reflex rather than an afterthought once the stakes are higher.

## Practice

- Change `greet.sh` to also print the container's hostname (`hostname` command, available via `coreutils`), rebuild, and confirm the `apk add` layer still shows `CACHED`.
- Deliberately move `COPY greet.sh .` and `RUN chmod +x greet.sh` to *before* `RUN apk add --no-cache coreutils`, rebuild once to establish the new baseline, then edit `greet.sh` again and time the rebuild — confirm `apk add` now reruns, reproducing Module 2's "bad ordering" pitfall on this exact image.
- Run `docker run --rm greeter:v1 echo "totally different command"` and explain, precisely, why this doesn't call `greet.sh` at all — what does `CMD` actually control when a container is started with an explicit command of its own?
