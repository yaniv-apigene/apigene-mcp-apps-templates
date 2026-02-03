# Rebrickable Template with LEGO-Style Design and 3D Rendering

This template displays Rebrickable API responses with a playful LEGO-themed design and includes 3D rendering support using Three.js and LDrawLoader.

## Features

### LEGO-Style Design
- 🧱 Brick-like cards with studs on top
- 🎨 Classic LEGO colors (red, yellow, blue, green, orange)
- 📊 Header stats showing total parts and displayed count
- 🏷️ External ID badges (BrickLink, BrickOwl, LEGO, etc.)
- 📱 Fully responsive design
- 🌙 Dark mode support

### 3D Rendering Support
- 🎮 Interactive 3D viewers for LEGO parts
- 🔄 Orbit controls for rotating/zooming models
- 📦 Bundled Three.js library (no external dependencies)
- 🎯 Automatic 3D viewer initialization for parts with LDraw IDs

## Bundled Libraries

The template includes the following bundled third-party libraries:

1. **Three.js** (`src/three.min.js`)
   - Version: 0.160.0
   - Source: CDN (jsdelivr)
   - Purpose: 3D rendering engine

2. **LDrawLoader** (`src/LDrawLoader.js`)
   - ES module version
   - Purpose: Loading LDraw format LEGO models
   - Note: Requires LDraw parts library for full functionality

3. **OrbitControls** (`src/OrbitControls.js`)
   - ES module version
   - Purpose: Camera controls for 3D viewers
   - Wrapped for compatibility with global THREE object

## File Structure

```
rebrickable/
├── mcp-app.html              # Main HTML file
├── src/
│   ├── mcp-app.ts            # TypeScript logic
│   ├── mcp-app.css           # LEGO-themed styles
│   ├── global.css            # Base styles (shared)
│   ├── three.min.js          # Bundled Three.js library
│   ├── LDrawLoader.js        # LDrawLoader ES module
│   ├── OrbitControls.js       # OrbitControls ES module
│   ├── orbit-controls-wrapper.js  # Wrapper for OrbitControls
│   └── ldraw-loader-wrapper.js    # Wrapper for LDrawLoader
└── README.md                  # This file
```

## Usage

### Basic Rendering

The template automatically renders Rebrickable API responses. Parts with LDraw IDs will automatically get 3D viewers.

### Data Format

The template expects Rebrickable API response format:

```json
{
  "status_code": 200,
  "body": {
    "count": 60820,
    "next": "https://rebrickable.com/api/v3/lego/parts/?page=2",
    "previous": null,
    "results": [
      {
        "part_num": "003381",
        "name": "Sticker Sheet for Set 663-1",
        "part_cat_id": 58,
        "part_url": "https://rebrickable.com/parts/003381/...",
        "part_img_url": "https://cdn.rebrickable.com/...",
        "external_ids": {
          "BrickLink": ["663stk01"],
          "BrickOwl": ["781719"],
          "LDraw": ["003381"]
        }
      }
    ]
  }
}
```

### 3D Rendering

Parts with `external_ids.LDraw` will automatically get interactive 3D viewers. The viewers:
- Show a placeholder LEGO brick geometry
- Support mouse/touch controls for rotation and zoom
- Automatically resize with the container
- Work in both light and dark modes

### Extending LDrawLoader

To use actual LDraw models, you'll need to:

1. Set up the LDraw parts library path
2. Configure the LDrawLoader to load from the library
3. Update the `init3DViewer` function to load actual LDraw files

Example:

```typescript
// In mcp-app.ts, update init3DViewer function
if (typeof LDrawLoader !== 'undefined') {
  const loader = new LDrawLoader();
  loader.setPartsLibraryPath('path/to/ldraw/parts');
  const model = await loader.loadAsync(`parts/${partNum}.dat`);
  scene.add(model);
}
```

## Customization

### Colors

LEGO colors are defined as CSS variables in `mcp-app.css`:

```css
:root {
  --lego-red: #DC143C;
  --lego-yellow: #FFD700;
  --lego-blue: #0066CC;
  --lego-green: #00A859;
  --lego-orange: #FF8C00;
}
```

### 3D Viewer Settings

Adjust 3D viewer behavior in `init3DViewer()` function:
- Camera position
- Lighting setup
- Control sensitivity
- Animation speed

## Browser Support

- Modern browsers with WebGL support
- ES6+ JavaScript support
- ResizeObserver API (with fallback)

## Notes

- Three.js is loaded as a UMD bundle for compatibility
- LDrawLoader and OrbitControls are ES modules wrapped for global THREE
- 3D viewers are optional and gracefully degrade if Three.js fails to load
- The template handles both image-based and 3D-based part displays

## License

This template uses:
- Three.js (MIT License)
- LDrawLoader (MIT License)
- OrbitControls (MIT License)

All bundled libraries maintain their original licenses.
