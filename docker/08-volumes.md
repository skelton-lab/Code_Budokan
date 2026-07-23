# Module 8 — Volumes and Persistent Data

Everything this guide has run so far has been fine losing its data when a container is removed — Module 1 demonstrated that directly. The moment a container needs to keep something across restarts (a database's actual data, a log file someone needs to read later), a container's own writable layer isn't the right place for it. Every command below is a real, verified `docker` run. Feeds Capstone 4.

## Without a volume: confirmed, again, and with real stakes

**You'll be able to:** state precisely what happens to data written inside a container with no volume, once that container is removed.

**Concept**

Module 1 already showed a fresh container never sees a file written in a different container. The identical fact matters more once a container is holding data someone actually cares about: removing it destroys that data, permanently, with the container's writable layer.

**Example**

```bash
docker run -d --name no_volume_test alpine:latest sh -c "echo 'important data' > /data.txt && sleep 30"
docker exec no_volume_test cat /data.txt
docker rm -f no_volume_test
```

Verified: `docker exec` correctly reads back `important data` while the container is still running — the data genuinely existed. After `docker rm -f`, there is no way to recover it; the container (and its one and only copy of that file) is gone.

## Named volumes: data that outlives any specific container

**You'll be able to:** create a named volume, mount it into a container, and verify data survives that container's removal.

**Concept**

`docker volume create <name>` creates a storage location Docker manages independently of any container. `-v <volume-name>:<container-path>` mounts it — writes inside that path go to the volume, not the container's own writable layer, and the volume persists after the container is removed, ready to be mounted into a completely different, later container.

**Example**

```bash
docker volume create my_data_volume
docker run -d --name vol_test1 -v my_data_volume:/data alpine:latest sh -c "echo 'persisted data' > /data/marker.txt && sleep 30"
docker exec vol_test1 cat /data/marker.txt
docker rm -f vol_test1
docker run --rm -v my_data_volume:/data alpine:latest cat /data/marker.txt
```

Verified: `persisted data` is read back **twice** — once from the original container, and again from a **brand-new** container, created after the first one was completely removed, mounting the same named volume. The data belongs to the volume, not to any one container's lifetime.

> **Pitfall:** it's easy to assume "the container has the data" when really "the volume, which happens to currently be mounted into this container, has the data" — the distinction only becomes visible the moment a container using a volume gets removed and recreated, exactly as this example demonstrates. `docker volume ls` and `docker volume inspect <name>` (which reports the volume's actual storage location, e.g. `/var/lib/docker/volumes/my_data_volume/_data`, inside the Docker host) are the tools for confirming a volume's contents independent of any specific container.

## Bind mounts: sharing a host path directly — and a real, environment-specific gotcha

**You'll be able to:** mount a host directory into a container, and know exactly which host paths are actually reachable given this guide's Colima-based setup.

**Concept**

A **bind mount** (`-v <host-path>:<container-path>`) maps a specific host directory directly into a container — unlike a named volume (Docker-managed storage with no fixed host location you're expected to touch directly), a bind mount is exactly the host path you name, readable and writable from both sides.

**Example — a real failure, verified directly, specific to this guide's Colima setup:**

```bash
docker run --rm -v /tmp/some_host_dir:/hostdata alpine:latest cat /hostdata/host_file.txt
```

Verified: `cat: can't open '/hostdata/host_file.txt': No such file or directory` — even with the file genuinely present at that exact path on the host. The cause, found by checking Colima's own VM configuration directly (`~/.colima/_lima/colima/lima.yaml`):

```yaml
mounts:
    - location: "~"
      writable: true
```

**Colima only shares the home directory (`~`) into its VM by default** — `/tmp` (and anywhere else outside the home directory tree) simply isn't visible inside the VM Docker itself is running in, regardless of what `docker run -v` asks for. This is a real, environment-specific fact about this guide's toolchain, not a universal Docker behavior — Docker Desktop, for comparison, shares a broader set of paths by default.

**The fix, verified directly:**

```bash
docker run --rm -v ~/some/path/under/home:/hostdata alpine:latest cat /hostdata/host_file.txt
```

Verified: correctly reads the file's contents, and a second run writing to the same mounted path correctly shows the write reflected on the host filesystem afterward.

> **Pitfall, and a genuinely easy mistake in exactly this Colima-based setup:** a bind-mount path outside the home directory doesn't raise an error at `docker run` time — it just silently presents as an empty (or wrong) directory inside the container, from Colima's perspective a path that was never shared into the VM at all. The fix, if a path genuinely needs to live outside the home directory, is `colima start --mount <path>:w` (adding it to Colima's own shared-mount configuration) — not something `docker run` alone can override.

**Practice**

- Confirm directly: does a *named volume* (Module 8's first example) have this same home-directory restriction, or is it unaffected, since Docker manages its actual storage location itself rather than relying on a host path you specify?
- Create a bind mount to a path under your home directory, write a file from the container, and confirm the file's ownership (`ls -la` on the host) — does it appear owned by your own host user, or by whatever user the container's process ran as?

## Progress check

1. What happens to data written inside a container's own writable layer once that container is removed, with no volume involved?
2. What's the practical difference between a named volume and a bind mount?
3. Why did `docker rm -f vol_test1` followed by a fresh `docker run` with the same `-v my_data_volume:/data` still show the original data?
4. Why did bind-mounting `/tmp/some_host_dir` fail silently rather than erroring, specific to this guide's Colima setup?
5. What's the actual fix for reaching a host path outside the home directory with this guide's Colima configuration?

### Answers

1. It's destroyed, irrecoverably, along with the container's writable layer — verified directly, a file written and confirmed present via `docker exec` was permanently gone once the container was removed.
2. A named volume is storage Docker manages itself, with no fixed host-visible location you're expected to interact with directly (though one exists, inspectable via `docker volume inspect`); a bind mount maps an exact, already-existing host path directly into the container, both sides sharing that same location.
3. Because the volume `my_data_volume` is a separate, Docker-managed entity that persists independently of any specific container's lifecycle — removing the container that happened to have it mounted doesn't touch the volume itself, and mounting the same volume into any later container gives that container access to the identical persisted data.
4. Because Colima, by default, only shares the home directory (`~`) into the VM Docker actually runs inside — `/tmp` isn't part of that shared mount configuration, so from inside the VM, a path under `/tmp` simply isn't the host's `/tmp` at all, regardless of what `docker run -v` requests.
5. Restarting Colima with an explicit additional shared mount (`colima start --mount <path>:w`) — `docker run -v` alone cannot make a path visible to the VM if Colima itself was never configured to share it.
