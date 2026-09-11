// Workforce Planning scenario model — single source of truth for the
// scenario selector, Workforce Gap card, Recommended Actions card and
// the "Review Full Workforce Plan" screen, so switching scenarios
// actually changes every widget together instead of Base Case being the
// only real data and the other two cards being permanently decorative.
//
// No scenario-planning backend exists yet (same convention as the rest
// of this app) — these are new, internally consistent assumed numbers
// for Growth/Conservative (Base Case's numbers are the original exact
// Figma spec values, kept as-is). All three scenarios share the same
// 48,620 current-workforce baseline — only *future demand* differs
// across them — required = current + gap holds for all three, and each
// scenario's quarterly rows sum to its own total gap.
export const CURRENT_WORKFORCE = 48620;

export const SCENARIOS = {
  base: {
    key: 'base',
    label: 'Base Case',
    required: 51400,
    gap: 2780,
    gapColor: 'var(--w-accent-blue)',
    quarters: [
      { label: 'Q3 2026', rows: [['Upskill', 120, 'var(--w-violet)'], ['Redeploy', 280, 'var(--w-green)']], total: 400 },
      { label: 'Q4 2026', rows: [['Hire', 80, 'var(--w-accent-blue)'], ['Upskill', 80, 'var(--w-violet)'], ['Redeploy', 120, 'var(--w-green)']], total: 280 },
      { label: 'Q1 2027', rows: [['Hire', 100, 'var(--w-accent-blue)'], ['Upskill', 40, 'var(--w-violet)'], ['Redeploy', 96, 'var(--w-green)']], total: 236 },
      { label: 'Q2 2027', rows: [], total: 1864 },
    ],
    actions: [
      { num: '01', title: 'Hire 180 Cloud Engineers', subtitle: 'Closes Cloud capacity gap in Q1 2027', tag: 'Hire', color: 'var(--w-accent-blue)', impact: 180 },
      { num: '02', title: 'Upskill 240 employees in GenAI', subtitle: 'Reduces GenAI shortage by 58%', tag: 'Upskill', color: 'var(--w-violet)', impact: 240 },
      { num: '03', title: 'Redeploy 96 Java resources', subtitle: 'Transfers from low-demand to high-demand BUs', tag: 'Redeploy', color: 'var(--w-green)', impact: 96 },
      { num: '04', title: 'Use contractors for 120 short-term SAP requirements', subtitle: 'Avoids $2.1M in permanent hiring cost', tag: 'Contract', color: 'var(--w-amber)', impact: 120 },
      { num: '05', title: 'Optimize 420 partially allocated employees', subtitle: 'Recovers 3,180 FTE equivalent capacity', tag: 'Optimize', color: 'var(--w-cyan)', impact: 3180 },
    ],
    metrics: [
      { value: '+3.4%', label: 'Utilization Impact', color: 'var(--w-green)' },
      { value: '-12%', label: 'Bench Reduction', color: 'var(--w-green)' },
      { value: '+7%', label: 'Demand Coverage', color: 'var(--w-accent-blue)' },
      { value: '$4.2M', label: 'Cost Avoidance', color: 'var(--w-indigo)' },
    ],
  },
  growth: {
    key: 'growth',
    label: 'Growth Case',
    required: 55200,
    gap: 6580,
    gapColor: 'var(--w-green)',
    quarters: [
      { label: 'Q3 2026', rows: [['Hire', 180, 'var(--w-accent-blue)'], ['Upskill', 260, 'var(--w-violet)'], ['Redeploy', 460, 'var(--w-green)']], total: 900 },
      { label: 'Q4 2026', rows: [['Hire', 220, 'var(--w-accent-blue)'], ['Upskill', 160, 'var(--w-violet)'], ['Redeploy', 240, 'var(--w-green)']], total: 620 },
      { label: 'Q1 2027', rows: [['Hire', 260, 'var(--w-accent-blue)'], ['Upskill', 90, 'var(--w-violet)'], ['Redeploy', 210, 'var(--w-green)']], total: 560 },
      { label: 'Q2 2027', rows: [], total: 4500 },
    ],
    actions: [
      { num: '01', title: 'Hire 420 Cloud Engineers', subtitle: 'Closes Cloud capacity gap in Q4 2026', tag: 'Hire', color: 'var(--w-accent-blue)', impact: 420 },
      { num: '02', title: 'Upskill 480 employees in GenAI', subtitle: 'Reduces GenAI shortage by 72%', tag: 'Upskill', color: 'var(--w-violet)', impact: 480 },
      { num: '03', title: 'Redeploy 180 Java resources', subtitle: 'Transfers from low-demand to high-demand BUs', tag: 'Redeploy', color: 'var(--w-green)', impact: 180 },
      { num: '04', title: 'Use contractors for 260 short-term SAP requirements', subtitle: 'Avoids $4.6M in permanent hiring cost', tag: 'Contract', color: 'var(--w-amber)', impact: 260 },
      { num: '05', title: 'Optimize 620 partially allocated employees', subtitle: 'Recovers 4,650 FTE equivalent capacity', tag: 'Optimize', color: 'var(--w-cyan)', impact: 4650 },
    ],
    metrics: [
      { value: '+5.8%', label: 'Utilization Impact', color: 'var(--w-green)' },
      { value: '-18%', label: 'Bench Reduction', color: 'var(--w-green)' },
      { value: '+11%', label: 'Demand Coverage', color: 'var(--w-accent-blue)' },
      { value: '$7.6M', label: 'Cost Avoidance', color: 'var(--w-indigo)' },
    ],
  },
  conservative: {
    key: 'conservative',
    label: 'Conservative',
    required: 49300,
    gap: 680,
    gapColor: 'var(--w-amber)',
    quarters: [
      { label: 'Q3 2026', rows: [['Upskill', 40, 'var(--w-violet)'], ['Redeploy', 80, 'var(--w-green)']], total: 120 },
      { label: 'Q4 2026', rows: [['Hire', 20, 'var(--w-accent-blue)'], ['Upskill', 20, 'var(--w-violet)'], ['Redeploy', 40, 'var(--w-green)']], total: 80 },
      { label: 'Q1 2027', rows: [['Hire', 20, 'var(--w-accent-blue)'], ['Upskill', 10, 'var(--w-violet)'], ['Redeploy', 30, 'var(--w-green)']], total: 60 },
      { label: 'Q2 2027', rows: [], total: 420 },
    ],
    actions: [
      { num: '01', title: 'Hire 40 Cloud Engineers', subtitle: 'Closes Cloud capacity gap in Q2 2027', tag: 'Hire', color: 'var(--w-accent-blue)', impact: 40 },
      { num: '02', title: 'Upskill 60 employees in GenAI', subtitle: 'Reduces GenAI shortage by 22%', tag: 'Upskill', color: 'var(--w-violet)', impact: 60 },
      { num: '03', title: 'Redeploy 24 Java resources', subtitle: 'Transfers from low-demand to high-demand BUs', tag: 'Redeploy', color: 'var(--w-green)', impact: 24 },
      { num: '04', title: 'Use contractors for 30 short-term SAP requirements', subtitle: 'Avoids $0.5M in permanent hiring cost', tag: 'Contract', color: 'var(--w-amber)', impact: 30 },
      { num: '05', title: 'Optimize 140 partially allocated employees', subtitle: 'Recovers 1,050 FTE equivalent capacity', tag: 'Optimize', color: 'var(--w-cyan)', impact: 1050 },
    ],
    metrics: [
      { value: '+1.2%', label: 'Utilization Impact', color: 'var(--w-green)' },
      { value: '-6%', label: 'Bench Reduction', color: 'var(--w-green)' },
      { value: '+3%', label: 'Demand Coverage', color: 'var(--w-accent-blue)' },
      { value: '$1.1M', label: 'Cost Avoidance', color: 'var(--w-indigo)' },
    ],
  },
};

export const SCENARIO_ORDER = ['base', 'growth', 'conservative'];
