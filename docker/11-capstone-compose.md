# Module 11 — Capstone 5: A Report API and a Poller, Orchestrated

**Proves:** `docker-compose.yml`, service-to-service networking by name, and a named volume outliving the whole project's containers together (Modules 8, 10) — this guide's final capstone, and the one that pulls every prior capstone's thread into one running system.

`python/`'s transaction-totals logic, now served over HTTP instead of run once from the command line — a `report-api` service reusing `pipeline.py` directly, and a `poller` service that queries it repeatedly and logs the results to a volume that survives the whole project being torn down. Every command below is a real, verified `docker compose` run.

## The two services

```python
# code_rookie_python/api.py — reuses pipeline.py's actual logic, unchanged
import json
from http.server import BaseHTTPRequestHandler, HTTPServer
from code_rookie_python.pipeline import parse_lines, totals_by_category

SAMPLE = ["Alice, 50.0, hardware", "Bob, 15.0, hardware", "Carol, 45.0, electronics", "Dave, 30.0, hardware"]

class Handler(BaseHTTPRequestHandler):
    def do_GET(self):
        if self.path == "/totals":
            totals = totals_by_category(parse_lines(SAMPLE))
            body = json.dumps(totals).encode()
            self.send_response(200)
            self.send_header("Content-Type", "application/json")
            self.end_headers()
            self.wfile.write(body)
        else:
            self.send_response(404)
            self.end_headers()

if __name__ == "__main__":
    HTTPServer(("0.0.0.0", 8000), Handler).serve_forever()
```

```yaml
services:
  report-api:
    build: .
    networks: [report-net]

  poller:
    image: alpine:latest
    depends_on: [report-api]
    volumes: [poller_logs:/logs]
    networks: [report-net]
    command: >
      sh -c "apk add --no-cache curl >/dev/null &&
             sleep 2 &&
             for i in 1 2 3; do
               echo \"poll $$i: $$(curl -s http://report-api:8000/totals)\" >> /logs/polls.log;
               sleep 1;
             done &&
             cat /logs/polls.log"

networks:
  report-net:
volumes:
  poller_logs:
```

`report-api` reuses the exact `totals_by_category`/`parse_lines` functions `python/07-capstone-cli-tool.md` and this guide's own `docker/05-capstone-containerized-cli.md` already verified independently — the computation itself hasn't changed at all, only how it's exposed (an HTTP endpoint instead of a one-shot CLI invocation).

## Verified run

```bash
docker compose -f compose.yaml up --abort-on-container-exit
```

Verified output:

```
poller-1  | poll 1: {"hardware": 80.0, "electronics": 45.0}
poller-1  | poll 2: {"hardware": 80.0, "electronics": 45.0}
poller-1  | poll 3: {"hardware": 80.0, "electronics": 45.0}
```

`{"hardware": 80.0, "electronics": 45.0}` — the identical totals this exact data has produced every time it's been computed across this entire series, now retrieved by `poller` over the network Compose built automatically (Module 10), reaching `report-api` purely by its service name, with zero explicit IP addresses or manual network setup written anywhere.

## The volume outlives the whole project

```bash
docker compose -f compose.yaml down
docker run --rm -v scratch_capstone5_poller_logs:/logs alpine:latest cat /logs/polls.log
```

Verified: all three poll log lines are still there, read back by a **brand-new** container, after `docker compose down` removed both `report-api` and `poller` **and** the `report-net` network entirely. This is Module 8's exact lesson, verified again here in a genuinely more realistic setting: `docker compose down` tears down containers and networks by default, but **not** named volumes — `docker compose down -v` would be needed to also remove `poller_logs`, a deliberate, separate decision Compose requires explicitly rather than as a side effect of tearing down everything else.

> **Pitfall:** this capstone's `poller` service includes an explicit `sleep 2` before its first request, for the identical reason Module 10 flagged — `depends_on: [report-api]` only guarantees start *order*, not that the HTTP server is actually accepting connections yet by the time `poller` runs. A more robust real system would use an actual health check (`healthcheck:` in Compose, not covered in this guide) rather than a fixed sleep, which works here specifically because this guide's `report-api` starts fast and predictably.

## Practice

- Add a second `poller`-style service that polls a different, deliberately-wrong path (`/nonexistent`) and confirm it correctly logs a `404`-shaped failure rather than crashing the whole `docker compose up` run.
- Run `docker compose down -v` instead of plain `down`, then repeat the volume-inspection step — confirm `polls.log` is now genuinely gone, matching the documented difference between the two commands.
- Trace, in your own words, exactly which prior module or capstone in this guide each piece of this capstone's `compose.yaml` traces back to: the `build:` step, the shared network, the named volume, and the `depends_on`/`sleep` pattern.

## Progress check

1. What computation does `report-api` actually perform, and where does that logic actually come from?
2. How did `poller` resolve `report-api` to an actual network address, with no IP address written anywhere in the Compose file?
3. What survived `docker compose down`, and what didn't — and which single flag would have changed that?
4. Why does `poller`'s command include an explicit `sleep 2` despite `depends_on: [report-api]` already being present?
5. What real-world capability would replace this capstone's `sleep 2` workaround with something more robust, not covered in this guide?

### Answers

1. `totals_by_category(parse_lines(SAMPLE))` — the identical function calls `python/07-capstone-cli-tool.md`'s `report` CLI tool and this guide's own containerized version of it both already used; only the delivery mechanism (HTTP instead of a CLI argument) changed.
2. Docker Compose automatically created a user-defined network (`report-net`) and attached both services to it, giving Docker's embedded DNS the information needed to resolve the service name `report-api` to that container's actual address — Module 10's exact mechanism, applied here.
3. The containers (`report-api`, `poller`) and the network (`report-net`) were removed; the named volume (`poller_logs`) survived, verified directly by reading its contents back with a fresh container afterward. `docker compose down -v` would have removed the volume too.
4. Because `depends_on` only controls start order, not readiness — `report-api`'s HTTP server needs a moment to actually start accepting connections after its container process begins, and nothing in `depends_on` waits for that specifically.
5. A Compose `healthcheck:` definition on `report-api`, combined with `depends_on: { report-api: { condition: service_healthy } }` — an actual readiness probe, rather than a fixed delay that only happens to be long enough for this specific, fast-starting service.
