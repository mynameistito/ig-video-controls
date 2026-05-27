# ig-video-controls

Adds the native HTML5 video player (seek bar, volume slider, fullscreen, PiP) to Instagram videos, remembers your volume and playback speed across tabs and sessions, and provides mouse-wheel hotkeys for quick adjustments.

A rewrite of [Controls for Instagram Videos](https://chromewebstore.google.com/detail/controls-for-instagram-vi/eigfbedabacomcacemdnkelnlhgbiacn) by Chris Rehfeld. This is an independent TypeScript rewrite; all telemetry / uninstall analytics are removed, and the extension is fully Open-Source and browser agnostic.

## Hotkeys

| Gesture                                             | Action                    |
| --------------------------------------------------- | ------------------------- |
| `Ctrl + Mousewheel` over a video                    | Speed up / down (± 0.25×) |
| Hold Right Mouse Button + `Mousewheel` over a video | Volume up / down (± 0.1)  |

Right-click without scrolling still works normally — the context menu is only suppressed when you actually scroll while holding RMB.

## Install for development

```bash
bun install
```

## Persistent extension ID (Chrome)

1. Generate a signing key (run once):

   ```powershell
   bun run gen-key
   ```

   This creates `key.pem` at the repo root (gitignored) and prints the derived extension ID.

2. Upload the key to GitHub Actions:

   ```powershell
   Get-Content key.pem -Raw | gh secret set WXT_CHROME_KEY
   ```

## Commands

| Command                 | Description                        |
| ----------------------- | ---------------------------------- |
| `bun run dev`           | Dev mode (Chrome)                  |
| `bun run dev:firefox`   | Dev mode (Firefox)                 |
| `bun run build`         | Production build (Chrome)          |
| `bun run build:firefox` | Production build (Firefox)         |
| `bun run zip`           | Zip for Chrome Web Store           |
| `bun run zip:firefox`   | Zip for AMO                        |
| `bun run zip:all`       | Zip both browsers                  |
| `bun run typecheck`     | Type-check with `tsgo`             |
| `bun run check`         | Lint + format check (Ultracite)    |
| `bun run fix`           | Auto-fix lint + format (Ultracite) |

## Release

This repo uses [Changesets](https://github.com/changesets/changesets) + GitHub Actions:

1. Run `bun run changeset` to describe your change.
2. Commit the changeset file. When the PR merges to `main`, the Changesets bot opens a "Version Packages" PR.
3. Merge the version PR — the CI workflow builds both browsers, tags, and uploads zips to a GitHub Release.

## License

MIT
