# Base Template for MCP Apps

This is a generic base template for creating MCP (Model Context Protocol) apps. It includes all common logic and infrastructure needed for MCP apps, allowing you to focus on implementing your app-specific rendering logic.

## Quick Start

1. **Copy the template directory**
   ```bash
   cp -r base-mcp-template my-app-mcp
   ```

2. **Configure app metadata**
   - Edit `src/mcp-app.ts` and update the constants at the top:
     ```typescript
     const APP_NAME = "My App Name";      // Your app name
     const APP_VERSION = "1.0.0";        // Your app version
     const PROTOCOL_VERSION = "2026-01-26"; // MCP Apps protocol version (keep as-is)
     ```

3. **Update the HTML title**
   - Edit `mcp-app.html` and change the title tag

4. **Implement your rendering logic**
   - Edit `src/mcp-app.ts` and implement the `renderData()` function
   - Add template-specific utility functions as needed

5. **Add your styles**
   - Edit `src/mcp-app.css` and add your template-specific styles

6. **Add external dependencies (if needed)**
   - Edit `mcp-app.html` and add script tags for libraries like Chart.js, D3.js, etc.

## File Structure

```
base-mcp-template/
├── mcp-app.html          # Main HTML file
├── src/
│   ├── mcp-app.ts        # TypeScript logic (common + template-specific)
│   ├── mcp-app.css       # Template-specific styles
│   └── global.css        # Common base styles (DO NOT MODIFY)
└── README.md             # This file
```

## What's Included

### Common Features (Already Implemented)

✅ **MCP Protocol Handling**
- JSON-RPC 2.0 message format
- Handles `ui/notifications/tool-result` messages
- Handles `ui/notifications/host-context-changed` messages
- Automatic data extraction and unwrapping

✅ **Dark Mode Support**
- System preference detection
- Host context theme changes
- Automatic theme switching

✅ **Display Modes**
- Inline and fullscreen modes
- Automatic layout adjustments
- Display mode change handling

✅ **Size Notifications**
- Automatic size change detection
- ResizeObserver-based monitoring
- Debounced notifications to host

✅ **Error Handling**
- Error display utilities
- Empty state handling
- Graceful error recovery

✅ **Data Utilities**
- `extractData()` - Extract data from MCP messages
- `unwrapData()` - Unwrap nested API response structures
- `escapeHtml()` - XSS protection
- `showError()` - Error display
- `showEmpty()` - Empty state display

## Customization Guide

### 1. Implement `renderData()` Function

This is the main function you need to implement. It receives the data and renders it in the app.

**Location:** `src/mcp-app.ts`

**Example:**
```typescript
function renderData(data: any) {
  const app = document.getElementById('app');
  if (!app) return;
  
  if (!data) {
    showEmpty('No data received');
    return;
  }

  try {
    // Unwrap nested structures
    const unwrapped = unwrapData(data);
    
    // Your rendering logic here
    app.innerHTML = `
      <div class="container">
        <h1>My App</h1>
        <div class="content">
          ${/* Your HTML here */}
        </div>
      </div>
    `;
    
    // Always notify host of size change
    setTimeout(() => {
      notifySizeChanged();
    }, 50);
    
  } catch (error: any) {
    console.error('Render error:', error);
    showError(`Error rendering data: ${error.message}`);
    setTimeout(() => {
      notifySizeChanged();
    }, 50);
  }
}
```

**Guidelines:**
- Always validate data before rendering
- Use `unwrapData()` to handle nested structures
- Use `escapeHtml()` when inserting user content
- Call `notifySizeChanged()` after rendering completes
- Handle errors gracefully with try/catch

### 2. Add Template-Specific Utility Functions

Add helper functions for your app's specific needs.

**Location:** `src/mcp-app.ts` - Section marked "TEMPLATE-SPECIFIC FUNCTIONS"

**Examples:**
```typescript
// Data normalization
function normalizeTableData(data: any) {
  // Your normalization logic
}

// Formatting functions
function formatDate(date: string): string {
  // Your date formatting
}

function formatNumber(num: number): string {
  // Your number formatting
}

// Chart rendering (if using Chart.js)
function renderChart(canvas: HTMLCanvasElement, data: any) {
  // Your chart rendering logic
}
```

### 3. Add Template-Specific Styles

Add styles unique to your app.

**Location:** `src/mcp-app.css`

**Guidelines:**
- Use semantic class names (e.g., `.result-card`, `.dashboard-header`)
- Support dark mode with `body.dark` selectors
- Use consistent spacing (multiples of 4px or 8px)
- Make styles responsive with `@media` queries
- Use CSS variables for colors if you have a color scheme

**Example:**
```css
.container {
  max-width: 1200px;
  margin: 0 auto;
}

.header {
  margin-bottom: 32px;
  padding: 24px;
  background: #ffffff;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

body.dark .header {
  background: #1a1d24;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
}

@media (max-width: 768px) {
  .container {
    padding: 16px;
  }
}
```

### 4. Add External Dependencies

If you need external libraries (like Chart.js, D3.js, etc.), add them to the HTML file.

**Location:** `mcp-app.html` - In the `<head>` section

**Example:**
```html
<head>
  <!-- ... existing head content ... -->
  <script src="https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.js"></script>
</head>
```

Then declare the library in TypeScript:
```typescript
declare const Chart: any;
```

### 5. Customize Display Mode Handling (Optional)

If you need special layout adjustments for fullscreen mode, customize the `handleDisplayModeChange()` function.

**Location:** `src/mcp-app.ts` - Section marked "DISPLAY MODE HANDLING"

**Example:**
```typescript
function handleDisplayModeChange(mode: string) {
  currentDisplayMode = mode;
  if (mode === 'fullscreen') {
    document.body.classList.add('fullscreen-mode');
    // Your custom fullscreen adjustments
    const myContainer = document.querySelector('.my-container');
    if (myContainer) {
      (myContainer as HTMLElement).style.maxWidth = '100%';
    }
  } else {
    document.body.classList.remove('fullscreen-mode');
    // Restore normal layout
  }
  setTimeout(() => {
    notifySizeChanged();
  }, 100);
}
```

## Data Format

### Input Format

Your app will receive data via the MCP protocol:

```json
{
  "jsonrpc": "2.0",
  "method": "ui/notifications/tool-result",
  "params": {
    "structuredContent": {
      // Your data here
    }
  }
}
```

### Data Unwrapping

The `unwrapData()` function handles various nested formats:

- Direct format: `{ columns: [], rows: [] }`
- Nested in `message.template_data`
- Nested in `message.response_content`
- Common patterns: `data.results`, `data.items`, `data.records`
- Array format: `[item1, item2, ...]`

Always use `unwrapData()` to handle these variations:

```typescript
const unwrapped = unwrapData(data);
```

## Examples

### Example 1: Simple List Display

```typescript
function renderData(data: any) {
  const app = document.getElementById('app');
  if (!app) return;
  
  const unwrapped = unwrapData(data);
  const items = Array.isArray(unwrapped) ? unwrapped : unwrapped.items || [];
  
  if (items.length === 0) {
    showEmpty('No items found');
    return;
  }
  
  app.innerHTML = `
    <div class="container">
      <h1>Items (${items.length})</h1>
      <ul class="item-list">
        ${items.map(item => `
          <li class="item">
            <h3>${escapeHtml(item.title || 'Untitled')}</h3>
            <p>${escapeHtml(item.description || '')}</p>
          </li>
        `).join('')}
      </ul>
    </div>
  `;
  
  setTimeout(() => notifySizeChanged(), 50);
}
```

### Example 2: Table Display

```typescript
function renderData(data: any) {
  const app = document.getElementById('app');
  if (!app) return;
  
  const unwrapped = unwrapData(data);
  const columns = unwrapped.columns || [];
  const rows = unwrapped.rows || [];
  
  if (rows.length === 0) {
    showEmpty('No data available');
    return;
  }
  
  app.innerHTML = `
    <div class="container">
      <h1>Data Table</h1>
      <table class="data-table">
        <thead>
          <tr>
            ${columns.map(col => `<th>${escapeHtml(col)}</th>`).join('')}
          </tr>
        </thead>
        <tbody>
          ${rows.map(row => `
            <tr>
              ${Array.isArray(row) 
                ? row.map(cell => `<td>${escapeHtml(String(cell))}</td>`).join('')
                : columns.map(col => `<td>${escapeHtml(String(row[col] || ''))}</td>`).join('')
              }
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>
  `;
  
  setTimeout(() => notifySizeChanged(), 50);
}
```

### Example 3: Chart Display (Chart.js)

```typescript
// Declare Chart.js
declare const Chart: any;

let chartInstance: Chart | null = null;

function renderData(data: any) {
  const app = document.getElementById('app');
  if (!app) return;
  
  const unwrapped = unwrapData(data);
  const chartData = normalizeChartData(unwrapped);
  
  app.innerHTML = `
    <div class="container">
      <h1>Chart</h1>
      <div class="chart-wrapper">
        <canvas id="chart"></canvas>
      </div>
    </div>
  `;
  
  setTimeout(() => {
    const canvas = document.getElementById('chart') as HTMLCanvasElement;
    if (canvas) {
      renderChart(canvas, chartData);
    }
    notifySizeChanged();
  }, 50);
}

function renderChart(canvas: HTMLCanvasElement, data: any) {
  if (chartInstance) {
    chartInstance.destroy();
  }
  
  chartInstance = new Chart(canvas, {
    type: 'line',
    data: {
      labels: data.labels,
      datasets: [{
        label: 'Data',
        data: data.values,
        borderColor: '#3b82f6',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
    }
  });
}
```

## Best Practices

1. **Always validate data** before rendering
2. **Use `escapeHtml()`** for all user-generated content to prevent XSS
3. **Use `unwrapData()`** to handle nested data structures
4. **Call `notifySizeChanged()`** after rendering completes
5. **Handle errors gracefully** with try/catch blocks
6. **Support dark mode** with `body.dark` CSS selectors
7. **Make responsive** with media queries
8. **Use semantic HTML** and accessible markup
9. **Clean up resources** (e.g., destroy chart instances on re-render)
10. **Test with different data formats** to ensure robustness

## Common Patterns

### Pattern 1: Filtering/Search

```typescript
let allData: any[] = [];
let filteredData: any[] = [];

function renderData(data: any) {
  const unwrapped = unwrapData(data);
  allData = Array.isArray(unwrapped) ? unwrapped : [];
  filteredData = [...allData];
  
  renderFiltered();
}

function renderFiltered() {
  const app = document.getElementById('app');
  if (!app) return;
  
  app.innerHTML = `
    <div class="container">
      <input type="text" id="search" placeholder="Search..." />
      <div class="results">
        ${filteredData.map(item => renderItem(item)).join('')}
      </div>
    </div>
  `;
  
  const searchInput = document.getElementById('search');
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      const query = (e.target as HTMLInputElement).value.toLowerCase();
      filteredData = allData.filter(item => 
        item.title?.toLowerCase().includes(query)
      );
      renderFiltered();
    });
  }
  
  setTimeout(() => notifySizeChanged(), 50);
}
```

### Pattern 2: Expandable Cards

```typescript
function renderData(data: any) {
  const app = document.getElementById('app');
  if (!app) return;
  
  const items = unwrapData(data);
  
  app.innerHTML = `
    <div class="container">
      ${items.map((item: any, index: number) => `
        <div class="card" id="card-${index}">
          <div class="card-header" onclick="toggleCard(${index})">
            <h3>${escapeHtml(item.title)}</h3>
            <span class="expand-icon">▼</span>
          </div>
          <div class="card-content">
            <p>${escapeHtml(item.content)}</p>
          </div>
        </div>
      `).join('')}
    </div>
  `;
  
  setTimeout(() => notifySizeChanged(), 50);
}

(window as any).toggleCard = function(index: number) {
  const card = document.getElementById(`card-${index}`);
  if (card) {
    card.classList.toggle('expanded');
  }
};
```

## Troubleshooting

### Size notifications not working
- Ensure `notifySizeChanged()` is called after DOM updates
- Use `setTimeout()` to wait for DOM to settle
- Check browser console for errors

### Dark mode not working
- Ensure `body.dark` selectors are in your CSS
- Check that `initializeDarkMode()` is called
- Verify host context changes are being received

### Data not rendering
- Check browser console for errors
- Verify data format matches expectations
- Use `console.log()` to inspect data structure
- Ensure `unwrapData()` is being used

### Charts not updating on theme change
- Re-render charts in `ui/notifications/host-context-changed` handler
- Update chart colors based on theme
- Destroy and recreate chart instances

## Reference

### Available Utility Functions

- `extractData(msg)` - Extract data from MCP messages
- `unwrapData(data)` - Unwrap nested API response structures
- `escapeHtml(str)` - Escape HTML to prevent XSS
- `showError(message)` - Display error message
- `showEmpty(message)` - Display empty state message
- `notifySizeChanged()` - Notify host of size change
- `requestDisplayMode(mode)` - Request display mode change
- `sendRequest(method, params)` - Send request to host
- `sendNotification(method, params)` - Send notification to host

### MCP Protocol Methods

**Received:**
- `ui/notifications/tool-result` - Tool result data
- `ui/notifications/host-context-changed` - Theme/display mode changes
- `ui/notifications/tool-input` - Tool input (optional)
- `ui/notifications/initialized` - Initialization (optional)

**Sent:**
- `ui/initialize` - Initialize app (includes `clientInfo`, `protocolVersion`, `appCapabilities`)
- `ui/notifications/initialized` - Sent after successful initialization
- `ui/request-display-mode` - Request display mode change
- `ui/notifications/size-changed` - Notify size change

## Support

For questions or issues, refer to:
- Existing templates: `dashboard-mcp/` and `tavily-search-mcp/`
- Base template HTML: `base-template.html` (older single-file template)
