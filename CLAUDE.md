# Technical Reference

This document is intended for contributors and AI coding assistants working on the Wikipedia Picture of the Day Chrome extension. It covers the architecture, module responsibilities, data flow, and development conventions.

---

## Stack

- **Manifest V3** Chrome extension — no build tools, no bundler, no npm
- Vanilla JavaScript (ES modules via `<script type="module">`)
- Plain CSS
- External APIs: Wikipedia REST API, Wikimedia Commons API, Wikimedia Commons POTD Atom feed

---

## Module Overview

### `main.js` — Entry Point
Bootstraps the app on load:
1. Sets the initial display date to today
2. Fetches the Wikimedia Commons POTD Atom feed
3. Passes the parsed feed to state via `setWikimediaPotdFeed()`
4. Calls `fetchPictureOfTheDay()` to render today's entry
5. Calls `setupEventListeners()` to wire up interactions

### `api.js` — External Requests
All network calls are isolated here. Exports:
- `wikipediaApiFetch(params)` — GET requests to `en.wikipedia.org/w/api.php`
- `commonsApiFetch(params)` — GET requests to `commons.wikimedia.org/w/api.php`
- `fetchWikimediaPotdFeed(feedUrl)` — fetches the Wikimedia Commons POTD Atom feed as raw XML text

All requests include `origin: '*'` for CORS.

### `state.js` — Global State
Holds shared mutable state and exports setter functions. Key state:
- `displayingDate` — the `Date` object currently being shown
- `displayingDateString` — formatted date string (YYYY-MM-DD)
- `userDisplayDateString` — human-readable date for display
- `currentArticleUrl` — Wikipedia URL for the current POTD
- `currentAnimationFrameId` — ID of the active panning animation frame
- `currentPotdData` — the parsed POTD data object for the current entry
- `feedMode` / `wikimediaPotdFeed` — feed state and parsed feed data

### `date-utils.js` — Date Handling
- `getTodayAtMidnight()` — returns today's date at 00:00 local time
- `formatDateToYYYYMMDD(date)` — formats a Date as `YYYY-MM-DD`
- `getOrdinalSuffix(n)` — returns `"st"`, `"nd"`, `"rd"`, or `"th"`
- `updateDisplayingDate(date)` — updates state and DOM date display
- `updateRightArrowState()` — disables the right arrow when at today's date
- `navigateDate(direction)` — steps the display date forward or backward

### `media-display.js` — Rendering
Handles the full lifecycle of fetching and displaying a POTD entry:
- `fetchPictureOfTheDay(date)` — orchestrates fetch and display for a given date
- `fetchImageData(filename)` — fetches image metadata from the Commons API
- `displayPicture(data)` — renders image or video to the DOM
- `startBackgroundAutoscroll(img)` — starts the slow panning animation for large images
- `displayError()` — renders a fallback error state
- `parseWikimediaAtomFeed(xmlString)` — parses the Atom feed XML into a usable data structure

### `event-handlers.js` — Interactions
- `setupEventListeners()` — registers all event listeners:
  - Left/right arrow clicks for date navigation
  - Keyboard left/right arrow keys
  - Title click to open the Wikipedia article
  - Title hover to expand truncated description
  - Window resize to recalculate panning

### `dom-elements.js` — DOM Cache
Exports references to frequently accessed DOM nodes, populated once on load, to avoid repeated `querySelector` calls throughout the codebase.

---

## Data Flow

```
Atom Feed (XML)
    └── api.js: fetchWikimediaPotdFeed()
    └── media-display.js: parseWikimediaAtomFeed()
    └── state.js: setWikimediaPotdFeed()

User navigates / page loads
    └── date-utils.js: navigateDate() / updateDisplayingDate()
    └── media-display.js: fetchPictureOfTheDay(date)
        ├── Looks up entry in wikimediaPotdFeed (fast path)
        │   └── media-display.js: displayPicture()
        └── Falls back to Wikipedia API (slow path)
            └── api.js: wikipediaApiFetch() / commonsApiFetch()
            └── media-display.js: displayPicture()
```

---

## Permissions

| Permission | Purpose |
|---|---|
| `*.wikimedia.org` | Fetch the POTD Atom feed and image files from Wikimedia Commons |
| `*.wikipedia.org` | Fetch article metadata from the Wikipedia API |

The `content_security_policy` explicitly allows `media-src https://upload.wikimedia.org` to permit video playback from Wikimedia.

---

## File Conventions

- No build step — files are loaded directly by the browser as ES modules
- No external libraries or frameworks
- `dom-elements.js` is imported by any module that needs DOM access — never query the DOM ad hoc in other modules
- All state mutations go through setters in `state.js` — do not mutate state directly from other modules
- All network requests go through `api.js` — do not call `fetch()` directly from other modules

---

## Release Process

1. Make changes and test by loading the extension unpacked in Chrome
2. Bump `version` in `manifest.json`
3. Commit, tag, and push:
   ```bash
   git tag v1.x
   git push origin v1.x
   ```
4. GitHub Actions builds the zip and publishes a GitHub Release automatically
5. Download the zip from the Releases page and upload to the Chrome Web Store

See [PUBLISHING.md](PUBLISHING.md) for the full store submission process.
