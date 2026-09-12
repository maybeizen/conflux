#!/usr/bin/env bash
set -eo pipefail

NODE_MAJOR=24

export NVM_DIR="${NVM_DIR:-$HOME/.nvm}"
# shellcheck disable=SC1091
. "$NVM_DIR/nvm.sh"

nvm install "$NODE_MAJOR" >/dev/null
nvm alias default "$NODE_MAJOR" >/dev/null
nvm use default >/dev/null

corepack enable
corepack prepare pnpm@11.20.0 --activate

echo "node: $(node --version)"
echo "pnpm: $(pnpm --version)"

pnpm install --frozen-lockfile
pnpm run build:packages
pnpm run docgen
