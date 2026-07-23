# Module 7 — The STL

Everything C Capstones 1–4 hand-built — a growable array, a lookup structure, string parsing — largely already exists, tested and optimized, in the standard library. This module shows you what you were reimplementing, using the type-checked generic mechanism (templates) from Module 4. Feeds Capstone 5.

## `std::vector`: Capstone 1, already written

**You'll be able to:** use `std::vector` for growable, type-safe arrays, and connect it directly to what you hand-built in C.

**Concept**

`std::vector<T>` is a template class doing exactly what C Capstone 1's `IntArray` did by hand — `realloc`-based growth, tracked count and capacity — except generic over any type `T`, and with the growth/bounds logic already written and tested. `push_back` grows it as needed; `size()` reports the current count; range-based `for` iterates it directly.

**Example**

```cpp
std::vector<int> nums = {5, 3, 8, 1, 9, 2};
nums.push_back(100);
std::cout << "size = " << nums.size() << "\n";
for (int n : nums) std::cout << n << " ";
```

Verified: `size = 7` after the `push_back`, and the range-based loop correctly prints all seven values in insertion order — this is genuinely the same growable-array behavior as C Capstone 1's `IntArray`, generic and with no manual `realloc` call anywhere in your own code.

**Practice**

- Build a `std::vector<Vec2>` (Module 5's type) and confirm it works with no changes to `Vec2` itself.
- Compare `std::vector<int>` directly against your C Capstone 1 `IntArray`: what did the standard library give you for free that you built by hand?

## Algorithms and lambdas

**You'll be able to:** sort a container with a custom comparison, search it, and write a lambda inline for either.

**Concept**

`<algorithm>` provides generic functions like `std::sort` and `std::find` that work on any container's iterator range (`begin()`, `end()`) — the same template mechanism from Module 4 again, now applied to algorithms instead of containers. A **lambda** (`[](int a, int b) { return a > b; }`) is an inline, anonymous function — exactly what you'd otherwise need a named comparison function for, defined right where you use it.

**Example**

```cpp
std::sort(nums.begin(), nums.end());                                // ascending, default <
std::sort(nums.begin(), nums.end(), [](int a, int b) { return a > b; }); // descending, custom

auto it = std::find(nums.begin(), nums.end(), 8);
bool found = (it != nums.end());
```

Verified: ascending sort correctly produces `1 2 3 5 8 9 100`; the lambda-based descending sort correctly produces `100 9 8 5 3 2 1`; `std::find` correctly locates `8` (`it != nums.end()` is `true`).

> **Pitfall:** `std::find` returning `nums.end()` on failure — not `-1`, not `nullptr` — is the STL's consistent "not found" convention across every container and algorithm. Comparing the result against `end()`, not against a sentinel value, is the idiom to internalize; it generalizes to every STL search you'll ever write.

**Practice**

- Write a lambda that captures a variable from the surrounding scope (`[threshold](int x) { return x > threshold; }`) and use it with `std::count_if` or `std::find_if`.
- Sort a `std::vector<Vec2>` by distance from the origin, using a lambda comparator.

## `std::map` and `std::string`: Capstones 3–4, already written

**You'll be able to:** use `std::map` for key-value lookup and `std::string` for text, replacing what C's Capstones 3–4 built by hand.

**Concept**

`std::map<K, V>` is an ordered key-value structure — direct-name lookup, insertion, and iteration, replacing both C Capstone 4's hand-rolled `KVPair` array-with-linear-scan and (conceptually) C Capstone 3's jump-table-by-opcode idea generalized to arbitrary key types. `std::string` replaces C's fixed-size `char[]` buffers and manual `strcpy`/`strlen`/`strcspn` calls with a type that manages its own memory and grows as needed — itself, under the hood, essentially `std::vector<char>` with string-specific conveniences.

**Example**

```cpp
std::map<std::string, int> ages;
ages["Ada"] = 36;
ages["Alan"] = 41;

for (const auto &[name, age] : ages) {
    std::cout << name << " -> " << age << "\n";
}

auto found = ages.find("Ada");
if (found != ages.end()) std::cout << "Ada's age: " << found->second << "\n";
if (ages.find("Grace") == ages.end()) std::cout << "Grace not found\n";
```

Verified: iterates both entries correctly (`Ada -> 36`, `Alan -> 41`), `find("Ada")` correctly returns an iterator to `{"Ada", 36}` (accessed via `->second`), and `find("Grace")` correctly compares equal to `end()` for a missing key — the same `end()`-as-not-found convention as `std::find`.

> **Pitfall:** `const auto &[name, age]` is **structured bindings** (C++17) — it destructures the `std::pair<const std::string, int>` each map entry actually is, without you needing to write `.first`/`.second` explicitly in the loop. It's convenience syntax over exactly the pair-based iteration `std::map` has always done.

**Practice**

- Rebuild C Capstone 4's key-value file tool using `std::map<std::string, std::string>` and `std::ifstream`/`getline` instead of `fopen`/`fgets` — compare the line count against the original C version.
- Rebuild C Capstone 3's bytecode VM's opcode dispatch using a `std::vector` of `std::function<void(VM&, int)>` instead of a raw C function-pointer array, and compare the two approaches.

## Progress check

1. What C capstone does `std::vector` directly replace, and what specifically did it give you for free?
2. What's the STL's consistent convention for "not found," used identically by `std::find` and `std::map::find`?
3. What is a lambda, in one sentence?
4. What are structured bindings, and what do they destructure in a `for (const auto &[name, age] : ages)` loop?
5. What two C capstones does `std::map` + `std::string` together directly replace?

### Answers

1. C Capstone 1's hand-rolled `IntArray` — `std::vector` gives you the same growable-array behavior, generic over any type, with the growth/bounds logic already written, tested, and reused across the entire standard library rather than hand-maintained per project.
2. Returning an iterator equal to the container's `end()` — never a sentinel value like `-1` or `nullptr` — checked with `it != end()` (found) or `it == end()` (not found).
3. An inline, anonymous, unnamed function, defined directly where it's used, most commonly as a comparison or predicate passed to an algorithm.
4. They destructure a compound value (here, `std::pair<const std::string, int>`, which is what each `std::map` entry actually is) into named parts (`name`, `age`) directly in the binding, avoiding explicit `.first`/`.second` access.
5. C Capstone 4 (the key-value file tool's hand-rolled `KVPair` array and linear-scan lookup) and, more conceptually, C Capstone 3's dispatch-by-key idea, now generalized to arbitrary key types instead of a fixed small integer range.
