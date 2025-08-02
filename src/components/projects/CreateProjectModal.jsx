import React, { useState } from 'react';
import { supabase } from '../../lib/supabaseClient';
import useAuthStore from '../../store/useAuthStore';
import toast from 'react-hot-toast';
import Modal from '../ui/Modal';

const statusOptions = [
  { value: 'on_going', label: 'On Going' },
  { value: 'onhold', label: 'On Hold' },
  { value: 'complete', label: 'Complete' },
];

const templateOptions = [
  { value: 'branding', label: 'Branding', description: 'Comprehensive branding materials including logos, typography, colors, and visual guidelines.' },
  { value: 'pod', label: 'Print on Demand (P.O.D)', description: 'Print on demand design workflow with reference images, design uploads, and final design tracking.' },
];

const CreateProjectModal = ({ isOpen, onClose, onProjectCreated }) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [deadline, setDeadline] = useState('');
  const [status, setStatus] = useState('on_going');
  const [templateType, setTemplateType] = useState('branding');
  const [teamMembers, setTeamMembers] = useState(['']);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user } = useAuthStore();

  const handleTeamMemberChange = (idx, value) => {
    const updated = [...teamMembers];
    updated[idx] = value;
    setTeamMembers(updated);
  };

  const addTeamMemberField = () => {
    setTeamMembers([...teamMembers, '']);
  };

  const removeTeamMemberField = (idx) => {
    setTeamMembers(teamMembers.filter((_, i) => i !== idx));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      // Filter out empty emails and the creator's own email
      const emails = teamMembers
        .map((email) => email.trim().toLowerCase())
        .filter((email) => email && email !== user.email);
      

      
      const { error } = await supabase.rpc('create_new_project', {
        name,
        description,
        deadline: deadline || null,
        q_and_a: null,
        debrief: null,
        direction: null,
        revision: null,
        delivery: null,
        status,
        template_type: templateType,
        team_member_emails: emails,
      });
      if (error) throw error;
      toast.success(`Project "${name}" created successfully!`);
      onProjectCreated();
      onClose();
      setName('');
      setDescription('');
      setDeadline('');
      setStatus('on_going');
      setTemplateType('branding');
      setTeamMembers(['']);
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
            <span className="label-text">Project Title</span>
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
        
        {/* Template Type Selection */}
        <div className="form-control">
          <label className="label">
            <span className="label-text">Template Type</span>
          </label>
          <div className="grid grid-cols-1 gap-3">
            {templateOptions.map((option) => (
              <div
                key={option.value}
                className={`border-2 p-3 rounded-lg cursor-pointer transition-colors ${
                  templateType === option.value
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-300 hover:border-gray-400'
                }`}
                onClick={() => setTemplateType(option.value)}
              >
                <div className="flex items-start gap-3">
                  <input
                    type="radio"
                    name="templateType"
                    value={option.value}
                    checked={templateType === option.value}
                    onChange={() => setTemplateType(option.value)}
                    className="mt-1"
                  />
                  <div className="flex-1">
                    <h4 className="font-semibold text-sm">{option.label}</h4>
                    <p className="text-xs text-gray-600 mt-1">{option.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="form-control">
          <label className="label">
            <span className="label-text">Project Status</span>
          </label>
          <select
            className="select select-bordered w-full"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            required
          >
            {statusOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
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
        <div className="form-control">
          <label className="label">
            <span className="label-text">Team Members (emails)</span>
          </label>
          {teamMembers.map((email, idx) => (
            <div key={idx} className="flex items-center gap-2 mb-2">
              <input
                type="email"
                className="input input-bordered w-full"
                placeholder="user@example.com"
                value={email}
                onChange={(e) => handleTeamMemberChange(idx, e.target.value)}
              />
              {teamMembers.length > 1 && (
                <button
                  type="button"
                  className="btn btn-square btn-sm btn-error"
                  onClick={() => removeTeamMemberField(idx)}
                >
                  ×
                </button>
              )}
            </div>
          ))}
          <button
            type="button"
            className="btn btn-outline btn-sm"
            onClick={addTeamMemberField}
          >
            + Add Team Member
          </button>
        </div>
        <div className="modal-action">
          <button
            type="button"
            className="btn"
            onClick={onClose}
            disabled={isSubmitting}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="btn btn-primary"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <span className="loading loading-spinner loading-sm"></span>
                Creating...
              </>
            ) : (
              'Create Project'
            )}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default CreateProjectModal; 