// Background service worker for LinkedIn Connection Request Tracker

// Listen for messages from content script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'updateBadge') {
    updateBadge(request.count);
  }
});

// Update extension badge with current count
function updateBadge(count) {
  const text = count > 99 ? '99+' : count.toString();
  const color = count >= 100 ? '#004d40' : 
                count >= 90 ? '#00695c' : 
                count >= 70 ? '#00897b' : '#00897b';
  
  chrome.action.setBadgeText({ text: text });
  chrome.action.setBadgeBackgroundColor({ color: color });
}

// Initialize badge on install
chrome.runtime.onInstalled.addListener(() => {
  chrome.action.setBadgeText({ text: '0' });
  chrome.action.setBadgeBackgroundColor({ color: '#00897b' });
});

// Update badge when extension icon is clicked
chrome.action.onClicked.addListener((tab) => {
  // This won't fire if popup is defined, but keeping for reference
  if (tab.url.includes('linkedin.com')) {
    chrome.tabs.sendMessage(tab.id, { action: 'getCount' });
  }
});
