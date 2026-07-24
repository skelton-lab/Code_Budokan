# Module 5 — Checked vs. Unchecked Exceptions

Java's own real, distinctive answer to "what happens when a function fails" — a genuinely different mechanism from anything else in this series, verified against the compiler directly. Feeds Capstone 2.

## Checked exceptions: the compiler forces handling

**You'll be able to:** write a method that declares a checked exception, and explain the real, verified consequence of calling it without handling that exception.

**Concept**

Java splits its exception hierarchy into two enforcement categories. `Exception` and its subclasses (excluding `RuntimeException`) are **checked**: a method that can throw one must declare it with `throws`, and any caller must either catch it or declare it onward — enforced by `javac` itself, not a convention. `RuntimeException` and its subclasses are **unchecked**: no declaration, no forced handling, the compiler says nothing either way.

**Example — checked, unhandled, a real compile error:**
```java
import java.io.IOException;

public class CheckedTest {
    static void mightFail() throws IOException {
        throw new IOException("disk error");
    }
    public static void main(String[] args) {
        mightFail();
    }
}
```
```
$ javac CheckedTest.java
CheckedTest.java:8: error: unreported exception IOException; must be caught or declared to be thrown
        mightFail();
                 ^
1 error
```

**The identical shape, unchecked, compiles with zero complaint:**
```java
public class UncheckedTest {
    static void mightFail() {
        throw new IllegalArgumentException("bad arg");
    }
    public static void main(String[] args) {
        mightFail();
        System.out.println("compiles fine either way");
    }
}
```
```
$ javac UncheckedTest.java
$ java UncheckedTest
Exception in thread "main" java.lang.IllegalArgumentException: bad arg
	at UncheckedTest.mightFail(UncheckedTest.java:3)
	at UncheckedTest.main(UncheckedTest.java:6)
```

Same "a method can fail" shape, two genuinely different compiler behaviors — one refuses to compile until handled, the other compiles and only fails at runtime, exactly the way `IllegalArgumentException` (a real, standard `RuntimeException`) is designed to.

> **Pitfall:** which category a specific exception belongs to depends entirely on its own place in the class hierarchy (does it extend `RuntimeException`, directly or indirectly, or not), not on how severe or recoverable it actually is in practice. `NullPointerException` is unchecked despite being extremely common; `IOException` is checked despite file I/O failures being, in most real programs, at least as recoverable as a null check would be. This is a real design choice worth naming, not a natural law.

**Practice**

- Write your own method declaring `throws java.io.IOException`, calling it from `main` without a `try`/`catch`, and confirm the exact compile error above.
- Fix it by adding a `try`/`catch` around the call, then separately by adding `throws IOException` to `main` itself instead — confirm both are legal ways to satisfy the compiler, and explain the real difference between them (one handles it now, one defers the obligation to whoever calls `main`, which for `main` itself just means the JVM prints the uncaught exception and exits).

## Writing a custom checked exception

**You'll be able to:** define your own checked exception class and use it to enforce handling of a real, domain-specific failure.

**Concept**

Extending `Exception` (not `RuntimeException`) makes a custom exception checked — any method that can throw it must declare `throws YourException`, and the compiler enforces every caller handles it, exactly like `IOException`.

**Example**

```java
class InsufficientFundsException extends Exception {
    InsufficientFundsException(String msg) { super(msg); }
}

class Account {
    private double balance;
    Account(double balance) { this.balance = balance; }
    void withdraw(double amount) throws InsufficientFundsException {
        if (amount > balance) {
            throw new InsufficientFundsException(
                "Cannot withdraw " + amount + ", balance is " + balance);
        }
        balance -= amount;
    }
    double getBalance() { return balance; }
}

public class Main {
    public static void main(String[] args) {
        Account acc = new Account(100.0);
        try {
            acc.withdraw(50.0);
            System.out.println("Balance after withdraw: " + acc.getBalance());
            acc.withdraw(100.0);
        } catch (InsufficientFundsException e) {
            System.out.println("caught: " + e.getMessage());
        }
    }
}
```
```
Balance after withdraw: 50.0
caught: Cannot withdraw 100.0, balance is 50.0
```

The second `withdraw(100.0)` call — against a balance now at `50.0` — is caught exactly where the domain rule ("can't overdraw") is actually violated, with a message carrying real, specific context, not a generic runtime crash.

> **Pitfall:** every caller of `withdraw()`, forever, must now either catch `InsufficientFundsException` or declare it onward — this is the real tradeoff checked exceptions impose. It's genuinely useful for a failure every caller *should* consciously decide how to handle (a bank withdrawal failing is rarely something to silently ignore); it becomes real friction for a failure that's often fine to let propagate unhandled, which is exactly why not every exception in the standard library is checked.

**Practice**

- Add a second custom checked exception, `NegativeAmountException`, thrown from `withdraw()` when `amount < 0`, and confirm a caller now must handle *two* distinct checked exception types (either two `catch` clauses, or one `catch (Exception e)` catching both, discussed as a real, if blunt, option).
- Compare this guide's own approach against `go/05-error-handling-explicit-returns.md`'s `result, _ := safeDivide(10, 0)` (a caller can silently discard the error) and `rust/`'s `Result<T, E>` (the compiler forces the caller to unwrap or handle it, but doesn't distinguish "checked" from "unchecked" the way Java does) — three real languages, three different answers to the exact same problem, none of them a strict improvement on the others in every respect.

## Progress check

1. What determines whether an exception is checked or unchecked — its actual severity, or its place in the class hierarchy?
2. What real, verified compile error results from calling a method that declares `throws IOException` without catching or declaring it?
3. What's the real tradeoff a checked exception imposes on every caller, forever, that an unchecked one doesn't?

### Answers

1. Its place in the class hierarchy — specifically, whether it extends `RuntimeException` (unchecked) or not (checked, if it extends `Exception`). Severity or recoverability in practice has no bearing on which category an exception belongs to; `NullPointerException` (unchecked) and `IOException` (checked) prove this directly.
2. `error: unreported exception IOException; must be caught or declared to be thrown` — a real compile-time refusal, verified directly; the program produces no bytecode at all until the exception is either caught or the calling method itself declares `throws IOException`.
3. Every caller, at every level, must either catch it or declare it onward in their own `throws` clause — a real, permanent obligation propagating up the call chain, verified directly with `InsufficientFundsException` forcing `main` itself to handle it explicitly.
