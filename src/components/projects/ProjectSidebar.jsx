import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabaseClient';
import { debounce } from 'lodash';
import TaskList from '../tasks/TaskList';
import CommentSection from '../comments/CommentSection';
import RecapList from './RecapList';
import { HiOutlineChevronRight } from 'react-icons/hi';
import CreateTaskModal from '../tasks/CreateTaskModal';

const ProjectSidebar = ({ projectId, onToggleSidebar, role }) => {
  const [notes, setNotes] = useState('');
  const navigate = useNavigate();
  const [tasks, setTasks] = useState([]);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);

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
    if (!window.confirm('Are you sure you want to delete this project? This action cannot be undone.')) return;
    const { error } = await supabase
      .from('projects')
      .delete()
      .eq('id', projectId);
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
      <div className="flex items-center justify-between border-b border-black px-0" style={{height: '120px'}}>
        <span className="font-serif font-extralight" style={{ fontFamily: 'Crimson Pro, serif', fontWeight: 250, fontSize: '100px', lineHeight: '96px', paddingLeft: '16px' }}>NOTE</span>
        <button
          className="flex items-center justify-center border-none bg-transparent text-black hover:bg-gray-100"
          style={{ width: '60px', height: '100%', fontSize: '2rem', borderRadius: 0 }}
          onClick={onToggleSidebar}
        >
          <HiOutlineChevronRight style={{ fontWeight: 200, fontSize: '2.5rem' }} />
        </button>
      </div>
      {/* TASK Section */}
      <div className="border-b border-black">
        <div className="flex items-center justify-between px-0" style={{height: '60px'}}>
          <span className="font-gothic font-bold" style={{ fontFamily: 'Gothic A1, sans-serif', fontWeight: 700, fontSize: '25px', paddingLeft: '16px' }}>TASK</span>
          <button className="flex items-center justify-center text-black border-none bg-transparent hover:bg-gray-100" style={{ fontSize: '2rem', width: '60px', height: '100%', borderRadius: 0, marginRight: '8px' }} onClick={() => setIsTaskModalOpen(true)}>+</button>
        </div>
        <TaskList
          projectId={projectId}
          tasks={tasks}
          setTasks={setTasks}
          customStyle
          role={role}
        />
        <CreateTaskModal
          isOpen={isTaskModalOpen}
          onClose={() => setIsTaskModalOpen(false)}
          onAddTask={handleAddTask}
        />
      </div>
      {/* COMMENT & RECAP Split */}
      <div className="flex flex-1 min-h-0 border-b border-black">
        {/* COMMENT */}
        <div className="w-1/2 border-r border-black flex flex-col">
          <div className="font-gothic font-bold border-b border-black px-0" style={{ fontFamily: 'Gothic A1, sans-serif', fontWeight: 700, fontSize: '25px', height: '60px', display: 'flex', alignItems: 'center', paddingLeft: '16px' }}>COMMENT</div>
          <div className="flex-1 flex flex-col">
            <CommentSection projectId={projectId} customStyle />
          </div>
        </div>
        {/* RECAP */}
        <div className="w-1/2 flex flex-col border-l border-black">
          <div className="font-gothic font-bold border-b border-black px-0" style={{ fontFamily: 'Gothic A1, sans-serif', fontWeight: 700, fontSize: '25px', height: '60px', display: 'flex', alignItems: 'center', paddingLeft: '16px' }}>RECAP</div>
          <div className="flex-1 flex flex-col">
            <RecapList projectId={projectId} customStyle />
          </div>
        </div>
      </div>
      <div className="mt-8 flex-1 flex flex-col justify-end">
        <button
          className="btn btn-error btn-outline w-full"
          onClick={handleDeleteProject}
        >
          Delete Project
        </button>
      </div>
    </div>
  );
};

export default ProjectSidebar; 