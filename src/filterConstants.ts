// Filter constants to keep names and queries in sync across the codebase

export const FILTERS = {
  MY_PRS: {
    name: "My PRs (incl Copilot)",
    query: 'is:pr is:open (author:@me OR (author:app/copilot-swe-agent assignee:@me))',
    type: 'my-prs'
  },
  MY_ISSUES: {
    name: 'My Issues',
    query: 'is:issue is:open ((author:@me no:assignee) OR assignee:@me)',
    type: 'my-issues'
  },
  PRS_TO_REVIEW: {
    name: 'PRs w/o Reviewer',
    query: 'is:pr is:open (-author:@me (-author:app/copilot-swe-agent -assignee:@me)) draft:false review:none',
    type: 'prs-to-review'
  },
  PRS_IM_REVIEWING: {
    name: "PRs I'm Reviewing",
    query: 'is:pr is:open (commenter:@me OR reviewed-by:@me)',
    type: 'prs-im-reviewing'
  }
} as const;

// Helper to get filter by type
export function getFilterByType(type: string) {
  return Object.values(FILTERS).find(f => f.type === type);
}

// Helper to get filter by query
export function getFilterByQuery(query: string) {
  return Object.values(FILTERS).find(f => f.query === query);
}
