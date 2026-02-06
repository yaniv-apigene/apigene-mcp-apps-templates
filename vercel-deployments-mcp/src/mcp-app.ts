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
   APP CONFIGURATION
   ============================================
   TEMPLATE-SPECIFIC: Update these values for your app
   ============================================ */

const APP_NAME = "Vercel Deployments";  // App name
const APP_VERSION = "1.0.0";         // App version
const PROTOCOL_VERSION = "2026-01-26"; // MCP Apps protocol version

/* ============================================
   EXTERNAL DEPENDENCIES
   ============================================
   If you use external libraries (like Chart.js), declare them here.
   ============================================ */

declare const Chart: any;

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
 * Override the default message by passing a custom message
 */
function showEmpty(message: string = 'No data available.') {
  const app = document.getElementById('app');
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

/**
 * Format timestamp to relative time
 */
function formatRelativeTime(timestamp: number): string {
  const now = Date.now();
  const diff = now - timestamp;
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  
  if (days > 0) return `${days} day${days > 1 ? 's' : ''} ago`;
  if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  if (minutes > 0) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
  return 'Just now';
}

/**
 * Format full date/time
 */
function formatFullDate(timestamp: number): string {
  return new Date(timestamp).toLocaleString('en-US', {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit'
  });
}

/**
 * Get state badge class
 */
function getStateClass(state: string, readyState: string): string {
  if (state === 'READY' && readyState === 'READY') {
    return 'state-ready';
  }
  if (state === 'READY' && readyState === 'STAGED') {
    return 'state-staged';
  }
  if (state === 'BUILDING' || state === 'QUEUED') {
    return 'state-building';
  }
  if (state === 'ERROR' || state === 'CANCELED') {
    return 'state-error';
  }
  return 'state-default';
}

/**
 * Get state display text
 */
function getStateText(state: string, readyState: string): string {
  if (state === 'READY' && readyState === 'READY') {
    return 'Ready';
  }
  if (state === 'READY' && readyState === 'STAGED') {
    return 'Staged';
  }
  if (state === 'READY' && readyState === 'PROMOTED') {
    return 'Production';
  }
  return state;
}

/**
 * Truncate text
 */
function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
}

/* ============================================
   TEMPLATE-SPECIFIC RENDER FUNCTION
   ============================================
   
   This is the main function you need to implement.
   It receives the data and renders it in the app.
   
   Guidelines:
   1. Always validate data before rendering
   2. Use unwrapData() to handle nested structures
   3. Use escapeHtml() when inserting user content
   4. Call notifySizeChanged() after rendering completes
   5. Handle errors gracefully with try/catch
   ============================================ */

// Store deployments for filtering
let allDeployments: any[] = [];
let filteredDeployments: any[] = [];
let currentView: 'list' | 'detail' | 'summary' = 'list';
let selectedDeployment: any = null;
let chartInstances: any[] = [];

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
    
    // Extract deployments from Vercel API response format
    let deployments: any[] = [];
    let pagination: any = null;
    
    // Handle different data structures
    if (unwrapped.body?.deployments) {
      deployments = unwrapped.body.deployments;
      pagination = unwrapped.body.pagination;
    } else if (unwrapped.deployments) {
      deployments = unwrapped.deployments;
      pagination = unwrapped.pagination;
    } else if (Array.isArray(unwrapped)) {
      deployments = unwrapped;
    }
    
    if (!deployments || deployments.length === 0) {
      showEmpty('No deployments found');
      return;
    }
    
    // Store all deployments for filtering
    allDeployments = deployments;
    filteredDeployments = [...deployments];
    
    // Build HTML
    let html = '<div class="vercel-container">';
    
    // Header with view switcher and filters
    html += '<div class="vercel-header">';
    html += '<div class="header-top">';
    html += '<h1 class="header-title">Vercel Deployments</h1>';
    
    // View switcher
    html += '<div class="view-switcher">';
    html += `<button class="view-tab ${currentView === 'summary' ? 'active' : ''}" onclick="switchView('summary')">Summary</button>`;
    html += `<button class="view-tab ${currentView === 'list' ? 'active' : ''}" onclick="switchView('list')">List</button>`;
    html += '</div>';
    
    // Filters (only show in list view)
    if (currentView === 'list') {
      html += '<div class="vercel-filters">';
      html += '<select id="state-filter" class="vercel-filter">';
      html += '<option value="">All states</option>';
      html += '<option value="READY">Ready</option>';
      html += '<option value="BUILDING">Building</option>';
      html += '<option value="ERROR">Error</option>';
      html += '<option value="CANCELED">Canceled</option>';
      html += '</select>';
      
      html += '<select id="source-filter" class="vercel-filter">';
      html += '<option value="">All sources</option>';
      html += '<option value="git">Git</option>';
      html += '<option value="cli">CLI</option>';
      html += '</select>';
      
      html += '<select id="sort-filter" class="vercel-filter">';
      html += '<option value="newest">Newest first</option>';
      html += '<option value="oldest">Oldest first</option>';
      html += '</select>';
      html += '</div>'; // vercel-filters
    }
    html += '</div>'; // header-top
    
    // Stats
    if (pagination && currentView === 'list') {
      html += '<div class="header-stats">';
      html += `<span>Showing <strong id="result-count">${filteredDeployments.length}</strong> of ${pagination.count || deployments.length} deployments</span>`;
      html += '</div>';
    }
    
    html += '</div>'; // vercel-header
    
    // Deployments grid, detail view, or summary view
    if (currentView === 'detail' && selectedDeployment) {
      html += renderDeploymentDetail(selectedDeployment);
    } else if (currentView === 'summary') {
      html += renderSummaryView(deployments);
    } else {
      html += '<div class="deployments-grid" id="deployments-list">';
      filteredDeployments.forEach((deployment: any) => {
        html += renderDeployment(deployment);
      });
      html += '</div>'; // deployments-grid
    }
    
    html += '</div>'; // vercel-container
    
    app.innerHTML = html;
    
    // Setup event listeners for filters and detail view
    setupFilters();
    setupDetailView();
    
    // Setup charts if in summary view
    if (currentView === 'summary') {
      setTimeout(() => {
        setupCharts(deployments);
        notifySizeChanged();
      }, 100);
    } else {
      // Notify host of size change after rendering completes
      setTimeout(() => {
        notifySizeChanged();
      }, 50);
    }
    
  } catch (error: any) {
    console.error('Render error:', error);
    showError(`Error rendering data: ${error.message}`);
    // Notify size even on error
    setTimeout(() => {
      notifySizeChanged();
    }, 50);
  }
}

/**
 * Render a single deployment card
 */
function renderDeployment(deployment: any): string {
  const {
    uid,
    name,
    url,
    created,
    state,
    readyState,
    source,
    target,
    creator,
    meta,
    inspectorUrl
  } = deployment;
  
  // Safe extraction with fallbacks
  const deploymentName = name || uid || 'Unnamed Deployment';
  const deploymentState = state || 'UNKNOWN';
  const deploymentReadyState = readyState || '';
  const deploymentUrl = url || '';
  const deploymentCreated = created || Date.now();
  const deploymentSource = source || '';
  const deploymentTarget = target || '';
  
  const stateClass = getStateClass(deploymentState, deploymentReadyState);
  const stateText = getStateText(deploymentState, deploymentReadyState);
  const relativeTime = formatRelativeTime(deploymentCreated);
  const fullDate = formatFullDate(deploymentCreated);
  
  // Creator name with multiple fallbacks
  let creatorName = 'Unknown';
  if (creator) {
    creatorName = creator.username || 
                  creator.githubLogin || 
                  creator.email || 
                  (creator.uid ? `User ${creator.uid.substring(0, 8)}` : 'Unknown');
  }
  
  const commitMessage = meta?.githubCommitMessage || '';
  const branch = meta?.githubCommitRef || '';
  const commitSha = meta?.githubCommitSha ? meta.githubCommitSha.substring(0, 7) : '';
  
  let html = `<div class="deployment-card" data-deployment-uid="${escapeHtml(uid || '')}">`;
  
  // Card header
  html += '<div class="card-header">';
  html += `<div class="deployment-name">${escapeHtml(deploymentName)}</div>`;
  html += `<span class="state-badge ${stateClass}" title="${escapeHtml(deploymentState)}">${escapeHtml(stateText)}</span>`;
  html += '</div>';
  
  // URL and links
  html += '<div class="deployment-urls">';
  if (deploymentUrl) {
    html += `<a href="https://${escapeHtml(deploymentUrl)}" target="_blank" class="deployment-link" rel="noopener noreferrer">`;
    html += `<span class="link-icon">🌐</span> ${escapeHtml(truncate(deploymentUrl, 40))}`;
    html += '</a>';
  }
  if (inspectorUrl) {
    html += `<a href="${escapeHtml(inspectorUrl)}" target="_blank" class="deployment-link inspector-link" rel="noopener noreferrer">`;
    html += '<span class="link-icon">🔍</span> Inspector';
    html += '</a>';
  }
  html += '</div>';
  
  // Metadata
  html += '<div class="deployment-meta">';
  
  // Time
  html += '<div class="meta-item">';
  html += '<span class="meta-label">Deployed:</span>';
  html += `<span class="meta-value" title="${escapeHtml(fullDate)}">${escapeHtml(relativeTime)}</span>`;
  html += '</div>';
  
  // Creator
  html += '<div class="meta-item">';
  html += '<span class="meta-label">By:</span>';
  html += `<span class="meta-value">${escapeHtml(creatorName)}</span>`;
  html += '</div>';
  
  // Source
  if (deploymentSource) {
    html += '<div class="meta-item">';
    html += '<span class="meta-label">Source:</span>';
    html += `<span class="meta-value">${escapeHtml(deploymentSource.toUpperCase())}</span>`;
    html += '</div>';
  }
  
  // Target
  if (deploymentTarget) {
    html += '<div class="meta-item">';
    html += '<span class="meta-label">Target:</span>';
    html += `<span class="meta-value target-production">${escapeHtml(deploymentTarget)}</span>`;
    html += '</div>';
  }
  
  html += '</div>';
  
  // Git info
  if (commitMessage || branch || commitSha) {
    html += '<div class="deployment-git">';
    if (branch) {
      html += `<span class="git-branch">${escapeHtml(branch)}</span>`;
    }
    if (commitSha) {
      html += `<span class="git-sha" title="Commit SHA">${escapeHtml(commitSha)}</span>`;
    }
    if (commitMessage) {
      html += `<div class="git-message" title="${escapeHtml(commitMessage)}">${escapeHtml(truncate(commitMessage, 80))}</div>`;
    }
    html += '</div>';
  }
  
  html += '</div>'; // deployment-card
  
  return html;
}

/**
 * Render deployment detail view
 */
function renderDeploymentDetail(deployment: any): string {
  const {
    uid,
    name,
    url,
    created,
    state,
    readyState,
    source,
    target,
    creator,
    meta,
    inspectorUrl,
    projectId,
    type,
    buildingAt,
    ready,
    aliasAssigned,
    isRollbackCandidate
  } = deployment;
  
  // Safe extraction with fallbacks
  const deploymentName = name || uid || 'Unnamed Deployment';
  const deploymentState = state || 'UNKNOWN';
  const deploymentReadyState = readyState || '';
  const deploymentUrl = url || '';
  const deploymentCreated = created || Date.now();
  const deploymentSource = source || '';
  const deploymentTarget = target || '';
  
  const stateClass = getStateClass(deploymentState, deploymentReadyState);
  const stateText = getStateText(deploymentState, deploymentReadyState);
  const relativeTime = formatRelativeTime(deploymentCreated);
  const fullDate = formatFullDate(deploymentCreated);
  const buildingDate = buildingAt ? formatFullDate(buildingAt) : '';
  const readyDate = ready ? formatFullDate(ready) : '';
  
  // Creator info
  let creatorName = 'Unknown';
  let creatorEmail = '';
  if (creator) {
    creatorName = creator.username || creator.githubLogin || creator.email || 'Unknown';
    creatorEmail = creator.email || '';
  }
  
  // Git info
  const commitMessage = meta?.githubCommitMessage || '';
  const branch = meta?.githubCommitRef || '';
  const commitSha = meta?.githubCommitSha || '';
  const commitAuthor = meta?.githubCommitAuthorName || '';
  const commitAuthorEmail = meta?.githubCommitAuthorEmail || '';
  const commitOrg = meta?.githubOrg || '';
  const commitRepo = meta?.githubRepo || '';
  const commitUrl = commitSha ? `https://github.com/${commitOrg}/${commitRepo}/commit/${commitSha}` : '';
  
  let html = '<div class="deployment-detail">';
  
  // Back button
  html += '<div class="detail-header">';
  html += '<button class="back-button">← Back to Deployments</button>';
  html += '</div>';
  
  // Main detail card
  html += '<div class="detail-card">';
  
  // Title and status
  html += '<div class="detail-title-section">';
  html += `<h1 class="detail-title">${escapeHtml(deploymentName)}</h1>`;
  html += `<span class="state-badge ${stateClass}">${escapeHtml(stateText)}</span>`;
  html += '</div>';
  
  // Quick actions
  html += '<div class="detail-actions">';
  if (deploymentUrl) {
    html += `<a href="https://${escapeHtml(deploymentUrl)}" target="_blank" class="action-button primary" rel="noopener noreferrer">`;
    html += '🌐 Visit Deployment';
    html += '</a>';
  }
  if (inspectorUrl) {
    html += `<a href="${escapeHtml(inspectorUrl)}" target="_blank" class="action-button" rel="noopener noreferrer">`;
    html += '🔍 Open in Vercel';
    html += '</a>';
  }
  html += '</div>';
  
  // Details grid
  html += '<div class="detail-grid">';
  
  // Basic Info
  html += '<div class="detail-section">';
  html += '<h2 class="detail-section-title">Basic Information</h2>';
  html += '<div class="detail-info">';
  html += `<div class="detail-info-item"><span class="info-label">Deployment ID:</span><span class="info-value">${escapeHtml(uid || 'N/A')}</span></div>`;
  html += `<div class="detail-info-item"><span class="info-label">Project ID:</span><span class="info-value">${escapeHtml(projectId || 'N/A')}</span></div>`;
  html += `<div class="detail-info-item"><span class="info-label">Type:</span><span class="info-value">${escapeHtml(type || 'N/A')}</span></div>`;
  html += `<div class="detail-info-item"><span class="info-label">Source:</span><span class="info-value">${escapeHtml(deploymentSource.toUpperCase() || 'N/A')}</span></div>`;
  if (deploymentTarget) {
    html += `<div class="detail-info-item"><span class="info-label">Target:</span><span class="info-value target-production">${escapeHtml(deploymentTarget)}</span></div>`;
  }
  html += '</div>';
  html += '</div>';
  
  // Timeline
  html += '<div class="detail-section">';
  html += '<h2 class="detail-section-title">Timeline</h2>';
  html += '<div class="detail-info">';
  html += `<div class="detail-info-item"><span class="info-label">Created:</span><span class="info-value" title="${escapeHtml(fullDate)}">${escapeHtml(relativeTime)}</span></div>`;
  if (buildingDate) {
    html += `<div class="detail-info-item"><span class="info-label">Building Started:</span><span class="info-value">${escapeHtml(buildingDate)}</span></div>`;
  }
  if (readyDate) {
    html += `<div class="detail-info-item"><span class="info-label">Ready:</span><span class="info-value">${escapeHtml(readyDate)}</span></div>`;
  }
  if (aliasAssigned) {
    html += `<div class="detail-info-item"><span class="info-label">Alias Assigned:</span><span class="info-value">${escapeHtml(formatFullDate(aliasAssigned))}</span></div>`;
  }
  html += '</div>';
  html += '</div>';
  
  // Creator
  html += '<div class="detail-section">';
  html += '<h2 class="detail-section-title">Creator</h2>';
  html += '<div class="detail-info">';
  html += `<div class="detail-info-item"><span class="info-label">Name:</span><span class="info-value">${escapeHtml(creatorName)}</span></div>`;
  if (creatorEmail) {
    html += `<div class="detail-info-item"><span class="info-label">Email:</span><span class="info-value">${escapeHtml(creatorEmail)}</span></div>`;
  }
  html += '</div>';
  html += '</div>';
  
  // Git Information
  if (branch || commitSha || commitMessage) {
    html += '<div class="detail-section">';
    html += '<h2 class="detail-section-title">Git Information</h2>';
    html += '<div class="detail-info">';
    if (branch) {
      html += `<div class="detail-info-item"><span class="info-label">Branch:</span><span class="info-value git-branch">${escapeHtml(branch)}</span></div>`;
    }
    if (commitSha) {
      if (commitUrl) {
        html += `<div class="detail-info-item"><span class="info-label">Commit:</span><span class="info-value"><a href="${escapeHtml(commitUrl)}" target="_blank" class="git-sha-link" rel="noopener noreferrer">${escapeHtml(commitSha.substring(0, 7))}</a></span></div>`;
      } else {
        html += `<div class="detail-info-item"><span class="info-label">Commit:</span><span class="info-value git-sha">${escapeHtml(commitSha.substring(0, 7))}</span></div>`;
      }
    }
    if (commitAuthor) {
      html += `<div class="detail-info-item"><span class="info-label">Author:</span><span class="info-value">${escapeHtml(commitAuthor)}${commitAuthorEmail ? ` (${escapeHtml(commitAuthorEmail)})` : ''}</span></div>`;
    }
    if (commitMessage) {
      html += `<div class="detail-info-item full-width"><span class="info-label">Message:</span><div class="info-value git-message-full">${escapeHtml(commitMessage)}</div></div>`;
    }
    html += '</div>';
    html += '</div>';
  }
  
  // Additional metadata
  if (meta && Object.keys(meta).length > 0) {
    html += '<div class="detail-section">';
    html += '<h2 class="detail-section-title">Additional Metadata</h2>';
    html += '<div class="detail-info">';
    Object.entries(meta).forEach(([key, value]) => {
      if (key !== 'githubCommitMessage' && key !== 'githubCommitRef' && key !== 'githubCommitSha' && key !== 'githubCommitAuthorName' && key !== 'githubCommitAuthorEmail') {
        html += `<div class="detail-info-item"><span class="info-label">${escapeHtml(key)}:</span><span class="info-value">${escapeHtml(String(value || 'N/A'))}</span></div>`;
      }
    });
    html += '</div>';
    html += '</div>';
  }
  
  html += '</div>'; // detail-grid
  html += '</div>'; // detail-card
  html += '</div>'; // deployment-detail
  
  return html;
}

/**
 * Setup detail view handlers
 */
function setupDetailView() {
  // Add click handlers to all deployment cards
  const cards = document.querySelectorAll('.deployment-card');
  cards.forEach(card => {
    card.addEventListener('click', (e) => {
      // Don't trigger if clicking on a link
      if ((e.target as HTMLElement).closest('a')) {
        return;
      }
      const uid = card.getAttribute('data-deployment-uid');
      if (uid) {
        showDeploymentDetails(uid);
      }
    });
  });
  
  // Setup back button handler
  const backButton = document.querySelector('.back-button');
  if (backButton) {
    backButton.addEventListener('click', () => {
      backToList();
    });
  }
  
  // Setup view switcher handlers
  const viewTabs = document.querySelectorAll('.view-tab');
  viewTabs.forEach(tab => {
    tab.addEventListener('click', (e) => {
      const view = (e.target as HTMLElement).textContent?.toLowerCase();
      if (view === 'summary' || view === 'list') {
        switchView(view as 'list' | 'summary');
      }
    });
  });
  
  // Setup recent deployment click handlers
  const recentItems = document.querySelectorAll('.recent-item');
  recentItems.forEach(item => {
    item.addEventListener('click', () => {
      const uid = item.getAttribute('data-deployment-uid');
      if (uid) {
        showDeploymentDetails(uid);
      }
    });
  });
}

/**
 * Show deployment details view
 */
function showDeploymentDetails(uid: string) {
  const deployment = allDeployments.find(d => d.uid === uid);
  if (deployment) {
    selectedDeployment = deployment;
    currentView = 'detail';
    renderData({ body: { deployments: allDeployments, pagination: {} } });
  }
}

/**
 * Go back to list view
 */
function backToList() {
  currentView = 'list';
  selectedDeployment = null;
  renderData({ body: { deployments: allDeployments, pagination: {} } });
}

/**
 * Switch between views
 */
function switchView(view: 'list' | 'summary') {
  currentView = view;
  selectedDeployment = null;
  // Destroy existing charts
  chartInstances.forEach(chart => chart.destroy());
  chartInstances = [];
  renderData({ body: { deployments: allDeployments, pagination: {} } });
}

/**
 * Render summary view with charts
 */
function renderSummaryView(deployments: any[]): string {
  // Calculate statistics
  const stats = calculateStats(deployments);
  const timeSeriesData = calculateTimeSeriesData(deployments);
  
  let html = '<div class="summary-view">';
  
  // Stats cards
  html += '<div class="stats-cards">';
  html += `<div class="stat-card"><div class="stat-value">${stats.total}</div><div class="stat-label">Total Deployments</div></div>`;
  html += `<div class="stat-card"><div class="stat-value">${stats.ready}</div><div class="stat-label">Ready</div></div>`;
  html += `<div class="stat-card"><div class="stat-value">${stats.building}</div><div class="stat-label">Building</div></div>`;
  html += `<div class="stat-card"><div class="stat-value">${stats.errors}</div><div class="stat-label">Errors</div></div>`;
  html += '</div>';
  
  // Charts grid
  html += '<div class="charts-grid">';
  
  // Status distribution chart
  html += '<div class="chart-card">';
  html += '<h2 class="chart-title">Deployment Status</h2>';
  html += '<div class="chart-container"><canvas id="status-chart"></canvas></div>';
  html += '</div>';
  
  // Source distribution chart
  html += '<div class="chart-card">';
  html += '<h2 class="chart-title">Deployment Source</h2>';
  html += '<div class="chart-container"><canvas id="source-chart"></canvas></div>';
  html += '</div>';
  
  // Deployments over time chart
  html += '<div class="chart-card full-width">';
  html += '<h2 class="chart-title">Deployments Over Time</h2>';
  html += '<div class="chart-container"><canvas id="timeline-chart"></canvas></div>';
  html += '</div>';
  
  // Recent activity
  html += '<div class="chart-card full-width">';
  html += '<h2 class="chart-title">Recent Deployments</h2>';
  html += '<div class="recent-deployments">';
  deployments.slice(0, 10).forEach((deployment: any) => {
    const name = deployment.name || deployment.uid || 'Unnamed';
    const state = getStateText(deployment.state || 'UNKNOWN', deployment.readyState || '');
    const time = formatRelativeTime(deployment.created || Date.now());
    const stateClass = getStateClass(deployment.state || 'UNKNOWN', deployment.readyState || '');
    html += `<div class="recent-item" data-deployment-uid="${escapeHtml(deployment.uid || '')}">`;
    html += `<div class="recent-name">${escapeHtml(name)}</div>`;
    html += `<div class="recent-meta">`;
    html += `<span class="state-badge ${stateClass}">${escapeHtml(state)}</span>`;
    html += `<span class="recent-time">${escapeHtml(time)}</span>`;
    html += `</div>`;
    html += `</div>`;
  });
  html += '</div>';
  html += '</div>';
  
  html += '</div>'; // charts-grid
  html += '</div>'; // summary-view
  
  return html;
}

/**
 * Calculate deployment statistics
 */
function calculateStats(deployments: any[]): any {
  const stats = {
    total: deployments.length,
    ready: 0,
    building: 0,
    errors: 0,
    canceled: 0,
    git: 0,
    cli: 0
  };
  
  deployments.forEach((d: any) => {
    if (d.state === 'READY') stats.ready++;
    if (d.state === 'BUILDING' || d.state === 'QUEUED') stats.building++;
    if (d.state === 'ERROR') stats.errors++;
    if (d.state === 'CANCELED') stats.canceled++;
    if (d.source === 'git') stats.git++;
    if (d.source === 'cli') stats.cli++;
  });
  
  return stats;
}

/**
 * Calculate time series data for deployments
 */
function calculateTimeSeriesData(deployments: any[]): any {
  // Group by day
  const byDay: { [key: string]: number } = {};
  const now = Date.now();
  const daysAgo = 7; // Show last 7 days
  
  // Initialize days
  for (let i = daysAgo; i >= 0; i--) {
    const date = new Date(now - i * 24 * 60 * 60 * 1000);
    const key = date.toISOString().split('T')[0];
    byDay[key] = 0;
  }
  
  // Count deployments per day
  deployments.forEach((d: any) => {
    if (d.created) {
      const date = new Date(d.created);
      const key = date.toISOString().split('T')[0];
      if (byDay[key] !== undefined) {
        byDay[key]++;
      }
    }
  });
  
  const labels = Object.keys(byDay).map(key => {
    const date = new Date(key);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  });
  const data = Object.values(byDay);
  
  return { labels, data };
}

/**
 * Setup charts after rendering
 */
function setupCharts(deployments: any[]): void {
  // Destroy existing charts
  chartInstances.forEach(chart => chart.destroy());
  chartInstances = [];
  
  const stats = calculateStats(deployments);
  const timeSeries = calculateTimeSeriesData(deployments);
  const isDark = document.body.classList.contains('dark');
  
  const textColor = isDark ? '#ffffff' : '#000000';
  const gridColor = isDark ? '#333333' : '#eaeaea';
  const backgroundColor = isDark ? '#111111' : '#ffffff';
  
  // Status distribution chart (Doughnut)
  const statusCtx = document.getElementById('status-chart') as HTMLCanvasElement;
  if (statusCtx) {
    const statusChart = new Chart(statusCtx, {
      type: 'doughnut',
      data: {
        labels: ['Ready', 'Building', 'Error', 'Canceled'],
        datasets: [{
          data: [stats.ready, stats.building, stats.errors, stats.canceled],
          backgroundColor: [
            '#10b981',
            '#f5a623',
            '#e00',
            '#666666'
          ],
          borderWidth: 0
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: true,
        plugins: {
          legend: {
            position: 'bottom',
            labels: {
              color: textColor,
              padding: 15,
              font: {
                size: 12,
                family: 'Inter'
              }
            }
          }
        }
      }
    });
    chartInstances.push(statusChart);
  }
  
  // Source distribution chart (Bar)
  const sourceCtx = document.getElementById('source-chart') as HTMLCanvasElement;
  if (sourceCtx) {
    const sourceChart = new Chart(sourceCtx, {
      type: 'bar',
      data: {
        labels: ['Git', 'CLI'],
        datasets: [{
          label: 'Deployments',
          data: [stats.git, stats.cli],
          backgroundColor: '#0070f3',
          borderRadius: 6
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: true,
        plugins: {
          legend: {
            display: false
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              color: textColor,
              stepSize: 1
            },
            grid: {
              color: gridColor
            }
          },
          x: {
            ticks: {
              color: textColor
            },
            grid: {
              display: false
            }
          }
        }
      }
    });
    chartInstances.push(sourceChart);
  }
  
  // Timeline chart (Line)
  const timelineCtx = document.getElementById('timeline-chart') as HTMLCanvasElement;
  if (timelineCtx) {
    const timelineChart = new Chart(timelineCtx, {
      type: 'line',
      data: {
        labels: timeSeries.labels,
        datasets: [{
          label: 'Deployments',
          data: timeSeries.data,
          borderColor: '#0070f3',
          backgroundColor: isDark ? 'rgba(0, 112, 243, 0.1)' : 'rgba(0, 112, 243, 0.05)',
          fill: true,
          tension: 0.4,
          pointRadius: 4,
          pointHoverRadius: 6
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: true,
        plugins: {
          legend: {
            display: false
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              color: textColor,
              stepSize: 1
            },
            grid: {
              color: gridColor
            }
          },
          x: {
            ticks: {
              color: textColor
            },
            grid: {
              color: gridColor
            }
          }
        }
      }
    });
    chartInstances.push(timelineChart);
  }
}

// Make functions globally accessible
(window as any).showDeploymentDetails = showDeploymentDetails;
(window as any).backToList = backToList;
(window as any).switchView = switchView;

/**
 * Setup filter functionality
 */
function setupFilters() {
  const stateFilter = document.getElementById('state-filter') as HTMLSelectElement;
  const sourceFilter = document.getElementById('source-filter') as HTMLSelectElement;
  const sortFilter = document.getElementById('sort-filter') as HTMLSelectElement;
  const deploymentsList = document.getElementById('deployments-list');
  const resultCount = document.getElementById('result-count');
  
  function applyFilters() {
    const stateValue = stateFilter?.value || '';
    const sourceValue = sourceFilter?.value || '';
    const sortValue = sortFilter?.value || 'newest';
    
    // Filter deployments
    filteredDeployments = allDeployments.filter((deployment: any) => {
      // State filter
      if (stateValue && deployment.state !== stateValue) return false;
      
      // Source filter
      if (sourceValue && deployment.source !== sourceValue) return false;
      
      return true;
    });
    
    // Sort deployments
    if (sortValue === 'newest') {
      filteredDeployments.sort((a, b) => b.created - a.created);
    } else {
      filteredDeployments.sort((a, b) => a.created - b.created);
    }
    
    // Update result count
    if (resultCount) {
      resultCount.textContent = String(filteredDeployments.length);
    }
    
    // Re-render deployments
    if (deploymentsList) {
      deploymentsList.innerHTML = filteredDeployments.map(d => renderDeployment(d)).join('');
    }
    
    // Notify size change
    setTimeout(() => {
      notifySizeChanged();
    }, 50);
  }
  
  // Event listeners
  if (stateFilter) {
    stateFilter.addEventListener('change', applyFilters);
  }
  
  if (sourceFilter) {
    sourceFilter.addEventListener('change', applyFilters);
  }
  
  if (sortFilter) {
    sortFilter.addEventListener('change', applyFilters);
  }
}

/* ============================================
   MESSAGE HANDLER (Standardized MCP Protocol)
   ============================================
   
   This handles all incoming messages from the MCP host.
   You typically don't need to modify this section.
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
    
    // - Cancel any pending requests (if you track them)
    // - Destroy chart instances, etc. (template-specific cleanup)
    
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
      // You may want to add logic here to re-render your content with new theme
      break;
      
    case 'ui/notifications/tool-input':
      // Tool input notification - Host MUST send this with complete tool arguments
      const toolArguments = msg.params?.arguments;
      if (toolArguments) {
        // Store tool arguments for reference (may be needed for context)
        // Template-specific: You can use this for initial rendering or context
        console.log('Tool input received:', toolArguments);
        // Example: Show loading state with input parameters
        // Example: Store for later use in renderData()
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
   ============================================
   
   Functions for communicating with the MCP host.
   You typically don't need to modify this section.
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
   ============================================
   
   Handles switching between inline and fullscreen display modes.
   You may want to customize handleDisplayModeChange() to adjust
   your layout for fullscreen mode.
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
   ============================================
   
   Notifies the host when the content size changes.
   This is critical for proper iframe sizing.
   You typically don't need to modify this section.
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
   ============================================
   
   Initializes the MCP app and sets up all required features.
   You typically don't need to modify this section.
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
