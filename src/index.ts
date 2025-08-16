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
  try {
    console.log('SVG endpoint called');
    const songData = await getSpotifySongData();
    console.log('Song data retrieved:', songData.title);
    
    const options = {
      mobile: req.query.mobile === 'true'
    };
    
    const svg = await generateSpotifySvg(songData, options);
    console.log('SVG generated, length:', svg.length);

    // Set appropriate headers for SVG
    res.setHeader('Content-Type', 'image/svg+xml; charset=utf-8');
    res.setHeader('Cache-Control', 'public, s-maxage=30, stale-while-revalidate=15');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    
    return res.status(200).send(svg);
  } catch (error) {
    console.error('Error in /api/svg endpoint:', error);
    
    const mobile = req.query.mobile === 'true';
    const fallbackSvg = generateFallbackSvg(mobile);
    
    res.setHeader('Content-Type', 'image/svg+xml; charset=utf-8');
    res.setHeader('Access-Control-Allow-Origin', '*');
    return res.status(200).send(fallbackSvg);
  }
});

// Test SVG endpoint
app.get('/api/test-svg', (req: Request, res: Response) => {
  const testSvg = `
<svg width="460" height="120" xmlns="http://www.w3.org/2000/svg">
  <rect width="460" height="120" rx="24" fill="rgba(255,255,255,0.1)" stroke="rgba(255,255,255,0.2)" stroke-width="1"/>
  <text x="230" y="60" fill="rgba(255,255,255,0.8)" font-family="Arial, sans-serif" font-size="16" text-anchor="middle" dominant-baseline="middle">🎵 Test SVG Working!</text>
</svg>`.trim();

  res.setHeader('Content-Type', 'image/svg+xml; charset=utf-8');
  res.setHeader('Access-Control-Allow-Origin', '*');
  return res.status(200).send(testSvg);
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