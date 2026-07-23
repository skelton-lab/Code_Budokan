# Module 8 — Pointers and Dynamic Data Structures

Typed pointers, `New`/`Dispose` instead of `malloc`/`free`, and a real, precise surprise about pointer arithmetic that turned up while verifying this module directly — FPC's default mode is looser than the ISO standard on exactly this point. Every example below is a real, verified `fpc` compile-and-run. Feeds Capstone 4.

## `New`, `Dispose`, and typed pointers

**You'll be able to:** declare a pointer type, allocate and free dynamic memory, and explain why Pascal's pointers are typed more strictly than C's.

**Concept**

`^T` declares a pointer-to-`T` type. `New(p)` allocates space for one `T` and points `p` at it (Pascal's equivalent of C's `malloc`, but type-aware — it knows exactly how much space `T` needs without being told). `p^` dereferences — reads or writes the value `p` points to. `Dispose(p)` frees it (Pascal's `free`).

**Example**

```pascal
type
  IntPtr = ^integer;
var
  p: IntPtr;
begin
  New(p);
  p^ := 100;
  writeln('p^ = ', p^);
  Dispose(p);
end.
```

Verified: `p^ = 100`.

```pascal
type
  IntPtr = ^integer;
  RealPtr = ^real;
var
  ip: IntPtr;
  rp: RealPtr;
begin
  New(ip);
  rp := ip;
end.
```

Verified: `Error: Incompatible types: got "IntPtr" expected "RealPtr"` — a genuine, compile-time-enforced distinction between "pointer to an integer" and "pointer to a real," with no implicit conversion allowed. C's pointers, by contrast, permit `void*` and can be cast between types the compiler will happily allow (sometimes only with a warning), which is exactly the class of error this strictness is designed to catch earlier.

**Practice**

- Declare `p: IntPtr` without calling `New(p)` first, then attempt `p^ := 5;` — predict what happens (an uninitialized pointer, dereferenced), then verify.

## A real surprise: FPC's default mode allows pointer arithmetic; ISO Pascal doesn't

**You'll be able to:** state precisely which Pascal (the ISO standard, or FPC's default extended mode) actually permits arithmetic on pointers.

**Concept**

The expectation, coming in, was straightforward: "Pascal doesn't have pointer arithmetic, unlike C." Verified directly, that's only true of the **ISO standard** — Free Pascal's own default mode is looser.

**Example**

```pascal
type
  IntPtr = ^integer;
var
  p: IntPtr;
begin
  New(p);
  p := p + 1;
end.
```

Verified with plain `fpc pointer_arith.pas` (FPC's default `-Mfpc` mode): **compiles successfully**, with only an unrelated note about an unused variable — `p + 1` on a typed pointer is accepted as a genuine FPC extension, doing exactly the pointer-arithmetic-style address adjustment C would do.

Verified with `fpc -Miso pointer_arith.pas` (strict ISO mode): **`Error: Operation "+" not supported for types "IntPtr" and "ShortInt"`** — the identical code, now correctly rejected, confirming pointer arithmetic genuinely isn't part of standard Pascal at all.

> **Pitfall, and a real, precise lesson about anchoring to one toolchain's default mode:** this guide anchors to FPC's default mode specifically because it's how Pascal is actually compiled and used today — but that default mode is not a neutral, standard-conforming baseline on every point; it's FPC's own superset, with real extensions like this one. A claim like "Pascal doesn't allow pointer arithmetic" is subtly wrong stated about *this specific, anchored toolchain* unless qualified — it's accurate about the ISO standard Pascal was originally specified as, and about `-Miso` mode specifically, verified directly here.

**Practice**

- Confirm directly whether FPC's default-mode pointer arithmetic on a typed pointer (`p + 1`) advances by one *element* (like C's typed pointer arithmetic) or by one raw *byte*, using a pointer to a multi-byte type and checking the resulting address difference.

## A hand-built linked list

**You'll be able to:** build a singly-linked list using a self-referencing record and pointer type, insert nodes, traverse them, and free them.

**Concept**

A linked list node needs to reference another node of its own type — a record type referring to a pointer to itself, which Pascal allows by declaring the pointer type ahead of the record it points to (forward-declared automatically for this specific case).

**Example**

```pascal
type
  NodePtr = ^Node;
  Node = record
    value: integer;
    next: NodePtr;
  end;

var
  head, cur, newNode: NodePtr;
  i: integer;
begin
  head := nil;
  for i := 5 downto 1 do
  begin
    New(newNode);
    newNode^.value := i;
    newNode^.next := head;
    head := newNode;
  end;

  cur := head;
  while cur <> nil do
  begin
    write(cur^.value, ' ');
    cur := cur^.next;
  end;
  writeln;
end.
```

Verified output: `1 2 3 4 5` — inserting `5, 4, 3, 2, 1` (in that order) each at the *front* of the list produces a final list in ascending order, exactly the standard "insert at head" linked-list construction pattern. `nil` (Pascal's null-pointer value) correctly marks the end of the list, checked in the `while cur <> nil do` traversal.

> **Pitfall:** freeing this list correctly needs to save `cur^.next` *before* calling `Dispose(cur)` — disposing a node and then trying to read its (now-freed) `next` field afterward is a genuine use-after-free, the same class of bug C's manual memory management makes possible (and Pascal's `Dispose` doesn't prevent any more than C's `free` does — typed, safer pointers protect against *type* confusion, not against use-after-free or double-free).

**Practice**

- Write the correct node-freeing loop (save `next` before disposing the current node) and confirm it runs without error against this capstone's five-node list.
- Add an `InsertAtEnd` procedure (traversing to the last node and appending, rather than always inserting at the head) and use it to build the identical `1 2 3 4 5` list in a different way — confirm the traversal output is the same either way.

## Progress check

1. What does `New(p)` know automatically that C's `malloc` needs to be told explicitly?
2. Why did assigning an `IntPtr` value to a `RealPtr` variable fail at compile time, verified directly?
3. What did this module verify about pointer arithmetic that contradicted the initial, reasonable-sounding expectation coming in?
4. What compiler flag reveals the ISO-standard-conforming answer about pointer arithmetic, and what did it show?
5. Why does typed-pointer safety not protect against every category of pointer-related bug, specifically demonstrated by the linked-list freeing loop?

### Answers

1. The size of the type being pointed to (`T` in `^T`) — `New(p)` allocates exactly enough space for one `T` without the caller needing to compute or pass a byte count, unlike `malloc(size)` in C, which needs the size given explicitly (commonly via `sizeof`).
2. Because Pascal's pointer types are distinct, incompatible types unless they point to the identical underlying type — verified directly, `IntPtr` and `RealPtr` are not interchangeable even though both are "just pointers" at the machine level, with no implicit conversion permitted.
3. That FPC's default compilation mode actually *allows* pointer arithmetic (`p := p + 1` compiled successfully) — contradicting the reasonable, common claim that "Pascal doesn't have pointer arithmetic," which turned out to be true only of the ISO standard, not of this guide's actual anchored toolchain's default behavior.
4. `-Miso` (strict ISO Pascal mode) — verified directly, the identical `p := p + 1` code that compiled cleanly in FPC's default mode instead produced `Error: Operation "+" not supported for types "IntPtr" and "ShortInt"` under `-Miso`.
5. Because typed pointers only prevent assigning or dereferencing a pointer as the *wrong type* — they do nothing to prevent reading a field from a node that's already been `Dispose`d (a use-after-free), which is exactly why the correct freeing loop must save a node's `next` pointer before disposing that node, not after.
