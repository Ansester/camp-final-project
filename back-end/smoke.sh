#!/usr/bin/env bash
# Optional read-only local check; authenticated/stateful contracts live in npm test.
set -euo pipefail
BASE_URL="${1:-http://localhost:3000}"
case "$BASE_URL" in
  http://localhost:*|http://127.0.0.1:*) ;;
  *) echo 'Use a loopback demo API URL; this script is not for live services.' >&2; exit 1 ;;
esac
for route in /api/health /api/items /api/facilities /api/help /api/policies; do
  curl --fail --silent --show-error --max-time 10 "$BASE_URL$route" > /dev/null
  echo "GET $route passed"
done
