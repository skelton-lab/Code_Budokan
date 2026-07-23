# Capstone 3 — A Blog Only Its Author Can Edit

Combines Modules 7–8: real authentication (Rails 8's native generator, plus a hand-written registration controller), real authorization (`require_ownership`), and a genuine two-user attack scenario — not a hypothetical, two real registered accounts, one attacking the other's post directly over HTTP, verified blocked.

## The setup

`Post` gets a real `user` association and a migration adding the foreign key:

```ruby
class Post < ApplicationRecord
  belongs_to :user
  validates :title, presence: true, uniqueness: true
  has_many :comments, dependent: :destroy
end
```

`PostsController` combines everything Modules 7–8 built:

```ruby
class PostsController < ApplicationController
  allow_unauthenticated_access only: %i[ index show ]
  before_action :set_post, only: %i[ show edit update destroy ]
  before_action :require_ownership, only: %i[ edit update destroy ]

  def create
    @post = Current.user.posts.build(post_params)
    if @post.save
      redirect_to @post, notice: "Post was successfully created."
    else
      render :new, status: :unprocessable_content
    end
  end

  # ... update, destroy unchanged from Capstone 1 ...

  private
    def require_ownership
      unless @post.user == Current.user
        redirect_to posts_path, alert: "You can only edit your own posts."
      end
    end
end
```

## Verification: two real users, a real attack

```bash
# register alice and bob (real HTTP form submissions, real CSRF tokens)
# ... (Module 7's registration flow) ...

# alice creates a post
curl -b alice_cookies.txt -X POST http://localhost:3000/posts \
  -d "authenticity_token=${ALICE_TOKEN}" \
  -d "post[title]=Alices Post" -d "post[body]=owned by alice"
# -> 302, post id 1

# bob tries to view alice's edit form
curl -b bob_cookies.txt -o /dev/null -w "%{http_code}\n" http://localhost:3000/posts/1/edit
# -> 302 (redirected away by require_ownership, not even shown the form)

# bob grabs a genuinely valid CSRF token from a page HE can access, then attacks directly
curl -b bob_cookies.txt http://localhost:3000/posts -o bob_index.html
BOB_TOKEN=$(grep -o 'name="csrf-token" content="[^"]*"' bob_index.html | sed 's/.*content="//;s/"//')

curl -b bob_cookies.txt -X PATCH http://localhost:3000/posts/1 \
  -d "authenticity_token=${BOB_TOKEN}" \
  -d "post[title]=HIJACKED"
# -> 302 (redirected by require_ownership, NOT a CSRF rejection)
```

```ruby
Post.find(1).title   # => "Alices Post" — unchanged
```

Verified directly, and deliberately isolated from Capstone 1's own CSRF finding: Bob's attack used a token that is genuinely valid *for his own session* — pulled from a page he legitimately has access to — specifically to prove that CSRF protection isn't what's stopping him. `require_ownership` alone, the application-level authorization check, is what blocks the attack. The post's title is confirmed unchanged, checked independently, not assumed from the redirect alone.

> **The direct, honest comparison to `sql/09-transactions-constraints.md`:** this capstone's ownership check is enforced entirely at the *application* level — `@post.user == Current.user`, a plain Ruby comparison, with nothing preventing a bug elsewhere in the codebase (a raw SQL update, a rake task, a console mistake) from changing a post's `title` without ever going through `PostsController` at all. This is a real, honest limit worth naming precisely: Module 4's foreign-key constraint is enforced by the database itself, for every possible write, from any source; this capstone's authorization is enforced by *this specific controller's own code path*, for requests that go through it. Real production systems that need the stronger guarantee reach for row-level security at the database layer — genuinely out of this guide's scope, named here rather than left unstated.

## Extending it yourself

- Change `require_ownership`'s redirect to `raise ActiveRecord::RecordNotFound` instead, and verify directly what HTTP status code the response now carries for Bob's attack.
- Add the identical ownership check to `CommentsController#destroy` — currently, any signed-in user can delete *any* comment on *any* post, not just their own. Verify the gap exists first (with two real users), then close it.
