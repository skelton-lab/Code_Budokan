# Capstone 1 — Multiple Dispatch: A Polymorphic Library

Combines every concept from Modules 1–2: a collision system for three game object types, where the correct behavior depends on *both* colliding objects' types together — the canonical real-world case multiple dispatch was designed for, and the concrete argument for why it's a genuinely useful capability, not just an academic curiosity.

## Why this problem specifically needs multiple dispatch

Every single-dispatch mechanism this series has covered (Racket's `send`, Smalltalk/Ruby's message sends, C++'s `virtual`) resolves behavior based on **one** object — the receiver. A collision between an `Asteroid` and a `Ship` genuinely needs behavior depending on **both** types together, and neither object is more naturally "the receiver" than the other — a single-dispatch system needs an artificial workaround (the classic "visitor pattern," or checking the other object's type by hand inside the method) to express this cleanly at all.

## The system

```julia
abstract type GameObject end
struct Asteroid <: GameObject
    size::Int
end
struct Ship <: GameObject
    name::String
end
struct Bullet <: GameObject
    damage::Int
end

collide(a::Asteroid, b::Asteroid) = "Two asteroids drift apart harmlessly"
collide(a::Asteroid, s::Ship) = "$(s.name) crashes into a size-$(a.size) asteroid and is destroyed!"
collide(s::Ship, a::Asteroid) = collide(a, s)
collide(a::Asteroid, b::Bullet) = "Asteroid (size $(a.size)) is hit for $(b.damage) damage"
collide(b::Bullet, a::Asteroid) = collide(a, b)
collide(s1::Ship, s2::Ship) = "$(s1.name) and $(s2.name) collide — both damaged"
collide(s::Ship, b::Bullet) = "$(s.name) takes $(b.damage) damage"
collide(b::Bullet, s::Ship) = collide(s, b)
collide(b1::Bullet, b2::Bullet) = "Bullets pass through each other"
```

Nine methods, one per ordered pair of the three types — genuinely each a distinct rule, not variations on a theme. The reversed-order methods (`collide(s::Ship, a::Asteroid) = collide(a, s)`) are a real, deliberate design choice: rather than duplicating logic, they simply delegate to the already-defined canonical ordering — a one-line method body, still a genuine, separate dispatch target.

## Verification

```julia
objects = [Asteroid(5), Ship("Enterprise"), Bullet(10)]

for i in 1:length(objects)
    for j in (i+1):length(objects)
        println(collide(objects[i], objects[j]))
    end
end
```

```
Enterprise crashes into a size-5 asteroid and is destroyed!
Asteroid (size 5) is hit for 10 damage
Enterprise takes 10 damage
```

Verified directly against all three unique pairs from a three-object list: `Asteroid`-`Ship` correctly destroys the ship; `Asteroid`-`Bullet` correctly damages the asteroid; `Ship`-`Bullet` correctly damages the ship — each resolved to its own specific method purely from the pair of runtime types involved, with no `if`/`isa` type-checking written anywhere in the calling code (the nested loop) at all.

> **The actual point of this capstone:** this is the concrete case where multiple dispatch earns its complexity — a version of this system in a single-dispatch language would need either a large `if`/`elseif` chain checking both objects' types by hand inside one giant `collide` method, or the double-dispatch "visitor pattern" workaround, adding real indirection specifically to route around single dispatch's own limitation. Julia's multiple dispatch expresses the *actual* structure of the problem — nine distinct rules for nine distinct type pairs — directly, as nine separate, independently readable method definitions.

> **Pitfall:** every ordered pair needs its own method (or an explicit delegation to the canonical order, as used here) — there's no automatic "commutativity" Julia infers on your behalf. Defining `collide(a::Asteroid, s::Ship)` alone, with no matching `collide(s::Ship, a::Asteroid)`, would leave `collide(someShip, someAsteroid)` unresolved, producing a real `MethodError` the moment that specific argument order is actually called.

## Extending it yourself

- Add a fourth type, `Mine`, and write its collision methods against all three existing types — notice this requires four *new* methods (one per existing type), not a change to any of the nine methods already written.
- Remove one of the delegation methods (say, `collide(b::Bullet, s::Ship) = collide(s, b)`) and confirm calling `collide` with that specific argument order produces a real `MethodError`, naming exactly which combination is missing.
