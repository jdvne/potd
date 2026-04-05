# Publishing to the Chrome Web Store

## Prerequisites

- Google account
- $5 one-time Chrome Web Store developer registration fee
- PNG icons at 16×16, 32×32, 48×48, 64×64, and 128×128 (in `icons/`)
- At least one 1280×800 or 640×400 screenshot (save in `store/screenshots/`)

Store listing copy, description, keywords, and screenshot/promotional image specs are in [`store/listing.md`](store/listing.md).

---

## 1. Register as a Developer

1. Go to the [Chrome Web Store Developer Dashboard](https://chrome.google.com/webstore/devconsole)
2. Sign in with your Google account
3. Pay the one-time $5 registration fee

---

## 2. Package the Extension

The Chrome Web Store expects a `.zip` of the extension files. Do **not** include dev files like `README.md`, `PUBLISHING.md`, `GEMINI.md`, `TODO.md`, `store/`, or `.git/`.

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
  icons/
```

---

## 3. Submit to the Chrome Web Store

1. In the Developer Dashboard, click **New item**
2. Upload `potd.zip`
3. Fill in the store listing using the copy in [`store/listing.md`](store/listing.md)
4. Upload screenshots from `store/screenshots/`
5. Set the **Single purpose** field: "Replaces the new tab page with Wikipedia's Picture of the Day"

---

## 4. Privacy & Permissions Justification

The store will ask you to justify each permission:

| Permission | Justification |
|---|---|
| `storage` | Saves the cached image and date so the same image is not re-fetched within the same day |
| `host_permissions: *.wikimedia.org` | Fetches the POTD image and metadata from Wikimedia Commons |
| `host_permissions: *.wikipedia.org` | Fetches supplementary article metadata from the Wikipedia API |

You will also need to complete a **privacy practices** declaration. This extension collects no user data and makes no external requests except to Wikimedia/Wikipedia.

---

## 5. Review & Publication

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
