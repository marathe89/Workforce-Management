import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import apiClient from '../api/client';
import { createEmployeeFull, updateEmployeeFull } from '../data/employeeProjectApi';
import { Field, TextInput, SelectInput, Banner, SECTION_STYLE, BTN_PRIMARY, BTN_GHOST, label, inputStyle } from '../components/FormBits';

const ROLES = ['employee', 'manager', 'hr_admin', 'executive'];
const EMPLOYMENT_STATUSES = ['active', 'on_leave', 'contract', 'departed'];
const RISK_FLAGS = ['none', 'low', 'medium', 'high'];
const PROFICIENCIES = ['beginner', 'intermediate', 'advanced', 'expert'];
const TODAY = new Date().toISOString().slice(0, 10);

function newSkillRow() {
  return { key: Math.random().toString(36).slice(2), skill_name: '', proficiency_level: 'intermediate', years_experience: '' };
}
function newAssignmentRow() {
  return { key: Math.random().toString(36).slice(2), project_id: '', allocation_percentage: '', start_date: TODAY, end_date: '' };
}
const emptyForm = {
  name: '', email: '', password: '', department: '', role: 'employee', manager_id: '',
  job_title: '', employment_status: 'active', hire_date: TODAY, performance_rating: '', utilization_rate: '', risk_flag: 'none',
};

// Dedicated Add/Edit Employee page (was an inline tab on Data Entry —
// moved out to its own page/route so "+ Add Employee" and each row's
// "Edit" action are real navigations, not a tab switch that loses your
// place in the Live Directory). Same component handles both: `id` from
// the route decides Add vs Edit, reusing data/employeeProjectApi.js so
// both paths hit the exact same real backend calls a bulk-uploaded row
// does.
function EmployeeFormPage() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();

  const [form, setForm] = useState(emptyForm);
  const [skills, setSkills] = useState([newSkillRow()]);
  const [existingSkills, setExistingSkills] = useState([]);
  const [assignments, setAssignments] = useState([newAssignmentRow()]);
  const [existingAssignments, setExistingAssignments] = useState([]);
  const [managers, setManagers] = useState([]);
  const [projects, setProjects] = useState([]);
  const [hasProfile, setHasProfile] = useState(false);
  const [loading, setLoading] = useState(isEdit);
  const [step, setStep] = useState(null);
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    apiClient.get('/users').then((res) => setManagers(res.data)).catch(() => {});
    apiClient.get('/projects').then((res) => setProjects(res.data)).catch(() => {});
  }, []);

  useEffect(() => {
    if (!isEdit) return;
    setLoading(true);
    apiClient.get(`/employees/${id}`)
      .then((res) => {
        const u = res.data;
        setForm({
          name: u.name || '', email: u.email || '', password: '', department: u.department || '',
          role: u.role || 'employee', manager_id: u.manager_id || '',
          job_title: u.job_title || '', employment_status: u.employment_status || 'active', hire_date: u.hire_date ? String(u.hire_date).slice(0, 10) : '',
          performance_rating: u.performance_rating ?? '', utilization_rate: u.utilization_rate ?? '', risk_flag: u.risk_flag || 'none',
        });
        setHasProfile(Boolean(u.job_title || u.employment_status));
        setExistingSkills(u.skills || []);
        setExistingAssignments(u.projects || []);
      })
      .catch((err) => setError(err.response?.data?.error || err.message))
      .finally(() => setLoading(false));
  }, [id, isEdit]);

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));
  const setSkill = (key, field, value) => setSkills((rows) => rows.map((r) => (r.key === key ? { ...r, [field]: value } : r)));
  const addSkill = () => setSkills((rows) => [...rows, newSkillRow()]);
  const removeSkill = (key) => setSkills((rows) => rows.filter((r) => r.key !== key));

  const setAssignment = (key, field, value) => setAssignments((rows) => rows.map((r) => (r.key === key ? { ...r, [field]: value } : r)));
  const addAssignment = () => setAssignments((rows) => [...rows, newAssignmentRow()]);
  const removeAssignment = (key) => setAssignments((rows) => rows.filter((r) => r.key !== key));
  // GET /employees/:id's project list only returns project_name (not
  // project_id — see employees.js's SELECT), so "already assigned" is
  // matched by name against the fetched project list, not id.
  const assignedProjectNames = new Set(existingAssignments.map((a) => a.project_name));

  const canSubmit = isEdit
    ? form.name.trim() && (!hasProfile || form.job_title.trim())
    : form.name.trim() && form.email.trim() && form.password.trim() && form.job_title.trim();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    const payload = {
      name: form.name.trim(), email: form.email.trim(), password: form.password, department: form.department.trim(),
      role: form.role, manager_id: form.manager_id || null,
      job_title: form.job_title.trim(), employment_status: form.employment_status, hire_date: form.hire_date,
      performance_rating: form.performance_rating, utilization_rate: form.utilization_rate, risk_flag: form.risk_flag,
      skills: skills.filter((s) => s.skill_name.trim()).map((s) => ({ ...s, skill_name: s.skill_name.trim() })),
      assignments: assignments.filter((a) => a.project_id),
    };
    try {
      if (isEdit) {
        await updateEmployeeFull(id, payload, { hasProfile });
      } else {
        await createEmployeeFull(payload);
      }
      navigate('/data-entry');
    } catch (err) {
      const stepLabel = { account: isEdit ? 'saving the account' : 'creating the account', profile: 'saving the employee profile', skills: 'saving skills', assignments: 'assigning to a project' }[err.step] || 'submitting';
      setError(`Failed while ${stepLabel}: ${err.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="p-8"><p style={{ fontFamily: 'Inter, sans-serif', color: 'var(--w-text-label)' }}>Loading…</p></div>;
  }

  return (
    <div className="p-8 space-y-4" style={{ maxWidth: '860px' }}>
      <div className="flex items-center gap-3">
        <button onClick={() => navigate('/data-entry')} style={{ ...BTN_GHOST, padding: '7px 12px' }}>← Back to Workforce Management</button>
      </div>
      <div>
        <h1 style={{ fontFamily: '"Outfit", sans-serif', fontWeight: 700, fontSize: '22px', color: 'var(--w-text-primary)' }}>
          {isEdit ? `Edit Employee — ${form.name}` : 'Add Employee'}
        </h1>
        <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '13px', color: 'var(--w-text-label)', marginTop: '4px' }}>
          {isEdit ? 'Writes to the real backend (users' + (hasProfile ? ' + employee_profiles' : '') + ' tables).' : 'Creates a real account + employee profile in the backend.'}
        </p>
      </div>

      <form onSubmit={handleSubmit} style={SECTION_STYLE} className="flex flex-col gap-4">
        <div className="flex flex-wrap gap-3">
          <TextInput labelText="Full Name *" value={form.name} onChange={set('name')} placeholder="e.g. Meera Iyer" required />
          <TextInput labelText="Email *" type="email" value={form.email} onChange={set('email')} placeholder="meera.iyer@company.com" required disabled={isEdit} hint={isEdit ? 'Email can\'t be changed here.' : undefined} />
          {!isEdit && <TextInput labelText="Temporary Password *" type="text" value={form.password} onChange={set('password')} placeholder="At least 8 characters" required />}
        </div>
        <div className="flex flex-wrap gap-3">
          <TextInput labelText="Department" value={form.department} onChange={set('department')} placeholder="e.g. Engineering" />
          <SelectInput labelText="System Role" value={form.role} onChange={set('role')} options={ROLES} />
          <SelectInput
            labelText="Reporting Manager"
            value={form.manager_id}
            onChange={set('manager_id')}
            options={[{ value: '', text: '— None —' }, ...managers.filter((m) => String(m.id) !== String(id)).map((m) => ({ value: m.id, text: `${m.name} (${m.job_title || m.role})` }))]}
          />
        </div>

        <div style={{ height: '1px', background: 'var(--w-divider)' }} />

        {isEdit && !hasProfile ? (
          <Banner tone="info">This account has no employee profile (job title/status/risk) — it's a {form.role.replace('_', ' ')} account without one, and this page can't create one after the fact (the backend only creates a profile at employee creation time).</Banner>
        ) : (
          <>
            <div className="flex flex-wrap gap-3">
              <TextInput labelText="Job Title *" value={form.job_title} onChange={set('job_title')} placeholder="e.g. Java Engineer" required />
              <SelectInput labelText="Employment Status" value={form.employment_status} onChange={set('employment_status')} options={EMPLOYMENT_STATUSES} />
              <TextInput labelText="Hire Date" type="date" value={form.hire_date} onChange={set('hire_date')} disabled={isEdit} hint={isEdit ? 'Set at creation, not editable.' : undefined} />
            </div>
            <div className="flex flex-wrap gap-3">
              <TextInput labelText="Performance Rating (0–5)" type="number" min="0" max="5" step="0.1" value={form.performance_rating} onChange={set('performance_rating')} placeholder="optional" />
              <TextInput labelText="Utilization Rate % (0–100)" type="number" min="0" max="100" value={form.utilization_rate} onChange={set('utilization_rate')} placeholder="optional" />
              <SelectInput labelText="Risk Flag" value={form.risk_flag} onChange={set('risk_flag')} options={RISK_FLAGS} />
            </div>
          </>
        )}

        <div style={{ height: '1px', background: 'var(--w-divider)' }} />

        <div>
          <p style={label}>{isEdit ? 'Add skills' : 'Skills (optional)'}</p>
          {isEdit && existingSkills.length > 0 && (
            <div className="flex flex-wrap gap-1.5" style={{ marginTop: '6px' }}>
              {existingSkills.map((s) => (
                <span key={s.skill_name} style={{ background: 'var(--w-sunken-bg)', border: '1px solid var(--w-card-border)', borderRadius: '20px', padding: '3px 10px', fontFamily: 'Inter, sans-serif', fontSize: '11px', color: 'var(--w-text-secondary)' }}>
                  {s.skill_name} · {s.proficiency_level}
                </span>
              ))}
            </div>
          )}
          <div className="flex flex-col gap-2" style={{ marginTop: '8px' }}>
            {skills.map((s) => (
              <div key={s.key} className="flex flex-wrap items-end gap-2">
                <Field>
                  <input value={s.skill_name} onChange={(e) => setSkill(s.key, 'skill_name', e.target.value)} placeholder="Skill, e.g. Java" style={inputStyle} />
                </Field>
                <div style={{ width: '150px' }}>
                  <select value={s.proficiency_level} onChange={(e) => setSkill(s.key, 'proficiency_level', e.target.value)} style={inputStyle}>
                    {PROFICIENCIES.map((p) => <option key={p} value={p}>{p}</option>)}
                  </select>
                </div>
                <div style={{ width: '110px' }}>
                  <input type="number" min="0" value={s.years_experience} onChange={(e) => setSkill(s.key, 'years_experience', e.target.value)} placeholder="Years" style={inputStyle} />
                </div>
                <button type="button" onClick={() => removeSkill(s.key)} disabled={skills.length === 1} aria-label="Remove skill" style={{ height: '34px', width: '34px', color: skills.length === 1 ? 'var(--w-text-label)' : 'var(--w-red)' }}>×</button>
              </div>
            ))}
          </div>
          <button type="button" onClick={addSkill} style={{ marginTop: '8px', fontFamily: 'Inter, sans-serif', fontWeight: 600, fontSize: '12px', color: 'var(--w-accent-blue)' }}>+ Add another skill</button>
        </div>

        <div style={{ height: '1px', background: 'var(--w-divider)' }} />

        <div>
          <p style={label}>Project Assignments (optional)</p>
          {isEdit && existingAssignments.length > 0 && (
            <div className="flex flex-wrap gap-1.5" style={{ marginTop: '6px' }}>
              {existingAssignments.map((a, i) => (
                <span key={i} style={{ background: 'var(--w-sunken-bg)', border: '1px solid var(--w-card-border)', borderRadius: '20px', padding: '3px 10px', fontFamily: 'Inter, sans-serif', fontSize: '11px', color: 'var(--w-text-secondary)' }}>
                  {a.project_name} · {a.allocation_percentage}% · {a.assignment_status}
                </span>
              ))}
            </div>
          )}
          <div className="flex flex-col gap-2" style={{ marginTop: '8px' }}>
            {assignments.map((a) => (
              <div key={a.key} className="flex flex-wrap items-end gap-2">
                <Field>
                  <select value={a.project_id} onChange={(e) => setAssignment(a.key, 'project_id', e.target.value)} style={inputStyle}>
                    <option value="">— Select project —</option>
                    {projects.filter((p) => !assignedProjectNames.has(p.project_name)).map((p) => (
                      <option key={p.id} value={p.id}>{p.project_name} ({p.status})</option>
                    ))}
                  </select>
                </Field>
                <div style={{ width: '100px' }}>
                  <input type="number" min="0" max="100" value={a.allocation_percentage} onChange={(e) => setAssignment(a.key, 'allocation_percentage', e.target.value)} placeholder="Alloc %" style={inputStyle} />
                </div>
                <div style={{ width: '140px' }}>
                  <input type="date" value={a.start_date} onChange={(e) => setAssignment(a.key, 'start_date', e.target.value)} style={inputStyle} />
                </div>
                <div style={{ width: '140px' }}>
                  <input type="date" value={a.end_date} onChange={(e) => setAssignment(a.key, 'end_date', e.target.value)} placeholder="End (optional)" style={inputStyle} />
                </div>
                <button type="button" onClick={() => removeAssignment(a.key)} disabled={assignments.length === 1} aria-label="Remove assignment" style={{ height: '34px', width: '34px', color: assignments.length === 1 ? 'var(--w-text-label)' : 'var(--w-red)' }}>×</button>
              </div>
            ))}
          </div>
          {projects.length === 0 && <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '11px', color: 'var(--w-text-label)', marginTop: '6px' }}>No projects exist yet — create one from Workforce Management → Add Project first.</p>}
          <button type="button" onClick={addAssignment} style={{ marginTop: '8px', fontFamily: 'Inter, sans-serif', fontWeight: 600, fontSize: '12px', color: 'var(--w-accent-blue)' }}>+ Assign to another project</button>
          <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '10px', color: 'var(--w-text-label)', marginTop: '4px' }}>
            New assignments are created as "proposed" (the backend's own default) — there's no unassign action here, same limitation as skills above.
          </p>
        </div>

        {error && <Banner tone="error">{error}</Banner>}

        <div className="flex gap-2">
          <button type="submit" disabled={!canSubmit || submitting} style={{ ...BTN_PRIMARY, opacity: !canSubmit || submitting ? 0.5 : 1 }}>
            {submitting ? (isEdit ? 'Saving…' : 'Creating…') : isEdit ? 'Save Changes' : 'Create Employee'}
          </button>
          <button type="button" onClick={() => navigate('/data-entry')} style={BTN_GHOST}>Cancel</button>
        </div>
      </form>
    </div>
  );
}

export default EmployeeFormPage;
