# GitHub Extension TODO

## 1. Initialize Chrome extension (Manifest V3) in TypeScript
- [ ] Set up npm project with TypeScript and build tools
- [ ] Configure TypeScript (tsconfig.json)
- [ ] Create manifest.json (v3) with GitHub/GHE permissions
- [ ] Set up build system (webpack/esbuild)
- [ ] Create basic extension structure (background, popup, content scripts)
- [ ] Add MIT License
- [ ] Create .gitignore
- [ ] Write README with build and installation instructions

## 2. Configure for GitHub and GitHub Enterprise
- [ ] Host permissions: github.com and *.ghe.com
- [ ] Focus on /issues and /pulls views

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
