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
    <div className={`h-full w-full flex flex-col relative ${justifyMap[item.text_vertical_align] || 'justify-start'} ${alignMap[item.text_horizontal_align] || 'items-start'}`}
      style={{ minHeight: '120px' }}
    >
      <div style={{ textAlign: effectiveTextAlign, width: '100%' }}>
        {item.is_title_visible && item.title_text && (
          <div style={{ fontWeight: 'bold', fontSize: `${item.title_font_size || 24}px`, marginBottom: '8px' }}>{item.title_text}</div>
        )}
        {item.is_subtitle_visible && item.subtitle_text && (
          <div style={{ fontSize: `${item.subtitle_font_size || 16}px`, color: '#666', marginBottom: '6px' }}>{item.subtitle_text}</div>
        )}
        {item.is_body_visible && item.body_text && (
          <div style={{ fontSize: `${item.body_font_size || 14}px`, lineHeight: '1.5' }}>{item.body_text}</div>
        )}
      </div>
    </div>
  );
};

const ImageContent = ({ item }) => (
  <div style={{ width: '100%', height: '100%', background: '#f8f9fa', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '0' }}>
    {item.image_url ? (
      <img src={item.image_url} alt="Project asset" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '0' }} />
    ) : (
      <div style={{ color: '#999', fontSize: '14px' }}>No Image</div>
    )}
  </div>
);

const TextAndImageContent = ({ item }) => (
  <div style={{ position: 'relative', width: '100%', height: '100%', borderRadius: '0', overflow: 'hidden' }}>
    <ImageContent item={item} />
    <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.7), rgba(0,0,0,0.4), transparent)', pointerEvents: 'none' }}>
      <div style={{ padding: '20px', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', color: 'white' }}>
        {item.is_title_visible && item.title_text && (
          <div style={{ fontWeight: 'bold', fontSize: `${item.title_font_size || 24}px`, color: 'white', marginBottom: '8px' }}>{item.title_text}</div>
        )}
        {item.is_subtitle_visible && item.subtitle_text && (
          <div style={{ fontSize: `${item.subtitle_font_size || 16}px`, color: 'white', marginBottom: '6px' }}>{item.subtitle_text}</div>
        )}
        {item.is_body_visible && item.body_text && (
          <div style={{ fontSize: `${item.body_font_size || 14}px`, color: 'white', lineHeight: '1.5' }}>{item.body_text}</div>
        )}
      </div>
    </div>
  </div>
);

const NUM_COLS = 4;

// Function to calculate the actual grid structure based on grid items
const calculateGridStructure = (gridItems) => {
  if (!gridItems || gridItems.length === 0) return { rows: 0, items: [] };
  
  // Find the maximum row number to determine total rows
  const maxRow = Math.max(...gridItems.map(item => (item.row_num || item.row || 1) + (item.row_span || item.rowSpan || 1) - 1));
  
  // Create a 2D grid structure
  const grid = Array.from({ length: maxRow }, () => Array(NUM_COLS).fill(null));
  
  // Place items in the grid
  const visibleItems = gridItems.filter(item => !item.is_hidden && !item.hidden);
  
  visibleItems.forEach(item => {
    const row = (item.row_num || item.row || 1) - 1; // Convert to 0-based index
    const col = (item.col_num || item.col || 1) - 1; // Convert to 0-based index
    const rowSpan = item.row_span || item.rowSpan || 1;
    const colSpan = item.col_span || item.colSpan || 1;
    
    // Mark the cells this item occupies
    for (let r = row; r < row + rowSpan; r++) {
      for (let c = col; c < col + colSpan; c++) {
        if (r < grid.length && c < NUM_COLS) {
          grid[r][c] = item.grid_item_id;
        }
      }
    }
  });
  
  return { rows: maxRow, grid, items: visibleItems };
};

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
    <div style={{ 
      width: '100%', 
      background: '#fff', 
      color: '#222', 
      fontFamily: 'Arial, sans-serif',
      overflow: 'hidden'
    }}>
      {/* Project Title */}
      <div style={{ 
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white',
        padding: '40px 30px',
        textAlign: 'center',
        marginBottom: '0'
      }}>
        <h1 style={{ 
          fontSize: '36px', 
          fontWeight: 'bold',
          margin: '0',
          textShadow: '0 2px 4px rgba(0,0,0,0.3)'
        }}>
          {project?.name || 'Project Name'}
        </h1>
        {project?.description && (
          <p style={{ 
            fontSize: '18px', 
            marginTop: '10px',
            opacity: '0.9',
            fontWeight: '300'
          }}>
            {project.description}
          </p>
        )}
      </div>
      
      {/* Content Area */}
      <div style={{ padding: '30px' }}>
        {/* Render each section with its grid content */}
        {sectionsWithContent.map((section, sectionIndex) => {
          const sectionGridItems = gridItems?.filter(item => 
            item.section_id_text === sectionTitleToUrl(section.title) && !item.is_hidden
          ) || [];
          
          // Calculate grid structure for this section
          const { rows, grid, items } = calculateGridStructure(sectionGridItems);
          
          console.log(`Section "${section.title}":`, {
            sectionGridItemsCount: sectionGridItems.length,
            calculatedRows: rows,
            items: sectionGridItems
          });
          
          if (sectionGridItems.length === 0) return null;

          return (
            <div key={section.title} style={{ 
              marginBottom: '40px', 
              pageBreakInside: 'avoid',
              pageBreakBefore: sectionIndex > 0 ? 'always' : 'auto'
            }}>
              {/* Section Title */}
              <h2 style={{ 
                borderBottom: '3px solid #667eea', 
                paddingBottom: '12px', 
                marginBottom: '25px',
                fontSize: '28px',
                fontWeight: 'bold',
                color: '#333',
                position: 'relative'
              }}>
                {section.title}
              </h2>
              
              {/* Section Grid - Now using calculated structure */}
              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: `repeat(${NUM_COLS}, 1fr)`,
                gridTemplateRows: `repeat(${rows}, minmax(120px, auto))`,
                gap: '20px 15px', 
                minHeight: '120px' 
              }}>
                {items.map(item => {
                  const row = (item.row_num || item.row || 1) - 1; // Convert to 0-based index
                  const col = (item.col_num || item.col || 1) - 1; // Convert to 0-based index
                  const rowSpan = item.row_span || item.rowSpan || 1;
                  const colSpan = item.col_span || item.colSpan || 1;
                  
                  return (
                    <div
                      key={item.grid_item_id}
                      style={{
                        gridColumn: `${col + 1} / span ${colSpan}`,
                        gridRow: `${row + 1} / span ${rowSpan}`,
                        minHeight: '120px',
                        background: item.template_type === 'text' ? 'transparent' : '#f8f9fa',
                        borderRadius: '0',
                        overflow: 'hidden',
                        position: 'relative',
                        padding: item.template_type === 'text' ? '0' : '10px',
                        boxShadow: 'none',
                      }}
                    >
                      {item.template_type === 'text' && <TextContent item={item} />}
                      {item.template_type === 'image' && <ImageContent item={item} />}
                      {item.template_type === 'textAndImage' && <TextAndImageContent item={item} />}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
        
        {sectionsWithContent.length === 0 && (
          <div style={{ 
            color: '#666', 
            textAlign: 'center', 
            marginTop: '60px',
            fontSize: '18px',
            fontStyle: 'italic'
          }}>
            No sections with content found. Make sure you have created content in your step templates.
          </div>
        )}
      </div>
      
      {/* Footer */}
      <div style={{ 
        background: '#f8f9fa',
        padding: '20px 30px',
        borderTop: '1px solid #e9ecef',
        textAlign: 'center',
        color: '#666',
        fontSize: '14px'
      }}>
        <p style={{ margin: '0' }}>
          Generated on {new Date().toLocaleDateString()} at {new Date().toLocaleTimeString()}
        </p>
      </div>
    </div>
  );
};

export default PrintableProject; 