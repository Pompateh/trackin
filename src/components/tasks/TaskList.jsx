import React, { useState } from 'react';
import useProjectStore from '../../store/useProjectStore';
import CreateTaskModal from './CreateTaskModal';

const TaskList = ({ isAdmin }) => {
  const { tasks, updateTaskStatus } = useProjectStore();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleStatusChange = (taskId, newStatus) => {
    updateTaskStatus(taskId, newStatus);
  };

  return (
    <div>
      {isAdmin && (
        <button className="btn btn-primary btn-sm mb-4" onClick={() => setIsModalOpen(true)}>
          Add Task
        </button>
      )}
      <div className="space-y-2 max-h-64 overflow-y-auto">
        {tasks.length > 0 ? (
          tasks.map((task) => (
            <div key={task.id} className="p-2 rounded-md bg-base-200 flex justify-between items-center">
              <div>
                <p className="font-semibold">{task.title}</p>
                <p className="text-xs">
                  {task.assigned_to_user ? `Assigned to: ${task.assigned_to_user.email}` : 'Unassigned'}
                </p>
              </div>
              <select
                className="select select-bordered select-sm"
                value={task.status}
                onChange={(e) => handleStatusChange(task.id, e.target.value)}
                disabled={!isAdmin && task.status === 'done'} // Example of role-based restriction
              >
                <option value="todo">To Do</option>
                <option value="in_progress">In Progress</option>
                <option value="done">Done</option>
              </select>
            </div>
          ))
        ) : (
          <p className="text-sm text-gray-500">No tasks for this project yet.</p>
        )}
      </div>
      <CreateTaskModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  );
};

export default TaskList; 