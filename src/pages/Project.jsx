import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import useProjectStore from '../store/useProjectStore';
import useAuthStore from '../store/useAuthStore';
// import TldrawCanvas from '../components/board/TldrawCanvas';
import TaskList from '../components/tasks/TaskList';
import CommentSection from '../components/comments/CommentSection';
import SectionList from '../components/projects/SectionList';
import RecapList from '../components/projects/RecapList';
import ProjectSidebar from '../components/projects/ProjectSidebar';
// Placeholder for new components
// import RecapList from '../components/projects/RecapList';

const Project = () => {
  const { projectId } = useParams();
  const { user } = useAuthStore();
  const { project, role, loading, fetchProjectData } = useProjectStore();
  // State for selected section/task for NOTE panel
  const [selectedSection, setSelectedSection] = useState(null);
  const [selectedTask, setSelectedTask] = useState(null);
  const [isSidebarVisible, setIsSidebarVisible] = useState(true);

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
    <div className="flex h-[calc(100vh-120px)]">
      {/* Main content */}
      <div className={`flex-grow p-4 h-full transition-all duration-300 ${isSidebarVisible ? 'w-3/4' : 'w-full'}`}>
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-4xl font-serif">INDEX</h1>
          <button 
            className="btn btn-secondary"
            onClick={() => setIsSidebarVisible(!isSidebarVisible)}
          >
            {isSidebarVisible ? 'Hide Panel' : 'Show Panel'}
          </button>
        </div>
        <SectionList 
          projectId={projectId} 
          onSelectSection={setSelectedSection} 
          selectedSection={selectedSection} 
          isAdmin={role === 'admin'} 
        />
      </div>

      {/* Sidebar */}
      {isSidebarVisible && (
        <div className="w-1/4 h-full border-l border-base-300">
          <ProjectSidebar projectId={projectId} />
        </div>
      )}
    </div>
  );
};

export default Project; 