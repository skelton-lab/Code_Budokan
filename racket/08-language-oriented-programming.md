# Module 8 — Language-Oriented Programming

By the end of this module you'll be able to explain what a `#lang` line actually does, and build the core pieces of a genuinely new language — not a library, not a macro, an actual different language hosted on Racket's platform. Feeds Capstone 4, this guide's flagship capstone.

## What a `#lang` line actually is

**You'll be able to:** explain what determines a Racket file's language, and what a minimal custom language needs to provide to be usable at all.

**Concept**

`#lang racket/base` isn't a comment or a version declaration — it names a module whose exports define the *entire vocabulary* available in that file, including core forms this guide has used without comment until now: `#%module-begin` (wraps the whole file's body), `#%app` (what a function-call-shaped expression like `(f x)` actually means), and `#%datum` (what a literal like `3` or `"hi"` actually means). A custom language is a module that provides its own versions of some or all of these — `#lang s-exp "path/to/language.rkt"` tells Racket to read the file's forms as ordinary S-expressions, but interpret them according to *that* module's exports, not `racket/base`'s.

**Example — the failure this module's own verification hit first, kept in as the actual lesson:**

A first attempt at a custom language provided only its own functions:

```racket
#lang racket/base
(provide (rename-out [stack-module-begin #%module-begin])
         push add sub mul print-top)
;; ... definitions of push, add, sub, mul, print-top ...
(define-syntax (stack-module-begin stx)
  (syntax-case stx ()
    ((_ form ...) #'(#%module-begin form ...))))
```

Using it:
```
#lang s-exp "stacklang/main.rkt"
(push 3)
```

```
program.rkt:2:0: ?: function application is not allowed;
 no #%app syntax transformer is bound
  at: (push 3)
```

**The actual error, and why it happens:** the new language provided `push` as an ordinary function, but never re-provided `#%app` — the form that tells Racket "a parenthesized expression like `(push 3)` means *call* `push` with argument `3`." Without it, the reader has no idea what `(push 3)` is even supposed to mean at all. Fixed by explicitly re-exporting the core forms the language actually needs:

```racket
(provide (rename-out [stack-module-begin #%module-begin])
         #%app #%datum #%top
         push add sub mul print-top)
```

> **Pitfall, this is the actual content of this module, not a side note:** a `#lang` isn't "Racket plus some extra functions" by default — it's a genuinely blank slate that happens to run on Racket's expander. Every core form ordinary Racket code takes for granted (function application, literals, top-level variable reference) has to be deliberately provided by name if the new language needs it, and *not* providing something is exactly how you build a language that's meaningfully more restricted than Racket itself, as Capstone 4 demonstrates directly.

**Practice**

- Predict, then verify, what happens if `#%datum` specifically is left out of a custom language's `provide` list, and a program written in that language uses a plain number literal like `42`.

## Progress check

1. What does `#%app` actually govern, and what happens without it?
2. What does `#lang s-exp "path"` tell Racket to do, concretely?
3. Why did the first draft of `stacklang` fail with "no #%app syntax transformer is bound"?
4. Is a custom `#lang` automatically "Racket plus extra functions," or does it start from nothing?
5. What's the practical consequence of *not* providing a core form like `#%app` or `#%datum` from a custom language?

### Answers

1. It governs what a parenthesized, function-call-shaped expression like `(f x)` actually means — without it, the reader/expander has no defined meaning for that shape at all, and any such expression fails immediately.
2. It tells Racket to read the file's body as ordinary S-expressions, but to interpret every form in it according to the named module's exports, rather than `racket/base`'s.
3. Because the language's module provided its own functions (`push`, `add`, etc.) but never re-exported `#%app` — so `(push 3)` had no defined meaning as a function application at all, since that meaning itself comes from `#%app`, not from `push` being defined.
4. It starts from nothing — every core form (application, literals, top-level references) must be deliberately provided by the language's own module if that language is meant to support it.
5. The resulting language genuinely cannot use that form at all — attempting to, produces an "unbound"/"no syntax transformer" error, which is exactly the mechanism that lets a custom language be meaningfully more restricted than ordinary Racket, on purpose.
