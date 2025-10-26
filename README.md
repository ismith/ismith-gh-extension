# GitHub Issue & PR Manager

A Chrome extension (Manifest V3) that enhances GitHub's issue and pull request list views with custom filters and visual annotations.

## Features

- Custom filter dropdown for common search queries
- Visual annotations for issues and PRs based on ownership and participation
- Works on both github.com and GitHub Enterprise (*.ghe.com)

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

## Project Structure

```
├── src/
│   ├── background.ts      # Background service worker
│   ├── content.ts         # Content script (runs on GitHub pages)
│   ├── content.css        # Styles for annotations
│   ├── popup.ts           # Extension popup script
│   ├── popup.html         # Extension popup UI
│   ├── manifest.json      # Extension manifest (v3)
│   └── icons/             # Extension icons
├── dist/                  # Built extension (generated)
├── webpack.config.js      # Build configuration
├── tsconfig.json          # TypeScript configuration
└── package.json           # Dependencies and scripts

```

## License

MIT
