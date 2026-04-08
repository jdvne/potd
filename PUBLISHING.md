# Publishing

This document covers publishing to both the Chrome Web Store and Microsoft Edge Add-ons. The same zip package is used for both stores.

All store copy — descriptions, permission justifications, keywords, certification notes, and asset specs — is in [`store/listing.md`](store/listing.md).

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

**Prerequisites:** Google account, $5 one-time registration fee.

### Submit

1. Go to the [Chrome Web Store Developer Dashboard](https://chrome.google.com/webstore/devconsole) and register if needed
2. Click **New item** and upload the zip
3. Fill in the store listing, permissions justifications, and privacy declaration using [`store/listing.md`](store/listing.md)
4. Upload screenshots from `store/screenshots/` and the promotional tile from `store/promotional/`
5. Submit for review — typically a few days

### Update

1. Build and tag a new release (see above)
2. In the Developer Dashboard, open the existing item → **Package** → **Upload new package**
3. Submit for review

---

## Microsoft Edge Add-ons

**Prerequisites:** Microsoft account. Registration is **free**.

### Submit

1. Go to [Partner Center](https://partner.microsoft.com/dashboard/microsoftedge/public/login?ref=dd) and register if needed
2. Click **Create new extension** and upload the zip
3. Fill in availability (Public, all markets), properties, and store listing using [`store/listing.md`](store/listing.md)
4. Upload screenshots from `store/screenshots/`, the promotional tile from `store/promotional/`, and the extension logo
5. Add certification notes from [`store/listing.md`](store/listing.md) on the submission page
6. Submit for review — up to 7 business days

### Update

1. Build and tag a new release (see above)
2. In Partner Center, open the existing extension → **Packages** → upload the new zip
3. Submit for review

---

## Loading Locally (no account needed)

See the Setup Instructions in [README.md](README.md) for how to load the extension as an unpacked extension during development.
