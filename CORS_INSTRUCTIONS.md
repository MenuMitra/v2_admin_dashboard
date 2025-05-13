# CORS Configuration for API Backend

This document provides instructions for configuring CORS (Cross-Origin Resource Sharing) on the backend API server to allow requests from the Admin Dashboard application.

## Background

The Admin Dashboard is a Next.js application that makes API requests directly to the backend server. When running in development mode (localhost), the browser enforces Same-Origin Policy, which prevents JavaScript from making requests to a different domain than the one serving the web page.

## Required CORS Headers

For the API to accept requests from the frontend application, the backend server must include the following headers in its responses:

```
Access-Control-Allow-Origin: http://localhost:3000
Access-Control-Allow-Methods: GET, POST, PUT, PATCH, DELETE, OPTIONS
Access-Control-Allow-Headers: Content-Type, Authorization
Access-Control-Allow-Credentials: true
```

When the application is deployed to production, the value for `Access-Control-Allow-Origin` should be updated to include the production domain (e.g., `https://admin.yourdomain.com`).

## Instructions for Different Backend Types

### For Node.js Express Applications

If the backend uses Express, add the following middleware:

```javascript
const cors = require('cors');

// Development CORS (allows requests from localhost)
app.use(cors({
  origin: ['http://localhost:3000', 'https://admin.yourdomain.com'],
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));
```

### For Python/Django Applications

For Django backends, use django-cors-headers:

```python
# Install django-cors-headers
# pip install django-cors-headers

# settings.py
INSTALLED_APPS = [
    # ...
    'corsheaders',
    # ...
]

MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',
    # ... other middleware
]

CORS_ALLOWED_ORIGINS = [
    'http://localhost:3000',
    'https://admin.yourdomain.com',
]

CORS_ALLOW_METHODS = [
    'GET',
    'POST',
    'PUT',
    'PATCH',
    'DELETE',
    'OPTIONS',
]

CORS_ALLOW_HEADERS = [
    'Content-Type',
    'Authorization',
]

CORS_ALLOW_CREDENTIALS = True
```

### For PHP/Laravel Applications

For Laravel, use the laravel-cors package:

```php
// Install fruitcake/laravel-cors
// composer require fruitcake/laravel-cors

// config/cors.php
return [
    'paths' => ['api/*'],
    'allowed_methods' => ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    'allowed_origins' => ['http://localhost:3000', 'https://admin.yourdomain.com'],
    'allowed_origins_patterns' => [],
    'allowed_headers' => ['Content-Type', 'Authorization'],
    'exposed_headers' => [],
    'max_age' => 0,
    'supports_credentials' => true,
];
```

## Testing CORS Configuration

Once the changes are implemented on the backend, you can test the CORS configuration by:

1. Running the Admin Dashboard application in development mode (`npm run dev`)
2. Opening the browser console and checking for CORS errors
3. Making a login request with a valid mobile number
4. If the request succeeds without CORS errors, the configuration is working

## Temporary Workarounds

Until the backend CORS configuration is updated, you may use browser extensions like "CORS Unblock" or "Allow CORS" to temporarily bypass CORS restrictions for testing purposes. 