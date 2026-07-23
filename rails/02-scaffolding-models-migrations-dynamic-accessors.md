# Module 2 — Scaffolding a Resource: Models, Migrations, and ActiveRecord's Dynamic Accessors

`bin/rails generate scaffold` produces a complete, working resource — model, migration, controller, views, routes, tests — in one command. This module doesn't stop at "it works": it opens the generated model directly and verifies, precisely, the mechanism `ruby/06-metaprogramming.md` promised this guide would deliver on. Feeds Capstone 1.

## Scaffolding: one command, a full resource

**You'll be able to:** run `bin/rails generate scaffold`, and name every file type it produces.

**Concept**

`bin/rails generate scaffold Post title:string body:text` generates a migration, a model, a controller with all seven RESTful actions implemented, a full set of ERB views, a route entry, and test stubs — a genuinely complete, if generic, CRUD resource, matching the seven routes Module 1 introduced.

**Example**

Verified directly, running the generator:

```
      invoke  active_record
      create    db/migrate/20260721131550_create_posts.rb
      create    app/models/post.rb
      invoke    test_unit
      create      test/models/post_test.rb
      create      test/fixtures/posts.yml
      invoke  resource_route
       route    resources :posts
      invoke  scaffold_controller
      create    app/controllers/posts_controller.rb
      invoke    erb
      create      app/views/posts/index.html.erb
      create      app/views/posts/edit.html.erb
      create      app/views/posts/show.html.erb
      create      app/views/posts/new.html.erb
      create      app/views/posts/_form.html.erb
      create      app/views/posts/_post.html.erb
```

Every file this session and Module 1 already named — model, migration, controller, views, route, tests — created in a single command.

> **Pitfall / gotcha:** scaffolding is a real, useful starting point, not a finished feature — the generated controller has no authorization, no ownership scoping, and its views are plain, unstyled ERB. Capstone 3 adds exactly the authorization layer scaffolding doesn't provide, and the scaffold-generated code is the *starting point* for that module, not something to be thrown away and rewritten.

**Practice**

- Run `bin/rails generate scaffold Category name:string` and list every file it creates, without running it first — then verify your list against the real output.
- Read the generated `app/controllers/posts_controller.rb` in full and identify which of its seven actions render a view versus which redirect.

## Migrations: schema as code, applied in order

**You'll be able to:** read a generated migration, run `bin/rails db:migrate`, and explain what `db/schema.rb` is for.

**Concept**

A migration is a versioned, ordered Ruby description of one schema change. `bin/rails db:migrate` applies every migration not yet run, in timestamp order, and updates `db/schema.rb` — a single, current snapshot of the entire schema, checked into version control alongside the migrations that produced it.

**Example**

```ruby
class CreatePosts < ActiveRecord::Migration[8.1]
  def change
    create_table :posts do |t|
      t.string :title
      t.text :body

      t.timestamps
    end
  end
end
```

```
== 20260721131550 CreatePosts: migrating ======================================
-- create_table(:posts)
   -> 0.0010s
== 20260721131550 CreatePosts: migrated (0.0010s) =============================
```

Verified directly. `t.timestamps` is itself a convention: two columns, `created_at` and `updated_at`, populated automatically by ActiveRecord on every save — no application code ever sets them directly.

> **Pitfall / gotcha:** a migration's `change` method is *reversible* automatically for simple, well-known operations (`create_table`, `add_column`) — `bin/rails db:rollback` can undo it without a separately-written `down` method. This convenience has a real limit: an irreversible operation (like a raw data transformation) requires explicit `up`/`down` methods instead of `change`, because Rails genuinely cannot infer how to undo it.

**Practice**

- Run `bin/rails db:rollback`, confirm the `posts` table is genuinely gone (check `db/schema.rb` or query it directly), then `bin/rails db:migrate` again to restore it.
- Add a `published:boolean` column to `Post` via a new migration (`bin/rails generate migration AddPublishedToPosts published:boolean`), and verify the new column appears in `db/schema.rb` after migrating.

## The verified claim: dynamically generated accessors

**You'll be able to:** state precisely what `ruby/06-metaprogramming.md` promised, and verify it directly rather than take it on faith.

**Concept**

A scaffolded model — `class Post < ApplicationRecord; end`, genuinely zero lines of your own code — has a fully working `title`/`title=` accessor pair the moment a `title` column exists in the database. This isn't hand-written, and it isn't hard-coded into `ActiveRecord::Base` either: it's generated, per-model, from each model's own actual database columns, discovered at class-load time.

**Example**

Verified directly, inspecting a real `Post` instance:

```ruby
p = Post.new
Post.instance_methods(false)   # => [] — nothing defined directly on Post itself
p.title = "Hello"
p.title                        # => "Hello" — works anyway
p.method(:title).owner         # => Post::GeneratedAttributeMethods
p.method(:title).source_location
# => [".../activemodel-8.1.3/lib/active_model/attribute_methods.rb", 273]
```

`Post.instance_methods(false)` — methods defined directly on `Post`, excluding inherited ones — is empty. Yet `p.title` works. The method's real owner is `Post::GeneratedAttributeMethods`, an anonymous module Rails generates and includes into `Post` specifically, and its source location points into `ActiveModel::AttributeMethods#define_attribute_methods`.

That method, read directly from the installed gem, doesn't call plain `define_method` — it calls `ActiveSupport::CodeGenerator.batch(generated_attribute_methods, __FILE__, __LINE__) { ... define_attribute_method(attr_name, ...) ... }`. This is an evolved, batched form of the same core idea `ruby/06-metaprogramming.md`'s own `make_accessor` example demonstrated by hand with `define_method` — generate methods programmatically, at class-load time, based on data only known at runtime (here, the database's own column list) — not literally the same method call, but precisely the same underlying technique, confirmed by tracing the real source rather than assumed from the resemblance.

> **The direct, honest comparison to `ruby/06-metaprogramming.md`:** that guide's own `make_accessor(attr_name)` used `define_method(attr_name) { instance_variable_get(...) }` in a loop over a hard-coded attribute list, built specifically to foreshadow this exact moment. ActiveRecord's version is a genuine evolution — batched for performance, driven by database introspection instead of a hard-coded list — but it is the same idea, not a coincidental resemblance: code that writes code, because the actual attribute list isn't known until the database is inspected at load time.

**Practice**

- Add a `published:boolean` column to `Post` (if not already done in the migrations exercise above), migrate, and verify directly that `Post.new.respond_to?(:published?)` — a boolean-typed column gets a generated `?`-suffixed predicate method too, not just a plain accessor.
- Verify directly: does `Post.instance_methods(false)` include `title` immediately after the class is defined, or only after the *first* time a `Post` method is called (forcing the attribute methods to actually generate)? Check `Post.instance_methods(false)` before and after calling `Post.new`.

## Progress check

1. What files does `bin/rails generate scaffold Post title:string body:text` produce, in total?
2. What does `bin/rails db:migrate` do, and what file does it keep updated as a current schema snapshot?
3. Verified directly: is `Post`'s `title`/`title=` accessor pair defined directly on the `Post` class itself?
4. What module actually owns the generated `title` method, verified directly via `p.method(:title).owner`?
5. What's the precise, honest relationship between ActiveRecord's attribute-method generation and `ruby/06-metaprogramming.md`'s `define_method` example — identical mechanism, or the same underlying idea in an evolved form?

**Answers**

1. A migration, a model, a controller (all seven RESTful actions), a full set of ERB views, a route entry, and test stubs (a model test file and a fixture file) — verified directly against real generator output.
2. It applies every not-yet-run migration in timestamp order, and keeps `db/schema.rb` updated as a single current snapshot of the entire schema.
3. No — verified directly: `Post.instance_methods(false)` is empty, yet `p.title`/`p.title=` both work.
4. `Post::GeneratedAttributeMethods` — an anonymous module Rails generates and includes into `Post`, not `Post` itself and not a method hard-coded into `ActiveRecord::Base`.
5. The same underlying idea in an evolved form — verified by reading the actual source: `ActiveModel::AttributeMethods#define_attribute_methods` uses `ActiveSupport::CodeGenerator`, a batched code-generation utility, not a bare `define_method` call in a loop — but the core technique (generate methods programmatically, at class-load time, from data only known at runtime) is identical to `ruby/06-metaprogramming.md`'s own `make_accessor` example.
