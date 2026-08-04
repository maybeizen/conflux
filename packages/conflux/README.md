# @confluxjs/conflux

Conflux bot framework CLI and runtime library for Fluxer.

## Install

```bash
pnpm install @confluxjs/conflux @fluxerjs/core
```

Import from the package root:

```ts
import { defineConfig, createConflux, runConflux } from "@confluxjs/conflux";
import type { Conflux, MessageCommand, EventHandler } from "@confluxjs/conflux";
```

## Usage

See the [getting started guide](https://conflux.js.org/guides/getting-started) on the docs site.

## Scripts

| Script                 | Description       |
| ---------------------- | ----------------- |
| `pnpm run build`       | Build with tsdown |
| `pnpm run check-types` | Typecheck         |
| `pnpm run lint`        | ESLint            |

## Links

- [Documentation](https://conflux.js.org)
- [API reference](https://conflux.js.org/api/)
