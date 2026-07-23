# A2 — LangGraph: Stateful, Cyclic Agents

LCEL chains (A1) are directed acyclic graphs — data flows one direction, prompt to model to parser, once. Real agentic behavior frequently isn't shaped like that: an agent needs to loop ("keep trying until this succeeds, or five attempts pass"), branch ("if the tool call failed, retry; if it succeeded, continue"), and carry state across every step of that loop. LangGraph is LangChain's own answer to that specific gap — a genuinely different shape, not a bigger version of the same one.

## `StateGraph`: nodes, edges, and a real cycle

**Concept**

A `StateGraph` is built from a typed state schema, nodes (plain functions that take the current state and return updates to it), and edges connecting them — including *conditional* edges, where a function inspects the current state and decides which node runs next. Unlike an LCEL chain, an edge is allowed to point back to a node already visited — a real cycle, not just a longer straight line.

**Example**

Verified directly — a graph that increments a counter until it reaches 3, looping back to itself each time:

```python
from typing import TypedDict
from langgraph.graph import StateGraph, END

class State(TypedDict):
    count: int
    history: list

def increment(state: State) -> State:
    return {
        "count": state["count"] + 1,
        "history": state["history"] + [f"incremented to {state['count'] + 1}"],
    }

def should_continue(state: State) -> str:
    return "increment" if state["count"] < 3 else "done"

builder = StateGraph(State)
builder.add_node("increment", increment)
builder.set_entry_point("increment")
builder.add_conditional_edges("increment", should_continue, {"increment": "increment", "done": END})

graph = builder.compile()
result = graph.invoke({"count": 0, "history": []})
print(result)
```

```
{'count': 3, 'history': ['incremented to 1', 'incremented to 2', 'incremented to 3']}
```

Verified directly — the `"increment"` node's own conditional edge points back to itself, and the graph genuinely loops three times before `should_continue` routes to `END`. `history` accumulates across every pass through the loop, proving state is real and carried, not reset between iterations.

> **Pitfall / gotcha:** it's a real, easy mistake to write a conditional-edge function that never returns the value that routes to `END` — the graph above genuinely would loop forever (or until a real LLM call inside it eventually errors or exhausts a budget) if `should_continue`'s `state["count"] < 3` check were written wrong. Unlike a plain recursive Python function, there's no stack-depth error to catch this early — a broken termination condition in a real agent loop, with a real LLM making the decisions, can mean silently expensive, runaway API calls rather than a clean crash.

**Practice**

- Change `should_continue`'s condition to `state["count"] < 5` and confirm the graph now loops five times instead of three, with `history` correctly showing all five entries.
- Add a second node representing a "retry on failure" branch — a node that increments a `failure_count` and routes back to `increment` only if `failure_count` is below some limit, otherwise routing to `END` regardless of `count`. This is the actual shape most real agent retry logic takes.

## Why this is genuinely a different tool, not a bigger chain

**Concept**

LangChain's own documentation and this appendix agree on the same real distinction: LCEL is for a known, fixed sequence of steps; LangGraph is for a workflow whose actual path through the graph depends on runtime decisions — including the possibility of revisiting a step. An agent that calls a tool, checks whether the tool's result actually answered the question, and either finishes or tries a different tool is a graph, not a chain, in the precise sense verified above.

> **The direct, honest comparison to this series' own state-machine material:** the `should_continue` function here plays exactly the role a `case`/`match` dispatch on state plays in any language with real pattern matching — `rust/03-structs-enums-pattern-matching.md`'s `match` on an `enum`, or `erlang/02-multi-clause-functions-guards.md`'s multi-clause dispatch. LangGraph doesn't invent a new control-flow idea; it wraps a familiar one (a state machine, dispatched by a plain function) in a shape convenient for agent-building specifically.

**Practice**

- Draw (on paper, or in a comment) the state diagram for a three-step agent: fetch data, validate it, and either finish or retry the fetch up to twice on validation failure. Then implement it as a real `StateGraph` and verify it terminates correctly on both a success path and a max-retries path.

## Progress check

1. What's the real structural difference between an LCEL chain and a LangGraph `StateGraph`?
2. Verified directly: does a conditional edge in LangGraph allow routing back to an already-visited node? What did the verified example actually do with that capability?
3. What's the real risk of a conditional-edge function with a broken termination condition, compared to a broken termination condition in an ordinary recursive function?
4. What familiar control-flow concept, already covered elsewhere in this series, does a LangGraph conditional-edge function structurally match?

**Answers**

1. An LCEL chain is a fixed, one-directional sequence — prompt to model to parser, once. A `StateGraph` allows genuine cycles — an edge can route back to a node already visited, letting a workflow loop until some runtime condition is met.
2. Yes — verified directly, the example graph's own `"increment"` node routes back to itself, looping three times before terminating, with `history` accumulating correctly across every pass.
3. An ordinary broken recursive function typically crashes cleanly with a stack-depth error. A broken LangGraph termination condition has no such natural limit — especially with a real LLM making the routing decisions inside the loop, it can mean silently expensive, runaway behavior rather than a clean, early crash.
4. A `match`/`case`-style dispatch on the current state — the same shape `rust/03-structs-enums-pattern-matching.md`'s `match` on an `enum` or `erlang/02-multi-clause-functions-guards.md`'s multi-clause dispatch already established, just wrapped in a shape convenient for agent-building.
