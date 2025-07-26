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
import { HiOutlineChevronRight } from 'react-icons/hi';
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
    <div className="flex flex-col h-[calc(100vh-120px)]">
      {/* Back button at the top, header position */}
      <div className="p-4">
        <button
          className="btn btn-outline btn-sm"
          onClick={() => navigate('/')}
        >
          ← Back
        </button>
      </div>
      <div className="flex flex-col md:flex-row w-full h-full">
        {/* Left vertical divider */}
        <div className="hidden md:flex h-full w-5 border-r border-t border-l border-b bir border-black flex-col items-end mr-0" style={{backgroundImage: 'repeating-linear-gradient(to bottom, transparent, transparent 39px, #222 39px, #222 40px)'}}></div>
        {/* SectionList */}
        <div className={`${isSidebarVisible ? 'md:w-2/3 w-full' : 'flex-1'} h-full border-t border-b border-black transition-all duration-300`}>
          <div className="flex flex-col md:flex-row justify-between items-center mb-4 px-2 py-4 gap-4 md:gap-0">
            <h1 className="font-serif font-extralight text-4xl md:text-7xl lg:text-8xl" style={{ fontFamily: 'Crimson Pro, serif', fontWeight: 250, lineHeight: '1.1' }}>INDEX</h1>

          </div>
          <SectionList 
            projectId={projectId} 
            onSelectSection={setSelectedSection} 
            selectedSection={selectedSection} 
            isAdmin={role === 'admin'} 
          />
          <div className="flex w-full mb-2">
            <DownloadPDFButton 
              printableRef={hiddenPdfRef} 
              className="custom-action-btn font-serif font-extralight text-base md:text-2xl border-b border-r border-black rounded-none px-0 py-6 bg-white hover:bg-gray-100 transition"
              style={{ fontFamily: 'Crimson Pro, serif', fontWeight: 250, minWidth: 0, width: '50%', borderLeft: 'none', borderTop: 'none', borderRadius: 0, borderRight: '1px solid #000', borderBottom: '1px solid #000', padding: 0 }} 
            />
            <button 
              className="custom-action-btn font-serif font-extralight text-base md:text-2xl border-b border-black rounded-none px-0 py-6 bg-white hover:bg-gray-100 transition"
              style={{ fontFamily: 'Crimson Pro, serif', fontWeight: 250, minWidth: 0, width: '50%', borderLeft: 'none', borderTop: 'none', borderRadius: 0, borderRight: 'none', borderBottom: '1px solid #000', padding: 0 }}
              onClick={() => setShowPrintable(true)}
            >
              Show Printable Project
            </button>
          </div>
        </div>
        {/* Middle vertical divider */}
        <div className="hidden md:flex h-full w-5 border-r border-t border-l border-b bir border-black flex-col items-end mr-0" style={{backgroundImage: 'repeating-linear-gradient(to bottom, transparent, transparent 39px, #222 39px, #222 40px)'}}></div>
        {/* ProjectSidebar */}
        {isSidebarVisible ? (
          <div className="md:w-1/3 w-full h-full border-l-0 border-base-300">
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
      {/* PrintableProject Modal */}
      {showPrintable && (
        <Modal isOpen={showPrintable} onClose={() => setShowPrintable(false)}>
          <div className="w-full h-full bg-white overflow-auto">
            <PrintableProject project={project} sections={DEFAULT_SECTIONS} gridItems={gridItems} />
          </div>
        </Modal>
      )}
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
  );
};

export default Project; 