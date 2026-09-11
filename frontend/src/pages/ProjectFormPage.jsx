import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import apiClient from '../api/client';
import { createProject, updateProject } from '../data/employeeProjectApi';
import { TextInput, SelectInput, Banner, SECTION_STYLE, BTN_PRIMARY, BTN_GHOST, label, inputStyle } from '../components/FormBits';

const PROJECT_STATUSES = ['planning', 'active', 'on_hold', 'completed'];
const TODAY = new Date().toISOString().slice(0, 10);
const emptyForm = { project_name: '', description: '', status: 'planning', start_date: TODAY, end_date: '', required_headcount: '' };

// Dedicated Add/Edit Project page — same pattern as EmployeeFormPage.jsx
// (moved off Data Entry's inline tab so "+ Add Project" / row "Edit" are
// real navigations). PUT /projects/:id already supports every field this
// form has, so unlike employee edit there's no "can't change this here"
// carve-out needed.
function ProjectFormPage() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();

  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(isEdit);
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!isEdit) return;
    setLoading(true);
    apiClient.get(`/projects/${id}`)
      .then((res) => {
        const p = res.data;
        setForm({
          project_name: p.project_name || '', description: p.description || '', status: p.status || 'planning',
          start_date: p.start_date ? String(p.start_date).slice(0, 10) : '', end_date: p.end_date ? String(p.end_date).slice(0, 10) : '',
          required_headcount: p.required_headcount ?? '',
        });
      })
      .catch((err) => setError(err.response?.data?.error || err.message))
      .finally(() => setLoading(false));
  }, [id, isEdit]);

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));
  const canSubmit = form.project_name.trim();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      if (isEdit) await updateProject(id, form);
      else await createProject(form);
      navigate('/data-entry');
    } catch (err) {
      setError(err.response?.data?.error || err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="p-8"><p style={{ fontFamily: 'Inter, sans-serif', color: 'var(--w-text-label)' }}>Loading…</p></div>;
  }

  return (
    <div className="p-8 space-y-4" style={{ maxWidth: '860px' }}>
      <button onClick={() => navigate('/data-entry')} style={{ ...BTN_GHOST, padding: '7px 12px' }}>← Back to Workforce Management</button>
      <div>
        <h1 style={{ fontFamily: '"Outfit", sans-serif', fontWeight: 700, fontSize: '22px', color: 'var(--w-text-primary)' }}>
          {isEdit ? `Edit Project — ${form.project_name}` : 'Add Project'}
        </h1>
        <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '13px', color: 'var(--w-text-label)', marginTop: '4px' }}>Writes to the real backend (projects table).</p>
      </div>

      <form onSubmit={handleSubmit} style={SECTION_STYLE} className="flex flex-col gap-4">
        <div className="flex flex-wrap gap-3">
          <TextInput labelText="Project Name *" value={form.project_name} onChange={set('project_name')} placeholder="e.g. Project Meridian" required />
          <SelectInput labelText="Status" value={form.status} onChange={set('status')} options={PROJECT_STATUSES} />
          <TextInput labelText="Required Headcount" type="number" min="0" value={form.required_headcount} onChange={set('required_headcount')} placeholder="optional" />
        </div>
        <div className="flex flex-wrap gap-3">
          <TextInput labelText="Start Date" type="date" value={form.start_date} onChange={set('start_date')} />
          <TextInput labelText="End Date" type="date" value={form.end_date} onChange={set('end_date')} />
        </div>
        <div>
          <label style={label}>Description</label>
          <textarea value={form.description} onChange={set('description')} rows={3} style={{ ...inputStyle, resize: 'vertical' }} placeholder="What is this project about?" />
        </div>

        {error && <Banner tone="error">{error}</Banner>}

        <div className="flex gap-2">
          <button type="submit" disabled={!canSubmit || submitting} style={{ ...BTN_PRIMARY, opacity: !canSubmit || submitting ? 0.5 : 1 }}>
            {submitting ? (isEdit ? 'Saving…' : 'Creating…') : isEdit ? 'Save Changes' : 'Create Project'}
          </button>
          <button type="button" onClick={() => navigate('/data-entry')} style={BTN_GHOST}>Cancel</button>
        </div>
      </form>
    </div>
  );
}

export default ProjectFormPage;
