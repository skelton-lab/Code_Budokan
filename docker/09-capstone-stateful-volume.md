# Module 9 — Capstone 4: A Visit Tracker With Real Persistence

**Proves:** named volumes surviving container removal, the `VOLUME` Dockerfile instruction, and a real, precise distinction between "this mount point is backed by a volume" and "this data persists across separate runs" (Module 8).

A small tool that appends a timestamped entry to a log every time it runs, and reports the running total — genuinely useless without persistence, since "how many times has this run" is meaningless if the count resets every single invocation. Every command below is a real, verified `docker` run.

## The image

```bash
#!/bin/sh
# visit.sh
echo "visit at $(date -u +%Y-%m-%dT%H:%M:%S)" >> /logs/visits.log
echo "--- visit log so far ---"
cat /logs/visits.log
echo "total visits: $(wc -l < /logs/visits.log)"
```

```dockerfile
FROM alpine:latest
WORKDIR /app
COPY visit.sh .
RUN chmod +x visit.sh
VOLUME /logs
ENTRYPOINT ["./visit.sh"]
```

`VOLUME /logs` declares that `/logs` should be backed by a volume rather than the container's own writable layer — but, verified below, that alone doesn't create the *persistence* this capstone actually needs.

## Verified: real persistence, with an explicit named volume

```bash
docker volume create visits_data
docker run --rm -v visits_data:/logs visit-tracker:v1
docker run --rm -v visits_data:/logs visit-tracker:v1
docker run --rm -v visits_data:/logs visit-tracker:v1
```

Verified output, across three genuinely separate `docker run` invocations, each its own container, created and removed in full each time:

```
total visits: 1
total visits: 2
total visits: 3
```

Every run is a brand-new container — `--rm` deletes each one immediately after it finishes — and the count still climbs correctly, because `-v visits_data:/logs` mounts the *same* named volume every time. The log genuinely lives in the volume, not in any one container's lifetime.

## The real distinction: `VOLUME` alone doesn't give you this

**You'll be able to:** explain precisely what the Dockerfile's `VOLUME` instruction does and does not guarantee.

**Concept**

`VOLUME /logs` in the image guarantees `/logs` is backed by *some* volume — but without `-v <name>:/logs` at `docker run` time, Docker creates a fresh **anonymous** volume for that specific container, with no name tying separate runs together.

**Example, verified directly:**

```bash
docker run --rm visit-tracker:v1
docker run --rm visit-tracker:v1
docker volume ls
```

Verified output: **both** runs report `total visits: 1`, not `1` then `2` — each got its own fresh anonymous volume, and `docker volume ls` afterward shows only `visits_data` (the one *named* volume from the previous section) — no anonymous volumes lingering, because `--rm` cleans up a container's anonymous volumes right along with the container itself.

> **Pitfall, and a real, precise distinction worth internalizing exactly:** `VOLUME` in a Dockerfile is a statement about *where data for this path lives* (a volume, not the writable layer) — it says nothing about *which* volume, run to run, unless the caller supplies one explicitly with `-v <name>:<path>`. A capstone (or a real application) relying on `VOLUME` alone, assuming it automatically provides continuity across separate container runs, will see exactly this capstone's second example: every run technically "has a volume," and every run still starts from zero.

## Practice

- Run `docker run --rm visit-tracker:v1` a third time and confirm `docker volume ls` still shows no anonymous volumes afterward — the cleanup happens every time, not just once.
- Remove `--rm` from one invocation (`docker run --name kept_container visit-tracker:v1`), let it finish, then check `docker volume ls` again — does the anonymous volume from *this* run still exist, now that the container itself wasn't automatically removed? Clean up afterward with `docker rm kept_container` and `docker volume prune`.
- Rewrite `visit.sh` to also record which container's hostname made each visit (`hostname` command), rerun the three-invocation persistence test, and confirm each of the three log lines shows a *different* container hostname despite sharing one continuous log — direct proof that the log's continuity comes from the volume, not from any single container instance.

## Progress check

1. What does `VOLUME /logs` in a Dockerfile guarantee, precisely, and what does it not guarantee?
2. Why did three separate, `--rm`'d containers each mounting `-v visits_data:/logs` correctly show an incrementing total, while three separate containers with no explicit `-v` each showed `total visits: 1`?
3. What happened to the anonymous volumes created by the no-explicit-`-v` runs, verified directly via `docker volume ls`?
4. What's the practical lesson for a real application that needs its data to persist across restarts, based on this capstone's two contrasting examples?

### Answers

1. It guarantees that path is backed by a volume rather than the container's own writable layer — it does not guarantee that volume is the *same* one across separate container runs; without an explicit `-v <name>:<path>`, each run gets its own fresh anonymous volume.
2. Because `-v visits_data:/logs` explicitly names the same volume every time, giving all three runs a shared, continuous view of `/logs`; without that explicit name, Docker created a distinct anonymous volume for each of the three runs, each starting empty.
3. They were removed — verified directly, `docker volume ls` showed no anonymous volumes after the `--rm`'d runs completed, since `--rm` cleans up a container's anonymous volumes along with the container itself.
4. Relying on a Dockerfile's `VOLUME` instruction alone is not sufficient for real persistence — an application (or a script invoking `docker run`) needs to explicitly name and reuse a specific volume (`-v <name>:<path>`) for data to genuinely survive across separate, independent container runs.
