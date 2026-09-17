import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DIST_DIR = path.join(__dirname, 'bboard-ui', 'dist');
const PROXY_TARGET = 'http://127.0.0.1:6300';
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

  // Proxy ZK Proof server calls (same-origin proxy)
  if (url.pathname.startsWith('/proof-api') || url.pathname.startsWith('/prove')) {
    const targetPath = url.pathname.replace(/^\/proof-api/, '') || '/prove';
    const proxyReq = http.request(
      `${PROXY_TARGET}${targetPath}${url.search}`,
      {
        method: req.method,
        headers: {
          ...req.headers,
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
      console.error('Proof proxy error:', err);
      res.writeHead(502, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Proof server unavailable', details: err.message }));
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
  console.log(`[UmbraCred Dev Server] Running at http://localhost:${PORT}`);
  console.log(`[UmbraCred Dev Server] Proxies /proof-api -> ${PROXY_TARGET}`);
});
