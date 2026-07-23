# Module 10 — Capstone 3: Linear Regression From Scratch

**Proves:** NumPy-style vectorization, PyTorch tensors, `requires_grad`/`.backward()`, manual gradient descent (Modules 8–9).

Fitting `y = wx + b` to noisy synthetic data — with a **known** true `w` and `b`, so this capstone can verify its own answer directly, not just watch a loss number go down — using nothing but the tools Module 9 built by hand: no `nn.Module`, no `optim`, no loss-function library call. Every number below is a real, verified `uv run python3` execution.

## Synthetic data with a known right answer

```python
import torch

torch.manual_seed(42)

true_w, true_b = 3.0, 7.0
x_data = torch.linspace(-5, 5, 100)
noise = torch.randn(100) * 0.5
y_data = true_w * x_data + true_b + noise
```

`torch.manual_seed(42)` makes the "random" noise reproducible — this capstone's exact numbers below will reproduce identically on a rerun. Building the data from a known `true_w`/`true_b` plus noise is what makes this capstone self-verifying: a trained model's learned parameters can be checked directly against the values that actually generated the data, not just against "the loss went down," which alone never proves the model learned the *right* thing rather than some other function that happens to fit the noise.

## Training loop, entirely hand-built

```python
w = torch.tensor(0.0, requires_grad=True)
b = torch.tensor(0.0, requires_grad=True)

lr = 0.01
for epoch in range(200):
    y_pred = w * x_data + b
    loss = ((y_pred - y_data) ** 2).mean()   # mean squared error, written out directly
    loss.backward()
    with torch.no_grad():
        w -= lr * w.grad
        b -= lr * b.grad
    w.grad.zero_()
    b.grad.zero_()
```

Every piece is Module 9's, unchanged: `requires_grad=True` on both parameters, a loss computed as an ordinary tensor expression (mean squared error, written as plain arithmetic — no library loss function called), `.backward()` computing both `w.grad` and `b.grad` in one call (autograd differentiates through the *entire* expression graph, both parameters at once, not one at a time), the update inside `torch.no_grad()`, and `zero_()` on both parameters' gradients before the next epoch.

## Verified training run

```
epoch 0:   loss=126.0248, w=0.5096, b=0.1406
epoch 40:  loss=10.0578,  w=2.9956, b=3.9593
epoch 80:  loss=2.1909,   w=2.9971, b=5.6613
epoch 120: loss=0.6281,   w=2.9971, b=6.4199
epoch 160: loss=0.3177,   w=2.9971, b=6.7580

final: w=2.9971 (true 3.0), b=6.9062 (true 7.0)
loss: 126.0248 -> 0.2566
```

The loss dropped from `126.02` at initialization (`w=0, b=0`, a genuinely bad starting fit) to `0.26` after 200 epochs — but the more meaningful number is the direct comparison this capstone was specifically built to allow: the learned `w = 2.9971` against the true `3.0`, and `b = 6.9062` against the true `7.0`, both within a fraction of a percent, recovered from *nothing but* the noisy `x_data`/`y_data` pairs and 200 rounds of the gradient-descent loop Module 9 built by hand.

Notice `w` converges faster than `b` (`w` is already at `2.9956` by epoch 40, while `b` is still climbing at `3.9593`, well short of `7.0`) — the loss surface for this particular problem isn't equally steep in both parameter directions, a real, visible consequence of `x_data`'s specific range and scale, not a bug.

> **Pitfall:** this capstone's `lr = 0.01` was chosen deliberately conservatively — Module 9's practice problem demonstrated directly that too high a learning rate on a much simpler single-parameter problem (`lr = 1.5` on `f(x) = (x-5)²`) diverges outright rather than converging. With *two* parameters updating simultaneously here, an unstable learning rate is even easier to hit by accident, since `w` and `b`'s gradients can have very different natural scales (verified above: `w` already near-converged while `b` still has a long way to go, at the same shared `lr`) — a single learning rate that's stable for one parameter isn't automatically stable for the other.

## Practice

- Rerun this exact capstone with `torch.manual_seed(42)` removed entirely, and confirm the final `w`/`b` still land close to `3.0`/`7.0` (just not identically, since the noise is now genuinely random each run) — the *reproducibility* was a convenience for this write-up, not a requirement for the method to work.
- Increase `noise`'s scale (`torch.randn(100) * 3.0` instead of `* 0.5`) and rerun — does the final loss (which now includes more irreducible noise) still bottom out near `0`, or does it plateau higher? Does the learned `w`/`b` still land close to the true values despite the noisier data?
- Add a third parameter, fitting `y = wx² + vx + b` (a quadratic) to data generated from a true quadratic instead — confirm all three parameters converge, using the identical training-loop structure with one more `torch.no_grad()` update line.
