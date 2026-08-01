# Conflux.js

Monorepo for [Conflux.js](https://conflux.js.org) — a framework for building Discord bots on [Fluxer](https://fluxer.dev) with `@fluxerjs/core`.

## Requirements

- [Bun](https://bun.sh) 1.3.9 (see `packageManager` in `package.json`)

## Quick start

```bash
bun install
bun run build
bun run --filter website dev
```

Scaffold a bot:

```bash
bunx create-conflux
```

Contributors: open pull requests to **`dev`** first; see [.github/BRANCHING.md](.github/BRANCHING.md).

## Workspaces

| Path                                               | Description                          |
| -------------------------------------------------- | ------------------------------------ |
| [packages/conflux](packages/conflux)               | `@confluxjs/conflux` CLI and library |
| [packages/create-conflux](packages/create-conflux) | `create-conflux` scaffolder          |
| [packages/tsconfig](packages/tsconfig)             | Shared TS configs                    |
| [apps/website](apps/website)                       | VitePress docs site                  |
| [apps/test-bot](apps/test-bot)                     | Reference bot                        |

## Scripts

| Script                 | Description                           |
| ---------------------- | ------------------------------------- |
| `bun run build`        | Turbo build all packages and apps     |
| `bun run check-types`  | Typecheck workspaces                  |
| `bun run docgen`       | Generate API markdown for the website |
| `bun run lint`         | ESLint (root flat config)             |
| `bun run lint:fix`     | ESLint with autofix                   |
| `bun run format`       | Prettier write                        |
| `bun run format:check` | Prettier check                        |

## License

MIT — see [LICENSE](LICENSE).
