import React, { useState } from 'react';
import { supabase } from '../../lib/supabaseClient';
import useAuthStore from '../../store/useAuthStore';
import toast from 'react-hot-toast';
import Modal from '../ui/Modal';

const CreateProjectModal = ({ isOpen, onClose, onProjectCreated }) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [deadline, setDeadline] = useState('');
  const [qAndA, setQAndA] = useState('');
  const [debrief, setDebrief] = useState('');
  const [direction, setDirection] = useState('');
  const [revision, setRevision] = useState('');
  const [delivery, setDelivery] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user } = useAuthStore();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const { data, error } = await supabase
        .from('projects')
        .insert({
          name,
          description,
          deadline: deadline || null,
          q_and_a: qAndA,
          debrief,
          direction,
          revision,
          delivery,
          created_by: user.id,
        })
        .select();

      if (error) throw error;

      toast.success(`Project "${name}" created successfully!`);
      onProjectCreated();
      onClose();
      // Reset form
      setName('');
      setDescription('');
      setDeadline('');
      setQAndA('');
      setDebrief('');
      setDirection('');
      setRevision('');
      setDelivery('');

    } catch (error) {
      toast.error(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <h3 className="font-bold text-lg">Create a New Project</h3>
      <form onSubmit={handleSubmit} className="py-4 space-y-4">
        <div className="form-control">
          <label className="label">
            <span className="label-text">Project Name</span>
          </label>
          <input
            type="text"
            placeholder="e.g., Q1 Marketing Campaign"
            className="input input-bordered w-full"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>
        <div className="form-control">
          <label className="label">
            <span className="label-text">Description</span>
          </label>
          <textarea
            className="textarea textarea-bordered h-24"
            placeholder="A brief summary of the project."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          ></textarea>
        </div>
        <div className="form-control">
          <label className="label">
            <span className="label-text">Deadline</span>
          </label>
          <input
            type="date"
            className="input input-bordered w-full"
            value={deadline}
            onChange={(e) => setDeadline(e.target.value)}
          />
        </div>
        {/* Additional fields */}
        <div className="form-control">
          <label className="label">
            <span className="label-text">Q&A for Viewer</span>
          </label>
          <input type="text" className="input input-bordered w-full" value={qAndA} onChange={(e) => setQAndA(e.target.value)} />
        </div>
        <div className="form-control">
          <label className="label">
            <span className="label-text">Debrief</span>
          </label>
          <input type="text" className="input input-bordered w-full" value={debrief} onChange={(e) => setDebrief(e.target.value)} />
        </div>
        <div className="form-control">
          <label className="label">
            <span className="label-text">Direction</span>
          </label>
          <input type="text" className="input input-bordered w-full" value={direction} onChange={(e) => setDirection(e.target.value)} />
        </div>
        <div className="form-control">
          <label className="label">
            <span className="label-text">Revision</span>
          </label>
          <input type="text" className="input input-bordered w-full" value={revision} onChange={(e) => setRevision(e.target.value)} />
        </div>
        <div className="form-control">
          <label className="label">
            <span className="label-text">Delivery</span>
          </label>
          <input type="text" className="input input-bordered w-full" value={delivery} onChange={(e) => setDelivery(e.target.value)} />
        </div>

        <div className="modal-action">
          <button type="button" className="btn" onClick={onClose}>
            Cancel
          </button>
          <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
            {isSubmitting ? <span className="loading loading-spinner"></span> : 'Create Project'}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default CreateProjectModal; 