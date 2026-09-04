import React, { useState } from 'react';
import { SparklesIcon } from '@heroicons/react/24/outline';
import apiClient from '../api/client';

function AIWorkforceAdvisor() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [inputs, setInputs] = useState({
    department: 'Engineering',
    employee_id: '',
    project_id: '',
  });

  const analyzeTeamPerformance = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiClient.post('/intelligence/team-analysis', {
        department: inputs.department,
      });
      setResult(response.data);
    } catch (err) {
      setError('Failed to generate analysis');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const analyzeSkillGaps = async () => {
    if (!inputs.employee_id || !inputs.project_id) {
      setError('Please enter employee ID and project ID');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const response = await apiClient.post('/intelligence/skill-gaps', {
        employee_id: parseInt(inputs.employee_id),
        project_id: parseInt(inputs.project_id),
      });
      setResult(response.data);
    } catch (err) {
      setError('Failed to analyze skill gaps');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const generateHeadcountForecast = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiClient.post('/intelligence/headcount-forecast');
      setResult(response.data);
    } catch (err) {
      setError('Failed to generate forecast');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const assessFlightRisk = async () => {
    if (!inputs.employee_id) {
      setError('Please enter employee ID');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const response = await apiClient.post('/intelligence/flight-risk', {
        employee_id: parseInt(inputs.employee_id),
      });
      setResult(response.data);
    } catch (err) {
      setError('Failed to assess flight risk');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 shrink-0 rounded-xl bg-gradient-to-br from-brand-400 to-violet-500 flex items-center justify-center">
          <SparklesIcon className="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-gray-100">AI Workforce Advisor</h1>
          <p className="text-gray-500 mt-1">Ask questions about workforce capacity, staffing, utilization and future demand.</p>
        </div>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Input Panel */}
        <div className="bg-ink-800 border border-ink-600 rounded-lg p-6">
          <h3 className="text-lg font-bold text-gray-100 mb-6">Analysis Tools</h3>

          <div className="space-y-4">
            {/* Team Analysis */}
            <div className="border border-ink-600 rounded-lg p-4">
              <h4 className="font-semibold text-gray-100">📊 Team Performance</h4>
              <p className="text-sm text-gray-500 mt-1">Analyze team metrics and insights</p>
              <div className="mt-4 space-y-3">
                <input
                  type="text"
                  placeholder="Department"
                  value={inputs.department}
                  onChange={(e) => setInputs({ ...inputs, department: e.target.value })}
                  className="w-full px-3 py-2 bg-ink-700 border border-ink-600 rounded-lg text-sm text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
                <button
                  onClick={analyzeTeamPerformance}
                  disabled={loading}
                  className="w-full bg-brand-500 text-white py-2 rounded-lg hover:bg-brand-600 disabled:bg-ink-600 disabled:text-gray-500 transition text-sm font-medium"
                >
                  {loading ? 'Analyzing...' : 'Analyze'}
                </button>
              </div>
            </div>

            {/* Skill Gaps */}
            <div className="border border-ink-600 rounded-lg p-4">
              <h4 className="font-semibold text-gray-100">🎓 Skill Gaps</h4>
              <p className="text-sm text-gray-500 mt-1">Identify training needs</p>
              <div className="mt-4 space-y-3">
                <input
                  type="number"
                  placeholder="Employee ID"
                  value={inputs.employee_id}
                  onChange={(e) => setInputs({ ...inputs, employee_id: e.target.value })}
                  className="w-full px-3 py-2 bg-ink-700 border border-ink-600 rounded-lg text-sm text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
                <input
                  type="number"
                  placeholder="Project ID"
                  value={inputs.project_id}
                  onChange={(e) => setInputs({ ...inputs, project_id: e.target.value })}
                  className="w-full px-3 py-2 bg-ink-700 border border-ink-600 rounded-lg text-sm text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
                <button
                  onClick={analyzeSkillGaps}
                  disabled={loading}
                  className="w-full bg-brand-500 text-white py-2 rounded-lg hover:bg-brand-600 disabled:bg-ink-600 disabled:text-gray-500 transition text-sm font-medium"
                >
                  {loading ? 'Analyzing...' : 'Analyze'}
                </button>
              </div>
            </div>

            {/* Headcount Forecast */}
            <div className="border border-ink-600 rounded-lg p-4">
              <h4 className="font-semibold text-gray-100">📈 Headcount Forecast</h4>
              <p className="text-sm text-gray-500 mt-1">Strategic hiring insights</p>
              <button
                onClick={generateHeadcountForecast}
                disabled={loading}
                className="w-full mt-4 bg-brand-500 text-white py-2 rounded-lg hover:bg-brand-600 disabled:bg-ink-600 disabled:text-gray-500 transition text-sm font-medium"
              >
                {loading ? 'Generating...' : 'Generate Forecast'}
              </button>
            </div>

            {/* Flight Risk */}
            <div className="border border-ink-600 rounded-lg p-4">
              <h4 className="font-semibold text-gray-100">⚠️ Flight Risk</h4>
              <p className="text-sm text-gray-500 mt-1">Detect retention risks</p>
              <div className="mt-4 space-y-3">
                <input
                  type="number"
                  placeholder="Employee ID"
                  value={inputs.employee_id}
                  onChange={(e) => setInputs({ ...inputs, employee_id: e.target.value })}
                  className="w-full px-3 py-2 bg-ink-700 border border-ink-600 rounded-lg text-sm text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
                <button
                  onClick={assessFlightRisk}
                  disabled={loading}
                  className="w-full bg-brand-500 text-white py-2 rounded-lg hover:bg-brand-600 disabled:bg-ink-600 disabled:text-gray-500 transition text-sm font-medium"
                >
                  {loading ? 'Assessing...' : 'Assess'}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Results Panel */}
        <div className="lg:col-span-2 bg-ink-800 border border-ink-600 rounded-lg p-6">
          <h3 className="text-lg font-bold text-gray-100 mb-4">Analysis Results</h3>

          {!result && !loading && (
            <div className="text-center py-12 text-gray-500">
              <p>Select an analysis tool to generate insights</p>
            </div>
          )}

          {loading && (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-brand-500 mb-4"></div>
                <p className="text-gray-500">Claude is analyzing your data...</p>
              </div>
            </div>
          )}

          {result && !loading && (
            <div className="space-y-6">
              {result.metrics && (
                <div className="bg-blue-500/10 rounded-lg p-6 border border-blue-500/20">
                  <h4 className="font-semibold text-gray-100 mb-4">📊 Metrics Summary</h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    {Object.entries(result.metrics).map(([key, value]) => (
                      <div key={key}>
                        <p className="text-gray-500 capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</p>
                        <p className="text-2xl font-bold text-blue-400">{typeof value === 'number' ? value.toFixed(1) : value}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {result.insights && (
                <div className="bg-emerald-500/10 rounded-lg p-6 border border-emerald-500/20">
                  <h4 className="font-semibold text-gray-100 mb-4">🧠 Claude Insights</h4>
                  <p className="text-gray-300 whitespace-pre-wrap leading-relaxed">{result.insights}</p>
                </div>
              )}

              {result.analysis && (
                <div className="bg-violet-500/10 rounded-lg p-6 border border-violet-500/20">
                  <h4 className="font-semibold text-gray-100 mb-4">📋 Analysis</h4>
                  <p className="text-gray-300 whitespace-pre-wrap leading-relaxed">{result.analysis}</p>
                </div>
              )}

              {result.assessment && (
                <div className="bg-red-500/10 rounded-lg p-6 border border-red-500/20">
                  <h4 className="font-semibold text-gray-100 mb-4">⚠️ Assessment</h4>
                  <p className="text-gray-300 whitespace-pre-wrap leading-relaxed">{result.assessment}</p>
                </div>
              )}

              <p className="text-xs text-gray-600">Generated at {result.generatedAt}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default AIWorkforceAdvisor;
