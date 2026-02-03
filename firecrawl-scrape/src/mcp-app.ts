/* ============================================
   BASE TEMPLATE FOR MCP APPS
   ============================================
   
   This file contains all common logic shared across MCP apps.
   Customize the sections marked with "TEMPLATE-SPECIFIC" below.
   
   Common Features:
   - MCP Protocol message handling (JSON-RPC 2.0)
   - Dark mode support
   - Display mode handling (inline/fullscreen)
   - Size change notifications
   - Data extraction utilities
   - Error handling
   
   See README.md for customization guidelines.
   ============================================ */

/* ============================================
   COMMON UTILITY FUNCTIONS
   ============================================ */

/**
 * Extract data from MCP protocol messages
 * Handles standard JSON-RPC 2.0 format from run-action.html
 */
function extractData(msg: any) {
  if (msg?.params?.structuredContent !== undefined) {
    return msg.params.structuredContent;
  }
  if (msg?.params !== undefined) {
    return msg.params;
  }
  return msg;
}

/**
 * Unwrap nested API response structures
 * Handles various wrapper formats from different MCP clients
 * Special handling for Firecrawl scrape structures
 */
function unwrapData(data: any): any {
  if (!data) return null;
  
  // Handle nested content structure from Firecrawl
  if (data.content && Array.isArray(data.content)) {
    // Extract from content array
    const contentItem = data.content[0];
    if (contentItem?.text?.message?.response_content) {
      return contentItem.text.message.response_content;
    }
    if (contentItem?.text?.message) {
      return contentItem.text.message;
    }
  }
  
  // Handle structuredContent structure
  if (data.structuredContent?.message?.response_content) {
    return data.structuredContent.message.response_content;
  }
  
  // Direct data structure
  if (data.data) {
    return data.data;
  }
  
  // Standard table format { columns: [], rows: [] }
  if (data.columns || (Array.isArray(data.rows) && data.rows.length > 0) || 
      (typeof data === 'object' && !data.message)) {
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
 * Initialize dark mode based on system preference
 */
function initializeDarkMode() {
  if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
    document.body.classList.add('dark');
  }
  
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e: MediaQueryListEvent) => {
    document.body.classList.toggle('dark', e.matches);
  });
}

/**
 * Escape HTML to prevent XSS attacks
 */
function escapeHtml(str: any): string {
  if (typeof str !== "string") return str;
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

/**
 * Show error message in the app
 */
function showError(message: string) {
  const app = document.getElementById('app');
  if (app) {
    app.innerHTML = `<div class="error">${escapeHtml(message)}</div>`;
  }
}

/**
 * Show empty state message
 * Override the default message by passing a custom message
 */
function showEmpty(message: string = 'No data available.') {
  const app = document.getElementById('app');
  if (app) {
    app.innerHTML = `<div class="empty">${escapeHtml(message)}</div>`;
  }
}

/* ============================================
   TEMPLATE-SPECIFIC FUNCTIONS (Firecrawl Website Scrape)
   ============================================ */

let currentZoom = 1.0;

/**
 * Format metadata value for display
 */
function formatMetadataValue(value: any): string {
  if (Array.isArray(value)) {
    return value.join(', ');
  }
  if (typeof value === 'object') {
    return JSON.stringify(value);
  }
  return value || 'N/A';
}

/**
 * Prepare HTML for iframe display
 */
function prepareHtmlForIframe(html: string): string {
  let preparedHtml = html;
  
  // Check if HTML already has a viewport meta tag
  const hasViewport = /<meta[^>]*name=["']viewport["'][^>]*>/i.test(preparedHtml);
  
  if (!hasViewport) {
    // Inject viewport meta tag in the head
    if (/<head[^>]*>/i.test(preparedHtml)) {
      preparedHtml = preparedHtml.replace(
        /(<head[^>]*>)/i,
        '$1<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=5.0, user-scalable=yes">'
      );
    } else if (/<html[^>]*>/i.test(preparedHtml)) {
      // If no head tag, add one after html tag
      preparedHtml = preparedHtml.replace(
        /(<html[^>]*>)/i,
        '$1<head><meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=5.0, user-scalable=yes"></head>'
      );
    } else {
      // If no html tag, wrap in html structure
      preparedHtml = '<!DOCTYPE html><html><head><meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=5.0, user-scalable=yes"></head><body>' + preparedHtml + '</body></html>';
    }
  } else {
    // Update existing viewport meta tag to ensure proper scaling
    preparedHtml = preparedHtml.replace(
      /<meta[^>]*name=["']viewport["'][^>]*>/i,
      '<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=5.0, user-scalable=yes">'
    );
  }
  
  // Add CSS to ensure content fits within iframe
  if (/<head[^>]*>/i.test(preparedHtml)) {
    const fitCss = `
      <style>
        body {
          margin: 0;
          padding: 8px;
          overflow-x: auto;
          min-width: fit-content;
        }
        img, video, iframe {
          max-width: 100%;
          height: auto;
        }
        table {
          max-width: 100%;
          overflow-x: auto;
          display: block;
        }
      </style>
    `;
    preparedHtml = preparedHtml.replace(
      /(<head[^>]*>)/i,
      '$1' + fitCss
    );
  }
  
  return preparedHtml;
}

/**
 * Switch tab
 */
(window as any).switchTab = function(tabName: string, buttonElement: HTMLElement) {
  // Update tab buttons
  document.querySelectorAll('.tab').forEach(tab => {
    tab.classList.remove('active');
  });
  if (buttonElement) {
    buttonElement.classList.add('active');
  }

  // Update tab content
  document.querySelectorAll('.tab-content').forEach(content => {
    content.classList.remove('active');
  });
  const targetTab = document.getElementById(`${tabName}-tab`);
  if (targetTab) {
    targetTab.classList.add('active');
  }

  // Notify size change when switching tabs
  setTimeout(() => {
    notifySizeChanged();
  }, 50);
};

/**
 * Adjust zoom
 */
(window as any).adjustZoom = function(delta: number) {
  const iframe = document.getElementById('html-preview-iframe') as HTMLIFrameElement;
  const zoomValue = document.getElementById('zoom-value');
  
  if (iframe && zoomValue) {
    currentZoom = Math.max(0.25, Math.min(2.0, currentZoom + delta));
    iframe.style.transform = `scale(${currentZoom})`;
    iframe.style.transformOrigin = 'top left';
    iframe.style.width = `${100 / currentZoom}%`;
    iframe.style.height = `${800 / currentZoom}px`;
    zoomValue.textContent = Math.round(currentZoom * 100) + '%';
    
    // Notify size change
    setTimeout(() => {
      notifySizeChanged();
    }, 50);
  }
};

/**
 * Reset zoom
 */
(window as any).resetZoom = function() {
  const iframe = document.getElementById('html-preview-iframe') as HTMLIFrameElement;
  const zoomValue = document.getElementById('zoom-value');
  
  if (iframe && zoomValue) {
    currentZoom = 1.0;
    iframe.style.transform = '';
    iframe.style.width = '100%';
    iframe.style.height = '800px';
    zoomValue.textContent = '100%';
    
    // Notify size change
    setTimeout(() => {
      notifySizeChanged();
    }, 50);
  }
};

/**
 * Main render function
 */
function renderData(data: any) {
  const app = document.getElementById('app');
  
  if (!app) {
    console.error('App element not found!');
    return;
  }
  
  if (!data) {
    showEmpty('No data received');
    return;
  }

  try {
    // Unwrap nested data structures
    const unwrapped = unwrapData(data);
    const scrapeData = unwrapped?.data || unwrapped;
    
    if (!scrapeData) {
      showEmpty('No scrape data found');
      return;
    }

    const metadata = scrapeData.metadata || {};
    const html = scrapeData.html;
    const url = scrapeData.url || scrapeData.sourceURL || 'Unknown URL';
    const statusCode = scrapeData.statusCode || scrapeData.status_code || 200;
    const contentType = scrapeData.contentType || 'text/html';
    const cachedAt = scrapeData.cachedAt;
    const creditsUsed = scrapeData.creditsUsed;

    // Extract OG image URL
    const ogImage = metadata['og:image'] || metadata.ogImage || null;

    // Build metadata items
    const metadataItems: Array<{label: string, value: string, isLink?: boolean}> = [];
    if (metadata.title) metadataItems.push({ label: 'Title', value: metadata.title });
    if (metadata.description) metadataItems.push({ label: 'Description', value: metadata.description });
    if (metadata['og:title']) metadataItems.push({ label: 'OG Title', value: metadata['og:title'] });
    if (metadata['og:description']) metadataItems.push({ label: 'OG Description', value: metadata['og:description'] });
    if (ogImage) metadataItems.push({ label: 'OG Image', value: ogImage, isLink: true });
    if (metadata.language) metadataItems.push({ label: 'Language', value: metadata.language });
    if (metadata.keywords) metadataItems.push({ label: 'Keywords', value: formatMetadataValue(metadata.keywords) });
    if (metadata.generator) metadataItems.push({ label: 'Generator', value: metadata.generator });

    // Build HTML
    let htmlContent = `
      <div class="container">
        <div class="header">
          <h1>${escapeHtml(metadata.title || 'Scraped Website')}</h1>
          <div class="url">${escapeHtml(url)}</div>
        </div>

        ${ogImage ? `
        <div class="og-image-preview">
          <h3>Open Graph Image</h3>
          <div class="og-image-container">
            <img src="${escapeHtml(ogImage)}" alt="Open Graph Image" onerror="this.parentElement.innerHTML='<div class=\\'og-image-error\\'>Failed to load image</div>'">
          </div>
        </div>
        ` : ''}

        <div class="metadata-card">
          <h2>Metadata</h2>
          <div class="info-grid">
            <div class="info-item">
              <span class="status-badge ${statusCode >= 400 ? 'error' : ''}">${statusCode}</span>
              <span>Status Code</span>
            </div>
            ${contentType ? `<div class="info-item"><span>Content Type:</span><span>${escapeHtml(contentType)}</span></div>` : ''}
            ${cachedAt ? `<div class="info-item"><span>Cached:</span><span>${escapeHtml(new Date(cachedAt).toLocaleString())}</span></div>` : ''}
            ${creditsUsed ? `<div class="info-item"><span>Credits Used:</span><span>${creditsUsed}</span></div>` : ''}
          </div>
          ${metadataItems.length > 0 ? `
            <div class="metadata-grid">
              ${metadataItems.map(item => `
                <div class="metadata-item">
                  <div class="metadata-label">${escapeHtml(item.label)}</div>
                  <div class="metadata-value">
                    ${item.isLink ? `<a href="${escapeHtml(item.value)}" target="_blank" rel="noopener noreferrer">${escapeHtml(item.value)}</a>` : escapeHtml(item.value)}
                  </div>
                </div>
              `).join('')}
            </div>
          ` : ''}
        </div>
    `;

    // Add HTML content section if HTML exists
    if (html) {
      htmlContent += `
        <div class="content-section">
          <div class="tabs">
            <button class="tab active" onclick="switchTab('preview', this)">Preview</button>
            <button class="tab" onclick="switchTab('raw', this)">Raw HTML</button>
          </div>
          
          <div id="preview-tab" class="tab-content active">
            <div class="html-container">
              <div class="iframe-controls">
                <div class="zoom-control">
                  <button class="zoom-btn" onclick="adjustZoom(-0.1)">-</button>
                  <span class="zoom-value" id="zoom-value">100%</span>
                  <button class="zoom-btn" onclick="adjustZoom(0.1)">+</button>
                  <button class="zoom-btn" onclick="resetZoom()">Reset</button>
                </div>
              </div>
              <div id="iframe-wrapper" style="overflow: auto; max-height: 800px;">
                <iframe id="html-preview-iframe" class="html-viewer" sandbox="allow-same-origin allow-scripts allow-forms allow-popups allow-popups-to-escape-sandbox"></iframe>
              </div>
            </div>
          </div>
          
          <div id="raw-tab" class="tab-content">
            <div class="raw-html">${escapeHtml(html)}</div>
          </div>
        </div>
      `;
    } else {
      htmlContent += `
        <div class="content-section">
          <h2>Content</h2>
          <div class="html-placeholder">
            <p>No HTML content available for this scrape.</p>
            <p style="margin-top: 8px; font-size: 12px; color: #9aa0a6;">The website may have blocked scraping or returned only metadata.</p>
          </div>
        </div>
      `;
    }

    htmlContent += `</div>`;

    app.innerHTML = htmlContent;

    // Set iframe content after DOM is ready (to avoid escaping issues)
    if (html) {
      const iframe = document.getElementById('html-preview-iframe') as HTMLIFrameElement;
      if (iframe) {
        const preparedHtml = prepareHtmlForIframe(html);
        
        // Use srcdoc directly without escaping - this is safe because we're setting it programmatically
        iframe.srcdoc = preparedHtml;
        
        // Adjust iframe scaling after load
        iframe.onload = function() {
          try {
            const iframeDoc = iframe.contentDocument || (iframe.contentWindow as any)?.document;
            const iframeBody = iframeDoc?.body;
            
            if (iframeBody) {
              // Ensure body has proper styling
              iframeBody.style.margin = '0';
              iframeBody.style.padding = '8px';
              iframeBody.style.overflowX = 'auto';
            }
          } catch (e) {
            // Cross-origin restrictions may prevent access
            console.log('Cannot access iframe content (cross-origin):', e);
          }
          
          // Notify size change after iframe loads
          setTimeout(() => {
            notifySizeChanged();
          }, 100);
        };
      }
    }

  } catch (error: any) {
    console.error('Render error:', error);
    showError(`Error rendering data: ${error.message}`);
    // Notify size even on error
    setTimeout(() => {
      notifySizeChanged();
    }, 50);
  }
  
  // Notify host of size change after rendering completes
  // Use setTimeout to ensure DOM is fully updated
  setTimeout(() => {
    notifySizeChanged();
  }, 50);
}

/* ============================================
   MESSAGE HANDLER (Standardized MCP Protocol)
   ============================================ */

window.addEventListener('message', function(event: MessageEvent) {
  const msg = event.data;
  
  if (!msg || msg.jsonrpc !== '2.0') {
    return;
  }
  
  if (msg.id !== undefined && !msg.method) {
    return;
  }
  
  switch (msg.method) {
    case 'ui/notifications/tool-result':
      const data = msg.params?.structuredContent || msg.params;
      if (data !== undefined) {
        renderData(data);
      } else {
        console.warn('ui/notifications/tool-result received but no data found:', msg);
        showEmpty('No data received');
      }
      break;
      
    case 'ui/notifications/host-context-changed':
      if (msg.params?.theme === 'dark') {
        document.body.classList.add('dark');
      } else if (msg.params?.theme === 'light') {
        document.body.classList.remove('dark');
      }
      // Handle display mode changes
      if (msg.params?.displayMode) {
        handleDisplayModeChange(msg.params.displayMode);
      }
      break;
      
    case 'ui/notifications/tool-input':
      // Tool input notification (optional - handle if needed)
      break;
      
    case 'ui/notifications/initialized':
      // Initialization notification (optional - handle if needed)
      break;
      
    default:
      // Unknown method - try to extract data as fallback
      if (msg.params) {
        const fallbackData = msg.params.structuredContent || msg.params;
        if (fallbackData && fallbackData !== msg) {
          console.warn('Unknown method:', msg.method, '- attempting to render data');
          renderData(fallbackData);
        }
      }
  }
});

/* ============================================
   MCP COMMUNICATION
   ============================================ */

let requestIdCounter = 1;
function sendRequest(method: string, params: any): Promise<any> {
  return new Promise((resolve, reject) => {
    const id = requestIdCounter++;
    window.parent.postMessage({ jsonrpc: "2.0", id, method, params }, '*');
    
    const listener = (event: MessageEvent) => {
      if (event.data?.id === id) {
        window.removeEventListener('message', listener);
        if (event.data?.result) {
          resolve(event.data.result);
        } else if (event.data?.error) {
          reject(new Error(event.data.error.message || 'Unknown error'));
        }
      }
    };
    window.addEventListener('message', listener);
    
    // Timeout after 5 seconds
    setTimeout(() => {
      window.removeEventListener('message', listener);
      reject(new Error('Request timeout'));
    }, 5000);
  });
}

function sendNotification(method: string, params: any) {
  window.parent.postMessage({ jsonrpc: "2.0", method, params }, '*');
}

/* ============================================
   DISPLAY MODE HANDLING
   ============================================ */

let currentDisplayMode = 'inline';

function handleDisplayModeChange(mode: string) {
  currentDisplayMode = mode;
  if (mode === 'fullscreen') {
    document.body.classList.add('fullscreen-mode');
    // Adjust layout for fullscreen if needed
    const container = document.querySelector('.container');
    if (container) {
      (container as HTMLElement).style.maxWidth = '100%';
      (container as HTMLElement).style.padding = '20px';
    }
  } else {
    document.body.classList.remove('fullscreen-mode');
    // Restore normal layout
    const container = document.querySelector('.container');
    if (container) {
      (container as HTMLElement).style.maxWidth = '';
      (container as HTMLElement).style.padding = '';
    }
  }
  // Notify host of size change after mode change
  setTimeout(() => {
    notifySizeChanged();
  }, 100);
}

function requestDisplayMode(mode: string): Promise<any> {
  return sendRequest('ui/request-display-mode', { mode: mode })
    .then(result => {
      if (result?.mode) {
        handleDisplayModeChange(result.mode);
      }
      return result;
    })
    .catch(err => {
      console.warn('Failed to request display mode:', err);
      throw err;
    });
}

// Make function globally accessible for testing/debugging
(window as any).requestDisplayMode = requestDisplayMode;

/* ============================================
   SIZE CHANGE NOTIFICATIONS
   ============================================ */

function notifySizeChanged() {
  const width = document.body.scrollWidth || document.documentElement.scrollWidth;
  const height = document.body.scrollHeight || document.documentElement.scrollHeight;
  
  sendNotification('ui/notifications/size-changed', {
    width: width,
    height: height
  });
}

// Debounce function to avoid too many notifications
let sizeChangeTimeout: NodeJS.Timeout | null = null;
function debouncedNotifySizeChanged() {
  if (sizeChangeTimeout) {
    clearTimeout(sizeChangeTimeout);
  }
  sizeChangeTimeout = setTimeout(() => {
    notifySizeChanged();
  }, 100); // Wait 100ms after last change
}

// Use ResizeObserver to detect size changes
let resizeObserver: ResizeObserver | null = null;
function setupSizeObserver() {
  if (typeof ResizeObserver !== 'undefined') {
    resizeObserver = new ResizeObserver(() => {
      debouncedNotifySizeChanged();
    });
    resizeObserver.observe(document.body);
  } else {
    // Fallback: use window resize and mutation observer
    window.addEventListener('resize', debouncedNotifySizeChanged);
    const mutationObserver = new MutationObserver(debouncedNotifySizeChanged);
    mutationObserver.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['style', 'class']
    });
  }
  
  // Send initial size after a short delay to ensure content is rendered
  setTimeout(() => {
    notifySizeChanged();
  }, 100);
}

/* ============================================
   INITIALIZATION
   ============================================ */

// Initialize MCP App - REQUIRED for MCP Apps protocol
sendRequest('ui/initialize', {
  appCapabilities: {
    availableDisplayModes: ["inline", "fullscreen"]
  }
}).then((ctx: any) => {
  // Apply theme from host context
  if (ctx?.theme === 'dark') {
    document.body.classList.add('dark');
  } else if (ctx?.theme === 'light') {
    document.body.classList.remove('dark');
  }
  // Handle display mode from host context
  if (ctx?.displayMode) {
    handleDisplayModeChange(ctx.displayMode);
  }
  // Handle container dimensions if provided
  if (ctx?.containerDimensions) {
    const dims = ctx.containerDimensions;
    if (dims.width) {
      document.body.style.width = dims.width + 'px';
    }
    if (dims.height) {
      document.body.style.height = dims.height + 'px';
    }
    if (dims.maxWidth) {
      document.body.style.maxWidth = dims.maxWidth + 'px';
    }
    if (dims.maxHeight) {
      document.body.style.maxHeight = dims.maxHeight + 'px';
    }
  }
}).catch(err => {
  console.warn('Failed to initialize MCP App:', err);
  // Fallback to system preference if initialization fails
});

initializeDarkMode();

// Setup size observer to notify host of content size changes
// This is critical for the host to properly size the iframe
setupSizeObserver();
