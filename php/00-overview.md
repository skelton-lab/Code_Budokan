# PHP — A Session-Based Study Guide

**Promise:** read, write, and maintain modern PHP (8.5) as it's actually used today — embedded-in-HTML templating (still real, still how a `.php` file works), the request-scoped execution model, PHP 8.x's genuinely modern type system, and a real database-backed small app — verified against 8.5 specifically, not the "stuck in 1999" caricature.

**Audience:** this series' existing reader, arriving with real preparation already in hand. `javascript/07-server.md` built a small in-memory `/api/users` HTTP server and named its own honest limitation directly: state is lost on restart. This guide rebuilds the identical API in PHP and finds something sharper — state doesn't survive to the *next request*, restart or not, because of how PHP fundamentally runs. `sql/`'s own material — and `rails/`'s lesson that ActiveRecord is a real ORM sitting directly on a relational model, not a different one — is the direct prerequisite for this guide's own database work: PDO is what ActiveRecord automates.

**Toolchain (anchored):** **PHP 8.5.8** (Homebrew, `brew install php`), the built-in development server (`php -S`) for everything — no Apache, no nginx, no `mod_php`, matching how PHP is actually run in local development today. SQLite via PDO for the database capstone (`PDO_SQLITE`, already available in this Homebrew build) — the same database `sql/` and `rails/` both already used, zero new infrastructure. Composer for the packaging/testing module.

## Capstone log

| # | Capstone | Proves |
|---|---|---|
| 1 | A templated multi-page site | The literal `<?php ... ?>`-in-HTML identity — PHP's alternate control-structure syntax (`if: … endif;`) built specifically for templates, `$_GET`/`$_POST` as form data |
| 2 | Rebuild `javascript/07-server.md`'s API, verify the state contrast | Same `/api/users` GET/POST/GET-by-id shape, PHP's built-in server — directly, live-verified: in-memory state resets on *every request*, not just restart |
| 3 | A small OOP domain model | Constructor property promotion, `readonly` properties, `enum` (pure and backed), union types, `match` — PHP 8.x's real type-system additions |
| 4 | A database-backed app with auth | PDO prepared statements (direct callback to `sql/`, and to what Rails' ActiveRecord automates), `password_hash()`/`password_verify()`, sessions — extended with Composer + PHPUnit tests |

## Module list

1. **Foundations** — the `$` sigil, loose typing vs. `declare(strict_types=1)`, PHP's array (one type, both list and map), string interpolation, functions.
2. **Embedded templating** — `<?php ?>`/`<?=`, the alternate control-structure syntax, `$_GET`/`$_POST`.
3. **Capstone 1** — the templated site.
4. **The request lifecycle** — `php -S`, and the live-verified contrast against `javascript/07-server.md`'s persistent-process model.
5. **Capstone 2** — the rebuilt API, contrast confirmed.
6. **Modern OOP & types** — promoted properties, `readonly`, `enum`, unions, `match`, `?->`.
7. **Capstone 3** — the OOP domain model.
8. **PDO & prepared statements** — parameter binding, a live SQL-injection demonstration.
9. **Sessions, forms, and real password hashing** — `$_SESSION`, `password_hash()`/`password_verify()`.
10. **Capstone 4** — the database-backed app.
11. **Composer & PHPUnit** — `composer.json`, PSR-4 autoloading, real tests against Capstone 4's app.
12. **Beyond this guide** — Laravel/Symfony, WordPress, namespaces/PSR, legacy PHP, static analysis.
13. **Final assessment.**

## Setup

```bash
brew install php
php --version   # this guide is verified against 8.5.8
```

No project scaffolding needed up front — every module runs directly with `php` or `php -S`, the same way every capstone in this guide is actually built.
