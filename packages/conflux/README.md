# @confluxjs/conflux

Conflux bot framework CLI and runtime library for Fluxer.

## Install

```bash
bun add @confluxjs/conflux @fluxerjs/core
```

Import from the package root:

```ts
import { defineConfig, createConflux, runConflux } from "@confluxjs/conflux";
import type { Conflux, MessageCommand, EventHandler } from "@confluxjs/conflux";
```

## Publishing (maintainers)

From the repo root after bumping `version` in each package under `packages/`:

```bash
bun install
bun run build --filter=@confluxjs/tsconfig --filter=@confluxjs/conflux --filter=@confluxjs/create-conflux
npm login
cd packages/tsconfig && npm publish --access public && cd ../..
cd packages/conflux && npm publish --access public && cd ../..
cd packages/create-conflux && npm publish --access public && cd ../..
```

## Usage

See the [getting started guide](https://conflux.js.org/guides/getting-started) on the docs site.

## Scripts

| Script                | Description       |
| --------------------- | ----------------- |
| `bun run build`       | Build with tsdown |
| `bun run check-types` | Typecheck         |
| `bun run lint`        | ESLint            |

## Links

- [Documentation](https://conflux.js.org)
- [API reference](https://conflux.js.org/api/)
