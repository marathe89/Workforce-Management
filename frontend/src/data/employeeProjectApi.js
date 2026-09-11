import apiClient from '../api/client';

// Shared write logic for both the single Add/Edit forms
// (pages/EmployeeFormPage.jsx, pages/ProjectFormPage.jsx) and bulk CSV
// upload (components/BulkUploadPanel.jsx), so both paths hit the exact
// same real backend calls in the exact same order — a bulk-uploaded row
// is not a separate, lesser code path from a manually-typed one.

// Employee creation is a real 3-step sequence against 3 separate tables
// (users / employee_profiles / employee_skills), matching the schema's
// own normalization — there is no single atomic "create employee"
// endpoint. Throws an Error with a `.step` property naming which of the
// 3 calls failed, so the caller can report exactly where it broke
// instead of a generic "something went wrong".
export async function createEmployeeFull(data) {
  let step = 'account';
  try {
    const signupRes = await apiClient.post('/auth/signup', {
      name: data.name,
      email: data.email,
      password: data.password,
      role: data.role || 'employee',
      department: data.department || null,
      manager_id: data.manager_id || null,
    });
    const userId = signupRes.data.user.id;

    step = 'profile';
    await apiClient.post('/employees', {
      user_id: userId,
      job_title: data.job_title,
      employment_status: data.employment_status || 'active',
      hire_date: data.hire_date || null,
    });
    if (data.performance_rating || data.utilization_rate || (data.risk_flag && data.risk_flag !== 'none')) {
      await apiClient.put(`/employees/${userId}`, {
        performance_rating: data.performance_rating || null,
        utilization_rate: data.utilization_rate || null,
        risk_flag: data.risk_flag || 'none',
      });
    }

    const skills = (data.skills || []).filter((s) => s.skill_name);
    if (skills.length > 0) {
      step = 'skills';
      for (const s of skills) {
        await apiClient.post(`/employees/${userId}/skills`, {
          skill_name: s.skill_name,
          proficiency_level: s.proficiency_level || 'intermediate',
          years_experience: s.years_experience ? Number(s.years_experience) : null,
        });
      }
    }

    const assignments = (data.assignments || []).filter((a) => a.project_id);
    if (assignments.length > 0) {
      step = 'assignments';
      for (const a of assignments) {
        await apiClient.post(`/projects/${a.project_id}/assign`, {
          user_id: userId,
          allocation_percentage: a.allocation_percentage ? Number(a.allocation_percentage) : null,
          start_date: a.start_date || null,
          end_date: a.end_date || null,
        });
      }
    }

    return { id: userId, skillsSaved: skills.length, assignmentsSaved: assignments.length };
  } catch (err) {
    const wrapped = new Error(err.response?.data?.error || err.message);
    wrapped.step = step;
    wrapped.cause = err;
    throw wrapped;
  }
}

// Edit path: PUT /users/:id (name/role/department/manager) always; PUT
// /employees/:id (job_title/employment_status/performance_rating/
// utilization_rate/risk_flag) only if the row already has a profile
// (hasProfile) — a non-employee user (manager/hr_admin/executive) has no
// employee_profiles row, so that call would 404. New skills and project
// assignments are ADDED only (no delete/unassign endpoint exists on the
// backend for either, so this can't remove one from here — same honest
// limitation as everywhere else in this app that only wraps real
// endpoints). A duplicate assignment (same employee + project twice)
// fails with the backend's own UNIQUE(user_id, project_id) constraint
// error, surfaced as-is rather than silently swallowed.
export async function updateEmployeeFull(id, data, { hasProfile }) {
  let step = 'account';
  try {
    await apiClient.put(`/users/${id}`, {
      name: data.name,
      role: data.role,
      department: data.department || null,
      manager_id: data.manager_id || '',
    });

    if (hasProfile) {
      step = 'profile';
      await apiClient.put(`/employees/${id}`, {
        job_title: data.job_title || null,
        employment_status: data.employment_status || null,
        performance_rating: data.performance_rating || null,
        utilization_rate: data.utilization_rate || null,
        risk_flag: data.risk_flag || null,
      });
    }

    const skills = (data.skills || []).filter((s) => s.skill_name);
    if (skills.length > 0 && hasProfile) {
      step = 'skills';
      for (const s of skills) {
        await apiClient.post(`/employees/${id}/skills`, {
          skill_name: s.skill_name,
          proficiency_level: s.proficiency_level || 'intermediate',
          years_experience: s.years_experience ? Number(s.years_experience) : null,
        });
      }
    }

    const assignments = (data.assignments || []).filter((a) => a.project_id);
    if (assignments.length > 0) {
      step = 'assignments';
      for (const a of assignments) {
        await apiClient.post(`/projects/${a.project_id}/assign`, {
          user_id: id,
          allocation_percentage: a.allocation_percentage ? Number(a.allocation_percentage) : null,
          start_date: a.start_date || null,
          end_date: a.end_date || null,
        });
      }
    }

    return { id, skillsSaved: skills.length, assignmentsSaved: assignments.length };
  } catch (err) {
    const wrapped = new Error(err.response?.data?.error || err.message);
    wrapped.step = step;
    wrapped.cause = err;
    throw wrapped;
  }
}

export async function createProject(data) {
  const res = await apiClient.post('/projects', {
    project_name: data.project_name,
    description: data.description || null,
    status: data.status || 'planning',
    start_date: data.start_date || null,
    end_date: data.end_date || null,
    required_headcount: data.required_headcount ? Number(data.required_headcount) : null,
  });
  return res.data;
}

export async function updateProject(id, data) {
  const res = await apiClient.put(`/projects/${id}`, {
    project_name: data.project_name,
    description: data.description || null,
    status: data.status,
    start_date: data.start_date || null,
    end_date: data.end_date || null,
    required_headcount: data.required_headcount ? Number(data.required_headcount) : null,
  });
  return res.data;
}
