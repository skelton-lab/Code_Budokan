# Capstone 4 — A Verified Test Suite for the Whole App

Combines Module 10: real model tests, real controller/integration tests, and the fixture fixes their own construction required — the whole app, from Capstones 1–3, covered by a single `bin/rails test` run.

## The suite

**Model tests** (`test/models/post_test.rb`) — fixture integrity, validations, and cascading deletes:

```ruby
class PostTest < ActiveSupport::TestCase
  test "fixture loads correctly" do
    assert_equal "First Post", posts(:one).title
    assert_equal users(:one), posts(:one).user
  end

  test "requires a title" do
    post = Post.new(body: "no title", user: users(:one))
    assert_not post.valid?
    assert_includes post.errors[:title], "can't be blank"
  end

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

**Controller/integration tests** (`test/controllers/posts_controller_test.rb`) — the authorization boundary, verified with real simulated requests:

```ruby
class PostsControllerTest < ActionDispatch::IntegrationTest
  test "guests can view the index" do
    get posts_url
    assert_response :success
  end

  test "guests are redirected away from new" do
    get new_post_url
    assert_redirected_to new_session_url
  end

  test "a signed-in user can create their own post" do
    sign_in_as users(:one)
    assert_difference "Post.count", 1 do
      post posts_url, params: { post: { title: "Brand New", body: "content" } }
    end
    assert_equal users(:one), Post.last.user
  end

  test "a user cannot edit another user's post" do
    sign_in_as users(:two)
    patch post_url(posts(:one)), params: { post: { title: "Hijacked" } }
    assert_redirected_to posts_url
    assert_equal "First Post", posts(:one).reload.title
  end

  test "a user can edit their own post" do
    sign_in_as users(:one)
    patch post_url(posts(:one)), params: { post: { title: "Updated Title" } }
    assert_redirected_to post_url(posts(:one))
    assert_equal "Updated Title", posts(:one).reload.title
  end
end
```

And `test/controllers/comments_controller_test.rb`, verifying Module 8's own "commenting silently requires login" finding as a permanent, checked test rather than a one-off surprise:

```ruby
class CommentsControllerTest < ActionDispatch::IntegrationTest
  test "guests are redirected away from commenting" do
    assert_no_difference "Comment.count" do
      post post_comments_url(posts(:one)), params: { comment: { body: "anonymous" } }
    end
    assert_redirected_to new_session_url
  end

  test "a signed-in user can comment on a post" do
    sign_in_as users(:one)
    assert_difference "Comment.count", 1 do
      post post_comments_url(posts(:one)), params: { comment: { body: "Nice post!" } }
    end
    assert_redirected_to post_url(posts(:one))
  end
end
```

## Verification

```
bin/rails test
```

```
Running 17 tests in a single process (parallelization threshold is 50)
Run options: --seed 42172

# Running:

.................

Finished in 0.914266s, 18.5942 runs/s, 48.1260 assertions/s.
17 runs, 44 assertions, 0 failures, 0 errors, 0 skips
```

Verified directly — every capstone's central claim, now a permanent, re-runnable check: CRUD works (Capstone 1), associations/validations/cascading deletes work (Capstone 2), and — the two tests that matter most — a user genuinely cannot edit another user's post, and a guest genuinely cannot comment at all, both verified through real, simulated requests rather than a one-off manual `curl` session.

> **Closing this series' verification-discipline thread, precisely:** every guide in this series has its own version of this same idea — Fortran's `check()`, C/C++'s sanitizers, Python's `pytest`, Ruby's `minitest`. Rails' version isn't a new framework layered on top of what `ruby/07` already taught; it's the *same* `minitest`, with two Rails-specific base classes (`ActiveSupport::TestCase` for models, `ActionDispatch::IntegrationTest` for real request/response cycles) and a fixture system that — as this capstone's own construction found twice, genuinely — needs to be kept honest by hand as the schema underneath it changes.

## Extending it yourself

- Write an integration test confirming Bob genuinely *can* comment on his own post, and genuinely can delete his *own* comment — closing the coverage gap between "guests can't" and "owners can," which the current suite only partially covers.
- Add a test confirming the `require_ownership` gap identified in Capstone 3's own "Extending it yourself" section — that `CommentsController#destroy` currently lets any signed-in user delete any comment, not just their own — first as a failing test proving the gap exists, then fix the controller and watch the test turn green.
