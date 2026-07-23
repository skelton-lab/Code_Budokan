# Resources & Cheat Sheet

## References

| Resource | Why it matters |
|---|---|
| [The Rails Guides](https://guides.rubyonrails.org/) | The anchored toolchain's own authoritative reference |
| [The Rails API documentation](https://api.rubyonrails.org/) | Precise, per-class/method reference |
| This series' [Ruby guide](../ruby/00-overview.md) | Duck typing, mixins, and `define_method` — the direct foundation this guide built on |
| This series' [SQL guide](../sql/00-overview.md) | The relational model, joins, constraints, and transactions ActiveRecord sits on top of |
| This series' [Docker guide](../docker/00-overview.md) | The containerization material Kamal deployment builds on |

## One-page cheat sheet

| Idea | Where |
|---|---|
| MVC — model (data), view (presentation), controller (request handling) | Module 1 |
| `resources :posts` — one line, seven RESTful routes | Module 1 |
| `bin/rails generate scaffold` — migration, model, controller, views, routes, tests, one command | Module 2 |
| Column accessors are generated at class-load time, not hand-written — verified via `instance_methods(false)` and `method(...).owner` | Module 2 |
| `has_many`/`belongs_to` — real, chainable ActiveRecord relations, not plain arrays | Module 4 |
| `belongs_to` is required by default (Rails 5+) — `optional: true` for the exception | Module 4 |
| `dependent: :destroy` — N separate `DELETE`s with real callbacks, not one `ON DELETE CASCADE` | Module 4 |
| `foreign_key: true` — a real, database-enforced constraint, independent of ActiveRecord | Module 4 |
| `validates`/`validate` — presence, uniqueness, custom rules, all pre-database-write | Module 5 |
| `bin/rails generate authentication` — login + password reset, bcrypt-backed, no Devise required | Module 7 |
| Registration is NOT generated — build it yourself, remember `allow_unauthenticated_access` | Module 7 |
| `ApplicationController` requires authentication everywhere by default the moment auth is generated | Module 8 |
| `Current.user.posts.build(...)` — structurally safer than a trusted `user_id` param | Module 8 |
| `sign_in_as` + `ActionDispatch::IntegrationTest` — the idiomatic way to verify auth, not raw `curl` | Module 10 |
| Fixtures bypass validations (raw SQL insert) but not real database constraints | Module 10 |

## A note on this guide's verification tier

Every claim in this guide was checked against a real, running Rails 8.1.3 app — HTTP requests via `curl` with real CSRF tokens extracted from real rendered forms, direct model inspection via `bin/rails runner`, and a real `bin/rails test` suite, not scaffold output trusted on faith. Two genuine toolchain findings (the Homebrew gem-plugin permission failure, and `--minimal`'s effect on the native auth generator's password-reset flow) were traced to their actual root cause via full backtraces, not guessed at. Three real, honest mistakes were made and caught during this guide's own construction — a stale filename/line reference, a cascading-delete test that didn't account for existing fixture data, and a CSRF token grabbed from the wrong form on a page — each one kept in as this guide's own entry in this series' running "real bugs found" thread, not silently fixed and hidden.

## Where to go now

This guide closes out the last queued candidate in this series — the payoff `ruby/06-metaprogramming.md` promised directly ("the exact mechanism Rails' ActiveRecord runs on") and `sql/`'s entire second half quietly prepared for. With Rails complete, every guide originally planned or later queued in `INDEX.md` is now built, verified, and cross-referenced.
