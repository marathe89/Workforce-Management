import Anthropic from '@anthropic-ai/sdk';
import dotenv from 'dotenv';

dotenv.config();

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

/**
 * Analyze team performance and generate insights
 */
export async function analyzeTeamPerformance(teamData) {
  const prompt = `
Analyze the following team performance data and provide insights for resource allocation and performance improvement:

Team Data:
- Team Size: ${teamData.size}
- Average Utilization: ${teamData.avgUtilization}%
- Average Performance Rating: ${teamData.avgPerformance}/5
- Projects: ${teamData.projectCount}
- Skills Gap: ${teamData.skillsGap}

Provide:
1. Key Performance Insights (2-3 bullet points)
2. Resource Allocation Recommendations
3. Risk Factors
4. Immediate Actions Required

Be concise and actionable.
`;

  const message = await client.messages.create({
    model: 'claude-opus-4-1',
    max_tokens: 500,
    messages: [
      {
        role: 'user',
        content: prompt,
      },
    ],
  });

  return message.content[0].type === 'text' ? message.content[0].text : null;
}

/**
 * Identify skill gaps and recommend training
 */
export async function identifySkillGaps(employeeData, projectRequirements) {
  const prompt = `
Analyze skill gaps for an employee against project requirements:

Employee Skills:
${employeeData.skills.map((s) => `- ${s.name}: ${s.proficiency}`).join('\n')}

Project Requirements:
${projectRequirements.map((r) => `- ${r.skill}: ${r.requiredLevel}`).join('\n')}

Provide:
1. Critical Skill Gaps (blocking assignment)
2. Nice-to-Have Skills (for growth)
3. Training Recommendations with estimated duration
4. Alternative employees who match better

Keep it practical and brief.
`;

  const message = await client.messages.create({
    model: 'claude-opus-4-1',
    max_tokens: 600,
    messages: [
      {
        role: 'user',
        content: prompt,
      },
    ],
  });

  return message.content[0].type === 'text' ? message.content[0].text : null;
}

/**
 * Generate headcount forecast summary with insights
 */
export async function generateHeadcountForecast(forecastData) {
  const prompt = `
Analyze headcount forecast data and provide strategic insights:

Current State:
- Total Headcount: ${forecastData.currentHeadcount}
- Planned Hires: ${forecastData.plannedHires}
- Planned Departures: ${forecastData.plannedDepartures}
- Departments: ${forecastData.departments.join(', ')}

Provide:
1. Forecast Summary (2 sentences)
2. Department-wise Allocation Recommendations
3. Risk Factors (turnover, hiring delays)
4. Budget Impact Summary

Be strategic but concise.
`;

  const message = await client.messages.create({
    model: 'claude-opus-4-1',
    max_tokens: 500,
    messages: [
      {
        role: 'user',
        content: prompt,
      },
    ],
  });

  return message.content[0].type === 'text' ? message.content[0].text : null;
}

/**
 * Generate performance summary for employee or team
 */
export async function generatePerformanceSummary(performanceData) {
  const prompt = `
Generate a performance summary for ${performanceData.type === 'individual' ? 'an employee' : 'a team'}:

${performanceData.type === 'individual' ? `
Name: ${performanceData.name}
Rating: ${performanceData.rating}/5
Recent Review: ${performanceData.recentReview}
Projects Completed: ${performanceData.projectsCompleted}
Strengths: ${performanceData.strengths.join(', ')}
` : `
Team: ${performanceData.teamName}
Size: ${performanceData.size}
Avg Rating: ${performanceData.avgRating}/5
Projects: ${performanceData.projectCount}
Utilization: ${performanceData.utilization}%
`}

Provide:
1. Performance Summary (2-3 sentences)
2. Key Achievements
3. Areas for Growth
4. Next Steps

Keep it professional and encouraging.
`;

  const message = await client.messages.create({
    model: 'claude-opus-4-1',
    max_tokens: 400,
    messages: [
      {
        role: 'user',
        content: prompt,
      },
    ],
  });

  return message.content[0].type === 'text' ? message.content[0].text : null;
}

/**
 * Detect flight risk and recommend retention strategies
 */
export async function assessFlightRisk(employeeData) {
  const prompt = `
Assess flight risk for an employee based on the following indicators:

Employee: ${employeeData.name}
Tenure: ${employeeData.tenure} years
Performance Rating: ${employeeData.rating}/5
Recent Review Sentiment: ${employeeData.reviewSentiment}
Promotion History: ${employeeData.promotionHistory}
Utilization: ${employeeData.utilization}%
Project Satisfaction: ${employeeData.projectSatisfaction}
Salary Benchmark: ${employeeData.salaryPosition}

Provide:
1. Flight Risk Assessment (Low/Medium/High with reasoning)
2. Key Risk Factors
3. Retention Recommendations
4. Immediate Actions

Be data-driven and specific.
`;

  const message = await client.messages.create({
    model: 'claude-opus-4-1',
    max_tokens: 500,
    messages: [
      {
        role: 'user',
        content: prompt,
      },
    ],
  });

  return message.content[0].type === 'text' ? message.content[0].text : null;
}

export default {
  analyzeTeamPerformance,
  identifySkillGaps,
  generateHeadcountForecast,
  generatePerformanceSummary,
  assessFlightRisk,
};
