# AGENTS.md: ontopo

This example was created from `base-template-sdk` and customized for Ontopo restaurant availability.

## What was customized

- **APP_NAME** / **APP_VERSION** in `src/mcp-app.ts` → "Ontopo" / "1.0.0"
- **renderData()** expects Ontopo API response: `{ posts: [{ post: { venue_name }, availability: { formattedRequest, recommended, areas } }], total? }`
- **RTL + Hebrew**: `dir="rtl"`, `lang="he"`, Hebrew labels (e.g. "אישור מיידי", "רשימת המתנה")
- **Styling** in `src/mcp-app.css`: Ontopo-style header, segmented control, venue cards, chips
- **mcp-app.html**: title "Ontopo – מקומות פנויים", Hebrew loading text "טוען תוצאות"

## Do not modify

- Protocol message handling in `src/mcp-app.ts`
- `src/global.css`
- `vite.config.ts`

## Optional

- Adjust chip/area display (e.g. show more recommended slots, or full area options) in `renderData()` and CSS.
