const ENDPOINT = "https://en.wikipedia.org/w/api.php";
const COMMONS_ENDPOINT = "https://commons.wikimedia.org/w/api.php"; // New endpoint for Wikimedia Commons

// Cache DOM elements
const potdDateElement = document.getElementById("potd-date");
const arrowLeftElement = document.getElementById("arrow-left");
const arrowRightElement = document.getElementById("arrow-right");
const potdTitleElement = document.getElementById("potd-title");
const potdContainerElement = document.querySelector(".container"); // Assuming .container is the wrapping div
const sharpImageElement = document.getElementById("sharp-image");
const backgroundVideoElement = document.getElementById("background-video");

async function wikipediaApiFetch(params) {
  const url = `${ENDPOINT}?${new URLSearchParams(params).toString()}`;
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Wikipedia API request failed: ${response.statusText}`);
  }
  return response.json();
}

async function commonsApiFetch(params) {
  const url = `${COMMONS_ENDPOINT}?${new URLSearchParams(params).toString()}`;
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(
      `Wikimedia Commons API request failed: ${response.statusText}`,
    );
  }
  return response.json();
}

/**
 * Starts an autoscroll animation for the background image.
 * @param {string} imageUrl The URL of the image to autoscroll.
 * @param {HTMLElement} element The HTML element whose background to autoscroll (e.g., sharpImageElement).
 */
function startBackgroundAutoscroll(imageUrl, element) {
  if (currentAnimationFrameId) {
    cancelAnimationFrame(currentAnimationFrameId);
    currentAnimationFrameId = null;
  }

  element.style.display = "block";
  element.style.backgroundImage = `url('${imageUrl}')`;
  element.style.backgroundRepeat = "no-repeat";

  const img = new Image();
  img.src = imageUrl;

  img.onload = () => {
    const containerWidth = element.offsetWidth;
    const containerHeight = element.offsetHeight;
    const imageAspectRatio = img.naturalWidth / img.naturalHeight;
    const containerAspectRatio = containerWidth / containerHeight;

    let imageRenderedWidth, imageRenderedHeight;
    let scrollableDimension = 0;
    let isHorizontalScroll = false;

    // Determine if we need horizontal or vertical scroll, or just centering
    if (imageAspectRatio > containerAspectRatio) {
      // Image is relatively wider than the container -> prioritize horizontal scroll
      element.style.backgroundSize = `auto ${containerHeight}px`; // Fit height
      imageRenderedWidth =
        (img.naturalWidth / img.naturalHeight) * containerHeight;
      imageRenderedHeight = containerHeight;
      scrollableDimension = imageRenderedWidth - containerWidth;
      isHorizontalScroll = true;
      element.style.backgroundPosition = "0% 50%"; // Left-centered vertically
    } else {
      // Image is relatively taller or same aspect ratio as container -> prioritize vertical scroll
      element.style.backgroundSize = `${containerWidth}px auto`; // Fit width
      imageRenderedWidth = containerWidth;
      imageRenderedHeight =
        (img.naturalHeight / img.naturalWidth) * containerWidth;
      scrollableDimension = imageRenderedHeight - containerHeight;
      isHorizontalScroll = false;
      element.style.backgroundPosition = "50% 0%"; // Top-centered horizontally
    }

    if (scrollableDimension <= 0) {
      // If no scrolling is needed, just center the image
      element.style.backgroundPosition = "center center";
      return;
    }

    const scrollSpeed = 0.005; // Pixels per millisecond (half of original)
    let currentScroll; // Declare without initializing here
    let lastTimestamp = null;
    let scrollDirection; // Declare without initializing here

    // Initialize currentScroll and scrollDirection based on scroll type
    if (!isHorizontalScroll) {
      // If it's a vertical image that scrolls
      currentScroll = Math.max(0, scrollableDimension / 2); // Directly in the center
      scrollDirection = -1; // Start by scrolling "down" (currentScroll decreases)
    } else {
      // For horizontal images, start at the beginning
      currentScroll = 0;
      scrollDirection = 1; // Start by scrolling "right" (currentScroll increases)
    }

    const delayDuration = 1000; // 1 second delay at the edges
    let delayStartTime = null; // Tracks when the delay started

    function animateAutoscroll(timestamp) {
      if (!lastTimestamp) lastTimestamp = timestamp;
      const deltaTime = timestamp - lastTimestamp;
      lastTimestamp = timestamp;

      // Handle delay at edges
      if (delayStartTime !== null) {
        if (timestamp - delayStartTime < delayDuration) {
          // Still in delay, request next frame without updating scroll
          currentAnimationFrameId = requestAnimationFrame(animateAutoscroll);
          return;
        } else {
          // Delay finished, clear delayStartTime
          delayStartTime = null;
        }
      }

      currentScroll += scrollSpeed * deltaTime * scrollDirection;

      // Reverse direction if boundaries are reached
      let boundaryHit = false;
      if (currentScroll >= scrollableDimension) {
        currentScroll = scrollableDimension; // Snap to boundary
        scrollDirection = -1;
        boundaryHit = true;
      } else if (currentScroll <= 0) {
        currentScroll = 0; // Snap to boundary
        scrollDirection = 1;
        boundaryHit = true;
      }

      if (boundaryHit) {
        delayStartTime = timestamp; // Start delay
      }

      if (isHorizontalScroll) {
        element.style.backgroundPositionX = `-${currentScroll}px`;
      } else {
        element.style.backgroundPositionY = `-${currentScroll}px`;
      }

      currentAnimationFrameId = requestAnimationFrame(animateAutoscroll);
    }

    currentAnimationFrameId = requestAnimationFrame(animateAutoscroll);
  };

  img.onerror = () => {
    console.error("Failed to load image for autoscroll:", imageUrl);
    element.style.backgroundImage = "none";
    element.style.display = "none";
  };
}

/**
 * Gets today's date normalized to midnight (00:00:00).
 * @returns {Date} Today's date at midnight.
 */
function getTodayAtMidnight() {
  const today = new Date();
  today.setHours(0, 0, 0, 0); // Set to midnight
  return today;
}

let displayingDate = new Date(); // This will be our mutable date object
let displayingDateString = ""; // YYYY-MM-DD string for API and cache keys
let userDisplayDateString = ""; // Human-readable date string for display
let currentArticleUrl = ""; // Stores the URL of the currently displayed featured article
let currentAnimationFrameId = null; // Global variable to store animation frame ID
let currentPotdData = null; // Global variable to store the currently displayed POTD data

/**
 * Formats a Date object to a YYYY-MM-DD string.
 * @param {Date} date The date to format.
 * @returns {string} The date in YYYY-MM-DD format.
 */
function formatDateToYYYYMMDD(date) {
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, "0");
  const day = date.getDate().toString().padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/**
 * Returns the appropriate ordinal suffix for a day number (e.g., "st", "nd", "rd", "th").
 * @param {number} day The day of the month.
 * @returns {string} The ordinal suffix.
 */
function getOrdinalSuffix(day) {
  if (day > 3 && day < 21) return "th"; // Deals with 11th, 12th, 13th
  switch (day % 10) {
    case 1:
      return "st";
    case 2:
      return "nd";
    case 3:
      return "rd";
    default:
      return "th";
  }
}

/**
 * Updates the global displayingDate and its string representations, then updates the UI.
 * @param {Date} date The new date to display.
 */
function updateDisplayingDate(date) {
  displayingDate = date;
  displayingDateString = formatDateToYYYYMMDD(date);

  const day = date.getDate();
  const suffix = getOrdinalSuffix(day);
  const month = date.toLocaleDateString("en-US", { month: "long" });
  const year = date.getFullYear();

  userDisplayDateString = `${month} ${day}${suffix}, ${year}`;
  if (potdDateElement) {
    potdDateElement.textContent = userDisplayDateString; // Display the pretty printed date
  }
  updateRightArrowState(); // Update arrow state after date changes
}

/**
 * Updates the disabled state of the right arrow based on whether displayingDate is today or in the future.
 */
function updateRightArrowState() {
  const todayAtMidnight = getTodayAtMidnight();
  const displayingDateAtMidnight = new Date(displayingDate);
  displayingDateAtMidnight.setHours(0, 0, 0, 0);

  if (displayingDateAtMidnight >= todayAtMidnight) {
    arrowRightElement.classList.add("disabled-arrow");
  } else {
    arrowRightElement.classList.remove("disabled-arrow");
  }
}

/**
 * Navigates the displayed date by a given direction (+1 for forward, -1 for backward).
 * @param {number} direction The direction to navigate (-1 for backward, 1 for forward).
 */
function navigateDate(direction) {
  const newDate = new Date(displayingDate);
  newDate.setDate(newDate.getDate() + direction);
  newDate.setHours(0, 0, 0, 0); // Normalize newDate to midnight

  if (direction === 1) {
    // Only check for future dates when navigating right
    const todayAtMidnight = getTodayAtMidnight();
    if (newDate > todayAtMidnight) {
      return; // Do not go beyond today's date
    }
  }
  fetchPictureOfTheDay(newDate);
}

// Initialize with today's date and display it
updateDisplayingDate(new Date());
// Removed redundant updateRightArrowState() call here as it's called in updateDisplayingDate

// Directly fetch the picture of the day without caching checks at startup
fetchPictureOfTheDay(displayingDate);

// Renamed from fetchImageSrc and modified to fetch more info
async function fetchImageData(filename) {
  const paramsImageInfo = {
    action: "query",
    format: "json",
    prop: "imageinfo",
    iiprop: "url|dimensions|extmetadata",
    titles: filename,
    origin: "*",
    uselang: "en",
  };
  const dataImageInfo = await wikipediaApiFetch(paramsImageInfo); // Log raw data
  const pagesImageInfo = dataImageInfo.query.pages;
  const pageKeyImageInfo = Object.keys(pagesImageInfo)[0];

  let imageUrl = "";
  let width = 0;
  let height = 0;
  let isVideo = false; // Flag to indicate if it's a video
  let imageDescription = "";

  if (
    pageKeyImageInfo !== "-1" &&
    pagesImageInfo[pageKeyImageInfo].imageinfo &&
    pagesImageInfo[pageKeyImageInfo].imageinfo.length > 0
  ) {
    const imageInfo = pagesImageInfo[pageKeyImageInfo].imageinfo[0];
    imageUrl = imageInfo.url;
    width = imageInfo.width;
    height = imageInfo.height;

    // Extract image description from extmetadata, prioritizing ImageDescription then ObjectName
    if (imageInfo.extmetadata) {
      if (
        imageInfo.extmetadata.ImageDescription &&
        imageInfo.extmetadata.ImageDescription.value
      ) {
        imageDescription = imageInfo.extmetadata.ImageDescription.value;
      } else if (
        imageInfo.extmetadata.ObjectName &&
        imageInfo.extmetadata.ObjectName.value
      ) {
        imageDescription = imageInfo.extmetadata.ObjectName.value;
      }
    }
    // Check if the URL indicates a video file
    if (imageUrl.match(/\.(webm|mp4|ogv)$/i)) {
      isVideo = true;
    }
  } else {
    console.error("Could not fetch image info for:", filename);
    return null;
  }

  // Fetch the display title of the image file page
  const paramsDisplayTitle = {
    action: "query",
    format: "json",
    prop: "info",
    inprop: "displaytitle",
    titles: filename,
    origin: "*",
    uselang: "en",
  };
  const dataDisplayTitle = await wikipediaApiFetch(paramsDisplayTitle); // Log raw data
  const pagesDisplayTitle = dataDisplayTitle.query.pages;
  const pageKeyDisplayTitle = Object.keys(pagesDisplayTitle)[0];
  let displayTitle = filename.replace("File:", "").replace(/\.\w+$/, ""); // Fallback to filename

  if (
    pageKeyDisplayTitle !== "-1" &&
    pagesDisplayTitle[pageKeyDisplayTitle].title
  ) {
    displayTitle = pagesDisplayTitle[pageKeyDisplayTitle].title
      .replace("File:", "")
      .replace(/\.\w+$/, "");
  }

  const finalDescription = imageDescription;
  return {
    url: imageUrl,
    width: width,
    height: height,
    descriptionHtml: finalDescription, // Use the simplified description
    displayTitle: displayTitle, // Add the fetched display title
    is_video: isVideo, // Add the video flag
  };
}

// Modified to accept a date parameter and use fetchImageData
async function fetchPictureOfTheDay(date) {
  updateDisplayingDate(date); // Update the global date tracker and UI

  console.log(`Fetching picture of the day for ${displayingDateString}...`);
  const title = `Template:POTD_protected/${displayingDateString}`;
  const params = {
    action: "query",
    format: "json",
    formatversion: "2",
    prop: "images",
    titles: title,
    origin: "*",
    uselang: "en",
  };

  try {
    const data = await wikipediaApiFetch(params);
    const pages = data.query.pages;
    const pageKey = Object.keys(pages)[0];

    if (
      pageKey !== "-1" &&
      pages[pageKey].images &&
      pages[pageKey].images.length > 0
    ) {
      const filename = pages[pageKey].images[0].title;
      const image_page_url = `https://en.wikipedia.org/wiki/${encodeURIComponent(title)}`;
      const imageData = await fetchImageData(filename); // Call the new function

      if (imageData && imageData.url) {
        // Fetch featured article link
        const articleTitleParams = {
          action: "query",
          format: "json",
          prop: "revisions",
          rvprop: "content",
          titles: title, // This is the template title e.g. Template:POTD_protected/YYYY-MM-DD
          rvslots: "main",
          origin: "*",
          uselang: "en",
        };
        const articleData = await wikipediaApiFetch(articleTitleParams);
        const articlePages = articleData.query.pages;
        const articlePageKey = Object.keys(articlePages)[0];
        let featuredArticleUrl = "";

        if (
          articlePageKey !== "-1" &&
          articlePages[articlePageKey].revisions &&
          articlePages[articlePageKey].revisions.length > 0
        ) {
          const wikitext =
            articlePages[articlePageKey].revisions[0].slots.main["*"];
          // Use regex to find the first main article link, typically [[Article Name]]
          const match = wikitext.match(/\[\[([^:\]]+?)\]\]/); // Find [[Article Name]] but not [[File:...]] or [[Category:...]]
          if (match && match[1]) {
            featuredArticleUrl = `https://en.wikipedia.org/wiki/${encodeURIComponent(match[1].trim())}`;
          }
        }

        const potdData = {
          title: imageData.descriptionHtml || imageData.displayTitle, // Use descriptionHtml as title, fallback to displayTitle
          url: imageData.url,
          descriptionHtml: imageData.descriptionHtml, // Pass the simplified description
          pageUrl: image_page_url,
          articleUrl: featuredArticleUrl, // Add the featured article URL
          date: displayingDateString, // Add date to potdData for caching and consistent display          width: imageData.width,
          height: imageData.height,
          is_video: imageData.is_video, // IMPORTANT: Include the is_video flag
        };

        displayPicture(potdData);
      } else {
        console.error("Could not fetch image data for:", filename);
      }
    } else {
      console.error("Could not find POTD images for today using title:", title);
      displayError(
        "No Picture Found",
        `No Picture of the Day found for ${displayingDateString}.`,
      );
    }
  } catch (error) {
    console.error("Error fetching Picture of the Day:", error);
    displayError(
      "Error Loading Picture",
      `An error occurred while loading the Picture of the Day for ${displayingDateString}.`,
    );
  }
}

function displayError(title, message) {
  document.body.style.setProperty("--image-url", "none"); // Clear background image
  potdTitleElement.textContent = title;
  if (potdDateElement) {
    potdDateElement.textContent = userDisplayDateString;
  }
}

/**
 * Displays the Picture of the Day data on the page.
 * @param {object} potdData The data for the Picture of the Day.
 */
function displayPicture(potdData) {
  currentPotdData = potdData; // Store the current POTD data globally
  // Store new title and article URL immediately
  potdTitleElement.innerHTML = potdData.title;
  currentArticleUrl = potdData.articleUrl;

  // Set the text content of the date element
  if (potdDateElement) {
    potdDateElement.textContent = userDisplayDateString;
  }

  // If there's no URL, clear the image and display an error.
  if (!potdData.url) {
    document.body.style.setProperty("--image-url", "none");
    backgroundVideoElement.style.display = "none";
    sharpImageElement.style.display = "none";
    displayError(
      "No Media Available",
      "The media for this day could not be loaded.",
    );
    return;
  }

  // Determine what was previously displayed
  const wasVideo = backgroundVideoElement.style.display === "block";

  if (potdData.is_video) {
    // If new media is video and it's already the current video, do nothing
    if (wasVideo && backgroundVideoElement.src === potdData.url) {
      return;
    }

    // Keep current media visible while preloading new video
    // Set src, but keep display: none until ready
    backgroundVideoElement.src = potdData.url;
    backgroundVideoElement.load(); // Start loading the video

    backgroundVideoElement.oncanplaythrough = () => {
      // Once video is ready, swap
      sharpImageElement.style.display = "none"; // Hide static image if it was showing
      document.body.style.setProperty("--image-url", "none"); // Clear background image variable
      backgroundVideoElement.style.display = "block";
      backgroundVideoElement.play();
      backgroundVideoElement.oncanplaythrough = null; // Remove event listener
      if (currentAnimationFrameId) {
        // Stop any ongoing image autoscroll
        cancelAnimationFrame(currentAnimationFrameId);
        currentAnimationFrameId = null;
      }
    };

    backgroundVideoElement.onerror = () => {
      console.error("Failed to load video:", potdData.url);
      // On error, revert to previous state or show generic error
      document.body.style.setProperty("--image-url", "none"); // Clear background image variable
      backgroundVideoElement.style.display = "none";
      sharpImageElement.style.display = "none";
      displayError(
        "Video Load Error",
        `Could not load the video for ${userDisplayDateString}.`,
      );
      backgroundVideoElement.onerror = null; // Remove event listener
    };
  } else {
    // If new media is static image and it's already the current image, do nothing
    const currentImageUrl = document.body.style
      .getPropertyValue("--image-url")
      .slice(5, -2); // Extract URL from 'url("...")'
    if (!wasVideo && currentImageUrl === potdData.url) {
      return;
    }

    // Keep current media visible while preloading new image
    const img = new Image();
    img.src = potdData.url;

    img.onload = () => {
      // Once new image is loaded, swap
      backgroundVideoElement.pause();
      backgroundVideoElement.style.display = "none"; // Hide video if it was showing
      document.body.style.setProperty("--image-url", "none"); // Clear body background if sharpImageElement is taking over
      sharpImageElement.style.display = "block";
      startBackgroundAutoscroll(potdData.url, sharpImageElement); // Start autoscroll
    };

    img.onerror = () => {
      console.error("Failed to load image:", potdData.url);
      // On error, revert to previous state or show generic error
      document.body.style.setProperty("--image-url", "none"); // Clear background image variable
      backgroundVideoElement.style.display = "none";
      sharpImageElement.style.display = "none";
      displayError(
        "Image Load Error",
        `Could not load the image for ${userDisplayDateString}.`,
      );
    };
  }
}

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
