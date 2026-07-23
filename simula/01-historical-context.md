# Module 1 — Historical Context

Why Simula exists, what it was actually built to do, and — independently verifiable, unlike almost everything else in this guide — exactly what Bjarne Stroustrup says it did to him.

## Nygaard, Dahl, and why "SIMULA"

**You'll be able to:** state what problem Simula was originally built to solve, and why that problem shaped the class concept.

**Concept, documented:**

Simula was created by **Ole-Johan Dahl** and **Kristen Nygaard** at the Norwegian Computing Center in Oslo, starting in the early 1960s. **Simula I** (1965) was built for a specific, narrower purpose than "general programming": **discrete-event simulation** — modeling systems made of many independent entities (ships arriving at a harbor, customers in a queue, machines on a factory floor) whose states change at distinct points in time, each acting somewhat independently of the others. The name is literally "SIMU-lation LA-nguage."

**Simula 67** (1967) generalized what Simula I had built for simulation specifically into a general-purpose language feature: the `class`. Both Dahl and Nygaard later received the **2001 ACM Turing Award** jointly, explicitly for this — "for ideas fundamental to the emergence of object-oriented programming." Simula 67 is the version historically credited as the first object-oriented programming language, and it's the version this guide is actually about.

> **Why this origin matters, not just as trivia:** a "class" in Simula's original context wasn't an abstract organizational tool invented in a vacuum — it was the natural shape of "one independent, stateful entity in a simulated system." A `Ship` class, a `Customer` class, a `Machine` class — each instance genuinely modeling one thing in a simulation, with its own state and its own behavior over time. The object-oriented metaphor ("objects" as independent, stateful things you send messages to or call procedures on) traces directly back to this: it's a metaphor about simulating real, independent entities, generalized into a programming technique.

**Practice**

- Before continuing, write one sentence connecting "simulating independent real-world entities" to "objects with their own state," in your own words — you'll want this framing fresh for Module 2.

## Stroustrup's own account — independently verifiable

**You'll be able to:** cite, specifically, what Bjarne Stroustrup says Simula gave him that C didn't have.

**Concept, sourced directly from Stroustrup's own published writing (*The Design and Evolution of C++*, 1994; "A History of C++: 1979–1991," HOPL-II, 1993):**

Stroustrup encountered Simula during his PhD work at Cambridge in the mid-1970s, working on distributed systems simulation — genuinely the same problem domain Simula was originally built for. He has stated repeatedly, in his own words across multiple publications, that Simula's class concept gave him a way to organize a simulation's structure that he found genuinely superior for *thinking about the problem*, but Simula itself (running on the hardware and in the performance-constrained contexts he needed) was too slow for the systems-level work he was doing. The specific combination he wanted — Simula's organizational power, C's raw performance and closeness to the machine — didn't exist. Building it became "C with Classes," starting around 1979–1980.

> **This is worth reading as a real design tension, not just an origin story:** Stroustrup wasn't choosing Simula's ideas over C's because one was "better" — he wanted both, specifically because neither language alone gave him what the problem needed. This exact tension (organizational clarity vs. raw performance) is still the central design conversation in systems programming language design today, decades later.

**Practice**

- Look up Stroustrup's own HOPL-II paper if you want the primary source directly, rather than this guide's summary of it — it's a widely available, frequently cited historical document in computer science, and worth reading once in full for how directly he states the Simula connection himself.

## Progress check

1. What specific problem was Simula I originally built to solve?
2. What does "SIMULA" literally stand for?
3. What Turing Award citation did Dahl and Nygaard jointly receive, and for what?
4. What does Simula's class concept's connection to "simulating independent entities" explain about why objects have their own private state?
5. What two things did Stroustrup specifically say he wanted, that neither Simula nor C alone provided?

### Answers

1. Discrete-event simulation — modeling systems made of many independent, stateful entities whose states change at distinct points in time.
2. SIMUlation LAnguage.
3. The 2001 ACM Turing Award, "for ideas fundamental to the emergence of object-oriented programming."
4. Each simulated entity (a ship, a customer, a machine) is naturally independent and stateful in the real system being modeled — the class concept generalizes that same shape (independent, stateful "things") into a general programming technique, which is why an object's state being its own, private to it, was the natural default from the very beginning of the idea.
5. Simula's class-based organizational clarity (which he found genuinely better for structuring a simulation's design) and C's raw performance and closeness to the machine (which Simula itself couldn't provide for his systems-level work) — the combination that didn't exist yet, and that became "C with Classes."
