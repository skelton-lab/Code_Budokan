# Capstone 1 — Ownership-Safe Contact Book

Combines Modules 1–4: a `ContactBook` that owns a collection of `Contact` structs, where every method's signature makes an explicit, verified statement about ownership — `add` takes a `Contact` by value (the book now owns it), `find_by_name` borrows and returns a borrowed reference (no ownership transferred, no copy made), and `remove_by_name` is genuinely fallible, returning `Result` rather than panicking or silently doing nothing.

## The contact book

```rust
#[derive(Debug)]
struct Contact {
    name: String,
    email: String,
    age: u32,
}

struct ContactBook {
    contacts: Vec<Contact>,
}

impl ContactBook {
    fn new() -> Self {
        ContactBook { contacts: Vec::new() }
    }

    // takes ownership of the Contact — the book now owns it
    fn add(&mut self, contact: Contact) {
        self.contacts.push(contact);
    }

    // borrows self and returns a borrowed reference — no ownership transferred
    fn find_by_name(&self, name: &str) -> Option<&Contact> {
        for c in &self.contacts {
            if c.name == name {
                return Some(c);
            }
        }
        None
    }

    // fallible removal: Result, not a panic or a silent no-op
    fn remove_by_name(&mut self, name: &str) -> Result<Contact, String> {
        match self.contacts.iter().position(|c| c.name == name) {
            Some(idx) => Ok(self.contacts.remove(idx)),
            None => Err(format!("no contact named '{}'", name)),
        }
    }

    fn list(&self) -> &[Contact] {
        &self.contacts
    }
}
```

Every method signature here is a real, checked promise, not documentation that could drift from the implementation: `fn add(&mut self, contact: Contact)` can only compile if it genuinely takes ownership of `contact` (Module 1); `fn find_by_name(&self, name: &str) -> Option<&Contact>` can only compile if it genuinely doesn't try to hand out ownership of a `Contact` still living inside `self.contacts` (Module 2); and the borrow checker enforces that `find_by_name`'s returned reference cannot outlive `book` itself.

## Verification

```rust
fn main() {
    let mut book = ContactBook::new();

    book.add(Contact { name: "Alice".to_string(), email: "alice@example.com".to_string(), age: 30 });
    book.add(Contact { name: "Bob".to_string(), email: "bob@example.com".to_string(), age: 25 });
    book.add(Contact { name: "Carol".to_string(), email: "carol@example.com".to_string(), age: 40 });

    println!("-- all contacts --");
    for c in book.list() {
        println!("{} <{}>, age {}", c.name, c.email, c.age);
    }

    println!("-- lookups --");
    match book.find_by_name("Bob") {
        Some(c) => println!("found: {:?}", c),
        None => println!("not found"),
    }
    match book.find_by_name("Dave") {
        Some(c) => println!("found: {:?}", c),
        None => println!("not found: Dave"),
    }

    println!("-- removal --");
    match book.remove_by_name("Alice") {
        Ok(c) => println!("removed: {}", c.name),
        Err(e) => println!("error: {}", e),
    }
    match book.remove_by_name("Zed") {
        Ok(c) => println!("removed: {}", c.name),
        Err(e) => println!("error: {}", e),
    }

    println!("-- remaining --");
    for c in book.list() {
        println!("{}", c.name);
    }
}
```

```
-- all contacts --
Alice <alice@example.com>, age 30
Bob <bob@example.com>, age 25
Carol <carol@example.com>, age 40
-- lookups --
found: Contact { name: "Bob", email: "bob@example.com", age: 25 }
not found: Dave
-- removal --
removed: Alice
error: no contact named 'Zed'
-- remaining --
Bob
Carol
```

Verified directly against `rustc`. Every path is exercised: a successful lookup, a failed lookup (`Dave`, correctly returning `None` rather than any kind of placeholder), a successful removal (`Alice`, genuinely removed — confirmed by the final listing), and a failed removal (`Zed`, returning `Err` rather than panicking or silently leaving the book unchanged with no signal at all).

> **The direct, honest comparison to `go/05-error-handling-explicit-returns.md`:** `remove_by_name`'s `Result<Contact, String>` return could, in Go, be written `(Contact, error)` — but a caller could then write `c, _ := book.RemoveByName("Zed")` and get a zero-valued `Contact{}` with no signal anything went wrong, exactly the silently-ignored-error finding Go's own guide verified directly. Rust's version has no zero-valued `Contact` to fall back to at all; getting a `Contact` out of `remove_by_name`'s `Result` requires actively handling the case where there isn't one.

## Extending it yourself

- Add a `fn update_email(&mut self, name: &str, new_email: String) -> Result<(), String>` method, and verify it returns a real `Err` for a name that doesn't exist.
- Add a `fn contacts_over_age(&self, min_age: u32) -> Vec<&Contact>` method returning borrowed references (not owned copies) to every contact older than `min_age` — confirm the original `book` is still fully usable after calling it.
