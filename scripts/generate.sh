#!/bin/bash
set -e

# Wrapper around `nest generate` that moves generated spec files
# from src/ to test/unit/ and fixes their import paths.
#
# Usage: npm run gen -- <schematic> <name> [options]
# Example: npm run gen -- service research

npx nest generate "$@"

find src -name "*.spec.ts" | while IFS= read -r srcfile; do
  rel="${srcfile#src/}"         # e.g. research/research.service.spec.ts
  dir=$(dirname "$rel")         # e.g. research
  dest="test/unit/$rel"

  mkdir -p "$(dirname "$dest")"

  # Build relative import prefix from test/unit/<dir>/ back to src/<dir>/
  if [ "$dir" = "." ]; then
    prefix="../../src/"
  else
    slash_count=$(echo "$dir" | tr -cd '/' | wc -c)
    depth=$((slash_count + 1))
    ups=$(printf '%0.s../' $(seq 1 $((depth + 2))))
    prefix="${ups}src/${dir}/"
  fi

  # Fix relative imports: './foo' → '../../src/<dir>/foo'
  sed -i "s|from '\./|from '${prefix}|g" "$srcfile"

  mv "$srcfile" "$dest"
  echo "Moved: $srcfile → $dest"
done
