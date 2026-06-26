#!/bin/sh
set -e

mkdir -p /verdaccio/storage

# Start verdaccio in background
verdaccio --config /etc/verdaccio/config.yaml &
VERD_PID=$!

echo "[verdaccio] waiting for startup..."
until wget -q -O- http://localhost:80/-/ping >/dev/null 2>&1; do
  sleep 0.3
done
echo "[verdaccio] ready"

# Create publisher account via Verdaccio REST API; extract the returned auth token.
RESP=$(curl -s -X PUT http://localhost:80/-/user/org.couchdb.user:publisher \
  -H 'Content-Type: application/json' \
  -d '{"name":"publisher","password":"secret","email":"publisher@test.com","type":"user"}')

TOKEN=$(echo "$RESP" | node -e \
  "let d='';process.stdin.on('data',c=>d+=c).on('end',()=>{try{process.stdout.write(JSON.parse(d).token||'')}catch{}})")

if [ -z "$TOKEN" ]; then
  echo "[verdaccio] failed to get auth token; response: $RESP"
  exit 1
fi
echo "[verdaccio] auth token acquired"

# Write auth into the package directory as a local .npmrc so npm picks it up
# as the project-level config (highest precedence, avoids global config issues).
cd /tmp/packages/stripe-diag-collector
printf 'registry=http://localhost:80/\n//localhost:80/:_authToken=%s\n' "$TOKEN" > .npmrc

npm publish
echo "[verdaccio] stripe-diag-collector@1.0.0 published"

wait $VERD_PID
