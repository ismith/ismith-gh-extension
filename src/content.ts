// Content script for GitHub issue and PR pages

import { loadConfig, AnnotationType } from './config';
import { FILTERS, FilterType } from './filterConstants';

// Constants
const GITHUB_HEADER_AVATAR_SIZE = 32;
const RETRY_DELAYS = [500, 1000, 2000]; // ms - retry delays for DOM initialization

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
  const avatarSize = (avatar as HTMLImageElement).width || GITHUB_HEADER_AVATAR_SIZE;
  const iconUrl = chrome.runtime.getURL('icons/icon48.png');
  badge.innerHTML = `<img src="${iconUrl}" alt="Extension" style="width: ${avatarSize}px; height: ${avatarSize}px; vertical-align: middle; border-radius: 50%;">`;

  // Add click handler to open popup
  badge.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();
    chrome.runtime.sendMessage({ type: 'open-popup' });
  });

  // Insert before the avatar container
  avatarContainer.parentElement?.insertBefore(badge, avatarContainer);
}

// Add custom filter dropdown
async function addCustomFilterDropdown() {
  // Check config
  const config = await loadConfig();
  if (!config.filtersEnabled) {
    return;
  }

  // Check if dropdown already exists
  if (document.querySelector('#gh-extension-filter-dropdown')) {
    return;
  }

  // Try multiple strategies to find a good insertion point
  let container: Element | null = null;
  let insertBefore: Element | null = null;

  // Strategy 1: Find the Author filter button (works on /issues)
  const authorButton = document.querySelector('[data-testid="authors-anchor-button"], button[aria-label*="author" i]');
  if (authorButton && authorButton.parentElement) {
    container = authorButton.parentElement;
    insertBefore = authorButton;
  }

  // Strategy 2: Find the author select menu on /pulls pages
  if (!container) {
    const authorSelectMenu = document.querySelector('details#author-select-menu');
    if (authorSelectMenu && authorSelectMenu.parentElement) {
      container = authorSelectMenu.parentElement;
      insertBefore = authorSelectMenu;
    }
  }

  // Strategy 3: Find any filter button container (fallback)
  if (!container) {
    const filterBar = document.querySelector('[role="group"]') ||
                     document.querySelector('.subnav-search-context');
    if (filterBar) {
      container = filterBar;
      insertBefore = filterBar.firstElementChild;
    }
  }

  if (!container) {
    return;
  }

  // Insert dropdown
  insertDropdown(container, insertBefore);
}

function insertDropdown(container: Element | null, insertBefore: Element | null) {
  if (!container) {
    return;
  }

  // Detect if we're on /pulls or /issues page
  const isPullsPage = window.location.pathname.includes('/pulls');

  // Create the custom filter dropdown as a details element (no wrapper div)
  const dropdown = document.createElement('details');
  dropdown.id = 'gh-extension-filter-dropdown';

  if (isPullsPage) {
    // Use btn-link structure for /pulls pages (matches Author dropdown)
    dropdown.className = 'details-reset details-overlay d-inline-block position-relative px-3 gh-extension-filter-dropdown';
    dropdown.innerHTML = `
      <summary class="btn-link" title="Custom filters" role="button">
        Custom filters
        <span class="dropdown-caret hide-sm"></span>
      </summary>
      <details-menu class="SelectMenu SelectMenu--hasFilter" role="menu">
        <div class="SelectMenu-modal">
          <div class="SelectMenu-list">
            <button class="SelectMenu-item" role="menuitem" data-filter-type="${FILTERS.MY_PRS.type}">
              <span class="SelectMenu-item-text">${FILTERS.MY_PRS.name}</span>
            </button>
            <button class="SelectMenu-item" role="menuitem" data-filter-type="${FILTERS.MY_ISSUES.type}">
              <span class="SelectMenu-item-text">${FILTERS.MY_ISSUES.name}</span>
            </button>
            <button class="SelectMenu-item" role="menuitem" data-filter-type="${FILTERS.PRS_TO_REVIEW.type}">
              <span class="SelectMenu-item-text">${FILTERS.PRS_TO_REVIEW.name}</span>
            </button>
            <button class="SelectMenu-item" role="menuitem" data-filter-type="${FILTERS.PRS_IM_REVIEWING.type}">
              <span class="SelectMenu-item-text">${FILTERS.PRS_IM_REVIEWING.name}</span>
            </button>
          </div>
        </div>
      </details-menu>
    `;
  } else {
    // Use prc-Button structure for /issues pages (original working version)
    dropdown.className = 'details-reset details-overlay gh-extension-filter-dropdown';
    dropdown.style.marginRight = '8px';
    dropdown.innerHTML = `
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
          <button class="SelectMenu-item" role="menuitem" data-filter-type="${FILTERS.MY_PRS.type}">
            <span class="SelectMenu-item-text">${FILTERS.MY_PRS.name}</span>
          </button>
          <button class="SelectMenu-item" role="menuitem" data-filter-type="${FILTERS.MY_ISSUES.type}">
            <span class="SelectMenu-item-text">${FILTERS.MY_ISSUES.name}</span>
          </button>
          <button class="SelectMenu-item" role="menuitem" data-filter-type="${FILTERS.PRS_TO_REVIEW.type}">
            <span class="SelectMenu-item-text">${FILTERS.PRS_TO_REVIEW.name}</span>
          </button>
          <button class="SelectMenu-item" role="menuitem" data-filter-type="${FILTERS.PRS_IM_REVIEWING.type}">
            <span class="SelectMenu-item-text">${FILTERS.PRS_IM_REVIEWING.name}</span>
          </button>
        </div>
      </details-menu>
    `;
  }

  // Add click handlers for each filter option
  const buttons = dropdown.querySelectorAll('button[data-filter-type]');

  buttons.forEach(button => {
    button.addEventListener('click', (e) => {
      e.preventDefault();
      const filterType = (button as HTMLElement).dataset.filterType as FilterType;
      applyCustomFilter(filterType);
      dropdown.removeAttribute('open');
    });
  });

  // Insert the dropdown
  if (insertBefore) {
    container.insertBefore(dropdown, insertBefore);
  } else {
    container.appendChild(dropdown);
  }
}

// Apply custom filter based on type
function applyCustomFilter(filterType: FilterType) {
  // Find the filter by type
  const filter = Object.values(FILTERS).find(f => f.type === filterType);
  if (!filter) {
    console.error('Unknown filter type:', filterType);
    return;
  }

  const filterQuery = filter.query;

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

  // Find matching filter by query
  const filter = Object.values(FILTERS).find(f => f.query === currentQuery);
  const filterName = filter?.name;

  // Find the repository div
  const repositoryDiv = document.querySelector('#repository');
  if (!repositoryDiv) {
    return;
  }

  // Go two levels up from #repository
  const grandparent = repositoryDiv.parentElement?.parentElement;
  if (!grandparent || !grandparent.parentElement) {
    return;
  }

  // Create the label (empty or with text)
  const label = document.createElement('div');
  label.className = 'gh-extension-active-filter-label';

  if (filterName) {
    label.textContent = `Active filter: ${filterName}`;
  } else {
    // Empty placeholder to maintain consistent spacing
    label.innerHTML = '&nbsp;';
  }

  // Insert right after the grandparent div
  grandparent.parentElement.insertBefore(label, grandparent.nextElementSibling);
}

// Inject dynamic CSS based on config
async function injectDynamicCSS() {
  const config = await loadConfig();

  // Remove existing dynamic styles
  const existingStyle = document.getElementById('gh-extension-dynamic-styles');
  if (existingStyle) {
    existingStyle.remove();
  }

  // Create new style element with precedence rules
  // Precedence: mine > reviewed > mentioned
  // We use specificity to enforce precedence when multiple classes are present
  const style = document.createElement('style');
  style.id = 'gh-extension-dynamic-styles';
  style.textContent = `
    /* Draft - lowest precedence, can combine with others */
    /* Apply opacity to child elements only, not the border */
    ${config.annotations[AnnotationType.DRAFT].enabled ? `
    .gh-extension-draft > * {
      opacity: 0.6 !important;
    }` : ''}

    /* Mentioned - lowest border precedence */
    ${config.annotations[AnnotationType.MENTIONED].enabled ? `
    .gh-extension-mentioned {
      border-left: 4px solid ${config.annotations[AnnotationType.MENTIONED].color} !important;
      margin-left: -4px !important;
    }` : ''}

    /* Reviewed - medium border precedence, overrides mentioned */
    ${config.annotations[AnnotationType.REVIEWED].enabled ? `
    .gh-extension-reviewed {
      border-left: 4px solid ${config.annotations[AnnotationType.REVIEWED].color} !important;
      margin-left: -4px !important;
    }` : ''}

    /* Mine - highest border precedence, overrides reviewed and mentioned */
    ${config.annotations[AnnotationType.MINE].enabled ? `
    .gh-extension-mine {
      border-left: 4px solid ${config.annotations[AnnotationType.MINE].color} !important;
      margin-left: -4px !important;
    }` : ''}
  `;
  document.head.appendChild(style);
}

// Helper function to retry operations with delays
function retryWithDelays(fn: () => void, delays: number[] = RETRY_DELAYS) {
  fn(); // Execute immediately
  delays.forEach(delay => setTimeout(fn, delay)); // Then retry with delays
}

// Main initialization
async function init() {
  // Load config at start
  const config = await loadConfig();

  // Always add header badge (on all GitHub pages)
  addHeaderBadge();

  if (!isIssuesOrPullsPage()) {
    return;
  }

  // Inject dynamic CSS based on config
  await injectDynamicCSS();

  // Add custom filter dropdown on issues/pulls pages with retry (only if enabled)
  if (config.filtersEnabled) {
    retryWithDelays(addCustomFilterDropdown);
  }

  // Show active filter label if applicable
  retryWithDelays(showActiveFilterLabel, [500, 1000]); // Only need 2 retries for label

  // Add visual annotations to issues/PRs
  retryWithDelays(annotateIssuesAndPRs);
}

// Annotate PR/Issue list items with visual indicators
async function annotateIssuesAndPRs() {
  // Load config
  const config = await loadConfig();

  // Find all PR/Issue title links
  // /pulls pages use data-hovercard-type, /issues pages use data-testid="issue-pr-title-link"
  const titleLinks = document.querySelectorAll('a[data-hovercard-type="pull_request"], a[data-hovercard-type="issue"], a[data-testid="issue-pr-title-link"]');

  if (titleLinks.length === 0) {
    return;
  }

  const annotations: Array<{title: string, id: string, annotation: string}> = [];

  for (const link of Array.from(titleLinks)) {
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
      continue;
    }

    // Get title and ID for logging
    const title = titleElement.textContent?.trim() || 'Unknown';
    const href = titleElement.getAttribute('href') || '';
    const idMatch = href.match(/\/pull\/(\d+)|\/issues\/(\d+)/);
    const id = idMatch ? (idMatch[1] || idMatch[2]) : 'Unknown';

    // Check if already has annotation classes - if so, re-check assignee info but don't re-apply other classes
    const alreadyAnnotated = listItem.classList.contains('gh-extension-annotated');

    if (alreadyAnnotated) {
      // Already processed - only re-check assignee info in case it loaded late
      const isMine = checkIfMine(listItem, id);
      // If it's now mine but wasn't marked before, add the class
      const alreadyMarkedAsMine = !!listItem.querySelector('.gh-extension-mine');
      if (isMine && !alreadyMarkedAsMine) {
        // Find the target element (same logic as initial annotation)
        let targetElement: HTMLElement = listItem;
        const innerDiv = listItem.querySelector('.d-flex.Box-row--drag-hide') as HTMLElement;
        if (innerDiv) {
          targetElement = innerDiv;
        }
        targetElement.classList.add('gh-extension-mine');
        // Remove draft class since this is now recognized as mine
        targetElement.classList.remove('gh-extension-draft');
      }
      continue;
    }

    listItem.classList.add('gh-extension-annotated');

    // Get PR/Issue metadata - search within the list item container
    const isDraft = checkIfDraft(listItem);
    const isMine = checkIfMine(listItem, id);


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

    // Apply annotations - add all applicable classes, CSS handles precedence
    let annotation = 'none';
    const appliedClasses: string[] = [];

    // Apply "mine" if applicable
    if (isMine) {
      targetElement.classList.add('gh-extension-mine');
      appliedClasses.push('gh-extension-mine');
      annotation = 'mine';
    }

    // Apply "draft" if applicable (can combine with mine)
    if (isDraft && !isMine) {
      targetElement.classList.add('gh-extension-draft');
      appliedClasses.push('gh-extension-draft');
      if (annotation === 'none') annotation = 'draft';
    }

    annotations.push({ title, id, annotation });

    // Check for comments/reviews/mentions via hovercard and add borders
    // Do this asynchronously to avoid blocking
    // Add all applicable classes - CSS precedence will show the right one
    checkForInteractions(titleElement, listItem, targetElement, getCurrentUser()).then(interaction => {
      if (interaction === 'reviewed' && !isMine) {
        targetElement.classList.add('gh-extension-reviewed');
      }
      if (interaction === 'mentioned' && !isMine) {
        targetElement.classList.add('gh-extension-mentioned');
      }
    });
  }

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
        return 'reviewed';
      }

      // Check for mentions (lower precedence)
      const hasMention = html.includes('mentioned');

      if (hasYou && hasMention) {
        return 'mentioned';
      }
    }

    return null;
  } catch (error) {
    return null;
  }
}

// Check if a PR is a draft
function checkIfDraft(item: HTMLElement): boolean {
  // Look for draft icon - can be either a span with aria-label or an SVG with class
  const draftIconSpan = item.querySelector('span[aria-label="Draft Pull Request"]');
  const draftIconSvg = item.querySelector('svg.octicon-git-pull-request-draft');
  return !!(draftIconSpan || draftIconSvg);
}

// Check if a PR/Issue is "mine" (authored by me or copilot+assigned to me)
function checkIfMine(item: HTMLElement, debugId?: string): boolean {
  // Get the current user from the page
  const currentUser = getCurrentUser();
  if (!currentUser) {
    return false;
  }

  // Find all links in the item
  const allLinks = item.querySelectorAll('a');

  // Look for author and assignee by checking link hrefs and text
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

  // Check ALL elements with aria-label for assignee info
  // This includes links, spans, imgs, etc.
  const ariaLabelElements = item.querySelectorAll('[aria-label]');
  ariaLabelElements.forEach(element => {
    const ariaLabel = element.getAttribute('aria-label') || '';

    // Check for "is assigned" in aria-label (e.g., "ismith is assigned", "Copilot is assigned")
    if (ariaLabel.toLowerCase().includes('is assigned') && ariaLabel.includes(currentUser)) {
      isAssignedToMe = true;
    }

    // Also check for "assigned to" in aria-label (e.g., "Assigned to Copilot and ismith")
    if (ariaLabel.toLowerCase().includes('assigned to') && ariaLabel.includes(currentUser)) {
      isAssignedToMe = true;
    }
  });

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

// Listen for config updates from popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === 'config-updated') {
    // Apply config changes without reloading
    const config = request.config;

    // Update CSS dynamically - this is all we need!
    // Classes stay on elements, CSS rules determine what shows
    injectDynamicCSS();

    // Toggle filter dropdown visibility
    const dropdown = document.getElementById('gh-extension-filter-dropdown');
    if (dropdown) {
      if (!config.filtersEnabled) {
        dropdown.remove();
      }
    } else if (config.filtersEnabled) {
      // Dropdown doesn't exist but should - add it
      addCustomFilterDropdown();
    }

    // Send response to acknowledge receipt
    sendResponse({ success: true });
  }
});

// Watch for navigation changes (GitHub uses AJAX navigation)
let lastUrl = location.href;
new MutationObserver(() => {
  const url = location.href;
  if (url !== lastUrl) {
    lastUrl = url;
    init();
  }
}).observe(document, { subtree: true, childList: true });
