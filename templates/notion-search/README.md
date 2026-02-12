# Notion Search MCP App

A Notion-style MCP app that displays Notion search API results (e.g. AI search or search endpoint) with Notion’s look and feel.

## Data format

Expects the API response in one of these shapes:

- Full: `{ status_code, body: { results, type? } }`
- Or direct body: `{ results, type? }`

Each item in `results` can have:

- **title** – Page or block title
- **url** – Link to open in Notion
- **type** – e.g. `"page"` (optional)
- **highlight** – Snippet or matching text (optional)
- **timestamp** – e.g. `"4 months ago (2025-09-23)"` or `"Past day (2026-02-10)"` (optional)
- **id** – Notion ID (optional)

## Features

- **Notion-style UI:** Dark header bar (#37352f), off-white content area, subtle borders, clean typography.
- **Result rows:** Page icon, title (link), type badge, highlight snippet (2 lines max), timestamp.
- **Open in Notion:** Each row links to `url`; external-link icon opens in a new tab.
- **Dark mode** and **fullscreen** supported.

## Customization

- **Highlight length:** Change the second argument to `truncate(item.highlight, 140)` in `renderResultRow()` (default 140 chars).
- **Styles:** Edit `src/mcp-app.css` (header color, list height, fonts).

## Files

- `mcp-app.html` – Entry point
- `src/mcp-app.ts` – Parsing and render logic
- `src/mcp-app.css` – Notion-style styles
- `src/global.css` – Shared base styles (do not modify)
