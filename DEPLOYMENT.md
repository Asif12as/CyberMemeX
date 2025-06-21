# Deployment Guide for Meme Trading Platform

This guide will walk you through deploying your Meme Trading Platform using Netlify or Vercel (frontend) and Render (backend).

## Prerequisites

1. Create accounts on:
   - [Netlify](https://app.netlify.com/signup) or [Vercel](https://vercel.com/signup)
   - [Render](https://render.com/register)
2. Install CLI tools (optional for advanced usage):
   ```
   # For Vercel
   npm install -g vercel
   
   # For Netlify
   npm install -g netlify-cli
   ```

## Frontend Deployment

### Option 1: Using Netlify

#### Using Netlify Dashboard (Recommended)

1. Push your code to a Git repository (GitHub, GitLab, or Bitbucket)
2. Log in to [Netlify Dashboard](https://app.netlify.com/)
3. Click "New site from Git"
4. Import your Git repository
5. Configure project:
   - Build Command: `npm run build`
   - Publish Directory: `dist`
6. Add Environment Variables (under Site settings > Build & deploy > Environment):
   - `VITE_SUPABASE_URL`: Your Supabase URL
   - `VITE_SUPABASE_ANON_KEY`: Your Supabase anonymous key
   - `VITE_API_URL`: Your backend API URL (from Render deployment)
7. Click "Deploy site"

#### Using Netlify CLI

1. Navigate to your project directory
2. Run:
   ```
   netlify login
   netlify init
   ```
3. Follow the prompts to configure your project
4. Set environment variables:
   ```
   netlify env:set VITE_SUPABASE_URL your-supabase-url
   netlify env:set VITE_SUPABASE_ANON_KEY your-supabase-anon-key
   netlify env:set VITE_API_URL your-backend-url
   ```

### Option 2: Using Vercel

#### Using Vercel Dashboard

1. Push your code to a Git repository (GitHub, GitLab, or Bitbucket)
2. Log in to [Vercel Dashboard](https://vercel.com/dashboard)
3. Click "New Project"
4. Import your Git repository
5. Configure project:
   - Framework Preset: Vite
   - Build Command: `npm run build`
   - Output Directory: `dist`
6. Add Environment Variables:
   - `VITE_SUPABASE_URL`: Your Supabase URL
   - `VITE_SUPABASE_ANON_KEY`: Your Supabase anonymous key
   - `VITE_API_URL`: Your backend API URL (from Render deployment)
7. Click "Deploy"

#### Using Vercel CLI

1. Navigate to your project directory
2. Run:
   ```
   vercel login
   vercel
   ```
3. Follow the prompts to configure your project
4. Set environment variables:
   ```
   vercel env add VITE_SUPABASE_URL
   vercel env add VITE_SUPABASE_ANON_KEY
   vercel env add VITE_API_URL
   ```

## Backend Deployment (Render)

### Using Render Dashboard

1. Log in to [Render Dashboard](https://dashboard.render.com/)
2. Click "New" and select "Web Service"
3. Connect your Git repository
4. Configure service:
   - Name: `meme-platform-backend` (or your preferred name)
   - Environment: `Node`
   - Region: Choose closest to your users
   - Branch: `main` (or your default branch)
   - Build Command: `npm install`
   - Start Command: `node server/index.js`
5. Add Environment Variables:
   - `NODE_ENV`: `production`
   - `PORT`: `8080`
   - `SUPABASE_URL`: Your Supabase URL
   - `SUPABASE_SERVICE_KEY`: Your Supabase service key
   - `FRONTEND_URL`: Your Vercel frontend URL
6. Click "Create Web Service"

## Connecting Frontend and Backend

1. After deploying the backend, copy the Render service URL (e.g., `https://meme-platform-backend.onrender.com`)
2. Add this URL as the `VITE_API_URL` environment variable in your Netlify or Vercel project
3. Redeploy your frontend if necessary

## CORS Configuration

Ensure your backend server has CORS configured to accept requests from your frontend domain:

```javascript
// In server/index.js
app.use(cors({
  origin: process.env.FRONTEND_URL || 'https://your-app-name.netlify.app',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true
}));
```

## Socket.IO Configuration

Make sure your Socket.IO connection in the frontend is pointing to the correct backend URL:

```typescript
// In src/context/SocketContext.tsx
const backendUrl = import.meta.env.VITE_API_URL || 'https://meme-platform-backend.onrender.com';

const socket = io(backendUrl, {
  transports: ['websocket'],
  autoConnect: true
});
```

This ensures your application will connect to the correct backend regardless of whether you're deploying to Netlify or Vercel.

## Troubleshooting

1. **Connection Issues**: Ensure CORS is properly configured
2. **Socket.IO Not Connecting**: Verify WebSocket support is enabled on Render
3. **Environment Variables**: Double-check all environment variables are set correctly
4. **Build Failures**: Check build logs for errors

## Monitoring

- Netlify: Dashboard > Your Site > Deploys
- Vercel: Dashboard > Your Project > Deployments
- Render: Dashboard > Your Service > Logs

## Scaling Considerations

As your application grows:

1. Consider upgrading from Render's free tier for better performance
2. Set up a custom domain for both frontend and backend
3. Implement a CDN for static assets
4. Consider database scaling options in Supabase