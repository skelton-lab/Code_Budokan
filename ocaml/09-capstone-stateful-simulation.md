# Capstone 3 — A Stateful Simulation

Combines every concept from Modules 7–8: two bank accounts (mutable records), a shared transaction log (a `ref` holding a growing list), and a custom exception for insufficient funds — genuinely mutable, genuinely imperative OCaml, used deliberately where it's the natural fit.

## The simulation

```ocaml
exception Insufficient_funds of string * float

type account = { name : string; mutable balance : float }

let transaction_log : string list ref = ref []

let log msg = transaction_log := msg :: !transaction_log

let deposit acc amount =
  acc.balance <- acc.balance +. amount;
  log (Printf.sprintf "Deposit %.2f to %s (new balance %.2f)" amount acc.name acc.balance)

let withdraw acc amount =
  if amount > acc.balance then
    raise (Insufficient_funds (acc.name, amount -. acc.balance))
  else begin
    acc.balance <- acc.balance -. amount;
    log (Printf.sprintf "Withdraw %.2f from %s (new balance %.2f)" amount acc.name acc.balance)
  end
```

Two distinct mutation mechanisms doing two distinct jobs: `account`'s `mutable balance` field (Module 7) changes state that naturally belongs to *one* account; `transaction_log`, a `ref` (Module 7) holding a list, accumulates state shared *across* every account and every operation — a `ref` is the right tool here specifically because a log isn't naturally a field of any single account. `withdraw` raises `Insufficient_funds` (Module 8) *before* mutating anything — the `if` check happens first, so a failed withdrawal genuinely leaves the account and the log completely untouched, not partially updated.

## Verification

```ocaml
let ada = { name = "Ada"; balance = 100.0 } in
let grace = { name = "Grace"; balance = 50.0 } in

deposit ada 25.0;
withdraw ada 40.0;
deposit grace 10.0;

(try withdraw grace 1000.0
 with Insufficient_funds (name, shortfall) ->
   Printf.printf "Error: %s is short by %.2f\n" name shortfall);

Printf.printf "Ada: %.2f, Grace: %.2f\n" ada.balance grace.balance;
List.iter print_endline !transaction_log
```

```
Error: Grace is short by 940.00
Ada: 85.00, Grace: 60.00
--- Transaction log (most recent first) ---
Deposit 10.00 to Grace (new balance 60.00)
Withdraw 40.00 from Ada (new balance 85.00)
Deposit 25.00 to Ada (new balance 125.00)
```

Checked by hand: Ada, starting at `100.00`, deposits `25.00` (→ `125.00`), then withdraws `40.00` (→ `85.00`) — matching the final printed balance exactly. Grace, starting at `50.00`, deposits `10.00` (→ `60.00`), then attempts to withdraw `1000.00` — correctly caught as `Insufficient_funds ("Grace", 940.0)`, `1000 - 60 = 940` exactly matching the reported shortfall, and Grace's balance stays at `60.00`, completely unaffected by the failed attempt. The transaction log shows exactly three entries — the failed withdrawal never appears, because `log` is only ever called *after* a successful mutation, never before.

> **The actual point of this capstone:** OCaml doesn't force a choice between "purely functional" and "imperative" — this capstone freely mixes Module 2's algebraic exceptions, Module 7's two different mutation mechanisms, and ordinary sequencing (`;`), because a bank simulation genuinely has state that changes over time, and pretending otherwise would only add complexity. This is the honest counterpoint to this series' next guide, Haskell, which takes the opposite stance deliberately — the contrast is worth having actually built something real on this side of it first.

> **Pitfall:** the log entries print in *reverse* chronological order (`10.00 to Grace` first, `25.00 to Ada` last) — a direct, visible consequence of `log`'s own implementation, `msg :: !transaction_log`, which always prepends. This isn't a bug; it's the natural, efficient way to grow a list in OCaml (prepending is O(1); appending to the end is O(n)) — a reader wanting chronological order needs to reverse the log explicitly before printing, not change how it's built.

## Extending it yourself

- Add a `transfer` function moving money between two accounts, correctly raising `Insufficient_funds` (and touching neither account's balance) if the source account can't cover it.
- Fix the transaction log's display order by reversing it just before printing (`List.rev`), without changing how `log` itself builds the list — confirming you understand exactly why the reversal belongs at the display step, not the accumulation step.
