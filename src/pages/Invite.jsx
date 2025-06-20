import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import toast from 'react-hot-toast';

const Invite = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('viewer');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInvite = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      // 1. Find user by email
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('id')
        .eq('email', email)
        .single();

      if (userError || !userData) {
        throw new Error('User with this email does not exist. Please ask them to sign up first.');
      }
      
      const userId = userData.id;

      // 2. Add user to project_members
      const { error: inviteError } = await supabase
        .from('project_members')
        .insert({
          project_id: projectId,
          user_id: userId,
          role: role,
        });
      
      if (inviteError) {
        if (inviteError.code === '23505') { // unique constraint violation
          throw new Error('User is already a member of this project.');
        }
        throw inviteError;
      }

      toast.success(`User ${email} invited as ${role}.`);
      navigate(`/project/${projectId}`);

    } catch (error) {
      toast.error(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-md mx-auto card bg-base-100 shadow-xl">
        <div className="card-body">
            <h2 className="card-title">Invite a User</h2>
            <p>Invite a new member to your project. The user must have an existing account.</p>
            <form onSubmit={handleInvite} className="space-y-4">
                <div className="form-control">
                    <label className="label">
                        <span className="label-text">User Email</span>
                    </label>
                    <input
                        type="email"
                        placeholder="user@example.com"
                        className="input input-bordered w-full"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                </div>
                <div className="form-control">
                    <label className="label">
                        <span className="label-text">Role</span>
                    </label>
                    <select 
                        className="select select-bordered w-full"
                        value={role}
                        onChange={(e) => setRole(e.target.value)}
                    >
                        <option value="viewer">Viewer</option>
                        <option value="member">Member</option>
                        <option value="admin">Admin</option>
                    </select>
                </div>
                <div className="card-actions justify-end">
                    <button type="button" className="btn" onClick={() => navigate(`/project/${projectId}`)}>
                        Cancel
                    </button>
                    <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
                        {isSubmitting ? <span className="loading loading-spinner"></span> : 'Send Invite'}
                    </button>
                </div>
            </form>
        </div>
    </div>
  );
};

export default Invite; 