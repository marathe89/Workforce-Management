import React, { useRef, useState } from 'react';
import {
  EMPLOYEE_CSV_HEADERS, EMPLOYEE_CSV_EXAMPLE, EMPLOYEE_CSV_NOTES,
  PROJECT_CSV_HEADERS, PROJECT_CSV_EXAMPLE, PROJECT_CSV_NOTES,
  buildTemplateCsv, downloadCsv, parseCsv,
} from '../data/csvTemplates';
import { createEmployeeFull, createProject } from '../data/employeeProjectApi';

const ROLES = ['employee', 'manager', 'hr_admin', 'executive'];
const EMPLOYMENT_STATUSES = ['active', 'on_leave', 'contract', 'departed'];
const RISK_FLAGS = ['none', 'low', 'medium', 'high'];
const PROJECT_STATUSES = ['planning', 'active', 'on_hold', 'completed'];

const CONFIG = {
  employee: {
    title: 'Employees',
    headers: EMPLOYEE_CSV_HEADERS,
    example: EMPLOYEE_CSV_EXAMPLE,
    notes: EMPLOYEE_CSV_NOTES,
    templateFile: 'employee_upload_template.csv',
    label: (row) => row.name || row.email || '(unnamed row)',
    validate: (row) => {
      const errors = [];
      if (!row.name) errors.push('name is required');
      if (!row.email) errors.push('email is required');
      if (!row.password) errors.push('password is required');
      if (!row.job_title) errors.push('job_title is required');
      if (row.role && !ROLES.includes(row.role)) errors.push(`role must be one of ${ROLES.join('/')}`);
      if (row.employment_status && !EMPLOYMENT_STATUSES.includes(row.employment_status)) errors.push(`employment_status must be one of ${EMPLOYMENT_STATUSES.join('/')}`);
      if (row.risk_flag && !RISK_FLAGS.includes(row.risk_flag)) errors.push(`risk_flag must be one of ${RISK_FLAGS.join('/')}`);
      if (row.manager_id && Number.isNaN(Number(row.manager_id))) errors.push('manager_id must be numeric');
      if (row.performance_rating && (Number.isNaN(Number(row.performance_rating)) || Number(row.performance_rating) < 0 || Number(row.performance_rating) > 5)) errors.push('performance_rating must be 0–5');
      if (row.utilization_rate && (Number.isNaN(Number(row.utilization_rate)) || Number(row.utilization_rate) < 0 || Number(row.utilization_rate) > 100)) errors.push('utilization_rate must be 0–100');
      return errors;
    },
    submit: (row) => createEmployeeFull({
      name: row.name, email: row.email, password: row.password, department: row.department,
      role: row.role || 'employee', manager_id: row.manager_id || null,
      job_title: row.job_title, employment_status: row.employment_status || 'active', hire_date: row.hire_date,
      performance_rating: row.performance_rating, utilization_rate: row.utilization_rate, risk_flag: row.risk_flag || 'none',
    }),
  },
  project: {
    title: 'Projects',
    headers: PROJECT_CSV_HEADERS,
    example: PROJECT_CSV_EXAMPLE,
    notes: PROJECT_CSV_NOTES,
    templateFile: 'project_upload_template.csv',
    label: (row) => row.project_name || '(unnamed row)',
    validate: (row) => {
      const errors = [];
      if (!row.project_name) errors.push('project_name is required');
      if (row.status && !PROJECT_STATUSES.includes(row.status)) errors.push(`status must be one of ${PROJECT_STATUSES.join('/')}`);
      if (row.required_headcount && Number.isNaN(Number(row.required_headcount))) errors.push('required_headcount must be numeric');
      return errors;
    },
    submit: (row) => createProject(row),
  },
};

function Banner({ tone = 'info', children }) {
  const colors = { info: 'var(--w-accent-blue)', success: 'var(--w-green)', error: 'var(--w-red)' };
  const c = colors[tone];
  return (
    <div style={{ background: `color-mix(in srgb, ${c} 10%, transparent)`, border: `1px solid color-mix(in srgb, ${c} 30%, transparent)`, borderRadius: '8px', padding: '10px 14px', fontFamily: 'Inter, sans-serif', fontSize: '12px', color: c }}>
      {children}
    </div>
  );
}

// Bulk CSV upload — download a real template (client-side CSV, working
// download), parse and validate a filled-in file entirely client-side
// before touching the network, then submit each valid row through the
// exact same real backend calls the single Add form uses
// (data/employeeProjectApi.js). Invalid rows are listed with the
// specific reason and never submitted; per-row results (not just a
// pass/fail count) are shown once submission finishes.
function BulkUploadPanel({ type, onDone }) {
  const cfg = CONFIG[type];
  const fileRef = useRef(null);
  const [fileName, setFileName] = useState(null);
  const [rows, setRows] = useState([]); // { row, errors }
  const [results, setResults] = useState(null); // [{ label, ok, message }]
  const [submitting, setSubmitting] = useState(false);
  const [headerError, setHeaderError] = useState(null);

  const validCount = rows.filter((r) => r.errors.length === 0).length;

  const handleDownloadTemplate = () => {
    downloadCsv(cfg.templateFile, buildTemplateCsv(cfg.headers, cfg.example));
  };

  const handleFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setFileName(file.name);
    setResults(null);
    setHeaderError(null);
    const reader = new FileReader();
    reader.onload = () => {
      const { headers, rows: parsedRows } = parseCsv(String(reader.result));
      const missing = cfg.headers.filter((h) => !headers.includes(h));
      if (missing.length > 0) {
        setHeaderError(`Missing column${missing.length > 1 ? 's' : ''}: ${missing.join(', ')}. Use "Download template" to get the exact header row.`);
        setRows([]);
        return;
      }
      setRows(parsedRows.map((row) => ({ row, errors: cfg.validate(row) })));
    };
    reader.readAsText(file);
  };

  const handleUpload = async () => {
    setSubmitting(true);
    const outcomes = [];
    for (const { row, errors } of rows) {
      if (errors.length > 0) continue;
      try {
        await cfg.submit(row);
        outcomes.push({ label: cfg.label(row), ok: true });
      } catch (err) {
        outcomes.push({ label: cfg.label(row), ok: false, message: err.response?.data?.error || err.message });
      }
    }
    setResults(outcomes);
    setSubmitting(false);
    setRows([]);
    setFileName(null);
    if (fileRef.current) fileRef.current.value = '';
    if (outcomes.some((o) => o.ok)) onDone();
  };

  return (
    <div style={{ background: 'var(--w-card-bg)', border: '1px solid var(--w-card-border)', borderRadius: '10px', padding: '18px 20px' }}>
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div>
          <p style={{ fontFamily: '"Outfit", sans-serif', fontWeight: 600, fontSize: '14px', color: 'var(--w-text-primary)' }}>Bulk Upload — {cfg.title}</p>
          <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '11px', color: 'var(--w-text-label)', marginTop: '2px' }}>{cfg.notes}</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={handleDownloadTemplate} style={{ border: '1px solid var(--w-card-border)', borderRadius: '6px', padding: '6px 14px', fontFamily: 'Inter, sans-serif', fontWeight: 600, fontSize: '11px', color: 'var(--w-text-secondary)', whiteSpace: 'nowrap' }}>
            ↓ Download template
          </button>
          <label style={{ border: '1px solid var(--w-accent-blue)', borderRadius: '6px', padding: '6px 14px', fontFamily: 'Inter, sans-serif', fontWeight: 600, fontSize: '11px', color: 'var(--w-accent-blue)', whiteSpace: 'nowrap', cursor: 'pointer' }}>
            ↑ Choose CSV file
            <input ref={fileRef} type="file" accept=".csv,text/csv" onChange={handleFile} style={{ display: 'none' }} />
          </label>
        </div>
      </div>

      {fileName && !headerError && (
        <p style={{ fontFamily: '"DM Mono", monospace', fontSize: '11px', color: 'var(--w-text-label)', marginTop: '10px' }}>{fileName} — {rows.length} row{rows.length === 1 ? '' : 's'} parsed, {validCount} valid</p>
      )}

      {headerError && <div style={{ marginTop: '10px' }}><Banner tone="error">{headerError}</Banner></div>}

      {rows.length > 0 && (
        <div style={{ marginTop: '10px', maxHeight: '220px', overflowY: 'auto', border: '1px solid var(--w-card-border)', borderRadius: '8px' }}>
          <table className="w-full" style={{ borderCollapse: 'collapse' }}>
            <tbody>
              {rows.map((r, i) => (
                <tr key={i} style={{ borderBottom: '1px solid var(--w-sunken-bg)' }}>
                  <td style={{ padding: '6px 10px', fontFamily: 'Inter, sans-serif', fontSize: '11px', color: r.errors.length ? 'var(--w-red)' : 'var(--w-text-primary)', whiteSpace: 'nowrap' }}>
                    {r.errors.length ? '✗' : '✓'} {cfg.label(r.row)}
                  </td>
                  <td style={{ padding: '6px 10px', fontFamily: 'Inter, sans-serif', fontSize: '11px', color: 'var(--w-red)' }}>
                    {r.errors.join('; ')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {rows.length > 0 && (
        <button
          onClick={handleUpload}
          disabled={validCount === 0 || submitting}
          style={{ marginTop: '10px', background: validCount > 0 ? 'var(--w-accent-blue)' : 'var(--w-card-border)', borderRadius: '6px', padding: '8px 16px', fontFamily: 'Inter, sans-serif', fontWeight: 600, fontSize: '12px', color: validCount > 0 ? '#FFFFFF' : 'var(--w-text-label)' }}
        >
          {submitting ? 'Uploading…' : `Upload ${validCount} valid row${validCount === 1 ? '' : 's'}`}
        </button>
      )}

      {results && (
        <div className="flex flex-col gap-1.5" style={{ marginTop: '12px' }}>
          <Banner tone={results.every((r) => r.ok) ? 'success' : 'error'}>
            {results.filter((r) => r.ok).length} of {results.length} rows uploaded successfully.
          </Banner>
          {results.filter((r) => !r.ok).map((r, i) => (
            <p key={i} style={{ fontFamily: '"DM Mono", monospace', fontSize: '10px', color: 'var(--w-red)' }}>✗ {r.label}: {r.message}</p>
          ))}
        </div>
      )}
    </div>
  );
}

export default BulkUploadPanel;
