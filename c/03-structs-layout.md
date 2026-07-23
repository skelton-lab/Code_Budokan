# Module 3 — Structs and Data Layout

Grouping related data, choosing between array-of-structs and struct-of-arrays now that C actually gives you the choice, and a real, verified surprise about how much memory a struct actually uses. Feeds Capstones 2, 3, 5.

## Structs

**You'll be able to:** define a struct, create instances, access and modify fields.

**Concept**

`struct` groups related fields under one type — a direct, more ergonomic version of the "entity" concept from 6502 Module 7, where you had to reserve separate zero-page bytes by hand for each field. `typedef struct {...} Name;` lets you use `Name` directly instead of writing `struct Name` everywhere.

**Example**

```c
typedef struct {
    int x, y;
    int health;
} Entity;

Entity e = {10, 20, 100};
e.health -= 30;

Entity party[3] = { {0,0,100}, {5,5,80}, {10,10,60} };
int total_health = 0;
for (int i = 0; i < 3; i++) total_health += party[i].health;
```

Verified: `e.health` correctly updates to `70` after the damage line, and the party's `total_health` sums to `240` — confirming field access and array-of-struct iteration both work as expected.

**Practice**

- Add a `char name[16]` field to `Entity` and initialize it with a string literal.
- Write a function taking a `Entity *` (pointer to a struct) and modifying a field through it — this is the standard way to pass a struct to a function without copying it.

## Array-of-structs vs. struct-of-arrays, revisited

**You'll be able to:** choose deliberately between AoS and SoA, instead of defaulting to whichever 6502 forced on you.

**Concept**

6502 Module 7 used **struct-of-arrays** (separate `entity_x`, `entity_y`, `entity_active` arrays) because that's what indexed addressing naturally gives you, with no real alternative on that hardware. C gives you a genuine choice:

- **Array-of-structs** (`Entity party[3]`, as above) — each entity's fields are contiguous in memory. Natural to read and write, and usually what you reach for first.
- **Struct-of-arrays** (`int x[3]; int y[3]; int health[3];`) — each *field* is contiguous across all entities. Better when you frequently process one field across every entity (sum all health values, say) without touching the others, because the CPU's cache loads consecutive memory together — AoS pulls in `x`/`y`/`health` together whether or not you need `x`/`y` for that pass, SoA doesn't.

For the game-style capstones in this guide, AoS is the right default — the entity counts are small and you're usually touching most of an entity's fields together anyway. Knowing SoA exists as a deliberate performance tool, not a hardware-forced default, is the actual point of revisiting this.

**Practice**

- Rewrite the `party` example above as struct-of-arrays and confirm the `total_health` sum still works.
- Describe, in one sentence, a realistic scenario (not necessarily a game) where SoA's cache behavior would matter more than AoS's readability.

## Padding and alignment: sizeof has surprises

**You'll be able to:** predict when `sizeof(struct)` is larger than the sum of its fields, and reorder fields to avoid it.

**Concept**

The compiler doesn't pack a struct's fields back-to-back byte-for-byte — it aligns each field to an address boundary matching its size (a 4-byte `int` typically needs to start at an address that's a multiple of 4), inserting invisible padding bytes where needed. Field **order** genuinely changes the total size, because padding depends on what comes immediately before each field.

**Example**

```c
#include <stddef.h>

struct Bad {
    char a;       /* 1 byte, then 3 bytes of padding to align the int */
    int b;
    char c;        /* 1 byte, then 3 more bytes of padding to align the struct's own size */
};

struct Good {
    int b;          /* 4 bytes, naturally aligned already */
    char a;
    char c;          /* the two chars pack together, only 2 bytes of trailing padding */
};
```

Verified: `sizeof(struct Bad) = 12`, `sizeof(struct Good) = 8` — the *exact same three fields*, just reordered, cost 4 fewer bytes. `offsetof(struct Bad, b) = 4` and `offsetof(struct Bad, c) = 8` confirm exactly where the padding lands: `a` occupies byte 0, bytes 1–3 are padding, `b` starts at byte 4 (correctly aligned), `c` starts at byte 8.

> **Pitfall:** this isn't a micro-optimization footnote — a struct-of-many-fields laid out carelessly, allocated by the thousands (game entities, particles, database rows), can genuinely waste a meaningful fraction of your memory and cache efficiency purely from padding. The fix costs nothing: order fields from largest to smallest.

**Practice**

- Predict `sizeof` for a struct with fields `char, char, int, char` before checking (three chars, one int, in that order).
- Use `offsetof` to confirm exactly where the padding sits in your prediction.

## Progress check

1. What problem does `struct` solve that 6502's struct-of-arrays workaround didn't need to?
2. When would struct-of-arrays still be the better choice in C, even though array-of-structs is usually more natural?
3. Why can two structs with identical fields have different `sizeof` results?
4. What's the cheap, general fix for wasted padding in a struct?
5. What does `offsetof` tell you that plain `sizeof` doesn't?

### Answers

1. It lets related fields live in one contiguous block addressed by a single name, instead of maintaining several separately-indexed arrays kept in sync by convention — genuinely simpler to read and reason about when you're not fighting hardware addressing constraints.
2. When you frequently process one field across every instance without needing the others — the cache-friendliness of touching only contiguous same-field data outweighs AoS's readability advantage.
3. The compiler inserts alignment padding based on field order — a field needing 4-byte alignment placed right after a 1-byte field forces padding before it; the same fields in a different order may need none.
4. Order fields from largest to smallest — this minimizes how often a smaller field forces padding before a larger one.
5. `sizeof` gives the whole struct's total size. `offsetof` gives the exact byte position of one specific field within the struct — which is what actually reveals where padding is hiding.
