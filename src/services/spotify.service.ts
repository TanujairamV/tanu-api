// Define TypeScript interfaces for the data we expect from Spotify
// This provides type safety and autocompletion.
interface SpotifyTokenResponse {
  access_token: string;
}

interface SpotifyArtist {
  name: string;
}

interface SpotifyImage {
  url: string;
}

interface SpotifyAlbum {
  name: string;
  images: SpotifyImage[];
}

interface SpotifyTrack {
  name: string;
  artists: SpotifyArtist[];
  album: SpotifyAlbum;
  external_urls: {
    spotify: string;
  };
  preview_url: string | null;
  duration_ms: number;
}

interface SpotifyNowPlayingResponse {
  is_playing: boolean;
  progress_ms: number;
  item: SpotifyTrack | null;
}

interface SpotifyRecentlyPlayedItem {
  track: SpotifyTrack;
  played_at: string;
}

interface SpotifyRecentlyPlayedResponse {
  items: SpotifyRecentlyPlayedItem[];
}

// This is the final, structured data object our service will return.
export interface SongData {
  isPlaying: boolean;
  title: string;
  artist: string;
  album: string;
  albumImageUrl?: string;
  songUrl: string;
  previewUrl?: string | null;
  duration?: number;
  progress?: number | null;
  playedAt?: string;
}

interface CachedToken {
  accessToken: string;
  // Spotify tokens expire after 3600s. We'll cache for 55 minutes.
  expiresAt: number;
}

// Spotify API credentials
const CLIENT_ID = '8049036af92848fab9cdb142091b84f6';
const CLIENT_SECRET = '8c478199766c454b886a8e52744bdaff';
const REFRESH_TOKEN = 'AQCzK7YlhhrJSTbDiIOjDXB-5qQ8__20Sm4MW9K8HfOKtznhRwSQ3VV5HyYksvdjbCSHO6pyWCnAQ3nsoDGCQD3s_TxZZKBptxFJ3nA2vOWlrcjW-QFIwDTvIkj8puCs2Ec';

const basic = Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString('base64');
const TOKEN_ENDPOINT = 'https://accounts.spotify.com/api/token';
const NOW_PLAYING_ENDPOINT = 'https://api.spotify.com/v1/me/player/currently-playing';
const RECENTLY_PLAYED_ENDPOINT = 'https://api.spotify.com/v1/me/player/recently-played?limit=1';

let tokenCache: CachedToken | null = null;

const getAccessToken = async (): Promise<string> => {
  if (tokenCache && Date.now() < tokenCache.expiresAt) {
    return tokenCache.accessToken;
  }

  const response = await fetch(TOKEN_ENDPOINT, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${basic}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({ grant_type: 'refresh_token', refresh_token: REFRESH_TOKEN }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('Failed to get access token:', response.status, errorText);
    throw new Error(`Failed to get access token: ${response.statusText}`);
  }

  const tokenData: SpotifyTokenResponse = await response.json();
  tokenCache = {
    accessToken: tokenData.access_token,
    expiresAt: Date.now() + 3300 * 1000, // Cache for 55 minutes
  };

  return tokenCache.accessToken;
};

const spotifyFetch = (endpoint: string, accessToken: string) => {
  return fetch(endpoint, { headers: { Authorization: `Bearer ${accessToken}` } });
};

const normalizeTrack = (track: SpotifyTrack) => ({
  title: track.name,
  artist: track.artists.map((_artist) => _artist.name).join(', '),
  album: track.album.name,
  albumImageUrl: track.album.images[0]?.url,
  songUrl: track.external_urls.spotify,
  previewUrl: track.preview_url,
  duration: track.duration_ms,
});

export const getSpotifySongData = async (): Promise<SongData> => {
  try {
    const accessToken = await getAccessToken();

    const nowPlayingResponse = await spotifyFetch(NOW_PLAYING_ENDPOINT, accessToken);

    // A 200 OK response means a song is playing (or paused).
    // A 204 No Content response means nothing is playing, so we check recents.
    if (nowPlayingResponse.status === 200) {
      const song = (await nowPlayingResponse.json()) as SpotifyNowPlayingResponse;
      if (song.item && song.is_playing) {
        return { isPlaying: true, ...normalizeTrack(song.item), progress: song.progress_ms };
      }
    }

    // If nothing is currently playing, check the most recently played track.
    const recentResponse = await spotifyFetch(RECENTLY_PLAYED_ENDPOINT, accessToken);
    if (recentResponse.status === 200) {
      const recentData = (await recentResponse.json()) as SpotifyRecentlyPlayedResponse;
      const lastSongItem = recentData.items[0];

      // Important: Ensure a recently played song exists before accessing it.
      if (lastSongItem && lastSongItem.track) {
        return { isPlaying: false, ...normalizeTrack(lastSongItem.track), progress: null, playedAt: lastSongItem.played_at };
      }
    }

    // Fallback if no song is playing and no recent songs are found.
    return { isPlaying: false, title: 'Nothing Playing', artist: 'Spotify', album: 'N/A', songUrl: '#' };
  } catch (error) {
    console.error('An error occurred in getSpotifySongData:', error);
    // This is the ultimate fallback for network errors, token errors, etc.
    return { isPlaying: false, title: 'Not Available', artist: 'Spotify', album: 'N/A', songUrl: '#' };
  }
};
