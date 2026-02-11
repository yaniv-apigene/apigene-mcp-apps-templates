# Base Template (SDK Utilities Version) for MCP Apps

This is a base template for creating MCP (Model Context Protocol) apps using the **official `@modelcontextprotocol/ext-apps` SDK for utilities only**. It combines the best of both worlds: SDK utilities with manual message handling for maximum compatibility.

## 🆚 Approaches Comparison

This template uses the **SDK Utilities** approach:

### **Three Approaches:**

| Feature             | Manual (`base-template`) | SDK Full (`deprecated`) | **SDK Utilities** (this)           |
| ------------------- | ------------------------ | ----------------------- | ---------------------------------- |
| Protocol handling   | Manual (~540 lines)      | SDK callbacks           | Manual (~100 lines)                |
| SDK utilities       | ❌ None                  | ✅ Full SDK             | ✅ Full SDK                        |
| Proxy compatibility | ✅ Perfect               | ❌ Conflicts            | ✅ Perfect                         |
| Type safety         | Limited                  | Full                    | Full                               |
| Bundle size         | ~20KB                    | ~60-70KB                | ~60-70KB                           |
| Maintenance         | You handle protocol      | SDK handles all         | You handle messages, SDK utilities |
| Best for            | Learning                 | Direct host connection  | **Production with proxy**          |

### **Advantages of SDK Utilities Approach:**

- ✅ **Proxy Compatible**: Works seamlessly with `run-action.html` proxy layer
- ✅ **No Connection Conflicts**: Proxy handles `ui/initialize`, app listens for messages
- ✅ **SDK Utilities**: Theme helpers, fonts, auto-resize from SDK
- ✅ **Type Safety**: Full TypeScript types for all MCP constructs
- ✅ **Less Code**: ~100 lines vs ~540 lines of manual protocol handling
- ✅ **Best of Both**: Manual control + SDK convenience

### **Bundle Output:**

Single HTML file including:

- Your app code (~10-20KB)
- SDK utilities library (~40-50KB minified)
- All CSS inlined
- **Total**: ~60-70KB single file

## Quick Start

### 1. **Copy and Setup**

```bash
# Copy the template directory
cp -r base-template-sdk my-app-mcp
cd my-app-mcp

# Install dependencies
npm install
```

### 2. **Configure App Metadata**

Edit `src/mcp-app.ts` and update:

```typescript
const APP_NAME = "My App Name"; // Your app name
const APP_VERSION = "1.0.0"; // Your app version
```

### 3. **Update HTML Title**

Edit `mcp-app.html`:

```html
<title>MCP App: My App Name</title>
```

### 4. **Implement Rendering Logic**

Edit `src/mcp-app.ts` and implement the `renderData()` function:

```typescript
function renderData(data: any) {
  const app = document.getElementById("app");
  if (!app) return;

  // Your rendering logic here
  app.innerHTML = `<div class="container">...</div>`;
}
```

### 5. **Add Custom Styles**

Edit `src/mcp-app.css` and add your template-specific styles.

### 6. **Build**

```bash
# One-time build
npm run build

# Watch mode (rebuilds on changes)
npm run dev
```

### 7. **Use in MCP Server**

The bundled file is at `dist/mcp-app.html`. Use it in your MCP server:

```typescript
import fs from "node:fs/promises";
import {
  registerAppResource,
  RESOURCE_MIME_TYPE,
} from "@modelcontextprotocol/ext-apps/server";

registerAppResource(
  server,
  "ui://my-app/mcp-app.html",
  "ui://my-app/mcp-app.html",
  { mimeType: RESOURCE_MIME_TYPE },
  async () => {
    const html = await fs.readFile("path/to/dist/mcp-app.html", "utf-8");
    return {
      contents: [
        {
          uri: "ui://my-app/mcp-app.html",
          mimeType: RESOURCE_MIME_TYPE,
          text: html,
        },
      ],
    };
  },
);
```

## File Structure

```
base-template-sdk/
├── package.json          # Dependencies and scripts
├── tsconfig.json         # TypeScript configuration
├── vite.config.ts        # Vite bundling configuration
├── mcp-app.html          # Main HTML file (source)
├── src/
│   ├── mcp-app.ts        # TypeScript logic (SDK-based)
│   ├── mcp-app.css       # Template-specific styles
│   └── global.css        # Common base styles
├── dist/
│   └── mcp-app.html      # Bundled output (single file)
└── README.md             # This file
```

## What's Included

### Common Features

✅ **SDK Utilities** (No Connection)

- Theme helpers (`applyDocumentTheme`, `applyHostFonts`, `applyHostStyleVariables`)
- Auto-resize notifications (`setupSizeChangedNotifications`)
- Full TypeScript type definitions
- No `app.connect()` - works with proxy layer

✅ **Manual Message Handling** (Proxy Compatible)

- `ui/notifications/tool-result` - Receive tool data
- `ui/notifications/host-context-changed` - Theme/display mode changes
- `ui/notifications/tool-cancelled` - Handle cancellations
- `ui/resource-teardown` - Cleanup resources (with response)

✅ **Common Utilities**

- `unwrapData()` - Handle nested data structures
- `escapeHtml()` - Prevent XSS attacks
- `showError()` - Display error messages
- `showEmpty()` - Display empty state

✅ **Dark Mode Support**

- Automatic theme application via SDK helpers
- CSS variables for theming
- `body.dark` class for dark mode styles

✅ **Type Safety**

- Full TypeScript definitions
- Strongly typed message handlers
- Intellisense support

## Customization Guide

### 1. Implement `renderData()` Function

This is the main function you need to implement.

**Location:** `src/mcp-app.ts`

**Example:**

```typescript
function renderData(data: any) {
  const app = document.getElementById("app");
  if (!app) return;

  if (!data) {
    showEmpty("No data received");
    return;
  }

  try {
    const unwrapped = unwrapData(data);

    app.innerHTML = `
      <div class="container">
        <h1>My Data</h1>
        <div class="content">
          ${unwrapped.items
            .map(
              (item) => `
            <div class="item">
              <h3>${escapeHtml(item.title)}</h3>
              <p>${escapeHtml(item.description)}</p>
            </div>
          `,
            )
            .join("")}
        </div>
      </div>
    `;
  } catch (error: any) {
    console.error("Render error:", error);
    showError(`Error rendering data: ${error.message}`);
  }
}
```

### 2. Add Template-Specific Styles

**Location:** `src/mcp-app.css`

**Example:**

```css
.container {
  max-width: 1200px;
  margin: 0 auto;
}

.item {
  background: #ffffff;
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 12px;
}

body.dark .item {
  background: #1a1d24;
}
```

### 3. Add Utility Functions

**Location:** `src/mcp-app.ts` - "TEMPLATE-SPECIFIC FUNCTIONS" section

**Example:**

```typescript
function formatDate(date: string): string {
  return new Date(date).toLocaleDateString();
}

function normalizeData(data: any): any {
  // Transform data to expected format
  return data;
}
```

### 4. Handle External Libraries

#### Via NPM (Recommended):

```bash
npm install chart.js
```

```typescript
import Chart from "chart.js/auto";

// Use Chart in renderData()
```

#### Via CDN (Requires CSP):

```html
<!-- In mcp-app.html -->
<script src="https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.js"></script>
```

```typescript
// In src/mcp-app.ts
declare const Chart: any;
```

**Note:** CDN approach requires CSP configuration in your MCP server!

## Message Handling Examples

### How It Works

This template uses **manual message handling** instead of SDK callbacks to work with the proxy layer:

```typescript
// NO app.connect() - proxy handles initialization
// NO callbacks - we listen for messages directly

window.addEventListener("message", (event: MessageEvent) => {
  const msg = event.data;

  if (msg.jsonrpc === "2.0") {
    // Handle protocol messages
    if (msg.method === "ui/notifications/tool-result") {
      renderData(msg.params.structuredContent || msg.params);
    }
  }
});
```

### Receive Tool Result

```typescript
// Message: ui/notifications/tool-result
window.addEventListener("message", (event: MessageEvent) => {
  const msg = event.data;

  if (msg.method === "ui/notifications/tool-result" && msg.params) {
    const data = msg.params.structuredContent || msg.params;
    renderData(data);
  }
});
```

### Handle Theme Changes

```typescript
// Message: ui/notifications/host-context-changed
window.addEventListener("message", (event: MessageEvent) => {
  const msg = event.data;

  if (msg.method === "ui/notifications/host-context-changed" && msg.params) {
    // Apply theme using SDK helper
    if (msg.params.theme) {
      applyDocumentTheme(msg.params.theme);
    }

    // Apply fonts using SDK helper
    if (msg.params.styles?.css?.fonts) {
      applyHostFonts(msg.params.styles.css.fonts);
    }

    // Handle display mode
    if (msg.params.displayMode === "fullscreen") {
      document.body.classList.add("fullscreen-mode");
    }

    // Re-render if needed (e.g., charts with theme colors)
    if (currentData) {
      renderData(currentData);
    }
  }
});
```

### Clean Up Resources

```typescript
// Message: ui/resource-teardown (request with id)
window.addEventListener("message", (event: MessageEvent) => {
  const msg = event.data;

  if (msg.id !== undefined && msg.method === "ui/resource-teardown") {
    // Clean up timers
    if (myTimer) clearInterval(myTimer);

    // Destroy chart instances
    if (myChart) myChart.destroy();

    // MUST respond to proxy
    window.parent.postMessage(
      {
        jsonrpc: "2.0",
        id: msg.id,
        result: {},
      },
      "*",
    );
  }
});
```

## Proxy Compatibility

This template is designed to work with the `run-action.html` proxy layer:

### How Proxy Works

1. **Proxy initializes** with host (`ui/initialize`)
2. **Proxy saves** host context (theme, display mode, etc.)
3. **Proxy loads** your template via `ui://templates/your-template-id`
4. **Template listens** for messages from proxy
5. **Proxy forwards** tool results and host changes to template

### Why No `app.connect()`?

```typescript
// ❌ OLD WAY (causes conflicts)
app.connect().then(() => {
  // This tries to call ui/initialize again!
  // Proxy already called it, so this fails
});

// ✅ NEW WAY (proxy compatible)
// Just listen for messages - proxy forwards them
window.addEventListener("message", (event) => {
  // Handle messages...
});
```

## Advanced: Server Tool Calls

**Note:** The included `callServerTool`, `sendMessageToHost`, and `openLink` functions **may not work** in proxy mode since we don't call `app.connect()`.

If you need these features, implement manual postMessage handling:

```typescript
// Manual server tool call
function sendRequest(method: string, params: any): Promise<any> {
  return new Promise((resolve, reject) => {
    const id = ++requestIdCounter;

    // Listen for response
    const listener = (event: MessageEvent) => {
      if (event.data?.id === id) {
        window.removeEventListener("message", listener);
        if (event.data?.result) resolve(event.data.result);
        else reject(new Error(event.data?.error?.message));
      }
    };
    window.addEventListener("message", listener);

    // Send request to proxy
    window.parent.postMessage(
      {
        jsonrpc: "2.0",
        id,
        method,
        params,
      },
      "*",
    );

    setTimeout(() => {
      window.removeEventListener("message", listener);
      reject(new Error("Timeout"));
    }, 5000);
  });
}

// Use it
const result = await sendRequest("tools/call", {
  name: "my-tool",
  arguments: { foo: "bar" },
});
```

## Build Configuration

### Vite Configuration (`vite.config.ts`)

The template uses `vite-plugin-singlefile` to bundle everything into one HTML file:

```typescript
import { defineConfig } from "vite";
import { viteSingleFile } from "vite-plugin-singlefile";

export default defineConfig({
  plugins: [viteSingleFile()],
  build: {
    cssMinify: true,
    minify: true,
    rollupOptions: {
      input: "mcp-app.html",
    },
    outDir: "dist",
    emptyOutDir: false,
  },
});
```

### Build Scripts

```bash
# Production build (minified)
npm run build

# Development build (watch mode)
npm run dev
```

## Best Practices

1. **Always use `escapeHtml()`** for user-generated content to prevent XSS
2. **Use `unwrapData()`** to handle nested data structures
3. **Handle errors gracefully** with try/catch blocks
4. **Support dark mode** with `body.dark` CSS selectors
5. **Use TypeScript types** for better type safety
6. **Clean up resources** in `onteardown` callback
7. **Test with different data formats** to ensure robustness
8. **Prefer NPM packages** over CDN for dependencies (less CSP hassle)
9. **Use semantic HTML** and accessible markup
10. **Keep bundle size reasonable** (<100KB total)

## Examples

### Example 1: Simple List Display

```typescript
function renderData(data: any) {
  const app = document.getElementById("app");
  if (!app) return;

  const items = unwrapData(data);

  app.innerHTML = `
    <div class="container">
      <h1>Items (${items.length})</h1>
      <ul class="item-list">
        ${items
          .map(
            (item) => `
          <li class="item">
            <h3>${escapeHtml(item.title)}</h3>
            <p>${escapeHtml(item.description)}</p>
          </li>
        `,
          )
          .join("")}
      </ul>
    </div>
  `;
}
```

### Example 2: Interactive Elements

```typescript
function renderData(data: any) {
  const app = document.getElementById("app");
  if (!app) return;

  app.innerHTML = `
    <div class="container">
      <button id="refresh-btn">Refresh Data</button>
      <div id="content"></div>
    </div>
  `;

  // Add event listeners
  document
    .getElementById("refresh-btn")
    ?.addEventListener("click", async () => {
      try {
        // Manual request to server tool via proxy
        const result = await sendRequest("tools/call", {
          name: "get-data",
          arguments: {},
        });
        renderData(result.structuredContent);
      } catch (error) {
        console.error("Refresh failed:", error);
      }
    });
}

// Helper function for manual requests
function sendRequest(method: string, params: any): Promise<any> {
  return new Promise((resolve, reject) => {
    const id = ++requestIdCounter;
    const listener = (event: MessageEvent) => {
      if (event.data?.id === id) {
        window.removeEventListener("message", listener);
        if (event.data?.result) resolve(event.data.result);
        else reject(new Error(event.data?.error?.message));
      }
    };
    window.addEventListener("message", listener);
    window.parent.postMessage({ jsonrpc: "2.0", id, method, params }, "*");
    setTimeout(() => {
      window.removeEventListener("message", listener);
      reject(new Error("Timeout"));
    }, 5000);
  });
}
```

### Example 3: Chart.js Integration

```typescript
import Chart from "chart.js/auto";

let chartInstance: Chart | null = null;

function renderData(data: any) {
  const app = document.getElementById("app");
  if (!app) return;

  // Destroy previous chart
  if (chartInstance) {
    chartInstance.destroy();
  }

  app.innerHTML = `
    <div class="container">
      <h1>Chart</h1>
      <canvas id="chart"></canvas>
    </div>
  `;

  const canvas = document.getElementById("chart") as HTMLCanvasElement;
  chartInstance = new Chart(canvas, {
    type: "line",
    data: {
      labels: data.labels,
      datasets: [
        {
          label: "Data",
          data: data.values,
          borderColor: "#1a73e8",
        },
      ],
    },
  });
}
```

## Troubleshooting

### Build Errors

- Ensure all dependencies are installed: `npm install`
- Check TypeScript errors: `npm run build`
- Verify import paths are correct

### Bundle Size Too Large

- Use production build: `npm run build`
- Check for large dependencies
- Consider code splitting (advanced)

### CSP Issues

- If using CDN scripts, configure CSP in your MCP server
- Prefer NPM packages over CDN
- See CSP_GUIDE.md for details

### Theme Not Working

- Ensure message handler applies theme via `applyDocumentTheme()`
- Check handler for `ui/notifications/host-context-changed`
- Check CSS uses `body.dark` selectors
- Test with both light and dark modes

### Proxy Connection Issues

- Verify proxy is properly intercepting `ui/initialize`
- Check console for message flow
- Ensure template doesn't call `app.connect()`
- Verify messages are reaching template from proxy

## Comparison with Other Approaches

| Feature             | base-template (Manual)   | base-template-sdk (This)                 |
| ------------------- | ------------------------ | ---------------------------------------- |
| Protocol handling   | Manual (~540 lines)      | Manual (~100 lines)                      |
| SDK utilities       | ❌ None                  | ✅ Theme, fonts, resize                  |
| Type safety         | Limited (`any` types)    | Full TypeScript types                    |
| Proxy compatibility | ✅ Perfect               | ✅ Perfect                               |
| Bundle size         | ~20KB                    | ~60-70KB                                 |
| Maintenance         | You maintain all         | You maintain messages, SDK for utilities |
| Learning curve      | Understand full protocol | SDK utilities + message handling         |
| Best for            | Minimal size apps        | **Production apps with proxy**           |

**Recommendation:** Use `base-template-sdk` (this) for most production apps. The SDK utilities are worth the extra 40KB.

## Support

For questions or issues:

- Official MCP Examples: https://github.com/modelcontextprotocol/ext-apps/tree/main/examples
- SDK Documentation: https://modelcontextprotocol.github.io/ext-apps/
- MCP Specification: https://spec.modelcontextprotocol.io/

## License

This template is provided as-is for creating MCP applications.
