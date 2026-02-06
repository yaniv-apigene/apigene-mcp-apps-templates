# Slack Message Search MCP App

A Slack-style message search display app built on the MCP Apps base template.

## Overview

This app displays Slack message search results in a clean, Slack-like interface. It supports:

- Message display with channel badges, usernames, and timestamps
- Rich text blocks
- Message attachments with colors, fields, and formatting
- Dark mode support
- Responsive design

## Data Format

The app expects Slack API search response format:

```json
{
  "body": {
    "query": "search query",
    "messages": {
      "total": 121,
      "pagination": { ... },
      "matches": [
        {
          "channel": { "id": "...", "name": "..." },
          "user": "U...",
          "username": "username",
          "ts": "1770382419.152809",
          "text": "message text",
          "attachments": [ ... ],
          "blocks": [ ... ],
          "permalink": "https://..."
        }
      ]
    }
  }
}
```

## Features

- **Slack-style UI**: Mimics Slack's message display with channel badges, user names, and timestamps
- **Attachment Support**: Displays Slack attachments with colors, fields, and rich formatting
- **Rich Text Blocks**: Renders Slack block kit rich text elements
- **Dark Mode**: Full dark mode support matching Slack's dark theme
- **Responsive**: Works on mobile and desktop

## Customization

To customize the app:

1. **Colors**: Edit CSS variables in `src/mcp-app.css`
2. **Layout**: Modify the HTML structure in `renderData()` function
3. **Formatting**: Adjust timestamp and text formatting functions

## Usage

This app is designed to work with Slack API search results. The data should be passed via the MCP protocol `ui/notifications/tool-result` message.
