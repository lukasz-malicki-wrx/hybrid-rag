#!/usr/bin/env bash
# Uploads every PDF in samples/ to the running API and waits until they are ready.
set -euo pipefail

API="${API_URL:-http://localhost:8000}"
WAIT_SECONDS="${WAIT_SECONDS:-600}"  # CPU indexing can take several minutes per large PDF
DIR="$(cd "$(dirname "$0")/.." && pwd)/samples"

shopt -s nullglob
files=("$DIR"/*.pdf)
[[ ${#files[@]} -gt 0 ]] || { echo "no PDFs in $DIR (run scripts/fetch_samples.sh to restore them)" >&2; exit 1; }

for f in "${files[@]}"; do
  curl -fsS -o /dev/null -F "file=@$f" "$API/documents"
  echo "uploaded $(basename "$f")"
done

echo -n "waiting for processing (up to ${WAIT_SECONDS}s)"
deadline=$((SECONDS + WAIT_SECONDS))
while true; do
  pending=$(curl -fsS "$API/documents" | python3 -c "import sys,json; print(sum(d['status']=='processing' for d in json.load(sys.stdin)))")
  [[ "$pending" == "0" ]] && break
  if (( SECONDS >= deadline )); then
    echo
    echo "timeout: $pending document(s) still processing; they keep running in the background" >&2
    break
  fi
  echo -n "."; sleep 3
done
echo
curl -fsS "$API/documents" | python3 -c "
import sys, json
for d in json.load(sys.stdin):
    print(f\"{d['filename']:28} v{d['version']} {d['status']:10} pages={d['pages']}\")"
