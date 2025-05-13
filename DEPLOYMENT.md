# Admin Dashboard Deployment Guide

This guide explains how to deploy the admin dashboard to Netlify as a static site.

## Prerequisites

- A Netlify account
- Git repository with your dashboard code
- Node.js and npm installed on your local machine

## Deployment Steps

### Option 1: Deploy via Netlify UI

1. Log in to your Netlify account
2. Click "Add new site" > "Import an existing project"
3. Connect to your Git provider (GitHub, GitLab, etc.)
4. Select your repository
5. Configure the build settings:
   - Build command: `npm run build:static`
   - Publish directory: `out`
6. Click "Deploy site"

### Option 2: Deploy via Netlify CLI

1. Install the Netlify CLI: `npm install -g netlify-cli`
2. Log in to Netlify: `netlify login`
3. Initialize your site: `netlify init`
4. Follow the prompts to connect to your repo and configure settings
5. Deploy: `netlify deploy --prod`

## Environment Variables

The following environment variables should be set in Netlify:

- `NEXT_PUBLIC_API_ENV`: Set to `prod` for production
- `NEXT_PUBLIC_API_URL`: Set to `https://men4u.xyz/v2`
- `NEXT_PUBLIC_STATIC_EXPORT`: Set to `true`

## Post-Deployment

After deployment, verify:

1. The site is accessible
2. Authentication works
3. API calls are functioning correctly

## Troubleshooting

### API Connectivity Issues

If the API calls aren't working:

1. Check browser console for CORS errors
2. Ensure the backend API has CORS enabled for your domain
3. Verify the `NEXT_PUBLIC_API_URL` is correct

### Page Navigation Issues

For page navigation problems:

1. Check that the Netlify redirects are properly configured
2. The `netlify.toml` file should include a redirect rule:
   ```
   [[redirects]]
     from = "/*"
     to = "/index.html"
     status = 200
   ```

### Build Errors

If the build fails:

1. Review the build logs in Netlify
2. Run the build locally with `npm run build:static` to troubleshoot
3. Consider temporarily disabling problematic routes 