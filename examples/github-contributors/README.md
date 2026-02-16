# GitHub Contributors Viewer MCP App

A beautiful GitHub-style contributors page that displays repository contributors with contribution counts, visual indicators, and filtering options.

## Features

- **GitHub-style UI**: Matches GitHub's contributors page look and feel
- **Contribution Visualization**: Visual bars showing relative contribution levels
- **Filtering**: Filter by All, Users, or Bots
- **Sorting**: Toggle between most and least contributions
- **Statistics**: Shows total contributors and total contributions
- **User Badges**: Displays Bot and Staff badges
- **Dark Mode**: Full dark mode support matching GitHub's dark theme
- **Responsive**: Works on mobile and desktop

## Data Format

The app expects GitHub API contributors response format:

```json
{
  "body": [
    {
      "login": "yaniv-apigene",
      "id": 159543863,
      "avatar_url": "https://avatars.githubusercontent.com/u/159543863?v=4",
      "html_url": "https://github.com/yaniv-apigene",
      "type": "User",
      "site_admin": false,
      "contributions": 649
    }
  ]
}
```

The app also handles:
- Direct array of contributors
- Nested in `body` property
- Standard table format with `rows` array

## Usage

1. Ensure your MCP server returns GitHub contributors API response format
2. The app will automatically render contributors in GitHub style
3. Use filters to show All, Users, or Bots
4. Click sort button to toggle between most/least contributions

## Features

### Filtering
- **All**: Shows all contributors
- **Users**: Shows only User type contributors
- **Bots**: Shows only Bot type contributors

### Sorting
- **Most**: Sort by contributions descending (default)
- **Least**: Sort by contributions ascending

### Visual Indicators
- Contribution bars show relative contribution levels:
  - High (80%+): Dark green
  - Medium (50-79%): Medium green
  - Low (20-49%): Light green
  - Minimal (<20%): Very light green

## Styling

The app uses GitHub's color scheme:
- Light mode: `#ffffff` background, `#24292f` text
- Dark mode: `#0d1117` background, `#c9d1d9` text
- Links: `#0969da` (light) / `#58a6ff` (dark)
- Borders: `#d0d7de` (light) / `#21262d` (dark)

## CSP Configuration

If using external avatar images, ensure CSP is configured:

```typescript
resourceDomains: [
  "https://avatars.githubusercontent.com",
  "https://ui-avatars.com"
]
```

## Files

- `mcp-app.html` - Main HTML file
- `src/mcp-app.ts` - TypeScript logic
- `src/mcp-app.css` - GitHub-style styles
- `src/global.css` - Base styles (from template)
