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

export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Debug: Check if environment variables are set
  if (!CLIENT_ID || !CLIENT_SECRET || !REFRESH_TOKEN) {
    return res.status(500).json({
      error: 'Missing environment variables',
      debug: {
        hasClientId: !!CLIENT_ID,
        hasClientSecret: !!CLIENT_SECRET,
        hasRefreshToken: !!REFRESH_TOKEN
      }
    });
  }

  try {
    const response = await getNowPlaying();

    // If something is currently playing, return it
    if (response.status === 200) {
      const song = await response.json();

      if (song.item && song.is_playing) {
        const title = song.item.name;
        const artist = song.item.artists.map((_artist) => _artist.name).join(', ');
        const album = song.item.album.name;
        const albumImageUrl = song.item.album.images[0]?.url;
        const songUrl = song.item.external_urls.spotify;
        const previewUrl = song.item.preview_url;
        const duration = song.item.duration_ms;
        const progress = song.progress_ms;

        return res.status(200).json({
          isPlaying: true,
          title,
          artist,
          album,
          albumImageUrl,
          songUrl,
          previewUrl,
          duration,
          progress,
        });
      }
    }

    // Nothing currently playing, get the last played song
    const recentResponse = await getRecentlyPlayed();

    if (recentResponse.status !== 200) {
      return res.status(200).json({ isPlaying: false });
    }

    const recentData = await recentResponse.json();

    if (!recentData.items || recentData.items.length === 0) {
      return res.status(200).json({ isPlaying: false });
    }

    const lastSong = recentData.items[0].track;
    const playedAt = recentData.items[0].played_at;

    const title = lastSong.name;
    const artist = lastSong.artists.map((_artist) => _artist.name).join(', ');
    const album = lastSong.album.name;
    const albumImageUrl = lastSong.album.images[0]?.url;
    const songUrl = lastSong.external_urls.spotify;
    const previewUrl = lastSong.preview_url;
    const duration = lastSong.duration_ms;

    return res.status(200).json({
      isPlaying: false,
      title,
      artist,
      album,
      albumImageUrl,
      songUrl,
      previewUrl,
      duration,
      progress: null, // No progress for last played
      playedAt, // When it was last played
    });
  } catch (error) {
    console.error('Error fetching song data:', error);
    return res.status(500).json({ error: 'Failed to fetch song data' });
  }
}