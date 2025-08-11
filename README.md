# Spotify Now Playing API

A Vercel-hosted API endpoint that fetches currently playing song details from Spotify.

## 🎵 Currently Playing

![Spotify Now Playing](https://spotify-now-playing-alpha.vercel.app/svg)

## Setup

1. **Create a Spotify App**
   - Go to [Spotify Developer Dashboard](https://developer.spotify.com/dashboard)
   - Create a new app
   - Note your Client ID and Client Secret

2. **Get Refresh Token**
   - Use the authorization code flow to get a refresh token
   - You can use this tool: [spotify-auth-pkce-node](https://github.com/tobimori/spotify-auth-pkce-node)
   - Or follow Spotify's authorization guide

3. **Environment Variables**
   - Copy `.env.example` to `.env.local` for local development
   - Set the following variables in Vercel dashboard for production:
     - `SPOTIFY_CLIENT_ID`
     - `SPOTIFY_CLIENT_SECRET`
     - `SPOTIFY_REFRESH_TOKEN`

4. **Deploy to Vercel**

   ```bash
   npm install -g vercel
   vercel
   ```

## API Endpoints

### **GET** `/api` - JSON Response

#### Success Response (200)

```json
{
  "isPlaying": true,
  "title": "Song Title",
  "artist": "Artist Name",
  "album": "Album Name",
  "albumImageUrl": "https://...",
  "songUrl": "https://open.spotify.com/track/...",
  "previewUrl": "https://...",
  "duration": 240000,
  "progress": 120000
}
```

#### Not Playing Response (200)

```json
{
  "isPlaying": false,
  "title": "Last Song Title",
  "artist": "Artist Name",
  "playedAt": "2024-01-15T10:30:00Z"
}
```

### **GET** `/svg` - SVG Widget

Returns a dynamic SVG widget perfect for embedding in markdown files:

```markdown
![Spotify Now Playing](https://your-vercel-app.vercel.app/svg)
```

## Usage Examples

```javascript
// Fetch current song
const response = await fetch('https://your-vercel-app.vercel.app/api');
const data = await response.json();

if (data.isPlaying) {
  console.log(`Now playing: ${data.title} by ${data.artist}`);
} else {
  console.log(`Last played: ${data.title} by ${data.artist}`);
}
```

## Local Development

```bash
npm install
npm run dev
```

Visit `http://localhost:3000/api` to test the endpoint.

## Features

- ✅ **Real-time Updates**: Shows currently playing or recently played songs
- ✅ **SVG Widget**: Perfect for GitHub READMEs and markdown files
- ✅ **Fallback Support**: Shows last played song when nothing is active
- ✅ **Album Art**: Displays actual album covers
- ✅ **Animated Visualizer**: Dynamic bars when music is playing
- ✅ **CORS Enabled**: Use from any domain
- ✅ **Caching**: Optimized for performance
