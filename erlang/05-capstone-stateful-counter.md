# Capstone 2 — A Stateful Counter Process

Combines every concept from Module 4: two independent bank account processes — the same domain OCaml (`ocaml/09-capstone-stateful-simulation.md`) and Haskell (`haskell/09-capstone-io-concrete.md`) both modeled — verified to hold genuinely separate, private state with zero shared memory between them.

## The account process

```erlang
account_loop(Balance) ->
    receive
        {deposit, Amount} ->
            account_loop(Balance + Amount);
        {withdraw, Amount, From} when Amount =< Balance ->
            From ! {ok, Balance - Amount},
            account_loop(Balance - Amount);
        {withdraw, _Amount, From} ->
            From ! {error, insufficient_funds, Balance},
            account_loop(Balance);
        {balance, From} ->
            From ! {balance, Balance},
            account_loop(Balance)
    end.

get_balance(Pid) ->
    Pid ! {balance, self()},
    receive {balance, B} -> B end.
```

`{withdraw, Amount, From}` appears **twice** — once guarded (`when Amount =< Balance`, the success case) and once unguarded beneath it (the failure case, using `_Amount` since that clause never needs the actual value). This is Module 2's ordering discipline applied directly: the guarded, more specific clause must come first, or it would never be reached.

## Verification

```erlang
Ada = spawn(capstone2, account_loop, [100]),
Grace = spawn(capstone2, account_loop, [50]),
Ada ! {deposit, 25},
Grace ! {deposit, 10},
Ada ! {withdraw, 40, self()},
...
Grace ! {withdraw, 1000, self()},
...
```

```
Ada withdrew 40, new balance: 85
Grace withdraw failed, balance: 60
Ada's final balance: 85
Grace's final balance: 60
```

Checked by hand: Ada, starting at `100`, deposits `25` (→ `125`), withdraws `40` (→ `85`) — matching the final balance exactly. Grace, starting at `50`, deposits `10` (→ `60`), then attempts to withdraw `1000` — correctly rejected (`1000 > 60`), balance unchanged at `60`.

> **The actual point of this capstone, verified concretely rather than assumed:** `Ada` and `Grace` are two entirely separate processes, each running its own copy of `account_loop`, each with its own private `Balance` in its own recursive call stack. There is no shared account-storage data structure anywhere in this program — not a map, not a database, not a mutable global of any kind. Grace's failed withdrawal has zero possible way to affect Ada's balance, not because of a lock or a guard preventing it, but because there is no path by which one process's state could ever touch the other's at all. This is a structurally different guarantee from OCaml's Capstone 3 (`ocaml/09-capstone-stateful-simulation.md`), which used `mutable` record fields — real, working mutation, but mutation that, in principle, any code with a reference to that record could touch; Erlang's processes make that kind of access impossible by construction, not merely disciplined against.

> **Pitfall:** every `withdraw` interaction is a genuine two-step conversation — send `{withdraw, Amount, self()}`, then `receive` the reply — not a single call-and-return the way a function call would be. Forgetting the `receive` half after sending a message that expects a reply leaves the caller's own mailbox holding an unread message indefinitely, a real, easy mistake in actor-model code that has no equivalent in ordinary function-call-based programming.

## Extending it yourself

- Add a `transfer` operation moving money from one account process to another — deciding for yourself whether it should be driven from outside (the caller sends `withdraw` to one, waits, then sends `deposit` to the other) or by having account processes message each other directly.
- Spawn ten independent accounts in a loop and confirm each maintains completely independent state, with no cross-contamination, by depositing a different, distinguishing amount into each and reading all ten balances back correctly.
