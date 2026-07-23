# Module 7 — Capstones

Five projects built from Modules 1–6. Structure each as a real multi-file project per Module 6 as practice — they're shown here as single files for readability, and every one was actually compiled and run with this guide's full sanitizer flags.

## Capstone 1 — Growable dynamic array

**Proves:** heap allocation, `realloc`-based growth, ownership (Modules 2, 4).

```c
typedef struct {
    int *data;
    size_t count;
    size_t capacity;
} IntArray;

void ia_init(IntArray *a) {
    a->data = NULL;
    a->count = 0;
    a->capacity = 0;
}

void ia_push(IntArray *a, int value) {
    if (a->count == a->capacity) {
        size_t new_cap = a->capacity == 0 ? 4 : a->capacity * 2;
        int *new_data = realloc(a->data, new_cap * sizeof(int));
        if (!new_data) { fprintf(stderr, "out of memory\n"); exit(1); }
        a->data = new_data;
        a->capacity = new_cap;
    }
    a->data[a->count++] = value;
}

void ia_free(IntArray *a) {
    free(a->data);
    a->data = NULL;
    a->count = a->capacity = 0;
}
```

Verified: pushing 10 values grows capacity `0 → 4 → 8 → 16` (doubling each time the array fills), ending at `count=10 capacity=16`, all values correctly retained through every `realloc`. Ran clean under the sanitizers — no leak-shaped bug, no overflow, correct growth math.

**Practice**

- Add `ia_pop` (remove and return the last element) and `ia_get`/`ia_set` with bounds checking that reports an error instead of silently overflowing.
- Genericize it: instead of hardcoding `int`, use `void *` elements and a caller-supplied element size (a real step toward how C's own `qsort` and similar generic-ish APIs work).

## Capstone 2 — Singly linked list

**Proves:** pointers, structs, manual traversal and freeing (Modules 2, 3).

```c
typedef struct Node {
    int value;
    struct Node *next;
} Node;

Node *list_push_front(Node *head, int value) {
    Node *n = malloc(sizeof(Node));
    n->value = value;
    n->next = head;
    return n;
}

void list_free(Node *head) {
    while (head != NULL) {
        Node *next = head->next;
        free(head);
        head = next;
    }
}
```

Verified: pushing `1..5` in order (each to the front) prints `5 4 3 2 1`, and the sum comes out `15` — confirming both the front-insertion order and full traversal are correct. `list_free` was run under ASan with no use-after-free or leak.

> **Pitfall:** `list_free`'s `next = head->next` *before* freeing `head` isn't a style choice — freeing `head` first and then reading `head->next` would be exactly Module 4's use-after-free bug, on your own list.

**Practice**

- Add `list_push_back` (requires either walking to the end each time, or keeping a tail pointer — try both and compare cost).
- Add `list_remove(head, value)` that removes the first matching node and correctly frees it.

## Capstone 3 — Tiny stack-based bytecode VM

**Proves:** function-pointer dispatch tables (Module 5), directly extending the 6502 guide's hand-built jump-table dispatcher.

```c
typedef struct VM { int stack[64]; int sp; int pc; int running; } VM;
typedef struct { int op; int arg; } Instr;

void vm_push(VM *vm, int v) { vm->stack[vm->sp++] = v; }
int  vm_pop(VM *vm) { return vm->stack[--vm->sp]; }

void op_push(VM *vm, int arg) { vm_push(vm, arg); }
void op_add(VM *vm, int arg)  { (void)arg; int b=vm_pop(vm), a=vm_pop(vm); vm_push(vm, a+b); }
void op_sub(VM *vm, int arg)  { (void)arg; int b=vm_pop(vm), a=vm_pop(vm); vm_push(vm, a-b); }
void op_mul(VM *vm, int arg)  { (void)arg; int b=vm_pop(vm), a=vm_pop(vm); vm_push(vm, a*b); }
void op_print(VM *vm, int arg){ (void)arg; printf("%d\n", vm->stack[vm->sp-1]); }
void op_halt(VM *vm, int arg) { (void)arg; vm->running = 0; }

typedef void (*OpFn)(VM *, int);
enum { OP_PUSH, OP_ADD, OP_SUB, OP_MUL, OP_PRINT, OP_HALT, OP_COUNT };
OpFn dispatch_table[OP_COUNT] = { op_push, op_add, op_sub, op_mul, op_print, op_halt };

void vm_run(VM *vm, Instr *program) {
    vm->running = 1;
    vm->pc = 0;
    while (vm->running) {
        Instr in = program[vm->pc++];
        dispatch_table[in.op](vm, in.arg);
    }
}
```

Verified: the program encoding `(3 + 4) * 2 - 1` correctly prints `13`.

> **This is the direct C descendant of 6502 Module 6's monitor capstone.** There, you built a table of addresses by hand, computed an offset into it, and executed an indirect `JMP`. Here, `dispatch_table[in.op](vm, in.arg)` is the exact same idea — an array indexed by an opcode, each slot holding where to jump — just with the compiler managing the addresses and the calling convention for you instead of you tracking them in zero page.

**Practice**

- Add a `JMP`/conditional-branch opcode, giving the VM actual control flow instead of a straight-line program.
- Add a `DUP` opcode (duplicate the top of the stack) and a small program that uses it.

## Capstone 4 — File-based key-value tool

**Proves:** parsing, string handling, file I/O, tying Capstones 1–2's structures to a real input source (Modules 2, 3, 4).

```c
typedef struct { char key[32]; char value[64]; } KVPair;

int load_kv(const char *path, KVPair *pairs, int max_pairs) {
    FILE *f = fopen(path, "r");
    if (!f) { fprintf(stderr, "cannot open %s\n", path); return -1; }
    char line[128];
    int count = 0;
    while (count < max_pairs && fgets(line, sizeof(line), f)) {
        line[strcspn(line, "\n")] = '\0';    /* strip trailing newline */
        char *eq = strchr(line, '=');
        if (!eq) continue;
        *eq = '\0';
        snprintf(pairs[count].key, sizeof(pairs[count].key), "%s", line);
        snprintf(pairs[count].value, sizeof(pairs[count].value), "%s", eq + 1);
        count++;
    }
    fclose(f);
    return count;
}

const char *kv_lookup(KVPair *pairs, int count, const char *key) {
    for (int i = 0; i < count; i++)
        if (strcmp(pairs[i].key, key) == 0) return pairs[i].value;
    return NULL;
}
```

Verified against a 3-line `key=value` file: correctly loads all 3 pairs, `kv_lookup("lang")` returns `"C"`, and a missing key correctly returns `NULL` (reported as `(not found)` rather than crashing).

> **Pitfall:** `snprintf` (bounded) is used here deliberately instead of `sprintf` (unbounded) — `sprintf` would happily overflow `pairs[count].key` if a line's key were longer than 31 characters, which is exactly the kind of buffer overflow Module 4 demonstrated with ASan. Bounded string functions aren't a stylistic preference in real C.

**Practice**

- Grow `pairs` dynamically (Capstone 1's technique) instead of a fixed `max_pairs`, so the tool handles files of any size.
- Add a `save_kv` that writes the in-memory pairs back out to a file.

## Capstone 5 — Polymorphic shapes via manual vtables

**Proves:** structs of function pointers as dispatch — this is the deliberate close of the C track, and directly foreshadows what `virtual` automates in C++.

```c
typedef struct Shape {
    float (*area)(const struct Shape *self);
    const char *name;
} Shape;

typedef struct { Shape base; float radius; } Circle;
typedef struct { Shape base; float width, height; } Rectangle;

float circle_area(const Shape *self) {
    const Circle *c = (const Circle *)self;
    return 3.14159f * c->radius * c->radius;
}
float rectangle_area(const Shape *self) {
    const Rectangle *r = (const Rectangle *)self;
    return r->width * r->height;
}

Circle make_circle(float radius) {
    Circle c; c.base.area = circle_area; c.base.name = "circle"; c.radius = radius;
    return c;
}
Rectangle make_rectangle(float w, float h) {
    Rectangle r; r.base.area = rectangle_area; r.base.name = "rectangle";
    r.width = w; r.height = h;
    return r;
}

void print_area(const Shape *shape) {
    /* doesn't know or care whether it's a Circle or a Rectangle */
    printf("%s area = %.2f\n", shape->name, shape->area(shape));
}

int main(void) {
    Circle c = make_circle(2.0f);
    Rectangle r = make_rectangle(3.0f, 4.0f);
    Shape *shapes[2] = { &c.base, &r.base };
    for (int i = 0; i < 2; i++) print_area(shapes[i]);
}
```

Verified: prints `circle area = 12.57` and `rectangle area = 12.00` — `print_area` calls the correct `area` implementation for each shape purely through the function pointer stored in its `Shape base`, with no `if (type == CIRCLE)` check anywhere.

**The whole point of this capstone:** `Shape base` as a struct's *first* member, containing a function pointer, is exactly what a C++ compiler generates automatically the moment a class has a `virtual` function — the "vtable pointer" every C++ object secretly carries, and the dispatch-through-a-function-pointer-table `print_area` does by hand is exactly what `shape->area()` will do invisibly in C++. You now know precisely what's happening under `virtual`, before the language ever hides it from you.

**Practice**

- Add a `Triangle` shape without changing `print_area` at all — confirm the whole point of the pattern: new types, zero changes to code that uses the common interface.
- Add a second function pointer (`perimeter`) to `Shape` and implement it for both existing types.

## Progress check

1. What's the shared underlying technique across Capstones 3 and 5?
2. Why does Capstone 2's `list_free` read `head->next` *before* freeing `head`, not after?
3. Why does Capstone 4 use `snprintf` instead of `sprintf`, and what specific Module 4 bug would `sprintf` risk here?
4. What does `Shape base` being the *first* member of `Circle` and `Rectangle` make possible?
5. What does this guide claim `virtual` in C++ automates, based on Capstone 5?

### Answers

1. Both dispatch through a table of function pointers indexed by some value (an opcode in Capstone 3, implicitly "which struct type" via the function pointer stored in `Shape base` in Capstone 5) — the same underlying idea the 6502 guide built by hand with an indirect `JMP` and an address table.
2. Freeing `head` first and then reading `head->next` afterward would be a direct use-after-free — exactly the bug Module 4 demonstrated and had ASan catch. Saving `next` first avoids ever reading through a pointer after it's freed.
3. `snprintf` is bounded — it will never write past the size you give it. `sprintf` isn't, so a key or value longer than the destination buffer would silently overflow it, exactly the heap/stack-buffer-overflow class of bug Module 4 triggered deliberately and had ASan catch.
4. `&circle_instance` and `&circle_instance.base` are the same address — so a `Shape *` pointing at a `Circle`'s `base` field can be passed to code that only knows about `Shape`, and that code can still call the right `area` function through the function pointer, without ever needing to know it's actually looking at a `Circle`.
5. A "vtable pointer" — every C++ object with a `virtual` function secretly carries something equivalent to `Shape base`'s function-pointer member, generated by the compiler, so that `shape->area()` dispatches to the right implementation automatically, the same way `print_area` does here by hand.
