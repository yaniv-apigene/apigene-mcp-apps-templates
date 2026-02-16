# Amazon Shopping MCP App

This MCP app displays Amazon product search results from BrightData scraping in a beautiful Amazon-style shopping interface.

## Features

- **Product Grid Layout**: Displays products in a responsive grid similar to Amazon's product listings
- **Product Images**: Shows product images with fallback placeholders
- **Pricing Information**: Displays current prices with discount badges when applicable
- **Star Ratings**: Visual star ratings with review counts
- **Prime Badges**: Highlights Prime-eligible products
- **Product Variations**: Shows available color/style variations
- **Brand Information**: Displays product brands
- **Sponsored/Badge Indicators**: Shows sponsored products and special badges (e.g., "Limited time deal")
- **Dark Mode Support**: Automatically adapts to system theme preferences
- **Responsive Design**: Works seamlessly on desktop and mobile devices

## Response Format

The app expects data in the following format (from BrightData Amazon scraping):

```json
{
  "status_code": 200,
  "body": [
    {
      "asin": "B07Y7DWKS1",
      "url": "https://www.amazon.com.au/...",
      "name": "Product Name",
      "image": "https://m.media-amazon.com/images/I/...",
      "final_price": 94.1,
      "initial_price": 0,
      "currency": "AUD",
      "rating": 4.4,
      "num_ratings": 63,
      "brand": "Brand Name",
      "is_prime": false,
      "badge": "Limited time deal",
      "sponsored": "false",
      "variations": [
        {"asin": "B07Y7DWKS1", "name": "Black"},
        {"asin": "B0C6XN47XN", "name": "Dark Brown"}
      ]
    }
  ]
}
```

## Usage

This app is designed to work with BrightData's Amazon scraping tools. It automatically handles various response formats including:

- Direct BrightData API responses: `{status_code: 200, body: [...]}`
- Claude format: `{message: {status_code: 200, response_content: [...]}}`
- Nested formats from various MCP clients

## File Structure

```
amazon-shopping/
├── mcp-app.html          # Main HTML file
├── src/
│   ├── mcp-app.ts        # TypeScript logic
│   ├── mcp-app.css       # Template-specific styles (Amazon-themed)
│   └── global.css        # Common base styles
└── README.md             # This file
```

## Customization

The app uses Amazon's brand colors (orange gradient) and includes:

- Custom header with Amazon-style icon
- Product cards with hover effects
- Price display with discount badges
- Star rating visualization
- Prime badge highlighting
- Product variation chips
- Responsive grid layout for mobile devices

## Based On

This app is based on:
- `base-template/` - For MCP protocol handling and common utilities
- `brightdata-search-engine/` - For BrightData response format handling

## Product Card Features

Each product card displays:
- Product image (with lazy loading)
- Brand name
- Product title (truncated to 2 lines)
- Star rating with review count
- Price (with original price if discounted)
- Prime badge (if applicable)
- Product variations (colors/styles)
- Link to Amazon product page

## Styling

The app uses Amazon-inspired styling:
- Orange gradient header (#ff9900 to #ff6600)
- Product cards with subtle shadows and hover effects
- Price highlighting in Amazon red (#b12704)
- Prime badge with orange gradient
- Responsive grid that adapts to screen size
