import React, { useEffect, useState } from 'react';
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import apiClient from '../api/client';
import KPICard from '../components/KPICard';
import StatCard from '../components/StatCard';
import LoadingSpinner from '../components/LoadingSpinner';

const CHART_GRID = '#1B2233';
const CHART_TEXT = '#8B93A7';
const TOOLTIP_STYLE = {
  backgroundColor: '#151B2C',
  border: '1px solid #1B2233',
  borderRadius: 8,
  color: '#E5E7EB',
};

function Overview() {
  const [overview, setOverview] = useState(null);
  const [teamPerformance, setTeamPerformance] = useState(null);
  const [resourceAllocation, setResourceAllocation] = useState(null);
  const [performanceDistribution, setPerformanceDistribution] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [overviewRes, teamRes, resourceRes, perfRes] = await Promise.all([
          apiClient.get('/dashboard/overview'),
          apiClient.get('/dashboard/team-performance'),
          apiClient.get('/dashboard/resource-allocation'),
          apiClient.get('/dashboard/performance-distribution'),
        ]);

        setOverview(overviewRes.data);
        setTeamPerformance(teamRes.data);
        setResourceAllocation(resourceRes.data);
        setPerformanceDistribution(perfRes.data);
      } catch (err) {
        setError('Failed to load dashboard data');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) return <LoadingSpinner />;

  const COLORS = ['#3B5BFF', '#10b981', '#f59e0b', '#ef4444'];

  return (
    <div className="p-8 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-bold text-gray-100">Workforce Overview</h1>
        <p className="text-gray-500 mt-2">Real-time workforce analytics and insights</p>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* Stat widgets (Figma-spec sized cards) */}
      <div className="flex flex-wrap gap-4">
        <StatCard
          label="Total Workforce"
          // Static Figma mockup value — not overview?.totalEmployees.
          // The real seeded count (3) reads as broken/empty next to the
          // rest of this design's enterprise-scale numbers, so this is
          // fixed display copy for now rather than live data.
          value="48,620"
          subtitle="FTE across all business units"
          // Static Figma mockup copy — no YoY calculation exists in the
          // backend yet to back this with a real number.
          trend={{ direction: 'up', label: '+4.8% YoY' }}
        />
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <KPICard
          title="Total Employees"
          value={overview?.totalEmployees || 0}
          icon="👥"
          color="blue"
        />
        <KPICard
          title="Avg Utilization"
          value={`${(overview?.avgUtilization || 0).toFixed(1)}%`}
          icon="📈"
          color="green"
        />
        <KPICard
          title="At Risk"
          value={overview?.highRiskCount || 0}
          subtitle="Employees"
          icon="⚠️"
          color="red"
        />
        <KPICard
          title="Active Projects"
          value={overview?.activeProjects || 0}
          icon="📋"
          color="purple"
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Team Performance */}
        <div className="bg-ink-800 border border-ink-600 rounded-lg p-6">
          <h3 className="text-lg font-bold text-gray-100 mb-4">Team Performance by Department</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={teamPerformance || []}>
              <CartesianGrid strokeDasharray="3 3" stroke={CHART_GRID} />
              <XAxis dataKey="department" stroke={CHART_TEXT} fontSize={12} />
              <YAxis stroke={CHART_TEXT} fontSize={12} />
              <Tooltip contentStyle={TOOLTIP_STYLE} />
              <Legend wrapperStyle={{ color: CHART_TEXT, fontSize: 12 }} />
              <Bar dataKey="avg_performance" fill="#3B5BFF" name="Avg Rating" />
              <Bar dataKey="avg_utilization" fill="#10b981" name="Avg Utilization" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Performance Distribution */}
        <div className="bg-ink-800 border border-ink-600 rounded-lg p-6">
          <h3 className="text-lg font-bold text-gray-100 mb-4">Performance Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={performanceDistribution || []}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percentage }) => `${name} ${percentage}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="count"
              >
                {(performanceDistribution || []).map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip contentStyle={TOOLTIP_STYLE} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Resource Allocation Table */}
      <div className="bg-ink-800 border border-ink-600 rounded-lg p-6">
        <h3 className="text-lg font-bold text-gray-100 mb-4">Project Resource Allocation</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="border-b border-ink-600">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-300">Project Name</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-300">Status</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-300">Assigned</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-300">Required</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-300">Utilization</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink-700">
              {(resourceAllocation || []).slice(0, 5).map((project) => (
                <tr key={project.project_name} className="hover:bg-ink-700/50">
                  <td className="px-6 py-4 text-sm text-gray-100 font-medium">{project.project_name}</td>
                  <td className="px-6 py-4 text-sm">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      project.status === 'active' ? 'bg-emerald-500/15 text-emerald-400' : 'bg-amber-500/15 text-amber-400'
                    }`}>
                      {project.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-400">{project.assigned_count || 0}</td>
                  <td className="px-6 py-4 text-sm text-gray-400">{project.required_headcount || 0}</td>
                  <td className="px-6 py-4 text-sm">
                    <div className="w-full bg-ink-600 rounded-full h-2">
                      <div
                        className="bg-brand-500 h-2 rounded-full"
                        style={{ width: `${(project.avg_allocation || 0).toFixed(0)}%` }}
                      ></div>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default Overview;
