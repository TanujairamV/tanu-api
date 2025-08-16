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
    const songData = await getSpotifySongData();
    
    const options = {
      mobile: req.query.mobile === 'true'
    };
    
    const svg = await generateSpotifySvg(songData, options);

    // Set appropriate headers for SVG
    res.setHeader('Content-Type', 'image/svg+xml');
    res.setHeader('Cache-Control', 'public, s-maxage=30, stale-while-revalidate=15');
    res.setHeader('Access-Control-Allow-Origin', '*');
    
    return res.status(200).send(svg);
  } catch (error) {
    console.error('Error in /api/svg endpoint:', error);
    
    const mobile = req.query.mobile === 'true';
    const fallbackSvg = generateFallbackSvg(mobile);
    
    res.setHeader('Content-Type', 'image/svg+xml');
    res.setHeader('Access-Control-Allow-Origin', '*');
    return res.status(200).send(fallbackSvg);
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