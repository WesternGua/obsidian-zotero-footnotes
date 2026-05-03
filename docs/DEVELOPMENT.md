# Development Guide

This plugin directory now follows a more standard Obsidian plugin source-repo layout while still remaining directly loadable by Obsidian.

## Directory Map

```text
zotero-citations/
├── .github/workflows/        # GitHub Actions
├── assets/screenshots/       # README images
├── docs/                     # Project docs
├── src/                      # TypeScript source
├── CHANGELOG.md
├── LICENSE
├── README.md
├── README_EN.md
├── esbuild.config.mjs
├── manifest.json
├── package.json
├── package-lock.json
├── tsconfig.json
├── version-bump.mjs
├── versions.json
└── main.js                   # Build output used by Obsidian at runtime
```

## Local Workflow

```bash
npm install
npm run check
npm run build
```

After rebuilding, reload the plugin in Obsidian:

```bash
obsidian plugin:reload id=zotero-citations
```

## Important Local-Plugin Nuance

This folder is both:

1. a source repository layout, and
2. the live plugin directory under `.obsidian/plugins/`

So `main.js` must continue to exist locally for Obsidian to load the plugin, even though `.gitignore` excludes it for a cleaner source-repo workflow.

Likewise, `data.json` is local runtime state and should stay untracked.

## Release Metadata

- `manifest.json` stores the plugin version and minimum Obsidian version.
- `versions.json` maps each released plugin version to its minimum compatible Obsidian version.
- `npm version <patch|minor|major>` can use `version-bump.mjs` to keep `manifest.json` and `versions.json` in sync.

## Suggested Release Checklist

1. Run `npm run check`
2. Run `npm run build`
3. Update `CHANGELOG.md`
4. Bump the version with `npm version ...`
5. Confirm `manifest.json` and `versions.json` were updated
6. Attach `main.js` and `manifest.json` to the GitHub release if distributing release artifacts
