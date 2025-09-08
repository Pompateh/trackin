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
        padding: '8px',
        height: '100%',
        width: '100%',
        flex: 1,
      }}
    >
      <div style={{ textAlign: effectiveTextAlign, width: '100%' }}>
        {item.is_title_visible && item.title_text && (
          <div style={{ 
            fontWeight: item.title_bold ? 'bold' : 'normal', 
            fontStyle: item.title_italic ? 'italic' : 'normal',
            textDecoration: item.title_underline ? 'underline' : 'none',
            fontSize: `${item.title_font_size || 24}px`, 
            marginBottom: '8px',
            fontFamily: getFontFamily(item.title_font_family),
            lineHeight: '1.2',
            color: '#222'
          }}>
            {item.title_text}
          </div>
        )}
        {item.is_subtitle_visible && item.subtitle_text && (
          <div style={{ 
            fontWeight: item.subtitle_bold ? 'bold' : 'normal', 
            fontStyle: item.subtitle_italic ? 'italic' : 'normal',
            textDecoration: item.subtitle_underline ? 'underline' : 'none',
            fontSize: `${item.subtitle_font_size || 16}px`, 
            color: '#666', 
            marginBottom: '6px',
            fontFamily: getFontFamily(item.subtitle_font_family),
            lineHeight: '1.3'
          }}>
            {item.subtitle_text}
          </div>
        )}
        {item.is_body_visible && item.body_text && (
          <div style={{ 
            fontWeight: item.body_bold ? 'bold' : 'normal', 
            fontStyle: item.body_italic ? 'italic' : 'normal',
            textDecoration: item.body_underline ? 'underline' : 'none',
            fontSize: `${item.body_font_size || 14}px`, 
            lineHeight: '1.5',
            fontFamily: getFontFamily(item.body_font_family),
            color: '#333'
          }}>
            {item.body_text}
          </div>
        )}
      </div>
    </div>
  );
};

const ImageContent = ({ item }) => {
  // Debug image positioning values
  console.log('ImageContent debug:', {
    grid_item_id: item.grid_item_id,
    image_position_x: item.image_position_x,
    image_position_y: item.image_position_y,
    image_scale: item.image_scale,
    image_url: item.image_url
  });
  
  return (
  <div style={{ 
    width: '100%', 
    height: '100%', 
    background: '#f8f9fa', 
    display: 'flex', 
    alignItems: 'center', 
    justifyContent: 'center', 
    borderRadius: '0', 
    padding: 0, 
    margin: 0, 
    overflow: 'hidden', 
    position: 'relative' 
  }}>
    {item.image_url ? (
      <img 
        src={item.image_url} 
        alt="Project asset" 
        style={{ 
          position: 'absolute',
          left: 0,
          top: 0,
          transform: `translate(${item.image_position_x || 0}px, ${item.image_position_y || 0}px) scale(${item.image_scale || 1})`,
          transformOrigin: 'top left',
          maxWidth: 'none',
          maxHeight: 'none',
          imageRendering: 'high-quality',
          imageSmoothingEnabled: true,
          imageSmoothingQuality: 'high',
          filter: 'contrast(1.08) brightness(1.03) saturate(1.02)',
          backfaceVisibility: 'hidden',
          width: 'auto',
          height: 'auto',
          // Ensure transforms are applied in PDF with vendor prefixes
          WebkitTransform: `translate(${item.image_position_x || 0}px, ${item.image_position_y || 0}px) scale(${item.image_scale || 1})`,
          msTransform: `translate(${item.image_position_x || 0}px, ${item.image_position_y || 0}px) scale(${item.image_scale || 1})`,
          // Force transform to be applied
          transformStyle: 'preserve-3d',
        }} 
        crossOrigin="anonymous"
        loading="eager"
        decoding="sync"
      />
    ) : (
      <div style={{ 
        color: '#999', 
        fontSize: '14px',
        textAlign: 'center',
        padding: '20px'
      }}>
        No Image
      </div>
    )}
  </div>
  );
};

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
              fontWeight: item.title_bold ? 'bold' : 'normal', 
              fontStyle: item.title_italic ? 'italic' : 'normal',
              textDecoration: item.title_underline ? 'underline' : 'none',
              fontSize: `${item.title_font_size || 24}px`, 
              color: 'white', 
              marginBottom: '8px',
              fontFamily: getFontFamily(item.title_font_family),
              lineHeight: '1.2',
              textShadow: '0 1px 2px rgba(0,0,0,0.5)'
            }}>
              {item.title_text}
            </div>
          )}
          {item.is_subtitle_visible && item.subtitle_text && (
            <div style={{ 
              fontWeight: item.subtitle_bold ? 'bold' : 'normal', 
              fontStyle: item.subtitle_italic ? 'italic' : 'normal',
              textDecoration: item.subtitle_underline ? 'underline' : 'none',
              fontSize: `${item.subtitle_font_size || 16}px`, 
              color: 'white', 
              marginBottom: '6px',
              fontFamily: getFontFamily(item.subtitle_font_family),
              lineHeight: '1.3',
              textShadow: '0 1px 2px rgba(0,0,0,0.5)'
            }}>
              {item.subtitle_text}
            </div>
          )}
          {item.is_body_visible && item.body_text && (
            <div style={{ 
              fontWeight: item.body_bold ? 'bold' : 'normal', 
              fontStyle: item.body_italic ? 'italic' : 'normal',
              textDecoration: item.body_underline ? 'underline' : 'none',
              fontSize: `${item.body_font_size || 14}px`, 
              color: 'white', 
              lineHeight: '1.5',
              fontFamily: getFontFamily(item.body_font_family),
              textShadow: '0 1px 2px rgba(0,0,0,0.5)'
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

const PrintableProject = ({ project, sections, gridItems, pdfMode, previewMode = 'all', selectedSteps = [], selectedConceptSubsections = [] }) => {
  // Filter grid items to only include items from the current project
  const projectGridItems = gridItems?.filter(item => item.project_id === project?.id) || [];
  
  // Get all unique section titles from grid items (these are URL-encoded)
  const sectionTitles = [...new Set(projectGridItems.map(item => item.section_id_text).filter(Boolean))];

  // Filter sections based on preview mode
  let sectionsToRender = [];
  
  if (previewMode === 'all') {
    // Show all sections with content (original behavior)
    sectionsToRender = pdfMode
      ? (sections?.filter(section => {
          const sectionUrl = sectionTitleToUrl(section.title);
          const hasContent = projectGridItems.some(item => 
            item.section_id_text === sectionUrl && !item.is_hidden
          );
          return hasContent;
        }) || [])
      : (sections?.filter(section => sectionTitles.includes(sectionTitleToUrl(section.title))) || []);
  } else if (previewMode === 'individual') {
    // Show only selected individual steps
    sectionsToRender = sections?.filter(section => {
      const sectionId = section.id;
      return selectedSteps.includes(sectionId);
    }) || [];
  } else if (previewMode === 'concept') {
    // Show Concept & Direction main section + selected subsections
    const conceptSection = sections?.find(section => section.title === 'Concept & Direction');
    if (conceptSection) {
      sectionsToRender = [conceptSection];
      
      // Add selected subsections
      if (selectedConceptSubsections.length > 0) {
        const subsectionSections = sections?.filter(section => 
          selectedConceptSubsections.includes(section.title)
        ) || [];
        sectionsToRender = [...sectionsToRender, ...subsectionSections];
      }
    }
  }

  // Add debugging information
  console.log('PrintableProject Debug:', {
    project,
    projectId: project?.id,
    sectionsCount: sections?.length,
    gridItemsCount: gridItems?.length,
    projectGridItemsCount: projectGridItems.length,
    sectionTitles,
    sectionsWithContentCount: sectionsToRender.length,
    gridItemsSample: projectGridItems.slice(0, 3),
    pdfMode,
    previewMode,
    selectedSteps,
    selectedConceptSubsections,
    sectionsToRender: sectionsToRender.map(s => s.title)
  });

  return (
    <div style={{
      width: pdfMode ? '420mm' : '100%',
      height: pdfMode ? '297mm' : 'auto',
      background: '#fff',
      color: '#222',
      fontFamily: 'Arial, sans-serif',
      overflow: 'visible',
      position: pdfMode ? 'relative' : 'static',
      margin: pdfMode ? '0' : '0',
      boxShadow: pdfMode ? 'none' : 'none',
      border: pdfMode ? 'none' : 'none',
      minHeight: pdfMode ? 'auto' : '100vh'
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
        padding: pdfMode ? '20px 15px' : '40px 30px',
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
      <div style={{ padding: pdfMode ? '8px' : '15px' }}>
        
        {/* Render each section with its grid content */}
        {sectionsToRender.map((section, sectionIndex) => {
          // Group grid items by page_num for this section
          const sectionGridItems = projectGridItems.filter(item => 
            item.section_id_text === sectionTitleToUrl(section.title) && !item.is_hidden
          ) || [];
          
          console.log(`Section "${section.title}" has ${sectionGridItems.length} grid items`);
          
          if (sectionGridItems.length === 0) return null;

          if (pdfMode) {
            // --- PDF MODE: Split into pages of 2 rows each ---
            const pages = splitGridIntoPages(sectionGridItems, 2); // 2 rows per page
            console.log(`PDF mode: Section "${section.title}" split into ${pages.length} pages`);
            
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
              
              console.log(`PDF page ${pageIndex}: ${items.length} items, ${rows} rows`);
              
              return (
                <div
                  key={`${section.title}-pdfpage-${pageIndex}`}
                  className="printable-step"
                  data-step-title={section.title}
                  data-section-id-text={sectionTitleToUrl(section.title)}
                  data-page-index={pageIndex}
                  style={{
                    marginBottom: '0',
                    pageBreakInside: 'avoid',
                    pageBreakBefore: (sectionIndex > 0 || pageIndex > 0) ? 'always' : 'auto',
                    background: '#fff',
                    boxSizing: 'border-box',
                    padding: '10px',
                    display: 'flex',
                    flexDirection: 'column',
                    position: 'relative',
                    overflow: 'hidden',
                    // Use exact same height calculation as StepTemplate
                    height: 'auto',
                    width: '100%',
                  }}
                >
                  {/* Section Grid - Now using EXACT same styling as StepTemplate */}
                  <div style={{ 
                    display: 'grid', 
                    gridTemplateColumns: `repeat(${NUM_COLS}, 1fr)`,
                    gridTemplateRows: `repeat(${rows}, 1fr)`, // Use 1fr to fill available space
                    gap: '10px 5px', // Match StepTemplate gap exactly
                    alignItems: 'stretch', // Stretch items to fill space
                    justifyContent: 'stretch', // Stretch grid to fill container
                    // Use EXACT same aspect ratio and sizing as StepTemplate
                    aspectRatio: '420/297', // Exact same A3 landscape ratio
                    width: '100%',
                    height: 'auto', // Use auto height like StepTemplate
                    maxWidth: '100%',
                    maxHeight: 'none',
                    margin: '0',
                    background: '#fff',
                    boxSizing: 'border-box',
                    flex: 1,
                    // Ensure grid fills the available space exactly like StepTemplate
                    minHeight: '0',
                    overflow: 'hidden',
                    // Add grid alignment debug overlay for PDF mode
                    position: 'relative',
                  }}>
                    {/* Grid alignment debug overlay - now transparent */}
                    {pdfMode && (
                      <div style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        pointerEvents: 'none',
                        zIndex: 1,
                        background: 'transparent',
                        border: 'none',
                      }}>
                        {/* Grid lines overlay - now transparent */}
                        {Array.from({ length: NUM_COLS + 1 }, (_, i) => (
                          <div key={`col-${i}`} style={{
                            position: 'absolute',
                            left: `${(i / NUM_COLS) * 100}%`,
                            top: 0,
                            bottom: 0,
                            width: '1px',
                            background: 'transparent',
                          }} />
                        ))}
                        {Array.from({ length: rows + 1 }, (_, i) => (
                          <div key={`row-${i}`} style={{
                            position: 'absolute',
                            top: `${(i / rows) * 100}%`,
                            left: 0,
                            right: 0,
                            height: '1px',
                            background: 'transparent',
                          }} />
                        ))}
                      </div>
                    )}
                    {items.map(item => {
                      const row = (item.row_num || item.row || 1) - 1; // Convert to 0-based index
                      const col = (item.col_num || item.col || 1) - 1; // Convert to 0-based index
                      const rowSpan = item.row_span || item.rowSpan || 1;
                      const colSpan = item.col_span || item.colSpan || 1;
                      
                      // Debug grid item properties
                      if (item.template_type === 'image') {
                        console.log('Grid item debug:', {
                          grid_item_id: item.grid_item_id,
                          template_type: item.template_type,
                          image_position_x: item.image_position_x,
                          image_position_y: item.image_position_y,
                          image_scale: item.image_scale,
                          row, col, rowSpan, colSpan
                        });
                      }
                      return (
                        <div
                          key={item.grid_item_id}
                          style={{
                            gridColumn: `${col + 1} / span ${colSpan}`,
                            gridRow: `${row + 1} / span ${rowSpan}`,
                            // Use exact same styling as StepTemplate GridItem
                            minHeight: '120px',
                            background: item.template_type === 'text' ? 'transparent' : '#f8f9fa',
                            borderRadius: '0',
                            overflow: 'hidden',
                            position: 'relative',
                            padding: item.template_type === 'text' ? '0' : '0px',
                            boxShadow: 'none',
                            height: '100%',
                            width: '100%',
                            display: 'flex',
                            flexDirection: 'column',
                            // Ensure grid items stretch to fill their allocated space
                            alignItems: 'stretch',
                            justifyContent: 'stretch',
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
            // --- SCREEN MODE: Use exact same grid structure as StepTemplate ---
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
                  data-step-title={section.title}
                  data-section-id-text={sectionTitleToUrl(section.title)}
                  data-page-index={pageIndex}
                  style={{
                    marginBottom: '20px',
                    pageBreakInside: 'avoid',
                    pageBreakBefore: (sectionIndex > 0 || pageIndex > 0) ? 'always' : 'auto',
                    background: '#fff',
                    boxSizing: 'border-box',
                    padding: '10px',
                    display: 'flex',
                    flexDirection: 'column',
                    position: 'relative',
                    overflow: 'visible',
                    height: 'auto',
                    width: '100%',
                  }}
                >
                  {/* Section Grid - Now using EXACT same styling as StepTemplate */}
                  <div style={{ 
                    display: 'grid', 
                    gridTemplateColumns: `repeat(${NUM_COLS}, 1fr)`,
                    gridTemplateRows: `repeat(${rows}, 1fr)`, // Use same styling for both modes
                    gap: '10px 5px', // Match StepTemplate gap exactly
                    alignItems: 'stretch', // Stretch items to fill space
                    justifyContent: 'stretch', // Stretch grid to fill container
                    // Use EXACT same aspect ratio and sizing as StepTemplate
                    aspectRatio: '420/297',
                    width: '100%',
                    height: 'auto', // Use auto height for consistent sizing
                    maxWidth: '100%',
                    maxHeight: 'none',
                    margin: '0',
                    background: '#fff',
                    boxSizing: 'border-box',
                    flex: pdfMode ? 1 : 'none',
                    // Ensure grid fills the available space exactly like StepTemplate
                    minHeight: '0',
                    overflow: 'auto',
                    // Add grid alignment debug overlay for screen mode
                    position: 'relative',
                  }}>
                    {/* Grid alignment debug overlay - visible in screen mode for alignment verification */}
                    {!pdfMode && (
                      <div style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        pointerEvents: 'none',
                        zIndex: 1,
                        background: 'rgba(0, 255, 0, 0.05)',
                        border: '1px solid rgba(0, 255, 0, 0.2)',
                      }}>
                        {/* Grid lines overlay */}
                        {Array.from({ length: NUM_COLS + 1 }, (_, i) => (
                          <div key={`col-${i}`} style={{
                            position: 'absolute',
                            left: `${(i / NUM_COLS) * 100}%`,
                            top: 0,
                            bottom: 0,
                            width: '1px',
                            background: 'rgba(0, 255, 0, 0.15)',
                          }} />
                        ))}
                        {Array.from({ length: rows + 1 }, (_, i) => (
                          <div key={`row-${i}`} style={{
                            position: 'absolute',
                            top: `${(i / rows) * 100}%`,
                            left: 0,
                            right: 0,
                            height: '1px',
                            background: 'rgba(0, 255, 0, 0.15)',
                          }} />
                        ))}
                      </div>
                    )}
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
                            // Use exact same styling as StepTemplate GridItem
                            minHeight: '120px',
                            background: item.template_type === 'text' ? 'transparent' : '#f8f9fa',
                            borderRadius: '0',
                            overflow: 'hidden',
                            position: 'relative',
                            padding: item.template_type === 'text' ? '0' : '0px',
                            boxShadow: 'none',
                            height: '100%',
                            width: '100%',
                            display: 'flex',
                            flexDirection: 'column',
                            // Ensure grid items stretch to fill their allocated space
                            alignItems: 'stretch',
                            justifyContent: 'stretch',
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
        padding: pdfMode ? '10px 15px' : '20px 30px',
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