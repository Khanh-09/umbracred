import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DIST_DIR = path.join(__dirname, 'bboard-ui', 'dist');
const PROVER_TARGET = 'http://127.0.0.1:6300';
const PORT = 8080;

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.wasm': 'application/wasm',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.prover': 'application/octet-stream',
  '.verifier': 'application/octet-stream',
  '.zkir': 'application/octet-stream',
  '.bzkir': 'application/octet-stream',
};

const server = http.createServer((req, res) => {
  // CORS & PNA headers for all responses
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', '*');
  res.setHeader('Access-Control-Allow-Private-Network', 'true');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  const url = new URL(req.url || '/', `http://${req.headers.host}`);

  // Proxy ZK Proof server calls directly to local Docker Proof Server
  if (url.pathname.startsWith('/proof-api') || url.pathname.startsWith('/prove')) {
    const subPath = url.pathname.replace(/^\/proof-api/, '') || '/prove';
    const targetUrl = `${PROVER_TARGET}${subPath}${url.search}`;

    const proxyHeaders = { ...req.headers };
    delete proxyHeaders.host;
    delete proxyHeaders.origin;
    delete proxyHeaders.referer;

    const proxyReq = http.request(
      targetUrl,
      {
        method: req.method,
        headers: {
          ...proxyHeaders,
          host: '127.0.0.1:6300',
        },
      },
      (proxyRes) => {
        res.writeHead(proxyRes.statusCode || 200, {
          ...proxyRes.headers,
          'access-control-allow-origin': '*',
          'access-control-allow-private-network': 'true',
        });
        proxyRes.pipe(res);
      },
    );

    proxyReq.on('error', (err) => {
      console.error('Local proof proxy error:', err.message);
      res.writeHead(502, { 'Content-Type': 'application/json' });
      res.end(
        JSON.stringify({
          error: 'Local Midnight Proof Server on port 6300 is unreachable.',
          details: err.message,
        }),
      );
    });

    req.pipe(proxyReq);
    return;
  }

  // Serve static files from dist
  let filePath = path.join(DIST_DIR, decodeURIComponent(url.pathname));
  if (!fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
    const indexPath = path.join(filePath, 'index.html');
    if (fs.existsSync(indexPath)) {
      filePath = indexPath;
    } else {
      filePath = path.join(DIST_DIR, 'index.html');
    }
  }

  if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';
    res.writeHead(200, { 'Content-Type': contentType });
    fs.createReadStream(filePath).pipe(res);
  } else {
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('Not Found');
  }
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`[UmbraCred Gateway] Running at http://localhost:${PORT}`);
  console.log(`[UmbraCred Gateway] Forwarding /proof-api -> ${PROVER_TARGET} (Docker)`);
});
