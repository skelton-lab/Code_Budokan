import argparse
import sys

from code_rookie_python.pipeline import parse_lines, totals_by_category


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(prog="report", description="Summarize transactions by category.")
    parser.add_argument("file", help="Path to a CSV-like file of customer,amount,category lines")
    parser.add_argument("--min-amount", type=float, default=20.0, help="Ignore transactions below this amount")
    return parser


def run(file_path: str, min_amount: float) -> dict[str, float]:
    with open(file_path) as f:
        lines = f.readlines()
    transactions = parse_lines(lines)
    return totals_by_category(transactions, min_amount)


def main(argv: list[str] | None = None) -> int:
    parser = build_parser()
    args = parser.parse_args(argv)
    totals = run(args.file, args.min_amount)
    for category, total in sorted(totals.items()):
        print(f"{category}: {total:.2f}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
