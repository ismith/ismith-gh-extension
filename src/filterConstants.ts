// Filter constants to keep names and queries in sync across the codebase

export enum FilterType {
  MY_PRS = 'my-prs',
  MY_ISSUES = 'my-issues',
  PRS_TO_REVIEW = 'prs-to-review',
  PRS_IM_REVIEWING = 'prs-im-reviewing'
}

interface Filter {
  name: string;
  query: string;
  type: FilterType;
}

export const FILTERS: Record<keyof typeof FilterType, Filter> = {
  MY_PRS: {
    name: "My PRs (incl Copilot)",
    query: 'is:pr is:open (author:@me OR (author:app/copilot-swe-agent assignee:@me))',
    type: FilterType.MY_PRS
  },
  MY_ISSUES: {
    name: 'My Issues',
    query: 'is:issue is:open ((author:@me no:assignee) OR assignee:@me)',
    type: FilterType.MY_ISSUES
  },
  PRS_TO_REVIEW: {
    name: 'PRs w/o Reviewer',
    query: 'is:pr is:open (-author:@me (-author:app/copilot-swe-agent -assignee:@me)) draft:false review:none',
    type: FilterType.PRS_TO_REVIEW
  },
  PRS_IM_REVIEWING: {
    name: "PRs I'm Reviewing",
    query: 'is:pr is:open (commenter:@me OR reviewed-by:@me) (-author:@me (-author:app/copilot-swe-agent OR -assignee:@me))',
    type: FilterType.PRS_IM_REVIEWING
  }
};
