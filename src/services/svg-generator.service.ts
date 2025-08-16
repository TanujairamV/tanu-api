import { SongData } from './spotify.service';

// Simple options interface
export interface SvgOptions {
  mobile?: boolean;
}

// Helper function to escape XML/SVG special characters
const escapeXml = (text: string): string => {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
};

// Helper function to truncate text if it's too long
const truncateText = (text: string, maxLength: number): string => {
  return text.length > maxLength ? text.substring(0, maxLength - 3) + '...' : text;
};

// Convert image URL to base64 data URI
const imageToBase64 = async (imageUrl: string): Promise<string> => {
  try {
    const response = await fetch(imageUrl);
    if (!response.ok) throw new Error('Failed to fetch image');
    
    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const base64 = buffer.toString('base64');
    const mimeType = response.headers.get('content-type') || 'image/jpeg';
    
    return `data:${mimeType};base64,${base64}`;
  } catch (error) {
    console.error('Error converting image to base64:', error);
    return '';
  }
};

// Always-visible visualizer bars positioned in bottom right
const generateVisualizerBars = (isPlaying: boolean, mobile: boolean = false, width: number, height: number): string => {
  const barCount = mobile ? 6 : 10;
  const barWidth = mobile ? 3 : 4;
  const gap = mobile ? 2 : 2;
  const totalWidth = barCount * barWidth + (barCount - 1) * gap;
  const startX = width - totalWidth - (mobile ? 15 : 25);
  const baseY = height - (mobile ? 15 : 20);
  const baseHeight = mobile ? 3 : 4;
  const maxHeight = mobile ? 8 : 12;
  
  const bars = Array.from({ length: barCount }, (_, i) => {
    const x = startX + i * (barWidth + gap);
    const animHeight = baseHeight + Math.abs(Math.sin(i * 0.8) * (maxHeight - baseHeight));
    
    return `
    <rect x="${x}" y="${baseY}" width="${barWidth}" height="${baseHeight}" rx="1" 
          fill="rgba(255,255,255,${isPlaying ? 0.9 : 0.4})" opacity="${isPlaying ? 0.8 : 0.5}">
      ${isPlaying ? `
      <animate attributeName="height" 
               values="${baseHeight};${animHeight};${baseHeight}" 
               dur="${0.5 + i * 0.1}s" 
               repeatCount="indefinite"/>
      <animate attributeName="y" 
               values="${baseY};${baseY - (animHeight - baseHeight)};${baseY}" 
               dur="${0.5 + i * 0.1}s" 
               repeatCount="indefinite"/>
      ` : ''}
    </rect>`;
  }).join('');
  
  return bars;
};

// Clean, focused SVG generator
export const generateSpotifySvg = async (songData: SongData, options: SvgOptions = {}): Promise<string> => {
  const { mobile = false } = options;
  
  const title = escapeXml(truncateText(songData.title, mobile ? 20 : 30));
  const artist = escapeXml(truncateText(songData.artist, mobile ? 18 : 25));
  const headerText = songData.isPlaying ? 'NOW LISTENING' : 'RECENTLY PLAYED';
  
  // Calculate progress percentage
  const progress = songData.isPlaying && songData.progress && songData.duration 
    ? (songData.progress / songData.duration) * 100 
    : 0;

  // Get album image as base64 if available
  let albumImageBase64 = '';
  if (songData.albumImageUrl) {
    albumImageBase64 = await imageToBase64(songData.albumImageUrl);
  }

  // Clean dimensions
  const width = mobile ? 320 : 460;
  const height = mobile ? 80 : 120;
  const borderRadius = mobile ? 16 : 24;
  const albumSize = mobile ? 48 : 80;
  const albumRadius = mobile ? 12 : 16;
  const albumX = mobile ? 16 : 20;
  const albumY = mobile ? 16 : 20;
  const textX = albumX + albumSize + (mobile ? 12 : 20);
  
  return `
<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
  <defs>
    <!-- Glassmorphism background -->
    <linearGradient id="glassBackground" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:rgba(255,255,255,0.1);stop-opacity:1" />
      <stop offset="100%" style="stop-color:rgba(255,255,255,0.05);stop-opacity:1" />
    </linearGradient>
    
    <!-- Backdrop blur for album image -->
    <filter id="backdropBlur" x="-50%" y="-50%" width="200%" height="200%">
      <feGaussianBlur in="SourceGraphic" stdDeviation="20"/>
      <feColorMatrix type="saturate" values="1.2"/>
    </filter>
    
    <!-- Shiny text gradient for status -->
    <linearGradient id="shinyStatus" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" style="stop-color:rgba(255,255,255,0.6);stop-opacity:1" />
      <stop offset="30%" style="stop-color:rgba(255,255,255,0.9);stop-opacity:1" />
      <stop offset="70%" style="stop-color:rgba(255,255,255,0.9);stop-opacity:1" />
      <stop offset="100%" style="stop-color:rgba(255,255,255,0.6);stop-opacity:1" />
      <animateTransform attributeName="gradientTransform" 
                        type="translate" 
                        values="-100,0;100,0;-100,0" 
                        dur="3s" 
                        repeatCount="indefinite"/>
    </linearGradient>
    
    <!-- Shiny text gradient for title -->
    <linearGradient id="shinyTitle" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" style="stop-color:rgba(255,255,255,0.8);stop-opacity:1" />
      <stop offset="30%" style="stop-color:rgba(255,255,255,1);stop-opacity:1" />
      <stop offset="70%" style="stop-color:rgba(255,255,255,1);stop-opacity:1" />
      <stop offset="100%" style="stop-color:rgba(255,255,255,0.8);stop-opacity:1" />
      <animateTransform attributeName="gradientTransform" 
                        type="translate" 
                        values="-150,0;150,0;-150,0" 
                        dur="4s" 
                        repeatCount="indefinite"/>
    </linearGradient>
    
    <!-- Shiny text gradient for artist -->
    <linearGradient id="shinyArtist" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" style="stop-color:rgba(255,255,255,0.5);stop-opacity:1" />
      <stop offset="30%" style="stop-color:rgba(255,255,255,0.8);stop-opacity:1" />
      <stop offset="70%" style="stop-color:rgba(255,255,255,0.8);stop-opacity:1" />
      <stop offset="100%" style="stop-color:rgba(255,255,255,0.5);stop-opacity:1" />
      <animateTransform attributeName="gradientTransform" 
                        type="translate" 
                        values="-120,0;120,0;-120,0" 
                        dur="5s" 
                        repeatCount="indefinite"/>
    </linearGradient>
    
    <!-- Album art clip path -->
    <clipPath id="albumClip">
      <rect x="${albumX}" y="${albumY}" width="${albumSize}" height="${albumSize}" rx="${albumRadius}"/>
    </clipPath>
    
    <!-- Container clip path -->
    <clipPath id="containerClip">
      <rect x="0" y="0" width="${width}" height="${height}" rx="${borderRadius}"/>
    </clipPath>
  </defs>
  
  <!-- Blurred album background for glassmorphism -->
  ${albumImageBase64 ? `
  <image x="-10" y="-10" width="${width + 20}" height="${height + 20}" href="${albumImageBase64}" 
         filter="url(#backdropBlur)" opacity="0.3" preserveAspectRatio="xMidYMid slice"
         clip-path="url(#containerClip)"/>
  ` : ''}
  
  <!-- Main glass container -->
  <rect width="${width}" height="${height}" rx="${borderRadius}" 
        fill="url(#glassBackground)" 
        stroke="rgba(255,255,255,0.2)" stroke-width="1"
        style="backdrop-filter: blur(20px);"/>
  
  <!-- Album art -->
  ${albumImageBase64 ? `
  <image x="${albumX}" y="${albumY}" width="${albumSize}" height="${albumSize}" href="${albumImageBase64}" 
         clip-path="url(#albumClip)" preserveAspectRatio="xMidYMid slice"/>
  <rect x="${albumX}" y="${albumY}" width="${albumSize}" height="${albumSize}" rx="${albumRadius}" 
        fill="none" stroke="rgba(255,255,255,0.3)" stroke-width="1"/>
  ` : `
  <!-- Album art placeholder -->
  <rect x="${albumX}" y="${albumY}" width="${albumSize}" height="${albumSize}" rx="${albumRadius}" 
        fill="rgba(255,255,255,0.1)" stroke="rgba(255,255,255,0.3)" stroke-width="1"/>
  <text x="${albumX + albumSize/2}" y="${albumY + albumSize/2}" fill="rgba(255,255,255,0.6)" 
        font-family="Arial, sans-serif" font-size="${mobile ? 16 : 24}" 
        text-anchor="middle" dominant-baseline="middle">♪</text>
  `}
  
  <!-- Status text with shiny effect -->
  <text x="${textX}" y="${mobile ? 25 : 32}" fill="url(#shinyStatus)" 
        font-family="Arial, sans-serif" 
        font-size="${mobile ? 8 : 10}" font-weight="600" 
        letter-spacing="1px">${headerText}</text>
  
  <!-- Song title with shiny effect -->
  <text x="${textX}" y="${mobile ? 40 : 50}" fill="url(#shinyTitle)" 
        font-family="Arial, sans-serif" 
        font-size="${mobile ? 12 : 16}" font-weight="700">${title}</text>
  
  <!-- Artist name with shiny effect -->
  <text x="${textX}" y="${mobile ? 54 : 68}" fill="url(#shinyArtist)" 
        font-family="Arial, sans-serif" 
        font-size="${mobile ? 10 : 13}" font-weight="500">by ${artist}</text>
  
  <!-- Progress bar -->
  ${songData.isPlaying && songData.progress && songData.duration ? `
  <!-- Progress bar background -->
  <rect x="${textX}" y="${mobile ? 62 : 85}" width="${mobile ? 140 : 200}" height="3" 
        rx="1.5" fill="rgba(255,255,255,0.2)"/>
  
  <!-- Progress bar fill -->
  <rect x="${textX}" y="${mobile ? 62 : 85}" width="${Math.min(mobile ? 140 : 200, (progress / 100) * (mobile ? 140 : 200))}" 
        height="3" rx="1.5" fill="rgba(255,255,255,0.8)"/>
  
  <!-- Progress bar pin -->
  <circle cx="${textX + Math.min(mobile ? 140 : 200, (progress / 100) * (mobile ? 140 : 200))}" 
          cy="${mobile ? 63.5 : 86.5}" r="4" fill="rgba(255,255,255,0.9)"/>
  ` : ''}
  
  <!-- Always-visible visualizer bars in bottom right -->
  ${generateVisualizerBars(songData.isPlaying, mobile, width, height)}
</svg>`.trim();
};

// Simple fallback SVG
export const generateFallbackSvg = (mobile: boolean = false): string => {
  const width = mobile ? 320 : 460;
  const height = mobile ? 80 : 120;
  const borderRadius = mobile ? 16 : 24;
  
  return `
<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="glassBackground" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:rgba(255,255,255,0.1);stop-opacity:1" />
      <stop offset="100%" style="stop-color:rgba(255,255,255,0.05);stop-opacity:1" />
    </linearGradient>
  </defs>
  
  <rect width="${width}" height="${height}" rx="${borderRadius}" 
        fill="url(#glassBackground)" 
        stroke="rgba(255,255,255,0.2)" stroke-width="1"/>
  
  <text x="${width / 2}" y="${height / 2 - 5}" fill="rgba(255,255,255,0.8)" 
        font-family="Arial, sans-serif" font-size="${mobile ? 20 : 28}" 
        text-anchor="middle" dominant-baseline="middle">♪</text>
  
  <text x="${width / 2}" y="${height / 2 + 15}" fill="rgba(255,255,255,0.6)" 
        font-family="Arial, sans-serif" font-size="${mobile ? 10 : 12}" 
        text-anchor="middle" dominant-baseline="middle">Spotify data unavailable</text>
</svg>`.trim();
};