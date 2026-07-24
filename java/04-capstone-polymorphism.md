# Capstone 1 — A Shape Inventory

Proves Module 3 together: multiple interface implementations, default-method usage and override side by side, and polymorphism doing real work — totaling, finding a maximum, and sorting a mixed collection through one shared interface type.

## The build

```java
import java.util.ArrayList;
import java.util.List;
import java.util.Comparator;

interface Shape {
    double area();
    String name();
    default String describe() {
        return String.format("%s: area=%.2f", name(), area());
    }
}

class Circle implements Shape {
    private final double radius;
    Circle(double radius) { this.radius = radius; }
    public double area() { return Math.PI * radius * radius; }
    public String name() { return "Circle(r=" + radius + ")"; }
}

class Rectangle implements Shape {
    protected final double width, height;
    Rectangle(double width, double height) { this.width = width; this.height = height; }
    public double area() { return width * height; }
    public String name() { return "Rectangle(" + width + "x" + height + ")"; }
}

class Triangle implements Shape {
    private final double base, height;
    Triangle(double base, double height) { this.base = base; this.height = height; }
    public double area() { return 0.5 * base * height; }
    public String name() { return "Triangle(base=" + base + ",h=" + height + ")"; }
    @Override
    public String describe() { return "A triangle with area " + String.format("%.2f", area()); }
}

public class ShapeInventory {
    public static void main(String[] args) {
        List<Shape> shapes = new ArrayList<>();
        shapes.add(new Circle(2.0));
        shapes.add(new Rectangle(3.0, 4.0));
        shapes.add(new Triangle(6.0, 2.0));
        shapes.add(new Circle(1.0));

        System.out.println("=== Report ===");
        for (Shape s : shapes) {
            System.out.println(s.describe());
        }

        double total = 0;
        for (Shape s : shapes) total += s.area();
        System.out.printf("Total area: %.2f%n", total);

        Shape largest = shapes.get(0);
        for (Shape s : shapes) {
            if (s.area() > largest.area()) largest = s;
        }
        System.out.println("Largest: " + largest.name());

        shapes.sort(Comparator.comparingDouble(Shape::area));
        System.out.println("=== Sorted by area ===");
        for (Shape s : shapes) System.out.println(s.name());
    }
}
```

## Verified

```
=== Report ===
Circle(r=2.0): area=12.57
Rectangle(3.0x4.0): area=12.00
A triangle with area 6.00
Circle(r=1.0): area=3.14
Total area: 33.71
Largest: Circle(r=2.0)
=== Sorted by area ===
Circle(r=1.0)
Triangle(base=6.0,h=2.0)
Rectangle(3.0x4.0)
Circle(r=2.0)
```

Notice the report: `Circle` and `Rectangle` both print through `Shape`'s own default `describe()` (`"%s: area=%.2f"`), while `Triangle`'s own overridden version prints its own distinct format — three concrete classes, one loop, no `if`/`instanceof` branching anywhere to tell them apart. `Comparator.comparingDouble(Shape::area)` sorts the *same* mixed `List<Shape>` correctly by calling each element's own real `area()` implementation, method reference syntax standing in for a lambda calling straight through the interface.

> **Pitfall:** the `largest` search and the manual totaling loop both call `s.area()` fresh, every time, rather than caching it — for these simple, side-effect-free implementations that's harmless, but it's worth noticing directly: nothing here stops an `area()` implementation from being expensive, and this capstone doesn't need to worry about that only because none of `Circle`/`Rectangle`/`Triangle` do real work inside `area()` beyond arithmetic.

## Extend it yourself

- Add a `Square` class extending `Rectangle` (a real subclass, not just another `implements Shape`) whose constructor takes one side length and calls `super(side, side)` — confirm it still slots into the same `List<Shape>` and sorts correctly alongside everything else.
- Add a second `Comparator` sorting by `name()` alphabetically instead of by area, and print both orderings back to back.
