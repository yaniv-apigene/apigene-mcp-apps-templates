# LinkedIn Profile Template for MCP Apps

This template displays LinkedIn profile data in a clean, professional format. It's designed to render LinkedIn profile information including personal details, company information, education, recommendations, and more.

## Features

- ✅ **Profile Header** - Avatar, name, location, current company, and stats
- ✅ **About Section** - Professional summary/bio
- ✅ **Education** - Educational background with dates
- ✅ **Languages** - Language proficiencies
- ✅ **Recommendations** - Professional recommendations
- ✅ **People Also Viewed** - Related profiles
- ✅ **Dark Mode Support** - Automatic theme switching
- ✅ **Responsive Design** - Works on all screen sizes

## Data Format

The template expects LinkedIn profile data in the following format:

```json
{
  "status_code": 200,
  "body": [{
    "id": "profile-id",
    "name": "Full Name",
    "first_name": "First",
    "last_name": "Last",
    "city": "City, State",
    "location": "City, State, Country",
    "country_code": "US",
    "about": "Professional summary...",
    "avatar": "https://media.licdn.com/...",
    "banner_image": "https://static.licdn.com/...",
    "url": "https://www.linkedin.com/in/...",
    "current_company": {
      "name": "Company Name",
      "link": "https://www.linkedin.com/company/...",
      "company_id": "company-id"
    },
    "education": [{
      "title": "University Name",
      "name": "University Name",
      "url": "https://www.linkedin.com/school/...",
      "start_year": "2010",
      "end_year": "2014"
    }],
    "languages": [{
      "title": "English",
      "subtitle": "Native or bilingual proficiency"
    }],
    "recommendations": [
      "Recommendation text..."
    ],
    "recommendations_count": 4,
    "people_also_viewed": [{
      "name": "Person Name",
      "location": "City, State",
      "profile_link": "https://www.linkedin.com/in/..."
    }],
    "connections": 500,
    "followers": 6864
  }]
}
```

The template handles various data formats:
- Direct object: `{ name: "...", ... }`
- Array format: `[{ name: "...", ... }]`
- Nested in `body`: `{ body: [{ name: "...", ... }] }`
- Nested in `body` object: `{ body: { name: "...", ... } }`

## Usage

1. **Copy the template directory**
   ```bash
   cp -r linkedin-profile my-linkedin-app
   ```

2. **Update the HTML title** (if needed)
   - Edit `mcp-app.html` and change the title tag

3. **Customize styles** (optional)
   - Edit `src/mcp-app.css` to adjust colors, spacing, or layout

4. **Test with your data**
   - Ensure your MCP server sends LinkedIn profile data in the expected format

## CSP Configuration

If you're using this template in an MCP server, you need to configure Content Security Policy (CSP) for external resources:

**Required CSP domains:**
- `https://media.licdn.com` - For profile avatars
- `https://static.licdn.com` - For banner images

**Example CSP configuration:**
```typescript
resourceDomains: [
  "https://media.licdn.com",
  "https://static.licdn.com"
]
```

## Customization

### Changing Colors

Edit `src/mcp-app.css` and update the LinkedIn blue color (`#0077b5`):

```css
.company-link {
  color: #0077b5; /* Change this */
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
- LinkedIn blue (`#0077b5`) for links and accents
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

### Basic Profile
```json
{
  "name": "John Doe",
  "location": "San Francisco, CA",
  "current_company": {
    "name": "Tech Corp"
  },
  "about": "Software engineer with 10+ years of experience..."
}
```

### Full Profile
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
