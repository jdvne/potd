import { arrowLeftElement, arrowRightElement, potdTitleElement, potdContainerElement, sharpImageElement } from "./dom-elements.js";
import { navigateDate } from "./date-utils.js";
import { currentArticleUrl, currentPotdData, displayingDate } from "./state.js";
import { startBackgroundAutoscroll } from "./media-display.js";

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
}