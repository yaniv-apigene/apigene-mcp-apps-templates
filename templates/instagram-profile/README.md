# Instagram Profile MCP App

This MCP app displays Instagram profile data in an Instagram-style layout, showing profile information, highlights, and posts grid.

## Features

- **Instagram-Style Layout**: Authentic Instagram profile page design
- **Profile Header**: Profile picture, username, verification badge, stats (posts, followers, following), bio
- **Highlights Section**: Circular highlight icons with titles
- **Posts Grid**: Square post images in a 3-column grid
- **Post Overlays**: Hover effects showing likes and comments
- **Video Support**: Video posts with play on hover
- **Carousel Support**: Carousel posts with indicator badge
- **Dark Mode Support**: Automatically adapts to system theme preferences
- **Responsive Design**: Works seamlessly on desktop and mobile devices

## Response Format

The app expects data in the following format:

```json
{
  "status_code": 200,
  "body": [{
    "account": "username",
    "profile_name": "Full Name",
    "profile_image_link": "https://...",
    "biography": "Bio text...",
    "followers": 58242,
    "following": 691,
    "posts_count": 484,
    "is_verified": true,
    "posts": [
      {
        "caption": "Post caption",
        "image_url": "https://...",
        "video_url": "https://...",
        "likes": 2390,
        "comments": 80,
        "content_type": "Video",
        "url": "https://www.instagram.com/p/..."
      }
    ],
    "highlights": [
      {
        "title": "Highlight Title",
        "image": "https://...",
        "highlight_url": "https://..."
      }
    ]
  }]
}
```

## Usage

This app is designed to work with BrightData's Instagram scraping tools. It automatically handles various response formats including:

- Direct BrightData API responses: `{status_code: 200, body: [{...}]}`
- Claude format: `{message: {status_code: 200, response_content: [{...}]}}`
- Nested formats from various MCP clients

## File Structure

```
instagram-profile/
├── mcp-app.html          # Main HTML file
├── src/
│   ├── mcp-app.ts        # TypeScript logic
│   ├── mcp-app.css       # Template-specific styles (Instagram-themed)
│   └── global.css        # Common base styles
└── README.md             # This file
```

## Customization

The app uses Instagram's authentic styling:

- Clean white background (#fafafa)
- Instagram typography and spacing
- Square post grid (3 columns)
- Circular profile picture and highlights
- Hover overlays on posts
- Verification badge with Instagram gradient
- Responsive layout for mobile devices

## Profile Features

The profile header displays:
- Profile picture (circular, 150px)
- Username with verification badge (if verified)
- Stats: posts, followers, following
- Full name
- Biography
- Link to Instagram profile

## Highlights Features

- Circular highlight icons (77px)
- Highlight titles below icons
- Clickable links to highlight stories
- Horizontal scrolling on mobile

## Posts Features

Each post displays:
- Square image/video (1:1 aspect ratio)
- Hover overlay with likes and comments
- Video play indicator badge
- Carousel indicator badge
- Clickable link to Instagram post
- Video autoplay on hover

## Styling

The app uses Instagram-inspired styling:
- White/light background (#fafafa)
- Clean, minimal design
- Instagram-like typography
- Smooth hover transitions
- Responsive grid that adapts to screen size
- Dark mode support with appropriate color adjustments

## Based On

This app is based on:
- `base-template/` - For MCP protocol handling and common utilities
- Instagram's actual design patterns and styling
