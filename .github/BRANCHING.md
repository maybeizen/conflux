# Branching

- **`main`** — production; merges here deploy [conflux.js.org](https://conflux.js.org) via GitHub Pages.
- **`dev`** — integration branch; open PRs here first, then promote to `main`.

## Workflow

1. Create a feature branch from `dev`.
2. Open a pull request into `dev`; CI must pass.
3. After review, merge to `dev`, then open a PR from `dev` to `main` for release.

## GitHub settings (manual)

1. **Settings → Pages → Build and deployment**: source **GitHub Actions**.
2. **Settings → Branches**: protect `main` (require status checks from CI; optional require PR from `dev`).

Branch protection cannot be applied from this repo without admin API access; configure in the GitHub UI.

If this directory is not yet a git repository, run `git init`, add your remote, push `main`, then create and push `dev` from `main` (`git checkout -b dev && git push -u origin dev`).
