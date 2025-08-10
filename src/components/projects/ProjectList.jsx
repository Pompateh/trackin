import React from 'react';
import ProjectCard from './ProjectCard';

const ProjectList = ({ projects }) => {
  console.log('ProjectList - received projects:', projects);
  console.log('ProjectList - first project team_emails:', projects[0]?.team_emails);
  
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
        <div key={rowIndex} className="flex w-full px-2 mb-2 gap-2">
          {row.map((project, idx) => {
            const isLastInLastRow = rowIndex === rows.length - 1;
            return (
              <div
                key={project.id}
                className={`w-1/3 border border-black ${isLastInLastRow ? '' : 'mb-8'}`}
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