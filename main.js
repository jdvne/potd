import { updateDisplayingDate } from "./date-utils.js";
import { fetchPictureOfTheDay } from "./media-display.js";
import { setupEventListeners } from "./event-handlers.js";
import { displayingDate } from "./state.js";


// Initialize with today's date and display it
updateDisplayingDate(new Date());

// Directly fetch the picture of the day without caching checks at startup
fetchPictureOfTheDay(displayingDate);

// Setup all event listeners
setupEventListeners();