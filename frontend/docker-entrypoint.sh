#!/bin/sh
set -e
cd /app
LOCK_HASH=$(sha256sum package-lock.json 2>/dev/null | cut -d' ' -f1 || echo "")
STORED=$(cat node_modules/.lock-hash 2>/dev/null || echo "")
if [ "$LOCK_HASH" != "$STORED" ] || [ ! -d node_modules ]; then
  echo "Installing frontend dependencies..."
  npm ci
  echo "$LOCK_HASH" > node_modules/.lock-hash
fi
exec "$@"
