# Claude Code Context

This is a Chrome extension (Manifest V3) built in TypeScript for GitHub and GitHub Enterprise.

## Project Goals

Build a Chrome extension that enhances GitHub's issue and PR list views with:
1. Custom filter dropdown for common search queries
2. Visual annotations based on ownership and participation

## Key Files

- `TODO.md` - Main task tracking file (check off items as completed)
- `manifest.json` - Extension manifest (v3)
- `src/` - TypeScript source files
- `dist/` - Built extension output

## Target Platforms

- github.com
- *.ghe.com (GitHub Enterprise)

## Focus Areas

- `/issues` and `/pulls` list views
- Search functionality (uses /issues page for full boolean operator support)
- Visual annotations on list items

## Custom Filters

The extension provides four custom filter shortcuts:

1. **My PRs**: `(author:@me OR (author:app/copilot-swe-agent assignee:@me))`
2. **My Issues**: `((author:@me no:assignee) OR assignee:@me)`
3. **PRs to Review**: `(-author:@me (-author:app/copilot-swe-agent -assignee:@me)) draft:false review:none`
4. **PRs I'm Reviewing**: `(commenter:@me OR reviewed-by:@me)`

### Important: Copilot Authorship Convention

When referring to "my PRs" or PRs "authored by me" in this project, we **always** include:
- PRs directly authored by the user (`author:@me`)
- PRs authored by GitHub Copilot and assigned to the user (`author:app/copilot-swe-agent assignee:@me`)

**Rationale**: PRs "authored" by Copilot are, in every real sense, also authored by the human instructing Copilot. The human developer is the true author who directed the work, so these PRs should be treated as the user's own work.

This convention applies throughout the codebase when filtering or annotating PRs based on ownership.

## Notes

- NOT intended for Chrome Web Store (local installation only)
- MIT License
- See TODO.md for detailed task breakdown
