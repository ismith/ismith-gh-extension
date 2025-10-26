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

// Add custom filter dropdown
function addCustomFilterDropdown() {
  // Check if dropdown already exists
  if (document.querySelector('.gh-extension-filter-dropdown')) {
    console.log('GitHub Issue & PR Manager: Dropdown already exists');
    return;
  }

  // Find the Author filter button
  const authorButton = document.querySelector('[data-testid="authors-anchor-button"], button[aria-label*="author" i]');

  if (!authorButton) {
    console.log('GitHub Issue & PR Manager: Author button not found');
    return;
  }

  console.log('GitHub Issue & PR Manager: Author button found:', authorButton);

  // Get the parent container (the filter bar)
  const container = authorButton.parentElement;

  if (!container) {
    console.log('GitHub Issue & PR Manager: Could not find filter bar container');
    return;
  }

  console.log('GitHub Issue & PR Manager: Filter bar container found:', container);

  // Insert dropdown before the Author button
  insertDropdown(container, authorButton);
}

function insertDropdown(container: Element | null, insertBefore: Element | null) {
  if (!container) {
    console.log('GitHub Issue & PR Manager: No container for dropdown');
    return;
  }

  // Create the custom filter dropdown matching GitHub's style
  const dropdown = document.createElement('div');
  dropdown.className = 'gh-extension-filter-dropdown';
  dropdown.style.display = 'inline-block';
  dropdown.style.marginRight = '8px';

  dropdown.innerHTML = `
    <details class="details-reset details-overlay">
      <summary role="button" aria-label="Custom filters" class="prc-Button-ButtonBase-c50BI" data-loading="false" data-size="medium" data-variant="invisible">
        <span data-component="buttonContent" data-align="center" class="prc-Button-ButtonContent-HKbr-">
          <span data-component="text" class="prc-Button-Label-pTQ3x">Custom filters</span>
          <span data-component="trailingVisual" class="prc-Button-Visual-2epfX prc-Button-VisualWrap-Db-eB">
            <svg aria-hidden="true" focusable="false" class="octicon octicon-triangle-down" viewBox="0 0 16 16" width="16" height="16" fill="currentColor" style="vertical-align: text-bottom;">
              <path d="m4.427 7.427 3.396 3.396a.25.25 0 0 0 .354 0l3.396-3.396A.25.25 0 0 0 11.396 7H4.604a.25.25 0 0 0-.177.427Z"></path>
            </svg>
          </span>
        </span>
      </summary>
      <details-menu class="SelectMenu-modal">
        <div class="SelectMenu-list">
          <button class="SelectMenu-item" role="menuitem" data-filter-type="my-prs">
            <span class="SelectMenu-item-text">My PRs</span>
          </button>
          <button class="SelectMenu-item" role="menuitem" data-filter-type="my-issues">
            <span class="SelectMenu-item-text">My Issues</span>
          </button>
          <button class="SelectMenu-item" role="menuitem" data-filter-type="prs-to-review">
            <span class="SelectMenu-item-text">PRs to Review</span>
          </button>
          <button class="SelectMenu-item" role="menuitem" data-filter-type="prs-im-reviewing">
            <span class="SelectMenu-item-text">PRs I'm Reviewing</span>
          </button>
        </div>
      </details-menu>
    </details>
  `;

  // Add click handlers for each filter option
  const buttons = dropdown.querySelectorAll('button[data-filter-type]');
  const detailsElement = dropdown.querySelector('details');

  buttons.forEach(button => {
    button.addEventListener('click', (e) => {
      e.preventDefault();
      const filterType = (button as HTMLElement).dataset.filterType;
      applyCustomFilter(filterType!);
      if (detailsElement) {
        detailsElement.removeAttribute('open');
      }
    });
  });

  // Insert the dropdown
  if (insertBefore) {
    container.insertBefore(dropdown, insertBefore);
  } else {
    container.insertBefore(dropdown, container.firstChild);
  }
  console.log('GitHub Issue & PR Manager: Custom filter dropdown added');
}

// Apply custom filter based on type
function applyCustomFilter(filterType: string) {
  let filterQuery = '';

  switch (filterType) {
    case 'my-prs':
      filterQuery = 'is:pr is:open (author:@me OR (author:app/copilot-swe-agent assignee:@me))';
      break;
    case 'my-issues':
      filterQuery = 'is:issue is:open ((author:@me no:assignee) OR assignee:@me)';
      break;
    case 'prs-to-review':
      filterQuery = 'is:pr is:open (-author:@me (-author:app/copilot-swe-agent -assignee:@me)) draft:false review:none';
      break;
    case 'prs-im-reviewing':
      filterQuery = 'is:pr is:open (commenter:@me OR reviewed-by:@me)';
      break;
  }

  // If we're on /pulls, redirect to /issues for full search support
  const isOnPulls = window.location.pathname.includes('/pulls');
  const targetPath = isOnPulls ? window.location.pathname.replace('/pulls', '/issues') : window.location.pathname;

  // Navigate with the new query (replace existing query)
  const newUrl = `${window.location.origin}${targetPath}?q=${encodeURIComponent(filterQuery)}`;
  window.location.href = newUrl;
}

// Main initialization
function init() {
  // Always add header badge (on all GitHub pages)
  addHeaderBadge();

  if (!isIssuesOrPullsPage()) {
    return;
  }

  console.log('GitHub Issue & PR Manager: Page detected');

  // Add custom filter dropdown on issues/pulls pages with retry
  addCustomFilterDropdown();

  // Retry with delays in case DOM isn't ready
  setTimeout(() => addCustomFilterDropdown(), 500);
  setTimeout(() => addCustomFilterDropdown(), 1000);
  setTimeout(() => addCustomFilterDropdown(), 2000);

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
