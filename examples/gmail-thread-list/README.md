# Gmail Inbox MCP App

A Gmail-style inbox widget for MCP that displays Gmail API **threads** (e.g. from `GET gmail/v1/users/me/threads`) with follow-up actions.

## Data format

Expects the **response body** from the Gmail threads API:

- **Request:** `GET https://gmail.googleapis.com/gmail/v1/users/me/threads?maxResults=20&q=...`
- **Response body shape:**
  - `threads`: array of `{ id, snippet?, historyId? }`
  - `nextPageToken?`: string
  - `resultSizeEstimate?`: number

The app also accepts a wrapped format: `{ status_code, headers, body }` where `body` has the shape above.

## Features

- **Gmail-style UI:** Red header, clean thread list, snippet preview, hover states, dark mode.
- **Follow-up actions per thread:**
  - **Open in Gmail** — opens the thread in Gmail in a new tab.
  - **Reply** — suggests a follow-up message (e.g. for the host to “reply to this thread”) and optionally copies it to the clipboard.
- **Footer hint** for natural follow-ups like “summarize this inbox” or “reply to thread X”.

## Customization

- **Snippet length:** Edit `truncateSnippet(..., maxLen)` in `src/mcp-app.ts` (default 120).
- **Gmail URL:** `GMAIL_INBOX_URL` in `src/mcp-app.ts` (default `https://mail.google.com/mail/u/0/#inbox/`).
- **Styles:** `src/mcp-app.css` (header color, list height, button styles).

## Protocol

- Uses standard MCP App protocol; receives data via `ui/notifications/tool-result` with `structuredContent` set to the API response (or its `body`).
- Sends `ui/notifications/follow-up-suggestion` when the user clicks **Reply** (optional for the host).

## Files

- `mcp-app.html` — entry point
- `src/mcp-app.ts` — app logic and render
- `src/mcp-app.css` — Gmail-style styles
- `src/global.css` — shared base styles (do not modify)
