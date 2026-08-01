# @confluxjs/tsconfig

Shared TypeScript configs for Conflux.js workspaces.

## Profiles

| File           | Use case                    |
| -------------- | --------------------------- |
| `base.json`    | Shared compiler defaults    |
| `library.json` | Packages published or built |
| `node.json`    | Node/Bun apps and tooling   |

## Usage

```json
{
  "extends": "@confluxjs/tsconfig/library.json"
}
```
