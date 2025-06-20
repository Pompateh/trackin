import React, { useState, useEffect } from 'react';
import useProjectStore from '../../store/useProjectStore';
import Modal from '../ui/Modal';
import { supabase } from '../../lib/supabaseClient';
import toast from 'react-hot-toast';

const CreateTaskModal = ({ isOpen, onClose }) => {
  const { project, addTask } = useProjectStore();
  const [title, setTitle] = useState('');
  const [assignedTo, setAssignedTo] = useState('');
  const [members, setMembers] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!isOpen || !project) return;

    const fetchMembers = async () => {
      const { data, error } = await supabase
        .from('project_members')
        .select('user_id, users(id, email)')
        .eq('project_id', project.id)
        .in('role', ['admin', 'member']);

      if (error) {
        toast.error('Failed to fetch project members');
      } else {
        setMembers(data);
      }
    };

    fetchMembers();
  }, [isOpen, project]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    await addTask(title, assignedTo || null);
    setIsSubmitting(false);
    setTitle('');
    setAssignedTo('');
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <h3 className="font-bold text-lg">Create New Task</h3>
      <form onSubmit={handleSubmit} className="py-4 space-y-4">
        <div className="form-control">
          <label className="label">
            <span className="label-text">Task Title</span>
          </label>
          <input
            type="text"
            placeholder="e.g., Design the new logo"
            className="input input-bordered w-full"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </div>
        <div className="form-control">
          <label className="label">
            <span className="label-text">Assign To</span>
          </label>
          <select
            className="select select-bordered w-full"
            value={assignedTo}
            onChange={(e) => setAssignedTo(e.target.value)}
          >
            <option value="">Unassigned</option>
            {members.map((member) => (
              <option key={member.user_id} value={member.user_id}>
                {member.users.email}
              </option>
            ))}
          </select>
        </div>
        <div className="modal-action">
          <button type="button" className="btn" onClick={onClose}>
            Cancel
          </button>
          <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
            {isSubmitting ? <span className="loading loading-spinner"></span> : 'Create Task'}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default CreateTaskModal; 