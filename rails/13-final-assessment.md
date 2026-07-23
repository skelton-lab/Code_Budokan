# Final Assessment

Across all ten modules and four capstones. Work through these before running anything — precision in your own reasoning is the actual test.

1. Name Rails' three MVC layers and state one responsibility for each.
2. What does `resources :posts` generate in one line, verified directly via `bin/rails routes`?
3. Verified directly: is `Post`'s `title`/`title=` accessor pair defined directly on the `Post` class itself? What module actually owns it?
4. What real, precise relationship does ActiveRecord's attribute-method generation have to `ruby/06-metaprogramming.md`'s own `define_method` example — identical mechanism, or the same underlying idea, evolved?
5. In Capstone 1, what two things were verified about Rails' CSRF protection, in both directions?
6. What real, database-level guarantee does `foreign_key: true` add, verified directly with a raw SQL insert that bypassed ActiveRecord's own validations entirely?
7. What's the real difference between what `belongs_to :post` (Rails-level) and `foreign_key: true` (database-level) each independently catch?
8. What real race-condition risk exists in relying on `uniqueness: true` alone, and what's the database-level fix?
9. What two features does Rails 8's native `bin/rails generate authentication` provide, and what one common feature does it deliberately not provide?
10. Verified directly against this guide's own `--minimal` toolchain: what specifically breaks in the generated password-reset flow, and why?
11. What silently happened to `CommentsController` the moment authentication was generated, despite zero lines of that file being changed?
12. What's the structural difference between `Post.new(user_id: some_id)` and `Current.user.posts.build(...)`, regarding accidentally creating a record owned by the wrong user?
13. In Capstone 3, how was Bob's attack deliberately isolated from Capstone 1's own CSRF finding, to prove `require_ownership` specifically was what blocked it?
14. Do ActiveRecord validations run against fixture data, verified directly? What real constraint type still applies regardless?
15. What real, genuine mistake did this guide's own first-draft cascading-delete test make, and how was it caught?
16. What specific, real difficulty did raw `curl`-based verification hit in Capstone 2 that Rails' own integration test helpers avoid entirely?

## Answers

1. Model (data and business rules), View (presentation), Controller (request handling and coordination) — a request flows controller → model → view, in that order.
2. All seven conventional RESTful routes (index, show, new, create, edit, update, destroy), each with a generated named path helper — verified directly.
3. No — verified directly, `Post.instance_methods(false)` is empty for a bare scaffolded model, yet `p.title`/`p.title=` both work. The real owner, verified via `p.method(:title).owner`, is `Post::GeneratedAttributeMethods`, an anonymous module Rails generates and includes into `Post`.
4. The same underlying idea, evolved — verified by reading the actual source: `ActiveModel::AttributeMethods#define_attribute_methods` uses `ActiveSupport::CodeGenerator`, a batched code-generation utility, not a bare `define_method` call in a loop, but the core technique (generate methods programmatically, at class-load time, from data only known at runtime) is identical to `ruby/06-metaprogramming.md`'s own `make_accessor` example.
5. That a real request with a genuine CSRF token succeeds and persists (`302`, the post genuinely appears on a subsequent `GET`), and that an identical request with no token at all is rejected (`422`) and, checked independently, never appears in the database.
6. A real, database-enforced `FOREIGN KEY` constraint — verified directly: a raw SQL insert with an invalid `post_id`, bypassing ActiveRecord validation entirely, was still rejected by SQLite itself with `SQLite3::ConstraintException: FOREIGN KEY constraint failed`.
7. `belongs_to :post` catches an invalid reference at `.valid?`/`.save` time, with a friendly, catchable error message, but only for writes going through ActiveRecord. `foreign_key: true` catches it regardless of how the write happens — raw SQL, another application, a bug — but with a much less friendly raw database exception.
8. `uniqueness: true` issues a `SELECT` then a separate `INSERT`/`UPDATE`, leaving a real window for two concurrent requests to both pass the check before either writes. The fix is a real, database-level unique index, verified directly to reject a raw SQL duplicate insert that bypassed the validation entirely.
9. Login (session-based, bcrypt-backed via `has_secure_password`) and password reset. Registration/signup is deliberately not provided — verified directly, no `RegistrationsController`, no signup route, anywhere in the generated output.
10. `PasswordsController` has no `create` action, and its auto-generated test references a `PasswordsMailer` class that was never created — because the password-reset flow assumes `ActionMailer` is available, and `--minimal` comments out `require "active_job/railtie"` and `require "action_mailer/railtie"` directly in `config/application.rb`.
11. It silently started requiring login for every action, including `create` and `destroy` on comments — verified directly via the server log (`Filter chain halted as :require_authentication rendered or redirected`), with zero lines of `CommentsController` itself ever touched, a direct consequence of `ApplicationController`'s own default (`before_action :require_authentication`, added the moment `include Authentication` exists).
12. `Post.new(user_id: some_id)` accepts whatever `user_id` value is passed, a real risk if that value ever comes from unchecked input. `Current.user.posts.build(...)` builds through the association itself, making the owning user structurally fixed to `Current.user`, with no `user_id` parameter to accidentally trust from the request at all.
13. Bob's attacking request used a CSRF token that was genuinely valid *for his own session*, pulled from a page (`/posts`, the public index) he legitimately has access to — specifically so a `302` redirect from `require_ownership` could be distinguished from a CSRF-layer rejection, proving the authorization check itself, not CSRF, was what blocked the attack.
14. No — verified directly: two fixture posts sharing an identical `title` load without error despite `Post`'s own `uniqueness: true` validation, because fixtures are inserted via raw SQL, bypassing ActiveRecord's validation layer entirely. A real database-level constraint (verified with a genuine unique index) does still apply, because SQLite itself enforces it regardless of how the `INSERT` arrived.
15. It reused a shared fixture (`posts(:one)`) directly, not accounting for the fact that `test/fixtures/comments.yml` already attaches one comment to it by default — the test expected a `Comment.count` change of `-1` but got `-2`. Caught by actually running the test and reading its real failure message, not by reasoning about the fixture data in advance.
16. Rails 8's `per_form_csrf_tokens` scoping a token to its originating form's exact method, which made a raw `curl -X DELETE` (or a POST-with-`_method`-override) behave in a way that took real debugging to understand. `ActionDispatch::IntegrationTest`'s own `delete post_comment_url(...)` issues a genuine simulated DELETE and manages CSRF and session state transparently, sidestepping the issue entirely.
