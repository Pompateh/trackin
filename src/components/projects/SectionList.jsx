import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
// import { supabase } from '../../lib/supabaseClient';

const DEFAULT_STEPS = [
  'Brief',
  'Q & A',
  'Debrief',
  'Quotation',
  'Contract',
  'Brand Strategy',
  'Planner',
  'Brand Story',
  'Moodboard',
  'Concept & Direction',
  'Delivery',
];

const SectionList = ({ projectId, onSelectSection, selectedSection, isAdmin }) => {
  const [sections, setSections] = useState([]);
  const [expanded, setExpanded] = useState({});
  const [removedSteps, setRemovedSteps] = useState([]);
  const [conceptPage, setConceptPage] = useState(0);
  const ITEMS_PER_PAGE = 5;

  const sectionPercentages = {
    'Q & A': '10%',
    'Contract': '10%',
    'Brand Story': '10%',
    'Moodboard': '20%',
    'Concept & Direction': '50%',
  };

  useEffect(() => {
    // TODO: Replace with Supabase fetch
    // supabase.from('sections').select('*').eq('project_id', projectId)
    //   .then(({ data }) => setSections(data));
    setSections([
      { id: 1, title: 'Brief', status: 'To Do', parent_section_id: null },
      { id: 2, title: 'Q & A', status: 'To Do', parent_section_id: null },
      { id: 3, title: 'Debrief', status: 'To Do', parent_section_id: null },
      { id: 4, title: 'Quotation', status: 'To Do', parent_section_id: null },
      { id: 5, title: 'Contract', status: 'To Do', parent_section_id: null },
      { id: 6, title: 'Brand Strategy', status: 'To Do', parent_section_id: null },
      { id: 7, title: 'Planner', status: 'To Do', parent_section_id: null },
      { id: 8, title: 'Brand Story', status: 'To Do', parent_section_id: null },
      { id: 9, title: 'Moodboard', status: 'To Do', parent_section_id: null },
      { id: 10, title: 'Concept & Direction', status: 'To Do', parent_section_id: null },
      { id: 11, title: 'Logo', status: 'To Do', parent_section_id: 10 },
      { id: 12, title: 'Typography', status: 'To Do', parent_section_id: 10 },
      { id: 13, title: 'Colour', status: 'To Do', parent_section_id: 10 },
      { id: 14, title: 'Illustration', status: 'To Do', parent_section_id: 10 },
      { id: 15, title: 'Icon', status: 'To Do', parent_section_id: 10 },
      { id: 16, title: 'Pattern', status: 'To Do', parent_section_id: 10 },
      { id: 17, title: 'Motion', status: 'To Do', parent_section_id: 10 },
      { id: 18, title: 'Photograph', status: 'To Do', parent_section_id: 10 },
      { id: 19, title: 'Packaging', status: 'To Do', parent_section_id: 10 },
      { id: 20, title: 'Guideline Book', status: 'To Do', parent_section_id: 10 },
      { id: 21, title: 'P.0.S.M', status: 'To Do', parent_section_id: 10 },
      { id: 22, title: 'Social Template', status: 'To Do', parent_section_id: 10 },
      { id: 23, title: 'Layout', status: 'To Do', parent_section_id: 1010 },
      { id: 24, title: 'Delivery', status: 'To Do', parent_section_id: null },
    ]);
  }, [projectId]);

  // Organize sections into tree
  const rootSections = sections.filter(s => !s.parent_section_id && !removedSteps.includes(s.title));
  const getSubsections = (parentId) => sections.filter(s => s.parent_section_id === parentId);

  const handleExpand = (id) => setExpanded(e => ({ ...e, [id]: !e[id] }));

  const handleRemoveStep = (title) => {
    setRemovedSteps([...removedSteps, title]);
  };

  const handleReAddStep = (title) => {
    setRemovedSteps(removedSteps.filter(t => t !== title));
  };

  // Find which default steps are currently removed
  const removedDefaultSteps = DEFAULT_STEPS.filter(
    step => removedSteps.includes(step)
  );

  const renderSection = (section, isSubsection = false, idx = 0) => {
    const hasSubsections = getSubsections(section.id).length > 0 && !isSubsection;
    const isExpanded = expanded[section.id];
    
    const sectionSlug = section.title.toLowerCase().replace(/ & /g, '-').replace(/ /g, '-');
    
    // For dropdown items, remove border, remove todo, and make clickable
    if (isSubsection) {
      return (
        <Link
          key={section.id}
          to={`/project/${projectId}/step/${sectionSlug}`}
          className="flex-1 min-w-[120px] max-w-[180px] px-3 py-2 cursor-pointer font-gothic font-medium text-[20px] text-black text-center"
          onClick={() => onSelectSection(section)}
        >
          {section.title}
        </Link>
      );
    }
    
    // Special handling for Brief section - don't navigate, just call onSelectSection
    if (section.title === 'Brief') {
      return (
        <div
          key={section.id}
          className={`block border-b border-black ${idx === 0 ? 'border-t border-black' : ''} cursor-pointer h-full flex-1`}
          onClick={() => onSelectSection(section)}
        >
          <div className={`flex justify-between items-stretch px-3 cursor-pointer h-full`}>
            <span className={`${isSubsection ? '' : 'font-crimson font-semibold text-[25px]'} flex-1`} style={{flexBasis: '80%', flexGrow: 0, flexShrink: 0}}>
              {section.title}
              {sectionPercentages[section.title] && (
                <span className="font-normal"> ({sectionPercentages[section.title]})</span>
              )}
            </span>
            <div className="flex items-center border-l border-black pl-3 justify-between" style={{flexBasis: '20%', flexGrow: 0, flexShrink: 0}}>
              <span className="text-xs font-gothic font-medium text-[20px] text-black">{section.status}</span>
              {isAdmin && DEFAULT_STEPS.includes(section.title) && !isSubsection && (
                <button
                  className="ml-4 text-black text-lg font-bold hover:bg-gray-200 rounded font-gothic font-medium text-[20px]"
                  onClick={e => { e.preventDefault(); e.stopPropagation(); handleRemoveStep(section.title); }}
                  aria-label="Remove"
                >
                  ×
                </button>
              )}
            </div>
          </div>
        </div>
      );
    }

    // Special handling for Q&A section - navigate to Q&A route
    if (section.title === 'Q & A') {
      return (
        <Link
          to={`/project/${projectId}/step/q-a`}
          key={section.id}
          className={`block border-b border-black ${idx === 0 ? 'border-t border-black' : ''} h-full flex-1`}
        >
          <div className={`flex justify-between items-stretch px-3 cursor-pointer h-full`}>
            <span className={`${isSubsection ? '' : 'font-crimson font-semibold text-[25px]'} flex-1`} style={{flexBasis: '80%', flexGrow: 0, flexShrink: 0}}>
              {section.title}
              {sectionPercentages[section.title] && (
                <span className="font-normal"> ({sectionPercentages[section.title]})</span>
              )}
            </span>
            <div className="flex items-center border-l border-black pl-3 justify-between" style={{flexBasis: '20%', flexGrow: 0, flexShrink: 0}}>
              <span className="text-xs font-gothic font-medium text-[20px] text-black">{section.status}</span>
              {isAdmin && DEFAULT_STEPS.includes(section.title) && !isSubsection && (
                <button
                  className="ml-4 text-black text-lg font-bold hover:bg-gray-200 rounded font-gothic font-medium text-[20px]"
                  onClick={e => { e.preventDefault(); e.stopPropagation(); handleRemoveStep(section.title); }}
                  aria-label="Remove"
                >
                  ×
                </button>
              )}
            </div>
          </div>
        </Link>
      );
    }
    
    // Regular sections with navigation
    return (
      <Link
        to={hasSubsections ? '#' : `/project/${projectId}/step/${sectionSlug}`}
        key={section.id}
        className={`block border-b border-black ${idx === 0 ? 'border-t border-black' : ''} h-full flex-1`}
        onClick={e => {
          if (hasSubsections) {
            e.preventDefault();
            setExpanded(exp => ({ ...exp, [section.id]: !exp[section.id] }));
          } else {
            onSelectSection(section);
          }
        }}
      >
        <div className={`flex justify-between items-stretch px-3 cursor-pointer h-full`}>
          <span className={`${isSubsection ? '' : 'font-crimson font-semibold text-[25px]'} flex-1`} style={{flexBasis: '80%', flexGrow: 0, flexShrink: 0}}>
            {section.title}
            {sectionPercentages[section.title] && (
              <span className="font-normal"> ({sectionPercentages[section.title]})</span>
            )}
          </span>
          <div className="flex items-center border-l border-black pl-3 justify-between" style={{flexBasis: '20%', flexGrow: 0, flexShrink: 0}}>
            <span className="text-xs font-gothic font-medium text-[20px] text-black">{section.status}</span>
            {isAdmin && DEFAULT_STEPS.includes(section.title) && !isSubsection && (
              <button
                className="ml-4 text-black text-lg font-bold hover:bg-gray-200 rounded font-gothic font-medium text-[20px]"
                onClick={e => { e.preventDefault(); e.stopPropagation(); handleRemoveStep(section.title); }}
                aria-label="Remove"
              >
                ×
              </button>
            )}
          </div>
        </div>
      </Link>
    );
  };

  return (
    <div className="h-full flex flex-col">
      {/* <button className="btn btn-primary btn-sm mb-4">+ Add Section</button> */}
      <div className="divide-y flex-1 flex flex-col">
        {rootSections.map((section, idx) => (
          <div key={section.id} className="flex-1 flex flex-col">
            {renderSection(section, false, idx)}
            {expanded[section.id] && getSubsections(section.id).length > 0 && (
              <div className="ml-6">
                {section.title === 'Concept & Direction' ? (
                  <div className="flex flex-col">
                    <div className="flex items-center justify-center mb-2 w-full h-16">
                      <button
                        className="px-4 py-2 text-2xl font-bold bg-transparent mx-2"
                        onClick={() => setConceptPage(p => Math.max(0, p - 1))}
                        disabled={conceptPage === 0}
                      >
                        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" style={{display: 'block'}}>
                          <path d="M15 18l-6-6 6-6" />
                        </svg>
                      </button>
                      <div className="flex gap-2 flex-1 items-center h-full justify-center">
                        {getSubsections(section.id)
                          .slice(conceptPage * ITEMS_PER_PAGE, (conceptPage + 1) * ITEMS_PER_PAGE)
                          .map(sub => renderSection(sub, true))}
                      </div>
                      <button
                        className="px-4 py-2 text-2xl font-bold bg-transparent mx-2"
                        onClick={() => setConceptPage(p => p + 1)}
                        disabled={(conceptPage + 1) * ITEMS_PER_PAGE >= getSubsections(section.id).length}
                      >
                        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" style={{display: 'block'}}>
                          <path d="M9 6l6 6-6 6" />
                        </svg>
                      </button>
                    </div>
                  </div>
                ) : (
                  getSubsections(section.id).map(sub => renderSection(sub, true))
                )}
              </div>
            )}
          </div>
        ))}
      </div>
      {isAdmin && removedDefaultSteps.length > 0 && (
        <div className="mt-4">
          <div className="font-semibold text-xs mb-1">Removed Steps:</div>
          {removedDefaultSteps.map(title => (
            <button
              key={title}
              className="btn btn-xs btn-outline mr-2 mb-2"
              onClick={() => handleReAddStep(title)}
            >
              + {title}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default SectionList; 