# test-bot

Reference Conflux bot used for manual testing in this monorepo.

## Setup

Create `apps/test-bot/.env` with your bot token (see Fluxer docs). This file is gitignored.

## Scripts

| Script                | Description     |
| --------------------- | --------------- |
| `bun run dev`         | `conflux dev`   |
| `bun run start`       | `conflux start` |
| `bun run build`       | `conflux build` |
| `bun run check-types` | Typecheck       |
| `bun run lint`        | ESLint          |

Depends on `@confluxjs/conflux` from the workspace.
