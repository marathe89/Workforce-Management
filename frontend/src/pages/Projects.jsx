import React, { useEffect, useState } from 'react';
import apiClient from '../api/client';
import LoadingSpinner from '../components/LoadingSpinner';

function Projects() {
  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const response = await apiClient.get('/projects', {
          params: filter !== 'all' ? { status: filter } : {},
        });
        setProjects(response.data);
      } catch (err) {
        setError('Failed to load projects');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, [filter]);

  if (loading) return <LoadingSpinner />;

  const filteredProjects = filter === 'all' ? projects : projects.filter(p => p.status === filter);

  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
        return 'bg-emerald-500/15 text-emerald-400';
      case 'planning':
        return 'bg-blue-500/15 text-blue-400';
      case 'on_hold':
        return 'bg-amber-500/15 text-amber-400';
      case 'completed':
        return 'bg-gray-500/15 text-gray-400';
      default:
        return 'bg-gray-500/15 text-gray-400';
    }
  };

  return (
    <div className="p-8 space-y-6">
      <div>
        <h1 className="text-4xl font-bold text-gray-100">Projects</h1>
        <p className="text-gray-500 mt-2">Manage projects and resource allocation</p>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      <div className="flex gap-2">
        {['all', 'planning', 'active', 'on_hold', 'completed'].map((status) => (
          <button
            key={status}
            onClick={() => setFilter(status)}
            className={`px-4 py-2 rounded-lg font-medium transition ${
              filter === status
                ? 'bg-brand-500 text-white'
                : 'bg-ink-800 text-gray-400 border border-ink-600 hover:bg-ink-700'
            }`}
          >
            {status.replace('_', ' ').charAt(0).toUpperCase() + status.replace('_', ' ').slice(1)}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Projects Grid */}
        <div className="lg:col-span-2 space-y-4">
          {filteredProjects.map((project) => (
            <div
              key={project.id}
              onClick={() => setSelectedProject(project)}
              className="bg-ink-800 border border-ink-600 rounded-lg p-6 hover:border-brand-500/50 cursor-pointer transition"
            >
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-lg font-bold text-gray-100">{project.project_name}</h3>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(project.status)}`}>
                  {project.status.replace('_', ' ')}
                </span>
              </div>

              <p className="text-gray-500 text-sm mb-4">{project.description || 'No description'}</p>

              <div className="grid grid-cols-3 gap-4 text-sm">
                <div>
                  <p className="text-gray-500">Start Date</p>
                  <p className="font-medium text-gray-100">{project.start_date || '-'}</p>
                </div>
                <div>
                  <p className="text-gray-500">End Date</p>
                  <p className="font-medium text-gray-100">{project.end_date || '-'}</p>
                </div>
                <div>
                  <p className="text-gray-500">Headcount</p>
                  <p className="font-medium text-gray-100">{project.required_headcount || 0}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Project Details */}
        {selectedProject && (
          <div className="bg-ink-800 border border-ink-600 rounded-lg p-6 sticky top-20 h-fit">
            <h3 className="text-lg font-bold text-gray-100 mb-4">{selectedProject.project_name}</h3>

            <div className="space-y-4 text-sm mb-6">
              <div className="border-b border-ink-600 pb-4">
                <p className="text-gray-500">Status</p>
                <p className={`font-medium mt-1 inline-block px-3 py-1 rounded-full text-xs ${getStatusColor(selectedProject.status)}`}>
                  {selectedProject.status.replace('_', ' ')}
                </p>
              </div>

              <div>
                <p className="text-gray-500">Description</p>
                <p className="font-medium text-gray-100 mt-1">{selectedProject.description || 'No description'}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-gray-500">Start Date</p>
                  <p className="font-medium text-gray-100">{selectedProject.start_date || '-'}</p>
                </div>
                <div>
                  <p className="text-gray-500">End Date</p>
                  <p className="font-medium text-gray-100">{selectedProject.end_date || '-'}</p>
                </div>
              </div>

              <div>
                <p className="text-gray-500">Required Headcount</p>
                <p className="text-2xl font-bold text-blue-400 mt-1">{selectedProject.required_headcount || 0}</p>
              </div>
            </div>

            <button className="w-full bg-brand-500 text-white py-2 rounded-lg hover:bg-brand-600 transition font-medium">
              View Assignments
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default Projects;
