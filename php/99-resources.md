# Resources & Cheat Sheet

## References

| Resource | Why it matters |
|---|---|
| [PHP manual](https://www.php.net/manual/en/) | The complete reference for this guide's entire anchored toolchain (8.5) |
| [PHP: The Right Way](https://phptherightway.com/) | A community-maintained, current-practices guide — the antidote to outdated PHP advice still circulating online |
| [Composer documentation](https://getcomposer.org/doc/) | Module 11's dependency-management material, in full depth |
| [PHPUnit documentation](https://docs.phpunit.de/) | Module 11's testing material, in full depth |
| [PHP-FIG PSR list](https://www.php-fig.org/psr/) | Module 12's namespace/PSR signpost, in full |
| [Laravel documentation](https://laravel.com/docs) | Module 12's framework signpost — PHP's own closest equivalent to `rails/` |
| This series' [JavaScript guide](../javascript/07-server.md) | The direct source of Capstone 2's own comparison — `Bun.serve`'s persistent-process model against PHP's per-request one |
| This series' [SQL guide](../sql/00-overview.md) | The relational model Module 8's PDO work sits directly on top of |
| This series' [Rails guide](../rails/00-overview.md) | The genuine, unforced connection this guide's overview named — PDO as what ActiveRecord automates |

## One-page cheat sheet

| Idea | Where |
|---|---|
| `$` sigil, double- vs. single-quote interpolation | Module 1 |
| `declare(strict_types=1)` — per-file, function-call-only enforcement | Module 1 |
| The array: one type, both ordered list and string-keyed map | Module 1 |
| `<?php ?>`/`<?=`, HTML-embedded-code as PHP's actual origin | Module 2 |
| Alternate control syntax: `if (...): ... endif;`, built for templates | Module 2 |
| `$_GET`/`$_POST`, `??` for missing keys, `htmlspecialchars()` against XSS | Module 2 |
| `php -S host:port [router.php]` — one process, per-request state teardown | Module 4 |
| `getmypid()` proving the process persists even though script state doesn't | Module 4 |
| Constructor property promotion, `readonly` | Module 6 |
| `enum` — pure vs. backed, `::from()` throws, `::tryFrom()` returns `null` | Module 6 |
| `match` — strict `===`, no fallthrough, an expression, `UnhandledMatchError` | Module 6 |
| Union types (`int\|string`), nullsafe `?->` | Module 6 |
| `PDO`, `prepare()`/`execute()` — structure and data sent separately | Module 8 |
| SQL injection via raw interpolation — verified: leaks an entire table | Module 8 |
| `session_start()` before any output; `$_SESSION` persists via a cookie + file store | Module 9 |
| `password_hash()`/`password_verify()` — never compare hashes with `===` | Module 9 |
| `composer.json`, PSR-4 autoload mapping | Module 11 |
| PHPUnit: `assertSame()`, `expectException()` ordering | Module 11 |

## Verification technique used throughout this guide

```bash
php -S localhost:PORT [router.php] &
curl ...
kill %1
```

Every route, every request-lifecycle claim, and every security demonstration in this guide was checked against a real running server with real `curl` requests — including the two findings a plausible-sounding claim could easily have gotten wrong without checking: that `php -S`'s process genuinely doesn't restart between requests (`getmypid()`, confirmed identical across requests) even though script-level state resets anyway, and that both a database row and a session survive an actual, deliberate server restart (killed and relaunched mid-test, not assumed). The SQL injection demonstration in Module 8 was run against a real attack string, not described — `' OR '1'='1` genuinely returned the entire `users` table through the vulnerable function and genuinely returned zero rows through the prepared-statement version, in the same script, same run.

## Where to go now

PHP closes out this series' "dynamic web-era scripting" cluster, reading immediately after `rails/` rather than at the series' original end — repositioned specifically so its own two real prerequisites, `javascript/07-server.md`'s server model and `sql/`'s relational material, are still fresh rather than a dozen unrelated languages back. The habit this guide leaned on hardest was the same one every guide in this series has insisted on since Fortran's `v(::-1)` error prompted the whole project's verification methodology: a plausible-sounding claim about language semantics is not a verified one, and the request-lifecycle claim at this guide's core — proven with `getmypid()` and a resetting counter together, not asserted from PHP's general reputation — is exactly the kind of thing that reads as obvious right up until it's actually checked. From here, per this series' stated sequencing (`INDEX.md`): the **Python/PyTorch/Keras group, plus Docker**.
