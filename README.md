# Conflux.js

Monorepo for **Conflux.js** — conventions and tooling for [Fluxer](https://fluxer.app/) bots built on [`@fluxerjs/core`](https://fluxer.js.org/). Documentation is published at [conflux.js.org](https://conflux.js.org).

This repository is under active development. Published npm versions and the public docs site may lag `main`.

## Requirements

- [pnpm](https://pnpm.io) *_11.20.0_ (or your package manager of choice, really)
- [Fluxer.js Core](https://fluxer.js.org)

## Repository layout

| Path                                                 | Role                                                                     |
| ---------------------------------------------------- | ------------------------------------------------------------------------ |
| [`packages/conflux`](packages/conflux)               | `@confluxjs/conflux` — CLI (`conflux dev`, `build`, `start`) and runtime |
| [`packages/create-conflux`](packages/create-conflux) | `create-conflux` scaffolder (template in `templates/default`)            |
| [`apps/website`](apps/website)                       | VitePress docs (guides, API reference, contributing)                     |

## Development

Install and build libraries/apps:

```bash
pnpm install
pnpm run build
```

Typecheck, lint, and format (same steps as CI):

```bash
pnpm run check-types
pnpm run lint
pnpm run format:check
```

API reference markdown is **generated**, not committed (`apps/website/api` is gitignored). Regenerate before building the docs site:

```bash
pnpm run docgen
pnpm run --filter website build
```

Local docs dev server (run `docgen` first if API pages are missing):

```bash
pnpm run docgen
pnpm run --filter website dev
```

## Using the framework in another project

When packages are published:

```bash
pnpm create @confluxjs/create-conflux
# or
pnpm install @confluxjs/conflux @fluxerjs/core
```

See [Getting started](https://conflux.js.org/guides/getting-started) on the docs site.

## Contributing

Open pull requests against **`dev`** first; promote to **`main`** for release.

## License

MIT — see [LICENSE](LICENSE).
