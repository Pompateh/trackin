import React, { useEffect, useState, useRef } from 'react';
import ReactDOM from 'react-dom';
import CreateTaskModal from './CreateTaskModal';
import { supabase } from '../../lib/supabaseClient';
import { HiChevronDown } from 'react-icons/hi';

const STATUS_OPTIONS = [
  { value: 'todo', label: 'To Do' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'done', label: 'Done' },
];

const TaskList = ({ projectId, sectionId, onSelectTask, selectedTask, tasks = [], setTasks, role, customStyle }) => {
  const [updatingTaskId, setUpdatingTaskId] = useState(null);
  const [dropdownOpenId, setDropdownOpenId] = useState(null);
  const dropdownButtonRefs = useRef({});
  const [dropdownPosition, setDropdownPosition] = useState({});

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

  useEffect(() => {
    if (dropdownOpenId !== null && dropdownButtonRefs.current[dropdownOpenId]) {
      const rect = dropdownButtonRefs.current[dropdownOpenId].getBoundingClientRect();
      setDropdownPosition({
        top: rect.bottom + window.scrollY,
        left: rect.left + window.scrollX,
        width: rect.width
      });
    }
  }, [dropdownOpenId]);

  return (
    <div>
      <div>
        {tasks.length > 0 ? (
          tasks.map((task, idx) => {
            const statusObj = STATUS_OPTIONS.find(opt => opt.value === task.status);
            const statusLabel = statusObj ? statusObj.label : task.status;
            const isDisabled = updatingTaskId === task.id || task.status === 'done';
            return (
            <div
              key={task.id}
              className={`flex items-stretch cursor-pointer${selectedTask?.id === task.id ? ' bg-gray-100' : ''}`}
              style={{ minHeight: '56px', borderTop: idx === 0 ? 'none' : '1px solid #000', width: '100%' }}
              onClick={() => onSelectTask && onSelectTask(task)}
            >
                {/* Task info (7/10) */}
                <div className="flex flex-col justify-center pl-4 py-2" style={{flexBasis: '70%', maxWidth: '70%', minWidth: '0'}}>
                  <span className="font-serif font-bold text-lg leading-tight">{task.title}</span>
                  <span className="text-xs italic text-gray-600 mt-1">{task.assigned_to_user && task.assigned_to_user.email ? `Assigned to: ${task.assigned_to_user.email}` : 'Unassigned'}</span>
                </div>
                {/* Status button (3/10) */}
                <div className="flex items-center border-l border-black" style={{flexBasis: '30%', maxWidth: '100%', minWidth: '110px', paddingLeft: '16px', marginLeft: 0, position: 'relative', overflow: 'visible'}}>
                  {canEditStatus ? (
                    <div className="relative w-full flex items-center" style={{overflow: 'visible'}}>
                      <button
                        ref={el => dropdownButtonRefs.current[task.id] = el}
                        className="flex items-center justify-between w-full border-0 bg-white text-left px-0 py-0 h-full font-sans text-base focus:outline-none"
                        style={{ borderRadius: 0, boxShadow: 'none', minHeight: '56px', width: '110px', maxWidth: '110px', paddingLeft: 0, marginLeft: 0 }}
                        disabled={isDisabled}
                        onClick={e => {
                          e.stopPropagation();
                          if (!isDisabled) setDropdownOpenId(dropdownOpenId === task.id ? null : task.id);
                        }}
                      >
                        <span className="truncate">{statusLabel}</span>
                        <HiChevronDown className="ml-2 text-lg" />
                      </button>
                      {dropdownOpenId === task.id && !isDisabled && ReactDOM.createPortal(
                        <div
                          className="absolute w-32 bg-white border border-black"
                          style={{
                            left: dropdownPosition.left,
                            top: dropdownPosition.top,
                            width: dropdownPosition.width,
                            position: 'absolute',
                            overflow: 'visible'
                          }}
                        >
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
                        </div>,
                        document.body
                      )}
                    </div>
                  ) : (
                    <span className="flex items-center w-full text-left border-0 bg-white cursor-default font-sans text-base justify-center" style={{ minHeight: '56px', width: '110px', maxWidth: '110px', paddingLeft: 0, marginLeft: 0 }}>
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