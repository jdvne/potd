# Store Listing

This file contains copy for both the Chrome Web Store and Microsoft Edge Add-ons. Most content is shared — store-specific differences are noted where they apply.

## Name
Wikipedia Picture of the Day

## Summary
*(132 characters max — shown in search results)*

Replaces your new tab with Wikipedia's featured Picture of the Day — a different photo, painting, or illustration every day.

## Description
*(Plain text — Chrome max 16,000 chars, Edge min 250 / max 10,000 chars — paste from the raw file, not the rendered view)*

Every time you open a new tab, discover a stunning image hand-picked by Wikipedia's editors as the Picture of the Day. From breathtaking nature photography to historic paintings to scientific imagery — a new visual every day.

Features:
• Full-viewport display — image fills the entire new tab
• Navigate backwards through past Pictures of the Day with arrow keys or on-screen controls
• Tap the title to open the full Wikipedia article for context
• Hover to expand the full description
• Videos and animated content are supported alongside photos
• Subtle panning animation on large images for an immersive feel

Content is sourced directly from Wikimedia Commons via the official public API and is attributed to its original authors. This extension is not affiliated with or endorsed by the Wikimedia Foundation.

## Category
- **Chrome:** Art & Design
- **Edge:** Photos

## Language
English

## Single Purpose Statement
*(Shown in the store; keep it concise)*

Replaces the new tab page with Wikipedia's Picture of the Day.

## Tags / Keywords
wikipedia, picture of the day, new tab, photo, wikimedia, daily image, art, nature, photography

*(Edge allows max 7 terms / 21 words total)*

---

## Screenshots
Located in `store/screenshots/`. The store requires at least one, maximum five, at 1280×800 or 640×400.

Current screenshots:
1. `screenshot-1.png` — photo POTD filling the screen
2. `screenshot-2.png` — info overlay with title + description visible
3. `screenshot-3.png` — back-navigation in use
4. `screenshot-4.png` — additional POTD example

## Promotional Images

Both stores use the same small tile size — reuse the same asset.

| Asset | Chrome | Edge | File |
|---|---|---|---|
| Small tile | 440×280 | 440×280 | `store/promotional/tile_small.png` ✓ |
| Large tile | 920×680 | 1400×560 | *(not yet created — different sizes, needs two files)* |
| Marquee/banner | 1400×560 | — | *(optional, Chrome only, only used if featured)* |

## Extension Logo (Edge only)
Edge requires a dedicated logo image at 300×300 (min 128×128), 1:1 aspect ratio. `icons/icon128.png` can be used if it reads well at that size, or create `store/promotional/logo_300.png`.

---

## Chrome — Permission Justifications

**Storage** *(1000 char max)*:
> Stores the date of the last fetched Picture of the Day so the extension can avoid redundant API requests and display cached content when the same date is revisited within a session.

**Host permissions** *(1000 char max)*:
> This extension fetches the daily Picture of the Day from the Wikimedia Commons Atom feed (wikimedia.org) and supplementary article metadata from the Wikipedia API (wikipedia.org). These are the sole external requests made by the extension. No user data is transmitted.

**Remote code:** No

**Privacy practices:** This extension collects no user data and makes no external requests except to Wikimedia/Wikipedia.

---

## Edge — Certification Notes

> This extension replaces the new tab page with the Wikipedia Picture of the Day, fetched from the Wikimedia Commons public API. No user accounts, logins, or personal data are involved. Navigation arrows and keyboard left/right keys allow browsing past entries.
