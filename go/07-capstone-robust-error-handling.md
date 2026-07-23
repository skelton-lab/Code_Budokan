# Capstone 3 — Robust Error Handling

Combines every concept from Modules 5–6: a batch record processor using ordinary `error` values for expected validation failures, and `panic`/`recover` as a last-resort safety net for a genuinely unexpected bug — verified to isolate a single crashing record without taking down the rest of the batch.

## The processor

```go
func parseRecord(line string) (name string, age int, err error) {
    fields := strings.Split(line, ",")
    if len(fields) != 2 {
        return "", 0, errors.New("expected exactly 2 fields")
    }
    name = strings.TrimSpace(fields[0])
    ageVal, convErr := strconv.Atoi(strings.TrimSpace(fields[1]))
    if convErr != nil {
        return "", 0, fmt.Errorf("invalid age: %w", convErr)
    }
    if ageVal < 0 {
        return "", 0, errors.New("age cannot be negative")
    }
    return name, ageVal, nil
}

func processRecordSafely(line string) (result string) {
    defer func() {
        if r := recover(); r != nil {
            result = fmt.Sprintf("UNEXPECTED PANIC on %q: %v", line, r)
        }
    }()

    name, age, err := parseRecord(line)
    if err != nil {
        return fmt.Sprintf("VALIDATION ERROR on %q: %v", line, err)
    }

    if name == "CRASH" {
        var arr []int
        _ = arr[10] // simulates an unanticipated bug
    }

    return fmt.Sprintf("OK: %s is %d years old", name, age)
}
```

`parseRecord` handles the *expected* failure modes with ordinary `error` returns — the exact right tool per Module 5, for conditions a caller should routinely check (malformed input, an unparseable number, an invalid value). `processRecordSafely` wraps every call in a `defer`/`recover`, catching anything `parseRecord` and the rest of the function *didn't* anticipate — here, a deliberately triggered index-out-of-range panic standing in for a genuine, unforeseen bug.

## Verification

```go
records := []string{
    "Ada, 36",
    "Grace, 85",
    "Bad Record",
    "Eve, notanumber",
    "Fay, -5",
    "CRASH, 99",
    "Ivy, 28",
}
for _, r := range records {
    fmt.Println(processRecordSafely(r))
}
fmt.Println("Batch complete — all records attempted despite failures")
```

```
OK: Ada is 36 years old
OK: Grace is 85 years old
VALIDATION ERROR on "Bad Record": expected exactly 2 fields
VALIDATION ERROR on "Eve, notanumber": invalid age: strconv.Atoi: parsing "notanumber": invalid syntax
VALIDATION ERROR on "Fay, -5": age cannot be negative
UNEXPECTED PANIC on "CRASH, 99": runtime error: index out of range [10] with length 0
OK: Ivy is 28 years old
Batch complete — all records attempted despite failures
```

Verified directly against all seven records: two valid records process correctly; three genuinely invalid records (wrong field count, unparseable age, negative age) each produce the *specific*, correct validation error; the deliberately crash-triggering record is caught by `recover` rather than taking down the program; and — the actual point — `"Ivy, 28"`, the record *after* the crash, still processes correctly. The batch runs to completion, `"Batch complete"` prints, and every single record was attempted despite one of them genuinely panicking mid-processing.

> **The direct, honest comparison to `erlang/07-capstone-self-healing-supervisor.md`:** this capstone's `defer`/`recover` is a real, if much smaller-scale, echo of Erlang's supervisor pattern — both isolate one failing unit of work so it doesn't take down everything else. The real, structural difference: Erlang's supervisor is a genuinely separate *process*, recovering by spawning a *new* process entirely; Go's `recover` catches the panic *within the same function call*, at the exact point `defer` was registered, with no separate process or goroutine involved at all. Go's version is lighter-weight and simpler for this exact "isolate one item's failure" use case; Erlang's is the right tool when the failing unit has ongoing state or identity worth genuinely restarting, not just retrying.

> **Pitfall:** `processRecordSafely`'s `recover` catches *any* panic, not specifically the one this capstone deliberately triggers — a genuine, unrelated bug elsewhere in the function would be caught and reported identically, as `"UNEXPECTED PANIC"`, with no way to distinguish "the bug I anticipated might theoretically happen" from "a genuinely new bug I've never seen." This is a real, honest limitation of blanket `recover` usage, worth being aware of rather than treating `recover` as a universal safety net that makes all panics equally fine to ignore.

## Extending it yourself

- Add a fourth validation rule to `parseRecord` (say, rejecting an empty name) and confirm it produces its own specific validation error, distinct from the others.
- Modify `processRecordSafely`'s recovery handler to distinguish the specific `runtime error` type from a custom `panic("message")` you trigger separately, using a type assertion on the value `recover()` returns.
