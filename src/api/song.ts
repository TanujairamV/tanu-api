import { Router, Request, Response } from 'express';
import { getSpotifySongData } from '../services/spotify.service';
import { generateSpotifySvg, generateFallbackSvg } from '../services/svg-generator.service';

const songRouter = Router();

songRouter.get('/', async (_req: Request, res: Response) => {
  try {
    const songData = await getSpotifySongData();

    // It's a good practice to add caching headers for public APIs
    // This caches the response for 30 seconds
    res.setHeader(
      'Cache-Control',
      'public, s-maxage=30, stale-while-revalidate=15'
    );

    return res.status(200).json(songData);
  } catch (error) {
    console.error('Error in /song endpoint:', error);
    return res.status(500).json({ message: 'Failed to fetch song data.' });
  }
});

// Clean SVG endpoint
songRouter.get('/svg', async (req: Request, res: Response) => {
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
    console.error('Error in /song/svg endpoint:', error);
    
    const mobile = req.query.mobile === 'true';
    const fallbackSvg = generateFallbackSvg(mobile);
    
    res.setHeader('Content-Type', 'image/svg+xml');
    res.setHeader('Access-Control-Allow-Origin', '*');
    return res.status(200).send(fallbackSvg);
  }
});

export default songRouter;
