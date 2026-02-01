import { arrowLeftElement, arrowRightElement, potdTitleElement, potdContainerElement, sharpImageElement, wikipediaButton, wikimediaButton, feedSelectorContainer } from "./dom-elements.js";
import { navigateDate, updateDisplayingDate } from "./date-utils.js";
import { currentArticleUrl, currentPotdData, displayingDate, feedMode, setFeedMode } from "./state.js";
import { startBackgroundAutoscroll, fetchPictureOfTheDay } from "./media-display.js";


function updateFeedButtonsState(activeMode) {
  if (feedSelectorContainer) { // Ensure the container exists
    if (activeMode === "wikipedia") {
      feedSelectorContainer.classList.add("wikipedia-active");
      feedSelectorContainer.classList.remove("wikimedia-active");
    } else if (activeMode === "wikimedia") {
      feedSelectorContainer.classList.add("wikimedia-active");
      feedSelectorContainer.classList.remove("wikipedia-active");
    }
  }

  // Also update the individual button classes for any other styling that might depend on it (e.g., text color changes)
  if (wikipediaButton) {
    if (activeMode === "wikipedia") {
      wikipediaButton.classList.add("active");
    }
  } else {
    wikipediaButton.classList.remove("active");
  }
  if (wikimediaButton) {
    if (activeMode === "wikimedia") {
      wikimediaButton.classList.add("active");
    }
  } else {
    wikimediaButton.classList.remove("active");
  }
}

export function setupEventListeners() {
  // Add keyboard event listener for arrow keys
  document.addEventListener("keydown", function (event) {
    // Only navigate if the key event isn't from an input field
    if (event.target.tagName === "INPUT" || event.target.tagName === "TEXTAREA") {
      return;
    }

    if (event.key === "ArrowLeft") {
      navigateDate(-1);
    } else if (event.key === "ArrowRight") {
      navigateDate(1);
    }
  });

  arrowLeftElement.addEventListener("click", function () {
    navigateDate(-1);
  });

  arrowRightElement.addEventListener("click", function () {
    navigateDate(1);
  });

  // Add click listener for potd-title to navigate to the featured article
  potdTitleElement.addEventListener("click", function () {
    if (currentArticleUrl) {
      window.location.href = currentArticleUrl; // Navigate in current tab
    }
  });

  // Add hover listeners for potd-title to expand/shrink description
  if (potdContainerElement) {
    potdContainerElement.addEventListener("mouseover", function () {
      potdTitleElement.classList.add("expanded");
    });

    potdContainerElement.addEventListener("mouseout", function () {
      potdTitleElement.classList.remove("expanded");
    });
  }

  // Event listeners for feed selection buttons
  if (wikipediaButton) {
    wikipediaButton.addEventListener("click", () => {
      if (feedMode !== "wikipedia") {
        setFeedMode("wikipedia");
        updateFeedButtonsState("wikipedia");
        updateDisplayingDate(displayingDate); // Maintain current date
        fetchPictureOfTheDay(displayingDate);
      }
    });
  }

  if (wikimediaButton) {
    wikimediaButton.addEventListener("click", () => {
      if (feedMode !== "wikimedia") {
        setFeedMode("wikimedia");
        updateFeedButtonsState("wikimedia");
        updateDisplayingDate(displayingDate); // Maintain current date
        fetchPictureOfTheDay(displayingDate);
      }
    });
  }

  // Function to handle window resize
  function handleResize() {
    // Restart autoscroll if an image is currently displayed
    if (
      sharpImageElement.style.display === "block" &&
      currentPotdData &&
      currentPotdData.url
    ) {
      startBackgroundAutoscroll(currentPotdData.url, sharpImageElement);
    }
  }

  // Add resize event listener to window
  window.addEventListener("resize", handleResize);

  // Initial update of button states
  updateFeedButtonsState(feedMode);
}