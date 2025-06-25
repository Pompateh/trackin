import React from "react";

// Function to convert section title to URL format (matching what's stored in database)
const sectionTitleToUrl = (title) => {
  return title.toLowerCase().replace(/ & /g, '-').replace(/ /g, '-');
};

// Minimal stateless versions of the content renderers from StepTemplate
const TextContent = ({ item }) => {
  const justifyMap = {
    top: 'justify-start',
    center: 'justify-center',
    bottom: 'justify-end',
  };
  const alignMap = {
    left: 'items-start',
    center: 'items-center',
    right: 'items-end',
  };
  let effectiveTextAlign = 'left';
  if (item.text_horizontal_align === 'right') effectiveTextAlign = 'right';
  return (
    <div className={`p-2 h-full w-full flex flex-col relative ${justifyMap[item.text_vertical_align] || 'justify-start'} ${alignMap[item.text_horizontal_align] || 'items-start'}`}
      style={{ minHeight: '100px' }}
    >
      <div style={{ textAlign: effectiveTextAlign, width: '100%' }}>
        {item.is_title_visible && item.title_text && (
          <div style={{ fontWeight: 'bold', fontSize: `${item.title_font_size || 24}px` }}>{item.title_text}</div>
        )}
        {item.is_subtitle_visible && item.subtitle_text && (
          <div style={{ fontSize: `${item.subtitle_font_size || 16}px`, color: '#666' }}>{item.subtitle_text}</div>
        )}
        {item.is_body_visible && item.body_text && (
          <div style={{ fontSize: `${item.body_font_size || 14}px`, marginTop: 4 }}>{item.body_text}</div>
        )}
      </div>
    </div>
  );
};

const ImageContent = ({ item }) => (
  <div style={{ width: '100%', height: '100%', background: '#eee', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
    {item.image_url ? (
      <img src={item.image_url} alt="Project asset" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
    ) : null}
  </div>
);

const TextAndImageContent = ({ item }) => (
  <div style={{ position: 'relative', width: '100%', height: '100%' }}>
    <ImageContent item={item} />
    <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.7), rgba(0,0,0,0.4), transparent)', pointerEvents: 'none' }}>
      <div style={{ padding: 16, height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', color: 'white' }}>
        {item.is_title_visible && item.title_text && (
          <div style={{ fontWeight: 'bold', fontSize: `${item.title_font_size || 24}px`, color: 'white' }}>{item.title_text}</div>
        )}
        {item.is_subtitle_visible && item.subtitle_text && (
          <div style={{ fontSize: `${item.subtitle_font_size || 16}px`, color: 'white' }}>{item.subtitle_text}</div>
        )}
        {item.is_body_visible && item.body_text && (
          <div style={{ fontSize: `${item.body_font_size || 14}px`, marginTop: 4, color: 'white' }}>{item.body_text}</div>
        )}
      </div>
    </div>
  </div>
);

const NUM_COLS = 4;

const PrintableProject = ({ project, sections, gridItems }) => {
  // Get all unique section titles from grid items (these are URL-encoded)
  const sectionTitles = [...new Set(gridItems?.map(item => item.section_id_text).filter(Boolean))];
  
  // Filter sections to only include those that have grid content (convert section titles to URL format for comparison)
  const sectionsWithContent = sections?.filter(section => 
    sectionTitles.includes(sectionTitleToUrl(section.title))
  ) || [];

  // Debug logging
  console.log('PrintableProject Debug:', {
    project,
    sectionsCount: sections?.length,
    gridItemsCount: gridItems?.length,
    sectionTitles,
    sectionsWithContentCount: sectionsWithContent.length,
    gridItemsSample: gridItems?.slice(0, 3)
  });

  return (
    <div style={{ width: '210mm', minHeight: '297mm', padding: '20mm', background: '#fff', color: '#222', fontFamily: 'sans-serif' }}>
      {/* Debug info */}
      <div style={{ color: 'green', fontSize: '10px', marginBottom: '10px' }}>
        Debug: Found {sectionTitles.length} sections with content: {sectionTitles.join(', ')}
      </div>
      
      {/* Project Title */}
      <h1 style={{ textAlign: 'center', marginBottom: '30mm', fontSize: '32px', fontWeight: 'bold' }}>
        {project?.name || 'Project Name'}
      </h1>
      
      {/* Render each section with its grid content */}
      {sectionsWithContent.map((section, sectionIndex) => {
        const sectionGridItems = gridItems?.filter(item => 
          item.section_id_text === sectionTitleToUrl(section.title) && !item.is_hidden
        ) || [];
        
        console.log(`Section "${section.title}":`, {
          sectionGridItemsCount: sectionGridItems.length,
          items: sectionGridItems
        });
        
        if (sectionGridItems.length === 0) return null;

        return (
          <div key={section.title} style={{ 
            marginBottom: '25mm', 
            pageBreakInside: 'avoid',
            pageBreakBefore: sectionIndex > 0 ? 'always' : 'auto'
          }}>
            {/* Section Title */}
            <h2 style={{ 
              borderBottom: '2px solid #333', 
              paddingBottom: '8px', 
              marginBottom: '15mm',
              fontSize: '24px',
              fontWeight: 'bold',
              color: '#333'
            }}>
              {section.title}
            </h2>
            
            {/* Section Grid */}
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: `repeat(${NUM_COLS}, 1fr)`, 
              gap: '8px 4px', 
              minHeight: '80mm' 
            }}>
              {sectionGridItems.map(item => (
                <div
                  key={item.grid_item_id}
                  style={{
                    gridColumn: `span ${item.col_span || 1}`,
                    gridRow: `span ${item.row_span || 1}`,
                    minHeight: '50mm',
                    border: '1px solid #ddd',
                    background: '#fafafa',
                    overflow: 'hidden',
                    position: 'relative',
                    display: item.is_hidden ? 'none' : 'block',
                  }}
                >
                  {item.template_type === 'text' && <TextContent item={item} />}
                  {item.template_type === 'image' && <ImageContent item={item} />}
                  {item.template_type === 'textAndImage' && <TextAndImageContent item={item} />}
                </div>
              ))}
            </div>
          </div>
        );
      })}
      
      {sectionsWithContent.length === 0 && (
        <div style={{ color: 'red', textAlign: 'center', marginTop: '50mm' }}>
          No sections with content found. Make sure you have created content in your step templates.
        </div>
      )}
    </div>
  );
};

export default PrintableProject; 