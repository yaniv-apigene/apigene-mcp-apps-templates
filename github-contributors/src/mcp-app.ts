/* ============================================
   GITHUB CONTRIBUTORS VIEWER MCP APP
   ============================================
   
   Displays GitHub repository contributors in a GitHub-style interface
   ============================================ */

/* ============================================
   APP CONFIGURATION
   ============================================ */

const APP_NAME = "GitHub Contributors Viewer";
const APP_VERSION = "1.0.0";
const PROTOCOL_VERSION = "2026-01-26";

/* ============================================
   COMMON UTILITY FUNCTIONS
   ============================================ */

function extractData(msg: any) {
  if (msg?.params?.structuredContent !== undefined) {
    return msg.params.structuredContent;
  }
  if (msg?.params !== undefined) {
    return msg.params;
  }
  return msg;
}

function unwrapData(data: any): any {
  if (!data) return null;
  
  // Handle GitHub API response format - check for body array
  if (data.body && Array.isArray(data.body)) {
    return data.body;
  }
  
  // Standard table format
  if (data.columns || (Array.isArray(data.rows) && data.rows.length > 0) || 
      (typeof data === 'object' && !data.message)) {
    return data;
  }
  
  // Nested formats
  if (data.message?.template_data) {
    return data.message.template_data;
  }
  if (data.message?.response_content) {
    return data.message.response_content;
  }
  
  // Common nested patterns
  if (data.data?.results) return data.data.results;
  if (data.data?.items) return data.data.items;
  if (data.data?.records) return data.data.records;
  if (data.results) return data.results;
  if (data.items) return data.items;
  if (data.records) return data.records;
  
  // Direct rows array
  if (Array.isArray(data.rows)) {
    return data;
  }
  
  // If data itself is an array
  if (Array.isArray(data)) {
    return data;
  }
  
  return data;
}

function initializeDarkMode() {
  if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
    document.body.classList.add('dark');
  }
  
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e: MediaQueryListEvent) => {
    document.body.classList.toggle('dark', e.matches);
  });
}

function escapeHtml(str: any): string {
  if (typeof str !== "string") return str;
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

function showError(message: string) {
  const app = document.getElementById('app');
  if (app) {
    app.innerHTML = `<div class="error">${escapeHtml(message)}</div>`;
  }
}

function showEmpty(message: string = 'No contributors found.') {
  const app = document.getElementById('app');
  if (app) {
    app.innerHTML = `<div class="empty">${escapeHtml(message)}</div>`;
  }
}

/* ============================================
   TEMPLATE-SPECIFIC FUNCTIONS
   ============================================ */

/**
 * Format contribution count with commas
 */
function formatContributions(count: number): string {
  return count.toLocaleString();
}

/**
 * Calculate contribution percentage relative to max
 */
function getContributionPercentage(contributions: number, maxContributions: number): number {
  if (maxContributions === 0) return 0;
  return Math.min((contributions / maxContributions) * 100, 100);
}

/**
 * Get contribution bar width class
 */
function getContributionBarClass(percentage: number): string {
  if (percentage >= 80) return 'bar-high';
  if (percentage >= 50) return 'bar-medium';
  if (percentage >= 20) return 'bar-low';
  return 'bar-minimal';
}

/**
 * Render a single contributor
 */
function renderContributor(contributor: any, index: number, maxContributions: number): string {
  const login = contributor.login || 'unknown';
  const avatarUrl = contributor.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(login)}&size=40`;
  const htmlUrl = contributor.html_url || `https://github.com/${login}`;
  const contributions = contributor.contributions || 0;
  const userType = contributor.type || 'User';
  const isBot = userType === 'Bot';
  const isSiteAdmin = contributor.site_admin === true;
  const id = contributor.id || '';

  const percentage = getContributionPercentage(contributions, maxContributions);
  const barClass = getContributionBarClass(percentage);

  return `
    <div class="contributor-item" data-index="${index}">
      <div class="contributor-rank">
        <span class="rank-number">${index + 1}</span>
      </div>
      <div class="contributor-avatar">
        <a href="${htmlUrl}" target="_blank" class="avatar-link">
          <img src="${avatarUrl}" alt="${escapeHtml(login)}" class="avatar-img" loading="lazy">
        </a>
      </div>
      <div class="contributor-info">
        <div class="contributor-name-row">
          <a href="${htmlUrl}" target="_blank" class="contributor-name">
            ${escapeHtml(login)}
          </a>
          ${isBot ? '<span class="contributor-badge bot">Bot</span>' : ''}
          ${isSiteAdmin ? '<span class="contributor-badge admin">Staff</span>' : ''}
        </div>
        <div class="contributor-contributions">
          <span class="contributions-count">${formatContributions(contributions)}</span>
          <span class="contributions-label">${contributions === 1 ? 'contribution' : 'contributions'}</span>
        </div>
      </div>
      <div class="contributor-bar">
        <div class="contribution-bar ${barClass}" style="width: ${percentage}%"></div>
      </div>
    </div>
  `;
}

/* ============================================
   TEMPLATE-SPECIFIC RENDER FUNCTION
   ============================================ */

let allContributors: any[] = [];
let filteredContributors: any[] = [];
let sortOrder: 'desc' | 'asc' = 'desc';
let filterType: 'all' | 'users' | 'bots' = 'all';

function renderData(data: any) {
  const app = document.getElementById('app');
  if (!app) return;
  
  if (!data) {
    showEmpty('No data received');
    return;
  }

  try {
    // Unwrap data - handle GitHub API response format
    let contributors: any[] = [];
    
    const unwrapped = unwrapData(data);
    
    if (Array.isArray(unwrapped)) {
      contributors = unwrapped;
    } else if (unwrapped?.body && Array.isArray(unwrapped.body)) {
      contributors = unwrapped.body;
    } else if (unwrapped?.rows && Array.isArray(unwrapped.rows)) {
      contributors = unwrapped.rows;
    } else {
      contributors = [];
    }
    
    if (contributors.length === 0) {
      showEmpty('No contributors found');
      return;
    }
    
    // Store for filtering/sorting
    allContributors = [...contributors];
    filteredContributors = [...contributors];
    
    // Sort by contributions
    filteredContributors.sort((a, b) => {
      const aContribs = a.contributions || 0;
      const bContribs = b.contributions || 0;
      return sortOrder === 'desc' ? bContribs - aContribs : aContribs - bContribs;
    });
    
    // Filter by type
    if (filterType !== 'all') {
      filteredContributors = filteredContributors.filter(c => {
        if (filterType === 'bots') return c.type === 'Bot';
        if (filterType === 'users') return c.type === 'User';
        return true;
      });
    }
    
    // Find max contributions for bar scaling
    const maxContributions = Math.max(...filteredContributors.map(c => c.contributions || 0), 1);
    
    // Calculate totals
    const totalContributions = filteredContributors.reduce((sum, c) => sum + (c.contributions || 0), 0);
    const userCount = filteredContributors.filter(c => c.type === 'User').length;
    const botCount = filteredContributors.filter(c => c.type === 'Bot').length;
    
    app.innerHTML = `
      <div class="github-container">
        <div class="contributors-header">
          <div class="header-top">
            <h1 class="contributors-title">
              <svg class="github-icon" width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.012 8.012 0 0016 8c0-4.42-3.58-8-8-8z"/>
              </svg>
              Contributors
            </h1>
            <div class="contributors-stats">
              <span class="stat-item">
                <span class="stat-value">${filteredContributors.length}</span>
                <span class="stat-label">${filteredContributors.length === 1 ? 'contributor' : 'contributors'}</span>
              </span>
              <span class="stat-item">
                <span class="stat-value">${formatContributions(totalContributions)}</span>
                <span class="stat-label">total</span>
              </span>
            </div>
          </div>
          <div class="header-controls">
            <div class="filter-group">
              <button class="filter-btn ${filterType === 'all' ? 'active' : ''}" onclick="setFilter('all')">
                All
              </button>
              <button class="filter-btn ${filterType === 'users' ? 'active' : ''}" onclick="setFilter('users')">
                Users (${userCount})
              </button>
              <button class="filter-btn ${filterType === 'bots' ? 'active' : ''}" onclick="setFilter('bots')">
                Bots (${botCount})
              </button>
            </div>
            <div class="sort-group">
              <button class="sort-btn" onclick="toggleSort()">
                <svg class="sort-icon" width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                  <path d="M8 2a.75.75 0 01.75.75v10.5a.75.75 0 01-1.5 0V2.75A.75.75 0 018 2z"/>
                  <path d="M3.22 5.22a.75.75 0 011.06 0L7 8.94l2.72-2.72a.75.75 0 111.06 1.06l-3.25 3.25a.75.75 0 01-1.06 0L3.22 6.28a.75.75 0 010-1.06z"/>
                </svg>
                ${sortOrder === 'desc' ? 'Most' : 'Least'}
              </button>
            </div>
          </div>
        </div>
        <div class="contributors-list">
          ${filteredContributors.map((contributor, index) => renderContributor(contributor, index, maxContributions)).join('')}
        </div>
      </div>
    `;
    
    setTimeout(() => {
      notifySizeChanged();
    }, 50);
    
  } catch (error: any) {
    console.error('Render error:', error);
    showError(`Error rendering contributors: ${error.message}`);
    setTimeout(() => {
      notifySizeChanged();
    }, 50);
  }
}

/**
 * Set filter type
 */
(window as any).setFilter = function(type: 'all' | 'users' | 'bots') {
  filterType = type;
  renderData({ body: allContributors });
};

/**
 * Toggle sort order
 */
(window as any).toggleSort = function() {
  sortOrder = sortOrder === 'desc' ? 'asc' : 'desc';
  renderData({ body: allContributors });
};

/* ============================================
   MESSAGE HANDLER (Standardized MCP Protocol)
   ============================================ */

window.addEventListener('message', function(event: MessageEvent) {
  const msg = event.data;
  
  if (!msg || msg.jsonrpc !== '2.0') {
    return;
  }
  
  if (msg.id !== undefined && msg.method === 'ui/resource-teardown') {
    const reason = msg.params?.reason || 'Resource teardown requested';
    
    if (sizeChangeTimeout) {
      clearTimeout(sizeChangeTimeout);
      sizeChangeTimeout = null;
    }
    
    if (resizeObserver) {
      resizeObserver.disconnect();
      resizeObserver = null;
    }
    
    window.parent.postMessage({
      jsonrpc: "2.0",
      id: msg.id,
      result: {}
    }, '*');
    
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
      if (msg.params?.displayMode) {
        handleDisplayModeChange(msg.params.displayMode);
      }
      break;
      
    case 'ui/notifications/tool-input':
      const toolArguments = msg.params?.arguments;
      if (toolArguments) {
        console.log('Tool input received:', toolArguments);
      }
      break;
      
    case 'ui/notifications/tool-cancelled':
      const reason = msg.params?.reason || 'Tool execution was cancelled';
      showError(`Operation cancelled: ${reason}`);
      break;
      
    case 'ui/notifications/initialized':
      break;
      
    default:
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
    const container = document.querySelector('.github-container');
    if (container) {
      (container as HTMLElement).style.maxWidth = '100%';
      (container as HTMLElement).style.padding = '20px';
    }
  } else {
    document.body.classList.remove('fullscreen-mode');
    const container = document.querySelector('.github-container');
    if (container) {
      (container as HTMLElement).style.maxWidth = '';
      (container as HTMLElement).style.padding = '';
    }
  }
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

let sizeChangeTimeout: NodeJS.Timeout | null = null;
function debouncedNotifySizeChanged() {
  if (sizeChangeTimeout) {
    clearTimeout(sizeChangeTimeout);
  }
  sizeChangeTimeout = setTimeout(() => {
    notifySizeChanged();
  }, 100);
}

let resizeObserver: ResizeObserver | null = null;
function setupSizeObserver() {
  if (typeof ResizeObserver !== 'undefined') {
    resizeObserver = new ResizeObserver(() => {
      debouncedNotifySizeChanged();
    });
    resizeObserver.observe(document.body);
  } else {
    window.addEventListener('resize', debouncedNotifySizeChanged);
    const mutationObserver = new MutationObserver(debouncedNotifySizeChanged);
    mutationObserver.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['style', 'class']
    });
  }
  
  setTimeout(() => {
    notifySizeChanged();
  }, 100);
}

/* ============================================
   INITIALIZATION
   ============================================ */

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
  const ctx = result.hostContext || result;
  const hostCapabilities = result.hostCapabilities;
  
  sendNotification('ui/notifications/initialized', {});
  if (ctx?.theme === 'dark') {
    document.body.classList.add('dark');
  } else if (ctx?.theme === 'light') {
    document.body.classList.remove('dark');
  }
  if (ctx?.displayMode) {
    handleDisplayModeChange(ctx.displayMode);
  }
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
});

initializeDarkMode();
setupSizeObserver();

export {};
