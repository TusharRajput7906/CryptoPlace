// Caching & Fetching utility functions
const fetchFromApi = async (path, params = {}) => {
  const queryString = new URLSearchParams(params).toString();
  const options = {
    method: "GET",
    headers: {
      accept: "application/json",
      "x-cg-demo-api-key": "CG-iuDtWPxUbUnkot7RzuCY2K4T"
    }
  };

  // Try calling our serverless API route first
  try {
    const localUrl = `/api/coingecko?path=${path}&${queryString}`;
    const res = await fetch(localUrl);
    if (res.ok) {
      return await res.json();
    }
    // If rate-limited (429), throw special error
    if (res.status === 429) {
      throw new Error("RATE_LIMIT");
    }
  } catch (err) {
    if (err.message === "RATE_LIMIT") {
      throw err;
    }
    // Fall back to direct CoinGecko API (e.g. during local npm run dev if api route is not running)
    console.warn("API route failed or not found, falling back to direct CoinGecko call", err);
  }

  // Direct fallback
  const directUrl = `https://api.coingecko.com/api/v3/${path}?${queryString}`;
  const response = await fetch(directUrl, options);
  if (response.status === 429) {
    throw new Error("RATE_LIMIT");
  }
  if (!response.ok) {
    throw new Error(`Direct fetch failed with status ${response.status}`);
  }
  return await response.json();
};

export const cachedFetch = async (path, params = {}, ttlMs = 60000) => {
  const queryString = new URLSearchParams(params).toString();
  const cacheKey = `cg_cache_${path}_${queryString}`;

  // Check sessionStorage cache first
  try {
    const cached = sessionStorage.getItem(cacheKey);
    if (cached) {
      const { data, timestamp } = JSON.parse(cached);
      if (Date.now() - timestamp < ttlMs) {
        return data;
      }
    }
  } catch {
    // Ignore cache retrieval errors
  }

  // Fetch the data
  const data = await fetchFromApi(path, params);

  // Store in cache
  try {
    sessionStorage.setItem(cacheKey, JSON.stringify({ data, timestamp: Date.now() }));
  } catch {
    // Ignore storage quota errors
  }

  return data;
};
