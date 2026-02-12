/**
 * Basic MCP server with MCP App support for testing the base-template-sdk.
 *
 * Registers one tool that returns sample data and serves the bundled app HTML,
 * so you can run the app in a host (e.g. basic-host, Claude) without building
 * your own server.
 */

import {
  registerAppResource,
  registerAppTool,
  RESOURCE_MIME_TYPE,
} from "@modelcontextprotocol/ext-apps/server";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import fs from "node:fs/promises";
import path from "node:path";

const DIST_DIR = path.join(import.meta.dirname, "dist");

/**
 * Creates a new MCP server with one app tool and its UI resource.
 */
export function createServer(): McpServer {
  const server = new McpServer({
    name: "Base Template SDK Test Server",
    version: "1.0.0",
  });

  const resourceUri = "ui://base-template-sdk/mcp-app.html";

  registerAppTool(
    server,
    "show_demo",
    {
      title: "Show Demo",
      description:
        "Displays sample data in the base template app. Use this to test the MCP app UI without a real backend.",
      inputSchema: {},
      _meta: { ui: { resourceUri } },
    },
    async () => {
      const sample = {
        message: "Data from test MCP server",
        description:
          "This payload was returned by the built-in test server. Replace the tool implementation in server.ts for your own data.",
        timestamp: new Date().toISOString(),
        items: [
          { id: "1", title: "First item", value: 100 },
          { id: "2", title: "Second item", value: 200 },
          { id: "3", title: "Third item", value: 300 },
        ],
      };
      return {
        content: [{ type: "text", text: JSON.stringify(sample) }],
        structuredContent: sample,
      };
    },
  );

  registerAppResource(
    server,
    "Base Template App UI",
    resourceUri,
    { mimeType: RESOURCE_MIME_TYPE },
    async () => {
      const htmlPath = path.join(DIST_DIR, "mcp-app.html");
      const html = await fs.readFile(htmlPath, "utf-8");
      return {
        contents: [
          { uri: resourceUri, mimeType: RESOURCE_MIME_TYPE, text: html },
        ],
      };
    },
  );

  return server;
}
