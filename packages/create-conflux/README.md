# @confluxjs/create-conflux

Scaffold a new Conflux bot project with an interactive CLI.

## Usage

```bash
pnpm create @confluxjs/create-conflux
# npm: npm create @confluxjs/create-conflux@latest
# bun: bunx @confluxjs/create-conflux@latest
```

### Interactive flow

The CLI walks you through:

1. **Project directory** - where the bot will be created (relative to your current folder)
2. **Package name** - only if the folder name is not a valid npm package name
3. **Bot token** - optional; when provided, writes `.env` with `FLUXER_BOT_TOKEN`. `.env.example` is always included
4. **Git** - optional `git init` (default: yes)
5. **Install** - optional dependency install (default: yes)

## Publishing (maintainers)

Build and publish from the monorepo root (see [root README](../../README.md#publishing) or `packages/conflux/README.md`). This package is published as `@confluxjs/create-conflux`.

## Scripts

| Script                | Description |
| --------------------- | ----------- |
| `bun run build`       | Build CLI   |
| `bun run check-types` | Typecheck   |
| `bun run lint`        | ESLint      |

## Links

- [Getting started](https://conflux.js.org/guides/getting-started)
- [Manual installation](https://conflux.js.org/guides/manual-installation)
