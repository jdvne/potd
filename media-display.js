import { wikipediaApiFetch, commonsApiFetch, fetchWikimediaPotdFeed } from "./api.js";
import { potdDateElement, potdTitleElement, sharpImageElement, backgroundVideoElement } from "./dom-elements.js";
import { updateDisplayingDate, formatDateToYYYYMMDD } from "./date-utils.js";
import { currentAnimationFrameId, currentPotdData, setCurrentAnimationFrameId, setCurrentPotdData, setCurrentArticleUrl, displayingDateString, userDisplayDateString, feedMode, wikimediaPotdFeed, setWikimediaPotdFeed, getWikimediaImageDataFromCache, setWikimediaImageDataCache, wikipediaPotdCache, setWikipediaPotdCache, getWikipediaPotdFromCache, getWikimediaPotdFromCache, setWikimediaPotdCacheEntry } from "./state.js";


/**
 * Starts an autoscroll animation for the background image.
 * @param {string} imageUrl The URL of the image to autoscroll.
 * @param {HTMLElement} element The HTML element whose background to autoscroll (e.g., sharpImageElement).
 */
export function startBackgroundAutoscroll(loadedImageElement, element) {
  if (currentAnimationFrameId) {
    cancelAnimationFrame(currentAnimationFrameId);
    setCurrentAnimationFrameId(null);
  }

  element.style.display = "block";
  element.style.backgroundImage = `url('${loadedImageElement.src}')`;
  element.style.backgroundRepeat = "no-repeat";

  // Use the passed loadedImageElement directly
  const img = loadedImageElement;

  // The image is already loaded, so we can proceed directly
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
    imageRenderedWidth = (img.naturalWidth / img.naturalHeight) * containerHeight;
    imageRenderedHeight = containerHeight;
    scrollableDimension = imageRenderedWidth - containerWidth;
    isHorizontalScroll = true;
    element.style.backgroundPosition = "0% 50%"; // Left-centered vertically
  } else {
    // Image is relatively taller or same aspect ratio as container -> prioritize vertical scroll
    element.style.backgroundSize = `${containerWidth}px auto`; // Fit width
    imageRenderedWidth = containerWidth;
    imageRenderedHeight = (img.naturalHeight / img.naturalWidth) * containerWidth;
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
        setCurrentAnimationFrameId(requestAnimationFrame(animateAutoscroll));
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

    setCurrentAnimationFrameId(requestAnimationFrame(animateAutoscroll));
  }

  setCurrentAnimationFrameId(requestAnimationFrame(animateAutoscroll));
}

// Renamed from fetchImageSrc and modified to fetch more info
async function fetchImageData(filename) {
  // Check cache first
  const cachedData = getWikimediaImageDataFromCache(filename);
  if (cachedData) {
    return cachedData;
  }

  const paramsImageInfo = {
    action: "query",
    format: "json",
    prop: "imageinfo",
    iiprop: "url|dimensions|extmetadata",
    titles: filename,
    origin: "*",
    uselang: "en",
  };
  const dataImageInfo = await commonsApiFetch(paramsImageInfo); // Log raw data
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
  const dataDisplayTitle = await commonsApiFetch(paramsDisplayTitle); // Log raw data
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
  const imageData = {
    url: imageUrl,
    width: width,
    height: height,
    descriptionHtml: finalDescription, // Use the simplified description
    displayTitle: displayTitle, // Add the fetched display title
    is_video: isVideo, // Add the video flag
  };

  setWikimediaImageDataCache(filename, imageData); // Store in cache

  return imageData;
}

/**
 * Parses the Wikimedia Commons Atom feed to extract POTD data.
 * @param {string} xmlString The XML string of the Atom feed.
 * @returns {Array} An array of POTD data objects.
 */
export async function parseWikimediaAtomFeed(xmlString) {
  const parser = new DOMParser();
  const xmlDoc = parser.parseFromString(xmlString, "application/xml");
  const entries = xmlDoc.querySelectorAll("entry");
  const potdEntries = [];

  for (const entry of entries) {
    const id = entry.querySelector("id")?.textContent;
    const dateMatch = id ? id.match(/potd\/(\d{8})/) : null;
    const dateString = dateMatch ? dateMatch[1] : null; // YYYYMMDD

    // Convert YYYYMMDD to YYYY-MM-DD
    const formattedDate = dateString ? `${dateString.substring(0, 4)}-${dateString.substring(4, 6)}-${dateString.substring(6, 8)}` : '';

    const title = entry.querySelector("title")?.textContent;
    const summaryHtml = entry.querySelector("summary")?.textContent;

    if (!summaryHtml) {
      console.warn("No summary HTML found for entry:", title);
      continue;
    }

    const tempDiv = document.createElement("div");
    tempDiv.innerHTML = summaryHtml;

    // Extract image filename from the srcset of the img tag
    const imgElement = tempDiv.querySelector("img.mw-file-element");
    let filename = '';
    let thumbUrl = '';
    let description = '';
    let articleUrl = '';

    if (imgElement) {
      thumbUrl = imgElement.src;
      const srcset = imgElement.srcset;
      // Extract the filename from the first URL in srcset or from src
      // Example srcset: https://upload.wikimedia.org/wikipedia/commons/thumb/9/93/Colors_of_Bishwa_Ijtema.jpg/500px-Colors_of_Bishwa_Ijtema.jpg 1.5x, https://upload.wikimedia.org/wikipedia/commons/thumb/9/93/Colors_of_Bishwa_Ijtema.jpg/960px-Colors_of_Bishwa_Ijtema.jpg 2x
      // Example filename: File:Colors_of_Bishwa_Ijtema.jpg
      const fileMatch = srcset ? srcset.match(/File:([^ ]+)/) : null; 
      if (fileMatch && fileMatch[1]) {
        // The filename is typically the part after /thumb/././ and before the /widthpx- part
        // This regex is more robust to get the actual filename
        const filenameFromSrcset = fileMatch[1].match(/([^\/]+\.\w+)$/);
        if (filenameFromSrcset && filenameFromSrcset[1]) {
            filename = "File:" + decodeURIComponent(filenameFromSrcset[1]);
        }
      } else {
        // Fallback if srcset is not reliable or not present, try from src
        const srcMatch = thumbUrl.match(/\/thumb\/\w\/\w{2}\/([^/]+)\//);
        if (srcMatch && srcMatch[1]) {
            filename = "File:" + decodeURIComponent(srcMatch[1]);
        }
      }
      
      // Extract description from the .description.en div
      const descriptionElement = tempDiv.querySelector("div.description.en");
      if (descriptionElement) {
          description = descriptionElement.textContent.trim();
      }

      // Extract article URL from the first external link (extiw) within the description
      const articleLink = tempDiv.querySelector("div.description.en a.extiw");
      if (articleLink && articleLink.href) {
          articleUrl = articleLink.href;
      }
    } else {
        console.warn("No image element found in summary for entry:", title);
        continue;
    }
    
    // Lazy loading: Do not fetch fullImageData here. Store filename and thumbUrl.
    potdEntries.push({
      date: formattedDate,
      title: description || title, // Prefer description as title
      descriptionHtml: description,
      url: thumbUrl, // Initially use thumbnail URL
      pageUrl: `https://commons.wikimedia.org/wiki/${encodeURIComponent(filename)}`,
      articleUrl: articleUrl,
      filename: filename, // Store filename for lazy loading
      width: 0, // Placeholder
      height: 0, // Placeholder
      is_video: false, // Placeholder
      rawEntry: entry, // Keep raw entry for debugging if needed
    });
  }
  return potdEntries;
}

// Helper function to fetch and cache Wikipedia POTD data
async function fetchWikipediaPotdData(date) {
  const dateString = formatDateToYYYYMMDD(date);
  let potdData = getWikipediaPotdFromCache(dateString);
  if (potdData) {
    return potdData;
  }

  const title = `Template:POTD_protected/${dateString}`;
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
      const imageData = await fetchImageData(filename);

      if (imageData && imageData.url) {
        const articleTitleParams = {
          action: "query",
          format: "json",
          prop: "revisions",
          rvprop: "content",
          titles: title,
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
          const match = wikitext.match(/\[\[([^:\]]+?)\]\]/);
          if (match && match[1]) {
            featuredArticleUrl = `https://en.wikipedia.org/wiki/${encodeURIComponent(match[1].trim())}`;
          }
        }

        potdData = {
          title: imageData.descriptionHtml || imageData.displayTitle,
          url: imageData.url,
          descriptionHtml: imageData.descriptionHtml,
          pageUrl: image_page_url,
          articleUrl: featuredArticleUrl,
          date: dateString,
          width: imageData.width,
          height: imageData.height,
          is_video: imageData.is_video,
        };
        setWikipediaPotdCache(dateString, potdData); // Cache the fetched data
        return potdData;
      } else {
        console.error("Could not fetch image data for:", filename);
      }
    } else {
      console.error("Could not find POTD images for today using title:", title);
    }
  } catch (error) {
    console.error("Error fetching Wikipedia Picture of the Day:", error);
  }
  return null;
}

// Helper function to fetch and cache Wikimedia POTD data
async function fetchWikimediaPotdData(date) {
  const dateString = formatDateToYYYYMMDD(date);
  let entry = getWikimediaPotdFromCache(dateString); // Get entry from the pre-loaded feed

  if (entry) {
    // If full image data hasn't been fetched yet, fetch it now
    if ((!entry.width || !entry.height) && entry.filename) {
      console.log(`Lazily fetching full image data for Wikimedia POTD: ${entry.filename}`);
      const fullImageData = await fetchImageData(entry.filename);
      if (fullImageData) {
        entry = { ...entry, ...fullImageData };
        setWikimediaPotdCacheEntry(entry); // Update the stored entry with full data
      } else {
        console.error("Failed to lazily fetch full image data for:", entry.filename);
        entry.url = entry.thumbUrl || "";
      }
    }
    return entry;
  } else {
    console.error("Could not find Wikimedia POTD for date:", dateString);
  }
  return null;
}

// Orchestrator function to fetch and display Picture of the Day for current date and mode
export async function fetchPictureOfTheDay(date) {
  updateDisplayingDate(date);
  console.log(`Fetching picture of the day for ${displayingDateString}...`);

  let wikipediaDataPromise = fetchWikipediaPotdData(date);
  let wikimediaDataPromise = fetchWikimediaPotdData(date);

  // Await both fetches to ensure caches are populated
  await Promise.all([wikipediaDataPromise, wikimediaDataPromise]);

  let potdDataToDisplay = null;
  if (feedMode === "wikipedia") {
    potdDataToDisplay = await wikipediaDataPromise;
  } else if (feedMode === "wikimedia") {
    potdDataToDisplay = await wikimediaDataPromise;
  }

  if (potdDataToDisplay) {
    displayPicture(potdDataToDisplay);
  } else {
    displayError(
      "No Picture Found",
      `No Picture of the Day found for ${displayingDateString} in ${feedMode} mode.`,
    );
  }
}
export function displayError(title, message) {
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
export async function displayPicture(potdData) {
  setCurrentPotdData(potdData); // Store the current POTD data globally
  // Store new title and article URL immediately
  potdTitleElement.innerHTML = potdData.title;
  setCurrentArticleUrl(potdData.articleUrl);

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
        setCurrentAnimationFrameId(null);
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

    try {
      await img.decode(); // Asynchronously decode the image
      // Once new image is decoded and loaded, swap
      backgroundVideoElement.pause();
      backgroundVideoElement.style.display = "none"; // Hide video if it was showing
      document.body.style.setProperty("--image-url", "none"); // Clear body background if sharpImageElement is taking over
      sharpImageElement.style.display = "block"; // Ensure sharpImageElement is visible before autoscroll
      startBackgroundAutoscroll(img, sharpImageElement); // Pass the loaded image object
    } catch (error) {
      console.error("Failed to decode image:", potdData.url, error);
      // On error, revert to previous state or show generic error
      document.body.style.setProperty("--image-url", "none"); // Clear background image variable
      backgroundVideoElement.style.display = "none";
      sharpImageElement.style.display = "none";
      displayError(
        "Image Load Error",
        `Could not load or decode the image for ${userDisplayDateString}.`,
      );
    }
  }
}