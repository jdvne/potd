# Publishing

This document covers publishing to both the Chrome Web Store and Microsoft Edge Add-ons. The same zip package is used for both stores.

Store listing copy, description, keywords, and asset specs are in [`store/listing.md`](store/listing.md).

---

## Building the Package

Releases are built automatically by GitHub Actions when a version tag is pushed:

1. Bump the `version` field in `manifest.json` (e.g. `"1.0"` → `"1.1"`)
2. Commit, tag, and push:
```bash
git tag v1.1
git push origin v1.1
```

GitHub Actions builds the zip and publishes it as a GitHub Release. Download it from the [Releases page](../../releases).

To build locally instead:
```bash
./build.sh
```
This produces `build/potd-v{version}.zip`. The `build/` folder is gitignored and will never be committed.

---

## Chrome Web Store

### Prerequisites

- Google account
- $5 one-time developer registration fee
- PNG icons at 16×16, 32×32, 48×48, 64×64, and 128×128 (in `icons/`)
- Screenshots at 1280×800 or 640×400 (in `store/screenshots/`)
- Small promotional tile 440×280 PNG (in `store/promotional/`)

### 1. Register as a Developer

1. Go to the [Chrome Web Store Developer Dashboard](https://chrome.google.com/webstore/devconsole)
2. Sign in with your Google account
3. Pay the one-time $5 registration fee

### 2. Submit

1. In the Developer Dashboard, click **New item**
2. Upload the zip from the Releases page (or `build/` if built locally)
3. Fill in the store listing using the copy in [`store/listing.md`](store/listing.md)
4. Upload screenshots from `store/screenshots/`
5. Upload the small promotional tile from `store/promotional/tile_small.png`
6. Set the **Single purpose** field: "Replaces the new tab page with Wikipedia's Picture of the Day"

### 3. Privacy & Permissions Justification

**Storage justification** *(1000 char max)*:
> Stores the date of the last fetched Picture of the Day so the extension can avoid redundant API requests and display cached content when the same date is revisited within a session.

**Host permission justification** *(1000 char max)*:
> This extension fetches the daily Picture of the Day from the Wikimedia Commons Atom feed (wikimedia.org) and supplementary article metadata from the Wikipedia API (wikipedia.org). These are the sole external requests made by the extension. No user data is transmitted.

**Remote code:** No

You will also need to complete a **privacy practices** declaration. This extension collects no user data and makes no external requests except to Wikimedia/Wikipedia.

### 4. Review & Publication

- Initial reviews typically take a few days
- Google may request changes to the description or permissions justification — respond promptly in the dashboard
- Once approved, the extension goes live automatically

### Updating on Chrome

1. Build and tag a new release (see Building the Package above)
2. In the Developer Dashboard, open the existing item → **Package** → **Upload new package**
3. Submit for review

---

## Microsoft Edge Add-ons

Registration is **free** — no developer fee. The same zip package used for Chrome works for Edge without modification.

### Prerequisites

- Microsoft account
- Screenshots at 1280×800 or 640×400 (same as Chrome — reuse `store/screenshots/`)
- Extension logo: 300×300 PNG (use `icons/icon128.png` or create a dedicated 300×300)
- Small promotional tile 440×280 PNG (same as Chrome — reuse `store/promotional/tile_small.png`)

### 1. Register as a Developer

1. Go to [Partner Center](https://partner.microsoft.com/dashboard/microsoftedge/public/login?ref=dd)
2. Sign in with your Microsoft account
3. Register for the Microsoft Edge extensions program (free)

### 2. Submit

1. In Partner Center, click **Create new extension**
2. Go to **Packages** and upload the zip
3. On the **Availability** page: set visibility to **Public**, markets to **All markets**
4. On the **Properties** page:
   - Category: **Productivity** *(closest available to Art & Design on Edge)*
   - Privacy policy requirements: **No** (extension collects no personal data)
5. On the **Store Listings** page, click **Edit details** for English and fill in:
   - Description: use the copy from [`store/listing.md`](store/listing.md) *(250–10,000 chars)*
   - Extension logo: 300×300 PNG
   - Small promotional tile: `store/promotional/tile_small.png`
   - Screenshots: upload from `store/screenshots/`
   - Search terms: use the keywords from [`store/listing.md`](store/listing.md) *(max 7 terms, 21 words total)*

### 3. Certification Notes

On the **Submit your extension** page, add notes for the certification team:

> This extension replaces the new tab page with the Wikipedia Picture of the Day, fetched from the Wikimedia Commons public API. No user accounts, logins, or personal data are involved. Navigation arrows and keyboard left/right keys allow browsing past entries.

### 4. Review & Publication

- Certification takes up to 7 business days
- Once approved, the extension is published automatically at [Microsoft Edge Add-ons](https://microsoftedge.microsoft.com)

### Updating on Edge

1. Build and tag a new release (see Building the Package above)
2. In Partner Center, open the existing extension → **Packages** → upload the new zip
3. Submit for review

---

## Loading Locally (no account needed)

See the Setup Instructions in [README.md](README.md) for how to load the extension as an unpacked extension during development.
