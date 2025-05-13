# Local Proxy Setup for Development

This document explains how to set up and use the local development proxy server, which bypasses CORS restrictions when working with the API.

## Why is this needed?

When running the admin dashboard in development mode (on `localhost:3000`), the browser enforces CORS (Cross-Origin Resource Sharing) restrictions that prevent direct API calls to the backend server (`men4u.xyz`). The proxy server acts as a middleman, making the requests on behalf of your frontend application.

## Installation

1. Install the required dependencies:

```bash
npm install express cors http-proxy-middleware concurrently --save
```

2. The proxy server is configured in `local-proxy.js` in the project root directory.

## Usage

### Option 1: Start both servers together (recommended)

Run the following command to start both the Next.js dev server and the proxy server simultaneously:

```bash
npm run dev:proxy
```

This will start:
- Next.js development server on http://localhost:3000
- Proxy server on http://localhost:3001

### Option 2: Start servers separately

If you want to run the servers in separate terminal windows:

```bash
# Terminal 1: Start Next.js
npm run dev

# Terminal 2: Start proxy server
npm run proxy
```

## How it works

1. The proxy server runs on `http://localhost:3001`
2. API requests from your frontend are automatically directed to `http://localhost:3001/api/*`
3. The proxy forwards these requests to `https://men4u.xyz/v2/*`
4. The proxy adds CORS headers to the responses, allowing your frontend to receive them

## Troubleshooting

If you experience issues with the proxy:

1. Check that both servers are running (Next.js and proxy)
2. Verify in your browser's network tab that requests are going to `localhost:3001/api/*`
3. Look for error messages in both terminal windows
4. Check that your API endpoints are correctly formatted

## Production Deployment

The proxy is only needed for local development. When you deploy to production:

1. The API URL will automatically switch to `https://men4u.xyz/v2`
2. CORS headers should be configured on the backend server as described in `CORS_INSTRUCTIONS.md` 