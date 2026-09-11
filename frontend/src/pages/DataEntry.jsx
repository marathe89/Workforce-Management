import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../api/client';
import BulkUploadPanel from '../components/BulkUploadPanel';
import { Banner, SECTION_STYLE, BTN_GHOST } from '../components/FormBits';

// Sidebar/nav label is "Workforce Management" (renamed from "Data
// Entry" on request) — the component/file/route names below still say
// DataEntry/data-entry internally, that's just implementation detail.
//
// A genuinely different page from the rest of this app: every other page
// renders static Figma-mockup data with no backend behind it. This one
// writes for real — the backend (Express + Postgres) already exposes
// working CRUD for employees and projects.
//
// Live Directory sits at the TOP (moved up from below the forms) since
// it's the primary view now — "+ Add Employee"/"+ Add Project" are CTAs
// that navigate to their own dedicated pages (EmployeeFormPage.jsx /
// ProjectFormPage.jsx) instead of an inline tab, and each row has an
// "Edit" action to the same pages in edit mode. Both write paths (single
// add/edit here, and the Bulk Upload panels below) go through the exact
// same real backend calls — see data/employeeProjectApi.js. Employee
// rows also get a real "Delete" (DELETE /api/users/:id) — confirmed via
// window.confirm first, and surfaces the backend's own foreign-key
// conflict message (someone with project assignments/reports attached
// can't be deleted until those are cleared) rather than failing silently.
//
// Reads from GET /api/users, not GET /api/employees — a real bug caught
// while verifying this page: /api/employees silently scopes to the
// logged-in manager's OWN direct reports (`WHERE u.manager_id = req.
// user.id`) when the caller's role is 'manager', which this app's only
// login is. Any employee created here without picking a Reporting
// Manager (the default) would be created successfully but then never
// show up in this same page's own directory — directly defeating the
// point of "add it, see it here". /api/users (already used by
// Administration → People Management) has no such scoping.
function DataEntry() {
  const navigate = useNavigate();
  const [tab, setTab] = useState('employees');
  const [employees, setEmployees] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetchError, setFetchError] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [actionMessage, setActionMessage] = useState(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setFetchError(null);
    try {
      const [usersRes, projRes] = await Promise.all([apiClient.get('/users'), apiClient.get('/projects')]);
      setEmployees(usersRes.data.filter((u) => u.role === 'employee'));
      setProjects(projRes.data);
    } catch (err) {
      setFetchError(err.response?.data?.error || err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { refresh(); }, [refresh]);

  const deleteEmployee = async (e) => {
    if (!window.confirm(`Delete ${e.name} permanently? This can't be undone.`)) return;
    setDeletingId(e.id);
    setActionMessage(null);
    try {
      await apiClient.delete(`/users/${e.id}`);
      setActionMessage({ tone: 'success', text: `✓ ${e.name} deleted.` });
      refresh();
    } catch (err) {
      setActionMessage({ tone: 'error', text: `Could not delete ${e.name}: ${err.response?.data?.error || err.message}` });
    } finally {
      setDeletingId(null);
    }
  };

  const th = { textAlign: 'left', padding: '0 10px 8px 10px', fontFamily: '"DM Mono", monospace', fontWeight: 500, fontSize: '10px', letterSpacing: '0.4px', textTransform: 'uppercase', color: 'var(--w-text-label)', borderBottom: '1px solid var(--w-divider)', whiteSpace: 'nowrap' };
  const td = { padding: '8px 10px', fontSize: '12px', borderBottom: '1px solid var(--w-sunken-bg)', whiteSpace: 'nowrap', fontFamily: 'Inter, sans-serif', color: 'var(--w-text-secondary)' };
  const editBtn = { border: '1px solid var(--w-card-border)', borderRadius: '5px', padding: '3px 10px', fontFamily: 'Inter, sans-serif', fontWeight: 600, fontSize: '10px', color: 'var(--w-text-secondary)' };
  const deleteBtn = { border: '1px solid var(--w-red)', borderRadius: '5px', padding: '3px 10px', fontFamily: 'Inter, sans-serif', fontWeight: 600, fontSize: '10px', color: 'var(--w-red)' };

  return (
    <div className="p-8 space-y-4">
      <div>
        <h1 style={{ fontFamily: '"Outfit", sans-serif', fontWeight: 700, fontSize: '24px', lineHeight: '36px', color: 'var(--w-text-primary)' }}>
          Workforce Management
        </h1>
        <p style={{ fontFamily: 'Inter, sans-serif', fontWeight: 400, fontSize: '13px', color: 'var(--w-text-label)', marginTop: '4px' }}>
          Add, edit, and monitor employees and projects in the workforce database.
        </p>
      </div>

      <Banner tone="info">
        Unlike the rest of this app (Figma-mockup pages backed by static sample data), this page writes to the real backend (Express + Postgres). New or edited employees/projects are actually persisted — they just aren't yet wired into the other pages' dashboards, which still read their own static datasets.
      </Banner>

      {/* Live Directory — now the top of the page. */}
      <div style={SECTION_STYLE}>
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <p style={{ fontFamily: '"Outfit", sans-serif', fontWeight: 600, fontSize: '16px', color: 'var(--w-text-primary)' }}>Live Directory</p>
            <span style={{ fontFamily: '"DM Mono", monospace', fontSize: '10px', color: 'var(--w-green)', border: '1px solid color-mix(in srgb, var(--w-green) 35%, transparent)', borderRadius: '10px', padding: '2px 8px' }}>● real database</span>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => setTab('employees')} style={{ fontFamily: 'Inter, sans-serif', fontWeight: 600, fontSize: '12px', color: tab === 'employees' ? 'var(--w-accent-blue)' : 'var(--w-text-label)' }}>Employees ({employees.length})</button>
            <button onClick={() => setTab('projects')} style={{ fontFamily: 'Inter, sans-serif', fontWeight: 600, fontSize: '12px', color: tab === 'projects' ? 'var(--w-accent-blue)' : 'var(--w-text-label)' }}>Projects ({projects.length})</button>
            <button onClick={refresh} style={{ ...BTN_GHOST, padding: '5px 12px', fontSize: '11px' }}>{loading ? 'Refreshing…' : '↻ Refresh'}</button>
            {tab === 'employees' ? (
              <button onClick={() => navigate('/data-entry/employees/new')} style={{ background: 'var(--w-accent-blue)', borderRadius: '6px', padding: '6px 14px', fontFamily: 'Inter, sans-serif', fontWeight: 600, fontSize: '12px', color: '#FFFFFF', whiteSpace: 'nowrap' }}>+ Add Employee</button>
            ) : (
              <button onClick={() => navigate('/data-entry/projects/new')} style={{ background: 'var(--w-accent-blue)', borderRadius: '6px', padding: '6px 14px', fontFamily: 'Inter, sans-serif', fontWeight: 600, fontSize: '12px', color: '#FFFFFF', whiteSpace: 'nowrap' }}>+ Add Project</button>
            )}
          </div>
        </div>

        {fetchError && <div style={{ marginTop: '10px' }}><Banner tone="error">Could not reach the backend: {fetchError}</Banner></div>}
        {actionMessage && <div style={{ marginTop: '10px' }}><Banner tone={actionMessage.tone}>{actionMessage.text}</Banner></div>}

        <div className="overflow-x-auto" style={{ marginTop: '14px' }}>
          {tab === 'employees' ? (
            <table className="w-full" style={{ borderCollapse: 'collapse' }}>
              <thead><tr>{['ID', 'Name', 'Email', 'Department', 'Job Title', 'Status', 'Risk', ''].map((h) => <th key={h} style={th}>{h}</th>)}</tr></thead>
              <tbody>
                {employees.length === 0 && !loading && (
                  <tr><td colSpan={8} style={{ ...td, textAlign: 'center', padding: '20px' }}>No employees yet.</td></tr>
                )}
                {employees.map((e) => (
                  <tr key={e.id}>
                    <td style={{ ...td, fontFamily: '"DM Mono", monospace' }}>{e.id}</td>
                    <td style={{ ...td, color: 'var(--w-text-primary)', fontWeight: 600 }}>{e.name}</td>
                    <td style={td}>{e.email}</td>
                    <td style={td}>{e.department || '—'}</td>
                    <td style={td}>{e.job_title || '—'}</td>
                    <td style={td}>{e.employment_status || '—'}</td>
                    <td style={{ ...td, color: e.risk_flag === 'high' ? 'var(--w-red)' : e.risk_flag === 'medium' ? 'var(--w-amber)' : 'var(--w-text-secondary)' }}>{e.risk_flag || '—'}</td>
                    <td style={td}>
                      <div className="flex gap-1.5">
                        <button onClick={() => navigate(`/data-entry/employees/${e.id}/edit`)} style={editBtn}>Edit</button>
                        <button onClick={() => deleteEmployee(e)} disabled={deletingId === e.id} style={deleteBtn}>
                          {deletingId === e.id ? '…' : 'Delete'}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <table className="w-full" style={{ borderCollapse: 'collapse' }}>
              <thead><tr>{['ID', 'Project', 'Status', 'Start', 'End', 'Headcount', ''].map((h) => <th key={h} style={th}>{h}</th>)}</tr></thead>
              <tbody>
                {projects.length === 0 && !loading && (
                  <tr><td colSpan={7} style={{ ...td, textAlign: 'center', padding: '20px' }}>No projects yet.</td></tr>
                )}
                {projects.map((p) => (
                  <tr key={p.id}>
                    <td style={{ ...td, fontFamily: '"DM Mono", monospace' }}>{p.id}</td>
                    <td style={{ ...td, color: 'var(--w-text-primary)', fontWeight: 600 }}>{p.project_name}</td>
                    <td style={td}>{p.status}</td>
                    <td style={td}>{p.start_date ? String(p.start_date).slice(0, 10) : '—'}</td>
                    <td style={td}>{p.end_date ? String(p.end_date).slice(0, 10) : '—'}</td>
                    <td style={td}>{p.required_headcount ?? '—'}</td>
                    <td style={td}><button onClick={() => navigate(`/data-entry/projects/${p.id}/edit`)} style={editBtn}>Edit</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Bulk Upload — CSV template download + upload, for both entity
          types, submitting through the same real backend calls as the
          single Add form above (data/employeeProjectApi.js). */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <BulkUploadPanel type="employee" onDone={refresh} />
        <BulkUploadPanel type="project" onDone={refresh} />
      </div>
    </div>
  );
}

export default DataEntry;
