export let displayingDate = new Date();
export let displayingDateString = "";
export let userDisplayDateString = "";
export let currentArticleUrl = "";
export let currentAnimationFrameId = null;
export let currentPotdData = null;
const storedFeedMode = localStorage.getItem("feedMode");
export let feedMode = storedFeedMode ? storedFeedMode : "wikipedia";

// Cache for POTD data, keyed by date string (YYYY-MM-DD)
export const wikipediaPotdCache = {};
// wikimediaPotdCache is not directly used as a cache object,
// but rather the wikimediaPotdFeed array serves as the cache for Wikimedia.

export let wikimediaPotdFeed = []; // To store parsed Wikimedia POTD entries (only for initial parsing)

// Cache for full Wikimedia image data, keyed by filename
export const wikimediaImageDataCache = {};

export function getWikimediaImageDataFromCache(filename) {
  return wikimediaImageDataCache[filename];
}

export function setWikimediaImageDataCache(filename, data) {
  wikimediaImageDataCache[filename] = data;
}

// Setter functions for mutable state variables
export function setDisplayingDate(date) {
  displayingDate = date;
}

export function setDisplayingDateString(dateString) {
  displayingDateString = dateString;
}

export function setUserDisplayDateString(dateString) {
  userDisplayDateString = dateString;
}

export function setCurrentArticleUrl(url) {
  currentArticleUrl = url;
}

export function setCurrentAnimationFrameId(id) {
  currentAnimationFrameId = id;
}

export function setCurrentPotdData(data) {
  currentPotdData = data;
}

export function setFeedMode(mode) {
  feedMode = mode;
  localStorage.setItem("feedMode", mode);
}

export function setWikimediaPotdFeed(feed) {
  wikimediaPotdFeed = feed;
}

// Cache functions
export function getWikipediaPotdFromCache(dateString) {
  return wikipediaPotdCache[dateString];
}

export function setWikipediaPotdCache(dateString, data) {
  wikipediaPotdCache[dateString] = data;
}

// For Wikimedia, the initial feed provides entries by date.
// Full image data is lazily loaded and updates the entry within wikimediaPotdFeed directly.
// So, getWikimediaPotdFromCache will just find the entry in wikimediaPotdFeed.
export function getWikimediaPotdFromCache(dateString) {
  return wikimediaPotdFeed.find(entry => entry.date === dateString);
}

export function setWikimediaPotdCacheEntry(entry) {
  const index = wikimediaPotdFeed.findIndex(item => item.date === entry.date);
  if (index !== -1) {
    wikimediaPotdFeed[index] = entry;
  } else {
    // This case shouldn't happen if the feed is pre-loaded
    console.warn("Attempted to cache Wikimedia POTD entry not found in initial feed.");
  }
}