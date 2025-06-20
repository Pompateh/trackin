import React from 'react';
import { Link } from 'react-router-dom';

const ProjectCard = ({ project }) => {
  return (
    <div className="card bg-base-100 shadow-xl hover:shadow-2xl transition-shadow duration-300">
      <div className="card-body">
        <h2 className="card-title">{project.name}</h2>
        <p>{project.description || 'No description provided.'}</p>
        <div className="card-actions justify-end">
          <Link to={`/project/${project.id}`} className="btn btn-primary">
            Open Project
          </Link>
        </div>
        <div className="mt-4">
          <span className="badge badge-neutral">{project.role}</span>
        </div>
      </div>
    </div>
  );
};

export default ProjectCard; 