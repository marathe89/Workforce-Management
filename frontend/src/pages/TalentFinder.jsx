import React, { useEffect, useState } from 'react';
import apiClient from '../api/client';
import LoadingSpinner from '../components/LoadingSpinner';

function TalentFinder() {
  const [employees, setEmployees] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('');

  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const response = await apiClient.get('/employees');
        setEmployees(response.data);
      } catch (err) {
        setError('Failed to load employees');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchEmployees();
  }, []);

  const filteredEmployees = employees.filter(
    (emp) =>
      emp.name?.toLowerCase().includes(filter.toLowerCase()) ||
      emp.email?.toLowerCase().includes(filter.toLowerCase()) ||
      emp.job_title?.toLowerCase().includes(filter.toLowerCase())
  );

  if (loading) return <LoadingSpinner />;

  return (
    <div className="p-8 space-y-6">
      <div>
        <h1 className="text-4xl font-bold text-gray-100">Talent Finder</h1>
        <p className="text-gray-500 mt-2">Find the right talent based on skills, availability and delivery context.</p>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      <div className="flex gap-4">
        <input
          type="text"
          placeholder="Search employees..."
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="flex-1 px-4 py-2 bg-ink-800 border border-ink-600 rounded-lg text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-brand-500"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Employee List */}
        <div className="lg:col-span-2 bg-ink-800 border border-ink-600 rounded-lg">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b border-ink-600">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-300">Name</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-300">Job Title</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-300">Performance</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-300">Utilization</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-300">Risk</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ink-700">
                {filteredEmployees.map((emp) => (
                  <tr
                    key={emp.id}
                    onClick={() => setSelectedEmployee(emp)}
                    className="hover:bg-ink-700/50 cursor-pointer"
                  >
                    <td className="px-6 py-4 text-sm font-medium text-gray-100">{emp.name}</td>
                    <td className="px-6 py-4 text-sm text-gray-400">{emp.job_title || '-'}</td>
                    <td className="px-6 py-4 text-sm">
                      <div className="flex items-center">
                        <span className={`font-medium ${
                          emp.performance_rating >= 4 ? 'text-emerald-400' :
                          emp.performance_rating >= 3 ? 'text-blue-400' :
                          'text-red-400'
                        }`}>
                          {emp.performance_rating ? emp.performance_rating.toFixed(1) : '-'}
                        </span>
                        <span className="text-gray-500 ml-1">/5</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <div className="w-24 bg-ink-600 rounded-full h-2">
                        <div
                          className="bg-brand-500 h-2 rounded-full"
                          style={{ width: `${emp.utilization_rate || 0}%` }}
                        ></div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        emp.risk_flag === 'high' ? 'bg-red-500/15 text-red-400' :
                        emp.risk_flag === 'medium' ? 'bg-amber-500/15 text-amber-400' :
                        'bg-emerald-500/15 text-emerald-400'
                      }`}>
                        {emp.risk_flag || 'low'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Employee Details */}
        {selectedEmployee && (
          <div className="bg-ink-800 border border-ink-600 rounded-lg p-6 sticky top-20 h-fit">
            <h3 className="text-lg font-bold text-gray-100 mb-4">{selectedEmployee.name}</h3>
            <div className="space-y-4 text-sm">
              <div>
                <p className="text-gray-500">Email</p>
                <p className="font-medium text-gray-100">{selectedEmployee.email}</p>
              </div>
              <div>
                <p className="text-gray-500">Job Title</p>
                <p className="font-medium text-gray-100">{selectedEmployee.job_title || '-'}</p>
              </div>
              <div>
                <p className="text-gray-500">Department</p>
                <p className="font-medium text-gray-100">{selectedEmployee.department || '-'}</p>
              </div>
              <div>
                <p className="text-gray-500">Status</p>
                <p className="font-medium text-gray-100 capitalize">{selectedEmployee.employment_status || '-'}</p>
              </div>
              <div className="border-t border-ink-600 pt-4">
                <p className="text-gray-500">Performance Rating</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-2xl font-bold text-blue-400">
                    {selectedEmployee.performance_rating ? selectedEmployee.performance_rating.toFixed(1) : '-'}
                  </span>
                  <span className="text-gray-500">/5</span>
                </div>
              </div>
              <div>
                <p className="text-gray-500">Utilization Rate</p>
                <p className="text-2xl font-bold text-blue-400">{selectedEmployee.utilization_rate?.toFixed(0) || 0}%</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default TalentFinder;
