/* global process */
export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const { path, ...queryParams } = req.query;

  if (!path) {
    return res.status(400).json({ error: 'Missing path parameter' });
  }

  const queryString = new URLSearchParams(queryParams).toString();
  const url = `https://api.coingecko.com/api/v3/${path}${queryString ? `?${queryString}` : ''}`;

  try {
    const options = {
      method: 'GET',
      headers: {
        accept: 'application/json',
        'x-cg-demo-api-key': process.env.COINGECKO_API_KEY || 'CG-iuDtWPxUbUnkot7RzuCY2K4T'
      }
    };

    const response = await fetch(url, options);

    if (response.status === 429) {
      return res.status(429).json({ error: 'Rate limit exceeded' });
    }

    if (!response.ok) {
      return res.status(response.status).json({ error: `CoinGecko API returned status ${response.status}` });
    }

    const data = await response.json();

    // Cache the response at Vercel's edge network for 60 seconds
    res.setHeader('Cache-Control', 'public, s-maxage=60, stale-while-revalidate=30');
    return res.status(200).json(data);
  } catch (error) {
    console.error('Error fetching from CoinGecko:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}
