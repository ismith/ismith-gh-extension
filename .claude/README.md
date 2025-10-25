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

## Notes

- NOT intended for Chrome Web Store (local installation only)
- MIT License
- See TODO.md for detailed task breakdown
