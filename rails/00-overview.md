# Ruby on Rails — A Session-Based Study Guide

**Promise:** build, relate, secure, and verify a real Rails application — MVC, ActiveRecord as an ORM sitting directly on `sql/`'s own relational model, and Rails 8's current, native feature set — with every claim checked against a real, running app, not scaffold output trusted on faith.

**Audience:** this series' existing reader, arriving with two guides' worth of real preparation already in hand. `ruby/06-metaprogramming.md` named this destination directly: "the exact mechanism Rails' ActiveRecord runs on." `sql/`'s entire second half — joins, constraints, transactions, indexing — describes the relational layer ActiveRecord sits on top of, not a different one. This guide is the payoff for both.

**Toolchain (anchored):** **Rails 8.1.3** (`gem install rails`, Ruby 4.0.6 via Homebrew), SQLite as the default database, `rails new --minimal`. The `--minimal` flag strips Turbo/Stimulus, Solid Queue/Cache/Cable, Kamal, and RuboCop from a fresh app — every one of them a genuine, real Rails 8 default, and every one of them this guide's own ecosystem-breadth triage (below) scoped to a signpost, not a capstone. Anchoring to `--minimal` isn't a simplification for its own sake — it's the same scoping decision made visible in the toolchain itself.

**Two genuine toolchain findings, verified directly, not smoothed over:**

1. A bare `rails new` fails its own automatic `bundle install` step with `Errno::EACCES: Permission denied @ rb_sysopen - .../plugins/rdoc_plugin.rb`. Traced via the full backtrace to `Gem::InstallerUninstallerUtils#regenerate_plugins_for`, trying to write a plugin shim into Homebrew's read-only system gem directory. The fix, confirmed to resolve it cleanly and permanently: `bundle config set --global path 'vendor/bundle'`, run *once*, before ever running `rails new` — every subsequent app then installs its gems locally, automatically, with no per-project step needed.
2. `bin/rails generate authentication` — Rails 8's own native auth generator, covered in Module 7 — assumes `ActionMailer` is available for its password-reset flow. `--minimal` strips `ActionMailer`. Run the generator against a `--minimal` app and the result is a genuinely broken corner: `PasswordsController` has no `create` action, and the generator's own auto-generated test references a `PasswordsMailer` class that was never created. Verified directly, not assumed — and precisely why this guide's own capstones use login and registration, but not the password-reset flow, with the gap named explicitly rather than left as a silent broken file.

## Capstone log

| # | Capstone | Proves |
|---|---|---|
| 1 | A Blog with Full CRUD | MVC's real layers (routes → controller → view → model), verified with real HTTP requests including a genuine CSRF-protected form submission |
| 2 | Comments, Validations, and Cascading Deletes | `has_many`/`belongs_to`, `validates`, `dependent: :destroy`, and a real database-level foreign key — verified to reject an invalid insert even when ActiveRecord's own validations are bypassed |
| 3 | A Blog Only Its Author Can Edit | Rails 8's native authentication generator, plus real authorization — verified with two actual registered users, one attacking the other's post directly, blocked |
| 4 | A Verified Test Suite for the Whole App | Model, controller, and integration tests via `minitest` — the same framework `ruby/07`'s testing module used, closing this series' verification-discipline thread for Rails itself |

## Module list

1. **Rails' Anatomy: MVC, Routing, Convention over Configuration** → feeds Capstone 1
2. **Scaffolding a Resource: Models, Migrations, and ActiveRecord's Dynamic Accessors** → feeds Capstone 1
3. **Capstone 1** — A Blog with Full CRUD
4. **Associations: `has_many`/`belongs_to` and Cascading Deletes** → feeds Capstone 2
5. **Validations: Presence, Uniqueness, and Custom Rules** → feeds Capstone 2
6. **Capstone 2** — Comments, Validations, and Cascading Deletes
7. **Authentication: Rails 8's Native Generator** → feeds Capstone 3
8. **Authorization: Scoping Records to `current_user`** → feeds Capstone 3
9. **Capstone 3** — A Blog Only Its Author Can Edit
10. **Testing Rails: Fixtures, Model, Controller, and Integration Tests** → feeds Capstone 4
11. **Capstone 4** — A Verified Test Suite for the Whole App
12. **Beyond This Guide** — signposts only
13. **Final Assessment** + **Resources**

## Ecosystem-breadth triage

| Topic | Capstone-impact test | Treatment |
|---|---|---|
| Hotwire/Turbo/Stimulus | No capstone needs client-side reactivity; all four are server-rendered ERB | **Signpost** |
| Action Cable / WebSockets | No capstone needs real-time push | **Signpost** |
| Solid Queue (background jobs) | No capstone needs async work | **Signpost**, with a real minimal taste |
| Devise / OmniAuth | Rails 8's native generator covers Capstone 3 fully | **Signpost**, direct comparison |
| Kamal / deployment | No capstone deploys anywhere | **Signpost** |
| API-only mode | This guide stays server-rendered throughout | **Signpost** |
| RSpec | `minitest` is the anchored framework, matching `ruby/`'s own choice | **Signpost**, name-checked only |

## Setup

```bash
gem install rails
bundle config set --global path 'vendor/bundle'   # once, before the first `rails new` — see finding #1 above
rails --version   # confirmed: Rails 8.1.3
```

Verification pattern used throughout this guide:

```bash
bin/rails server -d          # boot in the background
curl http://localhost:3000/  # verify with a real HTTP request
bin/rails test                # verify with the real test suite
```
