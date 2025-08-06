// Quick script to get Spotify refresh token
// Run this once to get your refresh token

const CLIENT_ID = 'your_client_id';
const CLIENT_SECRET = 'your_client_secret';
const REDIRECT_URI = 'http://localhost:3000/callback'; // Add this to your Spotify app settings

// Step 1: Visit this URL in your browser (replace CLIENT_ID)
console.log('1. Visit this URL:');
console.log(`https://accounts.spotify.com/authorize?client_id=${CLIENT_ID}&response_type=code&redirect_uri=${encodeURIComponent(REDIRECT_URI)}&scope=user-read-currently-playing`);

console.log('\n2. After authorizing, copy the "code" parameter from the redirect URL');
console.log('\n3. Replace "AUTHORIZATION_CODE_HERE" below with that code and run this script again');

// Step 2: Exchange authorization code for refresh token
const authCode = 'AUTHORIZATION_CODE_HERE'; // Replace this

if (authCode !== 'AUTHORIZATION_CODE_HERE') {
  const getRefreshToken = async () => {
    const basic = Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString('base64');
    
    const response = await fetch('https://accounts.spotify.com/api/token', {
      method: 'POST',
      headers: {
        Authorization: `Basic ${basic}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code: authCode,
        redirect_uri: REDIRECT_URI,
      }),
    });

    const data = await response.json();
    console.log('Your refresh token:', data.refresh_token);
  };

  getRefreshToken().catch(console.error);
}