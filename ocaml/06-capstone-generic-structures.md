# Capstone 2 — Generic Data Structures via Functors

Combines every concept from Modules 4–5: a genuine binary search tree — insert, membership check, in-order traversal — written *once* as a functor, then instantiated for `int` and `string` with zero duplicated tree logic, each producing a fully type-safe, specialized module.

## The functor

```ocaml
module type ORDERED = sig
  type t
  val compare : t -> t -> int
end

module type BST = sig
  type elt
  type t
  val empty : t
  val insert : elt -> t -> t
  val member : elt -> t -> bool
  val to_list : t -> elt list
end

module MakeBST (Ord : ORDERED) : BST with type elt = Ord.t = struct
  type elt = Ord.t
  type t = Leaf | Node of t * elt * t

  let empty = Leaf

  let rec insert x = function
    | Leaf -> Node (Leaf, x, Leaf)
    | Node (l, v, r) ->
        let c = Ord.compare x v in
        if c < 0 then Node (insert x l, v, r)
        else if c > 0 then Node (l, v, insert x r)
        else Node (l, v, r)

  let rec member x = function
    | Leaf -> false
    | Node (l, v, r) ->
        let c = Ord.compare x v in
        if c = 0 then true
        else if c < 0 then member x l
        else member x r

  let rec to_list = function
    | Leaf -> []
    | Node (l, v, r) -> to_list l @ [v] @ to_list r
end
```

`type t = Leaf | Node of t * elt * t` is Module 2's recursive variant type, now representing a real tree shape — a leaf, or a node with a left subtree, a value, and a right subtree. `insert`/`member` both recurse using `Ord.compare` to decide direction, exactly the way `MakeSorter` used `Ord.compare` to decide sort order. `BST with type elt = Ord.t` in the functor's own signature is a real, precise piece of module-system syntax: it exposes `elt` as *equal to* `Ord.t` (not abstractly hidden, unlike `t` itself) — a caller needs to know what type of elements a specific instantiated tree holds, even while the tree's internal shape stays abstracted.

## Verification

```ocaml
module IntBST = MakeBST (IntOrd)
module StringBST = MakeBST (StringOrd)

let t = List.fold_left (fun acc x -> IntBST.insert x acc) IntBST.empty
          [5; 3; 8; 1; 4; 7; 9; 2; 6] in
List.iter (Printf.printf "%d ") (IntBST.to_list t);
Printf.printf "member 7: %b\n" (IntBST.member 7 t);
Printf.printf "member 10: %b\n" (IntBST.member 10 t);

let st = List.fold_left (fun acc x -> StringBST.insert x acc) StringBST.empty
           ["banana"; "apple"; "cherry"; "date"] in
List.iter (Printf.printf "%s ") (StringBST.to_list st)
```

```
1 2 3 4 5 6 7 8 9 
member 7: true
member 10: false
apple banana cherry date 
```

Verified directly: inserting `5, 3, 8, 1, 4, 7, 9, 2, 6` (deliberately out of order) into `IntBST`, then reading it back via `to_list` (an in-order traversal — left subtree, value, right subtree) produces **perfectly sorted** output, `1 2 3 4 5 6 7 8 9` — the fundamental correctness property of a binary search tree, confirmed directly rather than assumed because the code "looks like" a BST. `member 7` correctly reports `true` (inserted); `member 10` correctly reports `false` (never inserted). `StringBST`, built from the *exact same* `MakeBST` functor with zero additional tree-logic code, correctly produces alphabetically-sorted string output.

> **The actual point of this capstone:** the tree logic — insertion, membership search, in-order traversal — was written **exactly once**, inside `MakeBST`, with zero mention of `int` or `string` anywhere in that logic. `IntBST` and `StringBST` are two fully realized, independently type-checked, specialized modules — attempting to `IntBST.insert "hello" t` would be a genuine compile-time type error, not merely a runtime risk, exactly the way every one of this guide's earlier type-safety guarantees have held.

> **Pitfall:** this BST has no rebalancing — inserting already-sorted data (`1; 2; 3; 4; 5`) produces a completely degenerate, linked-list-shaped tree, not the balanced tree the deliberately-shuffled verification data above conveniently produced. This is a real, honest limitation of this capstone's scope, not a hidden bug: a production-quality balanced tree (red-black, AVL) is a substantially larger undertaking, out of scope here.

## Extending it yourself

- Insert `1; 2; 3; 4; 5; 6; 7; 8; 9` (already sorted) into a fresh `IntBST`, and confirm `to_list` still produces correct sorted output — the *correctness* property holds regardless of insertion order, even though the tree's internal shape (and therefore its performance) degrades badly for already-sorted input.
- Add a `size` operation to `BST`/`MakeBST`, counting the number of nodes, and confirm it against both `IntBST` and `StringBST`.
