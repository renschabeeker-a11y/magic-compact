# Development

This page covers the public setup, repository layout, and common maintenance commands for contributors.

## Requirements

- Bun

## Setup

Install dependencies from the repository root:

```bash
bun install
```

## Repository Layout

### `packages/`

- `packages/opencode-plugin` - OpenCode plugin implementation.
  - `src/index.ts` - plugin entrypoint.
  - `src/compact/` - compaction flow, turn planning, pruning, and session helpers.
  - `src/storage/` - omission and stats persistence.
  - `src/stats/` - stats accounting, formatting, and pricing.
- `packages/claude-code-plugin` - Claude Code plugin entrypoint for the port.
  - `src/index.ts` - plugin entrypoint.
- `packages/common` - shared utilities for cross-package code.
  - `src/index.ts` - shared export surface.

### `docs/`

- `docs/Development.md` - contributor setup and repository map.

## Common Commands

- `bun run typecheck` - TypeScript type checking
- `bun run lint` - ESLint checks
- `bun run format` - Prettier formatting

## Notes

- The project uses Bun workspaces.
- For the user-facing plugin install flow, see the main `README.md`.
