# Shopify Product Details MCP App

A comprehensive product details display for Shopify products, showing all product information including variants, features, specifications, and attributes.

## ✨ Features

### Product Header
- **Large Product Image**: Featured product image with responsive sizing
- **Product Title**: Clickable product title linking to product page (per instructions)
- **Star Ratings**: Visual star ratings with review counts
- **Product Description**: Full product description
- **Shop Information**: Shop name with link to store
- **Product Options**: Display of available options (Color, Size, etc.)

### Product Sections
- **Unique Selling Point**: Highlighted USP section
- **Top Features**: Bulleted list of key product features
- **Technical Specifications**: Detailed technical specs
- **Attributes**: Grid display of product attributes (gender, age group, materials, etc.)

### Variants Display
- **Variant Cards**: Grid layout showing all available variants
- **Variant Images**: Individual images for each variant
- **Variant Details**: Name, description, price, and rating per variant
- **Action Buttons**: "View Product" and "Add to Cart" buttons for each variant
- **Availability Status**: Clear indication of out-of-stock variants

## 📊 Data Format

The app expects product details in the following format:

```json
{
  "status_code": 200,
  "body": {
    "product": {
      "id": "gid://shopify/p/...",
      "description": "Product description",
      "options": [
        {
          "name": "Color",
          "values": [
            {"value": "Blue", "availableForSale": true, "exists": true}
          ]
        },
        {
          "name": "Size",
          "values": [
            {"value": "28", "availableForSale": true, "exists": true}
          ]
        }
      ],
      "selectedOptions": [
        {"name": "Color", "value": "Blue"},
        {"name": "Size", "value": "28"}
      ],
      "rating": {"rating": 4.6, "count": 139},
      "featuredVariantId": "gid://shopify/ProductVariant/...",
      "featuredVariantMedia": [
        {"url": "https://...", "altText": "Product image"}
      ],
      "variants": [
        {
          "id": "gid://shopify/ProductVariant/...",
          "displayName": "Product Name",
          "productDescription": "Detailed variant description",
          "availableForSale": true,
          "price": {"amount": 9800, "currency": "USD"},
          "media": [{"url": "https://...", "altText": "..."}],
          "shop": {
            "name": "Shop Name",
            "onlineStoreUrl": "https://..."
          },
          "variantUrl": "https://...",
          "checkoutUrl": "https://...",
          "rating": {"rating": 4.63, "count": 139}
        }
      ],
      "topFeatures": [
        "Feature 1",
        "Feature 2"
      ],
      "techSpecs": [
        "Spec 1",
        "Spec 2"
      ],
      "attributes": [
        {
          "name": "Target gender",
          "values": ["Male"]
        }
      ],
      "uniqueSellingPoint": "Unique selling point text"
    },
    "instructions": "Use markdown to render product titles as links..."
  }
}
```

## 🚀 Usage

1. Product details are displayed in a structured, easy-to-read layout
2. Product title is rendered as a clickable link to the product page
3. All variants are shown in a grid with individual details
4. Click "View Product" to visit the variant page
5. Click "Add to Cart" to go directly to checkout
6. Scroll through sections to see features, specs, and attributes

## 🎨 Design Features

- **Dark Theme**: Modern dark background (#1a1a1a) with light text
- **Responsive Grid**: Adapts from multi-column to single column on mobile
- **Card Layout**: Clean card design for variants
- **Visual Hierarchy**: Clear section separation with headers
- **Hover Effects**: Interactive elements with smooth transitions
- **Color Accents**: Shopify green (#96bf48) for links and CTAs

## 📱 Responsive

- **Desktop**: Two-column product header, multi-column variant grid
- **Tablet**: Single-column header, two-column variant grid
- **Mobile**: Single-column layout throughout, stacked buttons

## 🔧 Customization

### Colors
- Modify accent color: Change `#96bf48` (Shopify green) in `mcp-app.css`
- Adjust background colors: `.product-details`, `.variant-card`
- Change text colors: `.product-title`, `.product-description`

### Layout
- Adjust product header grid: `.product-header { grid-template-columns: ... }`
- Modify variant grid: `.variants-grid { grid-template-columns: ... }`
- Change section spacing: `.product-section { margin-bottom: ... }`

### Functionality
- Add variant selection logic
- Implement image gallery/swiper
- Add quantity selector
- Integrate with shopping cart API

## 📝 Version History

### v1.0.0
- Initial release
- Product details display
- Variant grid layout
- Features, specs, and attributes sections
- Responsive design
- Dark theme support
