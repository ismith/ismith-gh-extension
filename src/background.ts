// Background service worker for the GitHub extension

chrome.runtime.onInstalled.addListener(() => {
  console.log('GitHub Issue & PR Manager extension installed');
});

// Handle messages from content scripts if needed
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log('Message received in background:', request);
  sendResponse({ received: true });
  return true;
});
