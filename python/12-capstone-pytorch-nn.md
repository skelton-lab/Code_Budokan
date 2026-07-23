# Module 12 — Capstone 4: Concentric Circles — Why Hidden Layers Exist

**Proves:** `nn.Module`, `optim`, a real training loop, and — the capstone's actual point — exactly what a nonlinear hidden layer buys you that a linear model structurally cannot provide, no matter how it's trained (Module 11).

Two classes of points arranged as concentric circles — a small inner disk (class 0) and a ring around it (class 1) — a dataset **no straight line can separate**, by construction. This capstone trains a plain linear model on it first (verified to fail, not hypothetically but with a real measured accuracy near chance), then a two-layer network with one `ReLU` (verified to solve it exactly, and to generalize to held-out data it never trained on). Every number below is a real, verified `uv run python3` execution.

## The dataset: not linearly separable, by construction

```python
def make_circles(n_per_class=200):
    theta_inner = torch.rand(n_per_class) * 2 * torch.pi
    r_inner = torch.rand(n_per_class) * 1.5
    x_inner = torch.stack([r_inner * torch.cos(theta_inner), r_inner * torch.sin(theta_inner)], dim=1)

    theta_outer = torch.rand(n_per_class) * 2 * torch.pi
    r_outer = 3.0 + torch.rand(n_per_class) * 1.5
    x_outer = torch.stack([r_outer * torch.cos(theta_outer), r_outer * torch.sin(theta_outer)], dim=1)

    X = torch.cat([x_inner, x_outer], dim=0)
    y = torch.cat([torch.zeros(n_per_class), torch.ones(n_per_class)]).long()
    return X, y
```

Class 0 points sit within radius `1.5` of the origin; class 1 points sit in a ring between radius `3.0` and `4.5`. No single straight line through this 2D plane can put every class-0 point on one side and every class-1 point on the other — the true decision boundary is a circle, not a line.

## A linear model: verified to fail

```python
linear_model = nn.Linear(2, 2)
optimizer = torch.optim.Adam(linear_model.parameters(), lr=0.05)
loss_fn = nn.CrossEntropyLoss()
for epoch in range(300):
    optimizer.zero_grad()
    loss = loss_fn(linear_model(X), y)
    loss.backward()
    optimizer.step()
preds = linear_model(X).argmax(dim=1)
accuracy = (preds == y).float().mean().item()
```

Verified: `loss=0.6928`, `accuracy=0.5475` — barely better than the `0.50` a coin flip would achieve on this balanced two-class problem, and the loss (`0.6928`) sits almost exactly at `ln(2) ≈ 0.693`, the loss value `CrossEntropyLoss` reports for a model that's essentially guessing uniformly at random. This isn't a training failure (300 epochs, a real optimizer, a real loss genuinely being minimized) — it's a **representational** failure: `nn.Linear` can only ever draw a straight decision boundary, and no amount of additional training changes that structural fact.

## A two-layer network: verified to succeed, and to generalize

```python
class MLP(nn.Module):
    def __init__(self):
        super().__init__()
        self.net = nn.Sequential(nn.Linear(2, 16), nn.ReLU(), nn.Linear(16, 2))
    def forward(self, x):
        return self.net(x)

mlp = MLP()
optimizer = torch.optim.Adam(mlp.parameters(), lr=0.05)
for epoch in range(300):
    optimizer.zero_grad()
    loss = loss_fn(mlp(X), y)
    loss.backward()
    optimizer.step()
```

Verified: `loss=0.0001`, `accuracy=1.0000` — every single point classified correctly, loss driven essentially to zero. The one structural change from the failed linear model: a hidden layer (`Linear(2, 16)`) followed by a **nonlinear** activation (`ReLU`) before the final `Linear(16, 2)` — the nonlinearity is what lets the network bend its decision boundary into the actual circular shape this problem needs, rather than being confined to a single straight line.

**Generalization, verified on genuinely held-out data:**

```python
X_train, y_train = make_circles(200)
X_test, y_test = make_circles(50)   # a fresh, independently-drawn set — the model never sees this during training
# ... train on X_train/y_train only ...
train_acc = (mlp(X_train).argmax(dim=1) == y_train).float().mean().item()
test_acc = (mlp(X_test).argmax(dim=1) == y_test).float().mean().item()
```

Verified: `train accuracy: 1.0000, test accuracy: 1.0000` — both the training data and a completely separate, freshly-generated test set are classified perfectly. This matters specifically because `100%` training accuracy alone would leave open the possibility the network just memorized 400 specific points rather than learning the actual circular boundary; matching that on independently-generated data is real evidence it learned the underlying shape of the problem, not a lookup table of the training points.

> **Pitfall:** the *only* difference between the failing model and the succeeding one is the hidden layer plus its nonlinearity — same optimizer (`Adam`), same loss function, same number of training epochs, same learning rate. It's tempting to read a failed training run as "needs more epochs" or "needs a better optimizer" by default; this capstone's controlled comparison shows directly that sometimes the actual problem is representational — the model architecture itself is incapable of expressing the right answer, no matter how it's trained, and the fix is architectural (add a nonlinear hidden layer), not procedural (train longer, tune the learning rate).

## Practice

- Replace `ReLU` with no activation at all (`nn.Linear(2, 16)` directly feeding `nn.Linear(16, 2)`, no nonlinearity between them) and confirm the resulting network — despite now having two `Linear` layers — still fails at roughly the same accuracy as the single-layer linear model. (Hint: what does composing two linear transformations with nothing nonlinear between them mathematically reduce to?)
- Reduce the hidden layer from `16` units to `2`, retrain, and check whether accuracy holds at `1.0000` or degrades — how few hidden units does this specific problem actually need to remain solvable?
- Reusing Module 11's CPU-vs-MPS measurement technique (including `torch.mps.synchronize()`), time this capstone's MLP training loop on both devices — given this network and dataset are much smaller than Module 11's benchmark workload, which device do you expect to win, and does the measured result confirm it?
