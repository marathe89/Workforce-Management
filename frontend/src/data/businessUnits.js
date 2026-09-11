import { DEFAULTS as FILTER_DEFAULTS } from '../stores/filterStore';

// Canonical Business Unit list — single source of truth. Previously
// defined only inline in Header.jsx; other widgets that show a
// per-business-unit breakdown (e.g. RecoverableCapacityTable) used their
// own different, made-up unit names ("Digital Services", "Retail", ...)
// that didn't match what the top filter bar's Business Unit dropdown
// actually offers. Import BUSINESS_UNITS (including the "All ..."
// default) wherever a real per-BU breakdown needs to line up with that
// dropdown; import REAL_BUSINESS_UNITS where the "All" option doesn't
// make sense (e.g. one row per unit in a table).
export const BUSINESS_UNITS = [
  FILTER_DEFAULTS.businessUnit,
  'Banking and Financial Services (BFS)',
  'Insurance',
  'Travel, Transportation, and Hospitality (TTH)',
  'Healthcare and Life Sciences / Hi-Tech',
  'Public Sector & Government',
  'Private Equity Business Unit',
  'Momentum AI',
  'Digital Process Automation (DPA)',
];

export const REAL_BUSINESS_UNITS = BUSINESS_UNITS.slice(1);
