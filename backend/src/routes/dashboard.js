import express from 'express';
import db from '../db/connection.js';
import { authorize } from '../middleware/auth.js';

const router = express.Router();

/**
 * GET /api/dashboard/overview
 * Get executive dashboard overview with KPIs
 */
router.get('/overview', authorize('executive', 'manager'), async (req, res) => {
  try {
    // Total employees
    const totalResult = await db.query(`
      SELECT COUNT(*) as total
      FROM users u
      LEFT JOIN employee_profiles ep ON u.id = ep.user_id
      WHERE u.role = 'employee' AND ep.employment_status = 'active'
    `);

    // Average utilization
    const utilizationResult = await db.query(`
      SELECT AVG(utilization_rate) as avg_utilization
      FROM employee_profiles
      WHERE employment_status = 'active'
    `);

    // High risk employees
    const riskResult = await db.query(`
      SELECT COUNT(*) as high_risk
      FROM employee_profiles
      WHERE employment_status = 'active' AND risk_flag IN ('high', 'medium')
    `);

    // Active projects
    const projectsResult = await db.query(`
      SELECT COUNT(*) as active_projects
      FROM projects
      WHERE status = 'active'
    `);

    // Open positions
    const positionsResult = await db.query(`
      SELECT COUNT(*) as open_positions
      FROM projects
      WHERE status = 'active' AND required_headcount > (
        SELECT COUNT(*) FROM project_assignments
        WHERE project_id = projects.id AND assignment_status = 'confirmed'
      )
    `);

    res.json({
      totalEmployees: parseInt(totalResult.rows[0].total),
      avgUtilization: parseFloat(utilizationResult.rows[0].avg_utilization) || 0,
      highRiskCount: parseInt(riskResult.rows[0].high_risk),
      activeProjects: parseInt(projectsResult.rows[0].active_projects),
      openPositions: parseInt(positionsResult.rows[0].open_positions),
      generatedAt: new Date().toISOString(),
    });
  } catch (err) {
    throw err;
  }
});

/**
 * GET /api/dashboard/team-performance
 * Get team performance metrics by department
 */
router.get('/team-performance', authorize('executive', 'manager'), async (req, res) => {
  try {
    const result = await db.query(`
      SELECT 
        u.department,
        COUNT(u.id) as team_size,
        AVG(ep.performance_rating) as avg_performance,
        AVG(ep.utilization_rate) as avg_utilization,
        COUNT(CASE WHEN ep.risk_flag IN ('high', 'medium') THEN 1 END) as at_risk_count
      FROM users u
      LEFT JOIN employee_profiles ep ON u.id = ep.user_id
      WHERE u.role = 'employee' AND ep.employment_status = 'active'
      GROUP BY u.department
      ORDER BY team_size DESC
    `);

    res.json(result.rows);
  } catch (err) {
    throw err;
  }
});

/**
 * GET /api/dashboard/resource-allocation
 * Get current resource allocation across projects
 */
router.get('/resource-allocation', authorize('executive', 'manager'), async (req, res) => {
  try {
    const result = await db.query(`
      SELECT 
        p.project_name,
        p.status,
        COUNT(DISTINCT pa.user_id) as assigned_count,
        p.required_headcount,
        AVG(pa.allocation_percentage) as avg_allocation,
        STRING_AGG(DISTINCT u.name, ', ') as team_members
      FROM projects p
      LEFT JOIN project_assignments pa ON p.id = pa.project_id AND pa.assignment_status = 'confirmed'
      LEFT JOIN users u ON pa.user_id = u.id
      WHERE p.status IN ('active', 'planning')
      GROUP BY p.id, p.project_name, p.status, p.required_headcount
      ORDER BY p.created_at DESC
    `);

    res.json(result.rows);
  } catch (err) {
    throw err;
  }
});

/**
 * GET /api/dashboard/skill-inventory
 * Get skills inventory and proficiency distribution
 */
router.get('/skill-inventory', authorize('executive', 'hr_admin'), async (req, res) => {
  try {
    const result = await db.query(`
      SELECT 
        s.skill_name,
        COUNT(DISTINCT es.user_id) as employee_count,
        COUNT(CASE WHEN es.proficiency_level = 'expert' THEN 1 END) as expert_count,
        COUNT(CASE WHEN es.proficiency_level = 'advanced' THEN 1 END) as advanced_count,
        COUNT(CASE WHEN es.proficiency_level = 'intermediate' THEN 1 END) as intermediate_count,
        COUNT(CASE WHEN es.proficiency_level = 'beginner' THEN 1 END) as beginner_count
      FROM skills s
      LEFT JOIN employee_skills es ON s.id = es.skill_id
      GROUP BY s.id, s.skill_name
      ORDER BY employee_count DESC
      LIMIT 20
    `);

    res.json(result.rows);
  } catch (err) {
    throw err;
  }
});

/**
 * GET /api/dashboard/performance-distribution
 * Get distribution of performance ratings
 */
router.get('/performance-distribution', authorize('executive', 'manager'), async (req, res) => {
  try {
    const result = await db.query(`
      SELECT 
        CASE 
          WHEN performance_rating >= 4.5 THEN 'Exceeds Expectations'
          WHEN performance_rating >= 3.5 THEN 'Meets Expectations'
          WHEN performance_rating >= 2.5 THEN 'Needs Improvement'
          ELSE 'Below Expectations'
        END as category,
        COUNT(*) as count,
        ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER (), 2) as percentage
      FROM employee_profiles
      WHERE employment_status = 'active' AND performance_rating IS NOT NULL
      GROUP BY category
      ORDER BY count DESC
    `);

    res.json(result.rows);
  } catch (err) {
    throw err;
  }
});

/**
 * GET /api/dashboard/utilization-trend
 * Get utilization rate trends
 */
router.get('/utilization-trend', authorize('executive', 'manager'), async (req, res) => {
  try {
    // Mock time-series data (in production, track historical snapshots)
    const result = await db.query(`
      SELECT 
        u.department,
        AVG(ep.utilization_rate) as avg_utilization,
        MIN(ep.utilization_rate) as min_utilization,
        MAX(ep.utilization_rate) as max_utilization,
        STDDEV(ep.utilization_rate) as std_dev
      FROM users u
      LEFT JOIN employee_profiles ep ON u.id = ep.user_id
      WHERE u.role = 'employee' AND ep.employment_status = 'active'
      GROUP BY u.department
      ORDER BY avg_utilization DESC
    `);

    res.json(result.rows);
  } catch (err) {
    throw err;
  }
});

/**
 * GET /api/dashboard/at-risk-employees
 * Get list of employees at risk of leaving
 */
router.get('/at-risk-employees', authorize('executive', 'manager', 'hr_admin'), async (req, res) => {
  try {
    const result = await db.query(`
      SELECT 
        u.id,
        u.name,
        u.email,
        u.department,
        ep.job_title,
        ep.performance_rating,
        ep.utilization_rate,
        ep.risk_flag,
        u.manager_id
      FROM users u
      LEFT JOIN employee_profiles ep ON u.id = ep.user_id
      WHERE u.role = 'employee' AND ep.employment_status = 'active' AND ep.risk_flag IN ('high', 'medium')
      ORDER BY ep.risk_flag DESC, ep.performance_rating ASC
      LIMIT 20
    `);

    res.json(result.rows);
  } catch (err) {
    throw err;
  }
});

export default router;
