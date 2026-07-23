# Module 12 — Beyond This Guide

Every topic here failed the capstone-impact test — real, worth knowing exists, but not required by any of this guide's four capstones. Each entry states what it is, why it matters, and where to go deeper.

### Hotwire, Turbo, and Stimulus

**What it is:** Rails' own default approach to interactivity without a separate JavaScript SPA framework — Turbo handles page navigation and partial updates over the wire; Stimulus adds small, targeted JavaScript behavior to server-rendered HTML.

**Why it matters:** genuinely the modern Rails default (a plain `rails new` includes both), but none of this guide's four capstones needed client-side reactivity — every view here is a plain, full-page ERB render, verified with plain HTTP requests throughout.

**Where to go next:** the official Hotwire documentation (hotwired.dev); a plain `rails new` (without `--minimal`) to see Turbo/Stimulus wired up by default.

### Action Cable and WebSockets

**What it is:** Rails' built-in WebSocket framework, for real-time, bidirectional features (live comment updates, notifications) without polling.

**Why it matters:** none of this guide's capstones need real-time push — a comment posted by one user only needs to appear for other users on their *next* page load, not instantly.

**Where to go next:** the official Action Cable guide.

### Solid Queue: background jobs

**What it is:** ActiveJob is Rails' framework-level abstraction for background work (`perform_later`); Solid Queue is Rails 8's own new default *adapter* for it, backed by the database itself rather than Redis. Verified directly: `--minimal` comments out `require "active_job/railtie"` in `config/application.rb` entirely — ActiveJob isn't merely unconfigured, the framework itself isn't loaded, confirmed by an `uninitialized constant ActiveJob` error on a job class that referenced it. Uncommenting that one line restores it immediately, with Rails' own built-in `AsyncAdapter` (an in-process thread pool, not Solid Queue) as the default once it's back:

```ruby
WelcomeMessageJob.perform_later("test@example.com")
# => enqueued and run via ActiveJob::QueueAdapters::AsyncAdapter, verified directly
```

**Why it matters:** genuinely necessary the moment an app needs to do real work outside the request/response cycle (sending an email, processing an upload) — but no capstone here needed deferred work; every operation in this guide completes within its own request.

**Where to go next:** the official Active Job Basics guide; the Solid Queue README for the database-backed adapter specifically.

### Devise and OmniAuth: the pre-Rails-8 alternative

**What it is:** Devise has been the dominant third-party Rails authentication gem for over a decade — configurable, extensible, and (before Rails 8) close to a required dependency for real-world Rails auth. OmniAuth adds third-party OAuth login (Google, GitHub, etc.) on top.

**Why it matters:** Capstone 3 covered Rails 8's own native generator in full — real, working, genuinely sufficient for this guide's own scope. Devise remains the right tool the moment a project needs features the native generator doesn't provide out of the box: configurable lockable/confirmable/trackable modules, or third-party OAuth via OmniAuth specifically.

**Where to go next:** the Devise README; the OmniAuth README.

### Kamal and deployment

**What it is:** Kamal is Rails 8's own new default deployment tool — Docker-based, `kamal deploy` to any server with SSH access, no platform-as-a-service required. A plain `rails new` (without `--minimal`) includes `config/deploy.yml` and a `Dockerfile` by default.

**Why it matters:** genuinely relevant the moment this guide's blog needs to actually run somewhere real — but no capstone here deploys anywhere; every verification in this guide runs against `localhost`.

**Where to go next:** the official Kamal documentation; this series' own `docker/` guide, whose containerization material Kamal builds directly on top of.

### API-only mode

**What it is:** `rails new --api` strips views, ERB, and browser-facing middleware, producing a leaner app whose controllers only ever render JSON — the standard starting point for a Rails app serving a separate frontend (a JavaScript SPA, a mobile app) rather than rendering HTML itself.

**Why it matters:** this guide's own scaffold, verified directly in Module 2, doesn't even generate JSON views by default in a plain `rails generate scaffold` — every capstone here stayed server-rendered ERB throughout, matching `--api` mode's own opposite of what this guide actually needed.

**Where to go next:** the official "Using Rails for API-only Applications" guide.

### RSpec

**What it is:** the dominant alternative to `minitest` in the real-world Rails ecosystem — a separate DSL (`describe`/`it`/`expect`) with its own extensive plugin ecosystem (`factory_bot`, `capybara`, `shoulda-matchers`).

**Why it matters:** genuinely widespread in real Rails codebases — worth knowing it exists and reads differently the moment you're contributing to an existing project that chose it. This guide's own testing module (Module 10) anchored to `minitest` specifically because it's what `ruby/07` already used — not a judgment that `minitest` is objectively superior, a deliberate continuity choice for this series.

**Where to go next:** the official RSpec-Rails documentation.

## The wider ecosystem

- **[The Rails Guides](https://guides.rubyonrails.org/)** — the anchored toolchain's own authoritative reference.
- **[The Rails API documentation](https://api.rubyonrails.org/)** — precise, per-class/method reference, useful directly alongside the guides above.
- **This series' [Ruby guide](../ruby/00-overview.md)** — duck typing, mixins, and `ruby/06-metaprogramming.md`'s `define_method` example, the direct foundation this guide built on.
- **This series' [SQL guide](../sql/00-overview.md)** — the relational model, joins, constraints, and transactions ActiveRecord sits directly on top of.
- **This series' [Docker guide](../docker/00-overview.md)** — the containerization material Kamal deployment builds on.
