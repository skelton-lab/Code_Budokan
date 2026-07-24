# Module 11 — Composer & PHPUnit

Package management and real automated tests — closing this series' testing-discipline thread (`ruby/07`, `python/06`, `rust/13`, `rails/`'s own `minitest` module) for PHP. Mirrors `python/06-packaging-testing.md`'s combined shape directly: one module, packaging and testing together, because in practice they're set up together.

## `composer.json` and PSR-4 autoloading

**You'll be able to:** set up a `composer.json` with PSR-4 autoloading, so `require`-ing individual files by hand becomes unnecessary.

**Concept**

Composer is PHP's standard dependency manager — install it with `brew install composer`. PSR-4 autoloading maps a namespace prefix to a directory: declare `"TaskBoard\\": "src/"` once, and any class `TaskBoard\Task` is loaded automatically from `src/Task.php` the moment it's referenced, no manual `require` anywhere.

**Example**

```json
{
    "name": "code-rookie/task-board",
    "require-dev": {
        "phpunit/phpunit": "^11"
    },
    "autoload": {
        "psr-4": { "TaskBoard\\": "src/" }
    },
    "autoload-dev": {
        "psr-4": { "TaskBoard\\Tests\\": "tests/" }
    }
}
```

With Capstone 3's classes moved into `src/` (namespaced `TaskBoard`) and `composer require --dev phpunit/phpunit:^11` run, Composer generates `vendor/autoload.php` — one `require` at the top of any script gets every namespaced class in the project, resolved automatically.

> **Pitfall:** the namespace declared at the top of a file (`namespace TaskBoard;`) must match the PSR-4 mapping exactly, directory structure included — `TaskBoard\Sub\Task` autoloads from `src/Sub/Task.php`, not `src/Task.php`. A mismatch doesn't error at `composer install` time; it fails later, the first time something actually tries to use the class, with a "Class not found" error that doesn't obviously point back to the mapping.

**Practice**

- Move Capstone 3's `Priority`, `TaskStatus`, and `Task` into `src/`, each declaring `namespace TaskBoard;`, and confirm `composer require --dev phpunit/phpunit:^11` installs cleanly.
- Write a one-line script requiring only `vendor/autoload.php`, then instantiating `new TaskBoard\Task(...)` with no other `require` — confirm it works.

## Real tests with PHPUnit

**You'll be able to:** write and run PHPUnit tests against real class behavior, including a test that expects an exception.

**Concept**

A PHPUnit test is a class extending `PHPUnit\Framework\TestCase`, with each `public function test*()` method being one test. `assertSame()` checks strict (`===`) equality — the right choice for comparing enum cases, which are singleton instances. `expectException()` declares that the *next* line is expected to throw, turning "this should fail" into a real, checked assertion rather than an unhandled exception crashing the test run.

**Example**

```php
<?php
declare(strict_types=1);
namespace TaskBoard\Tests;

use PHPUnit\Framework\TestCase;
use TaskBoard\Task;
use TaskBoard\Priority;
use TaskBoard\TaskStatus;

final class TaskTest extends TestCase {
    public function testNewTaskStartsAsTodo(): void {
        $task = new Task(1, 'Write tests', Priority::High);
        $this->assertSame(TaskStatus::Todo, $task->status());
    }

    public function testAdvanceMovesThroughStates(): void {
        $task = new Task(1, 'Write tests', Priority::High);
        $task->advance();
        $this->assertSame(TaskStatus::InProgress, $task->status());
        $task->advance();
        $this->assertSame(TaskStatus::Done, $task->status());
    }

    public function testAdvancingADoneTaskThrows(): void {
        $task = new Task(1, 'Write tests', Priority::High);
        $task->advance();
        $task->advance();
        $this->expectException(\LogicException::class);
        $task->advance();
    }

    public function testReadonlyIdCannotBeReassigned(): void {
        $task = new Task(1, 'Write tests', Priority::High);
        $this->expectException(\Error::class);
        $task->id = 99;
    }
}
```

Run with `vendor/bin/phpunit tests/`:
```
PHPUnit 11.5.56 by Sebastian Bergmann and contributors.

Runtime:       PHP 8.5.8

....                                                                4 / 4 (100%)

Time: 00:00.002, Memory: 8.00 MB

OK (4 tests, 5 assertions)
```

Every path Capstone 3 demonstrated by hand with `try`/`catch` and manual `echo` statements — the state progression, the terminal-state exception, `readonly`'s own enforcement — is now a real, automated, re-runnable check.

**What a real failure looks like**, deliberately broken (asserting the wrong status right after construction):
```
1) TaskBoard\Tests\BrokenTest::testDeliberatelyWrong
Failed asserting that two variables reference the same object.
--- Expected
+++ Actual
@@ @@
-TaskBoard\TaskStatus Enum #378 (InProgress, 'in_progress')
+TaskBoard\TaskStatus Enum #377 (Todo, 'todo')

FAILURES!
Tests: 1, Assertions: 1, Failures: 1.
```

PHPUnit prints the actual object identity and enum case on both sides of a failed `assertSame` — genuinely useful for diagnosing *why* two enum instances didn't match, not just that they didn't.

> **Pitfall:** `expectException()` must be called *before* the line expected to throw, not after — `expectException` sets up the assertion for the *rest* of the test method's execution, so any code after the throwing line never runs once the exception is caught internally by PHPUnit. Order matters here in a way it doesn't for most other assertions.

**Practice**

- Add a test for `Priority`'s own `label()` method (from Module 6/Capstone 3) covering all three cases.
- Deliberately write one failing test, run it, and read the actual diff PHPUnit produces — confirm you can explain what it's telling you before fixing it.

## Progress check

1. What does PSR-4 autoloading eliminate the need for, compared to manual `require` statements?
2. Why does comparing two `TaskStatus` enum cases use `assertSame()` rather than `assertEquals()`?
3. Where must `expectException()` be called, relative to the line expected to throw — and why does that ordering matter?

### Answers

1. Manually `require`-ing every individual file a script depends on — PSR-4 autoloading resolves a class name to its file path automatically, from a single namespace-to-directory mapping declared once in `composer.json`.
2. `assertSame()` checks strict `===` identity, the correct comparison for enum cases (which are singleton instances of that case) — `assertEquals()`'s looser comparison would still likely pass here, but `assertSame()` is the precise, correct assertion for exactly what's being checked: are these the identical case.
3. Before the line expected to throw — `expectException()` configures PHPUnit to expect an exception during the *remainder* of the test method's execution, so any code written after the throwing line never executes anyway once the exception is caught internally; calling it after the throwing line would mean the exception already propagated (and failed the test) before the expectation was ever registered.
