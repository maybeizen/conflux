# Website

VitePress documentation site for [conflux.js.org](https://conflux.js.org).

## Prerequisites

Generated API markdown under `api/` comes from the root docgen script. Run docgen before a production build if API pages are missing.

```bash
pnpm run docgen
```

## Scripts

| Script                 | Description                           |
| ---------------------- | ------------------------------------- |
| `pnpm run dev`         | VitePress dev server                  |
| `pnpm run build`       | Production build to `.vitepress/dist` |
| `pnpm run preview`     | Preview production build              |
| `pnpm run check-types` | `vue-tsc` on theme/config             |
| `pnpm run lint`        | ESLint on `.vitepress`                |
