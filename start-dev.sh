#!/bin/sh
# Wrapper to run Next.js dev server via Docker with correct socket path
export DOCKER_HOST="unix:///Users/alexparis/.docker/run/docker.sock"

# Remove any stale container
docker rm -f cakeday-dev 2>/dev/null || true

exec docker run --rm \
  --name cakeday-dev \
  -p "${PORT:-3001}:${PORT:-3001}" \
  -v "/Users/alexparis/Documents/GitHub/demo-repository/cakeday:/app" \
  -w /app \
  --env-file "/Users/alexparis/Documents/GitHub/demo-repository/cakeday/.env.local" \
  -e "PORT=${PORT:-3001}" \
  node:20-alpine \
  sh -c "npm run dev -- --port \${PORT:-3001} --hostname 0.0.0.0"
