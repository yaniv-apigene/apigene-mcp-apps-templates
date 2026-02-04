# Zara Product MCP App

This MCP app displays Zara product information in a beautiful, responsive card layout. It shows product details, images, pricing, availability, and related products.

## Features

- **Product Information Display**
  - Product name and section
  - Price with currency formatting
  - Color information with visual badge
  - Availability status (In Stock / Low Stock / Out of Stock)
  - SKU and category information

- **Image Gallery**
  - Main product image display
  - Thumbnail grid for multiple images
  - Interactive thumbnail selection
  - Responsive image layout

- **Product Details**
  - Full product description
  - Product dimensions/details
  - Direct link to Zara website

- **Related Products**
  - "You May Also Like" section
  - Price tags for related items

- **Dark Mode Support**
  - Automatic theme detection
  - Full dark mode styling

- **Responsive Design**
  - Mobile-friendly layout
  - Adaptive grid system
  - Touch-friendly interactions

## Data Format

The app expects data in the following format:

```json
{
  "status_code": 200,
  "body": [{
    "product_name": "TRF HIGH-WAIST WIDE-LEG JEANS",
    "price": 229,
    "currency": "ILS",
    "colour": "Black",
    "description": "HIGH-WAIST - WIDE LEG - FULL LENGTH\n\nHigh-waist, five-pocket jeans...",
    "dimension": "High-waist, five-pocket jeans...",
    "image": [
      "https://static.zara.net/assets/public/.../image1.jpg",
      "https://static.zara.net/assets/public/.../image2.jpg"
    ],
    "availability": true,
    "low_on_stock": false,
    "url": "https://www.zara.com/il/en/product.html",
    "sku": "512262324-800-32",
    "section": "WOMAN",
    "product_family": "PANTALON",
    "product_subfamily": "T.PANT.PAQUETER",
    "you_may_also_like": [
      {"final_price": "₪159.90", "currency": "ILS"},
      ...
    ]
  }]
}
```

The app also handles:
- Direct product object format
- Array of products (displays first product)
- Various nested response formats

## CSP Configuration

This app displays images from `static.zara.net`. Your MCP server must configure CSP with:

```typescript
csp: {
  resourceDomains: [
    "https://static.zara.net"
  ],
  connectDomains: [],
  frameDomains: [],
  baseUriDomains: []
}
```

## Usage

1. **Copy the template directory**
   ```bash
   cp -r zara-product /path/to/your/mcp-server/templates/
   ```

2. **Configure CSP** in your MCP server's resource handler to allow images from `static.zara.net`

3. **Send product data** via the MCP protocol:
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
- Image gallery behavior

### Data Handling

Edit `src/mcp-app.ts` to customize:
- Data extraction logic (`extractProductData()`)
- Price formatting (`formatPrice()`)
- Image gallery rendering (`renderImageGallery()`)

## File Structure

```
zara-product/
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

## License

This template is part of the MCP Apps template collection.
