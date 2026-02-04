# Instagram Post MCP App

This MCP app displays Instagram post information in Instagram's signature style. It shows post media, captions, engagement metrics, comments, and tagged users.

## Features

- **Profile Header**
  - Profile picture (circular avatar)
  - Username with verification badge
  - Co-authors and tagged users
  - Follower count
  - External link to Instagram post

- **Media Display**
  - Single or multiple photos/videos
  - Carousel navigation for multiple media
  - Video badges
  - Responsive square aspect ratio

- **Engagement Metrics**
  - Like count (formatted with K/M abbreviations)
  - Comment count
  - Engagement icons (like, comment, share)

- **Post Content**
  - Caption with username
  - Relative timestamp (e.g., "2h", "3d", "Jan 27")
  - Content type indicator

- **Comments Section**
  - Latest comments with user avatars
  - Comment likes
  - "View all comments" link

- **Tagged Users**
  - List of tagged users with verification badges
  - Links to user profiles

- **Dark Mode Support**
  - Instagram dark mode styling
  - Automatic theme detection

- **Responsive Design**
  - Mobile-friendly layout
  - Touch-friendly carousel controls

## Data Format

The app expects data in the following format:

```json
{
  "status_code": 200,
  "body": [{
    "user_posted": "nike",
    "description": "The NikeSKIMS Spring '26 Collection...",
    "likes": 2202780,
    "num_comments": 29595,
    "date_posted": "2026-01-27T08:01:03.000Z",
    "photos": ["https://..."],
    "videos": ["https://..."],
    "latest_comments": [
      {
        "comments": "😍😍😍",
        "user_commenting": "username",
        "likes": 0,
        "profile_picture": "https://..."
      }
    ],
    "profile_image_link": "https://...",
    "is_verified": true,
    "followers": 298250508,
    "tagged_users": [...],
    "content_type": "Reel",
    "url": "https://www.instagram.com/p/..."
  }]
}
```

The app also handles:
- Direct post object format
- Array of posts (displays first post)
- Various nested response formats

## CSP Configuration

This app displays images and videos from Instagram CDN. Your MCP server must configure CSP with:

```typescript
csp: {
  resourceDomains: [
    "https://scontent-*.cdninstagram.com",
    "https://*.cdninstagram.com"
  ],
  connectDomains: [],
  frameDomains: [],
  baseUriDomains: []
}
```

Note: Wildcard subdomains (`*.cdninstagram.com`) are supported in CSP configuration.

## Usage

1. **Copy the template directory**
   ```bash
   cp -r instagram-post /path/to/your/mcp-server/templates/
   ```

2. **Configure CSP** in your MCP server's resource handler to allow images/videos from Instagram CDN

3. **Send post data** via the MCP protocol:
   ```json
   {
     "jsonrpc": "2.0",
     "method": "ui/notifications/tool-result",
     "params": {
       "structuredContent": {
         "status_code": 200,
         "body": [...]
       }
     }
   }
   ```

## Customization

### Styling

Edit `src/mcp-app.css` to customize:
- Colors and themes
- Layout spacing
- Card appearance
- Carousel behavior

### Data Handling

Edit `src/mcp-app.ts` to customize:
- Data extraction logic (`extractPostData()`)
- Number formatting (`formatNumber()`)
- Date formatting (`formatRelativeTime()`)
- Media rendering (`renderMedia()`)
- Comments rendering (`renderComments()`)

## File Structure

```
instagram-post/
├── mcp-app.html          # Main HTML file
├── src/
│   ├── mcp-app.ts        # TypeScript logic
│   ├── mcp-app.css       # App-specific styles
│   └── global.css        # Common base styles (DO NOT MODIFY)
├── CSP_GUIDE.md          # CSP configuration guide
└── README.md             # This file
```

## Browser Support

- Modern browsers (Chrome, Firefox, Safari, Edge)
- Mobile browsers (iOS Safari, Chrome Mobile)
- Requires ES6+ support
- Video playback requires HTML5 video support

## License

This template is part of the MCP Apps template collection.
