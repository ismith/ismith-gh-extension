# GitHub Issue & PR Manager

A Chrome extension (Manifest V3) that enhances GitHub's issue and pull request list views with custom filters, visual annotations, and powerful configuration options.

## Features

### Custom Filters

Quick-access dropdown with common search queries on issues/pulls pages:

- **My PRs (incl Copilot)**: `(author:@me OR (author:app/copilot-swe-agent assignee:@me))`
- **My Issues**: `((author:@me no:assignee) OR assignee:@me)`
- **PRs w/o Reviewer**: `is:pr is:open (-author:@me (-author:app/copilot-swe-agent -assignee:@me)) draft:false review:none`
- **PRs I'm Reviewing**: `is:pr is:open (commenter:@me OR reviewed-by:@me) (-author:@me (-author:app/copilot-swe-agent OR -assignee:@me))`

Filters can be enabled/disabled via the popup configuration.

### Visual Annotations

PRs and issues are automatically annotated with colored borders based on your participation:

- **Mine** (default: blue `#0969da`): PRs/issues you authored, or Copilot-authored PRs assigned to you
- **Reviewed** (default: green `#1a7f37`): PRs you've commented on or reviewed
- **Mentioned** (default: yellow `#ffbb00`): PRs where you're mentioned
- **Draft** (dimmed): Draft PRs (opacity reduced, excludes your own)

**Annotation precedence**: Mine > Reviewed > Mentioned (when multiple apply, the highest priority border shows)

### Configuration Popup

Click the extension badge in the GitHub header to open the configuration popup:

- **Enable/disable custom filters** - Toggle the filter dropdown
- **Configure annotations** - Enable/disable each annotation type individually
- **Customize colors** - Color pickers with hex input for each annotation
- **Reset to defaults** - Reset buttons showing the default color
- **Version information** - Commit hash, commit time, build time (click to copy)
- **Dynamic theming** - Popup automatically matches GitHub's light/dark mode

All settings are saved automatically and apply live without page reload.

### Understanding Copilot PR Ownership

Throughout this extension, PRs authored by GitHub Copilot (`author:app/copilot-swe-agent`) that are assigned to you are treated as "yours." This includes:

- **My PRs** filter includes Copilot PRs assigned to you
- **Mine** annotation applies to Copilot PRs assigned to you
- **PRs I'm Reviewing** filter excludes Copilot PRs assigned to you

**Rationale**: When you assign a PR to Copilot, you are the human directing the work. The PR is authored by you in every meaningful sense - you instructed Copilot what to create, reviewed the changes, and are responsible for the outcome.

## Compatibility

- Works on **github.com** and **GitHub Enterprise** (*.ghe.com)
- Chrome Extension Manifest V3
- Firefox compatible (uses WebExtensions-compatible APIs)

## Development

### Prerequisites

- Node.js (v16 or higher)
- npm

### Build Instructions

1. Install dependencies:
   ```bash
   npm install
   ```

2. Build the extension:
   ```bash
   npm run build
   ```

   This will create a `dist/` directory with the compiled extension.

3. For development with auto-rebuild:
   ```bash
   npm run dev
   ```

### Installing the Extension Locally

1. Build the extension using the instructions above

2. Open Chrome and navigate to `chrome://extensions/`

3. Enable "Developer mode" (toggle in the top-right corner)

4. Click "Load unpacked"

5. Select the `dist/` directory from this project

6. The extension should now be installed and active on GitHub pages

### Reloading the Extension After Changes

After making code changes and rebuilding:

1. Rebuild the extension:
   ```bash
   npm run build
   ```

2. Open Chrome and navigate to `chrome://extensions/`

3. Find the "GitHub Issue & PR Manager" extension card

4. Click the refresh/reload icon (circular arrow) on the extension card

5. Reload any open GitHub pages to see your changes take effect

**Tip**: If you're actively developing, run `npm run dev` in a terminal to automatically rebuild on file changes. You'll still need to manually reload the extension in Chrome after each rebuild.

## Usage

1. **Access custom filters**: Look for the "Custom filters" dropdown on any GitHub issues or pulls page
2. **View annotations**: PRs and issues are automatically annotated with colored borders
3. **Configure**: Click the extension badge (Octocat icon) in the GitHub header to open settings
4. **Customize colors**: Use the color pickers in the popup to set your preferred annotation colors
5. **Enable/disable features**: Toggle custom filters or individual annotations as needed

## Default Colors

- **Mine**: `#0969da` (GitHub blue)
- **Reviewed**: `#1a7f37` (GitHub green)
- **Mentioned**: `#ffbb00` (Yellow/gold)
- **Draft**: 60% opacity (dimmed)

Colors can be customized via the popup and reset to defaults at any time.
