# Module 2 — Classes and RAII

Constructors and destructors — and the single idea that makes C++ resource management fundamentally different from C's: a destructor is *guaranteed* to run, even when an exception blows straight through the function that would have called `free`. Feeds Capstone 1.

## Constructors and destructors

**You'll be able to:** write a class that acquires something on construction and releases it on destruction, and know exactly when each runs.

**Concept**

A constructor runs automatically when an object is created; a destructor runs automatically when it goes out of scope — no manual "don't forget to call this" step, which is precisely the discipline C Module 4 had to maintain entirely by convention (`malloc`/`free`, always paired, always remembered). This pattern — acquire in the constructor, release in the destructor — is called **RAII** (Resource Acquisition Is Initialization), and it's arguably *the* defining C++ idiom.

> **Where `class` itself comes from, if you've read this series' ALGOL and Simula guides:** a C++ class is, historically, an ALGOL `begin...end` block that's been given its own independent lifetime — Simula's actual innovation (1967), which the ALGOL guide's Module 2 and the Simula guide's Module 2 trace in detail. RAII specifically — a scope guaranteeing its own cleanup — is what that persistence buys you once the block can outlive the call that created it. If you haven't read those guides, the short version: `{ }` scoping goes back to ALGOL 60; Simula was the first to let a block persist as an object; C++ inherited that persistence, and RAII is one of its direct consequences.

**Example**

```cpp
class Resource {
public:
    Resource(const char *name) : name_(name) {
        std::cout << "acquiring " << name_ << "\n";
    }
    ~Resource() {
        std::cout << "releasing " << name_ << "\n";
    }
private:
    const char *name_;
};

int main() {
    std::cout << "before block\n";
    {
        Resource r("first");
        std::cout << "using first\n";
    }   // destructor fires here, automatically
    std::cout << "after block\n";
}
```

Verified — the exact printed order:
```
before block
acquiring first
using first
releasing first
after block
```

The destructor fires the instant `r` goes out of scope, at the closing `}` — not at the end of `main`, not "eventually," exactly there, deterministically, every time.

> **Pitfall:** `: name_(name)` is a **member initializer list**, not the constructor body — it runs before the constructor's `{ }` block and is the correct way to initialize members, especially ones without a sensible default value. Assigning inside the body (`name_ = name;`) works for simple cases but is subtly different (the member gets default-constructed first, then reassigned) and doesn't work at all for members that have no default constructor.

**Practice**

- Add a second `Resource` inside the same block as the first, and confirm destructors fire in the *reverse* order of construction — "last acquired, first released," directly analogous to a stack.
- Write a class wrapping a raw `int*` from `malloc`, acquiring it in the constructor and calling `free` in the destructor — this is Capstone 1's entire shape, one step early.

## Exceptions and stack unwinding: why RAII actually matters

**You'll be able to:** explain, with a verified example, why destructors are what make C++ exception-safe in a way C's error-code discipline structurally can't be.

**Concept**

C has no exceptions — error handling means checking a return code after every call that might fail, and a `free`/cleanup step has to run on *every* exit path by hand, including every early-return-on-error branch. C++ exceptions (`throw`/`try`/`catch`) let you signal an error from deep inside a call stack and handle it far above, skipping everything in between — but that "skipping everything in between" is exactly where C's manual-cleanup discipline would fail catastrophically. RAII is the fix: as an exception propagates up and destroys each stack frame in its path, every local object's destructor still runs, in order, even though none of the code after the `throw` in that scope ever executes.

**Example**

```cpp
class Guard {
public:
    Guard(const char *name) : name_(name) { std::cout << "enter " << name_ << "\n"; }
    ~Guard() { std::cout << "exit " << name_ << "\n"; }
private:
    const char *name_;
};

void risky() {
    Guard g("risky-scope");
    std::cout << "about to throw\n";
    throw std::runtime_error("something went wrong");
    std::cout << "never printed\n";
}

int main() {
    try {
        risky();
    } catch (const std::exception &e) {
        std::cout << "caught: " << e.what() << "\n";
    }
    std::cout << "program continues\n";
}
```

Verified — the exact printed order:
```
enter risky-scope
about to throw
exit risky-scope
caught: something went wrong
program continues
```

Read that order carefully: `"never printed"` genuinely never printed — the `throw` jumps straight out of `risky()` — but `"exit risky-scope"` still printed, *before* the `catch` block even runs. `g`'s destructor fired automatically as the stack unwound through its scope, with no cleanup code written for that specific exit path. If `Guard` had been a raw C-style acquire/release pair instead of an RAII class, the release would simply never have happened on this path.

> **Pitfall:** a destructor that itself throws an exception during stack unwinding (while another exception is already in flight) is a serious, historically infamous problem — C++ calls `std::terminate` (aborting the whole program) rather than trying to sort out two simultaneous exceptions. The practical rule: destructors should not throw, ever, full stop.

**Practice**

- Add a second `Guard` before the `throw` and confirm both exit messages print, in reverse order, before `catch` runs.
- Write a function that throws a `std::runtime_error` conditionally and catches it in `main`, printing the exception's `.what()` message.

## Progress check

1. What does "RAII" stand for, and what's the one-sentence version of the pattern?
2. Why is a member initializer list (`: name_(name)`) generally preferred over assigning inside the constructor body?
3. In what order do multiple objects' destructors fire when a scope ends?
4. Why does the "exit risky-scope" line print *before* "caught: ..." in the exception example?
5. Why does C's manual `malloc`/`free`-on-every-exit-path discipline structurally break down in the presence of early returns or (in C++) exceptions?
6. What happens if a destructor throws while another exception is already propagating?

### Answers

1. Resource Acquisition Is Initialization — acquire a resource in a constructor, release it in the matching destructor, so the language's own scoping rules guarantee the release happens.
2. It initializes the member directly, in the right order, before the constructor body runs — assignment inside the body first default-constructs the member (which may not even be possible for some types) and then reassigns it, which is both less efficient and doesn't work universally.
3. Reverse order of construction — the last object constructed is the first one destroyed, mirroring how a stack unwinds.
4. Because `Guard g`'s destructor fires automatically as the stack unwinds through `risky()`'s scope, immediately when the exception passes through that scope — this happens *before* control ever reaches the `catch` block higher up.
5. Because every exit path (every early return, every point an exception could propagate through) needs its own manual cleanup call, and it's extremely easy to miss one — especially exception propagation, which by design jumps through code without executing it, skipping any manual `free` calls that would have been there.
6. The program calls `std::terminate` and aborts immediately, rather than attempting to reconcile two exceptions in flight at once — which is why the practical rule is that destructors must never throw.
