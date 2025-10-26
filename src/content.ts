// Content script for GitHub issue and PR pages

console.log('GitHub Issue & PR Manager content script loaded');

// Check if we're on an issues or pulls page
function isIssuesOrPullsPage(): boolean {
  return window.location.pathname.includes('/issues') ||
         window.location.pathname.includes('/pulls');
}

// Add extension icon badge to GitHub header
function addHeaderBadge() {
  // Check if badge already exists
  if (document.querySelector('.gh-extension-badge')) {
    return;
  }

  // Find the user avatar in the header
  const avatar = document.querySelector('header [data-target="react-app.embeddedData"] img.avatar, header .AppHeader-user img.avatar');
  if (!avatar) {
    console.log('GitHub Issue & PR Manager: Avatar not found yet');
    return;
  }

  // Get the parent container
  const avatarContainer = avatar.closest('summary, a, button');
  if (!avatarContainer) {
    return;
  }

  // Create the badge element
  const badge = document.createElement('div');
  badge.className = 'gh-extension-badge';
  badge.style.cursor = 'pointer';
  badge.title = 'GitHub Issue & PR Manager';

  // Match the avatar size (GitHub avatars in header are typically 32x32)
  const avatarSize = (avatar as HTMLImageElement).width || 32;
  const iconUrl = chrome.runtime.getURL('icons/icon48.png');
  badge.innerHTML = `<img src="${iconUrl}" alt="Extension" style="width: ${avatarSize}px; height: ${avatarSize}px; vertical-align: middle; border-radius: 50%;">`;

  // Add click handler
  badge.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();
    // TODO: Add click action (open popup or trigger feature)
    console.log('Extension badge clicked!');
  });

  // Insert before the avatar container
  avatarContainer.parentElement?.insertBefore(badge, avatarContainer);
  console.log('GitHub Issue & PR Manager: Header badge added');
}

// Main initialization
function init() {
  // Always add header badge (on all GitHub pages)
  addHeaderBadge();

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
