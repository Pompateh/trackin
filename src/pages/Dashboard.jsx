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
      
      // Try the RPC function first
      const { data, error } = await supabase.rpc('get_projects_for_user', {
        user_id_param: user.id,
      });

      if (error) {
        console.error('RPC function failed, trying direct query:', error);
        
        // Fallback: direct query to projects table
        const { data: fallbackData, error: fallbackError } = await supabase
          .from('projects')
          .select(`
            id,
            name,
            notes,
            status,
            template_type,
            created_at,
            deadline
          `)
          .order('created_at', { ascending: false });

        if (fallbackError) throw fallbackError;
        
        // Add empty team_emails for compatibility, but keep deadline
        const projectsWithTeams = fallbackData.map(project => ({
          ...project,
          team_emails: []
        }));
        
        setProjects(projectsWithTeams);
      } else {
        console.log('Projects data received:', data);
        console.log('First project team_emails:', data[0]?.team_emails);
        setProjects(data);
      }
    } catch (error) {
      console.error('Error fetching projects:', error);
      toast.error('Failed to load projects');
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
    <div className="w-full mx-0 max-w-none" style={{height: '100vh', display: 'flex', flexDirection: 'column'}}>
      {/* Fixed header section */}
      <div className="flex-shrink-0">
        <div className="w-full h-5 border-b border-t border-black flex items-end mb-6" style={{backgroundImage: 'repeating-linear-gradient(to right, transparent, transparent 39px, #222 39px, #222 40px)'}}></div>
        <div className="flex justify-between items-center mb-8 border-b border-gray-200 pb-4">
          <h1 className="text-6xl font-serif font-normal tracking-tight pl-2">YOUR WORK</h1>
          {canCreateProjects && (
            <button 
              className="pl-2 pr-2 focus:outline-none"
              style={{ background: 'none', border: 'none', boxShadow: 'none', lineHeight: 1, display: 'flex', alignItems: 'center' }}
              onClick={() => setIsModalOpen(true)}
              aria-label="Create Project"
            >
              <svg width="64" height="64" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
                <line x1="32" y1="8" x2="32" y2="56" stroke="#222" strokeWidth="2"/>
                <line x1="8" y1="32" x2="56" y2="32" stroke="#222" strokeWidth="2"/>
              </svg>
            </button>
          )}
        </div>
      </div>
      
      {/* Scrollable content section */}
      <div className="flex-1 overflow-auto scrollbar-hide">
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
          </div>
        ) : (
          <ProjectList projects={projects} />
        )}
      </div>
      
      <CreateProjectModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onProjectCreated={fetchProjects}
      />
    </div>
  );
};

export default Dashboard; 