import dotenv from 'dotenv';
// Initialize dotenv to use environment variables from .env file.
// This MUST be done before any other imports that rely on environment variables.
dotenv.config();

import express, { Express, Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import songRouter from './api/song';
import { getSpotifySongData } from './services/spotify.service';
import { generateSpotifySvg, generateFallbackSvg } from './services/svg-generator.service';

// Helper functions for text SVG
const escapeXml = (text: string): string => {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
};

const truncateText = (text: string, maxLength: number): string => {
  return text.length > maxLength ? text.substring(0, maxLength - 3) + '...' : text;
};

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app: Express = express();
const port = process.env.PORT || 8080;

// Security middleware
app.use(helmet({
  contentSecurityPolicy: false, // Disable for development
}));
app.use(cors());

// Body parsing middleware
app.use(express.json());

// Serve static files from public directory
app.use(express.static(join(__dirname, '../public')));

// API Routes
app.use('/api/song', songRouter);

// Direct SVG endpoint
app.get('/api/svg', async (req: Request, res: Response) => {
  // Set headers first
  res.setHeader('Content-Type', 'image/svg+xml; charset=utf-8');
  res.setHeader('Cache-Control', 'public, s-maxage=30, stale-while-revalidate=15');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  try {
    console.log('SVG endpoint called');
    
    // Set a timeout for the entire operation
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('SVG generation timeout')), 10000);
    });
    
    const svgPromise = (async () => {
      const songData = await getSpotifySongData();
      console.log('Song data retrieved:', songData.title || 'No title');
      
      const options = {
        mobile: req.query.mobile === 'true'
      };
      
      const svg = await generateSpotifySvg(songData, options);
      console.log('SVG generated successfully, length:', svg.length);
      return svg;
    })();
    
    const svg = await Promise.race([svgPromise, timeoutPromise]) as string;
    return res.status(200).send(svg);
    
  } catch (error) {
    console.error('Error in /api/svg endpoint:', error);
    
    // Return a working fallback SVG
    const mobile = req.query.mobile === 'true';
    const width = mobile ? 320 : 460;
    const height = mobile ? 80 : 120;
    
    const fallbackSvg = `<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:rgba(255,255,255,0.1)" />
      <stop offset="100%" style="stop-color:rgba(255,255,255,0.05)" />
    </linearGradient>
  </defs>
  <rect width="${width}" height="${height}" rx="24" fill="url(#bg)" stroke="rgba(255,255,255,0.2)" stroke-width="1"/>
  <text x="${width/2}" y="${height/2-10}" fill="rgba(255,255,255,0.8)" font-family="Arial, sans-serif" font-size="20" text-anchor="middle">🎵</text>
  <text x="${width/2}" y="${height/2+15}" fill="rgba(255,255,255,0.6)" font-family="Arial, sans-serif" font-size="12" text-anchor="middle">Spotify API Loading...</text>
</svg>`;
    
    return res.status(200).send(fallbackSvg);
  }
});

// Test SVG endpoint - always works
app.get('/api/test-svg', (req: Request, res: Response) => {
  console.log('Test SVG endpoint called');
  
  const testSvg = `<svg width="460" height="120" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="testBg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:rgba(29,185,84,0.2)" />
      <stop offset="100%" style="stop-color:rgba(29,185,84,0.1)" />
    </linearGradient>
  </defs>
  <rect width="460" height="120" rx="24" fill="url(#testBg)" stroke="rgba(29,185,84,0.3)" stroke-width="2"/>
  <text x="230" y="50" fill="rgba(255,255,255,0.9)" font-family="Arial, sans-serif" font-size="18" text-anchor="middle" font-weight="bold">🎵 Test SVG Working!</text>
  <text x="230" y="75" fill="rgba(255,255,255,0.7)" font-family="Arial, sans-serif" font-size="12" text-anchor="middle">API is running correctly</text>
</svg>`;

  res.setHeader('Content-Type', 'image/svg+xml; charset=utf-8');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Cache-Control', 'no-cache');
  
  console.log('Test SVG sent successfully');
  return res.status(200).send(testSvg);
});

// Text-only SVG endpoint (fast, no images)
app.get('/api/text-svg', async (req: Request, res: Response) => {
  res.setHeader('Content-Type', 'image/svg+xml; charset=utf-8');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Cache-Control', 'public, s-maxage=30, stale-while-revalidate=15');
  
  try {
    console.log('Text SVG endpoint called');
    const songData = await getSpotifySongData();
    
    const mobile = req.query.mobile === 'true';
    const width = mobile ? 320 : 460;
    const height = mobile ? 80 : 120;
    
    const title = escapeXml(truncateText(songData.title || 'No song playing', mobile ? 25 : 35));
    const artist = escapeXml(truncateText(songData.artist || 'Unknown artist', mobile ? 20 : 30));
    const status = songData.isPlaying ? 'NOW PLAYING' : 'RECENTLY PLAYED';
    
    const textSvg = `<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:rgba(255,255,255,0.1)" />
      <stop offset="100%" style="stop-color:rgba(255,255,255,0.05)" />
    </linearGradient>
  </defs>
  <rect width="${width}" height="${height}" rx="24" fill="url(#bg)" stroke="rgba(255,255,255,0.2)" stroke-width="1"/>
  <text x="30" y="35" fill="rgba(255,255,255,0.8)" font-family="Arial, sans-serif" font-size="10" font-weight="600">${status}</text>
  <text x="30" y="55" fill="rgba(255,255,255,1)" font-family="Arial, sans-serif" font-size="16" font-weight="700">${title}</text>
  <text x="30" y="75" fill="rgba(255,255,255,0.7)" font-family="Arial, sans-serif" font-size="13">by ${artist}</text>
  <text x="${width-30}" y="65" fill="rgba(255,255,255,0.8)" font-family="Arial, sans-serif" font-size="24" text-anchor="end">♪</text>
</svg>`;
    
    return res.status(200).send(textSvg);
  } catch (error) {
    console.error('Error in text SVG:', error);
    const fallback = generateFallbackSvg(req.query.mobile === 'true');
    return res.status(200).send(fallback);
  }
});

// Full SVG endpoint with album images
app.get('/api/simple-svg', async (req: Request, res: Response) => {
  res.setHeader('Content-Type', 'image/svg+xml; charset=utf-8');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Cache-Control', 'public, s-maxage=30, stale-while-revalidate=15');
  
  try {
    console.log('Simple SVG endpoint called');
    
    // Check if we have the required environment variables
    const hasCredentials = process.env.SPOTIFY_CLIENT_ID && 
                          process.env.SPOTIFY_CLIENT_SECRET && 
                          process.env.SPOTIFY_REFRESH_TOKEN;
    
    console.log('Environment check:', {
      hasClientId: !!process.env.SPOTIFY_CLIENT_ID,
      hasClientSecret: !!process.env.SPOTIFY_CLIENT_SECRET,
      hasRefreshToken: !!process.env.SPOTIFY_REFRESH_TOKEN,
      hasAll: hasCredentials
    });
    
    if (!hasCredentials) {
      throw new Error('Missing Spotify credentials in environment variables');
    }
    
    const songData = await getSpotifySongData();
    console.log('Song data retrieved for simple SVG:', {
      title: songData.title,
      artist: songData.artist,
      isPlaying: songData.isPlaying,
      hasAlbumImage: !!songData.albumImageUrl
    });
    
    const options = {
      mobile: req.query.mobile === 'true'
    };
    
    // Use the full SVG generator with album images
    const svg = await generateSpotifySvg(songData, options);
    console.log('Full SVG with album image generated successfully, length:', svg.length);
    
    return res.status(200).send(svg);
  } catch (error) {
    console.error('Error in simple SVG:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    const mobile = req.query.mobile === 'true';
    const width = mobile ? 320 : 460;
    const height = mobile ? 80 : 120;
    
    const fallback = `<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:rgba(255,100,100,0.1)" />
      <stop offset="100%" style="stop-color:rgba(255,100,100,0.05)" />
    </linearGradient>
  </defs>
  <rect width="${width}" height="${height}" rx="24" fill="url(#bg)" stroke="rgba(255,100,100,0.3)" stroke-width="1"/>
  <text x="${width/2}" y="${height/2-10}" fill="rgba(255,255,255,0.8)" font-family="Arial, sans-serif" font-size="16" text-anchor="middle">🎵 API Error</text>
  <text x="${width/2}" y="${height/2+10}" fill="rgba(255,255,255,0.6)" font-family="Arial, sans-serif" font-size="12" text-anchor="middle">${errorMessage.substring(0, 40)}</text>
</svg>`;
    return res.status(200).send(fallback);
  }
});

// Simple status endpoint
app.get('/status', (req: Request, res: Response) => {
  res.json({ status: 'ok', timestamp: Date.now() });
});

// Health check endpoint (for API calls)
app.get('/health', (req: Request, res: Response) => {
  console.log('Health check called');
  res.json({ 
    message: 'Tanu API is running!', 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    environment: {
      nodeEnv: process.env.NODE_ENV,
      port: port,
      hasSpotifyCredentials: {
        clientId: !!process.env.SPOTIFY_CLIENT_ID,
        clientSecret: !!process.env.SPOTIFY_CLIENT_SECRET,
        refreshToken: !!process.env.SPOTIFY_REFRESH_TOKEN
      }
    }
  });
});

// Debug endpoint
app.get('/api/debug', async (req: Request, res: Response) => {
  try {
    console.log('Debug endpoint called');
    const songData = await getSpotifySongData();
    res.json({
      status: 'success',
      songData: {
        title: songData.title,
        artist: songData.artist,
        isPlaying: songData.isPlaying,
        hasAlbumImage: !!songData.albumImageUrl
      },
      environment: {
        hasClientId: !!process.env.SPOTIFY_CLIENT_ID,
        hasClientSecret: !!process.env.SPOTIFY_CLIENT_SECRET,
        hasRefreshToken: !!process.env.SPOTIFY_REFRESH_TOKEN
      }
    });
  } catch (error) {
    console.error('Debug endpoint error:', error);
    res.status(500).json({
      status: 'error',
      error: error instanceof Error ? error.message : 'Unknown error',
      environment: {
        hasClientId: !!process.env.SPOTIFY_CLIENT_ID,
        hasClientSecret: !!process.env.SPOTIFY_CLIENT_SECRET,
        hasRefreshToken: !!process.env.SPOTIFY_REFRESH_TOKEN
      }
    });
  }
});

// Serve documentation page at root
app.get('/', (req: Request, res: Response) => {
  res.sendFile(join(__dirname, '../public/index.html'));
});

// Export the app instance for Vercel's serverless environment
export default app;