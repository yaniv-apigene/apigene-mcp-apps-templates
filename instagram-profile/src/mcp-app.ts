/* ============================================
   INSTAGRAM PROFILE MCP APP
   ============================================
   
   Displays Instagram profile data in an Instagram-style layout.
   Shows profile info, highlights, and posts grid.
   ============================================ */

/* ============================================
   APP CONFIGURATION
   ============================================ */

const APP_NAME = "Instagram Profile";
const APP_VERSION = "1.0.0";
const PROTOCOL_VERSION = "2026-01-26"; // MCP Apps protocol version

/* ============================================
   COMMON UTILITY FUNCTIONS
   ============================================ */

/**
 * Extract data from MCP protocol messages
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
 */
function unwrapData(data: any): any {
  if (!data) return null;
  
  // Handle Claude format: {message: {status_code: 200, response_content: {...}}}
  if (data.message && typeof data.message === 'object') {
    const msg = data.message;
    if (msg.status_code !== undefined) {
      const content = msg.response_content || msg.body;
      if (content !== undefined) {
        return {
          status_code: msg.status_code,
          body: content,
          response_content: content
        };
      }
    }
  }
  
  // Handle direct BrightData response format
  if (data.status_code !== undefined) {
    const content = data.body || data.response_content;
    if (content !== undefined) {
      return {
        status_code: data.status_code,
        body: content,
        response_content: content
      };
    }
  }
  
  // Format 1: Standard table format
  if (data.columns || (Array.isArray(data.rows) && data.rows.length > 0) || 
      (typeof data === 'object' && !data.message)) {
    return data;
  }
  
  // Format 2: Nested in message.template_data
  if (data.message?.template_data) {
    return data.message.template_data;
  }
  
  // Format 3: Nested in message.response_content
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
  if (typeof str !== "string") return String(str || '');
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
function showEmpty(message: string = 'No profile data found.') {
  const app = document.getElementById('app');
  if (app) {
    app.innerHTML = `<div class="empty">${escapeHtml(message)}</div>`;
  }
}

/**
 * Format number with K/M suffixes
 */
function formatNumber(num: number): string {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M';
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K';
  }
  return num.toString();
}

/**
 * Format date relative to now
 */
function formatDate(dateString: string): string {
  try {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
    return `${Math.floor(diffDays / 365)} years ago`;
  } catch {
    return dateString;
  }
}

/* ============================================
   TEMPLATE-SPECIFIC FUNCTIONS (Instagram Profile)
   ============================================ */

/**
 * Extract profile data from BrightData API response
 */
function extractProfile(data: any): any {
  // Handle direct array format: [{...}]
  if (Array.isArray(data) && data.length > 0) {
    return data[0];
  }
  
  const unwrapped = unwrapData(data);
  if (!unwrapped) return null;

  // Handle BrightData format: {status_code: 200, body: [{...}]}
  const content = unwrapped.body || unwrapped.response_content;
  
  if (content && Array.isArray(content) && content.length > 0) {
    return content[0];
  }
  
  if (content && typeof content === 'object' && !Array.isArray(content)) {
    return content;
  }
  
  if (typeof unwrapped === 'object' && !Array.isArray(unwrapped)) {
    // Check if it's already a profile object
    if (unwrapped.account || unwrapped.profile_name) {
      return unwrapped;
    }
  }

  return null;
}

/**
 * Render profile header
 */
function renderProfileHeader(profile: any): string {
  const account = profile.account || '';
  const fullName = profile.profile_name || profile.full_name || account;
  const profileImage = profile.profile_image_link || '';
  const biography = profile.biography || '';
  const followers = profile.followers || 0;
  const following = profile.following || 0;
  const postsCount = profile.posts_count || 0;
  const isVerified = profile.is_verified || false;
  const profileUrl = profile.profile_url || profile.url || '';
  
  return `
    <div class="profile-header">
      <div class="profile-image-container">
        <img 
          src="${escapeHtml(profileImage)}" 
          alt="${escapeHtml(fullName)}" 
          class="profile-image"
          onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';"
        />
        <div class="profile-image-placeholder" style="display: none;">
          <span>📷</span>
        </div>
      </div>
      
      <div class="profile-info">
        <div class="profile-name-row">
          <h1 class="profile-username">${escapeHtml(account)}</h1>
          ${isVerified ? '<span class="verified-badge">✓</span>' : ''}
        </div>
        
        <div class="profile-stats">
          <div class="stat-item">
            <span class="stat-value">${formatNumber(postsCount)}</span>
            <span class="stat-label">posts</span>
          </div>
          <div class="stat-item">
            <span class="stat-value">${formatNumber(followers)}</span>
            <span class="stat-label">followers</span>
          </div>
          <div class="stat-item">
            <span class="stat-value">${formatNumber(following)}</span>
            <span class="stat-label">following</span>
          </div>
        </div>
        
        <div class="profile-fullname">${escapeHtml(fullName)}</div>
        
        ${biography ? `<div class="profile-bio">${escapeHtml(biography).replace(/\n/g, '<br>')}</div>` : ''}
        
        ${profileUrl ? `
          <a href="${escapeHtml(profileUrl)}" target="_blank" rel="noopener" class="profile-link">
            View on Instagram →
          </a>
        ` : ''}
      </div>
    </div>
  `;
}

/**
 * Render highlights
 */
function renderHighlights(highlights: any[]): string {
  if (!highlights || highlights.length === 0) return '';
  
  return `
    <div class="highlights-section">
      ${highlights.map((highlight: any) => `
        <a 
          href="${escapeHtml(highlight.highlight_url || '#')}" 
          target="_blank" 
          rel="noopener"
          class="highlight-item"
        >
          <div class="highlight-image-container">
            <img 
              src="${escapeHtml(highlight.image || '')}" 
              alt="${escapeHtml(highlight.title || '')}"
              class="highlight-image"
              onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';"
            />
            <div class="highlight-image-placeholder" style="display: none;">
              <span>📸</span>
            </div>
          </div>
          <div class="highlight-title">${escapeHtml(highlight.title || '')}</div>
        </a>
      `).join('')}
    </div>
  `;
}

/**
 * Render post grid item
 */
function renderPost(post: any): string {
  const imageUrl = post.image_url || '';
  const videoUrl = post.video_url || '';
  const contentType = post.content_type || 'Photo';
  const likes = post.likes || 0;
  const comments = post.comments || 0;
  const url = post.url || '';
  const caption = post.caption || '';
  const isVideo = contentType === 'Video' || !!videoUrl;
  const isCarousel = contentType === 'Carousel';
  
  return `
    <a href="${escapeHtml(url)}" target="_blank" rel="noopener" class="post-item">
      <div class="post-image-container">
        ${isVideo ? `
          <video 
            src="${escapeHtml(videoUrl)}" 
            class="post-media"
            muted
            playsinline
            onmouseenter="this.play()"
            onmouseleave="this.pause()"
            onerror="this.style.display='none'; this.parentElement.querySelector('.post-image-fallback').style.display='block';"
          >
          </video>
          <img 
            src="${escapeHtml(imageUrl)}" 
            class="post-image-fallback"
            style="display: none;"
            onerror="this.parentElement.querySelector('.post-placeholder').style.display='flex';"
          />
        ` : `
          <img 
            src="${escapeHtml(imageUrl)}" 
            alt="${escapeHtml(caption.substring(0, 50))}"
            class="post-media"
            loading="lazy"
            onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';"
          />
        `}
        <div class="post-placeholder" style="display: none;">
          <span>📷</span>
        </div>
        
        <div class="post-overlay">
          <div class="post-stats">
            <span class="post-stat">❤️ ${formatNumber(likes)}</span>
            <span class="post-stat">💬 ${formatNumber(comments)}</span>
          </div>
          ${isVideo ? '<span class="post-type-badge">▶️</span>' : ''}
          ${isCarousel ? '<span class="post-type-badge">📷</span>' : ''}
        </div>
      </div>
    </a>
  `;
}

/**
 * Main render function
 */
function renderData(data: any) {
  const app = document.getElementById('app');
  if (!app) return;
  
  console.log('[Instagram Profile] Rendering data:', data);
  
  if (!data) {
    showEmpty('No data received');
    return;
  }

  try {
    // Extract profile
    const profile = extractProfile(data);
    
    console.log('[Instagram Profile] Extracted profile:', profile);
    
    if (!profile) {
      console.warn('[Instagram Profile] No profile found in data:', data);
      showEmpty('No profile data found');
      return;
    }

    const posts = profile.posts || [];
    const highlights = profile.highlights || [];

    // Create container
    const container = document.createElement('div');
    container.className = 'instagram-container';
    
    // Profile header
    container.innerHTML = renderProfileHeader(profile);
    
    // Highlights
    if (highlights.length > 0) {
      const highlightsEl = document.createElement('div');
      highlightsEl.innerHTML = renderHighlights(highlights);
      container.appendChild(highlightsEl);
    }
    
    // Posts section
    const postsSection = document.createElement('div');
    postsSection.className = 'posts-section';
    
    if (posts.length === 0) {
      postsSection.innerHTML = '<div class="no-posts">No posts available</div>';
    } else {
      const postsGrid = document.createElement('div');
      postsGrid.className = 'posts-grid';
      postsGrid.id = 'posts-grid';
      
      posts.forEach((post: any) => {
        postsGrid.innerHTML += renderPost(post);
      });
      
      postsSection.appendChild(postsGrid);
    }
    
    container.appendChild(postsSection);

    app.innerHTML = '';
    app.appendChild(container);
    
    // Notify host of size change after rendering completes
    setTimeout(() => {
      notifySizeChanged();
    }, 50);
    
  } catch (error: any) {
    console.error('Render error:', error);
    showError(`Error rendering profile: ${error.message}`);
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
  
  console.log('[Instagram Profile] Received message:', msg);
  
  // Handle direct array format (from preview environments)
  if (Array.isArray(msg) && msg.length > 0 && msg[0].account) {
    console.log('[Instagram Profile] Detected direct array format');
    renderData(msg);
    return;
  }
  
  if (!msg || msg.jsonrpc !== '2.0') {
    // Handle direct data (not wrapped in JSON-RPC)
    if (msg && typeof msg === 'object') {
      // Handle direct profile object
      if (msg.account || msg.profile_name) {
        console.log('[Instagram Profile] Detected direct profile object');
        renderData(msg);
        return;
      }
      if (msg.message && msg.message.status_code !== undefined) {
        renderData(msg);
        return;
      }
      if (msg.status_code !== undefined || msg.body !== undefined || msg.response_content !== undefined) {
        renderData(msg);
        return;
      }
    }
    return;
  }
  
  // Handle requests that require responses (like ui/resource-teardown)
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
        console.log('[Instagram Profile] Received tool-result data:', data);
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
        // Check if params is an array or profile object
        if (Array.isArray(fallbackData) && fallbackData.length > 0 && fallbackData[0].account) {
          renderData(fallbackData);
        } else if (fallbackData && typeof fallbackData === 'object' && (fallbackData.account || fallbackData.profile_name)) {
          renderData(fallbackData);
        } else if (fallbackData && fallbackData !== msg) {
          console.warn('Unknown method:', msg.method, '- attempting to render data');
          renderData(fallbackData);
        }
      } else if (msg.message || msg.status_code || msg.body || msg.response_content) {
        renderData(msg);
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
    const container = document.querySelector('.instagram-container');
    if (container) {
      (container as HTMLElement).style.maxWidth = '100%';
      (container as HTMLElement).style.padding = '20px';
    }
  } else {
    document.body.classList.remove('fullscreen-mode');
    const container = document.querySelector('.instagram-container');
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
