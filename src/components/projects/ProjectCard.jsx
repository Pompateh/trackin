import React from 'react';
import { Link } from 'react-router-dom';

const statusLabels = {
  on_going: 'On Going',
  onhold: 'On Hold',
  complete: 'Complete',
};

const statusColors = {
  on_going: 'bg-blue-100 text-blue-700',
  onhold: 'bg-yellow-100 text-yellow-700',
  complete: 'bg-green-100 text-green-700',
};

const ProjectCard = ({ project }) => {
  // Format date to match the design (e.g., "Jan 06, 2025")
  const formatDate = (date) => {
    if (!date) return '';
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: '2-digit',
      year: 'numeric'
    });
  };

  // Show all team members (before @)
  const teamMembers = Array.isArray(project.team_emails)
    ? project.team_emails.map(email => email.split('@')[0]).join(', ')
    : 'You';

  return (
    <div className="bg-white rounded-lg p-6 shadow-md hover:shadow-lg transition-shadow duration-300">
      {/* Team Member Section */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          <span className="text-sm text-gray-600">Team Member{Array.isArray(project.team_emails) && project.team_emails.length > 1 ? 's' : ''}</span>
          <button className="ml-2 text-gray-400 hover:text-gray-600">×</button>
        </div>
        <div className="text-xs text-gray-500 truncate max-w-[160px] text-right">{teamMembers}</div>
      </div>

      {/* Project Title */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold">{project.name}</h2>
        <button className="text-gray-400 hover:text-gray-600">×</button>
      </div>

      {/* Project Description */}
      <p className="text-gray-600 text-sm mb-6 line-clamp-2">
        {project.description || 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.'}
      </p>

      {/* Project Status Badge */}
      <div className="mb-6">
        <span className={`inline-block px-4 py-2 rounded-full font-semibold text-lg ${statusColors[project.status] || 'bg-gray-100 text-gray-700'}`}>{statusLabels[project.status] || project.status}</span>
      </div>

      {/* Deadline */}
      <div className="mb-4">
        <div className="text-sm font-medium">Deadline</div>
        <div className="text-red-500">{formatDate(project.deadline)}</div>
      </div>

      {/* Detail Section */}
      <div>
        <div className="text-sm font-medium">Detail</div>
        <Link 
          to={`/project/${project.id}`} 
          className="text-gray-600 hover:text-gray-800 text-sm"
        >
          View Project Details →
        </Link>
      </div>
    </div>
  );
};

export default ProjectCard; 