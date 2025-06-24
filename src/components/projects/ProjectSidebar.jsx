import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabaseClient';
import { debounce } from 'lodash';
import TaskList from '../tasks/TaskList';
import CommentSection from '../comments/CommentSection';
import RecapList from './RecapList';

const ProjectSidebar = ({ projectId }) => {
  const [notes, setNotes] = useState('');
  const navigate = useNavigate();

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

  return (
    <div className="bg-base-200 p-4 h-full overflow-y-auto">
      <div className="mb-4">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-bold">NOTE</h2>
          <button 
            className="btn btn-primary btn-sm"
            onClick={() => navigate(`/project/${projectId}/invite`)}
          >
            Share
          </button>
        </div>
      </div>
      <textarea
        className="textarea textarea-bordered w-full h-32"
        placeholder="Project-wide notes..."
        value={notes}
        onChange={handleNotesChange}
      ></textarea>
      
      <div className="divider"></div>
      
      <h2 className="text-xl font-bold mb-4">TASK</h2>
      <TaskList projectId={projectId} />

      <div className="divider"></div>

      <h2 className="text-xl font-bold mb-4">COMMENT</h2>
      <CommentSection projectId={projectId} />

      <div className="divider"></div>
      
      <h2 className="text-xl font-bold mb-4">RECAP</h2>
      <RecapList projectId={projectId} />
    </div>
  );
};

export default ProjectSidebar; 