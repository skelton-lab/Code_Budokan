# Module 5 — Validations: Presence, Uniqueness, and Custom Rules

`validates` is ActiveModel's declarative validation layer — a real, checked contract on a model's own data, enforced before any database write, with specific, real error messages. Feeds Capstone 2.

## Presence and uniqueness

**You'll be able to:** declare `presence` and `uniqueness` validations, and read the specific error messages each produces.

**Concept**

`validates :title, presence: true` rejects a blank or `nil` title. `validates :title, uniqueness: true` issues a real query checking whether another record already has the same value, rejecting the save if so. Both run when `.valid?` or `.save` is called — before any `INSERT`/`UPDATE` reaches the database.

**Example**

```ruby
class Post < ApplicationRecord
  validates :title, presence: true, uniqueness: true
end
```

Verified directly:

```ruby
p1 = Post.new(title: nil, body: "x", user: some_user)
p1.valid?                    # => false
p1.errors.full_messages      # => ["Title can't be blank"]

Post.create!(title: "Unique Title", body: "body", user: some_user)
p3 = Post.new(title: "Unique Title", body: "other", user: some_user)
p3.valid?                    # => false
p3.errors.full_messages      # => ["Title has already been taken"]
```

Both real, specific messages — not a generic "validation failed."

> **Pitfall / gotcha:** `uniqueness: true` issues a `SELECT` query to check for an existing match, then a separate `INSERT`/`UPDATE` — this has a genuine, real race condition window between the two under real concurrent load (two requests could both pass the `SELECT` check before either `INSERT`s). The database-level fix is a real unique index (`add_index :posts, :title, unique: true`), the same "the database is the actual source of truth" lesson Module 4 established for foreign keys — `uniqueness: true` alone is a friendly, fast, *first* line of defense, not a substitute for the constraint.

**Practice**

- Add `add_index :posts, :title, unique: true` via a migration, and verify directly that a raw SQL insert bypassing ActiveRecord's own `uniqueness: true` check is *still* rejected by the database.
- Predict, then verify: does `validates :title, uniqueness: true` treat `"Hello"` and `"hello"` as the same value or different values, by default? Check `uniqueness: { case_sensitive: false }`'s effect on the answer.

## Custom validations

**You'll be able to:** write a custom validation method using `validate` (not `validates`), for a rule no built-in validator expresses directly.

**Concept**

`validates` covers common, named rules (`presence`, `uniqueness`, `length`, `format`, `numericality`, and others). `validate :method_name` (singular, no `s`) runs an arbitrary instance method instead, for a rule specific enough that no built-in validator fits — the method calls `errors.add(:attribute, "message")` directly when the custom check fails.

**Example**

```ruby
class Post < ApplicationRecord
  validate :title_must_not_shout

  private

  def title_must_not_shout
    if title.present? && title == title.upcase && title.length > 3
      errors.add(:title, "cannot be all uppercase")
    end
  end
end
```

Verified directly:

```ruby
p = Post.new(title: "HELLO WORLD", body: "x", user: some_user)
p.valid?                  # => false
p.errors.full_messages    # => ["Title cannot be all uppercase"]

p2 = Post.new(title: "Hello World", body: "x", user: some_user)
p2.valid?                 # => true (this specific check passes)
```

> **Pitfall / gotcha:** a custom `validate` method runs on every `.valid?`/`.save` call, same as any built-in validator — but unlike `validates :attr, presence: true`, there's no automatic short-circuiting if the attribute is `nil`. The example above explicitly checks `title.present?` first specifically to avoid calling `.upcase` on `nil` and raising a `NoMethodError` instead of producing a clean validation failure — a real, easy-to-miss detail the first time you write a custom validator.

**Practice**

- Write a custom validation ensuring a `Post`'s `body` is at least as long as its `title` (a deliberately arbitrary rule, to practice the mechanism, not because it's a good rule) — verify it rejects a genuine violation and accepts a genuine pass.
- Verified directly: does a custom `validate` method run *before* or *after* built-in `validates` declarations on the same model, by default? Add a `puts` to both and check the order.

## Progress check

1. What real error message does `validates :title, presence: true` produce for a blank title, verified directly?
2. What's the real race-condition risk in relying on `uniqueness: true` alone, and what's the database-level fix?
3. What's the syntactic difference between `validates` and `validate`, and when is the singular form the right tool?
4. In a custom `validate` method, how does a failing check actually get reported to `.errors`?
5. Does a built-in `validates` declaration automatically guard against calling a method on `nil` inside a custom `validate` method on the same model? What has to be checked explicitly?

**Answers**

1. `"Title can't be blank"` — verified directly.
2. `uniqueness: true` issues a `SELECT` then a separate `INSERT`/`UPDATE`, leaving a real window for two concurrent requests to both pass the check before either writes — the fix is a real, database-level unique index, which rejects the second write regardless of what any prior `SELECT` reported.
3. `validates` (plural) declares one or more built-in, named validators (`presence`, `uniqueness`, etc.) in a single call. `validate` (singular) runs an arbitrary instance method instead — the right tool the moment a rule doesn't match any built-in validator's shape.
4. By calling `errors.add(:attribute, "message")` directly inside the method — there's no return-value convention; the method's job is to inspect the record's own state and add errors as needed.
5. No — each validation runs independently; a custom `validate` method must guard against `nil` itself (e.g., `title.present? && ...`) rather than assuming an earlier `presence: true` declaration already ran and guaranteed a non-nil value by the time this method executes.
