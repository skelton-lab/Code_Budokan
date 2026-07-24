# Capstone 3 — A Generic Repository

Proves Module 7 doing real work: one generic class, reused unchanged across two unrelated domain types, with the erasure finding confirmed again on the capstone's own objects rather than a toy `Box`.

## The build

```java
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

class Repository<T> {
    private final List<T> items = new ArrayList<>();

    void add(T item) { items.add(item); }

    Optional<T> findFirst(java.util.function.Predicate<T> matcher) {
        for (T item : items) {
            if (matcher.test(item)) return Optional.of(item);
        }
        return Optional.empty();
    }

    List<T> all() { return items; }

    int count() { return items.size(); }
}

class Product {
    String name; double price;
    Product(String name, double price) { this.name = name; this.price = price; }
    public String toString() { return name + " ($" + price + ")"; }
}

class Customer {
    String name; String email;
    Customer(String name, String email) { this.name = name; this.email = email; }
    public String toString() { return name + " <" + email + ">"; }
}

public class RepositoryTest {
    public static void main(String[] args) {
        Repository<Product> products = new Repository<>();
        products.add(new Product("Widget", 9.99));
        products.add(new Product("Gadget", 19.99));

        Repository<Customer> customers = new Repository<>();
        customers.add(new Customer("Ada", "ada@example.com"));

        System.out.println("Product count: " + products.count());
        System.out.println("Customer count: " + customers.count());

        var found = products.findFirst(p -> p.price > 10.0);
        System.out.println("Found: " + found.orElse(null));

        var notFound = customers.findFirst(c -> c.name.equals("Bob"));
        System.out.println("Not found present: " + notFound.isPresent());

        System.out.println("Same repository class at runtime: " + (products.getClass() == customers.getClass()));

        for (Product p : products.all()) {
            System.out.println("- " + p);
        }
    }
}
```

`Repository<T>` is written exactly once and reused, fully type-checked, across two domain types (`Product`, `Customer`) that share no relationship whatsoever — no common interface, no inheritance. `findFirst` takes a `Predicate<T>` (a functional interface — one abstract method, usable with a lambda), returning `Optional<T>` rather than `null` or a sentinel value for "not found," a genuinely safer pattern than Module 2's own `getOrDefault` for cases where there's no sensible default value to fall back to.

## Verified

```
Product count: 2
Customer count: 1
Found: Gadget ($19.99)
Not found present: false
Same repository class at runtime: true
- Widget ($9.99)
- Gadget ($19.99)
```

Every path checks out: the correct counts per repository, `findFirst` correctly locating the one product over `$10` and correctly reporting "not present" for a customer named `"Bob"` who was never added, and — Module 7's own marquee finding, confirmed again here rather than assumed to generalize — `products.getClass() == customers.getClass()` is `true`. Two `Repository` instances holding entirely unrelated domain types are, at runtime, instances of the identical class.

> **Pitfall:** `Repository<T>` provides zero compile-time guarantee that `T` supports anything beyond what `Object` itself guarantees (`toString()`, `equals()`, and so on) — `findFirst` only works here because the caller supplies its own `Predicate<T>` doing the actual comparison. A method that needed to, say, compare two `T` values for ordering would need a bounded type parameter (`<T extends Comparable<T>>`, Capstone practice from Module 7) — this capstone's own `Repository` deliberately doesn't need that bound, because it never compares two `T` values against each other internally.

## Extend it yourself

- Add a `remove(Predicate<T> matcher)` method deleting the first matching item, and verify it against both `Repository<Product>` and `Repository<Customer>` without any per-type code.
- Add a third domain type of your own choosing, and confirm `newRepository.getClass() == products.getClass()` continues to hold — three, not just two, distinct domain types sharing one identical runtime class.
