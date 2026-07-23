# A1 — LangChain: Chains and Tools

LangChain's core idea, still true across every one of its major version changes: wrap an LLM call in the same composable-pipeline shape this series has already seen in other guises — Unix pipes, `sql/`'s query chains, `python/`'s iterator adaptors — so a prompt, a model call, and a parser compose with a single operator rather than three separate function calls threaded together by hand.

## LCEL: `prompt | model | parser`

**Concept**

LangChain Expression Language (LCEL) overloads `|` so a `ChatPromptTemplate`, a chat model, and an output parser compose into a single `Runnable` — `chain.invoke(...)` runs all three in sequence, passing each stage's output to the next.

**Example**

Verified directly, using `FakeListChatModel` — a deterministic stand-in that returns a fixed response, specifically so the *chain's wiring* is what gets verified, not any particular model's actual output:

```python
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import StrOutputParser
from langchain_core.language_models.fake_chat_models import FakeListChatModel

fake_llm = FakeListChatModel(responses=["Fortran (1957) was the first widely-used high-level language."])

prompt = ChatPromptTemplate.from_messages([
    ("system", "You are a terse programming-history assistant."),
    ("user", "{question}"),
])

chain = prompt | fake_llm | StrOutputParser()
result = chain.invoke({"question": "What was the first high-level language?"})
print(result)
```

```
Fortran (1957) was the first widely-used high-level language.
```

Verified directly, and worth being precise about rather than approximate: `result` is not a plain Python `str` — its real type is `langchain_core.messages.base.TextAccessor`, confirmed via `type(result).__mro__`. It *is* a genuine `str` subclass (`isinstance(result, str)` is `True`, and `.upper()`, `len()`, and `==` against a plain string all work exactly as expected) — but `type(result) is str` is `False`. Harmless for almost every real use, worth knowing exactly if something ever does strict type-checking against it.

> **Pitfall / gotcha:** LangChain spent years at version `0.x` while its own API surface changed repeatedly underneath tutorials written against earlier releases — it only reached a stable `1.0` recently. LCEL's `|` syntax is itself a relatively late addition, replacing an earlier, more verbose `LLMChain` class-based pattern; a lot of still-circulating LangChain content predates it.

**Practice**

- Swap `FakeListChatModel(responses=[...])` for `FakeListChatModel(responses=["first", "second"])` and call `chain.invoke(...)` twice — confirm it returns each response in order, then a third call to see what happens once the list is exhausted.
- Add a second prompt variable and confirm the chain fails clearly if `chain.invoke(...)` is called without providing it.

## `@tool`: automatic introspection

**Concept**

`@tool`-decorating a plain Python function turns it into something an LLM-driven agent can be given as a callable capability — LangChain inspects the function's name, its docstring, and its type-hinted parameters to build the tool's schema automatically, rather than requiring that schema to be hand-written separately.

**Example**

Verified directly:

```python
from langchain_core.tools import tool

@tool
def get_language_year(name: str) -> str:
    """Look up the year a programming language first appeared."""
    years = {"fortran": "1957", "cobol": "1959", "algol": "1960"}
    return years.get(name.lower(), "unknown")

print(get_language_year.name)          # get_language_year
print(get_language_year.description)   # Look up the year a programming language first appeared.
print(get_language_year.args)          # {'name': {'title': 'Name', 'type': 'string'}}
print(get_language_year.invoke({"name": "Fortran"}))   # 1957
```

The name, description, and argument schema are all derived — not hand-written — directly from the function signature and its own docstring. This is the same category of technique this series' own metaprogramming thread has already named precisely: `ruby/06-metaprogramming.md`'s `define_method`, and `rails/02-scaffolding-models-migrations-dynamic-accessors.md`'s traced ActiveRecord accessor generation — code that inspects other code to generate structure, rather than requiring that structure to be written twice.

> **Pitfall / gotcha:** the docstring isn't decorative — it's the actual text an LLM sees when deciding whether and how to call this tool. A vague or missing docstring doesn't just fail to document the function for a human reader; it degrades the calling model's own ability to pick the right tool, silently, with no error raised anywhere.

**Practice**

- Write a second `@tool`-decorated function with a deliberately vague docstring (`"""Does stuff."""`) and compare its `.description` output to the precise one above — read both back and judge, as a human, which one you'd pick correctly from a list of ten similar tools with no other context.
- Add a second, optional parameter with a default value and verify directly how `.args` represents it differently from the required `name` parameter.

## Progress check

1. What does LCEL's `|` operator actually do, mechanically, when chaining `prompt | model | parser`?
2. Verified directly: is a chain's final string output a plain Python `str`? What's the practical consequence of the real answer?
3. Why was `FakeListChatModel` used for verification instead of a real API call, and what specifically does that choice let this appendix honestly claim?
4. What does `@tool` derive automatically from a decorated function, and from what three sources?
5. What real, silent consequence follows from a `@tool`-decorated function having a vague docstring?

**Answers**

1. It composes each stage into a single `Runnable`, so `.invoke(...)` passes the prompt template's rendered output into the model, and the model's output into the parser, in sequence — no manual glue code threading the three together.
2. No — verified directly, it's a `TextAccessor`, a genuine `str` subclass. The practical consequence: equality, `.upper()`, `len()`, and virtually every normal string operation work identically to a plain `str`, but `type(result) is str` would be `False`.
3. Because it's deterministic and free — the same input always produces the same output, with no API cost, no rate limit, and no dependency on a specific model's current behavior. This appendix can honestly claim the chain's *wiring* is verified, without overclaiming anything about what a real LLM would actually say.
4. The tool's name (from the function name), its description (from the docstring), and its argument schema (from the function's type-hinted parameters) — all three derived automatically, none hand-written separately.
5. The calling LLM's ability to choose the right tool, or to call it with correct arguments, degrades — silently, with no error raised, since the docstring is live input to the model's own decision-making, not just documentation for a human reader.
