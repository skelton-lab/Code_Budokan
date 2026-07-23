from code_rookie_python.pipeline import parse_lines, totals_by_category, Transaction


def test_parse_lines_basic():
    lines = ["Alice, 50.0, hardware"]
    result = list(parse_lines(lines))
    assert result == [Transaction("Alice", 50.0, "hardware")]


def test_totals_excludes_below_minimum():
    transactions = [
        Transaction("Alice", 50.0, "hardware"),
        Transaction("Bob", 15.0, "hardware"),
    ]
    totals = totals_by_category(iter(transactions))
    assert totals == {"hardware": 50.0}


def test_totals_sums_same_category():
    transactions = [
        Transaction("Alice", 50.0, "hardware"),
        Transaction("Dave", 30.0, "hardware"),
    ]
    totals = totals_by_category(iter(transactions))
    assert totals["hardware"] == 80.0


def test_boundary_amount_is_included():
    from code_rookie_python.pipeline import Transaction, totals_by_category
    transactions = [Transaction("Eve", 20.0, "hardware")]
    totals = totals_by_category(iter(transactions))
    assert totals == {"hardware": 20.0}


def test_empty_input():
    from code_rookie_python.pipeline import totals_by_category
    totals = totals_by_category(iter([]))
    assert totals == {}
