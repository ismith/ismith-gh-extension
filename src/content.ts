// Content script for GitHub issue and PR pages

console.log('GitHub Issue & PR Manager content script loaded');

// Check if we're on an issues or pulls page
function isIssuesOrPullsPage(): boolean {
  return window.location.pathname.includes('/issues') ||
         window.location.pathname.includes('/pulls');
}

// Main initialization
function init() {
  if (!isIssuesOrPullsPage()) {
    return;
  }

  console.log('GitHub Issue & PR Manager: Page detected');

  // TODO: Add custom filter dropdown
  // TODO: Add visual annotations to issues/PRs
}

// Run on page load
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}

// Watch for navigation changes (GitHub uses AJAX navigation)
let lastUrl = location.href;
new MutationObserver(() => {
  const url = location.href;
  if (url !== lastUrl) {
    lastUrl = url;
    init();
  }
}).observe(document, { subtree: true, childList: true });
