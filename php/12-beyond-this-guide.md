# Module 12 — Beyond This Guide

Real topics that don't trace to any of this guide's four capstones — named directly, not silently dropped.

### Laravel and Symfony

**What it is:** the two dominant full-featured PHP frameworks — Laravel especially, PHP's own closest equivalent to Rails: routing, an ORM (Eloquent), migrations, authentication scaffolding, a templating engine (Blade) built on top of exactly the `<?= ?>` foundations Module 2 taught.

**Why it matters:** almost all real, current PHP web development beyond a small script happens inside one of these two frameworks, not in raw `php -S` scripts the way this guide's capstones were built.

**Why it's a signpost, not a module:** this series already has one full ORM-framework capstone-guide — `rails/`. A structurally identical second build for Laravel (routes → controller → Eloquent model → Blade view) would teach the same lesson twice, in different syntax, rather than a new one. What this guide built instead — PDO by hand, sessions by hand, `password_hash()` by hand — is precisely the layer Laravel's own Eloquent, `Auth` facade, and session middleware automate, the same relationship `rails/`'s own Capstone 4 lesson named for ActiveRecord.

**Where to go next:** [Laravel's own official documentation](https://laravel.com/docs), specifically its Eloquent ORM chapter — it will read as immediately familiar after Module 8's PDO work.

### WordPress

**What it is:** not a framework in the Laravel/Rails sense — a specific content-management application with its own plugin and theme architecture, built on top of plain PHP function hooks (`add_action()`, `add_filter()`) rather than a class-based routing system.

**Why it matters:** this is genuinely the single most common real-world PHP a reader will actually encounter — WordPress alone runs a large share of all websites, and its own historical significance was this guide's own cited justification for existing in this series at all (see `INDEX.md`).

**Minimal taste:**
```php
<?php
// A minimal WordPress plugin hooks into named actions/filters —
// no class required, no routing table, just functions registered by name.
add_action('wp_footer', function () {
    echo '<!-- Hello from a real WordPress plugin hook -->';
});
```

**Why it's a signpost:** WordPress's own conventions (the Loop, hooks, the `wp_` global function namespace) are specific to WordPress itself, not general PHP literacy — everything this guide actually taught (templating, PDO, sessions, OOP) transfers directly into understanding WordPress internals, but WordPress's own API surface is its own, much larger subject.

**Where to go next:** the [WordPress Plugin Developer Handbook](https://developer.wordpress.org/plugins/).

### Namespaces and PSR standards beyond PSR-4

**What it is:** Module 11 covered PSR-4 (autoloading) specifically because Capstone 4's testing setup needed it. PHP-FIG (the Framework Interop Group) maintains a much longer list of PSRs — PSR-1/PSR-12 (coding style), PSR-7 (HTTP message interfaces), PSR-11 (dependency injection containers), and more — the shared conventions that let PHP packages from different authors interoperate cleanly.

**Why it matters:** any real, multi-package PHP project (which is to say, almost anything built with Composer beyond a single script) runs into these conventions eventually, especially PSR-12's coding-style rules, which most PHP linters enforce by default.

**Where to go next:** [PHP-FIG's own PSR list](https://www.php-fig.org/psr/).

### Legacy PHP: pre-8.0 code and the `mysql_*` functions

**What it is:** PHP has a genuinely long history of code still running in production written for PHP 5, or even PHP 4 — including the long-deprecated (and since PHP 7, fully removed) `mysql_*` function family this guide's own PDO material replaced.

**Why it's a signpost, not a module:** unlike COBOL or Fortran, where this series' own stated promise explicitly included reading decades-old legacy code, this guide's promise is "modern PHP as it's actually used today" — reading pre-8.0 PHP isn't core to that promise the way it was core to COBOL's own "still running the world's banking systems" claim.

**Where to go next:** if you do encounter pre-8.0 code, the [PHP manual's own migration guides](https://www.php.net/manual/en/migration80.php) document exactly what changed, version by version.

### Static analysis: PHPStan and Psalm

**What it is:** tools that analyze PHP source without running it, catching real type errors PHP's own runtime would only discover if that exact code path actually executed — genuinely more than a linter, closer to what a compiler's type checker catches in Rust or Haskell (companion threads this series already traced in depth).

**Why it matters:** PHP's own type system (Module 6's readonly/enum/union additions included) is real but optional and gradually-adoptable — static analysis tools catch violations of type *intent* even in code that would technically run without error.

**Minimal taste:**
```bash
composer require --dev phpstan/phpstan
vendor/bin/phpstan analyse src/
```

**Where to go next:** [PHPStan's own documentation](https://phpstan.org/user-guide/getting-started), starting at its default (lowest) analysis level and increasing gradually — its own recommended path for an existing codebase.
