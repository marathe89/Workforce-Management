// Minimal CSV read/write for the Data Entry bulk-upload workflow — no
// external CSV library added for this (the app has none, and the format
// needed here is simple enough not to justify a new dependency): quoted
// fields (for commas inside a description) and \r\n or \n line endings.

export const EMPLOYEE_CSV_HEADERS = [
  'name', 'email', 'password', 'department', 'role', 'manager_id',
  'job_title', 'employment_status', 'hire_date', 'performance_rating', 'utilization_rate', 'risk_flag',
];
export const EMPLOYEE_CSV_EXAMPLE = [
  'Meera Iyer', 'meera.iyer@company.com', 'temp12345', 'Engineering', 'employee', '',
  'Java Engineer', 'active', '2026-09-01', '4.2', '80', 'low',
];
export const EMPLOYEE_CSV_NOTES = 'role: employee/manager/hr_admin/executive · employment_status: active/on_leave/contract/departed · risk_flag: none/low/medium/high · manager_id: numeric ID from the Live Directory, optional · performance_rating/utilization_rate/risk_flag optional · skills aren\'t supported in bulk upload — add them afterward via Edit.';

export const PROJECT_CSV_HEADERS = ['project_name', 'description', 'status', 'start_date', 'end_date', 'required_headcount'];
export const PROJECT_CSV_EXAMPLE = ['Project Meridian', 'Cloud migration for BFS core banking', 'planning', '2026-10-01', '2027-03-31', '6'];
export const PROJECT_CSV_NOTES = 'status: planning/active/on_hold/completed.';

function escapeCsvField(value) {
  const str = String(value ?? '');
  return /[",\n]/.test(str) ? `"${str.replace(/"/g, '""')}"` : str;
}

export function buildTemplateCsv(headers, exampleRow) {
  return [headers.join(','), exampleRow.map(escapeCsvField).join(',')].join('\r\n');
}

export function downloadCsv(filename, csvText) {
  const blob = new Blob([csvText], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// Parses one line respecting double-quoted fields (with "" as an escaped
// quote inside a quoted field).
function parseCsvLine(line) {
  const fields = [];
  let cur = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i += 1) {
    const ch = line[i];
    if (inQuotes) {
      if (ch === '"') {
        if (line[i + 1] === '"') { cur += '"'; i += 1; } else { inQuotes = false; }
      } else {
        cur += ch;
      }
    } else if (ch === '"') {
      inQuotes = true;
    } else if (ch === ',') {
      fields.push(cur);
      cur = '';
    } else {
      cur += ch;
    }
  }
  fields.push(cur);
  return fields;
}

// Returns { headers, rows } where each row is a plain object keyed by
// header name, with all values trimmed strings. Blank lines are skipped.
export function parseCsv(text) {
  const lines = text.split(/\r\n|\n|\r/).filter((l) => l.trim().length > 0);
  if (lines.length === 0) return { headers: [], rows: [] };
  const headers = parseCsvLine(lines[0]).map((h) => h.trim());
  const rows = lines.slice(1).map((line) => {
    const fields = parseCsvLine(line);
    const row = {};
    headers.forEach((h, i) => { row[h] = (fields[i] ?? '').trim(); });
    return row;
  });
  return { headers, rows };
}
