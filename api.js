const ENDPOINT = "https://en.wikipedia.org/w/api.php";
const COMMONS_ENDPOINT = "https://commons.wikimedia.org/w/api.php"; // New endpoint for Wikimedia Commons

export async function wikipediaApiFetch(params) {
  const url = `${ENDPOINT}?${new URLSearchParams({ origin: '*', ...params }).toString()}`;
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Wikipedia API request failed: ${response.statusText}`);
  }
  return response.json();
}

export async function commonsApiFetch(params) {
  const url = `${COMMONS_ENDPOINT}?${new URLSearchParams({ origin: '*', ...params }).toString()}`;
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(
      `Wikimedia Commons API request failed: ${response.statusText}`,
    );
  }
  return response.json();
}

export async function fetchWikimediaPotdFeed(feedUrl) {
  const url = new URL(feedUrl);
  url.searchParams.set('origin', '*');
  const response = await fetch(url.toString());
  if (!response.ok) {
    throw new Error(`Wikimedia Commons Atom feed request failed: ${response.statusText}`);
  }
  return response.text();
}