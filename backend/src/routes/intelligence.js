import express from 'express';
import db from '../db/connection.js';
import claudeService from '../services/claudeService.js';
import { authorize } from '../middleware/auth.js';

const router = express.Router();

/**
 * POST /api/intelligence/team-analysis
 * Analyze team performance with Claude insights
 */
router.post('/team-analysis', authorize('manager', 'executive'), async (req, res) => {
  const { team_id, department } = req.body;

  try {
    // Fetch team metrics
    let query = `
      SELECT 
        COUNT(u.id) as size,
        AVG(ep.utilization_rate) as avgUtilization,
        AVG(ep.performance_rating) as avgPerformance,
        COUNT(DISTINCT pa.project_id) as projectCount
      FROM users u
      LEFT JOIN employee_profiles ep ON u.id = ep.user_id
      LEFT JOIN project_assignments pa ON u.id = pa.user_id AND pa.assignment_status = 'confirmed'
      WHERE u.role = 'employee'
    `;

    if (department) {
      query += ' AND u.department = $1';
    }

    const result = await db.query(query, department ? [department] : []);
    const teamData = result.rows[0];

    // Generate Claude insights
    const insights = await claudeService.analyzeTeamPerformance({
      size: teamData.size,
      avgUtilization: teamData.avgutilization || 0,
      avgPerformance: teamData.avgperformance || 0,
      projectCount: teamData.projectcount || 0,
      skillsGap: 'To be analyzed',
    });

    res.json({
      metrics: teamData,
      insights,
      generatedAt: new Date().toISOString(),
    });
  } catch (err) {
    console.error('Team analysis error:', err);
    res.status(500).json({ error: 'Failed to generate team analysis' });
  }
});

/**
 * POST /api/intelligence/skill-gaps
 * Identify skill gaps for an employee against project requirements
 */
router.post('/skill-gaps', authorize('manager', 'executive'), async (req, res) => {
  const { employee_id, project_id } = req.body;

  try {
    // Get employee skills
    const skillsResult = await db.query(
      `SELECT s.skill_name, es.proficiency_level
       FROM employee_skills es
       JOIN skills s ON es.skill_id = s.id
       WHERE es.user_id = $1`,
      [employee_id]
    );

    // Get project requirements
    const requirementsResult = await db.query(
      `SELECT s.skill_name, psr.required_proficiency
       FROM project_skill_requirements psr
       JOIN skills s ON psr.skill_id = s.id
       WHERE psr.project_id = $1`,
      [project_id]
    );

    const employeeData = {
      skills: skillsResult.rows.map((r) => ({
        name: r.skill_name,
        proficiency: r.proficiency_level,
      })),
    };

    const projectRequirements = requirementsResult.rows.map((r) => ({
      skill: r.skill_name,
      requiredLevel: r.required_proficiency,
    }));

    const analysis = await claudeService.identifySkillGaps(
      employeeData,
      projectRequirements
    );

    res.json({
      employeeSkills: employeeData.skills,
      projectRequirements,
      analysis,
      generatedAt: new Date().toISOString(),
    });
  } catch (err) {
    console.error('Skill gap analysis error:', err);
    res.status(500).json({ error: 'Failed to analyze skill gaps' });
  }
});

/**
 * POST /api/intelligence/headcount-forecast
 * Generate headcount forecast with strategic insights
 */
router.post('/headcount-forecast', authorize('executive', 'hr_admin'), async (req, res) => {
  const { months = 6 } = req.body;

  try {
    // Get current headcount by department
    const currentResult = await db.query(`
      SELECT u.department, COUNT(u.id) as count
      FROM users u
      LEFT JOIN employee_profiles ep ON u.id = ep.user_id
      WHERE u.role = 'employee' AND ep.employment_status = 'active'
      GROUP BY u.department
    `);

    const totalHeadcount = currentResult.rows.reduce((sum, r) => sum + r.count, 0);

    // Get recent forecasts
    const forecastResult = await db.query(`
      SELECT * FROM headcount_forecasts
      WHERE forecast_month >= CURRENT_DATE - INTERVAL '3 months'
      ORDER BY forecast_month DESC
      LIMIT 1
    `);

    const forecast = forecastResult.rows[0] || {};

    const forecastData = {
      currentHeadcount: totalHeadcount,
      plannedHires: forecast.planned_hires || 0,
      plannedDepartures: forecast.planned_departures || 0,
      departments: currentResult.rows.map((r) => r.department).filter(Boolean),
    };

    const insights = await claudeService.generateHeadcountForecast(forecastData);

    res.json({
      currentState: forecastData,
      forecast: forecast,
      insights,
      generatedAt: new Date().toISOString(),
    });
  } catch (err) {
    console.error('Headcount forecast error:', err);
    res.status(500).json({ error: 'Failed to generate forecast' });
  }
});

/**
 * POST /api/intelligence/flight-risk
 * Assess flight risk for an employee
 */
router.post('/flight-risk', authorize('manager', 'executive', 'hr_admin'), async (req, res) => {
  const { employee_id } = req.body;

  try {
    const result = await db.query(
      `SELECT u.name, u.id, ep.performance_rating, ep.utilization_rate
       FROM users u
       LEFT JOIN employee_profiles ep ON u.id = ep.user_id
       WHERE u.id = $1`,
      [employee_id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Employee not found' });
    }

    const employee = result.rows[0];

    const employeeData = {
      name: employee.name,
      tenure: 3, // Placeholder
      rating: employee.performance_rating || 3.5,
      reviewSentiment: 'neutral',
      promotionHistory: 'Limited',
      utilization: employee.utilization_rate || 75,
      projectSatisfaction: 3,
      salaryPosition: 'Market rate',
    };

    const assessment = await claudeService.assessFlightRisk(employeeData);

    res.json({
      employeeId: employee_id,
      employeeName: employee.name,
      assessment,
      generatedAt: new Date().toISOString(),
    });
  } catch (err) {
    console.error('Flight risk assessment error:', err);
    res.status(500).json({ error: 'Failed to assess flight risk' });
  }
});

/**
 * POST /api/intelligence/performance-summary
 * Generate performance summary for individual or team
 */
router.post('/performance-summary', authorize('manager', 'executive'), async (req, res) => {
  const { type, entity_id } = req.body; // type: 'individual' or 'team'

  try {
    if (type === 'individual') {
      const result = await db.query(
        `SELECT u.name, u.id, ep.performance_rating
         FROM users u
         LEFT JOIN employee_profiles ep ON u.id = ep.user_id
         WHERE u.id = $1`,
        [entity_id]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Employee not found' });
      }

      const employee = result.rows[0];
      const performanceData = {
        type: 'individual',
        name: employee.name,
        rating: employee.performance_rating || 3.5,
        recentReview: 'Positive trajectory',
        projectsCompleted: 5,
        strengths: ['Leadership', 'Technical Skills'],
      };

      const summary = await claudeService.generatePerformanceSummary(performanceData);

      res.json({
        type: 'individual',
        entityId: entity_id,
        summary,
        generatedAt: new Date().toISOString(),
      });
    }
  } catch (err) {
    console.error('Performance summary error:', err);
    res.status(500).json({ error: 'Failed to generate summary' });
  }
});

export default router;
