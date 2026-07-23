# Module 7 — Authentication: Rails 8's Native Generator

Before Rails 8, real-world Rails authentication almost always meant reaching for Devise. Rails 8 ships a genuine, native alternative: `bin/rails generate authentication`, session-based, bcrypt-backed, no external gem required beyond `bcrypt` itself (added automatically). This module verifies exactly what the generator produces — and, precisely, what it doesn't. Feeds Capstone 3.

## Running the generator

**You'll be able to:** run `bin/rails generate authentication`, and name every file it produces.

**Concept**

The generator creates a `User` model, a `Session` model, an `Authentication` controller concern, `SessionsController` (login/logout), `PasswordsController` (password reset), the migrations for both new tables, and wires `ApplicationController` to require authentication by default on every action, everywhere, unless explicitly opted out.

**Example**

Verified directly, running the generator against a real app:

```
      create  app/models/session.rb
      create  app/models/user.rb
      create  app/models/current.rb
      create  app/controllers/sessions_controller.rb
      create  app/controllers/concerns/authentication.rb
      create  app/controllers/passwords_controller.rb
      insert  app/controllers/application_controller.rb
       route  resources :passwords, param: :token
       route  resource :session
         run  bundle add bcrypt
    generate  migration CreateUsers email_address:string!:uniq password_digest:string!
    generate  migration CreateSessions user:references ip_address:string user_agent:string
```

`User` and `Session` as real ActiveRecord models; `Authentication` as a genuine Ruby module (built with `ActiveSupport::Concern`), included directly into `ApplicationController` — connecting straight back to `ruby/`'s own mixin material (`Comparable`, `Priceable` in Ruby's Capstone 2) as the identical `include`-a-module pattern, this time shipped by the framework itself.

> **Pitfall / gotcha:** verified directly — running this generator against a `--minimal` app (this guide's own anchored toolchain, see `00-overview.md`) produces a genuinely broken corner: `PasswordsController` has no `create` action at all, and the generator's own auto-generated test references a `PasswordsMailer` class that was never created, because `ActionMailer` doesn't exist in a `--minimal` app and the password-reset flow assumes it does. This guide's own capstones use login and registration, deliberately not password reset — the gap is real, and named here explicitly rather than left as a silently-broken file.

**Practice**

- Run `bin/rails routes` after generating authentication, and list every new route added.
- Read `app/models/session.rb` and `app/models/user.rb` in full; state, in one sentence each, what each model is responsible for.

## `has_secure_password`: bcrypt, one line

**You'll be able to:** explain what `has_secure_password` provides, and why a plaintext password is never stored.

**Concept**

`has_secure_password` (built into ActiveModel, backed by the `bcrypt` gem) adds a virtual `password`/`password_confirmation` attribute pair, hashes whatever's assigned to `password` into a real `password_digest` column, and adds an `authenticate(plaintext)` method that checks a plaintext attempt against the stored hash — without the application ever storing, or even seeing again, the original plaintext.

**Example**

```ruby
class User < ApplicationRecord
  has_secure_password
  normalizes :email_address, with: ->(e) { e.strip.downcase }
end
```

Verified directly:

```ruby
u = User.create!(email_address: "alice@example.com", password: "password123")
u.password_digest              # a real bcrypt hash, e.g. "$2a$12$..."
u.authenticate("password123")  # => the user object (truthy)
u.authenticate("wrongpass")    # => false
```

> **Pitfall / gotcha:** `normalizes :email_address, with: ->(e) { e.strip.downcase }` runs on every assignment, not just on save — meaning `User.new(email_address: "  ALICE@Example.com  ").email_address` is already `"alice@example.com"` before `.save` is ever called. This is genuinely useful for avoiding case-sensitive duplicate-email bugs, but worth knowing precisely: it's a normalization (silently transforms the value), not a validation (which would reject an unnormalized value instead).

**Practice**

- Verify directly: does `User.create!(email_address: "Bob@Example.com", password: "x")` followed by `User.find_by(email_address: "bob@example.com")` find the same user? Confirm the normalization is actually applied before the row is written, not just on read.
- Verify directly: what does `u.password_digest` actually look like (print it) — confirm it bears no resemblance to the plaintext password at all.

## What the generator does *not* provide: registration

**You'll be able to:** state precisely what Rails 8's native generator covers, and what a real app still has to build itself.

**Concept**

`bin/rails generate authentication` provides **login** (the `session` resource) and **password reset** (the `passwords` resource) — it does **not** provide user registration/signup. There's no `RegistrationsController`, no `users#new`/`users#create`, no signup form, anywhere in the generated output.

**Example**

Verified directly — `bin/rails routes` after generating authentication:

```
new_session GET  /session/new(.:format)  sessions#new
    session GET  /session(.:format)      sessions#show
            POST /session(.:format)      sessions#create
```

No `new_user`, no `users#create`, nowhere. A minimal, hand-written registration controller closes the gap:

```ruby
class RegistrationsController < ApplicationController
  allow_unauthenticated_access

  def new
    @user = User.new
  end

  def create
    @user = User.new(user_params)
    if @user.save
      start_new_session_for @user
      redirect_to root_path, notice: "Welcome!"
    else
      render :new, status: :unprocessable_content
    end
  end

  private
    def user_params
      params.expect(user: [ :email_address, :password ])
    end
end
```

`start_new_session_for` is a real, private method the generated `Authentication` concern already provides — signing a new user in immediately after registering reuses the exact same session-creation logic `SessionsController` itself uses for a normal login.

> **Pitfall / gotcha:** this is a genuinely common misconception worth being precise about — "Rails 8 has built-in authentication" is true for login and password reset, but registration is left to the application, deliberately (a real signup form usually needs application-specific fields and validation anyway, so a one-size-fits-all generator would fight against real apps more than it would help). `allow_unauthenticated_access` on `RegistrationsController` is essential and easy to forget: without it, `ApplicationController`'s own default (require authentication everywhere) would lock a brand-new visitor out of the signup page meant to let them in.

**Practice**

- Register a real user via this controller (`POST /registration` with real params), and verify directly, via `bin/rails runner`, that the user now exists in the database with a real `password_digest`.
- State precisely: what would happen, verified directly, if `allow_unauthenticated_access` were removed from `RegistrationsController`? (Hint: `ApplicationController`'s own default.)

## Progress check

1. What two features does `bin/rails generate authentication` provide, and what one common feature does it deliberately not provide?
2. Verified directly against this guide's own `--minimal` toolchain: what specifically breaks in the generated `PasswordsController`, and why?
3. What does `has_secure_password` add to a model, and what column does it expect to exist?
4. Is `normalizes :email_address, with: ->(e) { e.strip.downcase }` a validation or a normalization — precisely, what's the difference in when each runs?
5. What real, existing method does a hand-written `RegistrationsController#create` reuse to sign a new user in immediately, and where does that method actually live?

**Answers**

1. Login (session-based) and password reset — both real, working features. Registration/signup is deliberately not provided; verified directly, no `RegistrationsController`, no signup route, anywhere in the generated output.
2. `PasswordsController` has no `create` action, and its auto-generated test references a `PasswordsMailer` class that was never created — because the password-reset flow assumes `ActionMailer` is available to send the reset email, and `--minimal` strips `ActionMailer` entirely.
3. A virtual `password`/`password_confirmation` attribute pair, an `authenticate(plaintext)` method, and bcrypt-based hashing on assignment. It expects a `password_digest` column to already exist on the model's table.
4. A normalization — it runs on every assignment (the moment a value is set), silently transforming it, verified directly with a value already normalized before `.save` is ever called. A validation, by contrast, runs at `.valid?`/`.save` time and rejects a value rather than transforming it.
5. `start_new_session_for` — a private method defined in the generated `Authentication` concern (`app/controllers/concerns/authentication.rb`), included into `ApplicationController` and therefore available in every controller that inherits from it, including a hand-written `RegistrationsController`.
