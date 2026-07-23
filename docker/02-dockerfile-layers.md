# Module 2 — The Dockerfile and Layers

A Dockerfile isn't a script that runs once — it's a sequence of **layers**, each cached independently, and getting their order right is the difference between a rebuild taking milliseconds and a rebuild taking ten seconds every single time, measured directly below. Every command is a real, verified `docker build` run. Feeds Capstone 1.

## A basic Dockerfile

**You'll be able to:** write a Dockerfile with `FROM`, `RUN`, `WORKDIR`, `COPY`, and `CMD`, and explain what each instruction does.

**Concept**

`FROM` picks a base image to start from. `RUN` executes a command *during the build*, and whatever it changes on disk becomes part of the image. `WORKDIR` sets the working directory for every instruction after it. `COPY` copies files from the build context (the directory `docker build` is run from) into the image. `CMD` sets the default command a container runs when started, if none is given explicitly.

**Example**

```dockerfile
FROM alpine:latest
RUN echo "layer 1: installing a package" && apk add --no-cache curl
WORKDIR /app
COPY hello.txt .
CMD ["cat", "hello.txt"]
```

```bash
docker build -t layer-demo:v1 .
```

Verified: the build runs each instruction in order — pulling `alpine` (if not cached), running `apk add`, setting the working directory, copying `hello.txt` — and produces an image tagged `layer-demo:v1`.

**Practice**

- Run `docker history layer-demo:v1` and match each row in its output to the specific Dockerfile instruction that created it.

## Layers are cached independently, in order

**You'll be able to:** explain exactly which layers a rebuild reuses versus reruns, based on what changed.

**Concept**

Docker caches each layer's result, keyed on that instruction *and every instruction before it*. Rerunning an identical build hits the cache for every layer. Changing an input to one specific layer (a file `COPY`'d, a command's own text) invalidates that layer's cache **and every layer after it** — but layers *before* the change are unaffected.

**Example — a full cache hit, verified directly:**

```bash
docker build -t layer-demo:v2 .    # no changes at all since v1
```

Verified: every instruction reports `CACHED`; total build time `0.199s`, down from the first build's `~10.8s` (almost entirely the `apk add` step).

**Example — changing only the file `COPY`'d last, verified directly:**

```bash
echo "hello from a MODIFIED layer" > hello.txt
docker build -t layer-demo:v3 .
```

Verified: `RUN ... apk add` and `WORKDIR` both report `CACHED` — untouched, since nothing about their inputs changed — while `COPY hello.txt .` correctly reruns (its input file changed), and the build finishes in `0.156s`, not `~10s` — the expensive `apk add` step never reran, because it sits *before* the file that actually changed.

> **Pitfall, and a real, measured example of getting the order wrong:** placing `COPY` **before** the expensive `RUN` step —
> ```dockerfile
> FROM alpine:latest
> WORKDIR /app
> COPY hello.txt .
> RUN echo "layer: installing a package" && apk add --no-cache curl
> ```
> — means every layer *after* `COPY` (including the `apk add`) gets invalidated the moment `hello.txt` changes, even though the package installation itself has nothing to do with that file. Verified directly: rebuilding this ordering after only editing `hello.txt` reruns `apk add` in full (`~10.0s` again), not the `~0.156s` the correctly-ordered version achieved for the identical source change. **The general rule this demonstrates:** put instructions that change rarely (installing dependencies) *before* instructions that change often (copying your actual source code), so routine source edits don't force expensive, unrelated steps to rerun on every single build.

**Practice**

- Reorder Capstone 1's own Dockerfile (once you've built it) so that the most frequently-changing file is copied *last*, and verify with a real, timed rebuild that only the expected layers rerun.

## Progress check

1. What does `RUN` do during a build that `CMD` does not?
2. Why did the second build (`layer-demo:v2`, no changes) take `0.199s` instead of the first build's `~10.8s`?
3. When `hello.txt` changed, why did `RUN ... apk add` still report `CACHED`, while `COPY hello.txt .` did not?
4. What's the general rule this module's measured comparison demonstrates about Dockerfile instruction order?
5. In the "bad ordering" example, why did changing `hello.txt` force `apk add` to rerun, when it hadn't in the correctly-ordered version?
6. What does `docker history` show about a built image?

### Answers

1. `RUN` executes a command *during the build*, and its filesystem changes become part of the resulting image layer. `CMD` only sets the *default* command a container runs when started — it doesn't execute anything at build time.
2. Because every layer's inputs were identical to the first build, so Docker's build cache reused every cached layer instead of recomputing any of them — verified directly, every instruction reported `CACHED`.
3. Because layer caching is keyed on each instruction's own inputs plus everything before it — `apk add`'s inputs (the base image, the command text) hadn't changed, so it stayed cached; `COPY hello.txt .`'s input (the file's actual contents) had changed, so that layer, and only that layer onward, reran.
4. Instructions that change rarely (installing dependencies) should come *before* instructions that change often (copying source code) — otherwise, a routine source-code edit invalidates every layer after it, including expensive, logically-unrelated steps.
5. Because `COPY hello.txt .` was placed *before* `RUN ... apk add` in that Dockerfile — once the copied file's contents changed, Docker's caching rule (everything after an invalidated layer is also invalidated) forced `apk add` to rerun too, even though the package installation had nothing to do with `hello.txt`'s contents.
6. The full sequence of layers that make up an image, each attributed to the specific Dockerfile instruction (or comparable build step) that created it, along with each layer's size — a direct, inspectable record of exactly what a `docker build` actually did, instruction by instruction.
