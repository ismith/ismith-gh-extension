# Copilot Instructions

A Chrome extension (Manifest V3, TypeScript) that enhances GitHub's `/issues` and
`/pulls` list views with custom filter shortcuts and visual annotations. Targets
`github.com` and GitHub Enterprise (`*.ghe.com`). Installed unpacked for local use
only (not published to the Chrome Web Store). Uses WebExtensions-compatible APIs, so
it also works in Firefox.

## Build & Development

- `npm install` — install dependencies.
- `npm run build` — production webpack build + `scripts/generate-version.js`, outputs to `dist/`.
- `npm run dev` — webpack `--watch` development build (does **not** run the version script).
- `npm run clean` — remove `dist/`.

There is **no test or lint tooling** in this repo. Validate changes by building and
loading `dist/` as an unpacked extension in `chrome://extensions/`, then reloading the
extension card and any open GitHub tab.

`dist/` is git-ignored but is checked into working copies as the load target. The build
`clean`s and regenerates it.

## Architecture

Three webpack entry points (see `webpack.config.js`), each a separate extension context:

- `src/background.ts` — service worker. Minimal; mainly relays an `open-popup` message
  (content script → background → `chrome.action.openPopup()`).
- `src/content.ts` — the bulk of the logic. Injected into every GitHub page. Adds the
  header badge, the custom-filter dropdown, the active-filter label, and the annotations.
- `src/popup.ts` + `src/popup.html` — the configuration UI shown when clicking the badge.

Shared modules:

- `src/config.ts` — `Config` type, `DEFAULT_CONFIG`, `loadConfig`/`saveConfig` backed by
  `chrome.storage.sync` (key `gh-extension-config`), and the `AnnotationType` enum.
- `src/filterConstants.ts` — the `FilterType` enum and `FILTERS` record (name + GitHub
  search query for each filter). Content-script filter UI is generated from this record.

Communication flow: the **popup** writes config to `chrome.storage.sync` and broadcasts a
`config-updated` message to GitHub tabs; the **content script** listens and re-applies
styling live (via `injectDynamicCSS`) without a page reload. `src/manifest.json` is copied
verbatim into `dist/` and declares permissions, host permissions, and the content script.

`scripts/generate-version.js` writes `dist/version.json` (short commit hash — suffixed
`+dirty` if the tree is dirty — plus commit time and build time) that the popup displays.

## Key Conventions

- **Copilot authorship convention (project-defining).** PRs authored by GitHub Copilot
  (`author:app/copilot-swe-agent`) **and assigned to you** are treated as *yours*
  everywhere — the `MY_PRS` filter includes them, the `mine` annotation applies to them,
  and the "reviewing"/"to review" filters exclude them. Rationale: the human who assigned
  and directed Copilot is the real author. Preserve this behavior in any filter query or
  ownership check (`checkIfMine` in `content.ts`). See `.claude/README.md`.
- **Type-safe enums for shared vocabulary.** Use `AnnotationType` and `FilterType` rather
  than raw strings so annotation keys and filter identifiers stay in sync across files.
- **DOM injection is defensive and idempotent.** GitHub's markup differs between `/issues`
  (React, `prc-*` / `data-testid` selectors) and `/pulls` (legacy, `SelectMenu` /
  `js-issue-row` selectors), and elements load late. Code therefore: tries multiple
  fallback selectors in priority order; guards against duplicate insertion by checking for
  an existing element/class first; marks processed rows with `gh-extension-annotated`; and
  re-runs via `retryWithDelays` (`RETRY_DELAYS`) plus a `MutationObserver` that re-`init`s
  on GitHub's AJAX URL changes. Keep these guards when adding DOM manipulation.
- **Filter searches run on `/issues`.** `applyCustomFilter` rewrites `/pulls` URLs to
  `/issues` because that page supports the full boolean search syntax the queries use.
- **Annotation precedence is CSS-driven.** The content script adds *all* applicable classes
  (`gh-extension-mine` / `-reviewed` / `-mentioned` / `-draft`); precedence
  (mine > reviewed > mentioned) is enforced by CSS specificity/order in `injectDynamicCSS`,
  not by mutually-exclusive class assignment.
- **Participation detection via hovercards.** `checkForInteractions` fetches the row's
  `data-hovercard-url` and string-matches the returned HTML for phrases like `commented on`
  / `left a review` / `mentioned` to decide the `reviewed` vs `mentioned` annotation.
- **Debug logging pattern.** Content scripts can't attach to `window`. When debugging
  multi-item processing, thread an optional `debugCollector: Record<string, any>` through
  helpers and `console.log`/`console.table` it once at the end. See `.claude/debug-patterns.md`.
