# Google Sheet MCP App

This MCP app displays Google Sheets embedded in an iframe. It extracts the spreadsheet ID from the API response and embeds the sheet using Google's embed URL.

## Features

- **Automatic Spreadsheet ID Extraction**
  - Extracts spreadsheet ID from API request URL
  - Supports various response formats
  - Fallback extraction from response data

- **Google Sheets Embed**
  - Embeds sheet using Google's official embed URL
  - Full Google Sheets functionality (view, scroll, etc.)
  - Responsive iframe sizing

- **Sheet Metadata**
  - Displays sheet range
  - Shows row count
  - "Open in Google Sheets" link

- **Dark Mode Support**
  - Automatic theme detection
  - Full dark mode styling

- **Responsive Design**
  - Mobile-friendly layout
  - Adaptive iframe height

## Data Format

The app expects data in one of these formats:

### Format 1: API Response with Request Context
```json
{
  "request": {
    "url": "https://sheets.googleapis.com/v4/spreadsheets/{SPREADSHEET_ID}/values/..."
  },
  "response": {
    "status_code": 200,
    "body": {
      "range": "Sheet1!A1:Z1000",
      "majorDimension": "ROWS",
      "values": [...]
    }
  }
}
```

### Format 2: Direct API Response
```json
{
  "status_code": 200,
  "body": {
    "range": "Sheet1!A1:Z1000",
    "majorDimension": "ROWS",
    "values": [...]
  }
}
```

### Format 3: With Input URL
```json
{
  "input": {
    "url": "https://sheets.googleapis.com/v4/spreadsheets/{SPREADSHEET_ID}/values/..."
  },
  "body": {
    "range": "Sheet1!A1:Z1000",
    "values": [...]
  }
}
```

The app automatically extracts the spreadsheet ID from URLs matching the pattern:
`/spreadsheets/{SPREADSHEET_ID}/`

## CSP Configuration

This app embeds Google Sheets via iframe. Your MCP server must configure CSP with:

```typescript
csp: {
  frameDomains: [
    "https://docs.google.com"
  ],
  resourceDomains: [],
  connectDomains: [],
  baseUriDomains: []
}
```

## Usage

1. **Copy the template directory**
   ```bash
   cp -r google-sheet /path/to/your/mcp-server/templates/
   ```

2. **Configure CSP** in your MCP server's resource handler to allow iframes from `docs.google.com`

3. **Send sheet data** via the MCP protocol:
   ```json
   {
     "jsonrpc": "2.0",
     "method": "ui/notifications/tool-result",
     "params": {
       "structuredContent": {
         "request": {
           "url": "https://sheets.googleapis.com/v4/spreadsheets/{ID}/values/..."
         },
         "response": {
           "status_code": 200,
           "body": {...}
         }
       }
     }
   }
   ```

## How It Works

1. **Extract Spreadsheet ID**: The app searches for the spreadsheet ID in:
   - `request.url`
   - `input.url`
   - `url` field
   - `body.url`
   - Response body URL fields
   - Fallback: regex search in JSON string

2. **Build Embed URL**: Constructs Google Sheets embed URL:
   ```
   https://docs.google.com/spreadsheets/d/{SPREADSHEET_ID}/preview
   ```

3. **Render Iframe**: Embeds the sheet in an iframe with proper sizing

## Customization

### Styling

Edit `src/mcp-app.css` to customize:
- Header appearance
- Iframe height
- Colors and themes
- Responsive breakpoints

### Data Handling

Edit `src/mcp-app.ts` to customize:
- Spreadsheet ID extraction logic (`getSpreadsheetId()`)
- Embed URL construction (`buildEmbedUrl()`)
- Metadata display

## File Structure

```
google-sheet/
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
- Requires iframe support

## Notes

- The sheet must be publicly accessible or the user must be logged into Google
- Google Sheets embed URLs require the sheet to have sharing permissions set appropriately
- The iframe height is set to 600px by default, adjustable via CSS
- In fullscreen mode, the iframe expands to fill available space

## License

This template is part of the MCP Apps template collection.
