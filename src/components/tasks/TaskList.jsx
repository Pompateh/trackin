import React, { useEffect, useState } from 'react';
import CreateTaskModal from './CreateTaskModal';
// import { supabase } from '../../lib/supabaseClient';

const TaskList = ({ projectId, sectionId, onSelectTask, selectedTask }) => {
  const [tasks, setTasks] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    // TODO: Replace with Supabase fetch
    // Example: fetch tasks for projectId and sectionId
    // supabase.from('tasks').select('*').eq('project_id', projectId).eq('section_id', sectionId)
    //   .then(({ data }) => setTasks(data));
    setTasks([]); // Placeholder
  }, [projectId, sectionId]);

  return (
    <div>
      <button className="btn btn-primary btn-sm mb-4" onClick={() => setIsModalOpen(true)}>
        Add Task
      </button>
      <div className="space-y-2 max-h-64 overflow-y-auto">
        {tasks.length > 0 ? (
          tasks.map((task) => (
            <div
              key={task.id}
              className={`p-2 rounded-md bg-base-200 flex justify-between items-center cursor-pointer ${selectedTask?.id === task.id ? 'border-2 border-blue-500' : ''}`}
              onClick={() => onSelectTask(task)}
            >
              <div>
                <p className="font-semibold">{task.title}</p>
                <p className="text-xs">
                  {task.assignee_email ? `Assigned to: ${task.assignee_email}` : 'Unassigned'}
                </p>
              </div>
              <span className="badge badge-outline">{task.status}</span>
            </div>
          ))
        ) : (
          <p className="text-sm text-gray-500">No tasks for this section yet.</p>
        )}
      </div>
      <CreateTaskModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  );
};

export default TaskList; 