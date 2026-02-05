// Popup script for LinkedIn Connection Request Tracker

const STORAGE_KEY = 'linkedin_connection_requests';
const WEEKLY_LIMIT = 100;

// Initialize popup
document.addEventListener('DOMContentLoaded', async () => {
  await loadStats();
  setupEventListeners();
});

// Load and display stats
async function loadStats() {
  try {
    const requests = await getStoredRequests();
    const cleanedRequests = cleanOldRequests(requests);
    const count = cleanedRequests.length;
    const remaining = WEEKLY_LIMIT - count;
    const percentage = (count / WEEKLY_LIMIT) * 100;
    const status = getStatus(percentage);

    displayStats(count, remaining, percentage, status, cleanedRequests);
  } catch (error) {
    console.error('Error loading stats:', error);
    showError();
  }
}

// Display statistics
function displayStats(count, remaining, percentage, status, requests) {
  const content = document.getElementById('content');
  
  content.innerHTML = `
    <div class="stats-card">
      <div class="main-counter">
        <div class="counter-display">${count}</div>
        <div class="counter-label">Requests This Week</div>
      </div>
      
      <div class="progress-container">
        <div class="progress-bar progress-${status.class}" style="width: ${Math.min(percentage, 100)}%">
          ${percentage.toFixed(0)}%
        </div>
      </div>

      <div class="info-grid">
        <div class="info-item">
          <span class="info-value">${remaining}</span>
          <span class="info-label">Remaining</span>
        </div>
        <div class="info-item">
          <span class="info-value">${WEEKLY_LIMIT}</span>
          <span class="info-label">Weekly Limit</span>
        </div>
      </div>

      <div style="text-align: center; margin-bottom: 15px;">
        <span class="status-badge status-${status.class}">${status.text}</span>
      </div>

      <div class="button-group">
        <button class="btn-primary" id="refreshBtn">🔄 Refresh</button>
      </div>
    </div>

    <div class="history-section">
      <div class="history-title">Recent Activity (Last 7 Days)</div>
      <div class="history-list" id="historyList">
        ${generateHistoryHTML(requests)}
      </div>
    </div>

    <div class="footer">
      <p>Track your connection requests • Stay within limits</p>
    </div>
  `;
}

// Generate history HTML
function generateHistoryHTML(requests) {
  if (requests.length === 0) {
    return '<div style="text-align: center; padding: 20px; opacity: 0.6;">No requests sent yet</div>';
  }

  // Group by day
  const grouped = groupByDay(requests);
  
  return Object.entries(grouped)
    .sort((a, b) => b[0] - a[0])
    .map(([date, count]) => {
      const dateStr = formatDate(parseInt(date));
      return `<div class="history-item">
        <strong>${dateStr}</strong>: ${count} request${count > 1 ? 's' : ''}
      </div>`;
    })
    .join('');
}

// Group requests by day
function groupByDay(requests) {
  const groups = {};
  
  requests.forEach(timestamp => {
    const date = new Date(timestamp);
    const dayStart = new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
    
    groups[dayStart] = (groups[dayStart] || 0) + 1;
  });
  
  return groups;
}

// Format date
function formatDate(timestamp) {
  const date = new Date(timestamp);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  
  if (date.toDateString() === today.toDateString()) {
    return 'Today';
  } else if (date.toDateString() === yesterday.toDateString()) {
    return 'Yesterday';
  } else {
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  }
}

// Get status
function getStatus(percentage) {
  if (percentage >= 100) {
    return { class: 'danger', text: 'Limit Reached!' };
  } else if (percentage >= 90) {
    return { class: 'danger', text: 'Critical' };
  } else if (percentage >= 70) {
    return { class: 'warning', text: 'Warning' };
  } else {
    return { class: 'safe', text: 'Safe' };
  }
}

// Setup event listeners
function setupEventListeners() {
  document.addEventListener('click', async (e) => {
    if (e.target.id === 'refreshBtn') {
      await loadStats();
    }
  });
}

// Get stored requests
async function getStoredRequests() {
  return new Promise((resolve) => {
    chrome.storage.local.get([STORAGE_KEY], (result) => {
      resolve(result[STORAGE_KEY] || []);
    });
  });
}

// Clean old requests
function cleanOldRequests(requests) {
  const sevenDaysAgo = Date.now() - (7 * 24 * 60 * 60 * 1000);
  return requests.filter(timestamp => timestamp > sevenDaysAgo);
}

// Reset counter
async function resetCounter() {
  await chrome.storage.local.set({ [STORAGE_KEY]: [] });
  await loadStats();
}

// Show error
function showError() {
  const content = document.getElementById('content');
  content.innerHTML = `
    <div style="text-align: center; padding: 40px;">
      <div style="font-size: 40px; margin-bottom: 10px;">⚠️</div>
      <div>Error loading data</div>
      <button class="btn-primary" style="margin-top: 20px;" onclick="location.reload()">Retry</button>
    </div>
  `;
}
