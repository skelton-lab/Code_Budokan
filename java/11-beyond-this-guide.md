# Module 11 — Beyond This Guide

Real topics that don't trace to any of this guide's four capstones — named directly, not silently dropped.

### Streams and lambdas

**What it is:** `Collection.stream()` opens a pipeline of `filter`/`map`/`collect`-style operations over a collection, combined with lambda expressions — Java's own concise syntax for the same "pass a function as a value" idea `python/`'s comprehensions, `ruby/`'s blocks, and `javascript/`'s arrow functions all cover from their own languages' angles.

**Minimal taste:**
```java
List<Integer> evenSquares = nums.stream()
    .filter(n -> n % 2 == 0)
    .map(n -> n * n)
    .collect(Collectors.toList());
```

**Why it's a signpost:** none of this guide's four capstones needed a data-transformation pipeline substantial enough to justify Streams over a plain loop — but any real, current Java code beyond a small program leans on them heavily, alongside Module 3's own functional-interface material (`Predicate<T>` in Capstone 3 is already half of this).

**Where to go next:** [Oracle's own Streams tutorial](https://docs.oracle.com/javase/tutorial/collections/streams/).

### Records

**What it is:** `record Point(double x, double y) { }` — a compact class declaration that auto-generates a constructor, accessors, `equals()`, `hashCode()`, and `toString()`, all based on structural equality of the declared fields (added in Java 16).

**Minimal taste:**
```java
record Point(double x, double y) {}
Point p = new Point(3.0, 4.0);
System.out.println(p);              // Point[x=3.0, y=4.0]
System.out.println(p.equals(new Point(3.0, 4.0)));  // true
```

**Why it matters:** this is the closest Java analogue to Python's `@dataclass` (`python/04-dataclasses-typing.md`) — the same "stop hand-writing constructors and `equals()`" motivation, verified here to genuinely produce structural equality automatically, not just a shorter class declaration.

**Where to go next:** [JEP 395](https://openjdk.org/jeps/395), the original records proposal.

### Virtual threads (Project Loom)

**What it is:** `Thread.ofVirtual().start(...)` — lightweight, JVM-managed threads (finalized in Java 21) that can be created by the thousands or millions without the memory/scheduling cost of one OS thread each, a real, current answer to the same "how do you handle massive concurrency cheaply" question `erlang/`'s actor-model lightweight processes and `go/`'s goroutines both already answer from different directions.

**Minimal taste:**
```java
Thread vt = Thread.ofVirtual().start(() -> {
    System.out.println("Running on: " + Thread.currentThread());
});
vt.join();
```
Verified directly: `Running on: VirtualThread[#27]/runnable@ForkJoinPool-1-worker-1` — a real virtual thread, not a regular OS thread wearing a new name.

**Why it's a signpost:** none of this guide's capstones needed concurrency at all — a genuinely large, separate subject on its own, and Java's own answer to it deserves the same depth `erlang/`'s and `go/`'s dedicated concurrency material got, not a rushed add-on here.

**Where to go next:** [JEP 444](https://openjdk.org/jeps/444), the finalized virtual threads proposal.

### Spring (and Spring Boot)

**What it is:** the dominant Java web/enterprise framework — dependency injection, an ORM layer (Spring Data JPA), a full web MVC stack, and enough surrounding tooling that "Spring" and "enterprise Java" are near-synonyms in current practice.

**Why it's a signpost, not a module:** this series already has two full framework-capstone-guides making exactly this "a framework automates what you'd otherwise write by hand" point — `rails/` for Ruby/SQL, and `php/`'s own PDO-and-sessions capstone naming the identical relationship. A third, structurally similar build for Spring would repeat the lesson in a third syntax rather than teach a new one.

**Where to go next:** [Spring's own official guides](https://spring.io/guides), particularly "Building a RESTful Web Service" as the closest analogue to this guide's own Capstone 2/4 material.

### Java on Android — a real, now-historical relationship

**What it is:** Android's original application layer was written against the Java language and a large subset of its standard library (though running on Google's own Dalvik/ART runtime, not a standard JVM) — for roughly a decade, "Android development" and "Java development" overlapped enormously, before Google named Kotlin its preferred language in 2017 and Kotlin has since become the default for new Android projects.

**Why it matters:** this is a genuinely significant, verifiable historical fact about where Java's own reach extended, distinct from (and much larger in raw device count than) the JVM-server-and-desktop story this guide otherwise focuses on.

**Where to go next:** the [Android developer documentation's own language history](https://developer.android.com/kotlin/first) names this transition directly.

### Build tools: Maven and Gradle

**What it is:** this guide's own capstones compiled and ran with bare `javac`/`java`/`jar` — real, and genuinely how a small program can be built — but any multi-file, dependency-having, multi-module real Java project uses Maven (XML-configured) or Gradle (Groovy/Kotlin-DSL-configured) instead, both handling dependency resolution, "fat jar" packaging (Capstone 4's own pitfall, solved properly), and multi-module builds.

**Why it's a signpost:** none of this guide's capstones had an external dependency to manage — the moment one exists, `javac`/`jar` by hand becomes real, quickly-mounting friction these tools exist specifically to remove, the same relationship `python/`'s `uv`/`pyproject.toml` and `php/`'s Composer have to their own languages' equivalent problem.

**Where to go next:** [Maven's own "Getting Started" guide](https://maven.apache.org/guides/getting-started/) — the more widely deployed of the two in existing (older) enterprise codebases, Gradle more common in newer Android/Kotlin-adjacent projects.
