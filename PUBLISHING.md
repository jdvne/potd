# Publishing to the Chrome Web Store

## Prerequisites

- Google account
- $5 one-time Chrome Web Store developer registration fee
- PNG icons at 16×16, 32×32, 48×48, 64×64, and 128×128 (in `icons/`)
- At least one 1280×800 or 640×400 screenshot (in `store/screenshots/`)
- Small promotional tile 440×280 PNG (in `store/promotional/`)

Store listing copy, description, keywords, and screenshot/promotional image specs are in [`store/listing.md`](store/listing.md).

---

## 1. Register as a Developer

1. Go to the [Chrome Web Store Developer Dashboard](https://chrome.google.com/webstore/devconsole)
2. Sign in with your Google account
3. Pay the one-time $5 registration fee

---

## 2. Package the Extension

Releases are built automatically by GitHub Actions when a version tag is pushed.

1. Bump the `version` field in `manifest.json` (e.g. `"1.0"` → `"1.1"`)
2. Commit the change
3. Tag and push:
```bash
git tag v1.0
git push origin v1.0
```

GitHub Actions will run `build.sh` and publish a release at the repo's Releases page with the zip attached. Download the zip from there to submit to the store.

To build locally instead:
```bash
./build.sh
```
This produces `build/potd-v{version}.zip`. The `build/` folder is gitignored and will never be committed.

---

## 3. Submit to the Chrome Web Store

1. In the Developer Dashboard, click **New item**
2. Upload the zip from the repo's [Releases page](../../releases) (or from `build/` if built locally)
3. Fill in the store listing using the copy in [`store/listing.md`](store/listing.md)
4. Upload screenshots from `store/screenshots/`
5. Upload the small promotional tile from `store/promotional/tile_small.png`
6. Set the **Single purpose** field: "Replaces the new tab page with Wikipedia's Picture of the Day"

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
2. Commit, tag, and push (see Step 2 above) — GitHub Actions will build and publish the release automatically
3. Download the zip from the repo's Releases page
4. In the Developer Dashboard, open the existing item → **Package** → **Upload new package**
5. Submit for review

---

## Loading Locally (no account needed)

See the Setup Instructions in [README.md](README.md) for how to load the extension as an unpacked extension during development.
