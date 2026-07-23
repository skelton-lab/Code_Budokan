# Capstone 2 — Protocols vs. Multimethods

Combines every concept from Modules 3–4 by using both mechanisms together on genuinely different halves of the same problem — a discount system where customer-type pricing is naturally single-dispatch (a protocol job) and combining two different discount *kinds* together is naturally multi-argument dispatch (a multimethod job, because no single "receiver" owns the combination logic).

## The protocol half: one customer type, one discount rate

```clojure
(defprotocol Discountable
  (discount-rate [this]))

(defrecord RegularCustomer [] Discountable (discount-rate [this] 0.0))
(defrecord PremiumCustomer [] Discountable (discount-rate [this] 0.10))
(defrecord VipCustomer []    Discountable (discount-rate [this] 0.25))

(defn price-for [customer base-price]
  (* base-price (- 1 (discount-rate customer))))
```

## The multimethod half: combining two discounts of possibly-different kinds

```clojure
(defmulti combine-discounts
  (fn [[kind1 _] [kind2 _]] [kind1 kind2]))

(defmethod combine-discounts [:percent :percent]
  [[_ p1] [_ p2]] [:percent (- 1 (* (- 1 p1) (- 1 p2)))])

(defmethod combine-discounts [:percent :fixed]
  [[_ p] [_ f]] [:mixed {:percent p :fixed f}])

(defmethod combine-discounts [:fixed :fixed]
  [[_ f1] [_ f2]] [:fixed (+ f1 f2)])
```

`combine-discounts` genuinely could not be a protocol method: there's no single discount that "owns" the combination — the correct behavior depends on *both* discounts' kinds together (two percentages compose multiplicatively; two fixed amounts add; a percentage and a fixed amount can't be reduced to one number at all without also knowing the base price, so that case is returned as a `:mixed` tuple instead).

## Verification

```clojure
(def customers [(->RegularCustomer) (->PremiumCustomer) (->VipCustomer)])
(doseq [c customers]
  (println (.getSimpleName (class c)) "pays" (price-for c 100.0) "for a $100 item"))
```

```
RegularCustomer pays 100.0 for a $100 item
PremiumCustomer pays 90.0 for a $100 item
VipCustomer pays 75.0 for a $100 item
```

Checked by hand: `100 · (1 - 0) = 100`, `100 · (1 - 0.10) = 90`, `100 · (1 - 0.25) = 75` — all correct, dispatched purely on each customer's runtime type via the protocol, no `cond`/`case` anywhere in `price-for`.

```clojure
(println "Two 10% discounts combined:" (combine-discounts [:percent 0.10] [:percent 0.10]))
(println "10% + $5 off combined:" (combine-discounts [:percent 0.10] [:fixed 5]))
(println "$5 + $3 off combined:" (combine-discounts [:fixed 5] [:fixed 3]))
```

```
Two 10% discounts combined: [:percent 0.18999999999999995]
10% + $5 off combined: [:mixed {:percent 0.1, :fixed 5}]
$5 + $3 off combined: [:fixed 8]
```

Checked by hand: two 10% discounts multiply as `1 - (0.9 × 0.9) = 1 - 0.81 = 0.19` — combined discount, roughly 19%, correctly computed and correctly dispatched to the `[:percent :percent]` method based on *both* arguments' kinds together. `[:fixed 5]` + `[:fixed 3]` correctly adds to `8`. The mixed case correctly falls through to the `[:percent :fixed]` method, returning both components untouched since combining them needs more context than this function alone has.

> **Pitfall, real and directly connected to this series' own numeric-precision thread:** `0.18999999999999995` instead of a clean `0.19` is the identical binary-floating-point imprecision this series verified directly in `cobol/02-arithmetic-picture-clauses.md` (`0.1 + 0.2` → `0.30000000000000004`) and `scheme/02-exact-numbers.md`. Clojure's `0.10` literal is an ordinary Java `double`, with the same IEEE 754 representation every mainstream language shares — this isn't a Clojure-specific bug, it's the fourth time in this series the identical class of error has shown up, verified directly rather than assumed to still hold.

## Extending it yourself

- Add a fourth customer type, `EmployeeCustomer`, with its own discount rate, and confirm `price-for` handles it with no changes to `price-for` itself.
- Add a `[:fixed :percent]` method (the mirror image of the existing `[:percent :fixed]` case) — decide whether it should produce the identical `:mixed` result regardless of argument order, and verify your answer.
