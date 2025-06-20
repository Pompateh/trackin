import React from 'react';
import ProjectCard from './ProjectCard';

const ProjectList = ({ projects }) => {
  if (projects.length === 0) {
    return (
      <div className="text-center text-gray-500">
        <p>You are not a member of any projects yet.</p>
        <p>Create a new project to get started.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {projects.map((project) => (
        <ProjectCard key={project.id} project={project} />
      ))}
    </div>
  );
};

export default ProjectList; 