import React, { useEffect, useState, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import useProjectStore from '../store/useProjectStore';
import useAuthStore from '../store/useAuthStore';
// import TldrawCanvas from '../components/board/TldrawCanvas';
import TaskList from '../components/tasks/TaskList';
import CommentSection from '../components/comments/CommentSection';
import SectionList from '../components/projects/SectionList';
import RecapList from '../components/projects/RecapList';
import ProjectSidebar from '../components/projects/ProjectSidebar';
import PrintableProject from '../components/projects/PrintableProject';
import DownloadPDFButton from '../components/projects/DownloadPDFButton';
import { supabase } from '../lib/supabaseClient';
// Placeholder for new components
// import RecapList from '../components/projects/RecapList';

const DEFAULT_SECTIONS = [
  { id: 1, title: 'Brief', status: 'To Do', parent_section_id: null },
  { id: 2, title: 'Q & A', status: 'To Do', parent_section_id: null },
  { id: 3, title: 'Debrief', status: 'To Do', parent_section_id: null },
  { id: 4, title: 'Quotation', status: 'To Do', parent_section_id: null },
  { id: 5, title: 'Contract', status: 'To Do', parent_section_id: 9 },
  { id: 6, title: 'Brand Strategy', status: 'To Do', parent_section_id: null },
  { id: 7, title: 'Planner', status: 'To Do', parent_section_id: null },
  { id: 8, title: 'Brand Story', status: 'To Do', parent_section_id: null },
  { id: 9, title: 'Moodboard', status: 'To Do', parent_section_id: null },
  { id: 10, title: 'Concept & Direction', status: 'To Do', parent_section_id: null },
  { id: 11, title: 'Logo', status: 'To Do', parent_section_id: 9 },
  { id: 12, title: 'Typography', status: 'To Do', parent_section_id: 9 },
  { id: 13, title: 'Colour', status: 'To Do', parent_section_id: 9 },
  { id: 14, title: 'Illustration', status: 'To Do', parent_section_id: 9 },
  { id: 15, title: 'Icon', status: 'To Do', parent_section_id: 9 },
  { id: 16, title: 'Pattern', status: 'To Do', parent_section_id: 9 },
  { id: 17, title: 'Motion', status: 'To Do', parent_section_id: 9 },
  { id: 18, title: 'Photograph', status: 'To Do', parent_section_id: 9 },
  { id: 19, title: 'Packaging', status: 'To Do', parent_section_id: 9 },
  { id: 20, title: 'Guideline Book', status: 'To Do', parent_section_id: 9 },
  { id: 21, title: 'P.0.S.M', status: 'To Do', parent_section_id: 9 },
  { id: 22, title: 'Social Template', status: 'To Do', parent_section_id: 9 },
  { id: 23, title: 'Layout', status: 'To Do', parent_section_id: 9 },
  { id: 24, title: 'Delivery', status: 'To Do', parent_section_id: null },
];

const Project = () => {
  const { projectId } = useParams();
  const { user } = useAuthStore();
  const { project, role, loading, fetchProjectData } = useProjectStore();
  // State for selected section/task for NOTE panel
  const [selectedSection, setSelectedSection] = useState(null);
  const [selectedTask, setSelectedTask] = useState(null);
  const [isSidebarVisible, setIsSidebarVisible] = useState(true);
  const [gridItems, setGridItems] = useState([]);
  const printableRef = useRef();
  const hiddenPdfRef = useRef();

  useEffect(() => {
    if (projectId && user) {
      fetchProjectData(projectId, user.id);
    }
  }, [projectId, user, fetchProjectData]);

  useEffect(() => {
    const fetchGridItems = async () => {
      if (!projectId) return;
      const { data, error } = await supabase
        .from('grid_items')
        .select('*')
        .eq('project_id', projectId);
      
      console.log('GridItems fetch result:', { data, error, count: data?.length });
      
      if (!error) setGridItems(data || []);
    };
    fetchGridItems();
  }, [projectId]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-full">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="text-center">
        <h2 className="text-2xl font-bold">Project not found or you don't have access.</h2>
        <Link to="/" className="btn btn-primary mt-4">Back to Dashboard</Link>
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100vh-120px)]">
      {/* Main content */}
      <div className={`flex-grow p-4 h-full transition-all duration-300 ${isSidebarVisible ? 'w-3/4' : 'w-full'}`}>
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-4xl font-serif">INDEX</h1>
          <div className="flex gap-2 items-center">
            <DownloadPDFButton printableRef={hiddenPdfRef} />
            <button 
              className="btn btn-secondary"
              onClick={() => setIsSidebarVisible(!isSidebarVisible)}
            >
              {isSidebarVisible ? 'Hide Panel' : 'Show Panel'}
            </button>
          </div>
        </div>
        <SectionList 
          projectId={projectId} 
          onSelectSection={setSelectedSection} 
          selectedSection={selectedSection} 
          isAdmin={role === 'admin'} 
        />
        {/* On-screen preview (can keep debug info and border) */}
        <div style={{ background: '#fff', border: '2px solid red', padding: '16px', margin: '16px 0' }}>
          <div ref={printableRef}>
            {/* Debug info and on-screen PrintableProject */}
            <div style={{ color: 'blue', fontSize: '12px', marginBottom: '10px' }}>
              Debug: Sections: {DEFAULT_SECTIONS.length}, GridItems: {gridItems.length}, 
              Project: {project?.name || 'No project'}, 
              GridItems with content: {gridItems.filter(item => item.section_id_text).length}
            </div>
            <PrintableProject project={project} sections={DEFAULT_SECTIONS} gridItems={gridItems} />
          </div>
        </div>
        {/* HIDDEN PDF EXPORT CONTAINER - clean, no debug, no border */}
        <div style={{
          position: 'absolute',
          left: '-9999px',
          top: 0,
          width: '210mm',
          background: '#fff',
          zIndex: -1,
          pointerEvents: 'none'
        }}>
          <div ref={hiddenPdfRef}>
            <PrintableProject
              project={project}
              sections={DEFAULT_SECTIONS}
              gridItems={gridItems}
              pdfMode={true}
            />
          </div>
        </div>
      </div>

      {/* Sidebar */}
      {isSidebarVisible && (
        <div className="w-1/4 h-full border-l border-base-300">
          <ProjectSidebar projectId={projectId} />
        </div>
      )}
    </div>
  );
};

export default Project; 