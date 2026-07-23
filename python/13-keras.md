# Module 13 — Keras: the Same Computation, a Higher Level of Abstraction

The third and final way this guide solves the identical linear-regression problem — hand-rolled `autograd` (Capstone 3), `nn.Module`/`optim` (Module 11), and now Keras's declarative `Sequential`/`.compile()`/`.fit()` — genuinely running on the same PyTorch tensors underneath, not a separate framework pretending to be simple. Every result below is a real, verified `uv run python3` execution. Feeds Capstone 5.

## Confirming the shared backend, directly

**You'll be able to:** verify, not just take on faith, that Keras 3 on this project is actually running on PyTorch.

**Concept**

Keras 3's backend-agnostic design (this guide's `00-overview.md` setup note) means `keras.backend.backend()` reports which engine is actually doing the computation, and a layer's underlying weight is a real tensor of that engine's native type — not an abstraction hiding an entirely separate computation underneath.

**Example**

```python
import keras
import torch

print(keras.backend.backend())

model = keras.Sequential([keras.layers.Input(shape=(1,)), keras.layers.Dense(1)])
raw_weight = model.layers[0].kernel
print(isinstance(raw_weight.value, torch.Tensor))
```

Verified: `torch`, then `True` — Keras's `Dense` layer's weight genuinely *is* a `torch.Tensor` under Keras's own `Variable` wrapper, the same tensor type every prior module in this guide has been using directly.

**Practice**

- Confirm `keras.backend.backend()` and the `isinstance(..., torch.Tensor)` check directly in your own environment, then explain why this same code would report a different backend name and a different (or absent) `torch.Tensor` check if `KERAS_BACKEND` had been set to `tensorflow` instead.

## The same regression, three ways

**You'll be able to:** build, compile, and train a model in Keras, and map every piece directly onto its PyTorch equivalent.

**Concept**

`keras.Sequential([...])` declares a model as a list of layers; `.compile(optimizer=..., loss=...)` attaches an optimizer and loss function (Module 11's `torch.optim.SGD` and `nn.MSELoss()`, by different names); `.fit(x, y, epochs=...)` runs the entire training loop — the `zero_grad()`/forward/`backward()`/`step()` sequence Module 11 wrote out explicitly — in one call.

**Example**, Capstone 3's exact problem (`y = 3x + 7 + noise`), solved a third way:

```python
import numpy as np

true_w, true_b = 3.0, 7.0
x_data = np.linspace(-5, 5, 100).astype("float32").reshape(-1, 1)
y_data = true_w * x_data + true_b + np.random.randn(100, 1).astype("float32") * 0.5

model = keras.Sequential([
    keras.layers.Input(shape=(1,)),
    keras.layers.Dense(1),
])
model.compile(optimizer=keras.optimizers.SGD(learning_rate=0.01), loss="mse")
history = model.fit(x_data, y_data, epochs=200, verbose=0)

weights = model.layers[0].get_weights()
print(weights[0][0][0], weights[1][0])
```

Verified: learned `w = 2.9854` (true `3.0`), `b = 6.9608` (true `7.0`) — within the same margin as Capstone 3's hand-rolled result (`w=2.9971, b=6.9062`) and Module 11's `nn.Module` result (`w=3.0150, b=6.8879`). Three genuinely different levels of abstraction — explicit `.backward()` calls, `nn.Module`/`optim.step()`, and Keras's `.fit()` — converging to the same answer, because underneath, they're all running the identical gradient-descent mechanism over the identical PyTorch tensors.

| Level | Loss computation | Update step | This guide's version |
|---|---|---|---|
| Hand-rolled | `((pred - y)**2).mean()`, written directly | `with torch.no_grad(): w -= lr * w.grad` | Capstone 3 |
| `nn.Module`/`optim` | `nn.MSELoss()` | `optimizer.step()` | Module 11 |
| Keras | `loss="mse"` | `.fit(...)`, one call | This module |

> **Pitfall:** it's tempting to treat this progression as "Keras is just easier, always prefer it" — but easier here specifically means *less visible*, not *less real*. Every mechanism Capstone 3 built by hand (gradients accumulating unless zeroed, the update needing to happen outside autograd's own tracking) is still happening inside `.fit()`; Keras just doesn't require writing it out. The value of having built Capstone 3 first isn't nostalgia — it's that a `.fit()` call producing a `NaN` loss, or training that never converges, is far easier to debug once you know exactly what `.fit()` is doing on your behalf, because you've written that exact loop yourself.

**Practice**

- Set `history = model.fit(..., verbose=0)` and inspect `history.history["loss"]` (a plain Python list, one value per epoch) — confirm it's decreasing over the 200 epochs, the same shape of evidence Capstone 3's own printed loss values provided for its hand-rolled loop.
- Swap `keras.optimizers.SGD(learning_rate=0.01)` for `keras.optimizers.Adam(learning_rate=0.01)` and retrain — does it converge faster, slower, or to a different final `w`/`b`, over the same 200 epochs?

## The functional API: for architectures `Sequential` can't express

**You'll be able to:** build the same architecture with Keras's functional API, and explain when it's actually necessary instead of `Sequential`.

**Concept**

`keras.Sequential` only expresses a straight-line stack of layers, one feeding directly into the next. The **functional API** — calling each layer as a function on the previous layer's output, then wrapping the whole chain in `keras.Model(inputs=..., outputs=...)` — expresses the identical straight-line case just as well, but also anything `Sequential` structurally can't: multiple inputs, multiple outputs, or a layer whose output feeds into more than one place.

**Example**

```python
inputs = keras.Input(shape=(2,))
hidden = keras.layers.Dense(16, activation="relu")(inputs)
outputs = keras.layers.Dense(2)(hidden)
functional_model = keras.Model(inputs=inputs, outputs=outputs)

seq_model = keras.Sequential([
    keras.layers.Input(shape=(2,)),
    keras.layers.Dense(16, activation="relu"),
    keras.layers.Dense(2),
])

print(functional_model.count_params(), seq_model.count_params())
```

Verified: `82 82` — genuinely identical architectures (a `2→16→2` network, `ReLU` between), one written as a straight-line list, one as explicit function calls, producing the same parameter count and (with matching random seeds) the same trainable structure. `model.summary()` on either confirms the shape at each layer directly:

```
Layer (type)          Output Shape    Param #
input_layer            (None, 2)            0
dense                   (None, 16)          48
dense_1                 (None, 2)           34
```

**A real error, verified directly:** calling either model with mismatched input shape —

```python
bad_input = np.random.randn(5, 3).astype("float32")  # 3 features; model expects 2
seq_model(bad_input)
```

Verified: `ValueError: ... incompatible with the layer: expected axis -1 ...` — Keras checks input shape against what the model was actually built for and refuses a mismatch clearly, rather than silently broadcasting or truncating.

> **Pitfall:** `Sequential`'s simplicity is exactly what makes it the *wrong* choice the moment an architecture isn't a straight line — a model needing to combine two separate input sources, or reuse one layer's output in two different downstream branches, cannot be expressed as a `Sequential` list at all, no matter how it's rearranged; the functional API (or Keras's subclassing API, closer to `nn.Module`'s style, not covered here) is required, not merely preferred.

**Practice**

- Build a functional-API model with **two** separate `keras.Input` branches (e.g., one for a `(2,)` feature vector and one for a `(1,)` scalar), each passed through its own `Dense` layer, then concatenated (`keras.layers.Concatenate()`) before a final output layer — confirm it builds and runs, and explain concretely why no rearrangement of a `Sequential` list could express this same architecture.

## Progress check

1. What does `keras.backend.backend()` reporting `"torch"` confirm, verified directly against the actual weight type?
2. Match each of the three training approaches this guide has used (hand-rolled, `nn.Module`/`optim`, Keras) to its update-step line — what performs the equivalent of `optimizer.step()` in each?
3. Why did all three approaches converge to closely matching `w`/`b` values for the identical regression problem?
4. What's the risk in treating Keras's `.fit()` as simply "the easy version," rather than "the same mechanism, with the loop hidden"?
5. What can the functional API express that `Sequential` structurally cannot?
6. What did the shape-mismatch test confirm about how Keras handles an input that doesn't match a model's expected shape?

### Answers

1. That Keras's `Dense` layer's weight genuinely is a `torch.Tensor` (verified: `isinstance(raw_weight.value, torch.Tensor)` reports `True`) — Keras 3 on this project is a real interface over the exact same PyTorch computation this guide has used since Module 9, not a separate framework simulating one.
2. Hand-rolled: `with torch.no_grad(): w -= lr * w.grad`, written explicitly per parameter. `nn.Module`/`optim`: `optimizer.step()`, called once for all registered parameters. Keras: `.fit(...)`, which runs the entire zero-grad/forward/backward/step sequence internally, once per epoch, with no explicit call to any of those individual steps visible in user code.
3. Because all three are performing the identical underlying computation — the same mean-squared-error loss, the same gradient-descent update rule, over the same synthetic data — differing only in how much of that mechanism is written out explicitly versus handled by a higher-level call.
4. Every mechanism built by hand in Capstone 3 (gradient accumulation, the need to update parameters outside autograd's tracking) is still happening inside `.fit()` — it's hidden, not absent. Debugging a `.fit()` call that produces `NaN` losses or fails to converge is much harder without already understanding, from having built it by hand, exactly what steps are running underneath.
5. Multiple inputs, multiple outputs, or any architecture where a layer's output needs to feed into more than one downstream path — anything beyond a single, straight-line stack of layers, which is the one shape `Sequential` is structurally limited to.
6. That Keras validates input shape against what the model was actually built to accept and raises a clear error on mismatch, rather than silently broadcasting, truncating, or producing a nonsensical result from mismatched dimensions.
