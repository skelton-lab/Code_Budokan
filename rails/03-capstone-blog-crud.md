# Capstone 1 — A Blog with Full CRUD

Combines Modules 1–2: a scaffolded `Post` resource, verified end to end with real HTTP requests — not just "it generated without errors," but a genuine create, confirmed to persist, confirmed to appear on a subsequent request, including Rails' own CSRF protection tested from both directions.

## The resource

```bash
bin/rails generate scaffold Post title:string body:text
bin/rails db:migrate
```

This produces the migration, model, controller, views, and routes Module 2 already walked through. `config/routes.rb` gets `resources :posts`, and `root "posts#index"` is set explicitly so the app's home page is the post list.

## Verification: a real, CSRF-protected create

Rather than trust the scaffold's own generated tests, this capstone verifies the actual HTTP flow a browser would perform — fetch the new-post form, extract its real CSRF token, and submit with it:

```bash
# GET the empty index
curl -s http://localhost:3000/posts   # 200 OK, "Posts" heading, no posts listed

# GET the new-post form, save cookies + extract the real authenticity token
curl -s -c cookies.txt http://localhost:3000/posts/new -o form.html
TOKEN=$(grep -o 'name="authenticity_token" value="[^"]*"' form.html | sed 's/.*value="//;s/"//')

# POST with the real token
curl -s -b cookies.txt -c cookies.txt -X POST http://localhost:3000/posts \
  -d "authenticity_token=${TOKEN}" \
  -d "post[title]=Hello Rails" \
  -d "post[body]=My first post"
# -> HTTP 302 (redirect to the new post — success)

# GET the index again
curl -s http://localhost:3000/posts | grep "Hello Rails"
# -> found
```

Verified directly: the create succeeds (`302`), and the created post genuinely appears in a fresh `GET /posts` request afterward — proof the data persisted, not just that the create action returned a plausible-looking response.

## Verification: CSRF protection actually protects

The same endpoint, attacked directly — no token at all:

```bash
curl -s -X POST http://localhost:3000/posts \
  -d "post[title]=Forged Post" \
  -d "post[body]=no csrf token"
# -> HTTP 422 Unprocessable Content
```

```bash
curl -s http://localhost:3000/posts | grep "Forged Post"
# -> not found, correctly rejected
```

Verified directly, both directions: a request with a genuine token succeeds and persists; an identical request with no token at all is rejected with `422`, and — checked independently, not assumed — the forged post never appears in the database. `protect_from_forgery` isn't a decorative default; it was tested against a real attack shape and held.

> **Pitfall / gotcha:** verified directly, and worth knowing precisely rather than approximately: Rails 8 defaults to `per_form_csrf_tokens`, meaning a valid CSRF token is scoped to the *specific form* (path and method) it was rendered for, not just the current session. Grabbing a token from one form on a page (say, the "destroy this post" button) and using it to authenticate a *different* form's submission (say, a comment form on the same page) genuinely fails — confirmed directly, `Can't verify CSRF token authenticity`, even though both tokens came from a legitimately authenticated session. The right token is always the one from the specific form actually being submitted, not "any token from a page you're allowed to see."

## Extending it yourself

- Add a `published:boolean` column (if not already added in Module 2's practice) and a checkbox to the form; verify a created post's `published` value round-trips correctly through a real HTTP create.
- Repeat this capstone's CSRF-rejection test against the `update` and `destroy` actions specifically, confirming both are equally protected, not just `create`.
