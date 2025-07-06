import React, { useEffect, useState } from 'react';
import CreateTaskModal from './CreateTaskModal';
import { supabase } from '../../lib/supabaseClient';
import { HiChevronDown } from 'react-icons/hi';

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
                className={`flex items-stretch cursor-pointer border-b border-black last:border-b-0` + (selectedTask?.id === task.id ? ' bg-gray-100' : '')}
                style={{ minHeight: '56px' }}
                onClick={() => onSelectTask && onSelectTask(task)}
            >
                {/* Task info (7/10) */}
                <div className="flex-1 basis-7/10 flex flex-col justify-center pl-2 py-2">
                  <span className="font-serif font-bold text-lg leading-tight">{task.title}</span>
                  <span className="text-xs italic text-gray-600 mt-1">{task.assigned_to_user && task.assigned_to_user.email ? `Assigned to: ${task.assigned_to_user.email}` : 'Unassigned'}</span>
                </div>
                {/* Divider */}
                <div className="h-auto w-px bg-black self-stretch" />
                {/* Status button (3/10) */}
                <div className="flex-none basis-3/10 flex items-center justify-center px-4" style={{ minWidth: '110px', maxWidth: '110px' }}>
                  {canEditStatus ? (
                    <div className="relative w-full flex items-center justify-center">
                      <button
                        className="flex items-center justify-between w-full border-0 bg-white text-left px-0 py-0 h-full font-sans text-base focus:outline-none"
                        style={{ borderRadius: 0, boxShadow: 'none', minHeight: '56px', width: '110px', maxWidth: '110px' }}
                        disabled={isDisabled}
                        onClick={e => {
                          e.stopPropagation();
                          if (!isDisabled) setDropdownOpenId(dropdownOpenId === task.id ? null : task.id);
                        }}
                      >
                        <span className="truncate">{statusLabel}</span>
                        <HiChevronDown className="ml-2 text-lg" />
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
                    <span className="flex items-center w-full text-left border-0 bg-white cursor-default font-sans text-base justify-center" style={{ minHeight: '56px', width: '110px', maxWidth: '110px' }}>
                      <span className="truncate">{statusLabel}</span>
                      <HiChevronDown className="ml-2 text-lg text-gray-400" />
                    </span>
                  )}
                </div>
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