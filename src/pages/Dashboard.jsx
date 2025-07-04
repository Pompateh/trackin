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

  const canCreateProjects = user?.user_metadata?.can_create_projects === true;

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
    <div className="w-full mx-0 max-w-none">
      <div className="w-full h-5 border-b border-t border-black flex items-end mb-6" style={{backgroundImage: 'repeating-linear-gradient(to right, transparent, transparent 39px, #222 39px, #222 40px)'}}></div>
      <div className="flex justify-between items-center mb-8 border-b border-gray-200 pb-4">
        <h1 className="text-6xl font-serif font-normal tracking-tight pl-2">YOUR WORK</h1>
        {canCreateProjects && (
          <button 
            className="px-2 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
            onClick={() => setIsModalOpen(true)}
          >
            Create Project
          </button>
        )}
      </div>
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
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