# API Maintenance Guide

## Monitoring Your API

### Check if it's working

```bash
curl https://your-app.vercel.app/api/now-playing
```

### Common responses

- `{"isPlaying": false}` - Working, but no music playing
- `{"isPlaying": true, "title": "..."}` - Working perfectly
- `{"error": "..."}` - Needs attention

## Troubleshooting

### If you get authentication errors

1. Check if your Spotify app is still active in [Spotify Dashboard](https://developer.spotify.com/dashboard)
2. Verify environment variables in Vercel dashboard
3. Get a new refresh token if needed

### If the API stops responding

1. Check Vercel function logs in your dashboard
2. Verify your Spotify app hasn't been suspended
3. Test locally with `npm run dev`

## Refresh Token Renewal (if needed)

If your refresh token expires, just run the authorization flow again:

1. Visit: `https://accounts.spotify.com/authorize?client_id=YOUR_CLIENT_ID&response_type=code&redirect_uri=http://localhost:3000/callback&scope=user-read-currently-playing`
2. Get the new code from the redirect URL
3. Exchange it for a new refresh token
4. Update the environment variable in Vercel

## Best Practices

- Use the API reasonably (don't spam requests)
- Keep your Spotify app credentials secure
- Monitor occasionally to ensure it's working
- Consider adding error logging if you need detailed diagnostics
