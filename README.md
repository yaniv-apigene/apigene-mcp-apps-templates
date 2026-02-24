# MCP Apps

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![npm version](https://img.shields.io/npm/v/@apigene/mcp-app-playground.svg)](https://www.npmjs.com/package/@apigene/mcp-app-playground)
[![Node.js](https://img.shields.io/badge/node-%3E%3D18-brightgreen)](https://nodejs.org)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](CONTRIBUTING.md)


---

## What is MCP App Playground?

**MCP App Playground** is a collection of **dozens of mock MCP App examples** inspired by real-world services (GitHub, Slack, Google Analytics, Shopify, Datadog, and many more). Each example is a small, self-contained UI that shows how to build an [MCP App](https://modelcontextprotocol.io/extensions/apps/overview) — an interactive HTML/TypeScript/CSS component that runs inside iframes in Claude and other AI hosts and displays tool results.

Use this repo to **see how MCP Apps are implemented** and to **simulate and evaluate** them locally. It ships with **one MCP server** you can run on your machine: point your AI client (e.g. Claude, Cursor) at it, invoke the demo tools, and see how the apps render and behave — no need to build your own server or real integrations first.


## Quick Start

### Run the Playground (preview any template instantly)

**Without cloning (from anywhere):**

```bash
npx @apigene/mcp-app-playground
```

Opens:
- **MCP Apps Playground** at `http://localhost:4311` — preview templates with mock data
- **MCP HTTP endpoint** at `http://localhost:3001/mcp` — for full host integration


**From the repo (after cloning):**

```bash
cd mcp-apps
npm install
npm start
```



### Create a New Template

```bash
# Copy the base template
cp -r examples/base-template examples/my-app
cd examples/my-app
npm install
npm run build
# Output: dist/mcp-app.html (single-file bundle)
```

Then open `examples/my-app/src/mcp-app.ts` and implement `renderData()`.

---

## Example Templates

| Template | Description |
|----------|-------------|
| `github-list-commits` | GitHub commit history with author info |
| `github-commit-diff` | Side-by-side diffs with syntax highlighting |
| `google-analytics` | Analytics dashboard with charts |
| `google-search-console` | Search performance table |
| `slack-search-messages` | Message search results |
| `spotify-search` | Track/album search cards |
| `shopify-get-product-details` | Product detail view |
| `vercel-get-deployments` | Deployment status list |
| `datadog-listlogs` | Log stream viewer |
| `notion-search` | Notion page search results |
| `tesla-controls` | Vehicle control panel |
| `firecrawl-scrape-url` | Web scrape results |
| `tavily-search` | AI-powered search results |
| `apollo-people-search` | People search cards |
| `brightdata-*` | 10+ Brightdata API integrations |
| `google-maps-search` | Location search with map preview |
| … | [44 more in `examples/`](examples/) |

---

## Base Template

### `examples/base-template`

The single base template for all MCP Apps. It uses the official `@modelcontextprotocol/ext-apps` SDK (theme, fonts, host styling) and builds to a single `dist/mcp-app.html` via Vite.

**Includes:** Dark mode, responsive layout, host context (theme/fonts/display mode), tool result/cancel/teardown handling.

```bash
cd examples/base-template
npm install && npm run build
```

See `examples/base-template/README.md` for SDK usage, event handlers, and customization. For Content Security Policy (e.g. external scripts/fonts), see `examples/base-template/CSP_GUIDE.md`.

---

## Template Architecture

Every MCP App template follows the same contract (from `examples/base-template`):

```
my-app/
├── mcp-app.html          # Entry point (loads CSS and TS module for dev)
├── src/
│   ├── mcp-app.ts        # ★ Implement renderData() here; SDK + handlers
│   ├── mcp-app.css       # App-specific styles
│   └── global.css        # Shared base styles (do not modify)
├── package.json          # Scripts: build, dev; deps: @modelcontextprotocol/ext-apps
├── vite.config.ts        # Vite + single-file output
├── response.json         # Optional: mock payload for playground preview
└── dist/
    └── mcp-app.html      # Built single-file bundle (npm run build)
```

### Key customization points in `src/mcp-app.ts`

| Symbol | Purpose |
|--------|---------|
| `APP_NAME` | App identifier |
| `APP_VERSION` | Semantic version string |
| `renderData(data)` | **Main function** — renders tool result into DOM |
| `unwrapData(data)` | Strips nested wrappers from MCP payloads |
| `escapeHtml(str)` | XSS-safe HTML insertion |
| `showError(msg)`, `showEmpty(msg)` | Error and empty-state UI |

The template uses the SDK `App` and registers handlers before `app.connect()`: `app.ontoolresult`, `app.onhostcontextchanged`, `app.ontoolcancelled`, `app.onteardown`, etc. See `examples/base-template/README.md` for the full list.

### MCP protocol (under the SDK)

| Message | SDK / behavior |
|---------|----------------|
| `ui/notifications/tool-result` | `app.ontoolresult` → `renderData()` |
| `ui/notifications/host-context-changed` | `app.onhostcontextchanged` → theme, fonts, display mode |
| `ui/notifications/tool-cancelled` | `app.ontoolcancelled` → error UI |
| `ui/resource-teardown` | `app.onteardown` → cleanup, `result: {}` |

---

## CLI Reference

```bash
npx @apigene/mcp-app-playground                 # Start playground + MCP server
npx @apigene/mcp-app-playground start           # Same as above
npx @apigene/mcp-app-playground lab             # Playground only
npx @apigene/mcp-app-playground mcp http        # MCP HTTP server only
npx @apigene/mcp-app-playground mcp stdio       # MCP stdio transport
npx @apigene/mcp-app-playground list            # List all examples
npx @apigene/mcp-app-playground build           # Build all examples
```

From the repo root:

```bash
npm run dev              # Start playground + MCP server
npm run lab              # Playground only
npm run mcp:http         # MCP HTTP server only
npm run mcp:stdio        # MCP stdio transport
npm run build:examples   # Build all examples
npm run list             # List all examples
```

---

## Development

### Prerequisites

- Node.js ≥ 18 (Node 22 recommended — see `.nvmrc`)
- npm

### Setup

```bash
git clone https://github.com/apigene/mcp-apps.git
cd mcp-apps
npm install
npm run dev
```

### Creating a Template (step by step)

1. **Copy the base template**

   ```bash
   cp -r examples/base-template examples/my-service-my-tool
   cd examples/my-service-my-tool
   ```

2. **Install and build**

   ```bash
   npm install
   npm run build
   ```

3. **Set app metadata** in `src/mcp-app.ts`:

   ```typescript
   const APP_NAME = "my-service-my-tool";
   const APP_VERSION = "1.0.0";
   ```

4. **Implement `renderData()`** based on your tool's response shape:

   ```typescript
   function renderData(data: any): void {
     const items = unwrapData(data);
     const app = document.getElementById("app")!;
     app.innerHTML = items.map((item: any) => `
       <div class="item">
         <h3>${escapeHtml(item.title)}</h3>
         <p>${escapeHtml(item.description)}</p>
       </div>
     `).join("");
   }
   ```

5. **Add `response.json`** — a real API response for local preview:

   ```json
   { "results": [{ "title": "Example", "description": "Test item" }] }
   ```

6. **Preview** in the playground:

   ```bash
   cd ../..
   npm run lab
   # Open http://localhost:4311 and select your template
   ```

### Conventions

- Never modify `src/global.css` — it's the shared base
- Always support dark mode via `body.dark` CSS class
- Always escape user data with `escapeHtml()`
- Register SDK event handlers before calling `app.connect()`
- Clean up resources in `app.onteardown`
- System fonts only — no external font imports (or configure CSP per `CSP_GUIDE.md`)
- Current protocol version: `2026-01-26`

---

## Using with Cursor / AI Agents

The `docs/` folder contains prompts optimized for AI-assisted development:

- [`docs/CURSOR_PROMPT_MCP_APP_SIMPLE.md`](docs/CURSOR_PROMPT_MCP_APP_SIMPLE.md) — create a template from a response.json
- [`docs/CURSOR_PROMPT_MCP_APP_FROM_OPENAPI.md`](docs/CURSOR_PROMPT_MCP_APP_FROM_OPENAPI.md) — generate a template from an OpenAPI spec

Each example also contains `AGENTS.md` with coding-agent-specific guidance.

---

## Contributing

Contributions are welcome! See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

Ways to contribute:
- Add a new example template for an API/service
- Improve the base templates or playground tooling
- Fix bugs or improve documentation
- Share your custom templates via a PR

---

## License

[MIT](LICENSE) © [Apigene](https://apigene.ai)
