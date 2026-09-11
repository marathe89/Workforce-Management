// Shared Talent Finder data + a lightweight "vibe search" engine.
// No NL backend exists (same as the Header's own search), so this is a
// rule-based parser + weighted scorer rather than a model call — it
// recognizes skills, locations, availability phrases ("immediate",
// "within 30 days", "> 40% capacity") and role/practice keywords
// embedded in a free-text query, and ranks every candidate by how well
// they match instead of doing a strict AND/boolean filter. That's what
// makes it "vibe" rather than literal: a query can partially match and
// still surface good candidates, ranked, rather than returning nothing.
export const TALENT = [
  { initials: 'PS', name: 'Priya Sharma', practice: 'Digital Services', role: 'Senior Java Engineer', skills: ['Java', 'AWS', 'Kubernetes'], project: 'Project Atlas', allocation: 60, available: 40, availableFrom: '15 Sep', location: 'Pune / BLR', match: 96 },
  { initials: 'RM', name: 'Rahul Mehta', practice: 'Data & AI', role: 'Lead Data Engineer', skills: ['Python', 'Spark', 'AWS'], project: 'Project Orion', allocation: 50, available: 50, availableFrom: 'Immediate', location: 'Pune / BLR', match: 92 },
  { initials: 'SK', name: 'Sneha Kulkarni', practice: 'Digital Services', role: 'UX Designer', skills: ['UX', 'Figma', 'Design Systems'], project: 'Project Nova', allocation: 70, available: 30, availableFrom: '1 Oct', location: 'Pune / BLR', match: 89 },
  { initials: 'VR', name: 'Vikram Rao', practice: 'Cloud & Infrastructure', role: 'DevOps Engineer', skills: ['Kubernetes', 'Terraform', 'AWS'], project: 'Project Horizon', allocation: 45, available: 55, availableFrom: 'Immediate', location: 'Pune / BLR', match: 94 },
  { initials: 'NK', name: 'Neha Kapoor', practice: 'BFS', role: 'Business Analyst', skills: ['BA', 'SQL', 'Tableau'], project: 'Project Nexus', allocation: 65, available: 35, availableFrom: '22 Sep', location: 'Pune / BLR', match: 87 },
  { initials: 'AN', name: 'Arjun Nair', practice: 'Cloud & Infrastructure', role: 'Cloud Architect', skills: ['AWS', 'Azure', 'Terraform'], project: 'Project Titan', allocation: 40, available: 60, availableFrom: 'Immediate', location: 'Pune / BLR', match: 91 },
  { initials: 'RS', name: 'Rohan Shah', practice: 'Data & AI', role: 'ML Engineer', skills: ['Python', 'TensorFlow', 'GenAI'], project: 'Project Quantum', allocation: 55, available: 45, availableFrom: '5 Oct', location: 'Pune / BLR', match: 95 },
  { initials: 'AD', name: 'Ankit Desai', practice: 'Engineering', role: 'Java Tech Lead', skills: ['Java', 'Spring Boot', 'Microservices'], project: 'Project Atlas', allocation: 60, available: 40, availableFrom: '30 Sep', location: 'Pune / BLR', match: 93 },
  { initials: 'AR', name: 'Aishwarya Reddy', practice: 'Digital Services', role: 'React Developer', skills: ['React', 'TypeScript', 'GraphQL'], project: 'Project Nova', allocation: 30, available: 70, availableFrom: 'Immediate', location: 'Pune / BLR', match: 88 },
  { initials: 'KS', name: 'Kabir Singh', practice: 'Cloud & Infrastructure', role: 'Cloud Architect', skills: ['AWS', 'Azure', 'Terraform'], project: 'Project Horizon', allocation: 0, available: 100, availableFrom: 'Immediate', location: 'Pune / BLR', match: 91 },
];

export const KNOWN_SKILLS = [...new Set(TALENT.flatMap((p) => p.skills))];
export const KNOWN_LOCATIONS = ['Pune', 'Bangalore', 'BLR', 'Hyderabad', 'Chennai', 'Mumbai'];
export const KNOWN_ROLE_TERMS = [...new Set(TALENT.flatMap((p) => [...p.role.split(' '), p.practice]))].filter((w) => w.length > 2);

const LOCATION_ALIASES = { blr: 'bangalore', bangalore: 'bangalore', bengaluru: 'bangalore' };

export function daysFromToday(availableFrom) {
  if (availableFrom === 'Immediate') return 0;
  // "15 Sep" style — assume the year of the app's current in-context date.
  const parsed = new Date(`${availableFrom} 2026`);
  if (Number.isNaN(parsed.getTime())) return Infinity;
  const today = new Date('2026-09-08');
  return Math.round((parsed - today) / 86400000);
}

// Recognizes structured intent inside a free-text query. Returns the
// pieces used both for scoring (searchTalent) and for the pill row
// (TalentSearchBar) that shows what was actually understood.
export function parseQuery(query) {
  const q = query.trim().toLowerCase();
  const skills = KNOWN_SKILLS.filter((s) => q.includes(s.toLowerCase()));
  const locations = KNOWN_LOCATIONS.filter((l) => q.includes(l.toLowerCase())).map((l) => LOCATION_ALIASES[l.toLowerCase()] || l.toLowerCase());
  const uniqueLocations = [...new Set(locations)];

  let availability = null;
  if (/\bimmediate|asap|right away|now\b/.test(q)) {
    availability = { type: 'immediate', label: 'Available immediately' };
  } else {
    const pctMatch = q.match(/(\d{1,3})\s*%/);
    const daysMatch = q.match(/(?:within\s+)?(\d{1,3})\s*days?/);
    if (pctMatch) {
      availability = { type: 'capacity', value: Number(pctMatch[1]), label: `≥${pctMatch[1]}% available` };
    } else if (daysMatch) {
      availability = { type: 'days', value: Number(daysMatch[1]), label: `Available within ${daysMatch[1]}d` };
    }
  }

  const roleTerms = KNOWN_ROLE_TERMS.filter((term) => q.includes(term.toLowerCase()) && !skills.some((s) => s.toLowerCase() === term.toLowerCase()));

  return { raw: query, skills, locations: uniqueLocations, availability, roleTerms: [...new Set(roleTerms)] };
}

// Weighted "vibe" score, not a strict AND filter — a candidate missing
// one recognized facet can still rank if they're strong on the others,
// same as a human skimming a bench list would judge "close enough"
// candidates rather than only exact matches.
function scoreCandidate(person, criteria) {
  let score = 0;
  const nameMatch = criteria.raw.trim() && person.name.toLowerCase().includes(criteria.raw.trim().toLowerCase());
  if (nameMatch) score += 60;

  const matchedSkills = criteria.skills.filter((s) => person.skills.some((ps) => ps.toLowerCase() === s.toLowerCase()));
  score += matchedSkills.length * 30;

  if (criteria.locations.length > 0) {
    const personLoc = person.location.toLowerCase();
    const hit = criteria.locations.some((l) => personLoc.includes(l) || (l === 'bangalore' && personLoc.includes('blr')));
    if (hit) score += 20;
  }

  if (criteria.availability) {
    const days = daysFromToday(person.availableFrom);
    if (criteria.availability.type === 'immediate' && person.availableFrom === 'Immediate') score += 25;
    if (criteria.availability.type === 'capacity' && person.available >= criteria.availability.value) score += 25;
    if (criteria.availability.type === 'days' && days <= criteria.availability.value) score += 25;
  }

  if (criteria.roleTerms.length > 0) {
    const hay = `${person.role} ${person.practice}`.toLowerCase();
    score += criteria.roleTerms.filter((t) => hay.includes(t.toLowerCase())).length * 20;
  }

  // Generic fallback so an unrecognized word (a project name, a
  // location/skill not in the known lists, etc) still contributes
  // something instead of the candidate scoring a flat zero.
  if (score === 0 && criteria.raw.trim()) {
    const words = criteria.raw.toLowerCase().split(/\s+/).filter((w) => w.length > 2);
    const hay = [person.name, person.role, person.practice, person.project, person.location, ...person.skills].join(' ').toLowerCase();
    score += words.filter((w) => hay.includes(w)).length * 10;
  }

  return score;
}

// Ranked, scored results — not a boolean filter. Empty query returns
// everyone in their existing Match %-sorted order (unchanged behavior).
export function searchTalent(query) {
  const q = query.trim();
  if (!q) return TALENT.map((p) => ({ ...p, searchScore: null }));

  const criteria = parseQuery(query);
  return TALENT.map((p) => ({ ...p, searchScore: scoreCandidate(p, criteria) }))
    .filter((p) => p.searchScore > 0)
    .sort((a, b) => b.searchScore - a.searchScore || b.match - a.match);
}

// Lightweight autocomplete for the search box's dropdown — matches
// skills, roles/practices, locations and candidate names against the
// last word typed, each offered as a full replacement query.
export function getSuggestions(query, limit = 6) {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  const out = [];

  KNOWN_SKILLS.forEach((s) => {
    if (s.toLowerCase().includes(q) && s.toLowerCase() !== q) out.push({ type: 'Skill', text: s });
  });
  [...new Set(TALENT.map((p) => p.role))].forEach((r) => {
    if (r.toLowerCase().includes(q)) out.push({ type: 'Role', text: r });
  });
  KNOWN_LOCATIONS.forEach((l) => {
    if (l.toLowerCase().includes(q)) out.push({ type: 'Location', text: l });
  });
  TALENT.forEach((p) => {
    if (p.name.toLowerCase().includes(q)) out.push({ type: 'Employee', text: p.name });
  });

  // De-dupe by text, cap to `limit`.
  const seen = new Set();
  return out.filter((s) => (seen.has(s.text) ? false : seen.add(s.text))).slice(0, limit);
}
