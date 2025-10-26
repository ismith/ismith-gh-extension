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

// Display active filter label below search box
function showActiveFilterLabel() {
  // Remove any existing label first
  const existingLabel = document.querySelector('.gh-extension-active-filter-label');
  if (existingLabel) {
    existingLabel.remove();
  }

  // Get the current search query
  const currentUrl = new URL(window.location.href);
  const currentQuery = currentUrl.searchParams.get('q') || '';

  // Map queries to filter names
  const filterMap: { [key: string]: string } = {
    'is:pr is:open (author:@me OR (author:app/copilot-swe-agent assignee:@me))': 'My PRs',
    'is:issue is:open ((author:@me no:assignee) OR assignee:@me)': 'My Issues',
    'is:pr is:open (-author:@me (-author:app/copilot-swe-agent -assignee:@me)) draft:false review:none': 'PRs to Review',
    'is:pr is:open (commenter:@me OR reviewed-by:@me)': "PRs I'm Reviewing"
  };

  const filterName = filterMap[currentQuery];

  // Find the repository div
  const repositoryDiv = document.querySelector('#repository');
  if (!repositoryDiv) {
    console.log('GitHub Issue & PR Manager: #repository div not found');
    return;
  }

  // Go two levels up from #repository
  const grandparent = repositoryDiv.parentElement?.parentElement;
  if (!grandparent || !grandparent.parentElement) {
    console.log('GitHub Issue & PR Manager: Could not find grandparent container');
    return;
  }

  // Create the label (empty or with text)
  const label = document.createElement('div');
  label.className = 'gh-extension-active-filter-label';

  if (filterName) {
    label.textContent = `Active filter: ${filterName}`;
    console.log('GitHub Issue & PR Manager: Active filter label added:', filterName);
  } else {
    // Empty placeholder to maintain consistent spacing
    label.innerHTML = '&nbsp;';
    console.log('GitHub Issue & PR Manager: Empty filter label placeholder added');
  }

  // Insert right after the grandparent div
  grandparent.parentElement.insertBefore(label, grandparent.nextElementSibling);
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

  // Show active filter label if applicable
  showActiveFilterLabel();
  setTimeout(() => showActiveFilterLabel(), 500);
  setTimeout(() => showActiveFilterLabel(), 1000);

  // Add visual annotations to issues/PRs
  annotateIssuesAndPRs();
  setTimeout(() => annotateIssuesAndPRs(), 500);
  setTimeout(() => annotateIssuesAndPRs(), 1000);
  setTimeout(() => annotateIssuesAndPRs(), 2000);
}

// Annotate PR/Issue list items with visual indicators
async function annotateIssuesAndPRs() {
  // Find all PR/Issue title links
  // /pulls pages use data-hovercard-type, /issues pages use data-testid="issue-pr-title-link"
  const titleLinks = document.querySelectorAll('a[data-hovercard-type="pull_request"], a[data-hovercard-type="issue"], a[data-testid="issue-pr-title-link"]');

  if (titleLinks.length === 0) {
    console.log('GitHub Issue & PR Manager: No PR/Issue list items found');
    return;
  }

  console.log(`GitHub Issue & PR Manager: Found ${titleLinks.length} items to annotate`);

  const annotations: Array<{title: string, id: string, annotation: string}> = [];

  titleLinks.forEach(async (link) => {
    const titleElement = link as HTMLElement;

    // Find the list item container - go up to find the row
    // The link itself might have an id like "issue_2259_link", but we need the parent row
    // Try multiple selectors based on different GitHub page layouts

    // First try: li[role="listitem"] (used on /issues pages)
    let listItem = titleElement.closest('li[role="listitem"]') as HTMLElement;

    // Second try: .js-issue-row (used on some /pulls pages)
    if (!listItem) {
      listItem = titleElement.closest('.js-issue-row') as HTMLElement;
    }

    // Third try: .Box-row
    if (!listItem) {
      listItem = titleElement.closest('.Box-row') as HTMLElement;
    }

    if (!listItem) {
      // Look for a div with id starting with "issue_" or "pull_request_" but NOT ending with "_link"
      let current = titleElement.parentElement;
      while (current) {
        const id = current.id || '';
        if ((id.startsWith('issue_') || id.startsWith('pull_request_')) && !id.endsWith('_link')) {
          listItem = current as HTMLElement;
          break;
        }
        current = current.parentElement;
      }
    }

    // As a last resort, go up several levels from the title
    if (!listItem) {
      listItem = (titleElement.parentElement?.parentElement?.parentElement) as HTMLElement;
    }

    if (!listItem) {
      console.log('GitHub Issue & PR Manager: Could not find list item container for', titleElement);
      return;
    }

    // Skip if already annotated
    if (listItem.classList.contains('gh-extension-annotated')) {
      return;
    }
    listItem.classList.add('gh-extension-annotated');

    // Get title and ID for logging
    const title = titleElement.textContent?.trim() || 'Unknown';
    const href = titleElement.getAttribute('href') || '';
    const idMatch = href.match(/\/pull\/(\d+)|\/issues\/(\d+)/);
    const id = idMatch ? (idMatch[1] || idMatch[2]) : 'Unknown';

    // Get PR/Issue metadata - search within the list item container
    const isDraft = checkIfDraft(listItem);
    const isMine = checkIfMine(listItem);


    // Find the container to apply styling to
    // The Box-row might not show borders well, so let's target the inner content div
    let targetElement: HTMLElement = listItem;

    // Look for the main content area inside the Box-row (usually the first child div)
    const innerDiv = listItem.querySelector('.d-flex.Box-row--drag-hide') as HTMLElement;
    if (innerDiv) {
      targetElement = innerDiv;
    }

    // For drafts, keep the same logic but applied to the better target
    if (isDraft) {
      const draftIcon = listItem.querySelector('span[aria-label="Draft Pull Request"]');
      if (draftIcon) {
        const container = draftIcon.parentElement?.parentElement;
        if (container) {
          targetElement = container as HTMLElement;
        }
      }
    }

    // Apply annotations
    let annotation = 'none';
    if (isMine) {
      // Blue border for "mine" - takes precedence
      targetElement.classList.add('gh-extension-mine');
      annotation = 'mine (blue)';
    } else if (isDraft) {
      // Grey out drafts not authored by me
      targetElement.classList.add('gh-extension-draft');
      annotation = 'draft (muted)';
    }

    annotations.push({ title, id, annotation });

    // Check for comments/reviews/mentions via hovercard and add borders
    // Do this asynchronously to avoid blocking
    checkForInteractions(titleElement, listItem, targetElement, getCurrentUser()).then(interaction => {
      if (interaction === 'reviewed' && !isMine) {
        // Add green border for reviewed PRs (unless it's mine, blue takes precedence)
        targetElement.classList.add('gh-extension-reviewed');
      } else if (interaction === 'mentioned' && !isMine) {
        // Add orange border for mentioned PRs (lowest precedence)
        targetElement.classList.add('gh-extension-mentioned');
      }
    });
  });

  // Log all annotations in a table
  if (annotations.length > 0) {
    console.table(annotations);
  }
}

// Check if user has interacted with a PR (reviewed, commented, or been mentioned)
// Returns: 'reviewed' for reviews/comments, 'mentioned' for mentions, null for no interaction
async function checkForInteractions(titleElement: HTMLElement, listItem: HTMLElement, targetElement: HTMLElement, currentUser: string | null): Promise<'reviewed' | 'mentioned' | null> {
  if (!currentUser) {
    return null;
  }

  // Get the hovercard URL from the title element
  const hovercardUrl = titleElement.getAttribute('data-hovercard-url');
  if (!hovercardUrl) {
    return null;
  }

  try {
    // Fetch the hovercard - it already contains review/comment/mention info
    const response = await fetch(hovercardUrl, {
      headers: {
        'Accept': 'text/html',
        'X-Requested-With': 'XMLHttpRequest'
      }
    });

    if (response.ok) {
      const html = await response.text();

      // Check if the hovercard contains indicators that the user has interacted with the PR
      // Look for "You" combined with key phrases indicating participation
      const hasYou = html.includes('You');

      // Check for review/comment interactions (higher precedence)
      const hasReviewInteraction = html.includes('are assigned to') ||
                                   html.includes('commented on') ||
                                   html.includes('left a review') ||
                                   html.includes('reviewed') ||
                                   html.includes('approved');

      if (hasYou && hasReviewInteraction) {
        console.log(`Found review/comment indicator in hovercard for ${hovercardUrl}`);
        return 'reviewed';
      }

      // Check for mentions (lower precedence)
      const hasMention = html.includes('mentioned');

      if (hasYou && hasMention) {
        console.log(`Found mention indicator in hovercard for ${hovercardUrl}`);
        return 'mentioned';
      }
    } else {
      console.log(`Hovercard fetch failed:`, response.status, response.statusText);
    }

    return null;
  } catch (error) {
    console.error(`Error fetching hovercard:`, error);
    return null;
  }
}

// Check if a PR is a draft
function checkIfDraft(item: HTMLElement): boolean {
  // Look for draft icon with aria-label
  const draftIcon = item.querySelector('span[aria-label="Draft Pull Request"]');
  return !!draftIcon;
}

// Check if a PR/Issue is "mine" (authored by me or copilot+assigned to me)
function checkIfMine(item: HTMLElement): boolean {
  // Get the current user from the page
  const currentUser = getCurrentUser();
  if (!currentUser) {
    return false;
  }

  // Find all links in the item
  const allLinks = item.querySelectorAll('a');

  // Look for author and assignee by checking link hrefs and text
  // GitHub issue/PR lists show author as a link to the user profile
  // Format: /username or search links that contain author:username
  let isAuthoredByMe = false;
  let isAuthoredByCopilot = false;
  let isAssignedToMe = false;

  allLinks.forEach(link => {
    const href = link.getAttribute('href') || '';
    const text = link.textContent?.trim() || '';

    // Check if link is to current user's profile
    if (href === `/${currentUser}`) {
      isAuthoredByMe = true;
    }

    // Check for author search links (e.g., "author:ismith" in href)
    if (href.includes(`author%3A${currentUser}`) || href.includes(`author:${currentUser}`)) {
      isAuthoredByMe = true;
    }

    // Check for copilot authorship
    if (href.includes('apps/copilot-swe-agent') ||
        href.includes('author%3A%40copilot') ||
        href.includes('author:@copilot') ||
        text === 'copilot-swe-agent[bot]' ||
        text.toLowerCase() === 'copilot') {
      isAuthoredByCopilot = true;
    }

    // Check for assignee (look for "assignee:" in href or assignee section)
    if (href.includes(`assignee%3A${currentUser}`) || href.includes(`assignee:${currentUser}`)) {
      isAssignedToMe = true;
    }
  });

  // Also check for assignee via aria-label (e.g., "Assigned to Copilot and ismith")
  const assigneeDivs = item.querySelectorAll('div[aria-label]');
  assigneeDivs.forEach(div => {
    const ariaLabel = div.getAttribute('aria-label') || '';
    if (ariaLabel.toLowerCase().includes('assigned to') && ariaLabel.includes(currentUser)) {
      isAssignedToMe = true;
    }
  });

  // Return true if authored by me, OR if authored by copilot and assigned to me
  return isAuthoredByMe || (isAuthoredByCopilot && isAssignedToMe);
}

// Get the current logged-in user
function getCurrentUser(): string | null {
  // Try to find the current user from the avatar link in the header
  const userMenu = document.querySelector('meta[name="user-login"]');
  if (userMenu) {
    return userMenu.getAttribute('content');
  }

  // Fallback: check the header avatar
  const avatarLink = document.querySelector('header a[href^="/"]:has(img.avatar)');
  if (avatarLink) {
    const href = avatarLink.getAttribute('href');
    return href?.replace(/^\//, '').split('/')[0] || null;
  }

  return null;
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
