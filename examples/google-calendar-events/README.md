# Google Calendar Events MCP App

A Google Calendar–style MCP app that displays events from the Google Calendar API (`calendar#events` list) with icon actions and optional video links.

## Data format

Expects the **response** from the Calendar events API:

- **Request:** `GET https://www.googleapis.com/calendar/v3/calendars/{calendarId}/events? ...`
- **Response shape:** Either the full `{ status_code, headers, body }` or just the body:
  - `body.kind`: `"calendar#events"`
  - `body.summary`: calendar name (e.g. primary email)
  - `body.timeZone`: e.g. `"Asia/Jerusalem"`
  - `body.items`: array of `calendar#event` objects

Each event can have:

- `summary`, `description`, `location`
- `start` / `end`: `{ dateTime, timeZone }` or `{ date }` (all-day)
- `htmlLink`: open in Google Calendar
- `recurrence`: array (e.g. `RRULE`) → shows "Repeats" badge
- `conferenceData.entryPoints`: video/phone links → "Join" video icon and link

## Features

- **GCal-style UI:** Blue header with calendar icon, event count, list of events with time, title, location, and "Repeats" badge when recurring.
- **Icon actions (GCal style):**
  - **Video/Join:** If the event has `conferenceData` with a video `entryPoint`, shows a video icon that opens the meeting link (e.g. Zoom).
  - **Open in Calendar:** Opens `htmlLink` in a new tab.
- **Time formatting:** Date + time range (e.g. "Tue, Feb 10, 9:00 AM – 9:30 AM") or "All day" for date-only events.
- **Dark mode** and **fullscreen** supported.

## Customization

- **Sorting:** Events are sorted by `start.dateTime` or `start.date`.
- **Styles:** `src/mcp-app.css` (header color, list height, icon buttons).

## Files

- `mcp-app.html` — entry point
- `src/mcp-app.ts` — parsing and render logic
- `src/mcp-app.css` — Google Calendar–style styles
- `src/global.css` — shared base styles (do not modify)
