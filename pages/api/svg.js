const CLIENT_ID = process.env.SPOTIFY_CLIENT_ID;
const CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET;
const REFRESH_TOKEN = process.env.SPOTIFY_REFRESH_TOKEN;

const basic = Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString('base64');
const NOW_PLAYING_ENDPOINT = 'https://api.spotify.com/v1/me/player/currently-playing';
const RECENTLY_PLAYED_ENDPOINT = 'https://api.spotify.com/v1/me/player/recently-played?limit=1';
const TOKEN_ENDPOINT = 'https://accounts.spotify.com/api/token';

const getAccessToken = async () => {
  const response = await fetch(TOKEN_ENDPOINT, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${basic}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      grant_type: 'refresh_token',
      refresh_token: REFRESH_TOKEN,
    }),
  });

  return response.json();
};

const getNowPlaying = async () => {
  const { access_token } = await getAccessToken();

  return fetch(NOW_PLAYING_ENDPOINT, {
    headers: {
      Authorization: `Bearer ${access_token}`,
    },
  });
};

const getRecentlyPlayed = async () => {
  const { access_token } = await getAccessToken();

  return fetch(RECENTLY_PLAYED_ENDPOINT, {
    headers: {
      Authorization: `Bearer ${access_token}`,
    },
  });
};

const truncateText = (text, maxLength) => {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength - 3) + '...';
};

const generateSVG = (songData) => {
  const { isPlaying, title, artist, album, albumImageUrl } = songData;
  
  const truncatedTitle = truncateText(title || 'Not Playing', 30);
  const truncatedArtist = truncateText(artist || 'Unknown Artist', 35);
  const status = isPlaying ? 'Now Playing' : 'Recently Played';
  
  // Create animated bars for visualizer
  const bars = Array.from({ length: 5 }, (_, i) => {
    const height = isPlaying ? `${Math.random() * 8 + 4}` : '2';
    const animationDelay = `${i * 0.1}s`;
    return `
      <rect x="${50 + i * 8}" y="${45 - (isPlaying ? 6 : 2)}" width="4" height="${height}" 
            fill="url(#gradient)" rx="2" opacity="${isPlaying ? '0.8' : '0.3'}">
        ${isPlaying ? `<animate attributeName="height" values="2;12;2" dur="1.5s" repeatCount="indefinite" begin="${animationDelay}"/>
        <animate attributeName="y" values="43;37;43" dur="1.5s" repeatCount="indefinite" begin="${animationDelay}"/>` : ''}
      </rect>
    `;
  }).join('');

  return `
    <svg width="400" height="120" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#1DB954;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#1ed760;stop-opacity:1" />
        </linearGradient>
        <linearGradient id="bgGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#191414;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#121212;stop-opacity:1" />
        </linearGradient>
        <filter id="glow">
          <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
          <feMerge> 
            <feMergeNode in="coloredBlur"/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
      </defs>
      
      <!-- Background -->
      <rect width="400" height="120" rx="12" fill="url(#bgGradient)" stroke="#1DB954" stroke-width="1" opacity="0.9"/>
      
      <!-- Album Art Placeholder -->
      <rect x="15" y="15" width="90" height="90" rx="8" fill="#333" stroke="#555" stroke-width="1"/>
      ${albumImageUrl ? `
        <image x="15" y="15" width="90" height="90" href="${albumImageUrl}" rx="8" clip-path="inset(0 round 8px)"/>
      ` : `
        <text x="60" y="65" text-anchor="middle" fill="#666" font-family="Arial, sans-serif" font-size="12">♪</text>
      `}
      
      <!-- Status Badge -->
      <rect x="120" y="15" width="${status.length * 7 + 20}" height="20" rx="10" fill="${isPlaying ? '#1DB954' : '#666'}" opacity="0.8"/>
      <text x="${120 + (status.length * 7 + 20) / 2}" y="28" text-anchor="middle" fill="white" font-family="Arial, sans-serif" font-size="11" font-weight="bold">
        ${status}
      </text>
      
      <!-- Song Title -->
      <text x="120" y="50" fill="white" font-family="Arial, sans-serif" font-size="16" font-weight="bold">
        ${truncatedTitle}
      </text>
      
      <!-- Artist -->
      <text x="120" y="70" fill="#b3b3b3" font-family="Arial, sans-serif" font-size="14">
        ${truncatedArtist}
      </text>
      
      <!-- Visualizer Bars -->
      <g>
        ${bars}
      </g>
      
      <!-- Spotify Logo -->
      <circle cx="370" cy="30" r="12" fill="#1DB954"/>
      <text x="370" y="35" text-anchor="middle" fill="white" font-family="Arial, sans-serif" font-size="14" font-weight="bold">♪</text>
      
      <!-- Progress Bar (if playing) -->
      ${isPlaying ? `
        <rect x="120" y="85" width="250" height="4" rx="2" fill="#333"/>
        <rect x="120" y="85" width="${Math.random() * 200 + 50}" height="4" rx="2" fill="url(#gradient)">
          <animate attributeName="width" values="50;200;50" dur="30s" repeatCount="indefinite"/>
        </rect>
      ` : ''}
      
      <!-- Glow effect for playing status -->
      ${isPlaying ? `
        <rect width="400" height="120" rx="12" fill="none" stroke="url(#gradient)" stroke-width="2" opacity="0.5" filter="url(#glow)"/>
      ` : ''}
    </svg>
  `;
};

export default async function handler(req, res) {
  // Set headers for SVG
  res.setHeader('Content-Type', 'image/svg+xml');
  res.setHeader('Cache-Control', 'public, max-age=60'); // Cache for 1 minute
  res.setHeader('Access-Control-Allow-Origin', '*');

  if (req.method !== 'GET') {
    return res.status(405).end();
  }

  try {
    let songData = {
      isPlaying: false,
      title: 'Not Playing',
      artist: 'Unknown Artist',
      album: '',
      albumImageUrl: null
    };

    // Try to get currently playing
    const response = await getNowPlaying();
    
    if (response.status === 200) {
      const song = await response.json();
      
      if (song.item && song.is_playing) {
        songData = {
          isPlaying: true,
          title: song.item.name,
          artist: song.item.artists.map(a => a.name).join(', '),
          album: song.item.album.name,
          albumImageUrl: song.item.album.images[0]?.url || null
        };
      }
    }

    // If nothing playing, get recently played
    if (!songData.isPlaying) {
      const recentResponse = await getRecentlyPlayed();
      
      if (recentResponse.status === 200) {
        const recentData = await recentResponse.json();
        
        if (recentData.items && recentData.items.length > 0) {
          const lastSong = recentData.items[0].track;
          songData = {
            isPlaying: false,
            title: lastSong.name,
            artist: lastSong.artists.map(a => a.name).join(', '),
            album: lastSong.album.name,
            albumImageUrl: lastSong.album.images[0]?.url || null
          };
        }
      }
    }

    const svg = generateSVG(songData);
    res.status(200).send(svg);
    
  } catch (error) {
    console.error('Error generating SVG:', error);
    
    // Return fallback SVG
    const fallbackSVG = generateSVG({
      isPlaying: false,
      title: 'Error Loading',
      artist: 'Spotify API',
      album: '',
      albumImageUrl: null
    });
    
    res.status(200).send(fallbackSVG);
  }
}