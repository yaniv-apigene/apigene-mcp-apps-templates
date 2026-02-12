# Fake Store Product MCP App

This MCP app template displays product information from the Fake Store API (https://fakestoreapi.com).

## Features

- **Product Display**: Shows product title, price, description, category, and image
- **Rating Display**: Visual star rating with numeric value and review count
- **Responsive Design**: Works on desktop and mobile devices
- **Dark Mode Support**: Automatically adapts to light/dark themes
- **Clean UI**: Modern e-commerce card layout

## Data Format

The app expects data in the following format:

```json
{
  "status_code": 200,
  "body": {
    "id": 1,
    "title": "Fjallraven - Foldsack No. 1 Backpack, Fits 15 Laptops",
    "price": 109.95,
    "description": "Your perfect pack for everyday use and walks in the forest...",
    "category": "men's clothing",
    "image": "https://fakestoreapi.com/img/81fPKd-2AYL._AC_SL1500_t.png",
    "rating": {
      "rate": 3.9,
      "count": 120
    }
  }
}
```

The app also handles:
- Direct product objects (without `status_code` wrapper)
- Arrays of products (displays first product)
- Various nested formats

## CSP Configuration

This app displays images from `fakestoreapi.com` and uses Handlebars from `cdn.jsdelivr.net`. The MCP server must configure CSP with:

```typescript
resourceDomains: [
  "https://fakestoreapi.com",  // For product images
  "https://cdn.jsdelivr.net"    // For Handlebars script
]
```

## Usage

1. Copy this template directory to your MCP server's resources directory
2. Configure CSP as shown above
3. Use the template when calling Fake Store API endpoints
4. The app will automatically render product information

## Customization

- **Styles**: Edit `src/mcp-app.css` to customize the appearance
- **Layout**: Modify the `renderData()` function in `src/mcp-app.ts` to change the layout
- **Formatting**: Adjust `formatPrice()` and `formatRating()` functions for different formats
