# GitHub Extension TODO

## 1. Initialize Chrome extension (Manifest V3) in TypeScript
- [x] Set up npm project with TypeScript and build tools
- [x] Configure TypeScript (tsconfig.json)
- [x] Create manifest.json (v3) with GitHub/GHE permissions
- [x] Set up build system (webpack/esbuild)
- [x] Create basic extension structure (background, popup, content scripts)
- [x] Add MIT License
- [x] Create .gitignore
- [x] Write README with build and installation instructions

## 2. Configure for GitHub and GitHub Enterprise
- [x] Host permissions: github.com and *.ghe.com
- [x] Focus on /issues and /pulls views

## 3. Add "Custom filter" dropdown with search shortcuts
- [ ] Add dropdown to the left of existing "Author" dropdown
- [ ] Three filter options that append to search:
  - [ ] Open PRs: `author:@me OR assignee:@me`
  - [ ] Open Issues: `author:@me OR assignee:@me`
  - [ ] PRs to review: NOT author:@me, NOT (copilot+assigned to me), NOT draft, no reviews yet
- [ ] Visible on both /issues and /pulls pages
- [ ] Execute searches on /issues page (redirect from /pulls if needed)

## 4. Add visual annotations to PR/Issue list items
- [ ] Grey out drafts not authored by me (or copilot at my request)
- [ ] Blue border for "mine" (author:@me or copilot+assignee:@me)
- [ ] Green border if I've commented/reviewed (via API)
- [ ] Blue takes precedence over green
- [ ] Use GitHub's color palette

## 5. Create extension icon/badge
- [x] Design or generate icon files (16x16, 48x48, 128x128)
- [x] Add icons to src/icons/ directory

## 6. Add extension icon badge to GitHub header
- [x] Insert icon badge to the left of user avatar in top-right header
- [x] Make it clickable to open extension popup or perform action
