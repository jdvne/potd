# New Tab Customizer Extension

This is a simple browser extension designed to replace your browser's default new tab page with a custom one, displaying the "Picture of the Day" from Wikipedia or Wikimedia Commons.

## Features

This extension transforms your browser's new tab page into a dynamic display of the daily Picture of the Day (POTD), offering an engaging visual experience with navigation and information about the displayed media.

*   **Dynamic New Tab Content:** Replaces the default new tab page with a beautiful, full-screen display of the daily Wikipedia Picture of the Day, which can be either an image or a video.
*   **Historical Navigation:** Easily browse through past Pictures of the Day using intuitive navigation arrows or your keyboard's left/right arrow keys.
*   **Interactive Information Display:** A "liquid glass" overlay elegantly presents the title and description of the current POTD.
*   **Wikipedia Integration:** Click on the POTD title to directly open the related Wikipedia article in your current tab, providing more context and information.
*   **Expandable Descriptions:** Hover over the POTD title to reveal its full description, even if it's initially truncated.
*   **Immersive Backgrounds:** Images that are larger than the viewport automatically pan slowly, creating an immersive and dynamic visual experience.

## Setup Instructions

To use or develop this extension, you'll need to load it as an unpacked extension in your browser. The following instructions are generally applicable to Chromium-based browsers (e.g., Google Chrome, Microsoft Edge, Brave):

1.  **Download the Extension:**
    If you haven't already, download or clone this repository to your local machine.

2.  **Open Extension Management Page:**
    -   Open your browser.
    -   Navigate to the extensions management page. You can usually do this by typing `chrome://extensions` (for Chrome/Brave) or `edge://extensions` (for Edge) into your address bar and pressing Enter.

3.  **Enable Developer Mode:**
    -   On the extensions page, locate the "Developer mode" toggle, usually in the top right corner.
    -   Turn "Developer mode" **on**.

4.  **Load Unpacked Extension:**
    -   Once Developer mode is enabled, a new button, typically labeled "Load unpacked" or "Load extension," will appear. Click this button.
    -   A file browser dialog will open. Navigate to the directory where you downloaded/cloned this repository (the folder containing `manifest.json`, `new_tab.html`, etc.).
    -   Select this folder and click "Select" or "Open".

5.  **Verify Installation:**
    -   The extension should now appear in your list of installed extensions.
    -   Open a new tab in your browser. You should see your custom new tab page instead of the default one.

For more technical details on the project structure, modularization, and development specifics, please refer to [GEMINI.md](GEMINI.md).

## Building and Distributing

Releases are built automatically by GitHub Actions — pushing a version tag triggers a build and publishes the zip as a GitHub Release:

```bash
git tag v1.0
git push origin v1.0
```

To build locally instead, run `./build.sh` from the repo root. This produces `build/potd-v{version}.zip` with the version read automatically from `manifest.json`. The `build/` folder is gitignored and will never be committed.

For full instructions on submitting to the Chrome Web Store, see [PUBLISHING.md](PUBLISHING.md).

## License

The extension's source code is licensed under the **GNU General Public License v3.0** (GPL-3.0). See the [LICENSE](LICENSE) file for the full text. In short: you are free to use, modify, and distribute this code, but any derivative works must also be released under the GPL-3.0.

The **content displayed by this extension** — images, videos, and descriptions — is fetched from Wikipedia and Wikimedia Commons via their public APIs. That content is owned by its respective authors and is published under various **Creative Commons licenses** (most commonly [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/)). The extension displays attribution information as provided by the Wikimedia API. This extension is not affiliated with or endorsed by the Wikimedia Foundation.