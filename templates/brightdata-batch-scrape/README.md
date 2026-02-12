# BrightData Batch Scrape MCP App

This MCP app displays multiple scrape results from BrightData's batch scraping tool in a beautiful tabbed interface. Each scrape result is shown in its own dedicated tab.

## Features

- **Tabbed Interface**: Each scrape result is displayed in its own tab for easy navigation
- **URL Display**: Shows the full URL and domain for each scrape
- **Content Viewing**: Displays scraped content in a scrollable, formatted view
- **Smooth Transitions**: Animated tab switching for a polished user experience
- **Dark Mode Support**: Automatically adapts to system theme preferences
- **Responsive Design**: Works seamlessly on desktop and mobile devices
- **Horizontal Scrolling**: Tab bar scrolls horizontally when there are many tabs

## Response Format

The app expects data in the following format:

```json
{
  "status_code": 200,
  "body": [
    {
      "url": "https://www.example.com",
      "content": "Scraped content text..."
    },
    {
      "url": "https://www.another-example.com",
      "content": "More scraped content..."
    }
  ]
}
```

## Usage

This app is designed to work with BrightData's batch scraping tools. It automatically handles various response formats including:

- Direct BrightData API responses: `{status_code: 200, body: [...]}`
- Claude format: `{message: {status_code: 200, response_content: [...]}}`
- Nested formats from various MCP clients

## File Structure

```
brightdata-batch-scrape/
├── mcp-app.html          # Main HTML file
├── src/
│   ├── mcp-app.ts        # TypeScript logic
│   ├── mcp-app.css       # Template-specific styles
│   └── global.css        # Common base styles
└── README.md             # This file
```

## Customization

The app uses BrightData's brand colors (orange gradient) and includes:

- Custom header with BrightData icon
- Tab navigation with hover effects
- Scrollable content areas
- URL display with clickable links
- Domain extraction and display
- Responsive layout for mobile devices

## Tab Features

Each tab displays:
- Domain name as the tab label (truncated if too long)
- Full URL in the panel header (clickable link)
- Domain information
- Scraped content in a formatted, scrollable view
- Smooth transitions when switching tabs

## Styling

The app uses BrightData-inspired styling:
- Orange gradient header (#ff6b35 to #f7931e)
- Clean tab interface with active state highlighting
- Scrollable content areas with custom scrollbars
- Responsive design that adapts to screen size
- Dark mode support with appropriate color adjustments

## Based On

This app is based on:
- `base-template/` - For MCP protocol handling and common utilities
- `brightdata-scrape/` - For BrightData response format handling
