export let displayingDate = new Date();
export let displayingDateString = "";
export let userDisplayDateString = "";
export let currentArticleUrl = "";
export let currentAnimationFrameId = null;
export let currentPotdData = null;

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