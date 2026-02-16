# MCP Apps Playground

Small root-level dev app for previewing MCP examples in this repository.

## What it does

- Scans `examples/` for example folders containing `mcp-app.html`
- Shows examples in a dropdown
- Loads selected built example from `examples/<name>/dist/mcp-app.html`
- Automatically sends mock MCP proxy events after iframe load:
  - `ui/notifications/host-context-changed`
  - `ui/notifications/tool-result`
- Mock payload source resolution:
  - `examples/<name>/response.json` (if present)
  - fallback: `playground/playground-app/mock-data/default.json`

## Run

```bash
cd playground/playground-app
npm run dev
```

Open: `http://localhost:4311`

## Important

- On example selection, the playground auto-builds when `dist/mcp-app.html` is missing.
- If build fails, the playground will try `npm install` once and then rebuild.
- Put a `response.json` in `examples/<name>/` to control preview payload.
- Optional: add `template-metadata.json` with `uiElements` and `mcpFeatures` arrays so users can filter examples in the playground. See [TEMPLATE_METADATA.md](./TEMPLATE_METADATA.md).
