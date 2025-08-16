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

// Test SVG endpoint
app.get('/api/test-svg', (req: Request, res: Response) => {
  const testSvg = `<svg width="460" height="120" xmlns="http://www.w3.org/2000/svg">
  <rect width="460" height="120" rx="24" fill="rgba(255,255,255,0.1)" stroke="rgba(255,255,255,0.2)" stroke-width="1"/>
  <text x="230" y="60" fill="rgba(255,255,255,0.8)" font-family="Arial, sans-serif" font-size="16" text-anchor="middle" dominant-baseline="middle">🎵 Test SVG Working!</text>
</svg>`;

  res.setHeader('Content-Type', 'image/svg+xml; charset=utf-8');
  res.setHeader('Access-Control-Allow-Origin', '*');
  return res.status(200).send(testSvg);
});

// Simple SVG endpoint without external dependencies
app.get('/api/simple-svg', async (req: Request, res: Response) => {
  res.setHeader('Content-Type', 'image/svg+xml; charset=utf-8');
  res.setHeader('Access-Control-Allow-Origin', '*');
  
  try {
    const songData = await getSpotifySongData();
    const mobile = req.query.mobile === 'true';
    const width = mobile ? 320 : 460;
    const height = mobile ? 80 : 120;
    
    const title = songData.title || 'No song playing';
    const artist = songData.artist || 'Unknown artist';
    const status = songData.isPlaying ? 'NOW PLAYING' : 'RECENTLY PLAYED';
    
    const simpleSvg = `<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:rgba(255,255,255,0.1)" />
      <stop offset="100%" style="stop-color:rgba(255,255,255,0.05)" />
    </linearGradient>
  </defs>
  <rect width="${width}" height="${height}" rx="24" fill="url(#bg)" stroke="rgba(255,255,255,0.2)" stroke-width="1"/>
  <text x="30" y="35" fill="rgba(255,255,255,0.8)" font-family="Arial, sans-serif" font-size="10" font-weight="600">${status}</text>
  <text x="30" y="55" fill="rgba(255,255,255,1)" font-family="Arial, sans-serif" font-size="16" font-weight="700">${title.substring(0, 30)}</text>
  <text x="30" y="75" fill="rgba(255,255,255,0.7)" font-family="Arial, sans-serif" font-size="13">by ${artist.substring(0, 25)}</text>
  <text x="${width-30}" y="65" fill="rgba(255,255,255,0.8)" font-family="Arial, sans-serif" font-size="24" text-anchor="end">♪</text>
</svg>`;
    
    return res.status(200).send(simpleSvg);
  } catch (error) {
    console.error('Error in simple SVG:', error);
    const fallback = `<svg width="460" height="120" xmlns="http://www.w3.org/2000/svg">
  <rect width="460" height="120" rx="24" fill="rgba(255,255,255,0.1)" stroke="rgba(255,255,255,0.2)" stroke-width="1"/>
  <text x="230" y="60" fill="rgba(255,255,255,0.8)" font-family="Arial, sans-serif" font-size="16" text-anchor="middle">🎵 Spotify API Error</text>
</svg>`;
    return res.status(200).send(fallback);
  }
});

// Health check endpoint (for API calls)
app.get('/health', (req: Request, res: Response) => {
  res.json({ message: 'Tanu API is running!', status: 'healthy', timestamp: new Date().toISOString() });
});

// Serve documentation page at root
app.get('/', (req: Request, res: Response) => {
  res.sendFile(join(__dirname, '../public/index.html'));
});

// Start server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});