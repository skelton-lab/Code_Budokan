from dataclasses import dataclass
from collections.abc import Iterator


@dataclass(frozen=True)
class Transaction:
    customer: str
    amount: float
    category: str


def parse_lines(lines: list[str]) -> Iterator[Transaction]:
    for line in lines:
        customer, amount, category = line.split(",")
        yield Transaction(customer.strip(), float(amount), category.strip())


def totals_by_category(transactions: Iterator[Transaction], min_amount: float = 20.0) -> dict[str, float]:
    totals: dict[str, float] = {}
    for t in transactions:
        if t.amount < min_amount:
            continue
        totals[t.category] = totals.get(t.category, 0.0) + t.amount
    return totals
