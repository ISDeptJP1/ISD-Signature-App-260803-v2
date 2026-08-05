#!/bin/sh
set -eu
cd /workspace
if curl -sf -o /dev/null --max-time 2 http://127.0.0.1:8080/; then
  exit 0
fi
# Clear stale log so revive diagnostics stay useful
: >/tmp/app-startup.log
npm run dev >>/tmp/app-startup.log 2>&1 &
# Wait briefly for the listener so a revive doesn't race the preview probe
i=0
while [ "$i" -lt 30 ]; do
  if curl -sf -o /dev/null --max-time 1 http://127.0.0.1:8080/; then
    exit 0
  fi
  i=$((i + 1))
  sleep 0.2
done
exit 0
