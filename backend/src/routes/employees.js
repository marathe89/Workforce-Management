import express from 'express';
import db from '../db/connection.js';
import { authorize } from '../middleware/auth.js';

const router = express.Router();

/**
 * GET /api/employees
 * List all employees (with role-based filtering)
 */
router.get('/', async (req, res) => {
  const { department, status, role } = req.query;
  let query = `
    SELECT u.id, u.email, u.name, u.role, u.department, 
           ep.job_title, ep.employment_status, ep.performance_rating, 
           ep.utilization_rate, ep.risk_flag
    FROM users u
    LEFT JOIN employee_profiles ep ON u.id = ep.user_id
    WHERE u.role = 'employee'
  `;

  const params = [];

  if (department) {
    params.push(department);
    query += ` AND u.department = $${params.length}`;
  }

  if (status) {
    params.push(status);
    query += ` AND ep.employment_status = $${params.length}`;
  }

  if (req.user.role === 'manager') {
    params.push(req.user.id);
    query += ` AND u.manager_id = $${params.length}`;
  }

  query += ' ORDER BY u.name';

  const result = await db.query(query, params);
  res.json(result.rows);
});

/**
 * GET /api/employees/:id
 * Get employee details with skills and assignments
 */
router.get('/:id', async (req, res) => {
  const { id } = req.params;

  // Get user and profile
  const userResult = await db.query(
    `SELECT u.*, ep.* FROM users u
     LEFT JOIN employee_profiles ep ON u.id = ep.user_id
     WHERE u.id = $1`,
    [id]
  );

  if (userResult.rows.length === 0) {
    return res.status(404).json({ error: 'Employee not found' });
  }

  const employee = userResult.rows[0];

  // Get skills
  const skillsResult = await db.query(
    `SELECT s.skill_name, es.proficiency_level, es.years_experience
     FROM employee_skills es
     JOIN skills s ON es.skill_id = s.id
     WHERE es.user_id = $1`,
    [id]
  );

  // Get project assignments
  const projectsResult = await db.query(
    `SELECT p.project_name, pa.allocation_percentage, pa.assignment_status, 
            pa.start_date, pa.end_date
     FROM project_assignments pa
     JOIN projects p ON pa.project_id = p.id
     WHERE pa.user_id = $1`,
    [id]
  );

  res.json({
    ...employee,
    skills: skillsResult.rows,
    projects: projectsResult.rows,
  });
});

/**
 * POST /api/employees
 * Create employee profile
 */
router.post('/', authorize('hr_admin', 'executive', 'manager'), async (req, res) => {
  const { user_id, job_title, employment_status, hire_date } = req.body;

  const result = await db.query(
    `INSERT INTO employee_profiles (user_id, job_title, employment_status, hire_date)
     VALUES ($1, $2, $3, $4)
     RETURNING *`,
    [user_id, job_title, employment_status, hire_date]
  );

  res.status(201).json(result.rows[0]);
});

/**
 * PUT /api/employees/:id
 * Update employee profile
 */
router.put('/:id', authorize('hr_admin', 'executive', 'manager'), async (req, res) => {
  const { id } = req.params;
  const {
    job_title,
    employment_status,
    performance_rating,
    utilization_rate,
    risk_flag,
  } = req.body;

  const result = await db.query(
    `UPDATE employee_profiles
     SET job_title = COALESCE($2, job_title),
         employment_status = COALESCE($3, employment_status),
         performance_rating = COALESCE($4, performance_rating),
         utilization_rate = COALESCE($5, utilization_rate),
         risk_flag = COALESCE($6, risk_flag),
         updated_at = CURRENT_TIMESTAMP
     WHERE user_id = $1
     RETURNING *`,
    [id, job_title, employment_status, performance_rating, utilization_rate, risk_flag]
  );

  if (result.rows.length === 0) {
    return res.status(404).json({ error: 'Employee not found' });
  }

  res.json(result.rows[0]);
});

/**
 * POST /api/employees/:id/skills
 * Add skill to employee
 */
router.post('/:id/skills', authorize('hr_admin', 'manager'), async (req, res) => {
  const { id } = req.params;
  const { skill_name, proficiency_level, years_experience } = req.body;

  // Ensure skill exists, create if not
  let skillResult = await db.query(
    'SELECT id FROM skills WHERE skill_name = $1',
    [skill_name]
  );

  let skillId;
  if (skillResult.rows.length === 0) {
    const createResult = await db.query(
      'INSERT INTO skills (skill_name) VALUES ($1) RETURNING id',
      [skill_name]
    );
    skillId = createResult.rows[0].id;
  } else {
    skillId = skillResult.rows[0].id;
  }

  const result = await db.query(
    `INSERT INTO employee_skills (user_id, skill_id, proficiency_level, years_experience)
     VALUES ($1, $2, $3, $4)
     RETURNING *`,
    [id, skillId, proficiency_level, years_experience]
  );

  res.status(201).json(result.rows[0]);
});

/**
 * GET /api/employees/:id/skills
 * Get all skills for an employee
 */
router.get('/:id/skills', async (req, res) => {
  const { id } = req.params;

  const result = await db.query(
    `SELECT s.id, s.skill_name, es.proficiency_level, es.years_experience
     FROM employee_skills es
     JOIN skills s ON es.skill_id = s.id
     WHERE es.user_id = $1`,
    [id]
  );

  res.json(result.rows);
});

export default router;
