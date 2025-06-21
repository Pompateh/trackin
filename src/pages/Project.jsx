import React, { useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import useProjectStore from '../store/useProjectStore';
import useAuthStore from '../store/useAuthStore';
import TldrawCanvas from '../components/board/TldrawCanvas';
import TaskList from '../components/tasks/TaskList';
import CommentSection from '../components/comments/CommentSection';

const Project = () => {
  const { projectId } = useParams();
  const { user } = useAuthStore();
  const { project, role, loading, fetchProjectData, members } = useProjectStore();

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

  const canEditBoard = role === 'admin' || role === 'member';
  const isAdmin = role === 'admin';

  return (
    <div className="flex flex-col lg:flex-row gap-4 h-[calc(100vh-120px)]">
      {/* Main content - Tldraw Canvas */}
      <div className="flex-grow h-full">
        <h1 className="text-3xl font-bold mb-2">{project.name}</h1>
        <p className="mb-4">{project.description}</p>
        <div className="relative h-[calc(100%-80px)] rounded-lg shadow-lg">
          <TldrawCanvas projectId={projectId} canEdit={canEditBoard} />
        </div>
      </div>

      {/* Sidebar */}
      <div className="w-full lg:w-96 flex-shrink-0 space-y-4">
          <div className="card bg-base-100 shadow-md">
            <div className="card-body">
              <h2 className="card-title">Tasks</h2>
              <TaskList projectId={projectId} isAdmin={isAdmin} />
            </div>
          </div>
          <div className="card bg-base-100 shadow-md">
            <div className="card-body">
              <h2 className="card-title">Comments</h2>
              <CommentSection projectId={projectId} />
            </div>
          </div>
          {/* Admin: Show all project members */}
          {isAdmin && (
            <div className="card bg-base-100 shadow-md">
              <div className="card-body">
                <h2 className="card-title">Project Members</h2>
                {members && members.length > 0 ? (
                  <ul>
                    {members.map((m) => (
                      <li key={m.user_id}>
                        {m.email} ({m.role})
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div>No members found.</div>
                )}
              </div>
            </div>
          )}
          {/* Non-admin: Show own role */}
          {!isAdmin && (
            <div className="card bg-base-100 shadow-md">
              <div className="card-body">
                <h2 className="card-title">Your Role</h2>
                <div>{role}</div>
              </div>
            </div>
          )}
          {isAdmin && (
             <div className="card bg-base-100 shadow-md">
                <div className="card-body">
                    <h2 className="card-title">Admin Actions</h2>
                    <Link to={`/project/${projectId}/invite`} className="btn btn-secondary">
                        Invite Users
                    </Link>
                </div>
            </div>
          )}
      </div>
    </div>
  );
};

export default Project; 