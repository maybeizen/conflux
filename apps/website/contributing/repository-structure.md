---
title: Repository structure
description: Monorepo layout for contributors
---

# Repository structure

Phase 1 organizes the monorepo by domain inside each workspace. Published npm export paths stay the same; only internal folders changed.

## `@confluxjs/conflux` (`packages/conflux/src`)

| Domain      | Role                                                                                  |
| ----------- | ------------------------------------------------------------------------------------- |
| `config/`   | Types, defaults, `defineConfig`, config file loading                                  |
| `env/`      | `.env` loading and bot token resolution                                               |
| `loader/`   | Entry client import and directory module loading                                      |
| `runtime/`  | Run loop, runtime config state                                                        |
| `core/`     | `Conflux` class and `createConflux`                                                   |
| `commands/` | Prefix command discovery, middleware, dispatch                                        |
| `events/`   | Event handler registry and registration                                               |
| `cli/`      | CLI argument parsing and commands (`dev`, `build`, `start`, `run`)                    |
| `build/`    | Bot production bundling (`Bun.build`) and built-path resolution                       |
| `dev/`      | Dev bundling to `.conflux/`, bootstrap runner, and filesystem watch for `conflux dev` |
| `entries/`  | tsdown entry shims for library exports                                                |

Dependency flow: `cli` / `start` → `runtime`, `build` → `config`, `loader`, `commands`; `runtime` → `config`, `env`, `loader`, `core`, `commands`, `events`.

## Bot projects

```
conflux.config.ts
src/
  index.ts
  commands/
  events/
```

## `@confluxjs/create-conflux`

```
src/
  cli/
  lib/
  index.ts
templates/default/
```

## Docs site (`apps/website`)

VitePress site with guides, contributing docs, and generated API markdown under `api/`. Docgen writes sidebar data to `.vitepress/data/`.

## API reference generation

```bash
pnpm run docgen
```

Runs `scripts/docgen/generate-api-reference.ts` on `packages/conflux/src/entries/index.ts` and outputs to `apps/website/api/`.
