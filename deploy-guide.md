# Deployment Guide

## Prerequisites
- Node.js installed on your machine
- Git installed
- Vercel account (free at vercel.com)

## Step 1: Install Vercel CLI
```bash
npm install -g vercel
```

## Step 2: Login to Vercel
```bash
vercel login
```
Follow the prompts to authenticate with your Vercel account.

## Step 3: Install Dependencies
```bash
npm install
```

## Step 4: Set Up Environment Variables
1. Copy the example file:
   ```bash
   copy .env.example .env.local
   ```

2. Edit `.env.local` with your Spotify credentials:
   ```
   SPOTIFY_CLIENT_ID=your_actual_client_id
   SPOTIFY_CLIENT_SECRET=your_actual_client_secret
   SPOTIFY_REFRESH_TOKEN=your_actual_refresh_token
   ```

## Step 5: Test Locally (Optional)
```bash
npm run dev
```
Visit `http://localhost:3000/api/now-playing` to test.

## Step 6: Deploy to Vercel
```bash
vercel
```

Follow the prompts:
- Set up and deploy? **Y**
- Which scope? Choose your account
- Link to existing project? **N** (for first deployment)
- What's your project's name? **spotify-now-playing-api** (or your choice)
- In which directory is your code located? **./** 

## Step 7: Set Production Environment Variables
After deployment, set your environment variables in production:

```bash
vercel env add SPOTIFY_CLIENT_ID
vercel env add SPOTIFY_CLIENT_SECRET  
vercel env add SPOTIFY_REFRESH_TOKEN
```

For each command, paste your actual values when prompted and select "Production" environment.

## Step 8: Redeploy with Environment Variables
```bash
vercel --prod
```

Your API will be live at: `https://your-project-name.vercel.app/api/now-playing`