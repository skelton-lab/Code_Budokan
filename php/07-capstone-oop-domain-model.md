# Capstone 3 — A Task Board Domain Model

Proves Module 6 together as a real, working object graph — `readonly` identity fields, a backed enum driving state transitions, and `match` doing real work in two different places, not just toy examples.

## The build

```php
<?php
declare(strict_types=1);

enum Priority: int {
    case Low = 1;
    case Medium = 2;
    case High = 3;

    public function label(): string {
        return match($this) {
            Priority::Low => 'Low',
            Priority::Medium => 'Medium',
            Priority::High => 'High',
        };
    }
}

enum TaskStatus: string {
    case Todo = 'todo';
    case InProgress = 'in_progress';
    case Done = 'done';
}

final class Task {
    public function __construct(
        public readonly int $id,
        public readonly string $title,
        public readonly Priority $priority,
        private TaskStatus $status = TaskStatus::Todo,
    ) {}

    public function status(): TaskStatus {
        return $this->status;
    }

    public function advance(): void {
        $this->status = match($this->status) {
            TaskStatus::Todo => TaskStatus::InProgress,
            TaskStatus::InProgress => TaskStatus::Done,
            TaskStatus::Done => throw new LogicException("Task {$this->id} is already done"),
        };
    }
}

final class TaskBoard {
    /** @var Task[] */
    private array $tasks = [];

    public function add(Task $task): void {
        $this->tasks[] = $task;
    }

    /** @return Task[] */
    public function byPriority(?Priority $p = null): array {
        if ($p === null) return $this->tasks;
        return array_values(array_filter($this->tasks, fn(Task $t) => $t->priority === $p));
    }

    public function summary(): string {
        $counts = [];
        foreach ($this->tasks as $t) {
            $key = $t->status()->value;
            $counts[$key] = ($counts[$key] ?? 0) + 1;
        }
        return implode(', ', array_map(fn($k, $v) => "$k: $v", array_keys($counts), $counts));
    }
}
```

Note the two different jobs `match` does here: `Priority::label()` maps a case to display text (Module 6's basic use), while `Task::advance()` uses `match` to encode a real state machine — each status maps to the *next* status, with the terminal case (`Done`) deliberately mapping to a thrown exception rather than a silent no-op. `match`'s exhaustiveness (an unmatched case throws `UnhandledMatchError`) means adding a fourth `TaskStatus` case without updating `advance()` fails loudly, not silently.

## Verified

```php
$board = new TaskBoard();
$board->add(new Task(1, 'Write PHP guide', Priority::High));
$board->add(new Task(2, 'Review PR', Priority::Medium));
$board->add(new Task(3, 'Update deps', Priority::Low));

echo "All tasks: " . count($board->byPriority()) . "\n";
echo "High priority: " . count($board->byPriority(Priority::High)) . "\n";
echo "Summary before: " . $board->summary() . "\n";

$task1 = $board->byPriority(Priority::High)[0];
$task1->advance();
$task1->advance();
echo "Task 1 status: " . $task1->status()->value . "\n";
echo "Summary after: " . $board->summary() . "\n";

try {
    $task1->advance();
} catch (LogicException $e) {
    echo "Caught: " . $e->getMessage() . "\n";
}

try {
    $task1->id = 99;
} catch (Error $e) {
    echo "readonly caught: " . $e->getMessage() . "\n";
}
```
```
All tasks: 3
High priority: 1
Summary before: todo: 3
Task 1 status: done
Summary after: done: 1, todo: 2
Caught: Task 1 is already done
readonly caught: Cannot modify readonly property Task::$id
```

Both deliberate failure paths behave exactly as designed: advancing a `Done` task throws the domain-specific `LogicException` `advance()` itself raises, and reassigning `readonly $id` throws PHP's own `Error` — two different exception types for two genuinely different kinds of failure (a business-rule violation versus a language-level immutability violation), not conflated into one generic error.

> **Pitfall:** `private TaskStatus $status` combined with a public `status()` getter is a deliberate choice, not boilerplate — it means every status change has to go through `advance()`'s own `match`, which is the only place that can enforce the legal transition order. A public `$status` property would let any caller set `Done` directly from `Todo`, skipping `InProgress` and the exhaustiveness check entirely.

## Extend it yourself

- Add a `Priority::Critical = 4` case, and confirm `Priority::label()`'s `match` now throws `UnhandledMatchError` until you add the corresponding arm — the exhaustiveness working as intended, not a bug to work around.
- Add a `TaskBoard::overdue(): array` method returning tasks not yet `Done`, using the same `array_filter` pattern `byPriority()` already established.
