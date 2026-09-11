// Global search index for the header search box. Aggregates a
// representative, searchable subset of the static mockup data already
// used across this app's pages (employees from TalentResultsTable, skills
// from FullSkillsInventoryTable, reports from Reports.jsx) plus every
// built nav page, so "search data across the portal" has real results to
// return instead of being decorative. Kept as duplicated literals rather
// than importing each page's internal data arrays (those aren't
// exported, and pages should stay free to evolve their own mock data
// independently of what's searchable).
import navigation from '../config/navigation';

const EMPLOYEES = [
  { title: 'Priya Sharma', subtitle: 'Senior Java Engineer · Digital Services', path: '/talent-finder' },
  { title: 'Rahul Mehta', subtitle: 'Lead Data Engineer · Data & AI', path: '/talent-finder' },
  { title: 'Sneha Kulkarni', subtitle: 'UX Designer · Digital Services', path: '/talent-finder' },
  { title: 'Vikram Rao', subtitle: 'DevOps Engineer · Cloud & Infrastructure', path: '/talent-finder' },
  { title: 'Neha Kapoor', subtitle: 'Business Analyst · BFS', path: '/talent-finder' },
  { title: 'Arjun Nair', subtitle: 'Cloud Architect · Cloud & Infrastructure', path: '/talent-finder' },
  { title: 'Rohan Shah', subtitle: 'ML Engineer · Data & AI', path: '/talent-finder' },
  { title: 'Ankit Desai', subtitle: 'Java Tech Lead · Engineering', path: '/talent-finder' },
  { title: 'Aishwarya Reddy', subtitle: 'React Developer · Digital Services', path: '/talent-finder' },
  { title: 'Kabir Singh', subtitle: 'Cloud Architect · Cloud & Infrastructure', path: '/talent-finder' },
  { title: 'Divya Menon', subtitle: 'Data & AI · Bangalore (on bench)', path: '/bench-management' },
  { title: 'Manish Gupta', subtitle: 'Frontend · Hyderabad (on bench)', path: '/bench-management' },
  { title: 'Sanjay Kumar', subtitle: 'Engineering · Pune (on bench)', path: '/bench-management' },
  { title: 'Pooja Iyer', subtitle: 'Testing · Chennai (on bench)', path: '/bench-management' },
];

const SKILLS = [
  { title: 'Java', subtitle: 'Skill · Supply 5,820 / Demand 5,940 · Critical', path: '/skills-intelligence' },
  { title: 'AWS', subtitle: 'Skill · Supply 4,210 / Demand 4,480 · Warning', path: '/skills-intelligence' },
  { title: 'GenAI', subtitle: 'Skill · Supply 820 / Demand 1,240 · Critical', path: '/skills-intelligence' },
  { title: 'Data Engineering', subtitle: 'Skill · Supply 2,840 / Demand 3,190 · Critical', path: '/skills-intelligence' },
  { title: 'Cybersecurity', subtitle: 'Skill · Supply 1,920 / Demand 2,140 · Warning', path: '/skills-intelligence' },
  { title: 'DevOps', subtitle: 'Skill · Supply 3,100 / Demand 3,280 · Warning', path: '/skills-intelligence' },
  { title: 'React', subtitle: 'Skill · Supply 2,640 / Demand 2,590 · Balanced', path: '/skills-intelligence' },
  { title: 'SAP', subtitle: 'Skill · Supply 1,820 / Demand 1,740 · Surplus', path: '/skills-intelligence' },
  { title: 'Azure', subtitle: 'Skill · Supply 2,100 / Demand 2,380 · Warning', path: '/skills-intelligence' },
  { title: 'Salesforce', subtitle: 'Skill · Supply 940 / Demand 880 · Surplus', path: '/skills-intelligence' },
];

const REPORTS = [
  { title: 'Workforce Utilization Report', subtitle: 'Report · Operations', path: '/reports' },
  { title: 'Bench Analysis', subtitle: 'Report · Operations', path: '/reports' },
  { title: 'Capacity Report', subtitle: 'Report · Capacity', path: '/reports' },
  { title: 'Demand Forecast', subtitle: 'Report · Planning', path: '/reports' },
  { title: 'Skills Gap Report', subtitle: 'Report · Talent', path: '/reports' },
  { title: 'Staffing Effectiveness', subtitle: 'Report · Operations', path: '/reports' },
  { title: 'Business Unit Workforce Report', subtitle: 'Report · Executive', path: '/reports' },
  { title: 'Executive Workforce Summary', subtitle: 'Report · Executive', path: '/reports' },
];

const PROJECTS = [
  { title: 'Project Phoenix', subtitle: 'Project · Staffing plan and AI matching', path: '/projects' },
];

const PAGES = navigation.map((n) => ({ title: n.label, subtitle: 'Page', path: n.path }));

const SEARCH_INDEX = [
  ...PAGES.map((p) => ({ ...p, type: 'Page' })),
  ...EMPLOYEES.map((e) => ({ ...e, type: 'Employee' })),
  ...SKILLS.map((s) => ({ ...s, type: 'Skill' })),
  ...PROJECTS.map((p) => ({ ...p, type: 'Project' })),
  ...REPORTS.map((r) => ({ ...r, type: 'Report' })),
];

export function searchPortal(query, limit = 8) {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  return SEARCH_INDEX.filter((item) => item.title.toLowerCase().includes(q) || item.subtitle.toLowerCase().includes(q) || item.type.toLowerCase().includes(q)).slice(0, limit);
}

export default SEARCH_INDEX;
