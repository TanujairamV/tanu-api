export default function Home() {
  return (
    <div style={{ 
      fontFamily: 'system-ui, sans-serif', 
      maxWidth: '600px', 
      margin: '50px auto', 
      padding: '20px',
      lineHeight: '1.6'
    }}>
      <h1>Spotify Now Playing API</h1>
      <p>Your API endpoint is ready!</p>
      
      <h2>Endpoint</h2>
      <code style={{ 
        background: '#f5f5f5', 
        padding: '10px', 
        display: 'block',
        borderRadius: '4px'
      }}>
        GET /api/now-playing
      </code>
      
      <h2>Test it</h2>
      <p>
        <a 
          href="/api/now-playing" 
          style={{ color: '#0070f3', textDecoration: 'none' }}
        >
          Click here to test your API →
        </a>
      </p>
      
      <h2>Example Response</h2>
      <pre style={{ 
        background: '#f5f5f5', 
        padding: '15px', 
        borderRadius: '4px',
        overflow: 'auto',
        fontSize: '14px'
      }}>
{`{
  "isPlaying": true,
  "title": "Song Title",
  "artist": "Artist Name",
  "album": "Album Name",
  "albumImageUrl": "https://...",
  "songUrl": "https://open.spotify.com/track/...",
  "previewUrl": "https://...",
  "duration": 240000,
  "progress": 120000
}`}
      </pre>
    </div>
  );
}