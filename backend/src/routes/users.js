import express from 'express';
import db from '../db/connection.js';
import { authorize } from '../middleware/auth.js';

const router = express.Router();

/**
 * GET /api/users
 * List every user regardless of role (People Management needs the full
 * roster — managers/hr_admin/executive included — not just role='employee'
 * like GET /api/employees returns).
 */
router.get('/', authorize('hr_admin', 'executive', 'manager'), async (req, res) => {
  const result = await db.query(
    `SELECT u.id, u.email, u.name, u.role, u.department, u.manager_id,
            m.name AS manager_name,
            ep.job_title, ep.employment_status, ep.risk_flag
     FROM users u
     LEFT JOIN users m ON u.manager_id = m.id
     LEFT JOIN employee_profiles ep ON u.id = ep.user_id
     ORDER BY u.name`
  );
  res.json(result.rows);
});

/**
 * PUT /api/users/:id
 * Update a user's role/department/reporting manager — the People
 * Management edit workflow. Deliberately separate from PUT
 * /api/employees/:id (which only ever touches employee_profiles); this
 * touches the `users` row itself, so it works for every role, not just
 * role='employee' rows that already have a profile.
 */
router.put('/:id', authorize('hr_admin', 'executive', 'manager'), async (req, res) => {
  const { id } = req.params;
  const { name, role, department } = req.body;
  // manager_id is nullable (clearing "no manager" is a real, valid edit),
  // so — unlike the COALESCE fields above, where "not sent" means "leave
  // unchanged" — this only updates when the key is present at all;
  // "" or null in the payload both mean "clear it".
  const clearingManager = Object.prototype.hasOwnProperty.call(req.body, 'manager_id');
  const managerIdValue = clearingManager ? (req.body.manager_id || null) : undefined;

  const result = await db.query(
    `UPDATE users
     SET name = COALESCE($2, name),
         role = COALESCE($3, role),
         department = COALESCE($4, department),
         manager_id = CASE WHEN $6 THEN $5 ELSE manager_id END,
         updated_at = CURRENT_TIMESTAMP
     WHERE id = $1
     RETURNING id, email, name, role, department, manager_id`,
    [id, name, role, department, managerIdValue, clearingManager]
  );

  if (result.rows.length === 0) {
    return res.status(404).json({ error: 'User not found' });
  }

  res.json(result.rows[0]);
});

/**
 * DELETE /api/users/:id
 * Remove a person entirely — the "Delete" action on both People
 * Management and Workforce Management's Live Directory.
 *
 * employee_profiles and employee_skills cascade automatically (ON DELETE
 * CASCADE in the schema). Several OTHER tables reference users.id
 * WITHOUT cascade — project_assignments.user_id, projects.owner_id,
 * users.manager_id (direct reports), performance_reviews, audit_logs —
 * so deleting someone with any of those still attached hits Postgres'
 * own foreign-key constraint (error code 23503) rather than silently
 * cascading a delete across unrelated tables this route has no business
 * touching. That's surfaced as a real, specific 409 telling the caller
 * what to do, not a raw 500.
 */
router.delete('/:id', authorize('hr_admin', 'executive', 'manager'), async (req, res) => {
  const { id } = req.params;

  try {
    const result = await db.query('DELETE FROM users WHERE id = $1 RETURNING id, name', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json({ message: 'Deleted', id: result.rows[0].id, name: result.rows[0].name });
  } catch (err) {
    if (err.code === '23503') {
      return res.status(409).json({
        error: 'Cannot delete: this person still has related records (project assignments, direct reports, or reviews). Reassign or remove those first.',
      });
    }
    throw err;
  }
});

export default router;
