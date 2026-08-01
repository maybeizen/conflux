# Conflux.js

Monorepo for **Conflux.js** — conventions and tooling for [Fluxer](https://fluxer.app/) bots built on [`@fluxerjs/core`](https://fluxer.js.org/). Documentation is published at [conflux.js.org](https://conflux.js.org).

This repository is under active development. Published npm versions and the public docs site may lag `main`.

## Requirements

- [Bun](https://bun.sh) **1.3.9** (or your package manager of choice, really)

## Repository layout

| Path                                                 | Role                                                                     |
| ---------------------------------------------------- | ------------------------------------------------------------------------ |
| [`packages/conflux`](packages/conflux)               | `@confluxjs/conflux` — CLI (`conflux dev`, `build`, `start`) and runtime |
| [`packages/create-conflux`](packages/create-conflux) | `create-conflux` scaffolder (template in `templates/default`)            |
| [`packages/tsconfig`](packages/tsconfig)             | Shared `extends` configs for workspaces                                  |
| [`apps/website`](apps/website)                       | VitePress docs (guides, API reference, contributing)                     |

## Development

Install and build libraries/apps:

```bash
bun install
bun run build
```

Typecheck, lint, and format (same steps as CI):

```bash
bun run check-types
bun run lint
bun run format:check
```

API reference markdown is **generated**, not committed (`apps/website/api` is gitignored). Regenerate before building the docs site:

```bash
bun run docgen
bun run --filter website build
```

Local docs dev server (run `docgen` first if API pages are missing):

```bash
bun run docgen
bun run --filter website dev
```

## Using the framework in another project

When packages are published:

```bash
bunx create-conflux
# or
bun add @confluxjs/conflux @fluxerjs/core
```

See [Getting started](https://conflux.js.org/guides/getting-started) on the docs site.

## Publishing

Published npm packages (all at **0.1.0** initially):

| Package                   | npm name                    |
| ------------------------- | --------------------------- |
| `packages/tsconfig`       | `@confluxjs/tsconfig`       |
| `packages/conflux`        | `@confluxjs/conflux`        |
| `packages/create-conflux` | `@confluxjs/create-conflux` |

**Manual release** (from repo root):

```bash
bun install
bun run build --filter=@confluxjs/tsconfig --filter=@confluxjs/conflux --filter=@confluxjs/create-conflux
npm login
cd packages/tsconfig && npm publish --access public && cd ../..
cd packages/conflux && npm publish --access public && cd ../..
cd packages/create-conflux && npm publish --access public && cd ../..
```

Bump `version` in each package `package.json` before publishing. Each package runs `prepublishOnly` to rebuild `dist` when publishing from its directory.

## Contributing

Open pull requests against **`dev`** first; promote to **`main`** for release. Branching and GitHub settings are described in [.github/BRANCHING.md](.github/BRANCHING.md).

## License

MIT — see [LICENSE](LICENSE).
