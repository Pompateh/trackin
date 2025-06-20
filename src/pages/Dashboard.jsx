import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import useAuthStore from '../store/useAuthStore';
import toast from 'react-hot-toast';
import ProjectList from '../components/projects/ProjectList';
import CreateProjectModal from '../components/projects/CreateProjectModal';

const Dashboard = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { user } = useAuthStore();

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase.rpc('get_projects_for_user', {
        user_id_param: user.id,
      });

      if (error) throw error;
      setProjects(data);
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchProjects();
    }
  }, [user]);

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Your Projects</h1>
        <button className="btn btn-primary" onClick={() => setIsModalOpen(true)}>
          Create Project
        </button>
      </div>
      {loading ? (
        <div className="text-center">
          <span className="loading loading-lg"></span>
        </div>
      ) : (
        <ProjectList projects={projects} />
      )}
      <CreateProjectModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onProjectCreated={fetchProjects}
      />
    </div>
  );
};

export default Dashboard; 