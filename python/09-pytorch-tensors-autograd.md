# Module 9 — PyTorch Tensors and Autograd

PyTorch's tensor looks like a NumPy array with one genuinely new capability layered on top: automatic differentiation — the mechanism every neural network training loop in Modules 11–14 actually runs on. This module builds gradient descent from first principles, by hand, specifically so the `nn.Module`/`optim` abstractions in Module 11 aren't magic when they arrive. Every example below is a real, verified `uv run python3` execution. Feeds Capstone 3.

## Tensors: NumPy arrays, with one sharp real difference

**You'll be able to:** create PyTorch tensors, and avoid a genuine, easy-to-miss shared-memory trap when converting from NumPy.

**Concept**

A `torch.Tensor` supports the same vectorized operations Module 8 built on NumPy arrays for — element-wise arithmetic, broadcasting, reductions. `torch.from_numpy()` converts a NumPy array to a tensor **without copying data** — the tensor and the array share the exact same underlying memory.

**Example**

```python
import torch
import numpy as np

np_arr = np.array([1.0, 2.0, 3.0])
t_from_np = torch.from_numpy(np_arr)
np_arr[0] = 999.0
print(t_from_np)
```

Verified: `tensor([999., 2., 3.], dtype=torch.float64)` — modifying `np_arr` **after** the conversion changed `t_from_np` too, because they're not two independent copies; `from_numpy()` gives you a tensor view over the array's actual memory.

> **Pitfall:** this is the opposite of what most conversions between two different libraries' data types do — a naive assumption that `torch.from_numpy(arr)` produces an independent copy (the safer default in most other contexts) is wrong here, and the bug it causes is exactly the kind that's invisible until something mutates the original array later and a seemingly unrelated tensor changes too. `torch.tensor(arr)` (not `from_numpy`) does copy, if independence is actually what's needed.

**Practice**

- Verify directly that `torch.tensor(np_arr)` (not `from_numpy`) produces a tensor that does *not* change when the original NumPy array is mutated afterward.

## Autograd: gradients, computed automatically

**You'll be able to:** mark a tensor for gradient tracking, call `.backward()`, and read the resulting gradient.

**Concept**

A tensor created with `requires_grad=True` has every operation performed on it recorded into a computation graph. Calling `.backward()` on a final scalar result walks that graph in reverse, computing the derivative of the result with respect to every `requires_grad=True` tensor that contributed to it — automatic, exact differentiation, not a numerical approximation.

**Example**

```python
x = torch.tensor(3.0, requires_grad=True)
y = x ** 2 + 2 * x + 1
y.backward()
print(x.grad)
```

Verified: `tensor(8.)` — matching the exact analytical derivative, `d/dx(x² + 2x + 1) = 2x + 2`, evaluated at `x = 3`: `2(3) + 2 = 8`. PyTorch computed this by walking the actual sequence of operations that built `y` from `x`, not by symbolically deriving the formula the way a calculus textbook would, and not by approximating it numerically either — it's exact, to floating-point precision.

> **Pitfall, verified directly and a genuinely essential PyTorch fact:** gradients **accumulate** across multiple `.backward()` calls on the same tensor — they are not automatically reset. Verified: calling `.backward()` twice on fresh computations built from the same `x` (`x**2` each time) gives `x.grad = 6.0` after the first call and `x.grad = 12.0` after the second — not `6.0` again, `6.0 + 6.0`. The fix, verified directly, is `x.grad.zero_()` between calls, after which a fresh `.backward()` correctly reports `6.0` again. Every training loop in Modules 11–14 zeroes gradients at the start of each step for exactly this reason — forgetting it is one of the most common real PyTorch bugs, and it fails silently: the loop still runs, the loss still (usually) decreases, just more erratically and incorrectly than it should.

**Practice**

- Predict, then verify, what `x.grad` reports after three consecutive `.backward()` calls on `x**2` with no zeroing in between, starting from `x = 3.0`.

## Building gradient descent from first principles

**You'll be able to:** write a working gradient descent loop by hand, using only `.backward()` and manual parameter updates — no `nn.Module`, no `optim`.

**Concept**

Minimizing a function by gradient descent is: compute the function's value (the "loss"), compute its gradient with respect to the parameter being tuned, and step the parameter a small amount in the *negative* gradient direction (downhill), repeated until convergence. Updating a `requires_grad=True` tensor's value directly needs to happen **outside** autograd's tracking — inside a `torch.no_grad()` block — since the update itself isn't part of the computation whose gradient matters.

**Example**, minimizing `f(x) = (x - 5)²` (true minimum at `x = 5`, by inspection):

```python
x = torch.tensor(0.0, requires_grad=True)
lr = 0.1
for step in range(30):
    loss = (x - 5.0) ** 2
    loss.backward()
    with torch.no_grad():
        x -= lr * x.grad
    x.grad.zero_()

print(f"x = {x.item():.4f}")
```

Verified: `x = 4.9938` — starting from `0.0`, thirty steps of gradient descent land within `0.01` of the true minimum at `5.0`, using nothing but `.backward()`, a manual update, and an explicit `zero_()` each step.

> **Pitfall, verified directly:** removing `with torch.no_grad():` and updating `x` directly (`x -= lr * x.grad` with no context manager) raises `RuntimeError: a leaf Variable that requires grad is being used in an in-place operation` — PyTorch refuses to let you modify a tensor that's tracking gradients in place without explicitly saying "this specific operation is not part of what I want differentiated." `torch.no_grad()` is that explicit statement; without it, the parameter-update step would itself become part of the computation graph, which makes no sense for what a gradient-descent update actually is.

**Practice**

- Change `lr` to `1.5` (well above a stable value for this specific function) and observe what happens to `x` over the 30 steps — does it converge, oscillate, or diverge? Explain why in terms of the update rule `x ← x - lr · gradient`.
- Rewrite this loop to minimize `f(x) = (x - 5)² + (y - 3)²` over two parameters simultaneously (`x` and `y`, each `requires_grad=True`), confirming both converge to their respective targets.

## Progress check

1. What's the practical consequence of `torch.from_numpy()` sharing memory with its source array, rather than copying it?
2. What does `requires_grad=True` actually cause PyTorch to do, mechanically, as operations are performed on a tensor?
3. Why did `x.grad` report `12.0`, not `6.0`, after two consecutive `.backward()` calls with no zeroing in between?
4. What's the standard fix for gradient accumulation between training steps, and why does every training loop in this guide's later modules need it?
5. Why does updating a `requires_grad=True` tensor's value need to happen inside `torch.no_grad()`?
6. In the hand-written gradient descent loop, what three steps does each iteration perform, in order?

### Answers

1. Mutating the original NumPy array after conversion also changes the tensor (and vice versa) — verified directly, they're not independent copies but two views over the same underlying memory, the opposite of what a naive assumption about cross-library conversion might expect.
2. It records every operation performed on that tensor (and on any tensor derived from it) into a computation graph, so that a later `.backward()` call can walk that graph in reverse and compute exact derivatives with respect to it.
3. Because gradients accumulate by default across `.backward()` calls rather than resetting — the first call correctly computed `6.0` and stored it in `x.grad`; the second call's freshly-computed `6.0` was *added* to the existing `6.0`, not used to replace it.
4. Calling `.grad.zero_()` on each tracked parameter before (or after) each step's `.backward()` call — every training loop runs many steps in sequence, and without zeroing, each step's gradient would be contaminated by the accumulated total of every previous step's gradient too.
5. Because directly modifying a tensor that's part of an active computation graph is exactly the kind of in-place operation autograd can't safely reconcile with correct gradient tracking — verified directly, attempting it without `torch.no_grad()` raises a `RuntimeError`. `torch.no_grad()` explicitly marks the update as outside the graph, which is correct, since the parameter-update step itself isn't part of what should be differentiated.
6. Compute the loss (the function's current value), call `.backward()` to compute the gradient, then update the parameter in the negative-gradient direction inside `torch.no_grad()` and zero the gradient before the next iteration.
