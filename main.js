import { updateDisplayingDate } from "./date-utils.js";
import { fetchPictureOfTheDay, parseWikimediaAtomFeed } from "./media-display.js";
import { setupEventListeners } from "./event-handlers.js";
import { displayingDate, feedMode, setWikimediaPotdFeed } from "./state.js";
import { fetchWikimediaPotdFeed as apiFetchWikimediaPotdFeed } from "./api.js";


async function initializeApp() {
  // Initialize with today's date and display it
  updateDisplayingDate(new Date());

  // Fetch Wikimedia POTD feed once at startup, regardless of initial feedMode
  const feedUrl = "https://commons.wikimedia.org/w/api.php?action=featuredfeed&feed=potd&feedformat=atom&language=en";
  try {
    const xmlString = await apiFetchWikimediaPotdFeed(feedUrl);
    const parsedFeed = await parseWikimediaAtomFeed(xmlString);
    setWikimediaPotdFeed(parsedFeed);
    console.log("Wikimedia POTD feed loaded successfully.");
  } catch (error) {
    console.error("Error loading Wikimedia POTD feed on startup:", error);
    // Continue app initialization even if feed fails to load
  }

  // Directly fetch the picture of the day based on the initial feedMode
  fetchPictureOfTheDay(displayingDate);

  // Setup all event listeners
  setupEventListeners();
}

initializeApp();