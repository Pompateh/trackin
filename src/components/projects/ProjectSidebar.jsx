import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabaseClient';
import { debounce } from 'lodash';
import TaskList from '../tasks/TaskList';
import CommentSection from '../comments/CommentSection';
import RecapList from './RecapList';
import { HiOutlineChevronRight } from 'react-icons/hi';
import CreateTaskModal from '../tasks/CreateTaskModal';

const ProjectSidebar = ({ projectId, onToggleSidebar, role, projectName }) => {
  const [notes, setNotes] = useState('');
  const navigate = useNavigate();
  const [tasks, setTasks] = useState([]);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteInput, setDeleteInput] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  // Fetch initial notes
  useEffect(() => {
    if (!projectId) return;
    const fetchNotes = async () => {
      const { data, error } = await supabase
        .from('projects')
        .select('notes')
        .eq('id', projectId)
        .single();
      
      if (error) {
        console.error('Error fetching notes:', error);
      } else if (data) {
        setNotes(data.notes || '');
      }
    };
    fetchNotes();
  }, [projectId]);

  // Debounced save function
  const saveNotes = useCallback(
    debounce(async (newNotes) => {
      const { error } = await supabase
        .from('projects')
        .update({ notes: newNotes })
        .eq('id', projectId);
      
      if (error) {
        console.error('Error saving notes:', error);
      }
    }, 1000),
    [projectId]
  );

  const handleNotesChange = (e) => {
    const newNotes = e.target.value;
    setNotes(newNotes);
    saveNotes(newNotes);
  };

  const handleDeleteProject = async () => {
    setShowDeleteModal(true);
  };

  const confirmDeleteProject = async () => {
    setIsDeleting(true);
    const { error } = await supabase
      .from('projects')
      .delete()
      .eq('id', projectId);
    setIsDeleting(false);
    setShowDeleteModal(false);
    setDeleteInput('');
    if (error) {
      alert('Failed to delete project: ' + error.message);
    } else {
      navigate('/');
    }
  };

  // Fetch tasks from Supabase when projectId changes
  useEffect(() => {
    if (!projectId) return;
    const fetchTasks = async () => {
      const { data, error } = await supabase
        .from('tasks')
        .select('*, assigned_to_user:users(email)')
        .eq('project_id', projectId);
      if (error) {
        console.error('Error fetching tasks:', error);
        setTasks([]);
      } else {
        setTasks(data || []);
      }
    };
    fetchTasks();
  }, [projectId]);

  // Add a new task to Supabase and refresh the list
  const handleAddTask = async (newTask) => {
    if (!projectId) return;
    const taskToInsert = {
      project_id: projectId,
      title: newTask.title,
      assigned_to: newTask.assignedTo ? newTask.assignedTo : null,
      status: 'todo',
    };
    console.log('Inserting task:', taskToInsert);
    // Insert the new task into Supabase
    const { error } = await supabase
      .from('tasks')
      .insert(taskToInsert);
    if (error) {
      console.error('Error adding task:', error);
      return;
    }
    // Fetch the latest tasks from Supabase
    const { data: updatedTasks, error: fetchError } = await supabase
      .from('tasks')
      .select('*, assigned_to_user:users(email)')
      .eq('project_id', projectId);
    if (fetchError) {
      console.error('Error fetching updated tasks:', fetchError);
      return;
    }
    setTasks(updatedTasks || []);
    setIsTaskModalOpen(false);
  };

  return (
    <div className="h-full flex flex-col border-t border-b border-black bg-white">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-black px-0" style={{height: '155px'}}>
        <span className="font-serif font-extralight" style={{ fontFamily: 'Crimson Pro, serif', fontWeight: 250, fontSize: '100px', lineHeight: '96px', paddingLeft: '13px', margin: 0 }}>NOTE</span>
        <button
          className="flex items-center justify-center border-none bg-transparent text-black hover:bg-gray-100"
          style={{ width: '60px', height: '100%', fontSize: '2rem', borderRadius: 0 }}
          onClick={onToggleSidebar}
        >
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" style={{marginRight: '8px', display: 'block'}}>
            <path d="M9 18l6-6-6-6" />
          </svg>
        </button>
      </div>
      {/* TASK Section (auto height, up to max) */}
      <div className="border-b border-black" style={{maxHeight: '220px', overflow: 'auto', scrollbarWidth: 'none', msOverflowStyle: 'none', position: 'relative'}}>
        <style>{`
          .hide-scrollbar::-webkit-scrollbar { display: none; }
          .hide-scrollbar { scrollbar-width: none; -ms-overflow-style: none; }
        `}</style>
        <div className="flex items-center justify-between px-0 sticky top-0 bg-white border-b border-black hide-scrollbar" style={{height: '60px', zIndex: 100, position: 'sticky', top: 0, background: '#D9D9D9'}}>
          <span className="font-gothic font-bold" style={{ fontFamily: 'Gothic A1, sans-serif', fontWeight: 700, fontSize: '25px', paddingLeft: '16px' }}>TASK</span>
          <button className="flex items-center justify-center text-black border-none bg-transparent hover:bg-gray-100" style={{ fontSize: '2rem', width: '60px', height: '100%', borderRadius: 0, marginRight: '8px' }} onClick={() => setIsTaskModalOpen(true)}>
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" style={{display: 'block'}}>
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
          </button>
        </div>
        <div
          className="hide-scrollbar"
          style={
            tasks.length >= 2
              ? { overflowY: 'auto', maxHeight: '160px' }
              : { overflowY: 'visible', maxHeight: 'none' }
          }
        >
          <TaskList
            projectId={projectId}
            tasks={tasks}
            setTasks={setTasks}
            customStyle
            role={role}
          />
        </div>
        <CreateTaskModal
          isOpen={isTaskModalOpen}
          onClose={() => setIsTaskModalOpen(false)}
          onAddTask={handleAddTask}
        />
      </div>
      {/* COMMENT & RECAP Row (fills all available space above delete button) */}
      <div className="flex flex-row flex-1 min-h-0 border-b border-black">
        {/* COMMENT */}
        <div className="w-7/10 flex flex-col h-full" style={{width: '70%'}}>
          <div className="font-gothic font-bold border-b border-black px-0" style={{ fontFamily: 'Gothic A1, sans-serif', fontWeight: 700, fontSize: '25px', height: '60px', display: 'flex', alignItems: 'center', paddingLeft: '16px', background: '#D9D9D9' }}>COMMENT</div>
          <div className="flex-1 flex flex-col overflow-y-auto">
            <CommentSection projectId={projectId} customStyle />
          </div>
        </div>
        {/* RECAP */}
        <div className="w-3/10 flex flex-col border-l border-black h-full" style={{width: '30%'}}>
          <div className="font-gothic font-bold border-b border-black px-0" style={{ fontFamily: 'Gothic A1, sans-serif', fontWeight: 700, fontSize: '25px', height: '60px', display: 'flex', alignItems: 'center', paddingLeft: '16px', background: '#D9D9D9' }}>RECAP</div>
          <div className="flex-1 flex flex-col overflow-y-auto">
            <RecapList projectId={projectId} customStyle />
          </div>
        </div>
      </div>
      {/* Delete button at the bottom */}
      <div className="flex-0 flex flex-col justify-end" style={{marginTop: 0, paddingTop: 0}}>
        <button
          className="btn w-full text-red-600 bg-white hover:bg-gray-100 border-none"
          style={{ borderRadius: 0 }}
          onClick={handleDeleteProject}
        >
          Delete Project
        </button>
      </div>
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
                <span className="font-semibold" style={{ fontFamily: 'Crimson Pro, serif' }}>Project Name:</span> <span className="italic">{projectName}</span>
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
                  onClick={confirmDeleteProject}
                  disabled={deleteInput !== projectName || isDeleting}
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

export default ProjectSidebar; 