# @confluxjs/create-conflux

Scaffold a new Conflux bot project with an interactive CLI.

## Usage

```bash
pnpm create @confluxjs/create-conflux
# npm: npm create @confluxjs/create-conflux@latest
# pnpm: pnpm create @confluxjs/create-conflux@latest
```

### Interactive flow

The CLI walks you through:

1. **Project directory** - where the bot will be created (relative to your current folder)
2. **Package name** - only if the folder name is not a valid npm package name
3. **Bot token** - optional; when provided, writes `.env` with `FLUXER_BOT_TOKEN`. `.env.example` is always included
4. **Git** - optional `git init` (default: yes)
5. **Install** - optional dependency install (default: yes)

## Scripts

| Script                 | Description |
| ---------------------- | ----------- |
| `pnpm run build`       | Build CLI   |
| `pnpm run check-types` | Typecheck   |
| `pnpm run lint`        | ESLint      |

## Links

- [Getting started](https://conflux.js.org/guides/getting-started)
- [Manual installation](https://conflux.js.org/guides/manual-installation)
