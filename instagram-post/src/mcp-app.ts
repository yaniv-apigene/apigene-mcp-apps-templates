/* ============================================
   INSTAGRAM POST MCP APP
   ============================================
   
   Displays Instagram post information in Instagram's signature style.
   Handles photos, videos, captions, comments, and engagement metrics.
   ============================================ */

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
  
  if (data.columns || (Array.isArray(data.rows) && data.rows.length > 0) || 
      (typeof data === 'object' && !data.message)) {
    return data;
  }
  
  if (data.message?.template_data) {
    return data.message.template_data;
  }
  
  if (data.message?.response_content) {
    return data.message.response_content;
  }
  
  if (data.data?.results) return data.data.results;
  if (data.data?.items) return data.data.items;
  if (data.data?.records) return data.data.records;
  if (data.results) return data.results;
  if (data.items) return data.items;
  if (data.records) return data.records;
  
  if (Array.isArray(data.rows)) {
    return data;
  }
  
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
function showEmpty(message: string = 'No post data available.') {
  const app = document.getElementById('app');
  if (app) {
    app.innerHTML = `<div class="empty">${escapeHtml(message)}</div>`;
  }
}

/* ============================================
   TEMPLATE-SPECIFIC FUNCTIONS
   ============================================ */

/**
 * Format number with K/M abbreviations (Instagram style)
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
 * Format date relative to now (Instagram style)
 */
function formatRelativeTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);
  
  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m`;
  if (diffHours < 24) return `${diffHours}h`;
  if (diffDays < 7) return `${diffDays}d`;
  
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return `${months[date.getMonth()]} ${date.getDate()}`;
}

/**
 * Extract post data from API response
 */
function extractPostData(data: any): any {
  const unwrapped = unwrapData(data);
  
  // Handle API response format: { status_code: 200, body: [...] }
  if (unwrapped?.body && Array.isArray(unwrapped.body) && unwrapped.body.length > 0) {
    return unwrapped.body[0];
  }
  
  // Handle direct post object
  if (unwrapped?.user_posted || unwrapped?.post_id) {
    return unwrapped;
  }
  
  // Handle array of posts
  if (Array.isArray(unwrapped) && unwrapped.length > 0) {
    return unwrapped[0];
  }
  
  return unwrapped;
}

/**
 * Render media (photos or videos)
 */
function renderMedia(post: any): string {
  const photos = post.photos || [];
  const videos = post.videos || [];
  const allMedia = [...photos, ...videos];
  
  if (allMedia.length === 0) {
    return '<div class="no-media">No media available</div>';
  }
  
  if (allMedia.length === 1) {
    const isVideo = videos.length > 0 && allMedia[0] === videos[0];
    return `
      <div class="media-container single">
        ${isVideo ? `
          <video class="post-media" controls>
            <source src="${escapeHtml(allMedia[0])}" type="video/mp4">
          </video>
          <div class="video-badge">VIDEO</div>
        ` : `
          <img class="post-media" src="${escapeHtml(allMedia[0])}" alt="Post image" loading="lazy" />
        `}
      </div>
    `;
  }
  
  // Multiple media - show carousel
  return `
    <div class="media-container carousel">
      <div class="media-carousel" id="mediaCarousel">
        ${allMedia.map((media: string, idx: number) => {
          const isVideo = videos.includes(media);
          return `
            <div class="carousel-item ${idx === 0 ? 'active' : ''}" data-index="${idx}">
              ${isVideo ? `
                <video class="post-media" controls>
                  <source src="${escapeHtml(media)}" type="video/mp4">
                </video>
                <div class="video-badge">VIDEO</div>
              ` : `
                <img class="post-media" src="${escapeHtml(media)}" alt="Post image ${idx + 1}" loading="lazy" />
              `}
            </div>
          `;
        }).join('')}
      </div>
      <div class="carousel-dots">
        ${allMedia.map((_: any, idx: number) => `
          <span class="dot ${idx === 0 ? 'active' : ''}" data-index="${idx}"></span>
        `).join('')}
      </div>
      ${allMedia.length > 1 ? `
        <button class="carousel-nav prev" id="carouselPrev">‹</button>
        <button class="carousel-nav next" id="carouselNext">›</button>
      ` : ''}
    </div>
  `;
}

/**
 * Render comments section
 */
function renderComments(comments: any[]): string {
  if (!comments || comments.length === 0) {
    return '';
  }
  
  return `
    <div class="comments-section">
      ${comments.slice(0, 5).map((comment: any) => `
        <div class="comment">
          <img class="comment-avatar" src="${escapeHtml(comment.profile_picture || '')}" alt="${escapeHtml(comment.user_commenting)}" loading="lazy" />
          <div class="comment-content">
            <div class="comment-text">
              <strong>${escapeHtml(comment.user_commenting)}</strong>
              <span>${escapeHtml(comment.comments)}</span>
            </div>
            ${comment.likes > 0 ? `
              <div class="comment-likes">${formatNumber(comment.likes)} likes</div>
            ` : ''}
          </div>
        </div>
      `).join('')}
      ${comments.length > 5 ? `
        <div class="view-more-comments">View all ${comments.length} comments</div>
      ` : ''}
    </div>
  `;
}

/* ============================================
   TEMPLATE-SPECIFIC RENDER FUNCTION
   ============================================ */

function renderData(data: any) {
  const app = document.getElementById('app');
  if (!app) return;
  
  if (!data) {
    showEmpty('No post data received');
    return;
  }

  try {
    const post = extractPostData(data);
    
    if (!post || !post.user_posted) {
      showEmpty('Invalid post data format');
      return;
    }
    
    const {
      user_posted,
      description,
      likes,
      num_comments,
      date_posted,
      photos = [],
      videos = [],
      latest_comments = [],
      profile_image_link,
      is_verified,
      followers,
      posts_count,
      tagged_users = [],
      coauthor_producers = [],
      content_type,
      url
    } = post;
    
    app.innerHTML = `
      <div class="container">
        <div class="instagram-post">
          <!-- Profile Header -->
          <div class="post-header">
            <div class="profile-info">
              <img class="profile-avatar" src="${escapeHtml(profile_image_link || '')}" alt="${escapeHtml(user_posted)}" loading="lazy" />
              <div class="profile-details">
                <div class="username-row">
                  <span class="username">${escapeHtml(user_posted)}</span>
                  ${is_verified ? '<span class="verified-badge">✓</span>' : ''}
                  ${coauthor_producers && coauthor_producers.length > 0 ? `
                    <span class="coauthors">
                      ${coauthor_producers.map((coauthor: string) => `@${escapeHtml(coauthor)}`).join(', ')}
                    </span>
                  ` : ''}
                </div>
                ${followers ? `<div class="profile-stats">${formatNumber(followers)} followers</div>` : ''}
              </div>
            </div>
            ${url ? `
              <a href="${escapeHtml(url)}" target="_blank" rel="noopener noreferrer" class="external-link">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
                  <polyline points="15 3 21 3 21 9"></polyline>
                  <line x1="10" y1="14" x2="21" y2="3"></line>
                </svg>
              </a>
            ` : ''}
          </div>
          
          <!-- Media -->
          ${renderMedia(post)}
          
          <!-- Engagement Bar -->
          <div class="engagement-bar">
            <div class="engagement-icons">
              <span class="icon like-icon">♡</span>
              <span class="icon comment-icon">💬</span>
              <span class="icon share-icon">📤</span>
            </div>
            <div class="engagement-stats">
              ${likes ? `<span class="likes-count">${formatNumber(likes)} likes</span>` : ''}
            </div>
          </div>
          
          <!-- Caption -->
          ${description ? `
            <div class="post-caption">
              <strong>${escapeHtml(user_posted)}</strong>
              <span>${escapeHtml(description)}</span>
            </div>
          ` : ''}
          
          <!-- View Comments Link -->
          ${num_comments > 0 ? `
            <div class="view-comments">
              View all ${formatNumber(num_comments)} comments
            </div>
          ` : ''}
          
          <!-- Comments -->
          ${renderComments(latest_comments)}
          
          <!-- Tagged Users -->
          ${tagged_users && tagged_users.length > 0 ? `
            <div class="tagged-users">
              <span class="tagged-label">Tagged:</span>
              ${tagged_users.map((user: any) => `
                <a href="https://www.instagram.com/${escapeHtml(user.username)}" target="_blank" rel="noopener noreferrer" class="tagged-user">
                  ${user.is_verified ? '<span class="verified-badge small">✓</span>' : ''}
                  ${escapeHtml(user.username)}
                </a>
              `).join(', ')}
            </div>
          ` : ''}
          
          <!-- Post Meta -->
          <div class="post-meta">
            ${date_posted ? `
              <span class="post-time">${formatRelativeTime(date_posted)}</span>
            ` : ''}
            ${content_type ? `
              <span class="content-type">${escapeHtml(content_type)}</span>
            ` : ''}
          </div>
        </div>
      </div>
    `;
    
    // Setup carousel navigation
    const carouselItems = app.querySelectorAll('.carousel-item');
    const carouselDots = app.querySelectorAll('.carousel-dots .dot');
    const prevBtn = app.querySelector('#carouselPrev');
    const nextBtn = app.querySelector('#carouselNext');
    
    if (carouselItems.length > 1) {
      let currentIndex = 0;
      
      const showSlide = (index: number) => {
        carouselItems.forEach((item, idx) => {
          item.classList.toggle('active', idx === index);
        });
        carouselDots.forEach((dot, idx) => {
          dot.classList.toggle('active', idx === index);
        });
        currentIndex = index;
      };
      
      if (prevBtn) {
        prevBtn.addEventListener('click', () => {
          showSlide((currentIndex - 1 + carouselItems.length) % carouselItems.length);
        });
      }
      
      if (nextBtn) {
        nextBtn.addEventListener('click', () => {
          showSlide((currentIndex + 1) % carouselItems.length);
        });
      }
      
      carouselDots.forEach((dot, idx) => {
        dot.addEventListener('click', () => {
          showSlide(idx);
        });
      });
    }
    
    // Notify host of size change after rendering completes
    setTimeout(() => {
      notifySizeChanged();
    }, 50);
    
  } catch (error: any) {
    console.error('Render error:', error);
    showError(`Error rendering post data: ${error.message}`);
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
    const container = document.querySelector('.container');
    if (container) {
      (container as HTMLElement).style.maxWidth = '100%';
      (container as HTMLElement).style.padding = '20px';
    }
  } else {
    document.body.classList.remove('fullscreen-mode');
    const container = document.querySelector('.container');
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
  }
}).then((ctx: any) => {
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
