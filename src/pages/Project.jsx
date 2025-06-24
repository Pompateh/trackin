import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import useProjectStore from '../store/useProjectStore';
import useAuthStore from '../store/useAuthStore';
// import TldrawCanvas from '../components/board/TldrawCanvas';
import TaskList from '../components/tasks/TaskList';
import CommentSection from '../components/comments/CommentSection';
import SectionList from '../components/projects/SectionList';
import RecapList from '../components/projects/RecapList';
// Placeholder for new components
// import RecapList from '../components/projects/RecapList';

const Project = () => {
  const { projectId } = useParams();
  const { user } = useAuthStore();
  const { project, role, loading, fetchProjectData } = useProjectStore();
  // State for selected section/task for NOTE panel
  const [selectedSection, setSelectedSection] = useState(null);
  const [selectedTask, setSelectedTask] = useState(null);

  useEffect(() => {
    if (projectId && user) {
      fetchProjectData(projectId, user.id);
    }
  }, [projectId, user, fetchProjectData]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-full">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="text-center">
        <h2 className="text-2xl font-bold">Project not found or you don't have access.</h2>
        <Link to="/" className="btn btn-primary mt-4">Back to Dashboard</Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col md:flex-row h-[calc(100vh-120px)]">
      {/* INDEX panel */}
      <div className="w-full md:w-1/2 border-r border-gray-300 p-4 overflow-y-auto">
        <h1 className="text-4xl font-serif mb-4">INDEX</h1>
        <SectionList projectId={projectId} onSelectSection={setSelectedSection} selectedSection={selectedSection} isAdmin={role === 'admin'} />
      </div>
      {/* NOTE panel */}
      <div className="w-full md:w-1/2 p-4 overflow-y-auto">
        <h1 className="text-4xl font-serif mb-4">NOTE</h1>
        {/* TASKS */}
        <div className="mb-6">
          <h2 className="text-xl font-bold mb-2">TASK</h2>
          <TaskList projectId={projectId} sectionId={selectedSection?.id} onSelectTask={setSelectedTask} selectedTask={selectedTask} />
            </div>
        {/* COMMENTS */}
        <div className="mb-6">
          <h2 className="text-xl font-bold mb-2">COMMENT</h2>
          <CommentSection projectId={projectId} taskId={selectedTask?.id} />
          </div>
        {/* RECAP */}
        <div>
          <h2 className="text-xl font-bold mb-2">RECAP</h2>
          <RecapList projectId={projectId} />
            </div>
      </div>
    </div>
  );
};

export default Project; 