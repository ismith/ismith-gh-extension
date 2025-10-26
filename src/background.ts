// Background service worker for the GitHub extension

chrome.runtime.onInstalled.addListener(() => {
  console.log('GitHub Issue & PR Manager extension installed');
});

// Handle messages from content scripts
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === 'open-popup') {
    // Open the popup programmatically
    chrome.action.openPopup();
  }
  sendResponse({ received: true });
  return true;
});
