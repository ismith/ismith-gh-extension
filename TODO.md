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
- [x] Add dropdown to the left of existing "Author" dropdown
- [x] Three filter options that append to search:
  - [x] Open PRs: `author:@me OR assignee:@me`
  - [x] Open Issues: `author:@me OR assignee:@me`
  - [x] PRs to review: NOT author:@me, NOT (copilot+assigned to me), NOT draft, no reviews yet
- [x] Visible on both /issues and /pulls pages
- [x] Execute searches on /issues page (redirect from /pulls if needed)

## 4. Add visual annotations to PR/Issue list items
- [x] Grey out drafts not authored by me (or copilot at my request)
- [x] Blue border for "mine" (author:@me or copilot+assignee:@me)
- [x] Green border if I've commented/reviewed (via hovercard)
- [x] Blue takes precedence over green
- [x] Use GitHub's color palette

## 5. Create extension icon/badge
- [x] Design or generate icon files (16x16, 48x48, 128x128)
- [x] Add icons to src/icons/ directory

## 6. Add extension icon badge to GitHub header
- [x] Insert icon badge to the left of user avatar in top-right header
- [x] Make it clickable to open extension popup or perform action

## 7. Bug fixes and improvements
- [ ] Fix: Custom filter button shows on /issues but not /pulls
- [ ] Fix: Annotations work on /pulls but not /issues
