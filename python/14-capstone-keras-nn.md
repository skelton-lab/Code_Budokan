# Module 14 — Capstone 5: Concentric Circles, in Keras

**Proves:** `Sequential`, `.compile()`/`.fit()`, and a direct, measured contrast against Capstone 4's identical problem solved with `nn.Module`/`optim` (Module 13).

The exact same concentric-circles classification problem Capstone 4 solved with hand-written `nn.Module`/`optim` — same failure mode for a linear model, same success for a two-layer network with `ReLU` — this time in Keras. The point of building it twice isn't redundancy: it's a real, measured answer to "what does Keras's convenience actually cost," not a guess. Every number below is a real, verified `uv run python3` execution.

## The same result: linear fails, a hidden layer succeeds

```python
def make_circles(n_per_class=200):
    # identical construction to Capstone 4 — inner disk (class 0), outer ring (class 1)
    ...

X_train, y_train = make_circles(200)
X_test, y_test = make_circles(50)

linear_model = keras.Sequential([keras.layers.Input(shape=(2,)), keras.layers.Dense(2)])
linear_model.compile(optimizer=keras.optimizers.Adam(learning_rate=0.05),
                      loss=keras.losses.SparseCategoricalCrossentropy(from_logits=True),
                      metrics=["accuracy"])
linear_model.fit(X_train, y_train, epochs=300, verbose=0)
```

Verified: `loss=0.6903, accuracy=0.6225` — again barely better than chance (Capstone 4's PyTorch version measured `0.5475`; the small difference is just different random data draws, not a different conclusion). A linear decision boundary still cannot separate concentric circles, regardless of which framework trains it.

```python
mlp_model = keras.Sequential([
    keras.layers.Input(shape=(2,)),
    keras.layers.Dense(16, activation="relu"),
    keras.layers.Dense(2),
])
mlp_model.compile(optimizer=keras.optimizers.Adam(learning_rate=0.05),
                   loss=keras.losses.SparseCategoricalCrossentropy(from_logits=True),
                   metrics=["accuracy"])
mlp_model.fit(X_train, y_train, epochs=300, verbose=0)
```

Verified: `train loss=0.0000, train accuracy=1.0000`; on the genuinely held-out `X_test`/`y_test`: `test loss=0.0000, test accuracy=1.0000` — identical to Capstone 4's PyTorch result, perfect accuracy on both training and independently-generated test data. The architectural lesson (a nonlinear hidden layer is what makes this problem solvable, not more training) transfers exactly, because it's the same underlying mathematical fact regardless of which API expresses it.

## Measuring what Keras's convenience actually costs

**The first, naive measurement — genuinely dramatic, and initially misleading:**

```python
# Keras, default settings, 300 epochs
keras_model.fit(X, y, epochs=300, verbose=0)
```

Verified: `11.4309s`. The equivalent hand-written PyTorch loop (Capstone 4's exact training code, same architecture, same 300 iterations):

```python
for epoch in range(300):
    optimizer.zero_grad(); loss = loss_fn(model(X), y); loss.backward(); optimizer.step()
```

Verified: `0.0517s`. Taken at face value, that's **221× slower** for Keras — a number dramatic enough to be suspicious, and it is: it isn't measuring what it looks like it's measuring.

**Investigating why, rather than reporting the misleading number:** Keras's `.fit()` defaults to `batch_size=32` — splitting this capstone's 400 training points into ~13 mini-batches *per epoch*, meaning 300 epochs actually runs roughly 3,900 individual gradient updates. The PyTorch loop above does no batching at all — it's **full-batch** gradient descent, one update per epoch, 300 updates total. The two numbers were never measuring the same amount of work.

**A fair, matched comparison**, forcing Keras to also process the full dataset in one batch per epoch:

```python
keras_model.fit(X, y, epochs=300, verbose=0, batch_size=400)
```

Verified: `1.1415s` — down from `11.4309s` once batch size is matched to PyTorch's implicit full-batch behavior. The genuine, apples-to-apples overhead of Keras's convenience layer over a bare hand-written loop, for this exact computation: **roughly 22×**, not 221×.

> **Pitfall, and the actual lesson of this capstone's second measurement:** the first, dramatic 221× number was real — it did measure something true — but what it actually measured was mostly "300 epochs of mini-batch training vs. 300 epochs of full-batch training," a difference in *how much work was done*, not a difference in *how efficiently the same work was done*. Reporting the first number without investigating further would have been a real, verified measurement used to support a false conclusion — exactly the trap this guide's own methodology exists to catch (the same discipline that caught Module 8's silent integer-overflow bug: verify the actual cause, don't stop at the first plausible-looking number). The corrected, fair comparison (`~22×`) is still a real, meaningful cost — `.fit()`'s metrics tracking, callback dispatch, and data-pipeline setup are genuine per-epoch overhead a bare loop doesn't pay — but it's roughly a tenth the size of the first, uninvestigated number.

## Practice

- Reproduce both measurements (default `batch_size` and `batch_size=400`) directly, and confirm the same qualitative pattern — a large apparent gap that shrinks substantially once batch size is matched.
- Explain, in your own words, why mini-batch training (Keras's `batch_size=32` default) is usually the *right* choice for real datasets, despite being slower per-epoch here — what does it typically buy a real training run that full-batch gradient descent on a tiny, 400-point synthetic dataset doesn't need?
- This capstone's `~22×` remaining gap is Keras's genuine per-`.fit()`-call overhead on this specific, tiny problem. Predict, then verify, whether that ratio grows, shrinks, or stays roughly the same on a *much* larger synthetic dataset (say, 50,000 points instead of 400) — does convenience-layer overhead matter more or less as the actual computation per batch grows?
