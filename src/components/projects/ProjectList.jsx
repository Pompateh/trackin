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
    <div className="flex flex-wrap w-full">
      {projects.map((project, idx) => {
        const isFirstInRow = idx % 3 === 0;
        const isLastInRow = (idx + 1) % 3 === 0;
        const isSecondRowOrBeyond = idx >= 3;
        return (
          <div
            key={project.id}
            className={`w-1/3
              ${isFirstInRow ? 'border-l border-black' : ''}
              ${!isLastInRow ? 'border-r border-black' : ''}
              border-b border-black
              ${isSecondRowOrBeyond ? 'border-t-0' : 'border-t border-black'}
            `.replace(/\s+/g, ' ').trim()}
          >
            <ProjectCard project={project} />
          </div>
        );
      })}
    </div>
  );
};

export default ProjectList; 