# Website

VitePress documentation site for [conflux.js.org](https://conflux.js.org).

## Prerequisites

Generated API markdown under `api/` comes from the root docgen script. Run docgen before a production build if API pages are missing.

```bash
bun run docgen
```

## Scripts

| Script                | Description                           |
| --------------------- | ------------------------------------- |
| `bun run dev`         | VitePress dev server                  |
| `bun run build`       | Production build to `.vitepress/dist` |
| `bun run preview`     | Preview production build              |
| `bun run check-types` | `vue-tsc` on theme/config             |
| `bun run lint`        | ESLint on `.vitepress`                |

Custom domain `CNAME` is in `public/CNAME` and copied into the build output.
