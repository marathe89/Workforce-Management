import express from 'express';
import db from '../db/connection.js';
import { authorize } from '../middleware/auth.js';

const router = express.Router();

/**
 * GET /api/projects
 * List all projects with filtering
 */
router.get('/', async (req, res) => {
  const { status, department } = req.query;
  let query = 'SELECT * FROM projects WHERE 1=1';
  const params = [];

  if (status) {
    params.push(status);
    query += ` AND status = $${params.length}`;
  }

  query += ' ORDER BY created_at DESC';

  const result = await db.query(query, params);
  res.json(result.rows);
});

/**
 * GET /api/projects/:id
 * Get project details with assignments and skill requirements
 */
router.get('/:id', async (req, res) => {
  const { id } = req.params;

  const projectResult = await db.query('SELECT * FROM projects WHERE id = $1', [id]);

  if (projectResult.rows.length === 0) {
    return res.status(404).json({ error: 'Project not found' });
  }

  const project = projectResult.rows[0];

  // Get skill requirements
  const skillsResult = await db.query(
    `SELECT s.skill_name, psr.required_proficiency, psr.headcount_needed
     FROM project_skill_requirements psr
     JOIN skills s ON psr.skill_id = s.id
     WHERE psr.project_id = $1`,
    [id]
  );

  // Get current assignments
  const assignmentsResult = await db.query(
    `SELECT u.id, u.name, u.email, pa.allocation_percentage, 
            pa.assignment_status, pa.start_date, pa.end_date
     FROM project_assignments pa
     JOIN users u ON pa.user_id = u.id
     WHERE pa.project_id = $1`,
    [id]
  );

  res.json({
    ...project,
    skillRequirements: skillsResult.rows,
    assignments: assignmentsResult.rows,
  });
});

/**
 * POST /api/projects
 * Create new project
 */
router.post('/', authorize('manager', 'executive'), async (req, res) => {
  const { project_name, description, status, start_date, end_date, required_headcount } =
    req.body;

  const result = await db.query(
    `INSERT INTO projects (project_name, description, status, start_date, end_date, 
                          required_headcount, owner_id)
     VALUES ($1, $2, $3, $4, $5, $6, $7)
     RETURNING *`,
    [project_name, description, status || 'planning', start_date, end_date, required_headcount, req.user.id]
  );

  res.status(201).json(result.rows[0]);
});

/**
 * PUT /api/projects/:id
 * Update project
 */
router.put('/:id', authorize('manager', 'executive'), async (req, res) => {
  const { id } = req.params;
  const { project_name, description, status, start_date, end_date, required_headcount } =
    req.body;

  const result = await db.query(
    `UPDATE projects
     SET project_name = COALESCE($2, project_name),
         description = COALESCE($3, description),
         status = COALESCE($4, status),
         start_date = COALESCE($5, start_date),
         end_date = COALESCE($6, end_date),
         required_headcount = COALESCE($7, required_headcount),
         updated_at = CURRENT_TIMESTAMP
     WHERE id = $1
     RETURNING *`,
    [id, project_name, description, status, start_date, end_date, required_headcount]
  );

  if (result.rows.length === 0) {
    return res.status(404).json({ error: 'Project not found' });
  }

  res.json(result.rows[0]);
});

/**
 * POST /api/projects/:id/assign
 * Assign employee to project
 */
router.post('/:id/assign', authorize('manager', 'executive'), async (req, res) => {
  const { id } = req.params;
  const { user_id, allocation_percentage, start_date, end_date } = req.body;

  const result = await db.query(
    `INSERT INTO project_assignments (user_id, project_id, allocation_percentage, 
                                     start_date, end_date, assignment_status)
     VALUES ($1, $2, $3, $4, $5, 'proposed')
     RETURNING *`,
    [user_id, id, allocation_percentage, start_date, end_date]
  );

  res.status(201).json(result.rows[0]);
});

/**
 * GET /api/projects/:id/assignments
 * Get all assignments for a project
 */
router.get('/:id/assignments', async (req, res) => {
  const { id } = req.params;

  const result = await db.query(
    `SELECT pa.*, u.name, u.email, ep.job_title
     FROM project_assignments pa
     JOIN users u ON pa.user_id = u.id
     LEFT JOIN employee_profiles ep ON u.id = ep.user_id
     WHERE pa.project_id = $1`,
    [id]
  );

  res.json(result.rows);
});

export default router;
