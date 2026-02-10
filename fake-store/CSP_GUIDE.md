# CSP Configuration — Fake Store Product

## Why images are blocked on Claude

The console error you see in **Claude** is:

```text
Loading the image 'https://fakestoreapi.com/img/...' violates the following Content Security Policy directive:
"img-src 'self' data: blob: https://assets.claude.ai". The action has been blocked.
```

So:

1. **Your app is correct** — The template declares `resourceDomains: ['https://fakestoreapi.com']` (and Handlebars CDN). The MCP server returns this in `resources/read` as `_meta.ui.csp.resourceDomains`. Your log shows that: `resourceDomains: ['https://fakestoreapi.com']` is present in the resource response.

2. **The host (Claude) applies its own CSP to the iframe** — The sandbox where the MCP app runs uses a CSP that allows images only from `'self'`, `data:`, `blob:`, and `https://assets.claude.ai`. So **Claude is not merging the template’s `resourceDomains` into the iframe’s `img-src`**.

3. **That’s why it only happens on Claude** — In other hosts (e.g. your own run-action UI), the iframe may not use such a strict CSP, or the host may merge `_meta.ui.csp` into the sandbox, so images from `fakestoreapi.com` load. In Claude, the fixed CSP wins and blocks them.

Per the [MCP Apps spec](https://github.com/modelcontextprotocol/ext-apps/blob/main/specification/draft/apps.mdx), hosts are expected to apply the resource’s `_meta.ui.csp` (including `resourceDomains` → `img-src`) when creating the sandbox. Until Claude does that, external images in this app will stay blocked there.

## What you can do

- **Ask Claude to honor resource CSP** — Request that when rendering an MCP app, Claude merges the resource’s `_meta.ui.csp.resourceDomains` into the iframe’s `img-src` (and other directives) so that declared domains like `https://fakestoreapi.com` are allowed.

- **Use data URLs when possible** — If your backend or a tool can fetch the image and return it as base64, the template can use `src="data:image/png;base64,..."`. `data:` is already allowed by Claude’s `img-src`, so those images will load. This requires changing how the tool/server provides the product payload (e.g. an `imageData` field instead of or in addition to `image` URL).

- **Graceful fallback in the app** — The template can show a placeholder or “Image unavailable” when the image fails to load (e.g. `onerror` on the `img`). That doesn’t fix CSP but improves UX when the host blocks the image.

## Required CSP for this template

The MCP server must return in `resources/read` (for this UI resource):

```ts
_meta: {
  ui: {
    csp: {
      resourceDomains: [
        "https://fakestoreapi.com",  // product images
        "https://cdn.jsdelivr.net"    // Handlebars (if loaded from CDN)
      ],
      connectDomains: ["https://fakestoreapi.com"],
      frameDomains: [],
      baseUriDomains: ["https://fakestoreapi.com"]
    }
  }
}
```

Hosts that merge this into the sandbox CSP will allow the images; hosts that don’t (like Claude today) will block them until they add support for `_meta.ui.csp`.
