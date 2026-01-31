# Project Overview: Picture of the Day (POTD) Chrome Extension

This project implements a Chrome Extension that displays the "Picture of the Day" on every new tab. It fetches high-quality images (or videos) and their descriptions from Wikimedia Commons and Wikipedia, providing an engaging visual experience with navigation and information about the displayed media.

## JavaScript Modularization

The original `new_tab.js` file was monolithic, handling various concerns from API communication to DOM manipulation and event handling. To improve maintainability, readability, and testability, the JavaScript codebase has been modularized into several distinct files, each with a specific responsibility.

Here's a summary of the new modular structure:

*   **`api.js`**:
    *   **Responsibility**: Handles all communication with external APIs, specifically the Wikipedia and Wikimedia Commons APIs.
    *   **Key Functions**: `wikipediaApiFetch`, `commonsApiFetch`.

*   **`dom-elements.js`**:
    *   **Responsibility**: Centralizes the caching and export of frequently accessed DOM elements. This prevents repetitive `document.getElementById` or `document.querySelector` calls throughout the application.
    *   **Key Exports**: `potdDateElement`, `arrowLeftElement`, `arrowRightElement`, `potdTitleElement`, `potdContainerElement`, `sharpImageElement`, `backgroundVideoElement`.

*   **`state.js`**:
    *   **Responsibility**: Manages the global state variables used across different modules. This includes mutable state related to the currently displayed media and date.
    *   **Key Exports**: `displayingDate`, `displayingDateString`, `userDisplayDateString`, `currentArticleUrl`, `currentAnimationFrameId`, `currentPotdData` (and their respective setter functions).

*   **`date-utils.js`**:
    *   **Responsibility**: Provides utility functions for date manipulation, formatting, and navigation. It interacts with the DOM to update date displays and with the state management to reflect the current date.
    *   **Key Functions**: `getTodayAtMidnight`, `formatDateToYYYYMMDD`, `getOrdinalSuffix`, `updateDisplayingDate`, `updateRightArrowState`, `navigateDate`.

*   **`media-display.js`**:
    *   **Responsibility**: Encapsulates the logic for fetching, processing, and displaying the Picture of the Day media (images and videos). This includes handling media loading, errors, and the background autoscroll animation.
    *   **Key Functions**: `startBackgroundAutoscroll`, `fetchImageData`, `fetchPictureOfTheDay`, `displayPicture`, `displayError`.

*   **`event-handlers.js`**:
    *   **Responsibility**: Sets up and manages all event listeners for user interactions (e.g., clicks on navigation arrows, keyboard events, hover effects, window resizing).
    *   **Key Functions**: `setupEventListeners`.

*   **`main.js`**:
    *   **Responsibility**: Serves as the application's entry point. It orchestrates the initialization process, calling the necessary functions from other modules to set up the display and event handlers.

## How to Install and Run the Extension

1.  **Clone the Repository**:
    ```bash
    git clone <repository-url>
    cd potd
    ```
2.  **Open Chrome Extensions Page**:
    *   Open your Chrome browser.
    *   Type `chrome://extensions` in the address bar and press Enter.
3.  **Enable Developer Mode**:
    *   Toggle on the "Developer mode" switch, usually located in the top-right corner of the Extensions page.
4.  **Load Unpacked Extension**:
    *   Click the "Load unpacked" button that appears after enabling Developer mode.
    *   Navigate to the directory where you cloned this repository (`/Users/josh/git/potd/`) and select it.
5.  **Enjoy!**:
    *   Open a new tab in Chrome, and you should see the Picture of the Day.
    *   Use the navigation arrows or keyboard left/right arrows to browse through past Pictures of the Day.
    *   Click on the title to open the corresponding Wikipedia article.
```