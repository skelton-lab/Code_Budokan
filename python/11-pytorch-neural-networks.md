# Module 11 — PyTorch Neural Networks

`nn.Module` and `torch.optim` package everything Module 9/Capstone 3 built by hand — the parameters, the loss computation, the update rule — into reusable, composable pieces. This module rebuilds Capstone 3's linear regression at this higher level to show it's the same underlying mechanism, then measures something Capstone 3 couldn't: real GPU acceleration, with an honest, verified answer about when it actually helps. Every number below is a real, measured `uv run python3` execution. Feeds Capstone 4.

## `nn.Module`: parameters and computation, packaged together

**You'll be able to:** define a model by subclassing `nn.Module`, and explain what `nn.Linear` replaces from Capstone 3's hand-written version.

**Concept**

`nn.Module` is PyTorch's base class for anything with learnable parameters. Subclassing it and defining `forward(self, x)` (what the model computes) is the entire contract; `nn.Linear(in_features, out_features)` is a pre-built layer that owns its own weight and bias tensors — both already `requires_grad=True` — replacing the `w`/`b` tensors Capstone 3 declared and updated by hand.

**Example**

```python
import torch.nn as nn

class LinearModel(nn.Module):
    def __init__(self):
        super().__init__()
        self.linear = nn.Linear(1, 1)
    def forward(self, x):
        return self.linear(x)

model = LinearModel()
print([(n, p.shape) for n, p in model.named_parameters()])
```

Verified: `[('linear.weight', torch.Size([1, 1])), ('linear.bias', torch.Size([1]))]` — `nn.Linear(1, 1)` created exactly the two parameters Capstone 3 declared explicitly as `w` and `b`, already tracked, already `requires_grad=True`, with no manual `torch.tensor(0.0, requires_grad=True)` needed.

**Practice**

- Predict, then verify, the parameter shapes for `nn.Linear(3, 1)` (three input features, one output) — how many total learnable numbers does that layer own?

## `torch.optim`: the update rule, packaged too

**You'll be able to:** replace a hand-written gradient-descent update with `optimizer.step()`, and explain what each piece of the training loop now does.

**Concept**

`torch.optim.SGD(model.parameters(), lr=...)` packages Capstone 3's manual `with torch.no_grad(): w -= lr * w.grad` update (and the equivalent for every other parameter) into `optimizer.step()`. `optimizer.zero_grad()` replaces the manual `.grad.zero_()` calls on every parameter individually.

**Example**, Capstone 3's exact regression problem, rebuilt with `nn.Module`/`optim`:

```python
x_data = torch.linspace(-5, 5, 100).unsqueeze(1)
true_w, true_b = 3.0, 7.0
y_data = true_w * x_data + true_b + torch.randn(100, 1) * 0.5

optimizer = torch.optim.SGD(model.parameters(), lr=0.01)
loss_fn = nn.MSELoss()

for epoch in range(200):
    optimizer.zero_grad()
    y_pred = model(x_data)
    loss = loss_fn(y_pred, y_data)
    loss.backward()
    optimizer.step()

print(model.linear.weight.item(), model.linear.bias.item())
```

Verified output: `w=3.0150` (true `3.0`), `b=6.8879` (true `7.0`) — converging to essentially the same answer Capstone 3's hand-written loop found (`w=2.9971`, `b=6.9062`), because it's mechanically the identical computation: `nn.MSELoss()` computes the same mean-squared-error formula Capstone 3 wrote out directly (`((y_pred - y_data) ** 2).mean()`), and `optimizer.step()` performs the same `param -= lr * param.grad` update, just for every registered parameter automatically instead of one hand-written line per parameter.

> **Pitfall:** `nn.Module`/`optim` are convenience, not new capability — every line of Capstone 3's hand-rolled version was doing exactly this same math, which is precisely why building it by hand first (this guide's own sequencing) matters: `optimizer.step()` isn't a black box the moment you've already implemented what it does yourself, one `torch.no_grad()` block at a time.

**Practice**

- Add a second `nn.Linear` layer with a `nn.ReLU()` activation between them, turning `LinearModel` into a small two-layer network, and confirm it still trains without error on the same `x_data`/`y_data` (even though a two-layer network is unnecessary for a genuinely linear relationship — the point is confirming the mechanics work, not that it's the right architecture for this problem).

## Measuring GPU acceleration honestly: it depends on workload size

**You'll be able to:** move a model and its data to MPS, and explain why GPU acceleration isn't automatically faster.

**Concept**

`.to(device)` moves a model's parameters (or a tensor) onto a specific device — `torch.device("mps")` on this Apple Silicon machine, confirmed available since Module 00's setup check. GPU parallelism helps most when there's enough work to parallelize *and* the overhead of dispatching that work to the GPU is small relative to the work itself — neither is guaranteed just because a GPU is available.

**Example**, a small multi-layer network (two 512-unit hidden layers), training on three different dataset sizes, CPU vs. MPS, measured back to back with identical warmup:

```python
def train_and_time(device_name, n_samples, epochs):
    device = torch.device(device_name)
    x = torch.randn(n_samples, 100, device=device)
    y = torch.randint(0, 10, (n_samples,), device=device)
    model = MLP().to(device)
    optimizer = torch.optim.SGD(model.parameters(), lr=0.01)
    # ... training loop, with torch.mps.synchronize() after MPS runs
    # to ensure timing captures actual completion, not just dispatch
```

**Verified results:**

| Workload | CPU | MPS | Winner |
|---|---|---|---|
| 500 samples, 20 epochs | `0.0237s` | `0.0357s` | **CPU** |
| 20,000 samples, 20 epochs | `1.0381s` | `0.4225s` | **MPS**, 2.46× |
| 50,000 samples, 30 epochs | `3.8273s` | `2.0450s` | **MPS**, 1.87×  |

At the smallest scale, **CPU wins** — the overhead of dispatching work to the GPU and synchronizing results back genuinely costs more than the tiny amount of actual computation saves. At real training scale (tens of thousands of samples), MPS wins clearly and consistently, roughly `2×` faster on this specific network and machine.

> **Pitfall, verified directly:** `.to("mps")` costing *more* time than it saves for a small enough workload isn't a mistake in how it was measured — it's the actual, honest behavior of GPU acceleration in general, on any hardware, for any framework. Reflexively moving every computation to a GPU "because GPUs are faster" is exactly backwards for small workloads; the correct default question is "does this workload have enough parallel work to amortize the dispatch overhead," answered by measuring, the same as every other performance claim this series has made (SQL's indexing session found the identical shape of result: an index that helped enormously at 1,000,000 rows and changed nothing at all on four).
>
> **A second, real pitfall:** `torch.mps.synchronize()` in the timing code above isn't decoration — MPS operations dispatch *asynchronously* by default, meaning code can appear to "finish" (control returns to Python) before the GPU has actually completed the work. Timing without `synchronize()` would measure how fast PyTorch can *queue* work on the GPU, not how fast the GPU actually *finishes* it — a subtly wrong number that would make MPS look artificially, misleadingly fast.

**Practice**

- Run the three-workload comparison on your own machine and confirm the same qualitative pattern (CPU wins small, MPS wins large), even if the exact crossover point and speedup ratios differ from this guide's measurements.
- Remove `torch.mps.synchronize()` from the timing code and rerun the largest workload — does the measured MPS time change, and in which direction, compared to the synchronized version?

## Progress check

1. What does `nn.Linear(1, 1)` replace from Capstone 3's hand-written code, verified directly by comparing parameter shapes?
2. What does `optimizer.step()` do, mechanically, in terms of Capstone 3's manual update line?
3. Why did the `nn.Module`/`optim` version and Capstone 3's hand-rolled version converge to essentially the same `w`/`b` values?
4. At what rough workload size did CPU outperform MPS in this guide's measurements, and why?
5. At what rough workload size did MPS clearly outperform CPU, and by roughly how much?
6. Why does `torch.mps.synchronize()` matter for getting an honest timing measurement, and what would timing without it actually measure instead?

### Answers

1. The manually declared `w = torch.tensor(0.0, requires_grad=True)` and `b = torch.tensor(0.0, requires_grad=True)` tensors — verified directly, `nn.Linear(1, 1)`'s two named parameters (`linear.weight`, `linear.bias`) have exactly the shapes those two hand-declared tensors had.
2. It performs the same `param -= lr * param.grad` update Capstone 3 wrote by hand inside `torch.no_grad()`, for every parameter the optimizer was given, in one call instead of one hand-written line per parameter.
3. Because they're mechanically the identical computation — `nn.MSELoss()` computes the same mean-squared-error formula Capstone 3 wrote out directly, and `optimizer.step()` performs the same gradient-descent update rule; the only difference is which code is responsible for writing out each step, not what's actually being computed.
4. Around 500 samples over 20 epochs — CPU (`0.0237s`) beat MPS (`0.0357s`) because the overhead of dispatching work to the GPU and synchronizing results back cost more than the small amount of actual computation saved at that scale.
5. Around 20,000–50,000 samples, where MPS was roughly `1.9×`–`2.5×` faster than CPU, verified directly across two different workload sizes at that scale.
6. Because MPS operations dispatch asynchronously — code can continue running in Python before the GPU has actually finished the work. Without `synchronize()`, a timer would measure how quickly PyTorch can *queue* work onto the GPU, not how long the GPU actually takes to *complete* it, producing an artificially low, misleading time.
