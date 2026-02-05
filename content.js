// LinkedIn Connection Request Tracker - Content Script

class ConnectionRequestTracker {
  constructor() {
    this.STORAGE_KEY = 'linkedin_connection_requests';
    this.WEEKLY_LIMIT = 100;
    this.initTracker();
  }

  // Initialize the tracker
  async initTracker() {
    await this.createFloatingCounter();
    await this.updateCounter();
    this.observeConnectionRequests();
    this.setupMessageListener();
  }

  // Create floating counter UI
  async createFloatingCounter() {
    // Remove existing counter if present
    const existing = document.getElementById('linkedin-request-counter');
    if (existing) existing.remove();

    const counter = document.createElement('div');
    counter.id = 'linkedin-request-counter';
    counter.className = 'linkedin-counter-widget';
    
    const count = await this.getWeeklyCount();
    const percentage = (count / this.WEEKLY_LIMIT) * 100;
    const status = this.getStatusClass(percentage);
    
    counter.innerHTML = `
      <div class="counter-header">
        <span class="counter-title">Connection Requests</span>
        <button class="counter-toggle" id="counter-toggle-btn">−</button>
      </div>
      <div class="counter-body" id="counter-body">
        <div class="counter-main">
          <div class="counter-number" id="counter-number">${count}</div>
          <div class="counter-limit">/ ${this.WEEKLY_LIMIT}</div>
        </div>
        <div class="progress-bar">
          <div class="progress-fill ${status}" id="progress-fill" style="width: ${percentage}%"></div>
        </div>
        <div class="counter-info">
          <div class="info-item">
            <span class="info-label">This Week:</span>
            <span class="info-value" id="week-count">${count}</span>
          </div>
          <div class="info-item">
            <span class="info-label">Remaining:</span>
            <span class="info-value" id="remaining-count">${this.WEEKLY_LIMIT - count}</span>
          </div>
          <div class="info-item">
            <span class="info-label">Status:</span>
            <span class="info-value ${status}" id="status-text">${this.getStatusText(percentage)}</span>
          </div>
        </div>
      </div>
    `;
    
    document.body.appendChild(counter);
    
    // Setup event listeners
    this.setupCounterEvents();
  }

  // Setup counter events
  setupCounterEvents() {
    const toggleBtn = document.getElementById('counter-toggle-btn');
    const counterBody = document.getElementById('counter-body');
    
    if (toggleBtn) {
      toggleBtn.addEventListener('click', () => {
        counterBody.style.display = counterBody.style.display === 'none' ? 'block' : 'none';
        toggleBtn.textContent = counterBody.style.display === 'none' ? '+' : '−';
      });
    }
  }

  // Get status class based on percentage
  getStatusClass(percentage) {
    if (percentage >= 90) return 'danger';
    if (percentage >= 70) return 'warning';
    return 'safe';
  }

  // Get status text
  getStatusText(percentage) {
    if (percentage >= 100) return 'LIMIT REACHED!';
    if (percentage >= 90) return 'Critical';
    if (percentage >= 70) return 'Warning';
    return 'Safe';
  }

  // Observe for connection request buttons being clicked
  observeConnectionRequests() {
    // Monitor clicks on Connect buttons
    document.addEventListener('click', async (e) => {
      const target = e.target;
      
      // Check if it's a Connect button
      if (this.isConnectButton(target)) {
        console.log('Connect button clicked');
        // Wait a bit for LinkedIn to process
        setTimeout(async () => {
          await this.incrementCounter();
        }, 1000);
      }
      
      // Check for "Send" button in connection modal (with note)
      if (this.isSendButton(target)) {
        console.log('Send button clicked in modal');
        setTimeout(async () => {
          await this.incrementCounter();
        }, 1000);
      }
    }, true);

    // Also observe DOM changes for dynamically loaded content
    const observer = new MutationObserver((mutations) => {
      // Check if counter still exists, if not recreate
      if (!document.getElementById('linkedin-request-counter')) {
        this.createFloatingCounter();
      }
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
  }

  // Check if element is a Connect button
  isConnectButton(element) {
    if (!element) return false;
    
    const text = element.textContent?.trim().toLowerCase();
    const ariaLabel = element.getAttribute('aria-label')?.toLowerCase();
    
    // Check for Connect button patterns
    return (
      (text === 'connect' || ariaLabel?.includes('connect')) &&
      !ariaLabel?.includes('pending') &&
      !text?.includes('pending')
    );
  }

  // Check if element is a Send button in modal
  isSendButton(element) {
    if (!element) return false;
    
    const text = element.textContent?.trim().toLowerCase();
    const ariaLabel = element.getAttribute('aria-label')?.toLowerCase();
    
    // Check for Send button in connection modal
    return (
      (text === 'send' || text === 'send without a note') &&
      (ariaLabel?.includes('send') || element.closest('[role="dialog"]'))
    );
  }

  // Increment counter
  async incrementCounter() {
    const requests = await this.getStoredRequests();
    const now = Date.now();
    
    // Add new request
    requests.push(now);
    
    // Clean old requests (older than 7 days)
    const cleanedRequests = this.cleanOldRequests(requests);
    
    // Save to storage
    await this.saveRequests(cleanedRequests);
    
    // Update UI
    await this.updateCounter();
    
    // Check limit
    const count = cleanedRequests.length;
    if (count >= this.WEEKLY_LIMIT) {
      this.showLimitAlert();
    } else if (count >= this.WEEKLY_LIMIT * 0.9) {
      this.showWarningAlert(count);
    }
  }

  // Get stored requests
  async getStoredRequests() {
    return new Promise((resolve) => {
      chrome.storage.local.get([this.STORAGE_KEY], (result) => {
        resolve(result[this.STORAGE_KEY] || []);
      });
    });
  }

  // Save requests
  async saveRequests(requests) {
    return new Promise((resolve) => {
      chrome.storage.local.set({ [this.STORAGE_KEY]: requests }, resolve);
    });
  }

  // Clean old requests (older than 7 days)
  cleanOldRequests(requests) {
    const sevenDaysAgo = Date.now() - (7 * 24 * 60 * 60 * 1000);
    return requests.filter(timestamp => timestamp > sevenDaysAgo);
  }

  // Get weekly count
  async getWeeklyCount() {
    const requests = await this.getStoredRequests();
    const cleanedRequests = this.cleanOldRequests(requests);
    return cleanedRequests.length;
  }

  // Update counter UI
  async updateCounter() {
    const count = await this.getWeeklyCount();
    const percentage = (count / this.WEEKLY_LIMIT) * 100;
    const status = this.getStatusClass(percentage);
    
    const counterNumber = document.getElementById('counter-number');
    const progressFill = document.getElementById('progress-fill');
    const weekCount = document.getElementById('week-count');
    const remainingCount = document.getElementById('remaining-count');
    const statusText = document.getElementById('status-text');
    
    if (counterNumber) counterNumber.textContent = count;
    if (weekCount) weekCount.textContent = count;
    if (remainingCount) remainingCount.textContent = this.WEEKLY_LIMIT - count;
    
    if (progressFill) {
      progressFill.style.width = `${percentage}%`;
      progressFill.className = `progress-fill ${status}`;
    }
    
    if (statusText) {
      statusText.textContent = this.getStatusText(percentage);
      statusText.className = `info-value ${status}`;
    }

    // Update badge
    chrome.runtime.sendMessage({ 
      action: 'updateBadge', 
      count: count 
    });
  }

  // Reset counter
  async resetCounter() {
    await this.saveRequests([]);
    await this.updateCounter();
    alert('Counter has been reset!');
  }

  // Show limit alert
  showLimitAlert() {
    const alertDiv = document.createElement('div');
    alertDiv.className = 'linkedin-limit-alert danger';
    alertDiv.innerHTML = `
      <strong>⚠️ LIMIT REACHED!</strong><br>
      You've sent 100 connection requests this week. Consider upgrading to Premium or wait until next week.
    `;
    document.body.appendChild(alertDiv);
    
    setTimeout(() => alertDiv.remove(), 5000);
  }

  // Show warning alert
  showWarningAlert(count) {
    const remaining = this.WEEKLY_LIMIT - count;
    const alertDiv = document.createElement('div');
    alertDiv.className = 'linkedin-limit-alert warning';
    alertDiv.innerHTML = `
      <strong>⚠️ Warning!</strong><br>
      You have only ${remaining} connection requests remaining this week.
    `;
    document.body.appendChild(alertDiv);
    
    setTimeout(() => alertDiv.remove(), 4000);
  }

  // Setup message listener
  setupMessageListener() {
    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
      if (request.action === 'getCount') {
        this.getWeeklyCount().then(count => {
          sendResponse({ count: count });
        });
        return true; // Keep channel open for async response
      }
    });
  }
}

// Initialize tracker when page loads
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    new ConnectionRequestTracker();
  });
} else {
  new ConnectionRequestTracker();
}
