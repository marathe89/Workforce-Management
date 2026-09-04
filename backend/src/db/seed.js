import db from './connection.js';

/**
 * Seed sample data, including the demo login user documented in the README
 * (manager@company.com / password123 — note the users table has no password
 * column, so /api/auth/login only checks that the email exists).
 * Safe to run multiple times: skips if users already exist.
 */
async function seed() {
  const existing = await db.query('SELECT COUNT(*) as count FROM users');
  if (parseInt(existing.rows[0].count) > 0) {
    console.log('✓ Users already exist, skipping seed');
    return;
  }

  const manager = await db.query(
    `INSERT INTO users (email, name, role, department)
     VALUES ($1, $2, $3, $4) RETURNING id`,
    ['manager@company.com', 'Jordan Blake', 'manager', 'Engineering']
  );
  const managerId = manager.rows[0].id;

  const hrAdmin = await db.query(
    `INSERT INTO users (email, name, role, department)
     VALUES ($1, $2, $3, $4) RETURNING id`,
    ['hr@company.com', 'Priya Nair', 'hr_admin', 'People Ops']
  );

  const employees = [
    ['alex.chen@company.com', 'Alex Chen', 'Senior Engineer', 4.5, 85],
    ['sam.rivera@company.com', 'Sam Rivera', 'Product Designer', 4.1, 70],
    ['taylor.morgan@company.com', 'Taylor Morgan', 'Data Analyst', 3.8, 95],
  ];

  const employeeIds = [];
  for (const [email, name, jobTitle, rating, utilization] of employees) {
    const user = await db.query(
      `INSERT INTO users (email, name, role, department, manager_id)
       VALUES ($1, $2, 'employee', $3, $4) RETURNING id`,
      [email, name, 'Engineering', managerId]
    );
    const userId = user.rows[0].id;
    employeeIds.push(userId);

    await db.query(
      `INSERT INTO employee_profiles
        (user_id, job_title, employment_status, hire_date, performance_rating, utilization_rate, risk_flag)
       VALUES ($1, $2, 'active', $3, $4, $5, 'low')`,
      [userId, jobTitle, '2023-01-15', rating, utilization]
    );
  }

  const skills = [
    ['JavaScript', 'Engineering'],
    ['React', 'Engineering'],
    ['SQL', 'Data'],
    ['Product Design', 'Design'],
  ];
  const skillIds = [];
  for (const [skillName, category] of skills) {
    const skill = await db.query(
      `INSERT INTO skills (skill_name, category) VALUES ($1, $2) RETURNING id`,
      [skillName, category]
    );
    skillIds.push(skill.rows[0].id);
  }

  await db.query(
    `INSERT INTO employee_skills (user_id, skill_id, proficiency_level, years_experience)
     VALUES ($1, $2, 'expert', 5)`,
    [employeeIds[0], skillIds[0]]
  );

  const project = await db.query(
    `INSERT INTO projects (project_name, description, status, start_date, end_date, required_headcount, owner_id)
     VALUES ($1, $2, 'active', $3, $4, $5, $6) RETURNING id`,
    [
      'Workforce Analytics Revamp',
      'Rebuild internal analytics dashboards',
      '2026-01-01',
      '2026-12-31',
      4,
      managerId,
    ]
  );
  const projectId = project.rows[0].id;

  await db.query(
    `INSERT INTO project_assignments (user_id, project_id, allocation_percentage, start_date, assignment_status)
     VALUES ($1, $2, 80, $3, 'confirmed')`,
    [employeeIds[0], projectId, '2026-01-01']
  );

  console.log('✓ Seed data inserted');
  console.log(`  Demo login: manager@company.com (id ${managerId})`);
  console.log(`  Also seeded: hr@company.com (id ${hrAdmin.rows[0].id}), ${employeeIds.length} employees`);
}

seed()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('✗ Seed failed:', err);
    process.exit(1);
  });
