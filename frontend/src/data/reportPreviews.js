// Small "preview" datasets shown inside the Reports "View" workflow —
// a handful of representative metrics/rows per report, illustrative of
// what the full report would contain. No report-generation backend
// exists, so these are static, same convention as the rest of this app;
// the View modal says so explicitly rather than implying a live pull.
const PREVIEWS = {
  'Workforce Utilization Report': {
    metrics: [
      { label: 'Billable Utilization', value: '78%' },
      { label: 'Non-Billable', value: '22%' },
      { label: 'Bench %', value: '9.4%' },
    ],
    rows: [
      { label: 'Banking and Financial Services (BFS)', value: '81%' },
      { label: 'Insurance', value: '76%' },
      { label: 'Healthcare & Life Sciences', value: '74%' },
    ],
  },
  'Bench Analysis': {
    metrics: [
      { label: 'Employees on Bench', value: '312' },
      { label: 'Avg. Bench Age', value: '18 days' },
      { label: 'Bench Cost / Month', value: '$1.2M' },
    ],
    rows: [
      { label: '0–15 days', value: '164' },
      { label: '16–30 days', value: '98' },
      { label: '30+ days', value: '50' },
    ],
  },
  'Capacity Report': {
    metrics: [
      { label: 'Available Capacity', value: '1,840 FTE' },
      { label: 'Partially Allocated', value: '640 FTE' },
      { label: 'Recoverable', value: '410 FTE' },
    ],
    rows: [
      { label: 'Banking and Financial Services (BFS)', value: '520 FTE' },
      { label: 'Retail & CPG', value: '380 FTE' },
      { label: 'Insurance', value: '290 FTE' },
    ],
  },
  'Demand Forecast': {
    metrics: [
      { label: 'Next 6mo Demand', value: '5,120 FTE' },
      { label: 'Confidence', value: '82%' },
      { label: 'Net New Roles', value: '640' },
    ],
    rows: [
      { label: 'Q4 2026', value: '1,340 FTE' },
      { label: 'Q1 2027', value: '1,510 FTE' },
      { label: 'Q2 2027', value: '1,280 FTE' },
    ],
  },
  'Skills Gap Report': {
    metrics: [
      { label: 'Skills Tracked', value: '46' },
      { label: 'Critical Gaps', value: '7' },
      { label: 'Avg. Gap Severity', value: 'Medium' },
    ],
    rows: [
      { label: 'GenAI', value: '−210 FTE' },
      { label: 'Cybersecurity', value: '−140 FTE' },
      { label: 'Data Engineering', value: '−95 FTE' },
    ],
  },
  'Staffing Effectiveness': {
    metrics: [
      { label: 'Avg. Time-to-Staff', value: '9.2 days' },
      { label: 'Redeployment Rate', value: '64%' },
      { label: 'Match Quality', value: '4.3 / 5' },
    ],
    rows: [
      { label: 'Java Engineer', value: '6.1 days' },
      { label: 'Data Engineer', value: '11.4 days' },
      { label: 'Cloud Architect', value: '14.8 days' },
    ],
  },
  'Business Unit Workforce Report': {
    metrics: [
      { label: 'Business Units', value: '8' },
      { label: 'Total Headcount', value: '48,620' },
      { label: 'Avg. Attrition', value: '11.2%' },
    ],
    rows: [
      { label: 'Banking and Financial Services (BFS)', value: '9,840' },
      { label: 'Insurance', value: '7,120' },
      { label: 'Retail & CPG', value: '6,480' },
    ],
  },
  'Executive Workforce Summary': {
    metrics: [
      { label: 'Total Workforce', value: '48,620' },
      { label: 'Utilization', value: '78%' },
      { label: 'Bench', value: '9.4%' },
    ],
    rows: [
      { label: 'Capacity vs Demand', value: 'On track' },
      { label: 'Top Risk', value: 'GenAI skill gap' },
      { label: 'Top Opportunity', value: 'BFS recoverable FTE' },
    ],
  },
};

const DEFAULT_PREVIEW = {
  metrics: [
    { label: 'Status', value: 'Not yet run' },
  ],
  rows: [],
};

export function getReportPreview(title) {
  return PREVIEWS[title] || DEFAULT_PREVIEW;
}
