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
            
            {/* Section Grid - Now using calculated structure */}
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: `repeat(${NUM_COLS}, 1fr)`,
              gridTemplateRows: `repeat(${rows}, minmax(50mm, auto))`,
              gap: '8px 4px', 
              minHeight: '80mm' 
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
                      minHeight: '50mm',
                      border: '1px solid #ddd',
                      background: '#fafafa',
                      overflow: 'hidden',
                      position: 'relative',
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
        <div style={{ color: 'red', textAlign: 'center', marginTop: '50mm' }}>
          No sections with content found. Make sure you have created content in your step templates.
        </div>
      )}
    </div>
  );
};

export default PrintableProject; 