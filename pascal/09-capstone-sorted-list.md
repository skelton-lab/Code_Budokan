# Module 9 — Capstone 4: A Sorted Linked List

**Proves:** typed pointers, `New`/`Dispose`, and a self-referencing record type, combined into a linked list that maintains a genuine invariant — sorted order — across every insertion, not just a static structure built once (Module 8).

Six values, inserted one at a time in a deliberately scrambled order (`5, 2, 8, 1, 9, 3`), with the list printed after every single insertion — verifying not just the final result, but that sorted order held at every intermediate step along the way. Every result below is a real, verified `fpc` compile-and-run.

## The program

```pascal
type
  NodePtr = ^Node;
  Node = record
    value: integer;
    next: NodePtr;
  end;

procedure InsertSorted(var head: NodePtr; v: integer);
var
  newNode, cur, prev: NodePtr;
begin
  New(newNode);
  newNode^.value := v;

  if (head = nil) or (head^.value >= v) then
  begin
    newNode^.next := head;
    head := newNode;
  end
  else
  begin
    prev := head;
    cur := head^.next;
    while (cur <> nil) and (cur^.value < v) do
    begin
      prev := cur;
      cur := cur^.next;
    end;
    newNode^.next := cur;
    prev^.next := newNode;
  end;
end;
```

`head` is a `var` parameter (Module 2's exact mechanism) specifically because `InsertSorted` sometimes needs to replace the list's head entirely (inserting a new smallest value) — a plain value parameter would let the procedure modify its own local copy of the pointer without ever changing what the *caller's* `head` variable actually points to. The two-pointer walk (`prev`/`cur`) is the standard technique for inserting into the *middle* of a singly-linked list: `cur` finds where the new node belongs, while `prev` stays one step behind so the new node can be spliced in between `prev` and `cur` without losing the rest of the list.

## Verified run

```pascal
var
  values: array[1..6] of integer = (5, 2, 8, 1, 9, 3);
begin
  for i := 1 to 6 do
  begin
    InsertSorted(head, values[i]);
    write('after inserting ', values[i], ': ');
    PrintList(head);
  end;
end.
```

Verified output:

```
after inserting 5: 5
after inserting 2: 2 5
after inserting 8: 2 5 8
after inserting 1: 1 2 5 8
after inserting 9: 1 2 5 8 9
after inserting 3: 1 2 3 5 8 9
```

Every intermediate state is genuinely sorted — not just the final list. `2` correctly inserts before `5` (the head-replacement branch); `8` correctly appends after `5` (the middle/end-insertion branch, with `cur` reaching `nil`); `1` again replaces the head; `9` appends at the true end; and `3`, the final and most demanding insertion, correctly lands in the middle of an already-multi-element list (between `2` and `5`), exercising the full `prev`/`cur` walk rather than either special case.

> **Pitfall:** `(head = nil) or (head^.value >= v)` relies on Pascal's short-circuit evaluation of `or` for boolean expressions specifically — if `head` is `nil`, the second condition (`head^.value >= v`) would dereference a `nil` pointer and crash, and this line depends on `head = nil` being checked *first*, short-circuiting before that dereference is ever attempted. Reversing the order of the two conditions (`head^.value >= v or (head = nil)`) would introduce exactly the risk Module 8's uninitialized-pointer pitfall demonstrated directly — a crash the moment the list is empty.

## Practice

- Confirm directly that Pascal's `or` genuinely short-circuits here — temporarily reverse the two conditions' order and confirm inserting into an empty list now crashes with a runtime error, then restore the correct order.
- Add a seventh value, `5` (a duplicate of the first value inserted), and confirm `InsertSorted` places it correctly relative to the existing `5` — does it insert before, after, or does the behavior depend on which branch of the `if` first triggers for an equal value?
- Write a `Contains(head: NodePtr; v: integer): boolean` function that takes advantage of the list already being sorted — it can stop searching (return `false`) the moment it passes a node whose value exceeds `v`, without walking the entire remaining list. Verify it correctly returns `true` for `5` and `false` for `4` against this capstone's final six-element list.
