export const config = {
  api: {
    bodyParser: false,
    responseLimit: false,
  },
  maxDuration: 60,
};

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', '*');

  if (req.method === 'OPTIONS') {
    res.status(204).end();
    return;
  }

  const parsedUrl = new URL(req.url, 'http://localhost');
  let subPath = parsedUrl.searchParams.get('match');

  if (!subPath) {
    subPath = parsedUrl.pathname
      .replace(/^\/api\/proof-api\/?/, '')
      .replace(/^\/api\/proof\/?/, '')
      .replace(/^\/proof-api\/?/, '')
      .replace(/^\/api\/?/, '');
  }

  subPath = (subPath || '').replace(/^\/+/, '');
  if (!subPath) {
    subPath = 'prove';
  }

  const targetUrl = `https://proof-server.preprod.midnight.network/${subPath}`;

  try {
    const fetchRes = await fetch(targetUrl, {
      method: req.method,
      headers: {
        'Content-Type': req.headers['content-type'] || 'application/json',
      },
      body: req.method !== 'GET' && req.method !== 'HEAD' ? req : undefined,
      duplex: 'half',
    });

    res.status(fetchRes.status);
    const data = await fetchRes.arrayBuffer();
    res.send(Buffer.from(data));
  } catch (error) {
    console.error(`Prover proxy error (${targetUrl}):`, error);
    res.status(502).json({ error: 'Failed to proxy to Midnight Proof Server', details: error.message });
  }
}
