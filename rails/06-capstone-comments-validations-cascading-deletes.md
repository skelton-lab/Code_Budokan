# Capstone 2 — Comments, Validations, and Cascading Deletes

Combines Modules 4–5: a real `Comment` model, associated with `Post` through both a Rails-level `belongs_to`/`has_many` pair and a genuine database-level foreign key, plus validations verified to reject real bad data — extending Capstone 1's blog into an actually relational structure, not just a second table sitting next to the first.

## The association

```bash
bin/rails generate model Comment post:references body:text
bin/rails db:migrate
```

```ruby
class Comment < ApplicationRecord
  belongs_to :post
end

class Post < ApplicationRecord
  validates :title, presence: true, uniqueness: true
  has_many :comments, dependent: :destroy
end
```

`t.references :post, null: false, foreign_key: true` — generated automatically by `references` — adds both a `post_id` column and a real, database-enforced `FOREIGN KEY` constraint, verified directly in `db/schema.rb`:

```ruby
add_foreign_key "comments", "posts"
```

Nested routes and a small controller expose this over real HTTP:

```ruby
# config/routes.rb
resources :posts do
  resources :comments, only: [ :create, :destroy ]
end
```

```ruby
class CommentsController < ApplicationController
  before_action :set_post

  def create
    @comment = @post.comments.build(comment_params)
    if @comment.save
      redirect_to @post, notice: "Comment added."
    else
      redirect_to @post, alert: @comment.errors.full_messages.to_sentence
    end
  end

  def destroy
    @comment = @post.comments.find(params[:id])
    @comment.destroy
    redirect_to @post, notice: "Comment removed.", status: :see_other
  end

  private
    def set_post
      @post = Post.find(params[:post_id])
    end

    def comment_params
      params.expect(comment: [ :body ])
    end
end
```

## Verification: a real comment, created over HTTP

```bash
# GET the post's show page, extract cookies + the comment form's own CSRF token
curl -s -c cookies.txt http://localhost:3000/posts/4 -o show.html
TOKEN=$(grep -o 'action="/posts/4/comments".*authenticity_token" value="[^"]*"' show.html | sed 's/.*value="//;s/"//')

curl -s -b cookies.txt -X POST http://localhost:3000/posts/4/comments \
  -d "authenticity_token=${TOKEN}" \
  -d "comment[body]=A real HTTP-created comment"
# -> HTTP 302

curl -s http://localhost:3000/posts/4 | grep "A real HTTP-created comment"
# -> found
```

Verified directly. The first attempt at this used the *wrong* token — the show page has two forms (the post's own "destroy" button, and the comment form), and grabbing the first `authenticity_token` on the page (the destroy form's own) produced a real `Can't verify CSRF token authenticity` rejection when submitted to the *comment* form's endpoint. Rails 8 defaults to `per_form_csrf_tokens: true`, verified directly — a token is scoped to the specific form (path and method) it was rendered for, not just "any valid token from this session." The fix was using the comment form's own token specifically, not any token that happened to be on the page.

## Verification: cascading deletes and the database-level guarantee

```ruby
p1 = Post.create!(title: "A Real Post", body: "content", user: some_user)
c1 = p1.comments.create!(body: "first comment")
c2 = p1.comments.create!(body: "second comment")

p1.destroy

Comment.exists?(c1.id)   # => false
Comment.exists?(c2.id)   # => false
```

And, independently, the constraint holding even when ActiveRecord's own validation layer is bypassed entirely:

```ruby
ActiveRecord::Base.connection.execute(
  "INSERT INTO comments (post_id, body, created_at, updated_at) VALUES (99999, 'orphan', datetime('now'), datetime('now'))"
)
```

```
ActiveRecord::InvalidForeignKey: SQLite3::ConstraintException: FOREIGN KEY constraint failed
```

Both verified directly. `dependent: :destroy` genuinely removes both comments (checked independently via `Comment.exists?`, not assumed from the post's own destruction succeeding), and the foreign key constraint rejects an orphan `post_id` even via a raw SQL statement that never touches `Comment`'s own validations at all — `sql/09-transactions-constraints.md`'s own foreign-key material, confirmed from the ActiveRecord side.

> **The direct, honest comparison to `belongs_to`'s own Rails-level check:** an ordinary `Comment.create(post_id: 99999, body: "x")` — going through ActiveRecord normally, not raw SQL — never even reaches the database at all; it fails at `belongs_to`'s own presence validation first, with the friendly message `"Post must exist"`. The raw-SQL foreign-key rejection above only fires because that specific test deliberately bypassed ActiveRecord's validation layer to prove the *database itself*, not just the friendlier Rails-level check, actually enforces the relationship.

## Extending it yourself

- Add a `validates :body, presence: true, length: { minimum: 3 }` to `Comment`, and verify directly it rejects an empty or too-short comment with a specific error message.
- Verify directly: does destroying a `Comment` have any effect on its `Post`? State precisely why not, based on which model declared `dependent: :destroy` (and which model didn't).
