# Missing Features from Base Template vs MCP Apps Spec

This document identifies features from the [MCP Apps Specification (SEP-1865)](https://spec.modelcontextprotocol.io/apps/latest) that are **missing** from the base template implementation.

## Critical Missing Features

### 1. MCP Apps SDK Integration ❌

**Status:** Not using the official SDK

**Spec Requirement:**
- Use `@modelcontextprotocol/ext-apps` SDK
- Initialize with `new App({ name, version })`
- Use SDK utilities: `applyHostStyleVariables`, `applyHostFonts`, `applyDocumentTheme`

**Current Implementation:**
- Manual JSON-RPC implementation
- No SDK usage

**Impact:** High - Missing standardized utilities and best practices

---

### 2. Initialization Protocol ❌

**Status:** Partially implemented

**Missing:**
- `ui/notifications/initialized` notification MUST be sent after `ui/initialize` completes
- Proper handling of `McpUiInitializeResult` structure
- `hostCapabilities` extraction and usage

**Current Implementation:**
- Sends `ui/initialize` request ✓
- Receives response ✓
- Does NOT send `ui/notifications/initialized` notification ❌
- Does NOT extract `hostCapabilities` ❌

**Spec Requirement:**
```typescript
// After ui/initialize completes successfully:
sendNotification('ui/notifications/initialized', {});
```

---

### 3. Host Context - CSS Variables (Theming) ❌

**Status:** Not implemented

**Missing:**
- Extract `hostContext.styles.variables` (CSS custom properties)
- Apply CSS variables using `applyHostStyleVariables` utility
- Fallback values for missing variables

**Spec Requirement:**
```typescript
// Host provides CSS variables like:
hostContext.styles.variables = {
  "--color-background-primary": "light-dark(#ffffff, #171717)",
  "--color-text-primary": "light-dark(#171717, #fafafa)",
  // ... 50+ standardized variables
}

// View should apply them:
if (hostContext.styles?.variables) {
  applyHostStyleVariables(hostContext.styles.variables);
}
```

**Current Implementation:**
- Only handles `theme` (light/dark) ✓
- Does NOT use CSS custom properties ❌

---

### 4. Host Context - Custom Fonts ❌

**Status:** Not implemented

**Missing:**
- Extract `hostContext.styles.css.fonts`
- Apply fonts using `applyHostFonts` utility

**Spec Requirement:**
```typescript
if (hostContext.styles?.css?.fonts) {
  applyHostFonts(hostContext.styles.css.fonts);
}
```

---

### 5. Host Context - Additional Fields ❌

**Status:** Partially implemented

**Missing Fields:**
- `locale` (BCP 47, e.g., "en-US")
- `timeZone` (IANA, e.g., "America/New_York")
- `userAgent` (host application identifier)
- `platform` ("web" | "desktop" | "mobile")
- `deviceCapabilities` (`{ touch?: boolean, hover?: boolean }`)
- `safeAreaInsets` (`{ top, right, bottom, left }`)
- `toolInfo` (metadata about the tool call that instantiated the View)

**Current Implementation:**
- Only handles: `theme`, `displayMode`, `containerDimensions` ✓

---

### 6. Tool Input Notifications ❌

**Status:** Handler exists but empty

**Missing:**
- Proper handling of `ui/notifications/tool-input` (complete arguments)
- Handler for `ui/notifications/tool-input-partial` (streaming arguments)

**Spec Requirement:**
```typescript
case 'ui/notifications/tool-input':
  // Store complete tool arguments
  const toolArguments = msg.params.arguments;
  // Use for initial rendering or context
  break;

case 'ui/notifications/tool-input-partial':
  // Handle streaming/partial arguments (optional)
  // Show loading states, progressive rendering
  break;
```

**Current Implementation:**
- Handler exists but does nothing ❌

---

### 7. Tool Cancellation ❌

**Status:** Not implemented

**Missing:**
- Handler for `ui/notifications/tool-cancelled` notification

**Spec Requirement:**
```typescript
case 'ui/notifications/tool-cancelled':
  const reason = msg.params.reason;
  // Show cancellation message
  // Clean up resources
  // Stop any ongoing operations
  break;
```

---

### 8. Resource Teardown ❌

**Status:** Not implemented

**Missing:**
- Handler for `ui/resource-teardown` request
- MUST respond before cleanup

**Spec Requirement:**
```typescript
case 'ui/resource-teardown':
  const reason = msg.params.reason;
  // Clean up resources (charts, timers, observers)
  // Save any pending state
  // Send response
  sendRequestResponse(msg.id, {});
  break;
```

---

### 9. App Capabilities Declaration ❌

**Status:** Partially implemented

**Missing:**
- `appCapabilities.tools` (if app exposes tools)
- `appCapabilities.experimental` (experimental features)
- Proper structure per spec

**Current Implementation:**
- Only declares `availableDisplayModes` ✓
- Missing other capability fields ❌

**Spec Requirement:**
```typescript
sendRequest('ui/initialize', {
  appCapabilities: {
    availableDisplayModes: ["inline", "fullscreen"],
    tools: {
      listChanged: true  // If app exposes tools
    },
    experimental: {}
  }
});
```

---

### 10. Host Capabilities Usage ❌

**Status:** Not implemented

**Missing:**
- Extract `hostCapabilities` from `McpUiInitializeResult`
- Check capabilities before using features
- Respect `hostCapabilities.sandbox.permissions` (camera, microphone, etc.)
- Respect `hostCapabilities.sandbox.csp` (approved domains)

**Spec Requirement:**
```typescript
const result = await sendRequest('ui/initialize', {...});
const hostCapabilities = result.hostCapabilities;

// Check before using features:
if (hostCapabilities.openLinks) {
  // Can use ui/open-link
}
if (hostCapabilities.serverTools) {
  // Can call tools
}
```

---

### 11. Display Mode Validation ❌

**Status:** Partially implemented

**Missing:**
- Check `hostContext.availableDisplayModes` before requesting mode change
- Validate requested mode is supported by both app and host

**Spec Requirement:**
```typescript
// Before requesting display mode:
const availableModes = hostContext.availableDisplayModes || [];
const appModes = appCapabilities.availableDisplayModes || [];

if (availableModes.includes(mode) && appModes.includes(mode)) {
  requestDisplayMode(mode);
}
```

**Current Implementation:**
- Requests mode without validation ❌

---

### 12. Container Dimensions Handling ❌

**Status:** Partially implemented

**Missing:**
- Proper handling of `maxWidth`/`maxHeight` (flexible dimensions)
- Distinction between fixed (`width`/`height`) and flexible (`maxWidth`/`maxHeight`)
- CSS application per spec

**Spec Requirement:**
```typescript
const dims = hostContext.containerDimensions;

// Fixed height: fill container
if ("height" in dims) {
  document.documentElement.style.height = "100vh";
} 
// Flexible with max: let content determine size
else if ("maxHeight" in dims && dims.maxHeight) {
  document.documentElement.style.maxHeight = `${dims.maxHeight}px`;
}

// Same for width...
```

**Current Implementation:**
- Sets styles but doesn't follow spec pattern ❌

---

### 13. Communication Capabilities ❌

**Status:** Not implemented

**Missing Requests:**
- `tools/call` - Call tools on MCP server
- `resources/read` - Read resources
- `ui/message` - Send message to host chat
- `ui/open-link` - Request host to open external URL
- `ui/update-model-context` - Update model context

**Missing Notifications:**
- `notifications/message` - Log messages to host

**Current Implementation:**
- Only has `sendRequest`/`sendNotification` helpers ✓
- No specific implementations for MCP methods ❌

---

### 14. Import Map for SDK ❌

**Status:** Not implemented

**Missing:**
- Import map in HTML for `@modelcontextprotocol/ext-apps`
- Proper module resolution

**Spec Requirement:**
```html
<script type="importmap">
{
  "imports": {
    "@modelcontextprotocol/ext-apps": "https://esm.sh/@modelcontextprotocol/ext-apps@latest"
  }
}
</script>
```

**Current Implementation:**
- No import map ❌
- No SDK imports ❌

---

## Summary

### High Priority (Critical for Spec Compliance)
1. ✅ Use MCP Apps SDK (`@modelcontextprotocol/ext-apps`)
2. ✅ Send `ui/notifications/initialized` after initialization
3. ✅ Implement CSS variables theming (`applyHostStyleVariables`)
4. ✅ Implement custom fonts (`applyHostFonts`)
5. ✅ Handle `ui/resource-teardown` request
6. ✅ Handle `ui/notifications/tool-cancelled`
7. ✅ Properly handle `ui/notifications/tool-input`

### Medium Priority (Important Features)
8. ✅ Extract and use `hostCapabilities`
9. ✅ Validate display modes before requesting
10. ✅ Handle additional host context fields (locale, timeZone, etc.)
11. ✅ Implement communication capabilities (`tools/call`, `ui/message`, etc.)

### Low Priority (Nice to Have)
12. ✅ Handle `ui/notifications/tool-input-partial` (streaming)
13. ✅ Proper container dimensions handling per spec
14. ✅ Add import map for SDK

---

## Recommended Implementation Order

1. **Add SDK Integration** - Foundation for everything else
2. **Fix Initialization Protocol** - Send `initialized` notification
3. **Add Theming Support** - CSS variables and fonts
4. **Add Lifecycle Handlers** - Teardown and cancellation
5. **Add Communication Capabilities** - Tools, resources, messages
6. **Enhance Host Context Handling** - All fields and capabilities

---

## Notes

- The current implementation is a **manual JSON-RPC implementation** that works but doesn't follow the spec's recommended SDK approach
- Many features are **partially implemented** (handlers exist but don't follow spec exactly)
- The template is **functional** but not **spec-compliant**
- Migration to SDK would require significant refactoring but would provide better maintainability and spec compliance
