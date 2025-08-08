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
      <h3 className="font-bold text-lg mb-4" style={{ fontFamily: 'Crimson Pro, serif' }}>Create a New Project</h3>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-semibold mb-2" style={{ fontFamily: 'Crimson Pro, serif' }}>
            Project Title
          </label>
          <input
            type="text"
            placeholder="e.g., Q1 Marketing Campaign"
            className="w-full px-2 py-1 border border-black text-black bg-white font-crimson font-semibold"
            style={{ fontFamily: 'Crimson Pro, serif', borderRadius: '0' }}
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>
        <div>
          <label className="block text-sm font-semibold mb-2" style={{ fontFamily: 'Crimson Pro, serif' }}>
            Description
          </label>
          <textarea
            className="w-full px-2 py-1 border border-black text-black bg-white font-crimson font-semibold h-24"
            style={{ fontFamily: 'Crimson Pro, serif', borderRadius: '0' }}
            placeholder="A brief summary of the project."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          ></textarea>
        </div>
        
        {/* Template Type Selection */}
        <div>
          <label className="block text-sm font-semibold mb-2" style={{ fontFamily: 'Crimson Pro, serif' }}>
            Template Type
          </label>
          <div className="space-y-3">
            {templateOptions.map((option) => (
              <div
                key={option.value}
                className={`border-2 p-3 cursor-pointer transition-colors ${
                  templateType === option.value
                    ? 'border-black bg-gray-50'
                    : 'border-black hover:bg-gray-50'
                }`}
                style={{ borderRadius: '0' }}
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
                    <h4 className="font-semibold text-sm" style={{ fontFamily: 'Crimson Pro, serif' }}>{option.label}</h4>
                    <p className="text-xs text-gray-600 mt-1" style={{ fontFamily: 'Crimson Pro, serif' }}>{option.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold mb-2" style={{ fontFamily: 'Crimson Pro, serif' }}>
            Project Status
          </label>
          <select
            className="w-full px-2 py-1 border border-black text-black bg-white font-crimson font-semibold"
            style={{ fontFamily: 'Crimson Pro, serif', borderRadius: '0' }}
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            required
          >
            {statusOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-semibold mb-2" style={{ fontFamily: 'Crimson Pro, serif' }}>
            Deadline
          </label>
          <input
            type="date"
            className="w-full px-2 py-1 border border-black text-black bg-white font-crimson font-semibold"
            style={{ fontFamily: 'Crimson Pro, serif', borderRadius: '0' }}
            value={deadline}
            onChange={(e) => setDeadline(e.target.value)}
          />
        </div>
        <div>
          <label className="block text-sm font-semibold mb-2" style={{ fontFamily: 'Crimson Pro, serif' }}>
            Team Members (emails)
          </label>
          {teamMembers.map((email, idx) => (
            <div key={idx} className="flex items-center gap-2 mb-2">
              <input
                type="email"
                className="w-full px-2 py-1 border border-black text-black bg-white font-crimson font-semibold"
                style={{ fontFamily: 'Crimson Pro, serif', borderRadius: '0' }}
                placeholder="user@example.com"
                value={email}
                onChange={(e) => handleTeamMemberChange(idx, e.target.value)}
              />
              {teamMembers.length > 1 && (
                <button
                  type="button"
                  className="px-2 py-1 text-red-500 bg-white border border-red-500 font-crimson font-semibold"
                  style={{ fontFamily: 'Crimson Pro, serif', borderRadius: '0' }}
                  onClick={() => removeTeamMemberField(idx)}
                >
                  ×
                </button>
              )}
            </div>
          ))}
          <button
            type="button"
            className="px-4 py-2 text-black bg-white border border-black font-crimson font-semibold"
            style={{ fontFamily: 'Crimson Pro, serif', borderRadius: '0' }}
            onClick={addTeamMemberField}
          >
            + Add Team Member
          </button>
        </div>
        <div className="flex gap-2 justify-end">
          <button
            type="button"
            className="px-4 py-2 text-black bg-white border border-black font-crimson font-semibold"
            style={{ fontFamily: 'Crimson Pro, serif', borderRadius: '0' }}
            onClick={onClose}
            disabled={isSubmitting}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 text-black bg-white border border-black font-crimson font-semibold"
            style={{ fontFamily: 'Crimson Pro, serif', borderRadius: '0' }}
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Creating...' : 'Create Project'}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default CreateProjectModal; 