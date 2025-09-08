import React, { useEffect, useState, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
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
import Modal from '../components/ui/Modal';
import { HiOutlineChevronRight, HiOutlineMenu, HiOutlineX } from 'react-icons/hi';
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
  const [showPrintable, setShowPrintable] = useState(false);
  const navigate = useNavigate();

  // Handle section selection
  const handleSectionSelect = (section) => {
    setSelectedSection(section);
  };

  useEffect(() => {
    if (projectId && user) {
      fetchProjectData(projectId, user.id);
    }
  }, [projectId, user, fetchProjectData]);

  // Auto-redirect P.O.D projects to the P.O.D template (only when the fetched project matches the current route and loading is done)
  useEffect(() => {
    if (loading) return;
    if (project && String(project.id) === String(projectId) && project.template_type === 'pod') {
      navigate(`/project/${projectId}/pod`, { replace: true });
    }
  }, [loading, project, projectId, navigate]);

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
    <div className="flex flex-col h-[calc(100vh-120px)] min-h-screen">
      {/* Back button and mobile menu toggle */}
      <div className="flex justify-between items-center p-4 border-b border-black bg-white">
        <button
          className="btn btn-outline btn-sm"
          onClick={() => navigate('/')}
        >
          ← Back
        </button>
        
        {/* Mobile menu toggle - only show on mobile */}
        <button
          className="md:hidden btn btn-ghost btn-sm"
          onClick={() => setIsSidebarVisible(!isSidebarVisible)}
        >
          {isSidebarVisible ? <HiOutlineX size={24} /> : <HiOutlineMenu size={24} />}
        </button>
      </div>

      <div className="flex flex-col lg:flex-row w-full h-full flex-1">
        {/* Left vertical divider - hidden on mobile, visible on desktop */}
        <div className="hidden lg:flex h-full w-5 border-r border-t border-l border-b border-black flex-col items-end mr-0" style={{backgroundImage: 'repeating-linear-gradient(to bottom, transparent, transparent 39px, #222 39px, #222 40px)'}}></div>
        
        {/* Conditional content based on project type */}
        {project?.template_type === 'pod' ? (
          /* P.O.D Project Layout - Auto-redirect, so this won't be shown */
          <div className={`${isSidebarVisible ? 'lg:w-2/3 w-full' : 'flex-1'} h-full border-t border-b border-black transition-all duration-300 flex items-center justify-center`}>
            <div className="text-center">
              <span className="loading loading-spinner loading-lg"></span>
              <p className="mt-4 text-gray-600">Redirecting to P.O.D template...</p>
            </div>
          </div>
        ) : (
          /* Branding Project Layout */
          <div className={`${isSidebarVisible ? 'lg:w-2/3 w-full' : 'flex-1'} h-full border-t border-b border-black transition-all duration-300 flex flex-col`}>
            <div className="flex flex-col sm:flex-row justify-between items-center mb-4 px-2 py-4 gap-4 sm:gap-0">
              <h1 className="font-serif font-extralight text-3xl sm:text-4xl md:text-6xl lg:text-7xl xl:text-8xl text-center sm:text-left" style={{ fontFamily: 'Crimson Pro, serif', fontWeight: 250, lineHeight: '1.1' }}>INDEX</h1>
            </div>
            
            {/* Show sections */}
            <div className="flex-1 overflow-auto">
              <div className="h-full flex flex-col">
                <div className="flex-1">
                  <SectionList 
                    projectId={projectId} 
                    onSelectSection={handleSectionSelect} 
                    selectedSection={selectedSection} 
                    isAdmin={role === 'admin'} 
                  />
                </div>
              </div>
            </div>
            
            {/* PDF buttons */}
            <div className="flex flex-col sm:flex-row w-full">
              <DownloadPDFButton 
                printableRef={hiddenPdfRef} 
                className="custom-action-btn font-serif font-extralight text-sm sm:text-base md:text-xl lg:text-2xl border-b border-black rounded-none px-2 sm:px-0 py-4 sm:py-6 bg-white hover:bg-gray-100 transition w-full"
                style={{ fontFamily: 'Crimson Pro, serif', fontWeight: 250, minWidth: 0, borderLeft: 'none', borderTop: 'none', borderRadius: 0, borderRight: 'none', borderBottom: '1px solid #000' }} 
              />
            </div>
          </div>
        )}
        
        {/* Middle vertical divider - hidden on mobile, visible on desktop */}
        <div className="hidden lg:flex h-full w-5 border-r border-t border-l border-b border-black flex-col items-end mr-0" style={{backgroundImage: 'repeating-linear-gradient(to bottom, transparent, transparent 39px, #222 39px, #222 40px)'}}></div>
        
        {/* ProjectSidebar - responsive behavior */}
        {isSidebarVisible ? (
          <div className="lg:w-1/3 w-full h-full border-l-0 border-base-300 bg-white">
            <ProjectSidebar projectId={projectId} onToggleSidebar={() => setIsSidebarVisible(false)} role={role} projectName={project?.name} />
          </div>
        ) : (
          <div className="h-full flex flex-col justify-center items-center border-l border-black bg-white" style={{ width: '40px', cursor: 'pointer' }} onClick={() => setIsSidebarVisible(true)}>
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" style={{ fontWeight: 200, fontSize: '2.5rem', userSelect: 'none', display: 'block' }}>
              <path d="M15 18l-6-6 6-6" />
            </svg>
          </div>
        )}
      </div>
      
      {/* Printable Options Modal */}
      {/* Removed as per edit hint */}

      {/* Individual Steps Selection Modal for Preview */}
      {/* Removed as per edit hint */}

      {/* Concept & Direction Subsection Selection Modal for Preview */}
      {/* Removed as per edit hint */}

      {/* PrintableProject Modal */}
      {showPrintable && (
        <Modal isOpen={showPrintable} onClose={() => setShowPrintable(false)}>
          <div className="w-full h-full bg-white overflow-auto">
            <PrintableProject 
              project={project} 
              sections={DEFAULT_SECTIONS} 
              gridItems={gridItems}
              previewMode={'all'} // Assuming 'all' for now as printableMode is removed
              selectedSteps={[]} // No longer needed
              selectedConceptSubsections={[]} // No longer needed
            />
          </div>
        </Modal>
      )}
      
      {/* HIDDEN PDF EXPORT CONTAINER - clean, no debug, no border */}
      <div style={{
        position: 'absolute',
        left: '-9999px',
        top: 0,
        // Use responsive width instead of fixed 210mm to match template editor
        width: '100%',
        maxWidth: '800px', // Reasonable max width for PDF generation
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
  );
};

export default Project; 