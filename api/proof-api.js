// Vercel Serverless Function to proxy Midnight Proof Server requests
export const config = {
  api: {
    bodyParser: false, // Handle raw binary octet-stream payloads
  },
};

export default async function handler(req, res) {
  // CORS & PNA headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', '*');
  res.setHeader('Access-Control-Allow-Private-Network', 'true');

  if (req.method === 'OPTIONS') {
    res.status(204).end();
    return;
  }

  const PROVER_TARGET = process.env.PROOF_SERVER_URL || 'https://proof-server.preprod.midnight.network';
  
  // Extract target sub-path
  const match = req.query.match ? (Array.isArray(req.query.match) ? req.query.match.join('/') : req.query.match) : '';
  const subPath = match ? `/${match}` : (req.url?.replace(/^\/api\/proof-api/, '').replace(/^\/proof-api/, '') || '/check');
  const targetUrl = `${PROVER_TARGET.replace(/\/$/, '')}${subPath.startsWith('/') ? '' : '/'}${subPath}`;

  try {
    // Read raw request buffer
    const chunks = [];
    for await (const chunk of req) {
      chunks.push(chunk);
    }
    const bodyBuffer = Buffer.concat(chunks);

    const proxyHeaders = {
      'content-type': req.headers['content-type'] || 'application/octet-stream',
      'accept': req.headers['accept'] || '*/*',
    };

    const fetchOptions = {
      method: req.method,
      headers: proxyHeaders,
    };

    if (['POST', 'PUT', 'PATCH'].includes(req.method) && bodyBuffer.length > 0) {
      fetchOptions.body = bodyBuffer;
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 60000);
    fetchOptions.signal = controller.signal;

    const response = await fetch(targetUrl, fetchOptions);
    clearTimeout(timeoutId);

    const resArrayBuffer = await response.arrayBuffer();
    const resBuffer = Buffer.from(resArrayBuffer);

    res.status(response.status);
    response.headers.forEach((value, key) => {
      if (!['content-encoding', 'content-length', 'transfer-encoding'].includes(key.toLowerCase())) {
        res.setHeader(key, value);
      }
    });
    res.send(resBuffer);
  } catch (error) {
    console.error('Vercel Prover Proxy Error:', error);
    res.status(503).json({
      error: 'Remote Midnight Proof Server is currently unreachable from cloud gateway.',
      targetUrl,
      details: error?.message || String(error),
      solution: 'For local ZK proof generation, please use the local Docker proof server at http://localhost:6300 or run the gateway via "npm run build:start".',
    });
  }
}
