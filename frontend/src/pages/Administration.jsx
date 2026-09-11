import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../api/client';
import useProfileStore from '../stores/profileStore';
import useAccessStore, { FEATURES } from '../stores/accessStore';

// Matches nothing in Figma — a genuinely new admin surface, built on the
// same real backend Data Entry writes to (Express + Postgres), plus the
// frontend-only persona/feature-access system (profileStore.js /
// accessStore.js). Two tabs:
//
// - People Management: the full user roster (GET /api/users, new route
//   — GET /api/employees only ever returns role='employee' rows) with
//   inline edit (role/department/manager), Add (→ the real Add Employee
//   page), Delete (real DELETE /api/users/:id), and a deactivate action
//   for rows that have an employee profile.
// - Role Management: the frontend-only persona roster (profileStore.js)
//   — add/rename/remove roles — and the feature-access matrix (which
//   pages each role can reach), editable live, enforced for real by
//   Sidebar.jsx (locked nav items) and AccessGuard.jsx (direct URL
//   navigation). The matrix shows role TITLES only, not people's names.
const ROLES = ['employee', 'manager', 'hr_admin', 'executive'];

const SECTION_STYLE = { background: 'var(--w-card-bg)', border: '1px solid var(--w-card-border)', borderRadius: '10px', padding: '20px 24px' };
const th = { textAlign: 'left', padding: '0 10px 8px 10px', fontFamily: '"DM Mono", monospace', fontWeight: 500, fontSize: '10px', letterSpacing: '0.4px', textTransform: 'uppercase', color: 'var(--w-text-label)', borderBottom: '1px solid var(--w-divider)', whiteSpace: 'nowrap' };
const td = { padding: '8px 10px', fontSize: '12px', borderBottom: '1px solid var(--w-sunken-bg)', fontFamily: 'Inter, sans-serif', color: 'var(--w-text-secondary)' };
const selectStyle = { background: 'var(--w-sunken-bg)', border: '1px solid var(--w-card-border)', borderRadius: '5px', padding: '4px 6px', fontFamily: 'Inter, sans-serif', fontSize: '11px', color: 'var(--w-text-primary)' };
const smallInput = { ...selectStyle, width: '160px' };
const btnPrimary = { background: 'var(--w-accent-blue)', borderRadius: '6px', padding: '6px 14px', fontFamily: 'Inter, sans-serif', fontWeight: 600, fontSize: '11px', color: '#FFFFFF', whiteSpace: 'nowrap' };
const btnGhost = { border: '1px solid var(--w-card-border)', borderRadius: '6px', padding: '6px 14px', fontFamily: 'Inter, sans-serif', fontWeight: 600, fontSize: '11px', color: 'var(--w-text-secondary)', whiteSpace: 'nowrap' };
const btnDanger = { border: '1px solid var(--w-red)', borderRadius: '5px', padding: '4px 10px', fontFamily: 'Inter, sans-serif', fontWeight: 600, fontSize: '11px', color: 'var(--w-red)', whiteSpace: 'nowrap' };

function Banner({ tone = 'info', children }) {
  const colors = { info: 'var(--w-accent-blue)', success: 'var(--w-green)', error: 'var(--w-red)' };
  const c = colors[tone];
  return (
    <div style={{ background: `color-mix(in srgb, ${c} 10%, transparent)`, border: `1px solid color-mix(in srgb, ${c} 30%, transparent)`, borderRadius: '8px', padding: '10px 14px', fontFamily: 'Inter, sans-serif', fontSize: '12px', color: c }}>
      {children}
    </div>
  );
}

function PeopleManagement() {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [edits, setEdits] = useState({}); // { [id]: { role, department, manager_id } }
  const [savingId, setSavingId] = useState(null);
  const [message, setMessage] = useState(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiClient.get('/users');
      setUsers(res.data);
    } catch (err) {
      setError(err.response?.data?.error || err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { refresh(); }, [refresh]);

  const edited = (u, field) => (edits[u.id]?.[field] ?? (field === 'manager_id' ? (u.manager_id || '') : u[field])) || '';
  const setEdit = (id, field, value) => setEdits((e) => ({ ...e, [id]: { ...e[id], [field]: value } }));

  const save = async (u) => {
    setSavingId(u.id);
    setMessage(null);
    try {
      const payload = {
        role: edited(u, 'role'),
        department: edited(u, 'department'),
        manager_id: edited(u, 'manager_id') || null,
      };
      await apiClient.put(`/users/${u.id}`, payload);
      setMessage({ tone: 'success', text: `✓ Saved changes for ${u.name}.` });
      setEdits((e) => { const next = { ...e }; delete next[u.id]; return next; });
      refresh();
    } catch (err) {
      setMessage({ tone: 'error', text: `Could not save ${u.name}: ${err.response?.data?.error || err.message}` });
    } finally {
      setSavingId(null);
    }
  };

  const deactivate = async (u) => {
    setSavingId(u.id);
    setMessage(null);
    try {
      await apiClient.put(`/employees/${u.id}`, { employment_status: 'departed' });
      setMessage({ tone: 'success', text: `✓ ${u.name} marked departed.` });
      refresh();
    } catch (err) {
      setMessage({ tone: 'error', text: `Could not deactivate ${u.name}: ${err.response?.data?.error || err.message}` });
    } finally {
      setSavingId(null);
    }
  };

  const remove = async (u) => {
    if (!window.confirm(`Delete ${u.name} permanently? This can't be undone.`)) return;
    setSavingId(u.id);
    setMessage(null);
    try {
      await apiClient.delete(`/users/${u.id}`);
      setMessage({ tone: 'success', text: `✓ ${u.name} deleted.` });
      refresh();
    } catch (err) {
      setMessage({ tone: 'error', text: `Could not delete ${u.name}: ${err.response?.data?.error || err.message}` });
    } finally {
      setSavingId(null);
    }
  };

  return (
    <div style={SECTION_STYLE}>
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div>
          <p style={{ fontFamily: '"Outfit", sans-serif', fontWeight: 600, fontSize: '16px', color: 'var(--w-text-primary)' }}>People Management</p>
          <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '12px', color: 'var(--w-text-tertiary)', marginTop: '2px' }}>Real backend roster ({users.length} accounts) — add, edit, deactivate, or delete a person.</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={refresh} style={btnGhost}>{loading ? 'Refreshing…' : '↻ Refresh'}</button>
          <button onClick={() => navigate('/data-entry/employees/new')} style={btnPrimary}>+ Add Person</button>
        </div>
      </div>

      {error && <div style={{ marginTop: '10px' }}><Banner tone="error">Could not reach the backend: {error}</Banner></div>}
      {message && <div style={{ marginTop: '10px' }}><Banner tone={message.tone}>{message.text}</Banner></div>}

      <div className="overflow-x-auto" style={{ marginTop: '14px' }}>
        <table className="w-full" style={{ borderCollapse: 'collapse' }}>
          <thead>
            <tr>{['ID', 'Name', 'Email', 'Role', 'Department', 'Manager', 'Job Title', 'Status', ''].map((h) => <th key={h} style={th}>{h}</th>)}</tr>
          </thead>
          <tbody>
            {users.map((u) => {
              const dirty = Boolean(edits[u.id]);
              return (
                <tr key={u.id}>
                  <td style={{ ...td, fontFamily: '"DM Mono", monospace' }}>{u.id}</td>
                  <td style={{ ...td, color: 'var(--w-text-primary)', fontWeight: 600, whiteSpace: 'nowrap' }}>{u.name}</td>
                  <td style={{ ...td, whiteSpace: 'nowrap' }}>{u.email}</td>
                  <td style={td}>
                    <select style={selectStyle} value={edited(u, 'role')} onChange={(e) => setEdit(u.id, 'role', e.target.value)}>
                      {ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
                    </select>
                  </td>
                  <td style={td}>
                    <input style={{ ...selectStyle, width: '110px' }} value={edited(u, 'department')} onChange={(e) => setEdit(u.id, 'department', e.target.value)} />
                  </td>
                  <td style={td}>
                    <select style={selectStyle} value={edited(u, 'manager_id')} onChange={(e) => setEdit(u.id, 'manager_id', e.target.value)}>
                      <option value="">— None —</option>
                      {users.filter((m) => m.id !== u.id).map((m) => <option key={m.id} value={m.id}>{m.name}</option>)}
                    </select>
                  </td>
                  <td style={{ ...td, whiteSpace: 'nowrap' }}>{u.job_title || '—'}</td>
                  <td style={{ ...td, whiteSpace: 'nowrap' }}>{u.employment_status || '—'}</td>
                  <td style={{ ...td, whiteSpace: 'nowrap' }}>
                    <div className="flex gap-1.5">
                      <button
                        onClick={() => save(u)}
                        disabled={!dirty || savingId === u.id}
                        style={{ background: dirty ? 'var(--w-accent-blue)' : 'var(--w-card-border)', borderRadius: '5px', padding: '4px 10px', fontFamily: 'Inter, sans-serif', fontWeight: 600, fontSize: '11px', color: dirty ? '#FFFFFF' : 'var(--w-text-label)' }}
                      >
                        {savingId === u.id ? '…' : 'Save'}
                      </button>
                      {u.job_title && u.employment_status !== 'departed' && (
                        <button onClick={() => deactivate(u)} disabled={savingId === u.id} style={btnDanger}>
                          Deactivate
                        </button>
                      )}
                      <button onClick={() => remove(u)} disabled={savingId === u.id} style={btnDanger}>
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function RoleManagement() {
  const roles = useProfileStore((s) => s.roles);
  const addRole = useProfileStore((s) => s.addRole);
  const editRole = useProfileStore((s) => s.editRole);
  const deleteRole = useProfileStore((s) => s.deleteRole);
  const matrix = useAccessStore((s) => s.matrix);
  const toggleFeature = useAccessStore((s) => s.toggleFeature);
  const resetToDefaults = useAccessStore((s) => s.resetToDefaults);
  const togglableFeatures = FEATURES.filter((f) => f.id !== '/administration');

  const [roleEdits, setRoleEdits] = useState({}); // { [id]: { name, role } }
  const [newRoleTitle, setNewRoleTitle] = useState('');
  const [newRoleName, setNewRoleName] = useState('');
  const [roleError, setRoleError] = useState(null);

  const roleEdited = (r, field) => roleEdits[r.id]?.[field] ?? r[field] ?? '';
  const setRoleEdit = (id, field, value) => setRoleEdits((e) => ({ ...e, [id]: { ...e[id], [field]: value } }));

  const handleAddRole = () => {
    setRoleError(null);
    if (!newRoleTitle.trim()) {
      setRoleError('Role title is required.');
      return;
    }
    addRole({ name: newRoleName, role: newRoleTitle });
    setNewRoleTitle('');
    setNewRoleName('');
  };

  const handleSaveRole = (r) => {
    const nextTitle = roleEdited(r, 'role').trim();
    if (!nextTitle) {
      setRoleError('Role title cannot be empty.');
      return;
    }
    setRoleError(null);
    editRole(r.id, { name: roleEdited(r, 'name'), role: nextTitle });
    setRoleEdits((e) => { const next = { ...e }; delete next[r.id]; return next; });
  };

  const handleDeleteRole = (r) => {
    if (roles.length <= 1) {
      setRoleError('At least one role must remain.');
      return;
    }
    if (!window.confirm(`Delete the "${r.role}" role? Its feature-access settings will be removed, and anyone currently using it will switch to another role.`)) return;
    deleteRole(r.id);
  };

  return (
    <div className="flex flex-col gap-4">
      <div style={SECTION_STYLE}>
        <p style={{ fontFamily: '"Outfit", sans-serif', fontWeight: 600, fontSize: '16px', color: 'var(--w-text-primary)' }}>Roles</p>
        <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '12px', color: 'var(--w-text-tertiary)', marginTop: '2px' }}>
          Add, rename, or remove the roles available below and in the profile switcher (avatar menu, top right). Display name is optional — used only in the switcher, never in the Feature Access matrix.
        </p>

        {roleError && <div style={{ marginTop: '10px' }}><Banner tone="error">{roleError}</Banner></div>}

        <div className="flex flex-col gap-2" style={{ marginTop: '12px' }}>
          {roles.map((r) => {
            const dirty = Boolean(roleEdits[r.id]);
            return (
              <div key={r.id} className="flex flex-wrap items-center gap-2">
                <input value={roleEdited(r, 'role')} onChange={(e) => setRoleEdit(r.id, 'role', e.target.value)} placeholder="Role title *" style={smallInput} />
                <input value={roleEdited(r, 'name')} onChange={(e) => setRoleEdit(r.id, 'name', e.target.value)} placeholder="Display name (optional)" style={smallInput} />
                <button onClick={() => handleSaveRole(r)} disabled={!dirty} style={{ ...btnGhost, color: dirty ? 'var(--w-accent-blue)' : 'var(--w-text-label)', borderColor: dirty ? 'var(--w-accent-blue)' : 'var(--w-card-border)' }}>
                  Save
                </button>
                <button onClick={() => handleDeleteRole(r)} disabled={roles.length <= 1} style={{ ...btnDanger, opacity: roles.length <= 1 ? 0.4 : 1 }}>
                  Delete
                </button>
              </div>
            );
          })}
        </div>

        <div className="flex flex-wrap items-center gap-2" style={{ marginTop: '12px', paddingTop: '12px', borderTop: '1px solid var(--w-divider)' }}>
          <input value={newRoleTitle} onChange={(e) => setNewRoleTitle(e.target.value)} placeholder="New role title *" style={smallInput} />
          <input value={newRoleName} onChange={(e) => setNewRoleName(e.target.value)} placeholder="Display name (optional)" style={smallInput} />
          <button onClick={handleAddRole} style={btnPrimary}>+ Add Role</button>
        </div>
      </div>

      <div style={SECTION_STYLE}>
        <div className="flex items-center justify-between">
          <div>
            <p style={{ fontFamily: '"Outfit", sans-serif', fontWeight: 600, fontSize: '16px', color: 'var(--w-text-primary)' }}>Role Management — Feature Access</p>
            <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '12px', color: 'var(--w-text-tertiary)', marginTop: '2px' }}>
              Which pages each role can reach. Enforced live — try switching profile (avatar menu, top right) after changing a box below.
            </p>
          </div>
          <button onClick={resetToDefaults} style={btnGhost}>Reset to defaults</button>
        </div>

        <div style={{ marginTop: '10px' }}>
          <Banner tone="info">Administration is always reachable by every role — otherwise unchecking it here could permanently lock everyone out of this screen — so it isn't listed below. A newly added role starts with no access until you grant some here.</Banner>
        </div>

        <div className="overflow-x-auto" style={{ marginTop: '14px' }}>
          <table className="w-full" style={{ borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <th style={th}>Feature</th>
                {roles.map((r) => <th key={r.id} style={{ ...th, textAlign: 'center' }}>{r.role}</th>)}
              </tr>
            </thead>
            <tbody>
              {togglableFeatures.map((f) => (
                <tr key={f.id}>
                  <td style={{ ...td, color: 'var(--w-text-primary)', fontWeight: 600, whiteSpace: 'nowrap' }}>{f.label}</td>
                  {roles.map((r) => {
                    const checked = (matrix[r.id] || []).includes(f.id);
                    return (
                      <td key={r.id} style={{ ...td, textAlign: 'center' }}>
                        <input type="checkbox" checked={checked} onChange={() => toggleFeature(r.id, f.id)} style={{ width: '16px', height: '16px', cursor: 'pointer' }} />
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function Administration() {
  const [tab, setTab] = useState('people');

  return (
    <div className="p-8 space-y-4">
      <div>
        <h1 style={{ fontFamily: '"Outfit", sans-serif', fontWeight: 700, fontSize: '24px', lineHeight: '36px', color: 'var(--w-text-primary)' }}>
          Administration
        </h1>
        <p style={{ fontFamily: 'Inter, sans-serif', fontWeight: 400, fontSize: '13px', color: 'var(--w-text-label)', marginTop: '4px' }}>
          Manage people, roles, and which features each role can access.
        </p>
      </div>

      <div className="flex items-center gap-4" style={{ borderBottom: '1px solid var(--w-divider)' }}>
        {[{ key: 'people', label: 'People Management' }, { key: 'roles', label: 'Role Management' }].map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            style={{
              padding: '10px 4px', fontFamily: 'Inter, sans-serif', fontWeight: 600, fontSize: '13px',
              color: tab === t.key ? 'var(--w-accent-blue)' : 'var(--w-text-label)',
              borderBottom: tab === t.key ? '2px solid var(--w-accent-blue)' : '2px solid transparent',
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'people' ? <PeopleManagement /> : <RoleManagement />}
    </div>
  );
}

export default Administration;
