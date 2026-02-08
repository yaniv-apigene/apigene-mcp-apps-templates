# LinkedIn Post Template for MCP Apps

This template displays LinkedIn post data in a clean, professional format. It's designed to render LinkedIn post information including author details, post content, images, engagement metrics, comments, and metadata.

## Features

- ✅ **Post Header** - Author avatar, name, headline, and post date
- ✅ **Post Content** - Text content with HTML support and images
- ✅ **Engagement Metrics** - Likes and comments count
- ✅ **Top Comments** - Display top visible comments with user info and reactions
- ✅ **Post Metadata** - Post type, account type, author stats, and posting date
- ✅ **Dark Mode Support** - Automatic theme switching
- ✅ **Responsive Design** - Works on all screen sizes

## Data Format

The template expects LinkedIn post data in the following format:

```json
{
  "status_code": 200,
  "body": [{
    "url": "https://www.linkedin.com/posts/...",
    "id": "7415801030913007616",
    "user_id": "avigoldfinger",
    "use_url": "https://il.linkedin.com/in/avigoldfinger",
    "title": "Post title...",
    "headline": "Author headline",
    "post_text": "Post content text...",
    "post_text_html": "Post content HTML...",
    "date_posted": "2026-01-10T17:05:44.662Z",
    "images": ["https://media.licdn.com/..."],
    "num_likes": 19,
    "num_comments": 12,
    "top_visible_comments": [{
      "use_url": "https://www.linkedin.com/in/...",
      "user_id": "denise-howard",
      "user_name": "Denise Howard",
      "comment_date": "2026-01-10T18:11:59.254Z",
      "comment": "Comment text...",
      "num_reactions": 0,
      "tagged_users": []
    }],
    "user_followers": 4091,
    "user_posts": 485,
    "user_articles": 5,
    "post_type": "post",
    "account_type": "Person",
    "author_profile_pic": "https://static.licdn.com/...",
    "original_post_text": "Original post text..."
  }]
}
```

The template handles various data formats:
- Direct object: `{ url: "...", ... }`
- Array format: `[{ url: "...", ... }]`
- Nested in `body`: `{ body: [{ url: "...", ... }] }`
- Nested in `body` object: `{ body: { url: "...", ... } }`

## Usage

1. **Copy the template directory**
   ```bash
   cp -r linkedin-post my-linkedin-post-app
   ```

2. **Update the HTML title** (if needed)
   - Edit `mcp-app.html` and change the title tag

3. **Customize styles** (optional)
   - Edit `src/mcp-app.css` to adjust colors, spacing, or layout

4. **Test with your data**
   - Ensure your MCP server sends LinkedIn post data in the expected format

## CSP Configuration

If you're using this template in an MCP server, you need to configure Content Security Policy (CSP) for external resources:

**Required CSP domains:**
- `https://media.licdn.com` - For post images
- `https://static.licdn.com` - For author profile pictures

**Example CSP configuration:**
```typescript
resourceDomains: [
  "https://media.licdn.com",
  "https://static.licdn.com"
]
```

## Customization

### Changing Colors

Edit `src/mcp-app.css` and update the LinkedIn blue color (`#0a66c2`):

```css
.post-link {
  color: #0a66c2; /* Change this */
}
```

### Adding New Sections

To add a new section, add it to the `renderData()` function in `src/mcp-app.ts`:

```typescript
${newField 
  ? `<div class="section">
      <h2 class="section-title">New Section</h2>
      <div class="section-content">
        ${escapeHtml(newField)}
      </div>
    </div>`
  : ''
}
```

### Styling Adjustments

All styles are in `src/mcp-app.css`. The template uses:
- LinkedIn blue (`#0a66c2`) for links and accents
- Clean white cards with subtle shadows
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
  "url": "https://www.linkedin.com/posts/...",
  "user_id": "johndoe",
  "post_text": "This is a sample post...",
  "num_likes": 10,
  "num_comments": 5
}
```

### Full Post with Comments
See the example in the main README or test with the provided sample data.

## Troubleshooting

### Images not loading
- Check CSP configuration includes LinkedIn domains
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
