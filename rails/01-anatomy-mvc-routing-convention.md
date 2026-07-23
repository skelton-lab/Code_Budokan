# Module 1 — Rails' Anatomy: MVC, Routing, Convention over Configuration

A fresh Rails app is not a blank slate — it's a real, opinionated directory structure and a request-handling pipeline, both fully in place before a single line of your own code exists. This module tours that structure directly, on a real generated app, before anything gets added to it. Feeds Capstone 1.

## MVC: three layers, one request

**You'll be able to:** name Rails' three core layers and state which one owns which responsibility.

**Concept**

Model-View-Controller splits a web application into three concerns: the **model** owns data and business rules (ActiveRecord classes, talking to the database); the **controller** owns request handling (receiving a request, coordinating the model, choosing what to render); the **view** owns presentation (turning data into HTML). A request flows through the router, into a controller action, which loads data via a model and renders a view — always in that order, never a view directly querying a model, never a model rendering HTML.

**Example**

A fresh `rails new blog --minimal` produces this directory structure, verified directly (`find app -type f`):

```
app/assets/images/.keep
app/assets/stylesheets/application.css
app/controllers/application_controller.rb
app/controllers/concerns/.keep
app/helpers/application_helper.rb
app/models/application_record.rb
app/models/concerns/.keep
app/views/layouts/application.html.erb
```

`app/models/`, `app/views/`, `app/controllers/` — the three MVC layers, present as real directories before any resource exists. `ApplicationRecord` and `ApplicationController` are the base classes every model and controller you write will inherit from.

> **Pitfall / gotcha:** Rails' own directory structure is the convention, not a suggestion enforced by a config file somewhere — a controller in the wrong directory, or named without the `Controller` suffix, simply won't be found by the framework's autoloading. This is Module 2's `zeitwerk`-based autoloading working exactly as designed: file location and class name are the configuration, verified precisely, not approximately.

**Practice**

- List every file created by a fresh `rails new --minimal` app under `app/`, and state which MVC layer (or none) each one belongs to.
- Explain, in one sentence each, why a view should never query the database directly, and why a model should never render HTML.

## Convention over configuration

**You'll be able to:** state Rails' central design philosophy and identify one concrete place it's enforced.

**Concept**

Convention over configuration means Rails infers behavior from naming and structure rather than requiring explicit configuration for the common case. A model named `Post` automatically maps to a `posts` database table; a controller named `PostsController` automatically looks for views in `app/views/posts/`. Deviating from convention is possible, but requires *explicit* configuration to override the default — the default itself needs none.

**Example**

Verified directly: generating a `Post` model and running a migration produces a `posts` table with zero explicit table-name configuration anywhere:

```ruby
class Post < ApplicationRecord
end
```

```
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

Nothing in `Post` itself says "my table is called `posts`" — Rails pluralizes the class name and looks for a matching table automatically. Module 2 verifies this convention runs deeper than table names: `Post`'s column-backed accessor methods are themselves generated, not written.

> **Pitfall / gotcha:** convention over configuration is a real productivity gain, but it means a typo in a model or file name doesn't produce "no accessor method" the way you might expect from an explicitly-declared language — it produces "table doesn't exist" or "uninitialized constant," errors one level removed from the actual typo, because the *convention itself* silently failed to find a match.

**Practice**

- Predict, then verify: what table name does a model named `Category` map to by default?
- Find the one line in `ApplicationController` (`app/controllers/application_controller.rb`) that exists in a fresh app, and explain what it inherits from.

## Routing: the front door

**You'll be able to:** read `config/routes.rb`, add a `resources` line, and read `bin/rails routes` output.

**Concept**

`config/routes.rb` maps incoming HTTP requests (a verb and a path) to a specific controller action. `resources :posts` is a single line that generates all seven conventional RESTful routes (index, show, new, create, edit, update, destroy) at once — the same convention-over-configuration idea, applied to routing specifically.

**Example**

A fresh app's `config/routes.rb`:

```ruby
Rails.application.routes.draw do
  get "up" => "rails/health#show", as: :rails_health_check
  # root "posts#index"
end
```

After adding `resources :posts` and setting `root "posts#index"`, `bin/rails routes` reports, verified directly:

```
   Prefix Verb   URI Pattern               Controller#Action
    posts GET    /posts(.:format)          posts#index
          POST   /posts(.:format)          posts#create
 new_post GET    /posts/new(.:format)      posts#new
edit_post GET    /posts/:id/edit(.:format) posts#edit
     post GET    /posts/:id(.:format)      posts#show
          PATCH  /posts/:id(.:format)      posts#update
          PUT    /posts/:id(.:format)      posts#update
          DELETE /posts/:id(.:format)      posts#destroy
```

One line, seven routes — each with a generated named helper (`posts_path`, `new_post_path`, `edit_post_path`, `post_path(id)`) usable directly in views and controllers instead of hand-written URL strings.

> **Pitfall / gotcha:** `resources :posts` generates routes for all seven conventional actions whether or not your controller actually implements all seven — a route existing and an action existing are two separate things, verified independently. `resources :posts, only: [:index, :show]` restricts the generated routes explicitly, the right tool the moment a resource is genuinely read-only.

**Practice**

- Add `resources :comments, only: [:create, :destroy]` nested inside `resources :posts do ... end`, and read the resulting `bin/rails routes` output for the nested paths it generates.
- State, from memory, which HTTP verb and path `edit_post_path(5)` corresponds to, then verify with `bin/rails routes`.

## Progress check

1. Name Rails' three MVC layers and state one responsibility for each.
2. What does "convention over configuration" mean, precisely, and what's the tradeoff when a convention is silently unmet (e.g., a misnamed file)?
3. What does a model class need to declare, explicitly, to map to a specific database table under Rails' default convention?
4. What does one `resources :posts` line generate, verified directly?
5. What's the real difference between a route existing and a controller action existing?

**Answers**

1. Model (data and business rules), View (presentation), Controller (request handling and coordination) — a request flows controller → model → view, in that order.
2. Rails infers behavior from naming and structure for the common case, requiring explicit configuration only to override a default. The tradeoff: a silently-unmet convention (a typo, a misnamed file) produces an error one level removed from the real cause — "table doesn't exist," not "you misspelled the model name."
3. Nothing, by default — verified directly with `class Post < ApplicationRecord; end` mapping automatically to a pluralized `posts` table with zero explicit configuration.
4. All seven conventional RESTful routes (index, show, new, create, edit, update, destroy), each with a generated named path helper — verified directly via `bin/rails routes`.
5. A route (in `config/routes.rb`) maps an HTTP verb+path to a controller action; the action itself (a method in the controller class) is a separate thing that must actually be implemented. `resources :posts, only: [...]` restricts which routes get generated at all, rather than generating a route to a nonexistent action.
