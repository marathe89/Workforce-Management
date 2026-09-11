// AI Workforce Advisor — intent/entity query engine ("vibe search" over
// workforce questions, same rule-based convention as Talent Finder's
// search — see data/talentData.js — and every other "AI"-labeled feature
// in this app). No live language model is called: free text is parsed
// for known entities (business units, skills, projects, percentage
// thresholds, timeframes) and scored against a fixed set of intents,
// each producing a structured, interactive result card instead of a
// plain sentence. Loosely-worded or paraphrased questions still land on
// the right intent — they don't have to match a suggested prompt
// verbatim, unlike the page's previous exact-string-match version.
import { REAL_BUSINESS_UNITS } from './businessUnits';
import { EMPLOYEES as CAPACITY_EMPLOYEES, getDefaultStaffingPeriod, getRecoverability } from './capacityModel';

const STAFFING_PERIOD = getDefaultStaffingPeriod();

// ---------------------------------------------------------------------
// Entity extraction
// ---------------------------------------------------------------------
const KNOWN_SKILLS = ['Java', 'AWS', 'GenAI', 'Data Engineering', 'Cybersecurity', 'DevOps', 'React', 'SAP', 'Azure', 'Salesforce'];
const KNOWN_PROJECTS = ['Project Phoenix', 'Phoenix'];

export function parseAdvisorQuery(raw) {
  const q = raw.trim();
  const lower = q.toLowerCase();

  const businessUnit = REAL_BUSINESS_UNITS.find((u) => lower.includes(u.toLowerCase()))
    || REAL_BUSINESS_UNITS.find((u) => {
      const short = u.match(/\(([^)]+)\)/); // catches "(BFS)", "(DPA)", "(TTH)"
      return short && lower.includes(short[1].toLowerCase());
    });

  const skill = KNOWN_SKILLS.find((s) => lower.includes(s.toLowerCase()));
  const project = KNOWN_PROJECTS.find((p) => lower.includes(p.toLowerCase())) ? 'Project Phoenix' : null;

  const pctMatch = lower.match(/(\d{1,3})\s*%/);
  const percentageThreshold = pctMatch ? Number(pctMatch[1]) : null;

  let timeframeDays = null;
  if (/next month|30 days|this month/.test(lower)) timeframeDays = 30;
  else if (/q4|quarter/.test(lower)) timeframeDays = 90;
  else if (/(\d{1,3})\s*days?/.test(lower)) timeframeDays = Number(lower.match(/(\d{1,3})\s*days?/)[1]);

  return { raw: q, businessUnit, skill, project, percentageThreshold, timeframeDays };
}

// ---------------------------------------------------------------------
// Intents — each scores itself against the query + extracted entities,
// then (if it wins) builds a structured, interactive result card. Cards
// pull real numbers from this app's own data models where a matched
// entity makes that possible (e.g. a named business unit's recoverable
// capacity is computed live from data/capacityModel.js's employee
// records, not a separately hardcoded per-BU figure) — everything else
// is the same internally-consistent assumed data already shown
// elsewhere in this app (no live workforce backend exists, per every
// other page's own convention).
// ---------------------------------------------------------------------
function recoverableForUnit(unit) {
  const members = CAPACITY_EMPLOYEES.filter((e) => e.unit === unit);
  const fte = members.reduce((s, e) => s + getRecoverability(e, STAFFING_PERIOD).fte, 0);
  return { fte: Math.round(fte * 100) / 100, headcount: members.length };
}

const INTENTS = [
  {
    id: 'capacity-excess',
    keywords: ['excess capacity', 'spare capacity', 'underutilized', 'free capacity', 'who is free', 'who\'s free', 'unused capacity'],
    match: (q) => /excess|spare|underutili|unused|free capacity/.test(q),
    buildCard: (e) => {
      if (e.businessUnit) {
        const r = recoverableForUnit(e.businessUnit);
        return {
          icon: '📊', title: `Capacity snapshot — ${e.businessUnit}`,
          subtitle: `Computed live from the current staffing planning period (${STAFFING_PERIOD.start} → ${STAFFING_PERIOD.end}).`,
          metrics: [
            { label: 'Recoverable FTE', value: `${r.fte}`, color: 'var(--w-amber)' },
            { label: 'Employees sampled', value: `${r.headcount}`, color: 'var(--w-text-primary)' },
          ],
          cta: { label: 'Open Capacity & Utilization →', to: '/capacity-utilization' },
        };
      }
      return {
        icon: '📊', title: 'Capacity snapshot — all business units',
        subtitle: 'Aug–Sep shows the largest projected excess; 1,240 employees sit below 50% allocation, concentrated in Digital Services and Cloud & Infrastructure.',
        metrics: [
          { label: 'Below 50% Allocation', value: '1,240', color: 'var(--w-amber)' },
          { label: 'Projected Excess (Aug–Sep)', value: '310 FTE', color: 'var(--w-green)' },
        ],
        cta: { label: 'Open Capacity & Utilization →', to: '/capacity-utilization' },
      };
    },
  },
  {
    id: 'staffing-match',
    keywords: ['staff project phoenix', 'who can join phoenix', 'match project phoenix', 'staff phoenix'],
    match: (q, e) => /staff|match|join/.test(q) && (e.project || /phoenix/.test(q)),
    buildCard: (e) => ({
      icon: '🎯', title: 'Top matches — Project Phoenix',
      subtitle: e.percentageThreshold ? `Filtered to candidates with more than ${e.percentageThreshold}% available capacity.` : 'Ranked by skill match and current availability.',
      list: [
        { label: 'Priya Sharma', value: '96% match', extra: '40% available' },
        { label: 'Rahul Mehta', value: '93% match', extra: '50% available' },
        { label: 'Sneha Kulkarni', value: '91% match', extra: '30% available' },
      ].filter((row) => !e.percentageThreshold || Number(row.extra) > e.percentageThreshold),
      cta: { label: 'Open Project Staffing →', to: '/projects' },
    }),
  },
  {
    id: 'skill-gap',
    keywords: ['skills short', 'skill gap', 'shortage', 'skills be short'],
    match: (q) => /skill.*(short|gap)|short.*skill|shortage/.test(q),
    buildCard: (e) => {
      const GAPS = { Java: -120, AWS: -270, GenAI: -420, 'Data Engineering': -350, Cybersecurity: -220, DevOps: -180, Azure: -280 };
      if (e.skill && GAPS[e.skill] != null) {
        return {
          icon: '📉', title: `Skill gap — ${e.skill}`,
          subtitle: `Current supply–demand delta for ${e.skill} across the workforce.`,
          metrics: [{ label: 'Gap', value: `${GAPS[e.skill]}`, color: 'var(--w-red)' }],
          cta: { label: 'Open Skills Intelligence →', to: '/skills-intelligence' },
        };
      }
      return {
        icon: '📉', title: 'Skill gaps heading into Q4',
        subtitle: 'GenAI and Data Engineering are the most critical; AWS and Azure are trending into warning territory.',
        list: [
          { label: 'GenAI', value: '-420', extra: '-33.9%' },
          { label: 'Data Engineering', value: '-350', extra: '-11.0%' },
          { label: 'AWS', value: '-270', extra: '-6.0%' },
        ],
        cta: { label: 'Open Skills Intelligence →', to: '/skills-intelligence' },
      };
    },
  },
  {
    id: 'bench-reduction',
    keywords: ['reduce bench', 'lower bench', 'bench by 10%', 'shrink bench'],
    match: (q) => /reduce bench|lower bench|shrink bench|bench.*10%/.test(q),
    buildCard: () => ({
      icon: '🪑', title: 'Reducing bench — Base Case plan',
      subtitle: 'Redeploying AI-matched Data & AI candidates and prioritizing the longest-benched employees could recover ~113 FTE, roughly a 10% reduction.',
      metrics: [
        { label: 'Total Bench', value: '1,126', color: 'var(--w-text-primary)' },
        { label: '60+ Days', value: '92', color: 'var(--w-red)' },
        { label: 'Est. Recoverable', value: '~113', color: 'var(--w-green)' },
      ],
      cta: { label: 'Open Bench Management →', to: '/bench-management' },
    }),
  },
  {
    id: 'becoming-available',
    keywords: ['becoming available', 'available next month', 'freeing up'],
    match: (q, e) => /becoming available|freeing up|available.*(next month|soon)/.test(q) || (e.timeframeDays === 30 && /available/.test(q)),
    buildCard: (e) => ({
      icon: '📅', title: `Becoming available — within ${e.timeframeDays || 30} days`,
      subtitle: 'Concentrated in Digital Services and Engineering, with the highest AI-match rates in Data & AI.',
      metrics: [{ label: 'Employees', value: '486', color: 'var(--w-accent-blue)' }],
      cta: { label: 'Open Capacity & Utilization →', to: '/capacity-utilization' },
    }),
  },
  {
    id: 'partial-threshold',
    keywords: ['more than 30% available', 'below 50% allocation', 'available capacity'],
    match: (q, e) => e.percentageThreshold != null && /available|allocat/.test(q),
    buildCard: (e) => ({
      icon: '📊', title: `Employees with over ${e.percentageThreshold}% available capacity`,
      subtitle: 'Data & AI carries the largest share of recoverable capacity of any business unit.',
      metrics: [
        { label: 'Partially Allocated', value: '6,420', color: 'var(--w-text-primary)' },
        { label: 'Recoverable Capacity', value: '3,180 FTE', color: 'var(--w-amber)' },
      ],
      cta: { label: 'Open Capacity & Utilization →', to: '/capacity-utilization' },
    }),
  },
  {
    id: 'utilization-no-hiring',
    keywords: ['improve utilization without hiring', 'optimize without hiring', 'utilization no hiring'],
    match: (q) => /without hiring|no.*hiring|no new hires/.test(q),
    buildCard: () => ({
      icon: '📈', title: 'Improving utilization — no new hires',
      subtitle: 'Optimizing 420 partially allocated employees (Base Case) recovers 3,180 FTE of equivalent capacity.',
      metrics: [
        { label: 'Utilization Gain', value: '+3.4%', color: 'var(--w-green)' },
        { label: 'FTE Recovered', value: '3,180', color: 'var(--w-accent-blue)' },
      ],
      cta: { label: 'Open Workforce Planning →', to: '/workforce-planning' },
    }),
  },
  {
    id: 'hire-vs-upskill',
    keywords: ['hire or upskill', 'genai demand', 'upskill for genai'],
    match: (q) => /hire.*upskill|upskill.*hire|genai.*(demand|hire|upskill)/.test(q),
    buildCard: () => ({
      icon: '⚖️', title: 'Hire vs. upskill — GenAI',
      subtitle: 'A blended approach is recommended: upskill first, hire to close the remainder.',
      metrics: [
        { label: 'Supply / Demand', value: '820 / 1,240', color: 'var(--w-text-primary)' },
        { label: 'Gap Closed by Upskilling', value: '58%', color: 'var(--w-green)' },
      ],
      cta: { label: 'Open Skills Intelligence →', to: '/skills-intelligence' },
    }),
  },
];

const FALLBACK = {
  id: 'fallback',
  buildCard: () => ({
    icon: '✦', title: 'Not sure I caught that',
    subtitle: 'I can help with capacity, staffing matches, skill gaps, bench reduction, utilization or hiring-vs-upskill decisions — try naming a business unit, skill, or project, or pick a suggestion below.',
    cta: null,
  }),
};

export const FOLLOW_UPS = {
  'capacity-excess': ['Show me resources becoming available next month.', 'How can we improve utilization without hiring?'],
  'staffing-match': ['Which partially allocated employees can support Project Phoenix?', 'Where do we have excess capacity?'],
  'skill-gap': ['Should we hire or upskill for GenAI demand?', 'Which skills will be short in Q4?'],
  'bench-reduction': ['Show me resources becoming available next month.', 'Where do we have excess capacity?'],
  'becoming-available': ['How can we reduce bench by 10%?', 'Which employees can staff Project Phoenix?'],
  'partial-threshold': ['Which partially allocated employees can support Project Phoenix?', 'How can we improve utilization without hiring?'],
  'utilization-no-hiring': ['How can we reduce bench by 10%?', 'Where do we have excess capacity?'],
  'hire-vs-upskill': ['Which skills will be short in Q4?', 'Should we hire or upskill for GenAI demand?'],
  fallback: ['Where do we have excess capacity?', 'Which skills will be short in Q4?'],
};

// Deterministic, weighted "vibe" scoring — same convention as Talent
// Finder's search (data/talentData.js): keyword phrase overlap plus a
// bonus for each recognized entity, so a loosely-worded or paraphrased
// question can still win, not just a verbatim suggested prompt.
export function findBestIntent(query) {
  const entities = parseAdvisorQuery(query);
  const q = entities.raw.toLowerCase();
  if (!q) return { intent: FALLBACK, entities, card: FALLBACK.buildCard(entities), score: 0 };

  let best = null;
  let bestScore = 0;
  INTENTS.forEach((intent) => {
    let score = 0;
    if (intent.match(q, entities)) score += 50;
    intent.keywords.forEach((k) => { if (q.includes(k)) score += 20; });
    const wordOverlap = intent.keywords.join(' ').split(/\s+/).filter((w) => w.length > 3 && q.includes(w)).length;
    score += wordOverlap * 5;
    if (score > bestScore) { bestScore = score; best = intent; }
  });

  const intent = bestScore > 0 ? best : FALLBACK;
  return { intent, entities, card: intent.buildCard(entities), score: bestScore };
}
