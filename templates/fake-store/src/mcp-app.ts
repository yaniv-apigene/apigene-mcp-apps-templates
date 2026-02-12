/* ============================================
   FAKE STORE PRODUCT MCP APP
   ============================================
   
   Displays Fake Store API product information in a beautiful card layout.
   Handles product details, images, pricing, category, and ratings.
   ============================================ */

/* ============================================
   APP CONFIGURATION
   ============================================ */

const APP_NAME = "Fake Store Product";
const APP_VERSION = "1.0.0";
const PROTOCOL_VERSION = "2026-01-26"; // MCP Apps protocol version

/* ============================================
   EXTERNAL DEPENDENCIES
   ============================================
   Declare external libraries loaded from CDN
   ============================================ */

declare const Handlebars: any;

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
 */
function unwrapData(data: any): any {
  if (!data) return null;
  
  // Format 1: Standard table format { columns: [], rows: [] }
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
 */
function showEmpty(message: string = 'No product data available.') {
  const app = document.getElementById('app');
  if (app) {
    app.innerHTML = `<div class="empty">${escapeHtml(message)}</div>`;
  }
}

/* ============================================
   TEMPLATE-SPECIFIC FUNCTIONS
   ============================================ */

/**
 * Format price with currency symbol
 */
function formatPrice(price: number): string {
  if (!price && price !== 0) return 'Price not available';
  return `$${price.toFixed(2)}`;
}

/**
 * Format rating stars
 */
function formatRating(rate: number): string {
  const fullStars = Math.floor(rate);
  const hasHalfStar = rate % 1 >= 0.5;
  const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
  
  return '★'.repeat(fullStars) + 
         (hasHalfStar ? '½' : '') + 
         '☆'.repeat(emptyStars);
}

/**
 * Extract product data from API response
 */
function extractProductData(data: any): any {
  const unwrapped = unwrapData(data);
  
  // Handle Fake Store API response format: { status_code: 200, body: {...} }
  if (unwrapped?.body && typeof unwrapped.body === 'object') {
    return unwrapped.body;
  }
  
  // Handle direct product object
  if (unwrapped?.title || unwrapped?.id) {
    return unwrapped;
  }
  
  // Handle array of products
  if (Array.isArray(unwrapped) && unwrapped.length > 0) {
    return unwrapped[0];
  }
  
  return unwrapped;
}

/**
 * Capitalize first letter of each word
 */
function capitalizeWords(str: string): string {
  return str.replace(/\b\w/g, (char) => char.toUpperCase());
}

/* ============================================
   TEMPLATE-SPECIFIC RENDER FUNCTION
   ============================================ */

function renderData(data: any) {
  const app = document.getElementById('app');
  if (!app) return;
  
  if (!data) {
    showEmpty('No product data received');
    return;
  }

  try {
    const product = extractProductData(data);
    
    if (!product || !product.title) {
      showEmpty('Invalid product data format');
      return;
    }
    
    const {
      id,
      title,
      price,
      description,
      category,
      image,
      rating
    } = product;
    
    const ratingRate = rating?.rate || 0;
    const ratingCount = rating?.count || 0;
    
    app.innerHTML = `
      <div class="container">
        <div class="product-card">
          <div class="product-image">
            <img src="${escapeHtml(image)}" alt="${escapeHtml(title)}" loading="lazy"
                 onerror="this.classList.add('img-failed'); this.nextElementSibling?.classList.remove('img-placeholder-hidden');" />
            <div class="img-placeholder img-placeholder-hidden" aria-hidden="true">Image unavailable</div>
          </div>
          
          <div class="product-info">
            <div class="product-header">
              <span class="product-category">${escapeHtml(capitalizeWords(category || ''))}</span>
              <span class="product-id">#${id}</span>
            </div>
            
            <h1 class="product-title">${escapeHtml(title)}</h1>
            
            <div class="product-rating">
              <span class="rating-stars">${formatRating(ratingRate)}</span>
              <span class="rating-value">${ratingRate.toFixed(1)}</span>
              <span class="rating-count">(${ratingCount} reviews)</span>
            </div>
            
            <div class="product-price">
              ${formatPrice(price)}
            </div>
            
            ${description ? `
              <div class="product-description">
                <h3>Description</h3>
                <p>${escapeHtml(description)}</p>
              </div>
            ` : ''}
          </div>
        </div>
      </div>
    `;
    
    // Notify host of size change after rendering completes
    setTimeout(() => {
      notifySizeChanged();
    }, 50);
    
  } catch (error: any) {
    console.error('Render error:', error);
    showError(`Error rendering product data: ${error.message}`);
    // Notify size even on error
    setTimeout(() => {
      notifySizeChanged();
    }, 50);
  }
}

/* ============================================
   MESSAGE HANDLER (Standardized MCP Protocol)
   ============================================ */

window.addEventListener('message', function(event: MessageEvent) {
  const msg = event.data;
  
  if (!msg || msg.jsonrpc !== '2.0') {
    return;
  }
  
  // Handle requests that require responses (like ui/resource-teardown)
  if (msg.id !== undefined && msg.method === 'ui/resource-teardown') {
    const reason = msg.params?.reason || 'Resource teardown requested';
    
    // Clean up resources
    // - Clear any timers
    if (sizeChangeTimeout) {
      clearTimeout(sizeChangeTimeout);
      sizeChangeTimeout = null;
    }
    
    // - Disconnect observers
    if (resizeObserver) {
      resizeObserver.disconnect();
      resizeObserver = null;
    }
    
    // Send response to host
    window.parent.postMessage({
      jsonrpc: "2.0",
      id: msg.id,
      result: {}
    }, '*');
    
    return; // Don't process further
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
      // Re-render if needed (e.g., for charts that need theme updates)
      break;
      
    case 'ui/notifications/tool-input':
      // Tool input notification - Host MUST send this with complete tool arguments
      const toolArguments = msg.params?.arguments;
      if (toolArguments) {
        // Store tool arguments for reference (may be needed for context)
        console.log('Tool input received:', toolArguments);
        // Example: Could show loading state with input parameters
      }
      break;
      
    case 'ui/notifications/tool-cancelled':
      // Tool cancellation notification - Host MUST send this if tool is cancelled
      const reason = msg.params?.reason || 'Tool execution was cancelled';
      showError(`Operation cancelled: ${reason}`);
      // Clean up any ongoing operations
      // - Stop timers
      // - Cancel pending requests
      // - Reset UI state
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
    document.documentElement.classList.add('fullscreen-mode');
    document.body.classList.add('fullscreen-mode');
  } else {
    document.documentElement.classList.remove('fullscreen-mode');
    document.body.classList.remove('fullscreen-mode');
  }
  // Force a reflow to ensure CSS is applied before measuring
  void document.body.offsetHeight;
  // Notify host of size change after mode change with longer delay to ensure layout
  setTimeout(() => {
    notifySizeChanged();
  }, 200);
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
  let width: number;
  let height: number;
  
  // Double-check display mode from body class as well (more reliable)
  const isFullscreen = currentDisplayMode === 'fullscreen' || document.body.classList.contains('fullscreen-mode');
  
  if (isFullscreen) {
    // In fullscreen mode, report desired size based on content design
    // Don't rely on constrained iframe measurements
    const productCard = document.querySelector('.product-card');
    
    if (productCard) {
      // Product card max-width in fullscreen is 1400px (or 1600px on large screens)
      // Calculate desired width: card max-width + container padding
      const cardStyle = window.getComputedStyle(productCard);
      let cardMaxWidth = 1400; // Default max-width from CSS
      
      // Try to get actual max-width from computed style
      const computedMaxWidth = cardStyle.maxWidth;
      if (computedMaxWidth && computedMaxWidth !== 'none') {
        const parsed = parseInt(computedMaxWidth);
        if (!isNaN(parsed) && parsed > 0) {
          cardMaxWidth = parsed;
        }
      }
      
      // Check if we're on a large screen (use media query logic)
      if (window.matchMedia && window.matchMedia('(min-width: 1400px)').matches) {
        cardMaxWidth = Math.max(cardMaxWidth, 1600);
      }
      
      // Desired width = card max-width + container padding (24px * 2 = 48px)
      width = cardMaxWidth + 48;
      
      // For height, measure actual content height (use the larger of scroll/offset)
      const cardHeight = Math.max(
        productCard.scrollHeight || 0,
        productCard.offsetHeight || 0,
        productCard.getBoundingClientRect().height || 0
      );
      const containerPadding = 48; // 24px top + 24px bottom
      height = cardHeight + containerPadding;
      
      // Ensure reasonable minimums for fullscreen
      width = Math.max(width, 1200);
      height = Math.max(height, 600);
    } else {
      // No product card yet - use reasonable fullscreen defaults
      width = 1200;
      height = 800;
    }
  } else {
    // In inline mode, use actual measured content size
    const container = document.querySelector('.container');
    if (container) {
      width = Math.max(container.scrollWidth, container.offsetWidth);
      height = Math.max(container.scrollHeight, container.offsetHeight);
    } else {
      width = document.body.scrollWidth || document.documentElement.scrollWidth;
      height = document.body.scrollHeight || document.documentElement.scrollHeight;
    }
    
    // Ensure minimum dimensions for inline mode
    width = Math.max(width || 600, 600);
    height = Math.max(height || 400, 400);
  }
  
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
  },
  appInfo: {
    name: APP_NAME,
    version: APP_VERSION
  },
  protocolVersion: PROTOCOL_VERSION
}).then((result: any) => {
  // Extract host context from initialization result
  const ctx = result.hostContext || result;
  
  // Extract host capabilities for future use
  const hostCapabilities = result.hostCapabilities;
  
  // Send initialized notification after successful initialization
  sendNotification('ui/notifications/initialized', {});
  
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

// Export empty object to ensure this file is treated as an ES module
// This prevents TypeScript from treating top-level declarations as global
export {};
