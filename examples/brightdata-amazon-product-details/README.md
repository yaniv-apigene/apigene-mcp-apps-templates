# Amazon Product Details MCP App

This MCP app displays a single Amazon product with full details: title, description, image gallery, pricing, availability, delivery, features, product details table, variations (size/color), categories, and sustainability info.

## Features

- **Product header**: Brand, title, rating, seller
- **Pricing**: Final price, original price, discount badge
- **Availability & delivery**: Stock status, delivery lines, return policy
- **Prime badge**: When product is Prime-eligible
- **About / Features**: Description and bullet features
- **Variations**: Size and color options; variation chips
- **Product details**: Key-value table (e.g. model number, ASIN, fabric, care)
- **Additional info**: Date first available, manufacturer, category, rank
- **Sustainability**: Climate Pledge Friendly and sustainability features
- **Dark mode** and **inline/fullscreen** display modes

## Response format

The app expects the same API shape as the Amazon product details endpoint:

```json
{
  "status_code": 200,
  "body": [
    {
      "title": "Product Title",
      "brand": "Brand Name",
      "description": "...",
      "url": "https://www.amazon.com/...",
      "image_url": "https://m.media-amazon.com/...",
      "images": ["url1", "url2"],
      "final_price": 59,
      "initial_price": 128,
      "currency": "USD",
      "discount": "-54%",
      "availability": "In Stock",
      "rating": 4.5,
      "reviews_count": 123,
      "seller_name": "Amazon.com",
      "delivery": ["FREE delivery Saturday, ..."],
      "return_policy": "FREE 30-day refund/replacement",
      "amazon_prime": true,
      "features": ["Feature 1", "Feature 2"],
      "product_details": [
        { "type": "Item model number", "value": "XYZ" },
        { "type": "ASIN", "value": "B0FG9CDPD2" }
      ],
      "variations": [
        { "name": "26W x 26L Washed Black", "asin": "...", "color": "Washed Black", "size": "26W x 26L" }
      ],
      "variations_values": [
        { "variant name": "Size", "values": ["23W x 26L", "24W x 26L"] },
        { "variant name": "Color", "values": ["Vintage Dark", "Washed Black"] }
      ],
      "categories": ["Clothing, Shoes & Jewelry", "Women", "Clothing", "Jeans"],
      "date_first_available": "July 1, 2025",
      "manufacturer": "Everlane",
      "climate_pledge_friendly": false,
      "sustainability_features": [{ "title": "Organic content", "description": "..." }],
      "store_url": "https://www.amazon.com/stores/..."
    }
  ]
}
```

Supported wrappers:

- `{ status_code: 200, body: [product] }`
- `{ message: { status_code: 200, body: [...] } }` or `response_content` instead of `body`
- Direct `body` array or single product object with `title` or `asin`

## File structure

```
amazon-product-details/
├── mcp-app.html
├── src/
│   ├── mcp-app.ts
│   ├── mcp-app.css
│   └── global.css
└── README.md
```

## Styling

- Amazon-style orange header and Prime badge
- Red price/discount accents
- Responsive layout: gallery + info side-by-side on desktop, stacked on small screens
- Dark mode via `body.dark`

## Based on

- `base-template/` for MCP protocol and utilities
- `amazon-shopping/` for unwrap logic and Amazon look
- `shopify-product-details/` for single-product layout patterns
