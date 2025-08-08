import React, { useState } from 'react';
import useProjectStore from '../../store/useProjectStore';
import Modal from '../ui/Modal';
import toast from 'react-hot-toast';

const CreateTaskModal = ({ isOpen, onClose, onAddTask }) => {
  const { members, addTask } = useProjectStore();
  const [title, setTitle] = useState('');
  const [assignedTo, setAssignedTo] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    // Simulate task creation (replace with real addTask logic as needed)
    const newTask = {
      id: Date.now(),
      title,
      assignedTo,
      assignee_email: members.find(m => m.user_id === assignedTo)?.email || null,
      status: 'To Do',
    };
    if (onAddTask) onAddTask(newTask);
    setIsSubmitting(false);
    setTitle('');
    setAssignedTo('');
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <h3 className="font-bold text-lg mb-4" style={{ fontFamily: 'Crimson Pro, serif' }}>Create New Task</h3>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-semibold mb-2" style={{ fontFamily: 'Crimson Pro, serif' }}>
            Task Title
          </label>
          <input
            type="text"
            placeholder="e.g., Design the new logo"
            className="w-full px-2 py-1 border border-black text-black bg-white font-crimson font-semibold"
            style={{ fontFamily: 'Crimson Pro, serif', borderRadius: '0' }}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </div>
        <div>
          <label className="block text-sm font-semibold mb-2" style={{ fontFamily: 'Crimson Pro, serif' }}>
            Assign To
          </label>
          <select
            className="w-full px-2 py-1 border border-black text-black bg-white font-crimson font-semibold"
            style={{ fontFamily: 'Crimson Pro, serif', borderRadius: '0' }}
            value={assignedTo}
            onChange={(e) => setAssignedTo(e.target.value)}
          >
            <option value="">Unassigned</option>
            {members.map((member) => (
              <option key={member.user_id} value={member.user_id}>
                {member.email}
              </option>
            ))}
          </select>
        </div>
        <div className="flex gap-2 justify-end">
          <button 
            type="button" 
            className="px-4 py-2 text-black bg-white border border-black font-crimson font-semibold"
            style={{ fontFamily: 'Crimson Pro, serif', borderRadius: '0' }}
            onClick={onClose}
          >
            Cancel
          </button>
          <button 
            type="submit" 
            className="px-4 py-2 text-black bg-white border border-black font-crimson font-semibold"
            style={{ fontFamily: 'Crimson Pro, serif', borderRadius: '0' }}
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Creating...' : 'Create Task'}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default CreateTaskModal; 