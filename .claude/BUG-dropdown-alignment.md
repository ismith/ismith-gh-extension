# Bug: Custom Filter Dropdown Misaligned on /pulls Pages

## Status
**UNRESOLVED** - The custom filter dropdown appears below the other filter buttons instead of inline with them on `/pulls` pages.

## Current Behavior
- The dropdown is visible on `/pulls` pages
- It appears on a separate line below the existing filter buttons (Author, Label, Sort, etc.)
- On `/issues` pages, it works correctly and appears inline

## Root Cause Analysis

### DOM Structure on /pulls Pages
The dropdown is being inserted into a flex container with these properties:
```html
<div class="table-list-header-toggle flex-auto flex-justify-between flex-sm-justify-start flex-lg-justify-end">
  <details id="gh-extension-filter-dropdown" class="details-reset details-overlay gh-extension-filter-dropdown">...</details>
  <details id="author-select-menu" class="details-reset details-overlay d-inline-block position-relative px-3">...</details>
  <!-- more <details> elements for other filters -->
</div>
```

### Parent Container CSS
```css
display: flex !important;
justify-content: flex-end !important;
white-space: nowrap !important;
```

### Insertion Logic (src/content.ts)
```typescript
// Strategy 2: Find the author select menu on /pulls pages
if (!container) {
  const authorSelectMenu = document.querySelector('details#author-select-menu');
  if (authorSelectMenu && authorSelectMenu.parentElement) {
    container = authorSelectMenu.parentElement;
    insertBefore = authorSelectMenu;
    console.log('GitHub Issue & PR Manager: Using author-select-menu strategy');
  }
}
```

The dropdown is correctly inserted as a sibling `<details>` element before `details#author-select-menu`.

## What We've Tried

### Attempt 1: Removed Wrapper Div
- **What**: Changed from `<div><details>...</details></div>` to just `<details>...</details>`
- **Result**: Dropdown appears but still misaligned
- **Reasoning**: Made our element a direct sibling to other filter buttons, matching their structure

### Attempt 2: Added Flex Properties
- **What**: Added `flex-shrink: 0 !important` and `flex-grow: 0 !important` to `.gh-extension-filter-dropdown`
- **Result**: No change in alignment
- **Reasoning**: Prevent flex container from shrinking/growing the dropdown

### Attempt 3: Set Inline Display
- **What**: Already had `display: inline-block !important` in CSS
- **Result**: Not effective (flex container overrides this)
- **Reasoning**: In flex context, children become flex items regardless of display value

## Current CSS for Dropdown
```css
.gh-extension-filter-dropdown {
  position: relative;
  display: inline-block !important;
  vertical-align: middle;
  float: none !important;
  clear: none !important;
  flex-shrink: 0 !important;
  flex-grow: 0 !important;
}
```

Plus `style.marginRight = '8px'` set inline in JavaScript.

## Possible Next Steps

### Option 1: Match Native Filter Button Structure Exactly
Inspect the HTML/CSS of `details#author-select-menu` more carefully. The native buttons have:
- Classes: `details-reset details-overlay d-inline-block position-relative px-3`
- Our dropdown has: `details-reset details-overlay gh-extension-filter-dropdown`

**Action**: Add `d-inline-block position-relative px-3` classes to our dropdown to match exactly.

### Option 2: Investigate Flex Container Width
The parent container might have a width constraint causing wrapping when we add another element.

**Action**:
- Inspect computed width of parent container
- Check if there's a `flex-wrap: wrap` property somewhere
- Consider if the container is too narrow to fit all buttons in one line

### Option 3: Different Insertion Point
Maybe we need to insert into a different container or position within the flex layout.

**Action**:
- Try inserting at the end of the container instead of before author-select-menu
- Try finding a different parent container that's not using flex-end
- Look for a wrapper that contains multiple filter buttons as a group

### Option 4: Force Inline with Flexbox
Use flex properties more aggressively to force inline layout.

**Action**: Try adding to our dropdown:
```css
flex: 0 0 auto !important;
min-width: 0 !important;
align-self: center !important;
```

### Option 5: Investigate at Runtime
Use browser DevTools on a live `/pulls` page to:
- Inspect computed styles of parent container
- Check if our dropdown has any unexpected styles being applied
- Compare our dropdown's computed styles vs. native filter buttons
- Look for any GitHub CSS that might be specifically targeting certain children

## Testing Instructions
1. Build: `npm run build`
2. Reload extension in Chrome at `chrome://extensions/`
3. Navigate to a `/pulls` page on github.com
4. Look for "Custom filters" dropdown - it should be inline with Author/Label/Sort buttons
5. Check browser console for log messages starting with "GitHub Issue & PR Manager:"

## Related Files
- `src/content.ts` - Dropdown insertion logic (line ~450-520)
- `src/content.css` - Dropdown styling (line ~19-87)
