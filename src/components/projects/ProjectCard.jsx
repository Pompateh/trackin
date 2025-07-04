import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

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
  const navigate = useNavigate();

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
    <div className="border border-black bg-white w-full flex flex-col justify-between" style={{height: '100%'}}>
      {/* Team Member Section */}
      <div className="flex items-center justify-between pb-1 mb-2 px-2 font-crimson font-semibold text-[25px]">
        <div>Team Member</div>
        <button className="text-lg text-gray-600 hover:text-black">×</button>
      </div>
      <div className="italic text-xs text-gray-500 mb-2 -mt-2 px-2 font-gothic font-normal">{teamMembers}</div>
      <div className="border-b border-black w-full h-px"></div>

      {/* Project Title */}
      <div className="flex items-center justify-between pb-1 mb-2 px-2 font-crimson font-semibold text-[25px]">
        <div>{project.name}</div>
        <button className="text-lg text-gray-600 hover:text-black">×</button>
      </div>
      <div className="text-xs text-gray-600 mb-2 px-2 font-gothic font-normal">
        {project.description || 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.'}
      </div>
      <div className="border-b border-black w-full h-px"></div>

      {/* Project Status (big, centered) */}
      <div className="flex justify-center items-center my-4 px-2 font-gothic font-normal" style={{minHeight: '90px'}}>
        <span className="font-serif text-[4rem] leading-none">{statusLabels[project.status] || project.status}</span>
      </div>
      <div className="border-b border-black w-full h-px"></div>

      {/* Deadline */}
      <div className="flex items-center justify-between px-2 font-crimson font-semibold text-[25px]">
        <div>Deadline</div>
        <div className="italic text-sm text-red-500 font-gothic font-normal">{formatDate(project.deadline)}</div>
      </div>
      <div className="border-b border-black w-full h-px"></div>

      {/* Detail Section */}
      <div
        className="flex items-center justify-between px-2 font-crimson font-semibold text-[25px] cursor-pointer hover:bg-gray-100 transition"
        onClick={() => navigate(`/project/${project.id}`)}
      >
        <div>Detail</div>
      </div>
    </div>
  );
};

export default ProjectCard; 