# Module 1 — Foundations: Images and Containers

The one distinction Docker's entire model rests on: an **image** is a read-only template; a **container** is a running (or stopped) instance of one, with its own separate, writable state. Every command below is a real, verified `docker` run against a live Colima-backed daemon. Feeds Capstone 1.

## `docker run`: pulling an image, running a container

**You'll be able to:** run a container from a public image, and explain what happened the first time versus every time after.

**Concept**

`docker run <image> <command>` does two things in sequence: if `<image>` isn't already present locally, it's **pulled** from a registry (Docker Hub, by default); then a **container** — a running instance of that image — executes `<command>` inside it.

**Example**

```bash
docker run --rm alpine:latest echo "hello from a container"
```

Verified, first run: `Unable to find image 'alpine:latest' locally`, then a real pull (`Pulling from library/alpine`, several layers downloaded), then `hello from a container` printed, then the container exits. `docker images` before this command showed only `hello-world:latest` (from this guide's setup check); after, it also lists `alpine:latest` — the image is now cached locally, and a second `docker run` with the same image would skip the pull entirely.

`--rm` tells Docker to delete the container the instant it exits — useful for anything genuinely one-shot; omitting it, a stopped container still exists (and shows up in `docker ps -a`) until explicitly removed.

**Practice**

- Run `docker run --rm alpine:latest echo "second run"` and confirm no `Pulling from library/alpine` line appears this time — the image is already cached locally.

## Images are shared; containers are independent

**You'll be able to:** run multiple containers from one image, and explain why changes inside one are invisible to the others.

**Concept**

An image is a fixed, read-only template. Every container started from it gets its **own** writable layer on top — changes made inside one container (writing a file, installing something) never appear in another container started from the same image, and never modify the image itself.

**Example**

```bash
docker run --rm alpine:latest sh -c "echo 'container A was here' > /tmp/marker.txt && cat /tmp/marker.txt"
docker run --rm alpine:latest sh -c "cat /tmp/marker.txt"
```

Verified: the first command prints `container A was here` (the file was written and immediately read back, inside that one container). The second — a **new**, independent container from the identical `alpine:latest` image — reports `cat: can't open '/tmp/marker.txt': No such file or directory`. The file genuinely never existed anywhere but that first container's own writable layer, which was destroyed (`--rm`) the moment that container exited.

**Practice**

- Run two containers simultaneously from the same image with distinct `--name`s (`docker run -d --name c1 alpine sleep 60` and `docker run -d --name c2 alpine sleep 60`), and confirm `docker ps` lists both as separate, independently running containers with different container IDs, despite sharing one image.

## The container lifecycle: running, stopped, removed

**You'll be able to:** distinguish `docker ps` from `docker ps -a`, and explain why a stopped container still exists until explicitly removed.

**Concept**

`docker ps` lists only **running** containers. `docker ps -a` lists every container regardless of state — running, stopped ("exited"), or created but never started. A container that exits (or is `docker stop`ped) isn't gone; its filesystem and exit status stick around until `docker rm` (or `--rm` at creation) actually deletes it — and, separately from all of that, the underlying **image** persists independently of any container's lifecycle.

**Example**

```bash
docker run -d --name my_container alpine:latest sleep 60
docker stop my_container
docker ps        # empty
docker ps -a      # shows my_container, "Exited (137)"
docker rm my_container
docker ps -a       # my_container is gone
docker images | grep alpine   # alpine:latest is still there
```

Verified: after `docker stop`, `docker ps` reports no running containers, but `docker ps -a` still lists `my_container` with status `Exited (137)` — stopped, not deleted. After `docker rm`, `my_container` no longer appears in `docker ps -a` at all — but `docker images` still lists `alpine:latest`, confirming the image and the container it produced are genuinely separate, independently-managed things: removing every container ever created from an image doesn't touch the image itself.

> **Pitfall:** `docker stop` and `docker rm` are two different operations, easy to conflate — `stop` halts a running container without deleting it (its filesystem, logs, and exit code remain inspectable via `docker ps -a`/`docker logs`); only `rm` actually deletes it. A script that assumes `stop` alone cleans everything up will silently accumulate stopped-but-not-removed containers over time, each still consuming disk space for its writable layer.

**Practice**

- Predict, then verify, what `docker logs <container-name>` reports for a stopped-but-not-removed container — is the output from its run still accessible after it's exited?

## Progress check

1. What two things happen, in order, when `docker run <image>` is executed against an image not yet present locally?
2. What does `--rm` change about a container's lifecycle after it exits?
3. Why did a file written inside one container not appear when read from a second, independent container started from the identical image?
4. What's the precise difference between what `docker ps` and `docker ps -a` each report?
5. Why did `alpine:latest` still appear in `docker images` after every container created from it had been removed?
6. What's the practical consequence of confusing `docker stop` with `docker rm`?

### Answers

1. The image is pulled from a registry (if not already cached locally), then a container — a running instance of that image, with its own separate writable layer — is created and the given command executed inside it.
2. Without `--rm`, an exited container still exists (visible via `docker ps -a`, its filesystem and logs intact) until explicitly removed with `docker rm`. With `--rm`, the container is deleted automatically the instant it exits.
3. Because each container gets its own independent writable layer on top of the shared, read-only image — the file was written into the first container's own layer, which is entirely separate from any other container's layer, even one started from the identical image.
4. `docker ps` lists only currently-running containers; `docker ps -a` lists every container regardless of state (running, stopped, or created-but-never-started).
5. Because images and containers are separately managed — removing every container ever created from an image has no effect on the image itself, which persists in the local image cache (`docker images`) until explicitly removed with `docker rmi`.
6. `docker stop` only halts a running container, leaving its filesystem and state intact for inspection; treating it as equivalent to cleanup leaves stopped containers accumulating (each still consuming disk space) until someone explicitly runs `docker rm` on them.
