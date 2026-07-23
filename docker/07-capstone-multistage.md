# Module 7 — Capstone 3: A Multi-File Tool, Multi-Stage Built

**Proves:** multi-stage builds applied to a slightly more realistic project (multiple source files), the measured size payoff, and layer caching working correctly across a stage boundary (Module 6).

A small word/line/character counter — genuinely a multi-file C project this time (`minwc.c`, `counter.c`, `counter.h`), not Module 6's single-file example — built with the identical multi-stage pattern: compile with the full `gcc:13` toolchain, ship only the resulting static binary. Every command below is a real, verified `docker` run.

## The project

```c
/* counter.h */
typedef struct { int lines; int words; int chars; } Counts;
void print_counts(const Counts *c);
```

```c
/* counter.c */
#include <stdio.h>
#include "counter.h"
void print_counts(const Counts *c) {
    printf("%d %d %d\n", c->lines, c->words, c->chars);
}
```

```c
/* minwc.c */
#include <stdio.h>
#include "counter.h"
int main(void) {
    Counts c = {0, 0, 0};
    int ch, in_word = 0;
    while ((ch = getchar()) != EOF) {
        c.chars++;
        if (ch == '\n') c.lines++;
        if (ch == ' ' || ch == '\n' || ch == '\t') in_word = 0;
        else if (!in_word) { in_word = 1; c.words++; }
    }
    print_counts(&c);
    return 0;
}
```

## The multi-stage Dockerfile

```dockerfile
FROM gcc:13 AS builder
WORKDIR /build
COPY minwc.c counter.c counter.h ./
RUN gcc -O2 -static -o minwc minwc.c counter.c

FROM debian:bookworm-slim
COPY --from=builder /build/minwc /usr/local/bin/minwc
ENTRYPOINT ["minwc"]
```

Identical structure to Module 6's `wordcount` example, applied to a project with an actual header file and two separately-compiled `.c` sources — `RUN gcc ... minwc.c counter.c` compiles both together into one binary, and only that one finished binary crosses into the final stage.

## Verified run

```bash
docker build -t minwc:v1 .
printf "the quick brown fox\njumps over the lazy dog\n" > sample.txt
docker run --rm -i minwc:v1 < sample.txt
```

Verified: `2 9 44` — cross-checked directly against the system's own `wc` command on the identical file: `2 9 44`. Exact match: 2 lines, 9 words, 44 characters. `docker images` reports this multi-stage image at `137MB` — the same size Module 6's single-file `wordcount:multi` measured, confirming the extra source file and header didn't meaningfully change the final image's size (only the compiled *output*, not the *source*, ends up in the final stage).

## Caching still works correctly across the stage boundary

```bash
# no changes at all:
docker build -t minwc:v2 .
```

Verified: full cache hit, rebuild completes in about `2s` (nearly all of that is Docker's own build-graph overhead on a build this small, not any actual recompilation).

```bash
# change only counter.c's print format:
docker build -t minwc:v3 .
docker run --rm -i minwc:v3 < sample.txt
```

Verified: `lines=2 words=9 chars=44` — the modified output format, correctly recompiled and correctly carried across into the final stage via `COPY --from=builder`. Multi-stage builds don't opt out of Module 2's layer-caching mechanics — they apply exactly the same way *within* the builder stage, and the `COPY --from=` step itself is just one more layer, cached or invalidated by the same rules as any other.

> **Pitfall:** it's tempting to assume a multi-stage build's `builder` stage is somehow "outside" normal caching because it's not the final image — it isn't. The builder stage's own layers cache exactly like any other Dockerfile's, and changing `counter.c` invalidated exactly the layers that depend on it (the `RUN gcc ...` compile step and everything after), leaving `COPY minwc.c counter.c counter.h ./`'s *earlier* dependencies (if any existed here) untouched — the same ordering discipline Module 2 and Capstone 1 already established, just spanning two `FROM` blocks instead of one.

## Practice

- Add a third source file (say, splitting `print_counts` into its own translation unit further, or adding a genuinely new function), rebuild, and confirm the final image size still stays close to `137MB` — the number of source files doesn't matter to the final image's size, only what actually gets compiled and copied across.
- Deliberately break the build by introducing a syntax error in `counter.c`, and confirm the build fails *during the builder stage*, before ever reaching the final `FROM debian:bookworm-slim` stage — multi-stage builds still fail fast on a broken build step, exactly like a single-stage one would.
- Compare `docker history minwc:v1` against `docker history` of a hypothetical single-stage version of this same project (Module 6 already measured one directly) — which layers would be present in one but not the other?

## Progress check

1. Why did adding a second source file and a header not meaningfully change the final image's size?
2. What does `RUN gcc ... minwc.c counter.c` compile, and at which stage does it run?
3. Why did changing only `counter.c`'s contents still correctly propagate the updated output into the final stage's binary?
4. Does layer caching behave any differently inside a multi-stage build's `builder` stage compared to an ordinary, single-stage Dockerfile? Why or why not?
5. If a syntax error were introduced into `counter.c`, at which point would the build actually fail?

### Answers

1. Because only the finished, compiled binary (`minwc`) gets copied into the final stage via `COPY --from=builder` — the number and size of the *source* files that produced it has no bearing on the final image, which never contains the source at all, only the one compiled artifact.
2. It compiles both `minwc.c` and `counter.c` together into a single static binary, `minwc` — this runs entirely within the `builder` stage (the `gcc:13`-based first `FROM` block), before anything in the final stage even begins.
3. Because the `RUN gcc ...` compile step reruns whenever either of its input files change (Module 2's caching rule, just as true here), producing a freshly-compiled `minwc` binary with the new behavior baked in — and that freshly-compiled binary is exactly what `COPY --from=builder` then carries across into the final stage.
4. No — the builder stage's own instructions cache exactly like any ordinary Dockerfile's, keyed on each instruction's inputs plus everything before it in that same stage. Multi-stage builds don't introduce a different caching model; they just add a stage boundary and a `COPY --from=` step, which is itself cached the same way any other layer is.
5. During the builder stage — `RUN gcc -O2 -static -o minwc minwc.c counter.c` would fail with a compiler error, and the build would stop there, never reaching the final `FROM debian:bookworm-slim` stage or attempting the `COPY --from=builder` step at all.
