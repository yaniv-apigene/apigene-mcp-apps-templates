/* ============================================
   BASE TEMPLATE (SDK UTILITIES VERSION) FOR MCP APPS
   ============================================

   This file uses the official @modelcontextprotocol/ext-apps SDK
   for utilities only (theme helpers, types, auto-resize).

   Benefits of this approach:
   - SDK utilities for theme, fonts, and styling
   - Full TypeScript type safety
   - Manual message handling for proxy compatibility
   - Works seamlessly with run-action.html proxy layer
   - Less code than full manual implementation
   - No SDK connection conflicts with proxy initialization

   Customize the sections marked with "TEMPLATE-SPECIFIC" below.

   See README.md for customization guidelines.
   ============================================ */

/* ============================================
   SDK IMPORTS
   ============================================ */

import {
  App,
  applyDocumentTheme,
  applyHostFonts,
  applyHostStyleVariables,
} from "@modelcontextprotocol/ext-apps";
import type { CallToolResult } from "@modelcontextprotocol/sdk/types.js";
import type { McpUiHostContext } from "@modelcontextprotocol/ext-apps";

// Import styles (will be bundled by Vite)
import "./global.css";
import "./mcp-app.css";
import {
  parseProductData,
  formatPrice,
  formatRating,
  generateStarRating,
  type Product,
} from "./mcp-app-impl";

/* ============================================
   APP CONFIGURATION
   ============================================
   TEMPLATE-SPECIFIC: Update these values for your app
   ============================================ */

const APP_NAME = "FakeStore Product Display"; // TODO: Replace with your app name
const APP_VERSION = "1.0.0"; // TODO: Replace with your app version

/* ============================================
   EXTERNAL DEPENDENCIES
   ============================================
   If you use external libraries (like Chart.js), import or declare them here.
   
   For npm packages:
   import Chart from "chart.js/auto";
   
   For CDN scripts (requires CSP configuration):
   declare const Chart: any;
   ============================================ */

/* ============================================
   COMMON UTILITY FUNCTIONS
   ============================================ */

/**
 * Unwrap nested API response structures
 * Handles various wrapper formats from different MCP clients
 */
function unwrapData(data: any): any {
  if (!data) return null;

  // Handle nested rows object: { rows: { columns: [...], rows: [...] } }
  if (data.rows && typeof data.rows === 'object' && !Array.isArray(data.rows) &&
      data.rows.columns && data.rows.rows) {
    return data.rows;
  }

  // Format 1: Standard table format { columns: [], rows: [] }
  if (
    data.columns ||
    (Array.isArray(data.rows) && data.rows.length > 0) ||
    (typeof data === "object" && !data.message)
  ) {
    return data;
  }

  // Format 2: Nested in message.template_data (3rd party MCP clients)
  if (data.message?.template_data) {
    return data.message.template_data;
  }

  // Format 3: Nested in message.response_content (3rd party MCP clients)
  if (data.message?.response_content) {
    return data.message.response_content;
  }

  // Format 4: Common nested patterns
  if (data.data?.results) return data.data.results;
  if (data.data?.items) return data.data.items;
  if (data.data?.records) return data.data.records;
  if (data.results) return data.results;
  if (data.items) return data.items;
  if (data.records) return data.records;

  // Format 5: Direct rows array
  if (Array.isArray(data.rows)) {
    return data;
  }

  // Format 6: If data itself is an array
  if (Array.isArray(data)) {
    return { rows: data };
  }

  return data;
}

/**
 * Escape HTML to prevent XSS attacks
 */
function escapeHtml(str: any): string {
  if (typeof str !== "string") return String(str);
  const div = document.createElement("div");
  div.textContent = str;
  return div.innerHTML;
}

/**
 * Show error message in the app
 */
function showError(message: string) {
  const app = document.getElementById("app");
  if (app) {
    app.innerHTML = `<div class="error">${escapeHtml(message)}</div>`;
  }
}

/**
 * Show empty state message
 */
function showEmpty(message: string = "No data available.") {
  const app = document.getElementById("app");
  if (app) {
    app.innerHTML = `<div class="empty">${escapeHtml(message)}</div>`;
  }
}

/* ============================================
   TEMPLATE-SPECIFIC FUNCTIONS
   ============================================
   
   Add your template-specific utility functions here.
   Examples:
   - Data normalization functions
   - Formatting functions (dates, numbers, etc.)
   - Data transformation functions
   - Chart rendering functions (if using Chart.js)
   ============================================ */

// TODO: Add your template-specific utility functions here
// Example:
// function formatDate(date: string): string { ... }
// function normalizeData(data: any): any { ... }

/* ============================================
   TEMPLATE-SPECIFIC RENDER FUNCTION
   ============================================
   
   This is the main function you need to implement.
   It receives the data and renders it in the app.
   
   Guidelines:
   1. Always validate data before rendering
   2. Use unwrapData() to handle nested structures
   3. Use escapeHtml() when inserting user content
   4. Handle errors gracefully with try/catch
   ============================================ */

function renderData(data: any) {
  const app = document.getElementById("app");
  if (!app) return;

  if (!data) {
    showEmpty("No data received");
    return;
  }

  try {
    // Unwrap nested data structures
    const unwrapped = unwrapData(data);

    // Parse product data
    const product: Product = parseProductData(unwrapped);

    // Render product card
    app.innerHTML = `
      <div class="container">
        <div class="product-card">
          <div class="product-image-wrapper">
            <img 
              src="${escapeHtml(product.image)}" 
              alt="${escapeHtml(product.title)}"
              class="product-image"
              onerror="this.src='data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22400%22 height=%22400%22%3E%3Crect fill=%22%23f0f0f0%22 width=%22400%22 height=%22400%22/%3E%3Ctext fill=%22%23999%22 x=%2250%25%22 y=%2250%25%22 text-anchor=%22middle%22 dy=%22.3em%22 font-family=%22sans-serif%22%3ENo Image%3C/text%3E%3C/svg%3E'"
            />
          </div>
          
          <div class="product-details">
            <div class="product-header">
              <span class="product-category">${escapeHtml(product.category)}</span>
              <span class="product-id">ID: ${product.id}</span>
            </div>
            
            <h1 class="product-title">${escapeHtml(product.title)}</h1>
            
            <div class="product-rating">
              <span class="stars">${generateStarRating(product.rating.rate)}</span>
              <span class="rating-text">
                ${formatRating(product.rating.rate)} / 5.0
                <span class="rating-count">(${product.rating.count} reviews)</span>
              </span>
            </div>
            
            <div class="product-price">
              ${formatPrice(product.price)}
            </div>
            
            <div class="product-description">
              <h3>Description</h3>
              <p>${escapeHtml(product.description)}</p>
            </div>
          </div>
        </div>
      </div>
    `;

    // Log product data to console for debugging
    console.log("Product data:", product);
  } catch (error: any) {
    console.error("Render error:", error);
    console.error("Received data:", data);

    // Show more detailed error message
    let errorMsg = error.message || "Unknown error";
    if (errorMsg.includes("403") || errorMsg.includes("Forbidden")) {
      errorMsg = "403 Forbidden - Check API credentials and permissions";
    } else if (errorMsg.includes("401") || errorMsg.includes("Unauthorized")) {
      errorMsg = "401 Unauthorized - Authentication required";
    }

    showError(`Error rendering data: ${errorMsg}`);
  }
}

/* ============================================
   SDK UTILITIES ONLY (NO CONNECTION)
   ============================================

   We use the SDK only for utilities (theme helpers, types).
   Message handling is done manually to work with the proxy.
   ============================================ */

// Create app instance for utilities only (we won't call connect())
const app = new App({
  name: APP_NAME,
  version: APP_VERSION,
});

/* ============================================
   DIRECT MESSAGE HANDLING
   ============================================

   Handle messages manually to work with the proxy layer.
   The proxy already handles ui/initialize, so we just listen for notifications.
   ============================================ */

window.addEventListener("message", (event: MessageEvent) => {
  const msg = event.data;

  if (!msg) return;

  // Handle JSON-RPC 2.0 protocol messages
  if (msg.jsonrpc === "2.0") {
    // Handle tool result notifications
    if (msg.method === "ui/notifications/tool-result" && msg.params) {
      console.info("Received tool result from proxy");
      const data = msg.params.structuredContent || msg.params;
      renderData(data);
      return;
    }

    // Handle host context changes
    if (msg.method === "ui/notifications/host-context-changed" && msg.params) {
      console.info("Host context changed:", msg.params);

      // Apply theme using SDK helper
      if (msg.params.theme) {
        applyDocumentTheme(msg.params.theme);
      }

      // Apply host fonts using SDK helper
      if (msg.params.styles?.css?.fonts) {
        applyHostFonts(msg.params.styles.css.fonts);
      }

      // Apply host style variables using SDK helper
      if (msg.params.styles?.variables) {
        applyHostStyleVariables(msg.params.styles.variables);
      }

      // Handle display mode changes
      if (msg.params.displayMode === "fullscreen") {
        document.body.classList.add("fullscreen-mode");
      } else {
        document.body.classList.remove("fullscreen-mode");
      }

      return;
    }

    // Handle tool cancellation
    if (msg.method === "ui/notifications/tool-cancelled") {
      const reason = msg.params?.reason || "Unknown reason";
      console.info("Tool cancelled:", reason);
      showError(`Operation cancelled: ${reason}`);
      return;
    }

    // Handle resource teardown
    if (msg.id !== undefined && msg.method === "ui/resource-teardown") {
      console.info("Resource teardown requested");

      // TODO: Clean up your resources here
      // - Clear any timers
      // - Cancel pending requests
      // - Destroy chart instances
      // - Remove event listeners

      // Send response to proxy
      window.parent.postMessage(
        {
          jsonrpc: "2.0",
          id: msg.id,
          result: {},
        },
        "*",
      );
      return;
    }

    return;
  }

  // Handle non-protocol messages (preview tools, simple testing)
  if (msg.structuredContent || msg.data || msg.rows) {
    console.info("Received data from preview tool:", msg);
    const data = msg.structuredContent || msg.data || msg;
    renderData(data);
    return;
  }
});

/* ============================================
   APP INITIALIZATION
   ============================================

   No SDK connection needed - the proxy handles ui/initialize.
   We just set up auto-resize and demo data for testing.
   ============================================ */

// Setup automatic size change notifications
// The SDK will monitor DOM changes and notify the host automatically
const cleanupResize = app.setupSizeChangedNotifications();

// Optional: Clean up on page unload
window.addEventListener("beforeunload", () => {
  cleanupResize();
});

console.info("✓ MCP App initialized (SDK utilities mode)");

// Testing/Demo: Show demo data if no real data received within 3 seconds
setTimeout(() => {
  const appElement = document.getElementById("app");
  if (appElement?.querySelector(".loading")) {
    console.info("⚠ No data received, showing demo data for testing");
    renderData({
      actions_result: [
        {
          response_content: {
            id: 1,
            title: "Fjallraven - Foldsack No. 1 Backpack, Fits 15 Laptops",
            price: 109.95,
            description:
              "Your perfect pack for everyday use and walks in the forest. Stash your laptop (up to 15 inches) in the padded sleeve, your everyday",
            category: "men's clothing",
            image: "https://fakestoreapi.com/img/81fPKd-2AYL._AC_SL1500_.jpg",
            rating: {
              rate: 3.9,
              count: 120,
            },
          },
          status_code: 200,
        },
      ],
    });
  }
}, 3000);

/* ============================================
   OPTIONAL: HELPER FUNCTIONS FOR CALLING SERVER
   ============================================

   NOTE: These functions may not work in proxy mode since we don't
   call app.connect(). If you need to call server tools, send messages,
   or open links, you'll need to implement manual postMessage handling
   similar to the working base-template (without SDK).

   For reference on manual implementation, see:
   /base-template/src/mcp-app.ts
   ============================================ */

/**
 * Example: Call a server tool (MAY NOT WORK in proxy mode)
 */
export async function callServerTool(
  toolName: string,
  args: Record<string, any>,
) {
  try {
    const result = await app.callServerTool({
      name: toolName,
      arguments: args,
    });
    return result;
  } catch (error) {
    console.error("Error calling server tool:", error);
    console.warn("If this fails, implement manual postMessage handling");
    throw error;
  }
}

/**
 * Example: Send a message to the host (MAY NOT WORK in proxy mode)
 */
export async function sendMessageToHost(text: string) {
  try {
    const result = await app.sendMessage({
      role: "user",
      content: [{ type: "text", text }],
    });
    return result;
  } catch (error) {
    console.error("Error sending message:", error);
    console.warn("If this fails, implement manual postMessage handling");
    throw error;
  }
}

/**
 * Example: Open a link in the host (MAY NOT WORK in proxy mode)
 */
export async function openLink(url: string) {
  try {
    const result = await app.openLink({ url });
    if (result.isError) {
      console.warn("Link open rejected:", url);
    }
    return result;
  } catch (error) {
    console.error("Error opening link:", error);
    console.warn("If this fails, implement manual postMessage handling");
    throw error;
  }
}

// Export app instance for advanced use cases
export { app };
