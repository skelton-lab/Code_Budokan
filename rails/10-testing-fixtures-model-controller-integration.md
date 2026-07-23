# Module 10 — Testing Rails: Fixtures, Model, Controller, and Integration Tests

`ruby/07`'s testing module already established `minitest` as this series' verification framework of choice for Ruby. Rails ships `minitest` by default too — not a new framework to learn, the same one, with Rails-specific test base classes (`ActiveSupport::TestCase`, `ActionDispatch::IntegrationTest`) and a genuinely useful fixture system layered on top. Feeds Capstone 4.

## Fixtures: sample data, loaded before every test

**You'll be able to:** read a fixture YAML file, reference a fixture by name in a test, and explain when fixtures are loaded.

**Concept**

`test/fixtures/*.yml` defines sample records, loaded into the test database once before each test runs (inside a transaction, rolled back after — one test's changes never leak into the next). A scaffolded resource gets a fixture file generated automatically; it is *not* automatically kept in sync with later changes to the model.

**Example**

A scaffold-generated `test/fixtures/posts.yml`, verified directly to be broken the moment `Post` gained a required association:

```yaml
one:
  title: MyString
  body: MyText

two:
  title: MyString
  body: MyText
```

Running any test that loads this fixture, after `Post belongs_to :user` (required, Module 4) was added:

```
ActiveRecord::NotNullViolation: SQLite3::ConstraintException: NOT NULL constraint failed: posts.user_id
```

A genuine, real failure — not a bug in Rails, a direct consequence of the fixture never being updated after the model changed underneath it. The fix, real and necessary, not optional:

```yaml
one:
  title: First Post
  body: First body
  user: one

two:
  title: Second Post
  body: Second body
  user: two
```

`user: one` in a fixture references another fixture (`test/fixtures/users.yml`'s own `one:` entry) by name — Rails resolves the association and inserts the correct foreign key automatically.

> **Pitfall / gotcha:** fixtures are loaded via raw SQL `INSERT`, **not** through `ActiveRecord::Base.new(...).save` — meaning ActiveRecord validations (`presence`, `uniqueness`, custom `validate` methods) never run against fixture data at all. The duplicate `title: MyString` in both fixture records above would violate `Post`'s own `uniqueness: true` validation if created normally — but fixtures bypass validations entirely, so it doesn't. Real, enforced database constraints (`NOT NULL`, `FOREIGN KEY`, a unique *index*) still apply, because those are checked by SQLite itself regardless of how the `INSERT` arrived — exactly the same validations-vs-constraints distinction Modules 4–5 already established, now showing up as a genuine, verified consequence in the test suite specifically.

**Practice**

- Deliberately give both `posts.yml` fixtures the same title again, confirm the test suite still loads them without error (proving validations don't run on fixture load) — then add a unique *index* (Module 5's practice exercise) and confirm fixture loading *now* fails, because a real constraint, unlike a validation, can't be bypassed this way.
- Add a third fixture user and a third fixture post referencing it, and write a one-line test confirming it loads correctly.

## Model tests: `ActiveSupport::TestCase`

**You'll be able to:** write a real model test using `assert_difference`, and verify a validation failure with a specific error message.

**Concept**

Model tests inherit from `ActiveSupport::TestCase` and typically verify validations, associations, and any custom business logic — no HTTP request involved, just direct calls against the model.

**Example**

```ruby
class PostTest < ActiveSupport::TestCase
  test "requires a unique title" do
    duplicate = Post.new(title: posts(:one).title, body: "dup", user: users(:two))
    assert_not duplicate.valid?
    assert_includes duplicate.errors[:title], "has already been taken"
  end

  test "destroying a post destroys its comments" do
    post = Post.create!(title: "Temporary", body: "will be destroyed too", user: users(:one))
    comment = post.comments.create!(body: "will be destroyed")
    assert_difference "Comment.count", -1 do
      post.destroy
    end
    assert_not Comment.exists?(comment.id)
  end
end
```

```
4 runs, 11 assertions, 0 failures, 0 errors, 0 skips
```

Verified directly, all passing — the second test is Module 4's own cascading-delete claim, now a permanent, re-runnable check rather than a one-off `bin/rails runner` script.

> **Pitfall / gotcha:** the *first* version of the cascading-delete test above was written against `posts(:one)` directly (a fixture), and failed with a real, genuine surprise: `Comment.count didn't change by -1, but by -2` — because `test/fixtures/comments.yml` already attaches one comment to `posts(:one)` by default, on top of the one the test itself created. The fix was creating a fresh `Post` inside the test instead of reusing fixture data already carrying its own attached state — a real, easy mistake (forgetting what a shared fixture already contains), caught by running the test, not by reasoning about it in advance.

**Practice**

- Write a test confirming `Post.new(title: nil, body: "x", user: users(:one))` is invalid with the specific message `"Title can't be blank"`.
- Verify directly: does `assert_difference "Comment.count", -1 do ... end` fail with a clear, specific message if the actual change is `-2` instead? Read the real failure output.

## Controller/integration tests: real requests, real sessions

**You'll be able to:** write an integration test using `sign_in_as`, and verify an authorization rule with a real, simulated HTTP request.

**Concept**

`ActionDispatch::IntegrationTest` sends real, simulated HTTP requests through the full routing/controller/view stack — closer to `curl` than to a bare model test, but without needing an actual running server or the CSRF-token-extraction work Capstones 1 and 3 did by hand. The auth generator's own `sign_in_as(user)` helper (`test/test_helpers/session_test_helper.rb`) handles session setup directly.

**Example**

```ruby
class PostsControllerTest < ActionDispatch::IntegrationTest
  test "guests are redirected away from new" do
    get new_post_url
    assert_redirected_to new_session_url
  end

  test "a user cannot edit another user's post" do
    sign_in_as users(:two)
    patch post_url(posts(:one)), params: { post: { title: "Hijacked" } }
    assert_redirected_to posts_url
    assert_equal "First Post", posts(:one).reload.title
  end
end
```

```
5 runs, 9 assertions, 0 failures, 0 errors, 0 skips
```

Verified directly — this is Capstone 3's own two-user attack scenario, re-expressed as two lines instead of a `curl`-with-manual-cookie-jar script, and it passes cleanly. `sign_in_as` handles what Capstone 1 and 3 did by hand (extracting a CSRF token, managing a cookie jar) — Rails' own integration test helpers manage CSRF and session state automatically, which is *why* this is the idiomatic way to verify this, not raw `curl`.

> **Pitfall / gotcha:** the guide's own attempt to verify comment creation and deletion via raw `curl` (Capstone 2) hit a genuinely confusing wall — Rails 8's `per_form_csrf_tokens` scoping a token to its originating form's exact method, in a way that made a `POST`-with-`_method=delete` override request behave subtly differently from a literal `curl -X DELETE`. `ActionDispatch::IntegrationTest`'s own `delete post_comment_url(...)` call sidesteps this completely — it issues a genuine simulated `DELETE` and manages CSRF transparently, which is exactly why Rails ships integration tests as the idiomatic verification tool instead of expecting real projects to script raw HTTP requests by hand for this kind of test.

**Practice**

- Write an integration test confirming a signed-in user *can* comment on a post (`post post_comments_url(posts(:one)), params: { comment: { body: "..." } }`), and a second test confirming a guest cannot (`assert_redirected_to new_session_url`).
- Run `bin/rails test` for the whole suite (not just one file), and read the summary line — confirm every test file's tests ran, not just the last one you touched.

## Progress check

1. When are fixtures loaded relative to each individual test, and what happens to changes made during a test?
2. Do ActiveRecord validations run against fixture data, verified directly? What real constraint type *does* still apply to fixtures?
3. What real, genuine mistake did this guide's own first-draft cascading-delete test make, and how was it caught?
4. What does `ActionDispatch::IntegrationTest` provide that a bare model test doesn't?
5. What specific, real difficulty did raw `curl`-based verification hit in Capstone 2 that Rails' own integration test helpers avoid entirely?

**Answers**

1. Fixtures are loaded once before each individual test, inside a transaction that's rolled back afterward — one test's changes to fixture-derived data never leak into the next test.
2. No — verified directly: two fixture posts sharing an identical `title` load without error despite `Post`'s own `uniqueness: true` validation, because fixtures are inserted via raw SQL, bypassing ActiveRecord's validation layer entirely. Real database-level constraints (`NOT NULL`, `FOREIGN KEY`, a genuine unique index) still apply, because SQLite itself enforces those regardless of how the `INSERT` arrived.
3. It reused `posts(:one)` (a shared fixture) directly, not accounting for the fact that `test/fixtures/comments.yml` already attaches one comment to it by default — the test expected a `-1` change in `Comment.count` but got `-2`. Caught by actually running the test and reading its real failure message, not by reasoning about the fixture data in advance.
4. Real, simulated HTTP requests through the full routing/controller/view stack, plus session and CSRF handling via helpers like `sign_in_as` — verifying the same authorization rule a bare model test can't reach, since ownership checks live in the controller, not the model.
5. Rails 8's `per_form_csrf_tokens` scoping a token to its originating form's exact method, which made a raw `curl -X DELETE` (or a POST-with-`_method`-override) behave in a way that took real debugging to understand. `ActionDispatch::IntegrationTest`'s `delete post_comment_url(...)` issues a genuine simulated DELETE and manages CSRF and session state transparently, sidestepping the issue entirely.
