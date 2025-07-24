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

  // Helper function to get font family CSS
  const getFontFamily = (fontFamily) => {
    switch (fontFamily) {
      case 'crimson pro':
        return '"Crimson Pro", serif';
      case 'gothic a1':
      default:
        return '"Gothic A1", sans-serif';
    }
  };

  return (
    <div
      className={`h-full w-full flex flex-col relative ${justifyMap[item.text_vertical_align] || 'justify-start'} ${alignMap[item.text_horizontal_align] || 'items-start'}`}
      style={{
        minHeight: '120px',
        borderRadius: '0',
        background: 'transparent',
        boxSizing: 'border-box',
        padding: '16px',
      }}
    >
      <div style={{ textAlign: effectiveTextAlign, width: '100%' }}>
        {item.is_title_visible && item.title_text && (
          <div style={{ 
            fontWeight: 'bold', 
            fontSize: `${item.title_font_size || 24}px`, 
            marginBottom: '8px',
            fontFamily: getFontFamily(item.title_font_family)
          }}>
            {item.title_text}
          </div>
        )}
        {item.is_subtitle_visible && item.subtitle_text && (
          <div style={{ 
            fontSize: `${item.subtitle_font_size || 16}px`, 
            color: '#666', 
            marginBottom: '6px',
            fontFamily: getFontFamily(item.subtitle_font_family)
          }}>
            {item.subtitle_text}
          </div>
        )}
        {item.is_body_visible && item.body_text && (
          <div style={{ 
            fontSize: `${item.body_font_size || 14}px`, 
            lineHeight: '1.5',
            fontFamily: getFontFamily(item.body_font_family)
          }}>
            {item.body_text}
          </div>
        )}
      </div>
    </div>
  );
};

const ImageContent = ({ item }) => (
  <div style={{ width: '100%', height: '100%', background: '#f8f9fa', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '0', padding: 0, margin: 0, overflow: 'hidden', position: 'relative' }}>
    {item.image_url ? (
      <img 
        src={item.image_url} 
        alt="Project asset" 
        style={{ 
          width: '100%', 
          height: '100%', 
          objectFit: 'cover', // changed from contain to cover
          borderRadius: '0', 
          margin: 0, 
          padding: 0,
          imageRendering: 'high-quality',
          imageSmoothingEnabled: true,
          imageSmoothingQuality: 'high',
          filter: 'contrast(1.08) brightness(1.03) saturate(1.02)',
          // Remove transform and position absolute for PDF grid fit
          // transform: `translate(${item.image_position_x || 0}px, ${item.image_position_y || 0}px) scale(${item.image_scale || 1})`,
          backfaceVisibility: 'hidden',
          // position: 'absolute',
          // left: 0,
          // top: 0,
        }} 
        crossOrigin="anonymous"
        loading="eager"
        decoding="sync"
      />
    ) : (
      <div style={{ color: '#999', fontSize: '14px' }}>No Image</div>
    )}
  </div>
);

const TextAndImageContent = ({ item }) => {
  // Helper function to get font family CSS
  const getFontFamily = (fontFamily) => {
    switch (fontFamily) {
      case 'crimson pro':
        return '"Crimson Pro", serif';
      case 'gothic a1':
      default:
        return '"Gothic A1", sans-serif';
    }
  };

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%', borderRadius: '0', overflow: 'hidden' }}>
      <ImageContent item={item} />
      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.7), rgba(0,0,0,0.4), transparent)', pointerEvents: 'none' }}>
        <div style={{ padding: '20px', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', color: 'white' }}>
          {item.is_title_visible && item.title_text && (
            <div style={{ 
              fontWeight: 'bold', 
              fontSize: `${item.title_font_size || 24}px`, 
              color: 'white', 
              marginBottom: '8px',
              fontFamily: getFontFamily(item.title_font_family)
            }}>
              {item.title_text}
            </div>
          )}
          {item.is_subtitle_visible && item.subtitle_text && (
            <div style={{ 
              fontSize: `${item.subtitle_font_size || 16}px`, 
              color: 'white', 
              marginBottom: '6px',
              fontFamily: getFontFamily(item.subtitle_font_family)
            }}>
              {item.subtitle_text}
            </div>
          )}
          {item.is_body_visible && item.body_text && (
            <div style={{ 
              fontSize: `${item.body_font_size || 14}px`, 
              color: 'white', 
              lineHeight: '1.5',
              fontFamily: getFontFamily(item.body_font_family)
            }}>
              {item.body_text}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

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

// Function to split grid items into pages based on row count
const splitGridIntoPages = (gridItems, maxRowsPerPage = 3) => {
  if (!gridItems || gridItems.length === 0) return [];
  
  // Find the maximum row number
  const maxRow = Math.max(...gridItems.map(item => (item.row_num || item.row || 1) + (item.row_span || item.rowSpan || 1) - 1));
  
  const pages = [];
  let currentPage = [];
  let currentPageRows = 0;
  
  // Group items by their starting row
  const itemsByRow = {};
  gridItems.forEach(item => {
    const startRow = item.row_num || item.row || 1;
    if (!itemsByRow[startRow]) {
      itemsByRow[startRow] = [];
    }
    itemsByRow[startRow].push(item);
  });
  
  // Process rows in order
  for (let row = 1; row <= maxRow; row++) {
    const itemsInThisRow = itemsByRow[row] || [];
    
    // Check if adding this row would exceed the page limit
    if (currentPageRows + 1 > maxRowsPerPage && currentPage.length > 0) {
      // Start a new page
      pages.push(currentPage);
      currentPage = [];
      currentPageRows = 0;
    }
    
    // Add items from this row to current page
    currentPage.push(...itemsInThisRow);
    currentPageRows++;
  }
  
  // Add the last page if it has content
  if (currentPage.length > 0) {
    pages.push(currentPage);
  }
  
  return pages;
};

const PrintableProject = ({ project, sections, gridItems, pdfMode }) => {
  // Filter grid items to only include items from the current project
  const projectGridItems = gridItems?.filter(item => item.project_id === project?.id) || [];
  
  // Get all unique section titles from grid items (these are URL-encoded)
  const sectionTitles = [...new Set(projectGridItems.map(item => item.section_id_text).filter(Boolean))];

  // For PDF, include all sections; for screen, filter as before
  const sectionsToRender = pdfMode
    ? sections
    : (sections?.filter(section => sectionTitles.includes(sectionTitleToUrl(section.title))) || []);

  // Remove debug logging in PDF mode
  if (!pdfMode) {
    console.log('PrintableProject Debug:', {
      project,
      projectId: project?.id,
      sectionsCount: sections?.length,
      gridItemsCount: gridItems?.length,
      projectGridItemsCount: projectGridItems.length,
      sectionTitles,
      sectionsWithContentCount: sectionsToRender.length,
      gridItemsSample: projectGridItems.slice(0, 3)
    });
  }

  return (
    <div style={{
      width: pdfMode ? '420mm' : '100%',
      height: pdfMode ? '297mm' : 'auto',
      background: '#fff',
      color: '#222',
      fontFamily: 'Arial, sans-serif',
      overflow: 'hidden',
      position: pdfMode ? 'relative' : 'static'
    }}>
      {pdfMode && (
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Gothic+A1:wght@300;400;500;600;700&family=Crimson+Pro:ital,wght@0,400;0,600;1,400;1,600&display=swap');
          
          @page {
            size: 420mm 297mm;
            margin: 0;
            padding: 0;
          }
          
          .printable-step, .printable-step * {
            background: #fff !important;
            box-shadow: none !important;
            border: none !important;
            -webkit-print-color-adjust: exact !important;
            color-adjust: exact !important;
            image-rendering: high-quality !important;
            image-rendering: -webkit-optimize-contrast !important;
            image-rendering: crisp-edges !important;
            -webkit-font-smoothing: antialiased !important;
            -moz-osx-font-smoothing: grayscale !important;
            text-rendering: optimizeLegibility !important;
            transform: translateZ(0) !important;
            backface-visibility: hidden !important;
            perspective: 1000px !important;
            will-change: transform !important;
            page-break-inside: avoid !important;
            break-inside: avoid !important;
          }
          
          .printable-step {
            page-break-before: always !important;
            break-before: page !important;
            height: 297mm !important;
            width: 420mm !important;
            overflow: hidden !important;
          }
          
          .printable-step:first-child {
            page-break-before: auto !important;
            break-before: auto !important;
          }
          
          .printable-step img {
            image-rendering: high-quality !important;
            image-rendering: -webkit-optimize-contrast !important;
            image-rendering: crisp-edges !important;
            image-smoothing-enabled: true !important;
            image-smoothing-quality: high !important;
            transform: translateZ(0) !important;
            backface-visibility: hidden !important;
            will-change: transform !important;
          }
          .printable-step canvas {
            image-rendering: high-quality !important;
            image-rendering: -webkit-optimize-contrast !important;
            image-rendering: crisp-edges !important;
          }
        `}</style>
      )}
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
        {sectionsToRender.map((section, sectionIndex) => {
          // Group grid items by page_num for this section
          const sectionGridItems = projectGridItems.filter(item => 
            item.section_id_text === sectionTitleToUrl(section.title) && !item.is_hidden
          ) || [];
          if (sectionGridItems.length === 0) return null;

          if (pdfMode) {
            // --- PDF MODE: Split into pages of 2 rows each ---
            const pages = splitGridIntoPages(sectionGridItems, 2); // 2 rows per page
            return pages.map((pageItems, pageIndex) => {
              // Normalize row numbers so first row on each page is 1
              const uniqueRows = Array.from(new Set(pageItems.map(item => item.row_num || item.row || 1))).sort((a, b) => a - b);
              const rowMap = {};
              uniqueRows.forEach((rowValue, idx) => { rowMap[rowValue] = idx + 1; });
              const normalizedPageItems = pageItems.map(item => ({
                ...item,
                row_num: rowMap[item.row_num || item.row || 1],
                row: rowMap[item.row_num || item.row || 1],
              }));
              const { rows, grid, items } = calculateGridStructure(normalizedPageItems);
              return (
                <div
                  key={`${section.title}-pdfpage-${pageIndex}`}
                  className="printable-step"
                  style={{
                    marginBottom: '0',
                    pageBreakInside: 'avoid',
                    pageBreakBefore: (sectionIndex > 0 || pageIndex > 0) ? 'always' : 'auto',
                    background: '#fff',
                    boxSizing: 'border-box',
                    padding: '0',
                    display: 'flex',
                    flexDirection: 'column',
                    position: 'relative',
                    overflow: 'hidden',
                    minHeight: '210mm',
                    maxHeight: '210mm',
                    height: '210mm', // Ensure full page height
                  }}
                >
                  {/* Section Grid - Now using calculated structure */}
                  <div style={{ 
                    display: 'grid', 
                    gridTemplateColumns: `repeat(${NUM_COLS}, 1fr)`,
                    gridTemplateRows: `repeat(${rows}, minmax(0, 1fr))`, // Each row fills available space
                    gap: '20px 15px', 
                    alignItems: 'start',
                    height: '150mm', // Grid fills most of the page
                    flex: 1,
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
                            minHeight: '40mm',
                            background: item.template_type === 'text' ? 'transparent' : '#f8f9fa',
                            borderRadius: '0',
                            overflow: 'hidden',
                            position: 'relative',
                            padding: item.template_type === 'text' ? '0' : '0px',
                            boxShadow: 'none',
                            height: '100%',
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
            });
          } else {
            // --- SCREEN MODE: Original logic ---
            // Group by page_num (default 0)
            const itemsByPage = {};
            sectionGridItems.forEach(item => {
              const pageNum = item.page_num || 0;
              if (!itemsByPage[pageNum]) itemsByPage[pageNum] = [];
              itemsByPage[pageNum].push(item);
            });
            const pageNums = Object.keys(itemsByPage).map(n => parseInt(n, 10)).sort((a, b) => a - b);

            return pageNums.map((pageNum, pageIndex) => {
              const pageItems = itemsByPage[pageNum];
              const { rows, grid, items } = calculateGridStructure(pageItems);
              return (
                <div
                  key={`${section.title}-page-${pageNum}`}
                  className={pdfMode ? 'printable-step' : ''}
                  style={pdfMode ? {
                    marginBottom: '0',
                    pageBreakInside: 'avoid',
                    pageBreakBefore: (sectionIndex > 0 || pageIndex > 0) ? 'always' : 'auto',
                    background: '#fff',
                    boxSizing: 'border-box',
                    padding: '0',
                    display: 'flex',
                    flexDirection: 'column',
                    position: 'relative',
                    overflow: 'hidden',
                    minHeight: '210mm',
                    maxHeight: '210mm',
                  } : {
                    marginBottom: '40px',
                    pageBreakInside: 'avoid',
                    pageBreakBefore: (sectionIndex > 0 || pageIndex > 0) ? 'always' : 'auto'
                  }}
                >
                  {/* Section Grid - Now using calculated structure */}
                  <div style={{ 
                    display: 'grid', 
                    gridTemplateColumns: `repeat(${NUM_COLS}, 1fr)`,
                    gridTemplateRows: pdfMode ? `repeat(${Math.min(rows, 3)}, 1fr)` : `repeat(${rows}, minmax(120px, auto))`,
                    gap: '20px 15px', 
                    minHeight: pdfMode ? '150mm' : '120px',
                    height: pdfMode ? '150mm' : undefined, // Fixed height for PDF pages
                    flex: pdfMode ? 1 : undefined,
                    marginTop: pageIndex === 0 ? undefined : 0,
                    paddingTop: pageIndex === 0 ? undefined : 0,
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
                            minHeight: pdfMode ? '40mm' : '120px',
                            background: item.template_type === 'text' ? 'transparent' : '#f8f9fa',
                            borderRadius: '0',
                            overflow: 'hidden',
                            position: 'relative',
                            padding: item.template_type === 'text' ? '0' : '0px',
                            boxShadow: 'none',
                            height: '100%',
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
            });
          }
        })}
        
        {sectionsToRender.length === 0 && (
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