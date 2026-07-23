# Module 5 — Capstone 2: A Contact Book

**Proves:** records, enumerated types, subrange types, and an array of records together — plus a direct, verified reminder of Module 4's compile-time-vs-runtime subrange gap, now inside a record field specifically (Module 4).

A tiny contact book — three contacts, each with a name, age, and a meeting day restricted to weekdays only — combining every type-system tool Module 4 built. Every result below is a real, verified `fpc` compile-and-run.

## The program

```pascal
type
  Weekday = (Mon, Tue, Wed, Thu, Fri, Sat, Sun);
  WorkDay = Mon..Fri;

  Contact = record
    name: string;
    age: integer;
    meetingDay: WorkDay;
  end;

  ContactList = array[1..3] of Contact;

procedure PrintContact(c: Contact);
const
  DayNames: array[Mon..Sun] of string =
    ('Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday');
begin
  writeln(c.name, ' (', c.age, ') meets on ', DayNames[c.meetingDay]);
end;
```

`meetingDay: WorkDay` uses the subrange type directly as a record field's type — restricting it to weekdays is meant to be a genuine invariant of this data model, not just documentation. `DayNames` is a `const` array indexed by the *enumerated type itself* (`array[Mon..Sun] of string`), not by a separate integer — `DayNames[c.meetingDay]` reads naturally, with Pascal handling the enumerated-to-array-index mapping directly.

## Verified run

```pascal
var
  book: ContactList;
begin
  book[1].name := 'Ada'; book[1].age := 36; book[1].meetingDay := Wed;
  book[2].name := 'Alan'; book[2].age := 41; book[2].meetingDay := Mon;
  book[3].name := 'Grace'; book[3].age := 60; book[3].meetingDay := Fri;
  for i := 1 to 3 do
    PrintContact(book[i]);
end.
```

Verified output:

```
Ada (36) meets on Wednesday
Alan (41) meets on Monday
Grace (60) meets on Friday
```

Every field access (`book[i].name`, `book[i].meetingDay`) combines array indexing and record field access cleanly, and `DayNames[c.meetingDay]` correctly maps each `WorkDay` value to its full name via direct enumerated-type indexing.

## The subrange gap, verified again — this time in a record field

```pascal
var
  c: Contact;
  d: Weekday;
begin
  d := Sat;              { a full Weekday, not restricted to WorkDay }
  c.meetingDay := d;      { assigning it into a WorkDay-typed field }
  writeln('ord=', Ord(c.meetingDay));
end.
```

Verified, compiled **without** `-Cr`: `ord=5` — `Sat` (position `5` in `Weekday`) was assigned straight into `meetingDay` (typed as `WorkDay`, valid range `0..4`) with no error at all, exactly the same silent gap Module 4 found for a bare variable, now shown inside a record field specifically — the "day restricted to weekdays" invariant this capstone's schema was supposed to guarantee is not actually enforced by default.

Verified, compiled **with** `fpc -Cr`: `Runtime error 201` — the identical assignment now correctly rejected.

> **Pitfall:** a record's field types look like they should be exactly as strongly enforced as any other typed value in Pascal — and Module 4 already established precisely why that's not automatically true. This capstone's `meetingDay: WorkDay` field is a real, concrete instance of exactly the gap that module flagged in the abstract: a data model that *reads* as enforcing "meetings only happen on weekdays" needs `-Cr` (or equivalent) actually turned on for that to be true at runtime, not just at compile time for literal constants.

## Practice

- Rebuild this capstone with `-Cr` from the start and confirm every one of its legitimate operations (the three contacts as originally entered) still runs identically — `-Cr` should only change behavior the moment an actual out-of-range value is attempted.
- Add a fourth contact whose `meetingDay` is read from a `Weekday`-typed variable that could plausibly hold `Sat` or `Sun` (simulating, say, user input), and use an explicit `if` check before the assignment to reject invalid weekend values with a clear message — the *correct*, portable way to enforce this invariant, independent of whether `-Cr` happens to be enabled.
- Extend `ContactList` to `array[1..5]` and add two more contacts — confirm the `for` loop's upper bound needs updating too, and explain why nothing about `Contact` or `WorkDay`'s definitions needed to change at all.
