import React, { useEffect, useState } from 'react';
import CreateTaskModal from './CreateTaskModal';
import { supabase } from '../../lib/supabaseClient';

const STATUS_OPTIONS = [
  { value: 'todo', label: 'To Do' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'done', label: 'Done' },
];

const TaskList = ({ projectId, sectionId, onSelectTask, selectedTask, tasks = [], setTasks, role }) => {
  const [updatingTaskId, setUpdatingTaskId] = useState(null);
  const [dropdownOpenId, setDropdownOpenId] = useState(null);

  const canEditStatus = role === 'admin' || role === 'member';

  const handleStatusChange = async (task, newStatus) => {
    setUpdatingTaskId(task.id);
    const { data, error } = await supabase
      .from('tasks')
      .update({ status: newStatus })
      .eq('id', task.id)
      .select('*, assigned_to_user:users(email)')
      .single();
    if (!error && data) {
      setTasks((prev) => prev.map((t) => (t.id === task.id ? { ...t, ...data } : t)));
    }
    setUpdatingTaskId(null);
    setDropdownOpenId(null);
  };

  return (
    <div>
      <div className="max-h-64 overflow-y-auto divide-y divide-black border-b border-black">
        {tasks.length > 0 ? (
          tasks.map((task) => {
            const statusObj = STATUS_OPTIONS.find(opt => opt.value === task.status);
            const statusLabel = statusObj ? statusObj.label : task.status;
            const isDisabled = updatingTaskId === task.id || task.status === 'done';
            return (
              <div
                key={task.id}
                className={`p-2 flex justify-between items-center cursor-pointer ${selectedTask?.id === task.id ? 'bg-gray-100' : ''}`}
                onClick={() => onSelectTask && onSelectTask(task)}
              >
                <div>
                  <p className="font-semibold">{task.title}</p>
                  <p className="text-xs italic text-gray-600">
                    {task.assigned_to_user && task.assigned_to_user.email
                      ? `Assigned to: ${task.assigned_to_user.email}`
                      : 'Unassigned'}
                  </p>
                </div>
                {canEditStatus ? (
                  <div className="relative">
                    <button
                      className="border border-black px-2 py-1 text-sm bg-white"
                      disabled={isDisabled}
                      onClick={e => {
                        e.stopPropagation();
                        if (!isDisabled) setDropdownOpenId(dropdownOpenId === task.id ? null : task.id);
                      }}
                    >
                      {statusLabel}
                    </button>
                    {dropdownOpenId === task.id && !isDisabled && (
                      <div className="absolute right-0 mt-1 w-32 bg-white border border-black z-10">
                        {STATUS_OPTIONS.map(opt => (
                          <button
                            key={opt.value}
                            className={`block w-full text-left px-3 py-2 hover:bg-gray-100 ${opt.value === task.status ? 'font-bold' : ''}`}
                            onClick={e => {
                              e.stopPropagation();
                              handleStatusChange(task, opt.value);
                            }}
                            disabled={isDisabled}
                          >
                            {opt.label}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <span className="border border-black px-2 py-1 text-sm bg-gray-100 cursor-default">{statusLabel}</span>
                )}
              </div>
            );
          })
        ) : (
          <p className="text-sm text-gray-500 p-2">No tasks for this section yet.</p>
        )}
      </div>
      {/* Modal is now handled by parent */}
    </div>
  );
};

export default TaskList; 