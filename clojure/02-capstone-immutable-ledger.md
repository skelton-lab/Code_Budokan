# Capstone 1 — An Immutable Ledger

Combines every concept from Module 1: a transaction ledger where applying a transaction never mutates the previous state — it produces a new one, with every prior snapshot remaining fully intact and independently inspectable. This is the concrete payoff of persistence: keeping a complete history is nearly free, not something you have to work to afford.

## The program

```clojure
(defn apply-transaction [balances [account amount]]
  (assoc balances account (+ (get balances account 0) amount)))

(defn build-history [initial transactions]
  (reduce
    (fn [history txn]
      (conj history (apply-transaction (peek history) txn)))
    [initial]
    transactions))
```

`apply-transaction` takes a balances map and a `[account amount]` pair, returning a *new* balances map — the old one is never touched. `build-history` folds over every transaction, `conj`-ing each resulting snapshot onto a growing vector of history — so `history` ends up holding *every* intermediate state, not just the final one, at essentially the storage cost of the final state alone (thanks to Module 1's structural sharing).

## Verification

```clojure
(def transactions
  [[:ada 100] [:grace 50] [:ada -30] [:grace 20] [:ada 200]])
(def history (build-history {} transactions))

(doseq [i (range (count history))]
  (println "After step" i ":" (get history i)))
```

```
After step 0 : {}
After step 1 : {:ada 100}
After step 2 : {:ada 100, :grace 50}
After step 3 : {:ada 70, :grace 50}
After step 4 : {:ada 70, :grace 70}
After step 5 : {:ada 270, :grace 70}
```

Checked by hand against every transaction: Ada's balance after step 1 is `100` (the deposit), unchanged through step 2 (Grace's own deposit), then `70` after step 3 (`100 - 30`), unchanged again through step 4, and `270` after the final `+200`. Every single number matches.

**The actual point of this capstone — old snapshots are genuinely untouched, not just logically implied to be:**

```clojure
(println "Step 0 (initial) still empty?" (= (get history 0) {}))
(println "Step 1 unaffected by later steps?" (= (get history 1) {:ada 100}))
```

```
Step 0 (initial) still empty? true
Step 1 unaffected by later steps? true
```

Verified directly: `history`'s very first entry — the empty starting balances — is still exactly `{}`, even after five more transactions were applied on top of it. `history`'s second entry still shows only Ada's initial deposit, completely unaffected by everything that happened afterward. Nothing in this program ever explicitly copied or snapshotted anything defensively — every entry in `history` is simply what `assoc` naturally produced at that point, and persistence guarantees none of them can have changed since.

**Measuring what this actually costs at scale:**

```clojure
(def many-txns (for [i (range 10000)] [(keyword (str "acct" (mod i 50))) i]))
(let [start (System/nanoTime)]
  (def big-history (build-history {} many-txns))
  (println "Building 10,000-snapshot history took:"
           (/ (- (System/nanoTime) start) 1000000.0) "ms"))
```

```
Building 10,000-snapshot history took: 11.922125 ms
```

Verified directly: keeping **10,001 complete historical snapshots** of a ledger (one per transaction, plus the initial state) — something that would mean 10,001 explicit, expensive deep copies in a language without structural sharing — took under 12 milliseconds total. This is Module 1's measured `assoc`-vs-copy gap paying off directly: a full audit trail isn't a feature you have to architect carefully around performance concerns; it's close to a side effect of using persistent collections at all.

> **Pitfall:** `peek` on a vector (used in `build-history` to get the *most recent* snapshot) is Module 1's "efficient end" lesson applied directly — `peek` on a vector looks at the end (cheap), the same side `conj` adds to; using `first` here (the cheap end for a *list*, not a vector) would silently fetch the wrong snapshot entirely.

## Extending it yourself

- Add a `balance-at` function taking a history and a step number, returning a specific account's balance at that point in time — a genuine, working "time travel" query over the ledger's full audit trail.
- Add a `total-at-step` function summing all account balances at a given step, and confirm the total is conserved correctly across every transaction that doesn't introduce or remove money (a deposit/withdrawal pair between two accounts, rather than an unbalanced adjustment).
