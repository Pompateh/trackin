import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
// import { supabase } from '../../lib/supabaseClient';

const DEFAULT_STEPS = [
  'Brief',
  'Q & A',
  'Debrief',
  'Quotation',
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

  const renderSection = (section, isSubsection = false) => (
    <Link
      to={`/project/${projectId}/step/${section.title.toLowerCase().replace(/ & /g, '-').replace(/ /g, '-')}`}
      key={section.id}
      className={`block ${selectedSection?.id === section.id ? (isSubsection ? 'bg-blue-50' : 'bg-blue-100') : ''}`}
      onClick={() => onSelectSection(section)}
    >
      <div className={`flex justify-between items-center py-${isSubsection ? '1' : '2'} cursor-pointer`}>
        <span className={isSubsection ? '' : 'font-semibold'}>{section.title}</span>
        <div className="flex items-center">
          <span className="text-xs text-gray-500">{section.status}</span>
          {getSubsections(section.id).length > 0 && !isSubsection && (
            <button className="ml-2" onClick={e => { e.preventDefault(); e.stopPropagation(); handleExpand(section.id); }}>
              {expanded[section.id] ? '▼' : '▶'}
            </button>
          )}
          {isAdmin && DEFAULT_STEPS.includes(section.title) && !isSubsection && (
            <button
              className="ml-2 text-xs text-red-500 hover:underline"
              onClick={e => { e.preventDefault(); e.stopPropagation(); handleRemoveStep(section.title); }}
            >
              Remove
            </button>
          )}
        </div>
      </div>
    </Link>
  );

  return (
    <div>
      <button className="btn btn-primary btn-sm mb-4">+ Add Section</button>
      <div className="divide-y">
        {rootSections.map(section => (
          <div key={section.id}>
            {renderSection(section)}
            {expanded[section.id] && getSubsections(section.id).length > 0 && (
              <div className="ml-6">
                {getSubsections(section.id).map(sub => renderSection(sub, true))}
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