# TikTok Post Template for MCP Apps

This template displays TikTok post data in a modern, TikTok-style format. It's designed to render TikTok post information including video preview, profile details, engagement metrics, music information, and more.

## Features

- ✅ **Post Media Preview** - Video/image preview with play button and duration
- ✅ **Profile Header** - Avatar, username, verification badge, bio, and follower count
- ✅ **Post Description** - Full post caption/description
- ✅ **Music Info** - Music track details with cover art
- ✅ **Engagement Stats** - Likes, comments, shares, collects, and views
- ✅ **Post Metadata** - Creation time, post type, and TikTok link
- ✅ **Dark Mode Support** - TikTok-style dark theme with light mode fallback
- ✅ **Responsive Design** - Works on all screen sizes

## Data Format

The template expects TikTok post data in the following format:

```json
{
  "status_code": 200,
  "body": [{
    "url": "https://vt.tiktok.com/ZSanyvUvf/",
    "post_id": "7601420511645584660",
    "description": "בוקר שבת שמח",
    "create_time": "2026-01-31T07:14:01.000Z",
    "digg_count": 28600,
    "share_count": "4960",
    "collect_count": 706,
    "comment_count": 484,
    "play_count": 574300,
    "video_duration": 15,
    "video_url": "https://v16-webapp-prime.us.tiktok.com/...",
    "preview_image": "https://p19-common-sign.tiktokcdn-us.com/...",
    "post_type": "video",
    "profile_username": "מיכל הקטנה",
    "profile_url": "https://www.tiktok.com/@michal.haktana",
    "profile_avatar": "https://p19-common-sign.tiktokcdn-us.com/...",
    "profile_biography": "אמא של יולי, ליאו, ריף, ריי, אלי ונאיה ויצמן ❤️",
    "profile_followers": 237400,
    "is_verified": true,
    "music": {
      "title": "אלף גלגולים",
      "authorname": "יהודה בוחבוט",
      "covermedium": "https://p16-common.tiktokcdn-us.com/..."
    }
  }]
}
```

The template handles various data formats:
- Direct object: `{ url: "...", description: "...", ... }`
- Array format: `[{ url: "...", ... }]`
- Nested in `body`: `{ body: [{ url: "...", ... }] }`
- Nested in `body` object: `{ body: { url: "...", ... } }`

## Usage

1. **Copy the template directory**
   ```bash
   cp -r tiktok-post my-tiktok-app
   ```

2. **Update the HTML title** (if needed)
   - Edit `mcp-app.html` and change the title tag

3. **Customize styles** (optional)
   - Edit `src/mcp-app.css` to adjust colors, spacing, or layout

4. **Test with your data**
   - Ensure your MCP server sends TikTok post data in the expected format

## CSP Configuration

If you're using this template in an MCP server, you need to configure Content Security Policy (CSP) for external resources:

**Required CSP domains:**
- `https://*.tiktokcdn-us.com` - For profile avatars, preview images, and music covers
- `https://*.tiktokcdn.com` - Alternative TikTok CDN
- `https://v16-webapp-prime.us.tiktok.com` - For video URLs
- `https://www.tiktok.com` - For TikTok links

**Example CSP configuration:**
```typescript
resourceDomains: [
  "https://*.tiktokcdn-us.com",
  "https://*.tiktokcdn.com",
  "https://v16-webapp-prime.us.tiktok.com",
  "https://www.tiktok.com"
]
```

## Customization

### Changing Colors

Edit `src/mcp-app.css` and update the TikTok brand colors:

```css
.profile-avatar-fallback {
  background: linear-gradient(135deg, #ff0050 0%, #00f2ea 100%);
  /* Change these colors */
}
```

### Adding New Fields

To add a new field, add it to the `renderData()` function in `src/mcp-app.ts`:

```typescript
${newField 
  ? `<div class="new-field">${escapeHtml(newField)}</div>`
  : ''
}
```

### Styling Adjustments

All styles are in `src/mcp-app.css`. The template uses:
- TikTok dark theme (`#161823`) as primary background
- TikTok brand colors (`#ff0050`, `#00f2ea`) for accents
- Modern card-based layout with rounded corners
- Responsive grid layouts
- Dark mode support via `body.dark` selectors

## Best Practices

1. **Always escape HTML** - User-generated content is escaped using `escapeHtml()`
2. **Handle missing data** - All fields are optional and handled gracefully
3. **Image fallbacks** - Avatar images have fallback initials if image fails to load
4. **Responsive design** - Works on mobile, tablet, and desktop
5. **Accessibility** - Semantic HTML and proper link attributes

## Examples

### Basic Post
```json
{
  "description": "Check out this amazing video!",
  "digg_count": 1000,
  "comment_count": 50,
  "profile_username": "user123"
}
```

### Full Post
See the example in the main README or test with the provided sample data.

## Troubleshooting

### Images not loading
- Check CSP configuration includes TikTok CDN domains
- Verify image URLs are accessible
- Check browser console for CSP errors

### Data not rendering
- Check browser console for errors
- Verify data format matches expected structure
- Use `console.log()` to inspect received data

### Dark mode not working
- Ensure `body.dark` selectors are in CSS
- Check that `initializeDarkMode()` is called
- Verify host context changes are being received

## License

[Add your license here]
