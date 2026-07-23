# Module 4 — Associations: `has_many`/`belongs_to` and Cascading Deletes

ActiveRecord associations are the ORM layer directly on top of `sql/`'s own foreign-key relationships — one line of Ruby (`has_many :comments`) generates real, working query methods on top of a real, database-enforced foreign key. This module verifies both halves: the Ruby-level convenience and the SQL-level guarantee underneath it. Feeds Capstone 2.

## `belongs_to`: required by default

**You'll be able to:** declare a `belongs_to` association, and state what happens, verified directly, if the referenced record doesn't exist.

**Concept**

`belongs_to :post` on a `Comment` model declares that every comment has exactly one associated post. In Rails 5 and later, `belongs_to` is **required by default** — a comment without a valid post fails validation, not just at the database level but at the ActiveRecord level, before any SQL is even sent.

**Example**

```ruby
class Comment < ApplicationRecord
  belongs_to :post
end
```

Verified directly:

```ruby
c = Comment.new(body: "orphan comment")
c.valid?                    # => false
c.errors.full_messages      # => ["Post must exist"]
```

No `post_id` at all, and `valid?` correctly reports `false` with a specific, real error message — before any database round-trip.

> **Pitfall / gotcha:** this default changed in Rails 5 (2016) — older Rails code, or tutorials written before that, may show `belongs_to` as *optional* by default, requiring explicit `belongs_to :post, optional: true` for records genuinely allowed to exist without their parent. Current Rails 8 requires the opposite: an association allowed to be absent needs `optional: true` stated explicitly.

**Practice**

- Add `belongs_to :post, optional: true` to a scratch copy of `Comment` and confirm the same orphan comment is now valid.
- Predict, then verify: does `Comment.new(body: "x", post: some_real_post).valid?` return `true` with the association satisfied correctly?

## `has_many` and real query methods

**You'll be able to:** declare a `has_many` association, and use the query methods it generates.

**Concept**

`has_many :comments` on `Post` generates a working `post.comments` collection — not a plain array, but a real, lazily-evaluated ActiveRecord relation, chainable with `.where`, `.count`, `.create!`, exactly like a top-level `Comment.all` query, scoped automatically to the owning post.

**Example**

```ruby
class Post < ApplicationRecord
  has_many :comments, dependent: :destroy
end
```

Verified directly:

```ruby
p1 = Post.create!(title: "A Real Post", body: "content", user: some_user)
p1.comments.create!(body: "first comment")
p1.comments.create!(body: "second comment")
p1.comments.count   # => 2
```

`p1.comments.create!` is itself notable — it doesn't just create a `Comment` and separately assign it to the post; it sets `post_id` correctly on the new record automatically, from the association alone.

> **Pitfall / gotcha:** `p1.comments.count` issues a real `SELECT COUNT(*)` query by default — it's not counting an already-loaded Ruby array. `p1.comments.to_a.count` (or a previously-loaded `p1.comments` accessed a second time) would count the loaded array instead, avoiding a second query — a real, meaningful performance distinction between the two, worth knowing precisely rather than treating `.count` and `.length` as interchangeable.

**Practice**

- Verify directly: does `post.comments.size` issue a `SELECT COUNT(*)` query, or does it use an already-loaded array if one exists? (Check the SQL log both before and after calling `post.comments.to_a`.)
- Add a `has_many :posts` line to `User`, matching `Post`'s own `belongs_to :user`, and verify `some_user.posts.count` reports correctly.

## `dependent: :destroy`: cascading deletes, verified

**You'll be able to:** state what `dependent: :destroy` does, and verify it directly rather than assume it from the option's name.

**Concept**

`has_many :comments, dependent: :destroy` means destroying a `Post` also destroys every one of its associated `Comment` records — a real, cascading delete, executed by ActiveRecord as separate `DELETE` statements, one per dependent record (not a single database-level `ON DELETE CASCADE`, a distinction worth being precise about).

**Example**

Verified directly:

```ruby
p1 = Post.create!(title: "A Real Post", body: "content", user: some_user)
c1 = p1.comments.create!(body: "first comment")
c2 = p1.comments.create!(body: "second comment")

p1.destroy

Comment.exists?(c1.id)   # => false
Comment.exists?(c2.id)   # => false
```

Both comments are genuinely gone — verified with an independent `Comment.exists?` check, not just "the post was destroyed without error."

> **Pitfall / gotcha:** `dependent: :destroy` runs *Ruby-level* callbacks for each destroyed comment (any `before_destroy`/`after_destroy` hooks on `Comment` genuinely fire), which is exactly why it's implemented as N separate `DELETE` statements rather than one `ON DELETE CASCADE` — the latter is faster but bypasses ActiveRecord entirely, callbacks included. `dependent: :delete_all` is the faster, callback-skipping alternative, the right tool the moment per-record callbacks genuinely don't matter for that association.

**Practice**

- Add a `before_destroy` callback to `Comment` that prints a message, destroy a post with two comments, and confirm the callback fires twice — once per comment, proving `dependent: :destroy` really does go through each record individually.
- Predict, then verify: does `dependent: :destroy` also work in the reverse direction — does destroying a `Comment` have any effect on its `Post`? (It shouldn't — state precisely why not, based on which model declared the association.)

## The database-level guarantee underneath

**You'll be able to:** verify a foreign key is enforced by SQLite itself, not just by ActiveRecord's own Ruby-level checks.

**Concept**

`t.references :post, null: false, foreign_key: true` in a migration does two real things: adds a `post_id` column, and adds a genuine, database-level `FOREIGN KEY` constraint — enforced by SQLite itself, independent of whether the insert came through ActiveRecord's own validations at all.

**Example**

`db/schema.rb`, verified directly after migrating:

```ruby
add_foreign_key "comments", "posts"
```

And the constraint holding even when ActiveRecord's own validation layer is bypassed entirely, via a raw SQL insert:

```ruby
ActiveRecord::Base.connection.execute(
  "INSERT INTO comments (post_id, body, created_at, updated_at) VALUES (99999, 'orphan', datetime('now'), datetime('now'))"
)
```

```
ActiveRecord::InvalidForeignKey: SQLite3::ConstraintException: FOREIGN KEY constraint failed
```

Verified directly — a `post_id` of `99999`, which doesn't exist, is rejected by SQLite itself, at the exact moment the raw SQL statement runs, with no `Comment` model validation involved at all in this specific test. This is `sql/09-transactions-constraints.md`'s own foreign-key material, confirmed from the opposite side: not "ActiveRecord stops you," but "the database itself stops you," a strictly stronger guarantee than any amount of application-level validation alone can provide.

> **Pitfall / gotcha:** `belongs_to`'s Rails-level "must exist" check (verified above) and the database's own `FOREIGN KEY` constraint are two *independent* layers, not one mechanism described twice — the first catches an invalid reference the moment `.valid?`/`.save` runs, with a friendly error message; the second catches it even if something (a raw SQL script, a database console, a bug in Rails itself) bypasses ActiveRecord's own validation layer entirely. Real production systems benefit from having both, not either.

**Practice**

- Verify directly: what real SQLite exception class does the raw-SQL foreign-key violation raise, and does `Comment.create(post_id: 99999, body: "x")` (going through ActiveRecord normally, not raw SQL) fail with the same exception, or with a validation error instead?
- State, in your own words, the precise difference between what `belongs_to :post` (Rails-level) and `foreign_key: true` (database-level) each independently guarantee.

## Progress check

1. Is `belongs_to` required or optional by default in current Rails? What real error message does an invalid one produce?
2. What kind of object does `post.comments` return — a plain Ruby array, or something else? What's the practical consequence?
3. Verified directly: does `dependent: :destroy` use a single database-level cascade, or N separate `DELETE` statements? Why does that distinction matter?
4. What real SQL-level guarantee does `foreign_key: true` add, verified directly with a raw SQL insert that bypassed ActiveRecord's own validations?
5. Name the two independent layers of protection a `has_many`/`belongs_to`/`foreign_key: true` combination provides, and state what each one alone would miss.

**Answers**

1. Required by default since Rails 5 — verified directly with `"Post must exist"` as the real error message on an orphan `Comment`.
2. A real, lazily-evaluated ActiveRecord relation — chainable, queryable (`.where`, `.count`), not a plain in-memory array; `.count` issues a real `SELECT COUNT(*)` unless the collection was already loaded.
3. N separate `DELETE` statements, one per dependent record — verified indirectly by the fact that per-record callbacks (`before_destroy`/`after_destroy`) genuinely fire for each one; a single `ON DELETE CASCADE` at the database level would bypass ActiveRecord and its callbacks entirely.
4. A real, database-enforced `FOREIGN KEY` constraint — verified directly: a raw SQL insert with an invalid `post_id`, bypassing ActiveRecord validation entirely, was still rejected by SQLite itself with `SQLite3::ConstraintException: FOREIGN KEY constraint failed`.
5. `belongs_to :post` (Rails-level) catches an invalid reference at `.valid?`/`.save` time, with a friendly error message, but only if the write goes through ActiveRecord. `foreign_key: true` (database-level) catches it regardless of how the write happens — raw SQL, another application, a bug — but with a much less friendly raw database exception. Relying on only the first misses raw-SQL or external writes; relying on only the second misses the friendly, catchable validation error a real application wants to show a user.
