# Module 10 — Networking and Docker Compose

One container reaching another by name doesn't happen automatically — it depends entirely on which network they're on, verified directly below with a genuine before/after. Docker Compose's real value, once that's understood, is that it creates the right kind of network for you, alongside every service it defines. Every command below is a real, verified `docker`/`docker compose` run. Feeds Capstone 5.

## The default bridge network doesn't resolve container names

**You'll be able to:** explain why one container can't reach another by name unless they're on a network that supports it.

**Concept**

Every container gets attached to Docker's `bridge` network by default unless told otherwise. The default `bridge` network provides IP connectivity between containers, but **not** automatic DNS-based name resolution — reaching another container by its container name requires a **user-defined** network instead.

**Example**

```bash
docker run -d --name web1 alpine:latest sleep 60
docker run --rm alpine:latest ping -c 1 -W 2 web1
```

Verified: `ping: bad address 'web1'` — even though `web1` is genuinely running, the pinging container (on the default `bridge` network) has no way to resolve that name to an address.

```bash
docker network create my_net
docker run -d --name web2 --network my_net alpine:latest sleep 60
docker run --rm --network my_net alpine:latest ping -c 1 -W 2 web2
```

Verified: `64 bytes from 172.18.0.2: seq=0 ttl=64 time=0.221 ms` — the identical `ping`-by-name, now against a container on a **user-defined** network (`my_net`), resolves correctly and succeeds. Docker's embedded DNS server automatically provides name resolution for containers sharing a user-defined network — a capability the default `bridge` network was never given.

> **Pitfall:** it's easy to assume "containers can always reach each other by name, that's just how Docker networking works" — verified directly, it's specifically a property of user-defined networks, not networking in general. Two containers both technically "running" and both technically "networked" can still fail to reach each other by name if one assumption (a shared, user-defined network) doesn't actually hold.

## Docker Compose: one network per project, automatically

**You'll be able to:** define multiple services in a `compose.yaml` file and confirm they can reach each other by service name with no manual network setup.

**Concept**

`docker compose up` reads a `compose.yaml` file, and — critically, given the previous session — automatically creates a user-defined network for the whole project, attaching every defined service to it. Each service becomes reachable by its **service name**, the same name used as the key in the YAML file.

**Example**

```yaml
services:
  web:
    image: python:3.12-slim
    working_dir: /site
    volumes:
      - ./webroot:/site
    command: ["python3", "-m", "http.server", "8000"]
  client:
    image: alpine:latest
    command: ["sh", "-c", "apk add --no-cache curl >/dev/null && sleep 2 && curl -s http://web:8000/"]
    depends_on:
      - web
```

```bash
docker compose -f compose.yaml up --abort-on-container-exit
```

Verified output: `client-1  | Hello from the web service!` — `client`'s `curl http://web:8000/` correctly resolved `web` to the running `python3 -m http.server` container and retrieved `webroot/index.html`'s actual contents, with zero explicit network configuration written anywhere in the file — Compose created the shared, user-defined network this module's first session showed was required, automatically, as a direct consequence of both services being declared in the same `compose.yaml`.

> **Pitfall, and a real one hit directly while building this guide:** the first attempt at this exact example placed the project (and its `./webroot` bind mount) under `/tmp`, and the `client` service's `curl` returned a generic directory-listing page instead of the real file contents — not a networking failure at all, but Module 8's Colima home-directory bind-mount restriction resurfacing in a completely different context. Moving the same `compose.yaml` and `webroot/` under the home directory fixed it immediately, with no other change. The lesson generalizes past this one guide's specific Colima setup: a bind-mounted volume silently serving empty or wrong content is worth checking as a mount-visibility problem before assuming the *application* (here, `http.server`) is misbehaving.

`depends_on: [web]` controls **start order** only (Compose starts `web` before `client`) — it does not wait for `web` to actually be ready to accept connections, which is why this example's `client` command includes an explicit `sleep 2` before `curl`, a real, common workaround for a real gap `depends_on` alone doesn't close.

**Practice**

- Remove `depends_on` entirely and rerun — does `client` still usually succeed, given Compose still starts both services close together? Run it several times and check whether the result is reliably consistent without `depends_on`, or occasionally flaky.
- Add a third service (`client2`, an identical copy of `client` but curling `http://web:8000/` with a different `sleep` delay) and confirm all three services show up correctly in `docker compose ps` while the project is running.
- Explain, using this module's first session, exactly what `docker compose up` did that made `curl http://web:8000/` (a plain service-name URL, no IP address anywhere) resolve correctly.

## Progress check

1. Why did `ping web1` fail on the default `bridge` network but succeed against an identically-configured container on a user-defined network?
2. What does `docker compose up` create automatically that a bare series of `docker run` commands would not, unless explicitly told to?
3. What does `depends_on` actually control, and what does it *not* guarantee?
4. What was the real cause of `client`'s `curl` returning a directory listing instead of the actual file contents in this guide's own first attempt at this example, and how was it fixed?
5. Why did this guide's `client` service include an explicit `sleep 2` before its `curl` call, given `depends_on: [web]` was already present?

### Answers

1. Docker's default `bridge` network provides IP connectivity but no DNS-based name resolution between containers; a user-defined network (created explicitly, or automatically by Compose) additionally provides that name resolution via Docker's embedded DNS server — verified directly, the identical `ping <name>` command failed on one and succeeded on the other.
2. A dedicated, user-defined network for the whole project, with every defined service automatically attached to it and reachable by its service name — the exact capability Module 10's first session showed doesn't exist by default.
3. It controls the *order* Compose starts services in (`web` before `client`) — it does not wait for the dependency to actually be ready to accept connections/requests, which is why a service that needs to be fully ready often still needs its own explicit readiness check or delay.
4. The bind-mounted `./webroot` directory lived under `/tmp`, outside Colima's default shared-mount path (Module 8's own finding) — the mount silently presented as empty inside the container, so `http.server` correctly served a directory listing for what looked like an empty directory. Moving the project under the home directory fixed it, with no networking change needed at all.
5. Because `depends_on` only guarantees `web`'s container process starts before `client`'s — it doesn't guarantee `python3 -m http.server` has finished starting up and is actually accepting connections by the time `client` runs, so the explicit delay covers the real gap between "container started" and "service ready."
