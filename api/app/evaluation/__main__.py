import argparse
import json
from pathlib import Path

from .runner import MODES, format_markdown, run


def main() -> None:
    parser = argparse.ArgumentParser(description="Evaluate retrieval: hit@k and MRR per mode.")
    parser.add_argument("--dataset", type=Path, default=Path("eval/questions.json"))
    parser.add_argument("--modes", nargs="+", default=list(MODES), choices=MODES)
    parser.add_argument("--k", type=int, default=10)
    parser.add_argument("--json", type=Path, help="also write raw ranks to this file")
    parser.add_argument("--misses", action="store_true", help="list questions each mode missed")
    args = parser.parse_args()

    report = run(args.dataset, tuple(args.modes), args.k)
    print(format_markdown(report))
    if args.misses:
        for mode in report.modes:
            missed = [cid for cid, r in report.ranks[mode].items() if r is None or r > 3]
            print(f"{mode}: not in top 3 -> {', '.join(missed) or 'none'}")
            leaked = [cid for cid, ok in report.rejected[mode].items() if not ok]
            print(f"{mode}: unanswerable but returned results -> {', '.join(leaked) or 'none'}")
    if args.json:
        args.json.write_text(
            json.dumps({"ranks": report.ranks, "rejected": report.rejected}, indent=2)
        )


if __name__ == "__main__":
    main()
