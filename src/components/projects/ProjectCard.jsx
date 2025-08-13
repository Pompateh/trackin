import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabaseClient';
import toast from 'react-hot-toast';
import EditProjectModal from './EditProjectModal';
import useAuthStore from '../../store/useAuthStore';

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

const ProjectCard = ({ project, onProjectUpdated }) => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteInput, setDeleteInput] = useState('');

  // Check if user is admin
  const isAdmin = user?.user_metadata?.can_create_projects === true;

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
  const teamMembers = Array.isArray(project.team_emails) && project.team_emails.length > 0
    ? project.team_emails.map(email => {
        const username = email.split('@')[0];
        return username;
      }).join(', ')
    : 'You';

  const handleDeleteProject = async () => {
    setIsDeleting(true);
    try {
      // Clean up all related data in the correct order (foreign key constraints)
      
      // 1. Delete comments first (they reference project_id)
      const { error: commentsError } = await supabase
        .from('comments')
        .delete()
        .eq('project_id', project.id);

      if (commentsError) {
        console.error('Error deleting comments:', commentsError);
        // Continue with deletion even if comments fail
      }

      // 2. Delete tasks (they reference project_id)
      const { error: tasksError } = await supabase
        .from('tasks')
        .delete()
        .eq('project_id', project.id);

      if (tasksError) {
        console.error('Error deleting tasks:', tasksError);
        // Continue with deletion even if tasks fail
      }

      // 3. Delete board data if it exists (they reference project_id)
      try {
        const { error: boardError } = await supabase
          .from('boards')
          .delete()
          .eq('project_id', project.id);

        if (boardError) {
          console.error('Error deleting board data:', boardError);
        }
      } catch (error) {
        console.log('Boards table might not exist, continuing...');
      }

      // 4. Delete board comments if they exist
      try {
        const { error: boardCommentsError } = await supabase
          .from('board_image_comments')
          .delete()
          .eq('project_id', project.id);

        if (boardCommentsError) {
          console.error('Error deleting board comments:', boardCommentsError);
        }
      } catch (error) {
        console.log('Board comments table might not exist, continuing...');
      }

      // 5. Delete brief data if it exists
      try {
        const { error: briefError } = await supabase
          .from('brief')
          .delete()
          .eq('project_id', project.id);

        if (briefError) {
          console.error('Error deleting brief data:', briefError);
        }
      } catch (error) {
        console.log('Brief table might not exist, continuing...');
      }

      // 6. Delete pod data if it exists
      try {
        const { error: podError } = await supabase
          .from('pod_data')
          .delete()
          .eq('project_id', project.id);

        if (podError) {
          console.error('Error deleting pod data:', podError);
        }
      } catch (error) {
        console.log('Pod data table might not exist, continuing...');
      }

      // 7. Delete project members (they reference project_id)
      const { error: membersError } = await supabase
        .from('project_members')
        .delete()
        .eq('project_id', project.id);

      if (membersError) throw membersError;

      // 8. Finally, delete the project itself
      const { error: projectError } = await supabase
        .from('projects')
        .delete()
        .eq('id', project.id);

      if (projectError) throw projectError;

      toast.success(`Project "${project.name}" and all related data deleted successfully!`);
      onProjectUpdated(); // Refresh the project list
      setShowDeleteModal(false);
      setDeleteInput('');
    } catch (error) {
      toast.error(`Failed to delete project: ${error.message}`);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="bg-white w-full flex flex-col justify-between" style={{height: '100%'}}>
      {/* Project Name Section */}
      <div className="px-2 pt-2 pb-1 font-serif font-bold text-2xl flex justify-between items-center">
        <span>{project.name}</span>
        {isAdmin && (
          <button 
            className="text-black hover:text-gray-700 font-bold text-xl cursor-pointer"
            onClick={() => setShowDeleteModal(true)}
            title="Delete Project"
          >
            ×
          </button>
        )}
      </div>
      <div className="border-b border-black w-full h-px"></div>
      {/* Team Member Section */}
      <div className="flex items-center justify-between px-2 font-crimson font-semibold text-[25px]">
        <div>Team Member</div>
      </div>
      <div className="italic text-xs text-gray-500 mb-2 px-2 pb-2 font-gothic font-normal">{teamMembers}</div>
      <div className="border-b border-black w-full h-px"></div>

      {/* Project Description */}
      <div className="flex items-center justify-between  px-2 font-crimson font-semibold text-[25px]">
        <div>Description</div>
      </div>
      <div
        className="text-sm text-gray-600 mb-2 px-2 font-gothic font-normal"
        style={{ height: '60px', overflow: 'hidden', display: 'flex', alignItems: 'flex-start' }}
      >
        {project.notes || 'No description available.'}
      </div>
      <div className="border-b border-black w-full h-px"></div>

      {/* Project Status (big, centered) */}
      <div className="flex justify-center items-center my-4 px-2 font-gothic font-normal" style={{minHeight: '90px'}}>
        <span className="font-serif text-[4rem] leading-none">{statusLabels[project.status] || 'On Going'}</span>
      </div>
      <div className="border-b border-black w-full h-px"></div>

      {/* Deadline */}
      <div className="flex items-center justify-between px-2 font-crimson font-semibold text-[25px]">
        <div>Deadline</div>
        <div className="italic text-sm text-red-500 font-gothic font-normal">
          {project.deadline ? formatDate(project.deadline) : 'Not set'}
        </div>
      </div>
      <div className="border-b border-black w-full h-px"></div>

      {/* Detail Section */}
      <div className="flex items-center justify-between px-2 font-crimson font-semibold text-[25px]">
        <div 
          className="cursor-pointer hover:bg-gray-100 transition"
          onClick={() => navigate(`/project/${project.id}`)}
        >
          Detail
        </div>
        {isAdmin && (
          <div 
            className="cursor-pointer hover:bg-gray-100 transition font-crimson font-semibold text-[25px]"
            onClick={() => setIsEditModalOpen(true)}
            title="Edit Project"
          >
            Edit
          </div>
        )}
      </div>
      
      <EditProjectModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onProjectUpdated={onProjectUpdated}
        project={project}
      />
      
      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white p-6 min-w-[320px] max-w-[90vw] max-h-[90vh] overflow-auto border border-black" style={{ borderRadius: '0' }}>
            <button
              onClick={() => { setShowDeleteModal(false); setDeleteInput(''); }}
              className="absolute right-4 top-4 text-black hover:text-gray-600 font-bold text-lg"
              style={{ fontFamily: 'Crimson Pro, serif' }}
            >
              ✕
            </button>
            <div className="mt-2">
              <h2 className="text-lg font-bold mb-4 text-red-600" style={{ fontFamily: 'Crimson Pro, serif' }}>Confirm Project Deletion</h2>
              <p style={{ fontFamily: 'Crimson Pro, serif' }}>To confirm deletion, type the project name below:</p>
              <div className="mb-4">
                <span className="font-semibold" style={{ fontFamily: 'Crimson Pro, serif' }}>Project Name:</span> <span className="italic">{project.name}</span>
              </div>
              <input
                type="text"
                className="w-full px-2 py-1 border border-black text-black bg-white font-crimson font-semibold mb-4"
                style={{ fontFamily: 'Crimson Pro, serif', borderRadius: '0' }}
                placeholder="Type project name to confirm"
                value={deleteInput}
                onChange={e => setDeleteInput(e.target.value)}
                disabled={isDeleting}
                autoFocus
              />
              <div className="flex gap-2 justify-end">
                <button
                  className="px-4 py-2 text-black bg-white border border-black font-crimson font-semibold"
                  style={{ fontFamily: 'Crimson Pro, serif', borderRadius: '0' }}
                  onClick={() => { setShowDeleteModal(false); setDeleteInput(''); }}
                  disabled={isDeleting}
                >
                  Cancel
                </button>
                <button
                  className="px-4 py-2 text-red-500 bg-white border border-red-500 font-crimson font-semibold"
                  style={{ fontFamily: 'Crimson Pro, serif', borderRadius: '0' }}
                  onClick={handleDeleteProject}
                  disabled={deleteInput !== project.name || isDeleting}
                >
                  {isDeleting ? 'Deleting...' : 'Delete'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectCard; 