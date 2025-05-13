// Local development proxy server
// This script sets up a simple proxy server to bypass CORS restrictions

const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const cors = require('cors');

// Create Express server
const app = express();
const PORT = 3001;

// Enable CORS for all requests
app.use(cors());

// Log proxy requests
app.use((req, res, next) => {
  console.log(`[Proxy] ${req.method} ${req.url}`);
  next();
});

// Configure proxy middleware
const apiProxy = createProxyMiddleware({
  target: 'https://men4u.xyz',
  changeOrigin: true,
  pathRewrite: {
    '^/api': '/v2' // rewrite path from /api to /v2
  },
  onProxyRes: (proxyRes, req, res) => {
    // Add CORS headers to the response
    proxyRes.headers['Access-Control-Allow-Origin'] = '*';
    proxyRes.headers['Access-Control-Allow-Methods'] = 'GET,HEAD,PUT,PATCH,POST,DELETE';
    proxyRes.headers['Access-Control-Allow-Headers'] = 'Content-Type,Authorization';
  },
  onError: (err, req, res) => {
    console.error('Proxy error:', err);
    res.writeHead(500, {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*'
    });
    res.end(JSON.stringify({ error: 'Proxy error', message: err.message }));
  }
});

// Use the proxy for all /api requests
app.use('/api', apiProxy);

// Add a root route for testing
app.get('/', (req, res) => {
  res.json({ message: 'Proxy server is running!' });
});

// Start the server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Local proxy server running at http://localhost:${PORT}`);
  console.log(`Proxying requests from http://localhost:${PORT}/api/* to https://men4u.xyz/v2/*`);
  console.log('Press Ctrl+C to stop the server');
}); 