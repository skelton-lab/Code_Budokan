# Capstone 2 — An Order Processor, and Three Languages' Three Real Answers

Proves Module 5: two distinct checked exceptions, a multi-catch clause handling both, and a genuine three-way comparison against `go/05-error-handling-explicit-returns.md` and Rust's own `Result<T, E>`.

## The build

```java
class InvalidQuantityException extends Exception {
    InvalidQuantityException(String msg) { super(msg); }
}
class OutOfStockException extends Exception {
    OutOfStockException(String msg) { super(msg); }
}

class Warehouse {
    private int stock;
    Warehouse(int stock) { this.stock = stock; }

    void fulfill(String item, int quantity) throws InvalidQuantityException, OutOfStockException {
        if (quantity <= 0) {
            throw new InvalidQuantityException("Quantity must be positive, got " + quantity);
        }
        if (quantity > stock) {
            throw new OutOfStockException(
                "Requested " + quantity + " of " + item + ", only " + stock + " in stock");
        }
        stock -= quantity;
        System.out.println("Fulfilled " + quantity + " of " + item + "; " + stock + " remaining");
    }
}

public class OrderProcessor {
    public static void main(String[] args) {
        Warehouse w = new Warehouse(10);
        int[] quantities = { 3, -1, 20 };
        for (int q : quantities) {
            try {
                w.fulfill("widget", q);
            } catch (InvalidQuantityException | OutOfStockException e) {
                System.out.println("Order failed (" + e.getClass().getSimpleName() + "): " + e.getMessage());
            }
        }
    }
}
```

`catch (InvalidQuantityException | OutOfStockException e)` — the multi-catch syntax — handles both distinct checked exception types in one clause, since this particular handler treats them identically. `fulfill()`'s own `throws InvalidQuantityException, OutOfStockException` declares both explicitly; a caller genuinely cannot omit handling either one.

## Verified

```
Fulfilled 3 of widget; 7 remaining
Order failed (InvalidQuantityException): Quantity must be positive, got -1
Order failed (OutOfStockException): Requested 20 of widget, only 7 in stock
```

The stock count is real and stateful across calls — the third order correctly reports "only 7 in stock" (10 minus the first successful order of 3), not the original 10, confirming the two failed orders never touched `stock` at all.

## Three languages, three real answers to "what if this fails"

| | Java (this guide) | Go (`go/05-error-handling-explicit-returns.md`) | Rust (`Result<T, E>`) |
|---|---|---|---|
| Failure representation | A thrown exception, unwinding the call stack | A second return value, `(result, error)` | A `Result<T, E>` enum wrapping either outcome |
| Can a caller silently ignore it? | Not for checked exceptions — `javac` refuses to compile | Yes — `result, _ := safeDivide(10, 0)` compiles and runs, discarding the error entirely | No — the compiler forces the `Result` to be unwrapped or explicitly propagated |
| Distinguishes "must handle" from "may ignore"? | Yes — checked vs. unchecked, a real, separate compiler-enforced category | No — every error is the same shape, ignoring is always syntactically available | No — every `Result` is the same shape, but *none* can be silently discarded the way Go's can |

Java's own real, distinctive position in this table: it's the only one of the three that makes handling *conditional on category* — a checked exception forces the issue, an unchecked one doesn't, a genuine design decision about which failures deserve mandatory attention. Go makes ignoring always possible; Rust makes ignoring never possible; Java splits the difference by declaration.

> **Pitfall:** this table names three real, different, current designs — it doesn't rank one as objectively correct. Go's own guide names its silent-discard result as a real, verified, honest cost, not a hidden flaw; Rust's total enforcement has its own cost (verbose propagation for genuinely low-stakes failures); Java's split has the cost this capstone's own Progress Check names directly below.

## Extend it yourself

- Add a third failure mode, `item` being `null` or empty — decide yourself whether it should be a checked exception (forcing every caller to handle it) or unchecked (an `IllegalArgumentException`), and justify the choice using this module's own "does every caller need to consciously decide" test.
- Rewrite `fulfill()`'s multi-catch handler as two separate `catch` blocks instead of one combined clause, giving each exception type a different message — confirm both styles compile and behave identically for this capstone's own inputs.

## Progress check

1. What does `catch (InvalidQuantityException | OutOfStockException e)` do, precisely, compared to writing two separate `catch` blocks?
2. In the three-language comparison, which of the three makes it *impossible* to compile code that ignores a failure entirely, and which makes it always *possible*?
3. What's the real, verified evidence in this capstone's own output that a failed order never mutated `stock`?

### Answers

1. It handles both exception types with one shared block of code, since `e` is typed as their common ground and both are handled identically here — functionally equivalent to two separate `catch` blocks with identical bodies, just without repeating the handling code twice.
2. Rust's `Result<T, E>` makes it impossible to compile code that silently discards a failure — the compiler forces it to be unwrapped or explicitly propagated. Go's `result, _ := safeDivide(...)` makes discarding always syntactically available, verified directly in `go/05-error-handling-explicit-returns.md` compiling and running with the error thrown away.
3. The third order (quantity `20`) reported "only 7 in stock" — 10 minus the *first* successful order of 3 — not the original 10 and not some other number reflecting the second, failed order of `-1`. If either failed order had mutated `stock`, that number would be wrong.
