# Publishing to the Chrome Web Store

## Prerequisites

- Google account
- $5 one-time Chrome Web Store developer registration fee
- PNG icons at 16×16, 48×48, and 128×128 (required by the store; 128×128 also appears on the store listing page)
- At least one 1280×800 or 640×400 screenshot for the store listing

---

## 1. Create Icons

The extension currently has no icon files. Create three PNGs and place them in the repo root:

```
icon16.png   (16×16)
icon48.png   (48×48)
icon128.png  (128×128)
```

Then add them to `manifest.json`:

```json
"icons": {
  "16":  "icon16.png",
  "48":  "icon48.png",
  "128": "icon128.png"
}
```

---

## 2. Register as a Developer

1. Go to the [Chrome Web Store Developer Dashboard](https://chrome.google.com/webstore/devconsole)
2. Sign in with your Google account
3. Pay the one-time $5 registration fee

---

## 3. Package the Extension

The Chrome Web Store expects a `.zip` of the extension files. Do **not** include dev files like `README.md`, `PUBLISHING.md`, `GEMINI.md`, `TODO.md`, or `.git/`.

From the repo root:

```bash
zip -r potd.zip \
  manifest.json \
  new_tab.html \
  new_tab.css \
  api.js \
  date-utils.js \
  dom-elements.js \
  event-handlers.js \
  main.js \
  media-display.js \
  state.js \
  icon16.png \
  icon48.png \
  icon128.png
```

---

## 4. Submit to the Chrome Web Store

1. In the Developer Dashboard, click **New item**
2. Upload `potd.zip`
3. Fill in the store listing:
   - **Name:** Wikipedia Picture of the Day
   - **Summary** (132 chars max): Replaces your new tab with Wikipedia's featured Picture of the Day — a different photo, painting, or illustration every day.
   - **Description:** expand on the summary; mention daily updates, Wikipedia sourcing, and the full-viewport display
   - **Category:** Lifestyle or Photos
   - **Language:** English
4. Upload screenshots (at least one 1280×800 or 640×400)
5. Set the **Single purpose** field: "Replaces the new tab page with Wikipedia's Picture of the Day"

---

## 5. Privacy & Permissions Justification

The store will ask you to justify each permission:

| Permission | Justification |
|---|---|
| `storage` | Saves the cached image and date so the same image is not re-fetched within the same day |
| `host_permissions: *.wikimedia.org` | Fetches the POTD Atom feed and image files from Wikimedia Commons |
| `host_permissions: *.wikipedia.org` | Fetches supplementary article metadata from the Wikipedia API |

You will also need to complete a **privacy practices** declaration. This extension collects no user data and makes no external requests except to Wikimedia/Wikipedia.

---

## 6. Review & Publication

- Submit for review. Initial reviews typically take a few days.
- Google may request changes to the description or permissions justification — respond promptly in the dashboard.
- Once approved, the extension goes live at its Chrome Web Store URL.

---

## Updating the Extension

1. Bump the `version` field in `manifest.json` (e.g. `"1.0"` → `"1.1"`)
2. Repackage with the zip command above
3. In the Developer Dashboard, open the existing item → **Package** → **Upload new package**
4. Submit for review

---

## Loading Locally (no account needed)

1. Go to `chrome://extensions`
2. Enable **Developer mode** (top right toggle)
3. Click **Load unpacked** and select the repo folder
