# 🎵 Tanu API

[![Spotify](https://tanuapi.vercel.app/api/svg)](https://tanuapi.vercel.app)

A modern Node.js API that fetches Spotify song data and provides a beautiful documentation interface. Built with Express, TypeScript, and Vite.

## ✨ Features

- **Real-time Spotify Integration** - Get currently playing or recently played songs
- **Beautiful SVG Generation** - Glassmorphism design with shiny text effects and visualizer
- **Interactive Documentation** - Beautiful web interface with live API testing
- **Modern Tech Stack** - TypeScript, Express, Vite, ES Modules
- **Security First** - CORS, Helmet, and environment variable protection
- **Fast Development** - Hot reload with Vite and Nodemon

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- npm or yarn
- Spotify Developer Account

### Installation

1. **Clone the repository**

   ```bash
   git clone <your-repo-url>
   cd tanu-api
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Set up environment variables**

   ```bash
   cp .env.example .env
   ```

   Edit `.env` with your Spotify credentials:

   ```env
   SPOTIFY_CLIENT_ID=your_client_id
   SPOTIFY_CLIENT_SECRET=your_client_secret
   SPOTIFY_REFRESH_TOKEN=your_refresh_token
   PORT=8080
   ```

4. **Build and start**

   ```bash
   npm run build
   npm start
   ```

   Or for development:

   ```bash
   npm run dev
   ```

5. **Visit the documentation**
   Open <http://localhost:8080> in your browser
   
   **Live Demo:** <https://tanuapi.vercel.app>

## 📚 API Endpoints

### `GET /api/song`

Returns the currently playing song or the most recently played song.

**Response:**

```json
{
  "isPlaying": true,
  "title": "Song Title",
  "artist": "Artist Name",
  "album": "Album Name",
  "albumImageUrl": "https://...",
  "songUrl": "https://open.spotify.com/track/...",
  "previewUrl": "https://...",
  "duration": 180000,
  "progress": 45000
}
```

### `GET /api/svg`

Returns an SVG image showing the current/recent song data. Perfect for README files!

**Features:**

- Glassmorphism design with shiny text effects
- Shows playing status with visual indicators  
- Progress bar for currently playing songs
- Always-visible visualizer bars
- Responsive 460x120px size
- Automatic text truncation for long titles

**Usage in README:**

```markdown
![Spotify](https://tanuapi.vercel.app/api/svg)
```

**Live Example:**
![Spotify](https://tanuapi.vercel.app/api/svg)

### `GET /health`

Health check endpoint for monitoring.

## 🛠️ Development

### Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run preview` - Preview production build

### Project Structure

```
tanu-api/
├── src/
│   ├── api/
│   │   └── song.ts          # Song API routes
│   ├── services/
│   │   └── spotify.service.ts # Spotify integration
│   └── index.ts             # Main server file
├── public/
│   └── index.html           # Documentation page
├── dist/                    # Built files
└── package.json
```

## 🔧 Configuration

### Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `SPOTIFY_CLIENT_ID` | Your Spotify app client ID | Yes |
| `SPOTIFY_CLIENT_SECRET` | Your Spotify app client secret | Yes |
| `SPOTIFY_REFRESH_TOKEN` | Your Spotify refresh token | Yes |
| `PORT` | Server port (default: 8080) | No |
| `NODE_ENV` | Environment (development/production) | No |

### Getting Spotify Credentials

1. Go to [Spotify Developer Dashboard](https://developer.spotify.com/dashboard)
2. Create a new app
3. Get your Client ID and Client Secret
4. Set up OAuth to get a refresh token

## 🎨 SVG Features

- **Glassmorphism Design** - Beautiful glass effect with blurred album background
- **Shiny Text Effects** - Animated gradient text with shimmer effects
- **Always-Visible Visualizer** - Animated bars when playing, static when paused
- **Real-time Updates** - Live song data with album artwork
- **Responsive Design** - Works on desktop and mobile (`?mobile=true`)
- **Progress Bar** - Shows current playback progress with animated pin
- **Error Handling** - Graceful fallbacks for API failures
- **Caching** - Smart token caching for optimal performance

## 🚀 Live Demo

**API Documentation:** <https://tanuapi.vercel.app>

**Direct SVG:** <https://tanuapi.vercel.app/api/svg>

**Mobile Version:** <https://tanuapi.vercel.app/api/svg?mobile=true>

## 📄 License

MIT License - see LICENSE file for details

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 🐛 Issues

Found a bug? Please open an issue on GitHub with:

- Description of the problem
- Steps to reproduce
- Expected vs actual behavior
- Environment details
