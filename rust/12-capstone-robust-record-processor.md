# Capstone 4 — A Robust Record Processor

Combines Modules 10–11: a batch record parser echoing `go/07-capstone-robust-error-handling.md` and this series' COBOL/SQL/Python record-processing thread — this time with `ParsedRecord`'s fields *borrowing* directly from the original input line rather than allocating owned copies, an explicit lifetime parameter making that borrowing relationship a checked, visible part of the type, `?` propagating parse failures concisely, and iterator chains doing the summary work.

## The parser

```rust
#[derive(Debug)]
struct ParsedRecord<'a> {
    name: &'a str,
    amount: f64,
}

fn parse_record(line: &str) -> Result<ParsedRecord<'_>, String> {
    let mut parts = line.splitn(2, ',');
    let name = parts.next().ok_or_else(|| format!("missing name in '{}'", line))?.trim();
    let amount_str = parts.next().ok_or_else(|| format!("missing amount in '{}'", line))?.trim();
    if name.is_empty() {
        return Err(format!("empty name in '{}'", line));
    }
    let amount: f64 = amount_str.parse().map_err(|_| format!("invalid amount '{}' in '{}'", amount_str, line))?;
    if amount < 0.0 {
        return Err(format!("negative amount {} in '{}'", amount, line));
    }
    Ok(ParsedRecord { name, amount })
}
```

`ParsedRecord<'a>`'s `name: &'a str` is not an owned `String` — it's a slice directly into whatever `line` was passed to `parse_record`, and the `<'a>` lifetime parameter is the checked, visible guarantee that a `ParsedRecord` can never outlive the line it was parsed from. `?` appears twice, propagating a missing-field failure immediately without a `match` at each step; the negative-amount and empty-name checks stay as explicit `if`/`return Err` because they're validation rules, not operations that can themselves fail structurally the way `.parse()` can.

## Verification

```rust
fn main() {
    let lines = vec![
        "coffee, 4.50",
        "rent, 1200.00",
        "bad line no comma",
        "book, notanumber",
        "refund, -20.00",
        "groceries, 85.30",
    ];

    let mut valid: Vec<ParsedRecord> = Vec::new();
    let mut errors: Vec<String> = Vec::new();

    for line in &lines {
        match parse_record(line) {
            Ok(record) => valid.push(record),
            Err(e) => errors.push(e),
        }
    }

    println!("-- valid records --");
    for r in &valid {
        println!("{}: {:.2}", r.name, r.amount);
    }

    println!("-- errors --");
    for e in &errors {
        println!("{}", e);
    }

    let total: f64 = valid.iter().map(|r| r.amount).sum();
    let big_purchases: Vec<&str> = valid.iter().filter(|r| r.amount > 100.0).map(|r| r.name).collect();

    println!("-- summary --");
    println!("total: {:.2}", total);
    println!("big purchases (>100): {:?}", big_purchases);
    println!("{} valid, {} errors, {} total lines", valid.len(), errors.len(), lines.len());
}
```

```
-- valid records --
coffee: 4.50
rent: 1200.00
groceries: 85.30
-- errors --
missing amount in 'bad line no comma'
invalid amount 'notanumber' in 'book, notanumber'
negative amount -20 in 'refund, -20.00'
-- summary --
total: 1289.80
big purchases (>100): ["rent"]
3 valid, 3 errors, 6 total lines
```

Verified directly against all six lines: three genuinely valid records parse correctly (`coffee`, `rent`, `groceries`), and three genuinely invalid ones each produce a specific, correct error (missing comma, unparseable amount, negative amount) rather than a generic failure or, worse, a silently-wrong value. The iterator chain's `.sum()` and `.filter()`/`.collect()` operate only on `valid`, and every `ParsedRecord`'s `name` field is still a borrowed `&str` pointing into `lines` at the end — `lines` itself was never consumed.

> **Real bug caught during this guide's own verification, kept in as teaching material:** the first draft of `parse_record`'s signature was `fn parse_record(line: &str) -> Result<ParsedRecord, String>` — no explicit lifetime on `ParsedRecord`'s use in the return type. It compiled, and ran correctly, but produced a real compiler warning: `hiding a lifetime that's elided elsewhere is confusing`, because `line`'s own lifetime is elided (implicit) while `ParsedRecord`'s generic lifetime parameter was left for the compiler to infer silently in a different spot — the same underlying relationship, referred to two inconsistent ways in one signature. The fix, applied directly from the compiler's own suggestion, was `Result<ParsedRecord<'_>, String>` — an explicit `'_` making the elided lifetime visible at the point it's actually used, rather than leaving it silently implied. A working, correctly-behaving program that still had something real worth fixing.

## Extending it yourself

- Add a fourth validation rule (say, rejecting an amount over some maximum) and confirm it produces its own specific error, distinct from the others.
- Change `ParsedRecord`'s `name` field to an owned `String` instead of `&'a str`, remove the lifetime parameter entirely, and compare: what does the struct definition and `parse_record`'s signature look like without lifetimes, and what's actually being given up (an allocation per record) to get there?
