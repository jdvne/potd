import { potdDateElement, arrowRightElement } from "./dom-elements.js";
import { displayingDate, displayingDateString, userDisplayDateString, setDisplayingDate, setDisplayingDateString, setUserDisplayDateString } from "./state.js";
import { fetchPictureOfTheDay } from "./media-display.js"; // Will be created later

/**
 * Gets today's date normalized to midnight (00:00:00).
 * @returns {Date} Today's date at midnight.
 */
export function getTodayAtMidnight() {
  const today = new Date();
  today.setHours(0, 0, 0, 0); // Set to midnight
  return today;
}

/**
 * Formats a Date object to a YYYY-MM-DD string.
 * @param {Date} date The date to format.
 * @returns {string} The date in YYYY-MM-DD format.
 */
export function formatDateToYYYYMMDD(date) {
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
export function updateDisplayingDate(date) {
  setDisplayingDate(date);
  setDisplayingDateString(formatDateToYYYYMMDD(date));

  const day = date.getDate();
  const suffix = getOrdinalSuffix(day);
  const month = date.toLocaleDateString("en-US", { month: "long" });
  const year = date.getFullYear();

  setUserDisplayDateString(`${month} ${day}${suffix}, ${year}`);
  if (potdDateElement) {
    potdDateElement.textContent = userDisplayDateString; // Display the pretty printed date
  }
  updateRightArrowState(); // Update arrow state after date changes
}

/**
 * Updates the disabled state of the right arrow based on whether displayingDate is today or in the future.
 */
export function updateRightArrowState() {
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
export function navigateDate(direction) {
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