#!/usr/bin/env bash
# Re-downloads the sample documents into samples/ if a file is missing.
# The PDFs are committed to the repo (see samples/SOURCES.md), so this is only needed to
# restore a deleted file or to refresh from the publishers' sites.
set -euo pipefail

DEST="$(cd "$(dirname "$0")/.." && pwd)/samples"
mkdir -p "$DEST"

fetch() {
  local name="$1" url="$2"
  if [[ -s "$DEST/$name" ]]; then
    echo "have  $name"
    return
  fi
  echo "fetch $name"
  sleep 1
  curl -fsSL --retry 3 --retry-delay 5 -A "Mozilla/5.0" -o "$DEST/$name.tmp" "$url"
  head -c 5 "$DEST/$name.tmp" | grep -q '%PDF-' || { echo "not a PDF: $name" >&2; rm -f "$DEST/$name.tmp"; exit 1; }
  mv "$DEST/$name.tmp" "$DEST/$name"
}

# EU GMP Annex 11: Computerised Systems (European Commission)
fetch eu-gmp-annex11.pdf "https://health.ec.europa.eu/system/files/2016-11/annex11_01-2011_en_0.pdf"
# FDA: Part 11, Electronic Records; Electronic Signatures - Scope and Application
fetch fda-part11-scope.pdf "https://www.fda.gov/media/75414/download"
# FDA: Data Integrity and Compliance With Drug CGMP, Questions and Answers
fetch fda-data-integrity-qa.pdf "https://www.fda.gov/media/119570/download"
# ICH Q9(R1): Quality Risk Management
fetch ich-q9-r1.pdf "https://database.ich.org/sites/default/files/ICH_Q9%28R1%29_Guideline_Step4_2022_1219.pdf"

echo "done: $DEST"
if [[ -f "$DEST/SHA256SUMS" ]]; then
  (cd "$DEST" && shasum -a 256 -c SHA256SUMS) || echo "warning: a file differs from the committed checksum (publisher may have updated it)" >&2
fi
