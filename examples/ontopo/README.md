# ontopo

MCP App that displays **Ontopo** restaurant availability results: venue names, recommended time slots, and area options in Ontopo’s look and feel (RTL, Hebrew, light grey/white cards and chips).

## Data contract

The tool result (or `response.json` for preview) must be the Ontopo API response shape:

- `posts`: array of `{ post: { venue_name, ... }, availability: { formattedRequest, recommended, areas, ... } }`
- Optional: `total`, `timer`

The app shows:

- Header: “מצאנו מספר מקומות פנויים עבורך” and subtitle with date/time/size from the first post’s `formattedRequest`
- Segmented row: size, short date, time
- One card per venue: name + recommended chips (area · time · method) + area chips

## Build

```bash
npm install
npm run build
```

Output: `dist/mcp-app.html`

## Scripts

- `npm run build` – single-file production build  
- `npm run dev` – watch and rebuild  
- `npm run preview` – serve built `dist`

## Preview

Use `response.json` in the MCP Apps Playground (or any host that sends `ui/notifications/tool-result` with this payload) to preview the UI.
