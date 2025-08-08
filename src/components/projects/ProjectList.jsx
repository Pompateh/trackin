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

  // Group projects into rows of 3
  const rows = [];
  for (let i = 0; i < projects.length; i += 3) {
    rows.push(projects.slice(i, i + 3));
  }

  return (
    <div className="w-full">
      {rows.map((row, rowIndex) => (
        <div key={rowIndex} className="flex w-full px-2 mb-2">
          {row.map((project, idx) => {
            const isFirstInRow = idx === 0;
            const isLastInRow = idx === row.length - 1;
            const isSecondRowOrBeyond = rowIndex >= 1;
            const isLastInLastRow = rowIndex === rows.length - 1;
            return (
              <div
                key={project.id}
                className={`w-1/3
                  ${isFirstInRow ? 'border-l border-black' : ''}
                  border-r border-black
                  border-b border-black
                  ${isSecondRowOrBeyond ? 'border-t' : 'border-t border-black'}
                  ${isLastInLastRow ? '' : 'mb-8'}
                `.replace(/\s+/g, ' ').trim()}
              >
                <ProjectCard project={project} />
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
};

export default ProjectList; 