# Apigene MCP Apps Templates

A collection of reusable templates for building MCP (Model Context Protocol) apps. These templates provide a foundation for creating interactive UI components that integrate with MCP servers.

## Overview

This repository contains multiple template implementations for different use cases, all built on top of the base template. Each template demonstrates how to render specific types of data and interactions.

## Templates

### Base Template
The foundational template that includes all common MCP protocol handling, dark mode support, display modes, and utility functions. See [base-template/README.md](./base-template/README.md) for detailed documentation.

### Available Templates

- **apollo-companies** - Template for displaying Apollo company data
- **apollo-people** - Template for displaying Apollo people/contact data
- **ashby-candidates** - Template for displaying Ashby candidate information
- **datadog-listlogs** - Template for displaying Datadog log entries
- **firecrawl-scrape** - Template for displaying scraped web content
- **google-search-console** - Template for Google Search Console analytics
- **rebrickable** - Template for displaying LEGO set information with 3D visualization
- **tavily** - Template for displaying Tavily search results

## Quick Start

1. **Choose a template** that matches your use case, or start with `base-template`
2. **Copy the template directory** to create your new app
3. **Customize** the `renderData()` function in `src/mcp-app.ts`
4. **Add your styles** in `src/mcp-app.css`
5. **Test** your app with sample data

## Structure

Each template follows this structure:

```
template-name/
├── mcp-app.html          # Main HTML file
├── src/
│   ├── mcp-app.ts        # TypeScript logic
│   ├── mcp-app.css       # Template-specific styles
│   └── global.css        # Common base styles
└── README.md             # Template-specific documentation (optional)
```

## Features

All templates include:

- ✅ MCP Protocol Handling (JSON-RPC 2.0)
- ✅ Dark Mode Support
- ✅ Display Modes (inline/fullscreen)
- ✅ Size Notifications
- ✅ Error Handling
- ✅ Data Utilities

## Development

### Creating a New Template

1. Copy `base-template` to a new directory
2. Update `mcp-app.html` title and metadata
3. Implement `renderData()` function in `src/mcp-app.ts`
4. Add template-specific styles in `src/mcp-app.css`
5. Test with sample data

### Best Practices

- Always use `escapeHtml()` for user-generated content
- Use `unwrapData()` to handle nested data structures
- Call `notifySizeChanged()` after rendering
- Support dark mode with `body.dark` CSS selectors
- Handle errors gracefully with try/catch blocks

## License

[Add your license here]

## Contributing

[Add contribution guidelines here]
